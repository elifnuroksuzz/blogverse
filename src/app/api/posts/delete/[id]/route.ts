import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Post from '@/lib/models/Post';
import User from '@/lib/models/User';
import Category from '@/lib/models/Category';
import { getUserFromRequest } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// DELETE /api/posts/delete/[id] - Yazıyı sil
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Giriş yapmalısınız' },
        { status: 401 }
      );
    }

    const { id } = await params;
    await connectToDatabase();

    // Yazıyı bul ve sahibini kontrol et
    const post = await Post.findOne({ 
      _id: id,
      'author._id': user._id.toString()
    });

    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Yazı bulunamadı veya silme yetkiniz yok' },
        { status: 404 }
      );
    }

    // Yazıyı sil
    await Post.findByIdAndDelete(id);

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