'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, Twitter, Instagram, Youtube, Send, X, Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

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
  status: string;
  views: number;
  isFeatured: boolean;
}

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [featuredPosts, setFeaturedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  
  // Auth modal states
  const [loginData, setLoginData] = useState({ identifier: '', password: '' });
  const [registerData, setRegisterData] = useState({ 
    fullName: '', username: '', email: '', password: '', confirmPassword: '' 
  });
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const { user, login, register, logout } = useAuth();

  // MongoDB'den öne çıkan yazıları çek
  useEffect(() => {
    const fetchFeaturedPosts = async () => {
      try {
        const response = await fetch('/api/posts?featured=true&limit=3');
        const data = await response.json();
        
        if (data.success) {
          setFeaturedPosts(data.data.posts);
        }
      } catch (error) {
        console.error('Öne çıkan yazılar yüklenemedi:', error);
        // Hata durumunda varsayılan veriler
        setFeaturedPosts([
          {
            _id: '1',
            title: "Odanı Baştan Yarat: Efsane DIY Dekor Fikirleri",
            excerpt: "Düşük bütçeyle odana karakter katacak yaratıcı ve havalı projeler...",
            category: { name: "Yaşam Tarzı", color: "#a78bfa", slug: "yasam-tarzi" },
            featuredImage: "https://placehold.co/600x400/a78bfa/ffffff?text=DIY+Oda+Dekoru",
            slug: "odani-bastan-yarat-diy-dekor",
            status: "published",
            views: 1250,
            isFeatured: true
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedPosts();
  }, []);

  // Scroll reveal animation
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('opacity-100', 'translate-y-0');
          entry.target.classList.remove('opacity-0', 'translate-y-8');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [featuredPosts]);

  return (
    <div className="min-h-screen bg-teal-50 text-teal-800">
      {/* Header & Navigation */}
      <header className="bg-white/70 backdrop-blur-lg shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-3xl font-bold bg-gradient-to-r from-teal-500 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
            BlogVerse
          </Link>
          
          <nav className="hidden md:flex items-center space-x-8 font-medium">
            <Link href="/" className="text-teal-600 hover:text-teal-700 transition duration-300 font-semibold">Ana Sayfa</Link>
            <Link href="/hakkimizda" className="text-gray-600 hover:text-teal-600 transition duration-300">Biz Kimiz?</Link>
            <Link href="/kategoriler" className="text-gray-600 hover:text-teal-600 transition duration-300">Kategoriler</Link>
            <Link href="/blog" className="text-gray-600 hover:text-teal-600 transition duration-300">Trend Yazılar</Link>
            <Link href="/iletisim" className="text-gray-600 hover:text-teal-600 transition duration-300">İletişim</Link>
          </nav>
          
          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                <Link href="/dashboard" className="flex items-center space-x-2 text-gray-600 hover:text-teal-600 transition duration-300">
                  <img 
                    src={user.avatar || '/images/default-avatar.jpg'} 
                    alt={user.fullName}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="font-medium">{user.fullName}</span>
                </Link>
                <button
                  onClick={async () => {
                    await logout();
                    window.location.reload();
                  }}
                  className="text-gray-500 hover:text-red-600 transition duration-300"
                >
                  Çıkış
                </button>
              </div>
            ) : (
              <>
                <Link 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    setShowLoginModal(true);
                  }}
                  className="text-gray-600 hover:text-teal-600 transition duration-300 font-medium"
                >
                  Giriş Yap
                </Link>
                <Link 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowRegisterModal(true);
                  }}
                  className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition duration-300 font-medium"
                >
                  Üye Ol
                </Link>
              </>
            )}
          </div>
          
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-teal-700"
          >
            <Menu className="w-7 h-7" />
          </button>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden px-6 pb-4 space-y-2 bg-white/90 backdrop-blur">
            <Link href="/" className="block text-teal-600 hover:text-teal-700 py-2 font-semibold">Ana Sayfa</Link>
            <Link href="/hakkimizda" className="block text-gray-600 hover:text-teal-600 py-2">Biz Kimiz?</Link>
            <Link href="/kategoriler" className="block text-gray-600 hover:text-teal-600 py-2">Kategoriler</Link>
            <Link href="/blog" className="block text-gray-600 hover:text-teal-600 py-2">Trend Yazılar</Link>
            <Link href="/iletisim" className="block text-gray-600 hover:text-teal-600 py-2">İletişim</Link>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        {/* Hero Section */}
        <section className="text-center py-16">
          <h1 className="text-5xl md:text-7xl font-extrabold bg-gradient-to-r from-teal-500 via-cyan-400 to-purple-400 bg-clip-text text-transparent reveal opacity-0 translate-y-8 transition-all duration-800">
            Selam! BlogVerse'e Hoş Geldin!
          </h1>
          <p className="mt-6 text-lg md:text-xl text-teal-700 max-w-3xl mx-auto reveal opacity-0 translate-y-8 transition-all duration-800 delay-150">
            Merak ettiklerin, en yeni trendler, hobiler ve hayatına renk katacak her şey burada!
          </p>
        </section>

        {/* Featured Posts */}
        <section className="mt-12">
          <h2 className="text-4xl font-bold text-center mb-10 text-teal-800 reveal opacity-0 translate-y-8 transition-all duration-800">
            Popüler Yazılar
          </h2>
          
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
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
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredPosts.map((post, index) => (
                <article 
                  key={post._id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl hover:-translate-y-2 transition-all duration-300 reveal opacity-0 translate-y-8"
                  style={{ transitionDelay: `${index * 200}ms` }}
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
                    <div className="flex justify-between items-center mt-4">
                      {post.status === 'published' ? (
                        <Link 
                          href={`/yazi/${post.slug}`}
                          className="text-teal-600 font-semibold hover:underline"
                        >
                          Hemen Oku →
                        </Link>
                      ) : (
                        <span className="text-gray-400 font-semibold cursor-not-allowed">
                          Çok Yakında →
                        </span>
                      )}
                      <span className="text-sm text-gray-500">
                        {post.views} görüntülenme
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Tüm yazıları gör butonu */}
          <div className="text-center mt-12">
            <Link 
              href="/blog"
              className="inline-block bg-teal-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-teal-700 transition-colors duration-300 hover:scale-105 transform"
            >
              Tüm Yazıları Gör
            </Link>
          </div>
        </section>
      </main>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Giriş Yap</h2>
              <button
                onClick={() => {
                  setShowLoginModal(false);
                  setAuthError('');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              setAuthLoading(true);
              setAuthError('');
              
              const result = await login(loginData.identifier, loginData.password);
              if (result.success) {
                setShowLoginModal(false);
                setLoginData({ identifier: '', password: '' });
              } else {
                setAuthError(result.error || 'Giriş başarısız');
              }
              setAuthLoading(false);
            }} className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Kullanıcı adı veya e-posta"
                  value={loginData.identifier}
                  onChange={(e) => setLoginData(prev => ({ ...prev, identifier: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
              
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Şifre"
                  value={loginData.password}
                  onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {authError && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                  {authError}
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full flex items-center justify-center py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
              >
                {authLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Giriş yapılıyor...
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    Giriş Yap
                  </>
                )}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  setShowLoginModal(false);
                  setShowRegisterModal(true);
                  setAuthError('');
                }}
                className="text-teal-600 hover:text-teal-700"
              >
                Hesabın yok mu? Üye ol
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Register Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Üye Ol</h2>
              <button
                onClick={() => {
                  setShowRegisterModal(false);
                  setAuthError('');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              setAuthLoading(true);
              setAuthError('');

              if (registerData.password !== registerData.confirmPassword) {
                setAuthError('Şifreler eşleşmiyor');
                setAuthLoading(false);
                return;
              }
              
              const result = await register({
                fullName: registerData.fullName,
                username: registerData.username,
                email: registerData.email,
                password: registerData.password
              });
              
              if (result.success) {
                setShowRegisterModal(false);
                setRegisterData({ fullName: '', username: '', email: '', password: '', confirmPassword: '' });
              } else {
                setAuthError(result.error || 'Kayıt başarısız');
              }
              setAuthLoading(false);
            }} className="space-y-4">
              <input
                type="text"
                placeholder="Ad Soyad"
                value={registerData.fullName}
                onChange={(e) => setRegisterData(prev => ({ ...prev, fullName: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
              
              <input
                type="text"
                placeholder="Kullanıcı adı"
                value={registerData.username}
                onChange={(e) => setRegisterData(prev => ({ ...prev, username: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
              
              <input
                type="email"
                placeholder="E-posta"
                value={registerData.email}
                onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
              
              <input
                type="password"
                placeholder="Şifre"
                value={registerData.password}
                onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
              
              <input
                type="password"
                placeholder="Şifre tekrarı"
                value={registerData.confirmPassword}
                onChange={(e) => setRegisterData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />

              {authError && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                  {authError}
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full flex items-center justify-center py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
              >
                {authLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Hesap oluşturuluyor...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Üye Ol
                  </>
                )}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  setShowRegisterModal(false);
                  setShowLoginModal(true);
                  setAuthError('');
                }}
                className="text-teal-600 hover:text-teal-700"
              >
                Zaten hesabın var mı? Giriş yap
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-teal-800 text-white mt-16">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
            <p className="text-teal-200">&copy; 2025 BlogVerse. Tüm Hakları Saklıdır.</p>
            <div className="flex mt-6 md:mt-0 space-x-6">
              <a href="#" className="hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <Send className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}