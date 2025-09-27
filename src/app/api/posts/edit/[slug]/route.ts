import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Post from '@/lib/models/Post';
import Category from '@/lib/models/Category';
import { getUserFromRequest } from '@/lib/auth';
import User from '@/lib/models/User';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

// GET /api/posts/edit/[slug] - Düzenlenecek yazıyı getir
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Giriş yapmalısınız' },
        { status: 401 }
      );
    }

    const { slug } = await params;
    await connectToDatabase();

    const post = await Post.findOne({ 
      slug,
      'author._id': user._id.toString() // Sadece kendi yazılarını düzenleyebilir
    }).lean();

    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Yazı bulunamadı veya düzenleme yetkiniz yok' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { post }
    });

  } catch (error) {
    console.error('Get edit post error:', error);
    return NextResponse.json(
      { success: false, error: 'Yazı getirilemedi' },
      { status: 500 }
    );
  }
}

// PUT /api/posts/edit/[slug] - Yazıyı güncelle
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Giriş yapmalısınız' },
        { status: 401 }
      );
    }

    const { slug } = await params;
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

    // Mevcut yazıyı kontrol et
    const existingPost = await Post.findOne({ 
      slug,
      'author._id': user._id.toString()
    });

    if (!existingPost) {
      return NextResponse.json(
        { success: false, error: 'Yazı bulunamadı veya düzenleme yetkiniz yok' },
        { status: 404 }
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

    // Yeni slug oluştur (başlık değiştiyse)
    let newSlug = slug;
    if (title !== existingPost.title) {
      const slugify = (await import('slugify')).default;
      const baseSlug = slugify(title, { 
        lower: true, 
        locale: 'tr',
        remove: /[*+~.()'"!:@]/g 
      });

      // Unique slug kontrolü
      newSlug = baseSlug;
      let counter = 1;
      while (await Post.findOne({ slug: newSlug, _id: { $ne: existingPost._id } })) {
        newSlug = `${baseSlug}-${counter}`;
        counter++;
      }
    }

    // Status değişikliği kontrolü (draft -> published)
    const wasPublished = existingPost.status === 'published';
    const willBePublished = status === 'published';

    // Yazıyı güncelle
    const updatedPost = await Post.findByIdAndUpdate(
      existingPost._id,
      {
        title,
        slug: newSlug,
        content,
        excerpt,
        featuredImage: featuredImage || existingPost.featuredImage,
        category: {
          _id: category._id.toString(),
          name: category.name,
          slug: category.slug,
          color: category.color
        },
        tags: tags || [],
        status: status || existingPost.status,
        publishedAt: !wasPublished && willBePublished ? new Date() : existingPost.publishedAt,
        updatedAt: new Date()
      },
      { new: true }
    );

    // Kategori değişikliği varsa post count'ları güncelle
    if (existingPost.category._id !== categoryId) {
      // Eski kategoriden çıkar (sadece published yazılar için)
      if (wasPublished) {
        await Category.findByIdAndUpdate(existingPost.category._id, { 
          $inc: { postCount: -1 } 
        });
      }
      
      // Yeni kategoriye ekle (sadece published yazılar için)
      if (willBePublished) {
        await Category.findByIdAndUpdate(categoryId, { 
          $inc: { postCount: 1 } 
        });
      }
    } else if (!wasPublished && willBePublished) {
      // Aynı kategori ama draft'tan published'a geçiş
      await Category.findByIdAndUpdate(categoryId, { 
        $inc: { postCount: 1 } 
      });
    } else if (wasPublished && !willBePublished) {
      // Published'dan draft'a geçiş
      await Category.findByIdAndUpdate(categoryId, { 
        $inc: { postCount: -1 } 
      });
    }

    console.log('✏️ Yazı güncellendi:', updatedPost.title, 'by', user.username);

    return NextResponse.json({
      success: true,
      data: { post: updatedPost }
    });

  } catch (error) {
    console.error('Update post error:', error);
    return NextResponse.json(
      { success: false, error: 'Yazı güncellenemedi' },
      { status: 500 }
    );
  }
}

// DELETE /api/posts/edit/[slug] - Yazıyı sil
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Giriş yapmalısınız' },
        { status: 401 }
      );
    }

    const { slug } = await params;
    await connectToDatabase();

    const post = await Post.findOne({ 
      slug,
      'author._id': user._id.toString()
    });

    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Yazı bulunamadı veya silme yetkiniz yok' },
        { status: 404 }
      );
    }

    // Yazıyı sil
    await Post.findByIdAndDelete(post._id);

    // Kullanıcının yazı sayısını azalt
    await User.findByIdAndUpdate(user._id, { 
      $inc: { postsCount: -1 } 
    });

    // Kategori yazı sayısını azalt (sadece published yazılar için)
    if (post.status === 'published') {
      await Category.findByIdAndUpdate(post.category._id, { 
        $inc: { postCount: -1 } 
      });
    }

    console.log('🗑️ Yazı silindi:', post.title, 'by', user.username);

    return NextResponse.json({
      success: true,
      message: 'Yazı başarıyla silindi'
    });

  } catch (error) {
    console.error('Delete post error:', error);
    return NextResponse.json(
      { success: false, error: 'Yazı silinemedi' },
      { status: 500 }
    );
  }
}