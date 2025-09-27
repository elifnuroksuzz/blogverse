// Test verisi - MongoDB'ye ekleyeceğimiz örnek data
export const sampleCategories = [
  {
    name: "Yaşam Tarzı",
    slug: "yasam-tarzi",
    description: "Hayatına renk katacak lifestyle öneriler",
    color: "#a78bfa",
    image: "https://placehold.co/600x400/a78bfa/ffffff?text=Yaşam+Tarzı",
    isActive: true
  },
  {
    name: "Oyun & Tech",
    slug: "oyun-tech", 
    description: "Oyun dünyası ve teknoloji haberleri",
    color: "#7dd3fc",
    image: "https://placehold.co/600x400/7dd3fc/ffffff?text=Oyun+&+Tech",
    isActive: true
  },
  {
    name: "Okul Hayatı",
    slug: "okul-hayati",
    description: "Ders çalışma ipuçları ve okul önerileri", 
    color: "#fca5a5",
    image: "https://placehold.co/600x400/fca5a5/ffffff?text=Okul+Hayatı",
    isActive: true
  },
  {
    name: "Zinde Kal",
    slug: "zinde-kal",
    description: "Sağlık ve spor önerileri",
    color: "#86efac", 
    image: "https://placehold.co/600x400/86efac/ffffff?text=Zinde+Kal",
    isActive: true
  },
  {
    name: "Film & Dizi",
    slug: "film-dizi",
    description: "En iyi film ve dizi önerileri",
    color: "#fcd34d",
    image: "https://placehold.co/600x400/fcd34d/ffffff?text=Film+&+Dizi", 
    isActive: true
  },
  {
    name: "Kendini Geliştir",
    slug: "kendini-gelistir",
    description: "Kişisel gelişim ve motivasyon",
    color: "#9ca3af",
    image: "https://placehold.co/600x400/9ca3af/ffffff?text=Kendini+Geliştir",
    isActive: true
  }
];

export const samplePosts = [
  {
    title: "Odanı Baştan Yarat: Efsane DIY Dekor Fikirleri",
    slug: "odani-bastan-yarat-diy-dekor",
    excerpt: "Düşük bütçeyle odana karakter katacak yaratıcı ve havalı projeler...",
    content: `
    <p>Odan senin kalen! Ama bazen bu kale biraz sıkıcı gelebilir, değil mi? Aynı duvarlar, aynı mobilyalar... Dert etme! Pahalı eşyalara para harcamadan, kendi ellerinle odana yepyeni bir hava katabilirsin.</p>
    
    <h3>1. Anı Duvarı Oluştur</h3>
    <p>Sıradan çerçeveleri unut! Birkaç mandal, bir parça ip veya bir mantar pano ile en sevdiğin fotoğrafları, konser biletlerini, sevdiğin sözleri sergileyebileceğin dinamik bir anı duvarı yapabilirsin.</p>
    
    <h3>2. Kavanozları Sanat Eserine Dönüştür</h3>
    <p>Boş cam kavanozları atma! Onları akrilik boyalarla renklendirerek kalemlik, makyaj fırçalık veya vazo olarak kullanabilirsin.</p>
    
    <h3>3. Eski Tişörtlerden Paspas veya Yastık</h3>
    <p>Giymediğin eski pamuklu tişörtleri kesip örerek rengarenk bir paspas veya pufidik bir yastık kılıfı yapabileceğini biliyor muydun?</p>
    `,
    featuredImage: "https://placehold.co/600x400/a78bfa/ffffff?text=DIY+Oda+Dekoru",
    category: {
      name: "Yaşam Tarzı",
      slug: "yasam-tarzi", 
      color: "#a78bfa"
    },
    tags: ["DIY", "dekorasyon", "yaşam tarzı", "budget"],
    status: "published" as const,
    isFeatured: true,
    views: 1250,
    metaTitle: "DIY Oda Dekoru - BlogVerse",
    metaDescription: "Düşük bütçeyle odana karakter katacak yaratıcı DIY dekor fikirleri.",
    publishedAt: new Date('2025-01-15')
  },
  {
    title: "2025'in En Çok Beklenen 5 Oyunu", 
    slug: "2025-en-cok-beklenen-oyunlar",
    excerpt: "Bu yıl çıkacak ve seni ekran başına kilitleyecek o efsane oyunlar...",
    content: "<p>Bu yazı çok yakında yayınlanacak...</p>",
    featuredImage: "https://placehold.co/600x400/7dd3fc/ffffff?text=Gaming+2025",
    category: {
      name: "Oyun & Tech",
      slug: "oyun-tech",
      color: "#7dd3fc"
    },
    tags: ["oyun", "gaming", "2025", "beklenen"],
    status: "draft" as const,
    isFeatured: false,
    views: 0
  },
  {
    title: "Daha Akıllı Çalış: Sınav Haftası Hayatta Kalma Rehberi",
    slug: "sinav-haftasi-hayatta-kalma",
    excerpt: "Ezberden uzak, kalıcı öğrenme teknikleri ve motivasyon tüyoları...", 
    content: "<p>Bu yazı çok yakında yayınlanacak...</p>",
    featuredImage: "https://placehold.co/600x400/fca5a5/ffffff?text=Study+Tips",
    category: {
      name: "Okul Hayatı", 
      slug: "okul-hayati",
      color: "#fca5a5"
    },
    tags: ["ders çalışma", "sınav", "motivasyon", "öğrenme"],
    status: "draft" as const,
    isFeatured: false,
    views: 0
  }
];