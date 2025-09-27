import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { getUserFromRequest } from '@/lib/auth';

// POST /api/upload - Görsel yükleme
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Giriş yapmalısınız' },
        { status: 401 }
      );
    }

    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Dosya seçilmedi' },
        { status: 400 }
      );
    }

    // Dosya tipi kontrolü
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Sadece resim dosyaları yükleyebilirsiniz (JPG, PNG, GIF, WebP)' },
        { status: 400 }
      );
    }

    // Dosya boyutu kontrolü (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'Dosya boyutu 5MB\'dan küçük olmalıdır' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Dosya adını oluştur (unique)
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '');
    const fileName = `${timestamp}-${user.username}-${originalName}`;
    
    // Upload klasörünü oluştur
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      // Klasör zaten varsa hata vermez
    }

    // Dosyayı kaydet
    const filePath = join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    // Public URL oluştur
    const fileUrl = `/uploads/${fileName}`;

    console.log('📸 Görsel yüklendi:', fileName, 'by', user.username);

    return NextResponse.json({
      success: true,
      data: {
        url: fileUrl,
        fileName,
        originalName: file.name,
        size: file.size,
        type: file.type
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Dosya yüklenemedi' },
      { status: 500 }
    );
  }
}