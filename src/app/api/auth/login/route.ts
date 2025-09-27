import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/lib/models/User';
import { generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { identifier, password } = await request.json();

    // Validation
    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı adı/e-posta ve şifre gerekli' },
        { status: 400 }
      );
    }

    // Find user by email or username
    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { username: identifier.toLowerCase() }
      ],
      isActive: true
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı bulunamadı veya hesap aktif değil' },
        { status: 401 }
      );
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'Şifre hatalı' },
        { status: 401 }
      );
    }

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user);

    // Set cookie
    const response = NextResponse.json({
      success: true,
      message: 'Giriş başarılı!',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          avatar: user.avatar,
          role: user.role,
          bio: user.bio,
          postsCount: user.postsCount
        }
      }
    });

    // Set HTTP-only cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    console.log('🚀 Kullanıcı girişi:', user.username);

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Giriş işlemi başarısız' },
      { status: 500 }
    );
  }
}