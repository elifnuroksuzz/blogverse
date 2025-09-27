import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';

// Contact message schema (basit MongoDB koleksiyonu)
import mongoose from 'mongoose';

const ContactMessageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Ad gerekli'],
    trim: true,
    maxlength: [100, 'Ad çok uzun']
  },
  email: {
    type: String,
    required: [true, 'E-posta gerekli'],
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Geçerli e-posta adresi girin']
  },
  message: {
    type: String,
    required: [true, 'Mesaj gerekli'],
    trim: true,
    maxlength: [1000, 'Mesaj çok uzun']
  },
  isRead: {
    type: Boolean,
    default: false
  },
  ipAddress: String,
  userAgent: String
}, {
  timestamps: true
});

const ContactMessage = mongoose.models.ContactMessage || mongoose.model('ContactMessage', ContactMessageSchema);

// POST /api/contact - İletişim formu mesajı kaydet
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const { name, email, message } = body;

    // Validation
    if (!name || !email || !message) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Tüm alanları doldurun' 
        },
        { status: 400 }
      );
    }

    if (name.length > 100) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Ad çok uzun' 
        },
        { status: 400 }
      );
    }

    if (message.length > 1000) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Mesaj çok uzun (maksimum 1000 karakter)' 
        },
        { status: 400 }
      );
    }

    // E-posta format kontrolü
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Geçerli bir e-posta adresi girin' 
        },
        { status: 400 }
      );
    }

    // Mesajı kaydet
    const contactMessage = await ContactMessage.create({
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
      ipAddress: request.ip || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    });

    console.log('✉️ Yeni iletişim mesajı:', {
      from: name,
      email: email,
      id: contactMessage._id
    });

    return NextResponse.json({
      success: true,
      message: 'Mesajınız başarıyla alındı! En kısa sürede dönüş yapacağız.',
      data: {
        id: contactMessage._id
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Contact API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Mesaj gönderilemedi. Lütfen tekrar deneyin.' 
      },
      { status: 500 }
    );
  }
}

// GET /api/contact - Tüm mesajları getir (Admin için)
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const unreadOnly = searchParams.get('unread') === 'true';

    const query = unreadOnly ? { isRead: false } : {};

    const messages = await ContactMessage.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const totalUnread = await ContactMessage.countDocuments({ isRead: false });

    return NextResponse.json({
      success: true,
      data: {
        messages,
        totalUnread
      }
    });

  } catch (error) {
    console.error('Get Contact Messages Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Mesajlar getirilemedi' 
      },
      { status: 500 }
    );
  }
}