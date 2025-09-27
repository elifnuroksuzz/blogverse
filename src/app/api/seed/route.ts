import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Category from '@/lib/models/Category';
import Post from '@/lib/models/Post';
import { sampleCategories, samplePosts } from '@/data/sampleData';

// GET /api/seed - Test verilerini MongoDB'ye yükle
export async function GET() {
  try {
    await connectToDatabase();
    
    // Mevcut verileri temizle (dikkatli ol!)
    await Post.deleteMany({});
    await Category.deleteMany({});
    
    console.log('🗑️ Mevcut veriler temizlendi');

    // Kategorileri yükle
    const categories = await Category.insertMany(sampleCategories);
    console.log('📁 Kategoriler yüklendi:', categories.length);

    // Posts için category ID'lerini eşleştir
    const postsWithCategoryIds = samplePosts.map(post => {
      const category = categories.find(cat => cat.slug === post.category.slug);
      return {
        ...post,
        category: {
          _id: category?._id.toString() || '',
          name: post.category.name,
          slug: post.category.slug,
          color: post.category.color
        },
        author: {
          name: 'BlogVerse Editörü',
          avatar: '/images/default-avatar.jpg'
        }
      };
    });

    // Posts'ları yükle
    const posts = await Post.insertMany(postsWithCategoryIds);
    console.log('📝 Blog yazıları yüklendi:', posts.length);

    // Kategori post sayılarını güncelle
    for (const category of categories) {
      const postCount = await Post.countDocuments({ 
        'category._id': category._id.toString(),
        status: 'published' 
      });
      await Category.findByIdAndUpdate(category._id, { postCount });
    }

    console.log('✅ Seed işlemi tamamlandı!');

    return NextResponse.json({
      success: true,
      message: 'Test verileri başarıyla yüklendi!',
      data: {
        categoriesCount: categories.length,
        postsCount: posts.length
      }
    });

  } catch (error) {
    console.error('Seed Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Test verileri yüklenemedi: ' + error
      },
      { status: 500 }
    );
  }
}