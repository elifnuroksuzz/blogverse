'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  PlusCircle, 
  FileText, 
  Eye, 
  Edit3, 
  Trash2, 
  LogOut, 
  User,
  Settings,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

interface UserPost {
  _id: string;
  title: string;
  excerpt: string;
  slug: string;
  status: 'draft' | 'published';
  views: number;
  createdAt: string;
  category: {
    name: string;
    color: string;
  };
}

export default function DashboardPage() {
  const { user, logout, loading } = useAuth();
  const [userPosts, setUserPosts] = useState<UserPost[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  // Giriş kontrolü
  useEffect(() => {
    if (!loading && !user) {
      router.push('/giris');
    }
  }, [user, loading, router]);

  // Kullanıcının yazılarını yükle
  useEffect(() => {
    if (user) {
      fetchUserPosts();
    }
  }, [user]);

  const fetchUserPosts = async () => {
    try {
      setPostsLoading(true);
      const response = await fetch('/api/posts/my');
      const data = await response.json();
      
      if (data.success) {
        setUserPosts(data.data.posts);
      }
    } catch (error) {
      console.error('Yazılar yüklenemedi:', error);
    } finally {
      setPostsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  // Yazı silme fonksiyonu
  const handleDeletePost = async (postId: string, postTitle: string) => {
    if (!confirm(`"${postTitle}" yazısını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/posts/delete/${postId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        // Yazıları yeniden yükle
        await fetchUserPosts();
        // Kullanıcı verilerini güncelle
        await refreshUser();
        alert('Yazı başarıyla silindi!');
      } else {
        alert(data.error || 'Yazı silinemedi');
      }
    } catch (error) {
      alert('Bağlantı hatası');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-teal-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-teal-50">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 z-50 lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-teal-500 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
              BlogVerse
            </Link>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* User Profile */}
          <div className="bg-teal-50 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3">
              <img 
                src={user.avatar} 
                alt={user.fullName}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <h3 className="font-semibold text-gray-800">{user.fullName}</h3>
                <p className="text-sm text-gray-600">@{user.username}</p>
                <span className="inline-block px-2 py-1 text-xs bg-teal-100 text-teal-800 rounded-full mt-1">
                  {user.role === 'admin' ? 'Admin' : user.role === 'author' ? 'Yazar' : 'Üye'}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            <Link 
              href="/dashboard" 
              className="flex items-center space-x-3 px-4 py-3 text-teal-600 bg-teal-50 rounded-lg font-medium"
            >
              <FileText className="w-5 h-5" />
              <span>Yazılarım</span>
            </Link>
            
            <Link 
              href="/dashboard/yeni-yazi" 
              className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Yeni Yazı</span>
            </Link>
            
            <Link 
              href="/dashboard/profil" 
              className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
            >
              <User className="w-5 h-5" />
              <span>Profil</span>
            </Link>
            
            <Link 
              href="/" 
              className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
            >
              <Eye className="w-5 h-5" />
              <span>Siteyi Gör</span>
            </Link>
          </nav>

          {/* Logout */}
          <div className="absolute bottom-6 left-6 right-6">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Çıkış Yap</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden text-gray-600 hover:text-gray-800"
                >
                  <Menu className="w-6 h-6" />
                </button>
                <h1 className="text-2xl font-bold text-gray-800">Yazılarım</h1>
              </div>
              
              <Link
                href="/dashboard/yeni-yazi"
                className="flex items-center space-x-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Yeni Yazı</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Toplam Yazı</p>
                  <p className="text-2xl font-bold text-gray-800">{user.postsCount}</p>
                </div>
                <FileText className="w-8 h-8 text-teal-600" />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Toplam Görüntülenme</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {userPosts.reduce((sum, post) => sum + post.views, 0)}
                  </p>
                </div>
                <Eye className="w-8 h-8 text-teal-600" />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Yayınlanan</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {userPosts.filter(post => post.status === 'published').length}
                  </p>
                </div>
                <Settings className="w-8 h-8 text-teal-600" />
              </div>
            </div>
          </div>

          {/* Posts List */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Son Yazılarım</h2>
            </div>
            
            <div className="p-6">
              {postsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              ) : userPosts.length > 0 ? (
                <div className="space-y-4">
                  {userPosts.map((post) => (
                    <div key={post._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-800">{post.title}</h3>
                            <span 
                              className={`px-2 py-1 text-xs rounded-full ${
                                post.status === 'published' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {post.status === 'published' ? 'Yayında' : 'Taslak'}
                            </span>
                            <span 
                              className="px-2 py-1 text-xs rounded-full text-white"
                              style={{ backgroundColor: post.category.color }}
                            >
                              {post.category.name}
                            </span>
                          </div>
                          
                          <p className="text-gray-600 mb-3 line-clamp-2">{post.excerpt}</p>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>{formatDate(post.createdAt)}</span>
                            <span className="flex items-center space-x-1">
                              <Eye className="w-4 h-4" />
                              <span>{post.views} görüntülenme</span>
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          {post.status === 'published' && (
                            <Link
                              href={`/yazi/${post.slug}`}
                              className="p-2 text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                              title="Görüntüle"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                          )}
                          
                          <Link
                            href={`/dashboard/duzenle/${post.slug}`}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Düzenle"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Link>
                          
                          <button
                            onClick={() => handleDeletePost(post._id, post.title)}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Sil"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    Henüz yazınız yok
                  </h3>
                  <p className="text-gray-500 mb-6">
                    İlk yazınızı yazarak BlogVerse topluluğuna katılın!
                  </p>
                  <Link
                    href="/dashboard/yeni-yazi"
                    className="inline-flex items-center space-x-2 bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors"
                  >
                    <PlusCircle className="w-5 h-5" />
                    <span>İlk Yazımı Yaz</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}