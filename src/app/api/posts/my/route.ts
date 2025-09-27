import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Post from '@/lib/models/Post';
import User from '@/lib/models/User';
import Category from '@/lib/models/Category';
import { getUserFromRequest } from '@/lib/auth';

// GET /api/posts/my - Kullanıcının yazılarını getir
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Giriş yapmalısınız' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const posts = await Post.find({ 
      'author._id': user._id.toString() 
    })
    .sort({ createdAt: -1 })
    .lean();

    return NextResponse.json({
      success: true,
      data: { posts }
    });

  } catch (error) {
    console.error('Get user posts error:', error);
    return NextResponse.json(
      { success: false, error: 'Yazılar getirilemedi' },
      { status: 500 }
    );
  }
}

// POST /api/posts/my - Yeni yazı oluştur
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Giriş yapmalısınız' },
        { status: 401 }
      );
    }

    await connectToDatabase();
    
    const body = await request.json();
    const { title, content, excerpt, categoryId, tags, featuredImage, status } = body;

    // Validation
    if (!title || !content || !excerpt || !categoryId) {
      return NextResponse.json(
        { success: false, error: 'Başlık, içerik, özet ve kategori gerekli' },
        { status: 400 }
      );
    }

    // Kategoriyi kontrol et
    const category = await Category.findById(categoryId);
    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz kategori' },
        { status: 400 }
      );
    }

    // Slug oluştur
    const slugify = (await import('slugify')).default;
    const baseSlug = slugify(title, { 
      lower: true, 
      locale: 'tr',
      remove: /[*+~.()'"!:@]/g 
    });

    // Unique slug kontrolü
    let slug = baseSlug;
    let counter = 1;
    while (await Post.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Yeni post oluştur
    const post = await Post.create({
      title,
      slug,
      content,
      excerpt,
      featuredImage: featuredImage || 'https://placehold.co/600x400/a78bfa/ffffff?text=' + encodeURIComponent(title),
      category: {
        _id: category._id.toString(),
        name: category.name,
        slug: category.slug,
        color: category.color
      },
      tags: tags || [],
      author: {
        _id: user._id.toString(),
        username: user.username,
        fullName: user.fullName,
        avatar: user.avatar
      },
      status: status || 'draft',
      publishedAt: status === 'published' ? new Date() : undefined
    });

    // Kullanıcının yazı sayısını artır
    await User.findByIdAndUpdate(user._id, { 
      $inc: { postsCount: 1 } 
    });

    // Kategori yazı sayısını artır (sadece yayınlanan yazılar için)
    if (status === 'published') {
      await Category.findByIdAndUpdate(categoryId, { 
        $inc: { postCount: 1 } 
      });
    }

    console.log('✍️ Yeni yazı oluşturuldu:', post.title, 'by', user.username);

    return NextResponse.json({
      success: true,
      data: { post }
    }, { status: 201 });

  } catch (error) {
    console.error('Create post error:', error);
    return NextResponse.json(
      { success: false, error: 'Yazı oluşturulamadı' },
      { status: 500 }
    );
  }
}