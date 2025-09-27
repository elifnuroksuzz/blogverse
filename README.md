# 🌟 BlogVerse - Modern Blog Topluluk Platformu

[![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black)](https://nextjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)](https://mongodb.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)](https://typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0+-38B2AC)](https://tailwindcss.com/)

BlogVerse, modern web teknolojileri kullanılarak geliştirilmiş, kullanıcı dostu ve özellik açısından zengin bir blog topluluk platformudur. Kullanıcılar yazı yazabilir, paylaşabilir ve topluluğun bir parçası olabilir.

## 📸 Platform Önizlemesi

### Ana Sayfa
![Ana Sayfa](images/anasayfa.png)
*Öne çıkan yazılar ve modern tasarım*

### Üyelik Sistemi
<div style="display: flex; gap: 10px;">
  <img src="images/giris.png" width="48%" alt="Giriş Sayfası">
  <img src="images/kayıt.png" width="48%" alt="Kayıt Sayfası">
</div>

*Modal tabanlı giriş ve kayıt sistemi*

### İçerik Yönetimi
![Dashboard](images/dashboard.png)
*Kullanıcı dashboard'u ve yazı yönetimi*

### Kategoriler ve İçerikler
<div style="display: flex; gap: 10px;">
  <img src="images/kategoriler.png" width="48%" alt="Kategoriler">
  <img src="images/trendyazilar.png" width="48%" alt="Trend Yazılar">
</div>

*Kategori sistemi ve blog yazıları*

### Kullanıcı Deneyimi
<div style="display: flex; gap: 10px;">
  <img src="images/bizkimiz.png" width="48%" alt="Hakkımızda">
  <img src="images/iletisim.png" width="48%" alt="İletişim">
</div>

*Hakkımızda ve İletişim sayfaları*

### Profil Yönetimi
![Profil Düzenleme](images/profilidüzenle.png)
*Kullanıcı profil düzenleme ve ayarlar*

## ✨ Özellikler

### 🔐 Üyelik Sistemi
- **Güvenli Authentication**: JWT tabanlı kimlik doğrulama
- **Modal Giriş/Kayıt**: Sayfa yenilemeden kullanıcı işlemleri
- **Profil Yönetimi**: Avatar yükleme, bio düzenleme, sosyal medya linkleri
- **Rol Tabanlı Erişim**: User, Author, Admin rolleri

### ✍️ İçerik Yönetimi
- **Yazı Editörü**: HTML destekli zengin metin editörü
- **Görsel Yükleme**: Lokal dosya yükleme ve URL desteği
- **Kategori Sistemi**: Renkli kategori etiketleri
- **Etiket Sistemi**: Flexible etiketleme
- **Taslak/Yayın**: İçerik durumu yönetimi

### 🎨 Kullanıcı Deneyimi
- **Responsive Tasarım**: Mobil uyumlu arayüz
- **Modern Animasyonlar**: Smooth geçişler ve hover efektleri
- **Dark/Light Mode**: Otomatik tema desteği
- **Arama ve Filtreleme**: Gelişmiş içerik keşfi

### 📊 Analytics ve İstatistikler
- **Görüntülenme Sayacı**: Yazı istatistikleri
- **Kullanıcı Dashboard**: Kişisel istatistikler
- **Kategori Analytics**: İçerik dağılımı

## 🛠️ Teknoloji Stack'i

### Frontend
- **Next.js 15.5.4** - React framework (App Router)
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Modern icon library
- **Framer Motion** - Animasyon library

### Backend
- **Next.js API Routes** - Serverless API
- **MongoDB Atlas** - NoSQL veritabanı
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing

### DevOps & Tools
- **Vercel** - Deployment platform
- **Git** - Version control
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 📁 Proje Yapısı

```
blogverse/
├── public/
│   ├── images/           # Demo görseller
│   └── uploads/          # Kullanıcı yüklemeleri
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── api/          # API routes
│   │   ├── dashboard/    # Kullanıcı paneli
│   │   └── ...          # Diğer sayfalar
│   ├── components/       # Reusable components
│   ├── lib/              # Utilities ve models
│   └── data/            # Sample data
├── .env.local           # Environment variables
└── package.json         # Dependencies
```

## 🚀 Kurulum ve Çalıştırma

### Gereksinimler
- Node.js 18+
- MongoDB Atlas hesabı
- Git

### 1. Projeyi Clone Edin
```bash
git clone https://github.com/yourusername/blogverse.git
cd blogverse
```

### 2. Bağımlılıkları Yükleyin
```bash
npm install
```

### 3. Environment Variables
`.env.local` dosyası oluşturun:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/blogverse
JWT_SECRET=your-super-secret-jwt-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Veritabanını Başlatın
```bash
# Test verilerini yüklemek için
curl http://localhost:3000/api/seed
```

### 5. Development Server'ı Başlatın
```bash
npm run dev
```

Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresini açın.

## 📚 API Dokümantasyonu

### Authentication Endpoints
- `POST /api/auth/register` - Kullanıcı kaydı
- `POST /api/auth/login` - Kullanıcı girişi
- `POST /api/auth/logout` - Çıkış
- `GET /api/auth/me` - Mevcut kullanıcı bilgileri

### Content Endpoints
- `GET /api/posts` - Blog yazılarını listele
- `POST /api/posts/my` - Yeni yazı oluştur
- `PUT /api/posts/edit/[slug]` - Yazı güncelle
- `DELETE /api/posts/delete/[id]` - Yazı sil

### Media Endpoints
- `POST /api/upload` - Dosya yükleme

## 🔧 Geliştirme

### Kod Standartları
- TypeScript strict mode
- ESLint + Prettier
- Conventional commits
- Component-based architecture

### Testing
```bash
npm run test          # Unit tests
npm run test:e2e      # End-to-end tests
npm run test:coverage # Coverage report
```

### Build
```bash
npm run build    # Production build
npm run start    # Production server
```

## 🚀 Deployment

### Vercel (Önerilen)
1. Vercel hesabı oluşturun
2. GitHub repository'yi bağlayın
3. Environment variables'ları ekleyin
4. Deploy edin

### Manuel Deployment
```bash
npm run build
npm run start
```

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 👥 Katkıda Bulunanlar

- **Elif Nur** - *Proje sahibi ve lead developer*

## 🙏 Teşekkürler

- [Next.js](https://nextjs.org/) takımına framework için
- [Tailwind CSS](https://tailwindcss.com/) takımına styling için
- [MongoDB](https://mongodb.com/) takımına veritabanı için
- [Vercel](https://vercel.com/) takımına hosting için

---

⭐ Bu projeyi beğendiyseniz yıldızlamayı unutmayın!

