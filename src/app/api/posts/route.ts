import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Post from '@/lib/models/Post';
import Category from '@/lib/models/Category';

// GET /api/posts - Tüm blog yazılarını getir
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const featured = searchParams.get('featured');

    // Query oluştur
    const query: any = { status: 'published' };
    
    if (category) {
      query['category.slug'] = category;
    }
    
    if (featured === 'true') {
      query.isFeatured = true;
    }

    // Posts'ları getir
    const posts = await Post.find(query)
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    // Total count
    const total = await Post.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: {
        posts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Posts API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Blog yazıları getirilemedi' 
      },
      { status: 500 }
    );
  }
}

// POST /api/posts - Yeni blog yazısı oluştur (Admin için)
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    
    // Slug oluştur
    const slugify = (await import('slugify')).default;
    if (!body.slug) {
      body.slug = slugify(body.title, { 
        lower: true, 
        locale: 'tr',
        remove: /[*+~.()'"!:@]/g 
      });
    }

    // Yeni post oluştur
    const post = await Post.create({
      ...body,
      author: {
        name: body.author?.name || 'BlogVerse Editörü',
        avatar: body.author?.avatar || '/images/default-avatar.jpg'
      },
      publishedAt: body.status === 'published' ? new Date() : undefined
    });

    // Kategori post sayısını güncelle
    if (body.category?._id) {
      await Category.findByIdAndUpdate(
        body.category._id,
        { $inc: { postCount: 1 } }
      );
    }

    return NextResponse.json({
      success: true,
      data: { post }
    }, { status: 201 });

  } catch (error) {
    console.error('Create Post Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Blog yazısı oluşturulamadı' 
      },
      { status: 500 }
    );
  }
}