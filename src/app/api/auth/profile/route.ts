import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/lib/models/User';
import { getUserFromRequest } from '@/lib/auth';

// PUT /api/auth/profile - Profili güncelle
export async function PUT(request: NextRequest) {
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
    const { fullName, bio, avatar, socialLinks } = body;

    // Validation
    if (!fullName || fullName.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Ad soyad gerekli' },
        { status: 400 }
      );
    }

    if (fullName.length > 100) {
      return NextResponse.json(
        { success: false, error: 'Ad soyad çok uzun' },
        { status: 400 }
      );
    }

    if (bio && bio.length > 500) {
      return NextResponse.json(
        { success: false, error: 'Bio çok uzun (maksimum 500 karakter)' },
        { status: 400 }
      );
    }

    // Avatar URL validation
    if (avatar && avatar.trim() !== '') {
      try {
        new URL(avatar);
      } catch {
        return NextResponse.json(
          { success: false, error: 'Geçerli bir avatar URL\'si girin' },
          { status: 400 }
        );
      }
    }

    // Kullanıcıyı güncelle
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        fullName: fullName.trim(),
        bio: bio?.trim() || '',
        avatar: avatar?.trim() || '/images/default-avatar.jpg',
        socialLinks: {
          twitter: socialLinks?.twitter?.trim() || '',
          instagram: socialLinks?.instagram?.trim() || '',
          linkedin: socialLinks?.linkedin?.trim() || ''
        },
        updatedAt: new Date()
      },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    console.log('👤 Profil güncellendi:', updatedUser.username);

    return NextResponse.json({
      success: true,
      message: 'Profil başarıyla güncellendi',
      data: {
        user: {
          id: updatedUser._id,
          username: updatedUser.username,
          email: updatedUser.email,
          fullName: updatedUser.fullName,
          avatar: updatedUser.avatar,
          role: updatedUser.role,
          bio: updatedUser.bio,
          socialLinks: updatedUser.socialLinks,
          postsCount: updatedUser.postsCount
        }
      }
    });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { success: false, error: 'Profil güncellenemedi' },
      { status: 500 }
    );
  }
}