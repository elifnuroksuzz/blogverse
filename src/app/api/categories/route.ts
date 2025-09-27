import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Category from '@/lib/models/Category';

// GET /api/categories - Tüm kategorileri getir
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const active = searchParams.get('active');

    // Query oluştur
    const query: any = {};
    if (active === 'true') {
      query.isActive = true;
    }

    // Kategorileri getir
    const categories = await Category.find(query)
      .sort({ name: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: { categories }
    });

  } catch (error) {
    console.error('Categories API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Kategoriler getirilemedi' 
      },
      { status: 500 }
    );
  }
}

// POST /api/categories - Yeni kategori oluştur
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    
    // Slug oluştur
    const slugify = (await import('slugify')).default;
    if (!body.slug) {
      body.slug = slugify(body.name, { 
        lower: true, 
        locale: 'tr',
        remove: /[*+~.()'"!:@]/g 
      });
    }

    // Yeni kategori oluştur
    const category = await Category.create(body);

    return NextResponse.json({
      success: true,
      data: { category }
    }, { status: 201 });

  } catch (error) {
    console.error('Create Category Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Kategori oluşturulamadı' 
      },
      { status: 500 }
    );
  }
}