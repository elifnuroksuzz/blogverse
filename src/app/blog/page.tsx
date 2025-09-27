'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, Search, Filter } from 'lucide-react';

interface Post {
  _id: string;
  title: string;
  excerpt: string;
  slug: string;
  featuredImage: string;
  category: {
    name: string;
    color: string;
    slug: string;
  };
  views: number;
  publishedAt: string;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  color: string;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  // Yazıları ve kategorileri yükle
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Kategorileri yükle
        const categoriesResponse = await fetch('/api/categories?active=true');
        const categoriesData = await categoriesResponse.json();
        if (categoriesData.success) {
          setCategories(categoriesData.data.categories);
        }

        // Yazıları yükle
        const postsUrl = selectedCategory 
          ? `/api/posts?category=${selectedCategory}&limit=20`
          : '/api/posts?limit=20';
        
        const postsResponse = await fetch(postsUrl);
        const postsData = await postsResponse.json();
        if (postsData.success) {
          setPosts(postsData.data.posts);
        }
      } catch (error) {
        console.error('Veriler yüklenemedi:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCategory]);

  // Arama filtresi
  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Tarih formatla
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-teal-50">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur-lg shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-3xl font-bold bg-gradient-to-r from-teal-500 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
            BlogVerse
          </Link>
          
          <nav className="hidden md:flex items-center space-x-8 font-medium">
            <Link href="/" className="text-gray-600 hover:text-teal-600 transition duration-300">Ana Sayfa</Link>
            <Link href="/hakkimizda" className="text-gray-600 hover:text-teal-600 transition duration-300">Biz Kimiz?</Link>
            <Link href="/kategoriler" className="text-gray-600 hover:text-teal-600 transition duration-300">Kategoriler</Link>
            <Link href="/blog" className="text-teal-600 hover:text-teal-700 transition duration-300 font-semibold">Trend Yazılar</Link>
            <Link href="/iletisim" className="text-gray-600 hover:text-teal-600 transition duration-300">İletişim</Link>
          </nav>
          
          <button className="md:hidden text-teal-700">
            <Menu className="w-7 h-7" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-teal-800 mb-4">
            Trend Yazılar
          </h1>
          <p className="text-xl text-teal-600 font-light">
            En son ve en popüler blog yazılarımız
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Yazı ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Filter className="text-gray-500 w-5 h-5" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="">Tüm Kategoriler</option>
              {categories.map(category => (
                <option key={category._id} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Posts Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-16 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredPosts.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post, index) => (
              <article 
                key={post._id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="overflow-hidden h-48">
                  <img 
                    src={post.featuredImage} 
                    alt={post.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <span 
                    className="text-sm font-semibold"
                    style={{ color: post.category.color }}
                  >
                    {post.category.name}
                  </span>
                  <h3 className="text-xl font-bold mt-2 text-gray-800 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 mt-2 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
                    <span>{formatDate(post.publishedAt)}</span>
                    <span>{post.views} görüntülenme</span>
                  </div>
                  <Link 
                    href={`/yazi/${post.slug}`}
                    className="mt-4 inline-block text-teal-600 font-semibold hover:underline"
                  >
                    Devamını Oku →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <h3 className="text-2xl font-bold text-gray-600 mb-4">
              {searchTerm ? 'Arama sonucu bulunamadı' : 'Henüz yazı yok'}
            </h3>
            <p className="text-gray-500 mb-8">
              {searchTerm 
                ? 'Farklı anahtar kelimeler deneyin veya filtreleri değiştirin'
                : 'Çok yakında harika içeriklerle burada olacağız!'
              }
            </p>
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="inline-block bg-teal-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-teal-700 transition-colors"
              >
                Aramayı Temizle
              </button>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-teal-800 text-white mt-16">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
            <p className="text-teal-200">&copy; 2025 BlogVerse. Tüm Hakları Saklıdır.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}