import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/lib/models/User';
import { generateToken, validatePassword, validateUsername, validateEmail } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { username, email, password, fullName } = await request.json();

    // Validation
    if (!username || !email || !password || !fullName) {
      return NextResponse.json(
        { success: false, error: 'Tüm alanları doldurun' },
        { status: 400 }
      );
    }

    // Username validation
    const usernameValidation = validateUsername(username);
    if (!usernameValidation.isValid) {
      return NextResponse.json(
        { success: false, error: usernameValidation.message },
        { status: 400 }
      );
    }

    // Email validation
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return NextResponse.json(
        { success: false, error: emailValidation.message },
        { status: 400 }
      );
    }

    // Password validation
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { success: false, error: passwordValidation.message },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: username.toLowerCase() }
      ]
    });

    if (existingUser) {
      const field = existingUser.email === email.toLowerCase() ? 'E-posta' : 'Kullanıcı adı';
      return NextResponse.json(
        { success: false, error: `${field} zaten kullanılıyor` },
        { status: 400 }
      );
    }

    // Create new user
    const user = await User.create({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password,
      fullName: fullName.trim(),
      role: 'user' // Yeni kullanıcılar 'user' rolüyle başlar
    });

    // Generate token
    const token = generateToken(user);

    // Set cookie
    const response = NextResponse.json({
      success: true,
      message: 'Hesabınız başarıyla oluşturuldu!',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          avatar: user.avatar,
          role: user.role
        }
      }
    }, { status: 201 });

    // Set HTTP-only cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    console.log('🎉 Yeni kullanıcı kaydı:', user.username);

    return response;

  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { success: false, error: 'Kayıt işlemi başarısız' },
      { status: 500 }
    );
  }
}