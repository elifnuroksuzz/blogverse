import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Post from '@/lib/models/Post';
import User from '@/lib/models/User';
import { getUserFromRequest } from '@/lib/auth';

// GET /api/auth/stats - Kullanıcı istatistiklerini getir
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

    // Kullanıcının yazılarını analiz et
    const userPosts = await Post.find({ 
      'author._id': user._id.toString() 
    }).lean();

    // İstatistikleri hesapla
    const totalViews = userPosts.reduce((sum, post) => sum + (post.views || 0), 0);
    const publishedPosts = userPosts.filter(post => post.status === 'published').length;
    const draftPosts = userPosts.filter(post => post.status === 'draft').length;

    // En popüler yazı
    const mostViewedPost = userPosts.length > 0 
      ? userPosts.reduce((prev, current) => (prev.views > current.views) ? prev : current)
      : null;

    // Son yazı
    const latestPost = userPosts.length > 0 
      ? userPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
      : null;

    // Kullanıcı bilgilerini güncelle
    const userDoc = await User.findById(user._id).lean();

    return NextResponse.json({
      success: true,
      data: {
        totalViews,
        publishedPosts,
        draftPosts,
        totalPosts: userPosts.length,
        joinDate: userDoc?.createdAt || new Date(),
        mostViewedPost: mostViewedPost ? {
          title: mostViewedPost.title,
          views: mostViewedPost.views,
          slug: mostViewedPost.slug
        } : null,
        latestPost: latestPost ? {
          title: latestPost.title,
          createdAt: latestPost.createdAt,
          slug: latestPost.slug,
          status: latestPost.status
        } : null,
        avgViewsPerPost: userPosts.length > 0 ? Math.round(totalViews / userPosts.length) : 0
      }
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    return NextResponse.json(
      { success: false, error: 'İstatistikler alınamadı' },
      { status: 500 }
    );
  }
}