import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import User, { IUser } from './models/User';
import connectToDatabase from './mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

export interface TokenPayload {
  userId: string;
  username: string;
  email: string;
  role: string;
}

// JWT token oluştur
export function generateToken(user: IUser): string {
  const payload: TokenPayload = {
    userId: user._id.toString(),
    username: user.username,
    email: user.email,
    role: user.role
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d' // 7 gün geçerli
  });
}

// JWT token doğrula
export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}

// Request'ten kullanıcı bilgisi al
export async function getUserFromRequest(request: NextRequest): Promise<IUser | null> {
  try {
    const token = request.cookies.get('auth-token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return null;
    }

    const payload = verifyToken(token);
    if (!payload) {
      return null;
    }

    await connectToDatabase();
    const user = await User.findById(payload.userId).select('-password');
    
    if (!user || !user.isActive) {
      return null;
    }

    return user;
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}

// Middleware - Admin kontrolü
export function requireAdmin(user: IUser | null): boolean {
  return user?.role === 'admin';
}

// Middleware - Author veya Admin kontrolü
export function requireAuthor(user: IUser | null): boolean {
  return user?.role === 'author' || user?.role === 'admin';
}

// Middleware - Kullanıcı kontrolü
export function requireUser(user: IUser | null): boolean {
  return user !== null && user.isActive;
}

// Password validation
export function validatePassword(password: string): { isValid: boolean; message?: string } {
  if (password.length < 6) {
    return { isValid: false, message: 'Şifre en az 6 karakter olmalı' };
  }
  
  if (password.length > 50) {
    return { isValid: false, message: 'Şifre çok uzun' };
  }

  // En az bir harf ve bir rakam
  if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(password)) {
    return { isValid: false, message: 'Şifre en az bir harf ve bir rakam içermeli' };
  }

  return { isValid: true };
}

// Username validation
export function validateUsername(username: string): { isValid: boolean; message?: string } {
  if (username.length < 3) {
    return { isValid: false, message: 'Kullanıcı adı en az 3 karakter olmalı' };
  }

  if (username.length > 30) {
    return { isValid: false, message: 'Kullanıcı adı en fazla 30 karakter olabilir' };
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return { isValid: false, message: 'Kullanıcı adı sadece harf, rakam, - ve _ içerebilir' };
  }

  // Yasaklı kelimeler
  const forbidden = ['admin', 'root', 'user', 'test', 'null', 'undefined', 'api', 'www'];
  if (forbidden.includes(username.toLowerCase())) {
    return { isValid: false, message: 'Bu kullanıcı adı kullanılamaz' };
  }

  return { isValid: true };
}

// Email validation
export function validateEmail(email: string): { isValid: boolean; message?: string } {
  const emailRegex = /^\S+@\S+\.\S+$/;
  
  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'Geçerli bir e-posta adresi girin' };
  }

  return { isValid: true };
}