import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';

// GET /api/auth/me - Mevcut kullanıcı bilgilerini getir
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Oturum bulunamadı' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          avatar: user.avatar,
          role: user.role,
          bio: user.bio,
          postsCount: user.postsCount,
          followersCount: user.followersCount,
          followingCount: user.followingCount
        }
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { success: false, error: 'Kullanıcı bilgileri alınamadı' },
      { status: 500 }
    );
  }
}