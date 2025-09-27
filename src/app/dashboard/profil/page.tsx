'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Save, 
  Camera, 
  User, 
  Mail, 
  Calendar,
  FileText,
  Eye,
  Award,
  Settings,
  Upload
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

export default function ProfilePage() {
  const { user, loading, refreshUser } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const [profileData, setProfileData] = useState({
    fullName: '',
    bio: '',
    avatar: '',
    socialLinks: {
      twitter: '',
      instagram: '',
      linkedin: ''
    }
  });

  const [stats, setStats] = useState({
    totalViews: 0,
    publishedPosts: 0,
    draftPosts: 0,
    joinDate: ''
  });

  // Giriş kontrolü
  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  // Kullanıcı verilerini yükle
  useEffect(() => {
    if (user) {
      const newProfileData = {
        fullName: user.fullName || '',
        bio: user.bio || '',
        avatar: user.avatar || '',
        socialLinks: user.socialLinks || {
          twitter: '',
          instagram: '',
          linkedin: ''
        }
      };
      
      setProfileData(newProfileData);
      setAvatarPreview(user.avatar || '');
      fetchUserStats();
      
      console.log('Profil verileri yüklendi:', newProfileData);
    }
  }, [user]);

  const fetchUserStats = async () => {
    try {
      const response = await fetch('/api/auth/stats');
      
      // Response durumunu kontrol et
      if (!response.ok) {
        console.warn('Stats API bulunamadı, varsayılan değerler kullanılacak');
        // API yoksa varsayılan değerlerle devam et
        setStats({
          totalViews: 0,
          publishedPosts: 0,
          draftPosts: 0,
          joinDate: user?.createdAt || new Date().toISOString()
        });
        return;
      }

      const responseText = await response.text();
      if (!responseText.trim()) {
        console.warn('Stats API boş yanıt döndürdü');
        return;
      }

      // JSON parse kontrolü
      try {
        const data = JSON.parse(responseText);
        if (data.success && data.data) {
          setStats(data.data);
        }
      } catch (parseError) {
        console.warn('Stats API geçersiz JSON döndürdü');
      }
    } catch (error) {
      console.warn('Stats API\'ye ulaşılamadı:', error);
      // Hata durumunda varsayılan değerler
      setStats({
        totalViews: 0,
        publishedPosts: 0,
        draftPosts: 0,
        joinDate: user?.createdAt || new Date().toISOString()
      });
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Dosya türü kontrolü
      if (!file.type.startsWith('image/')) {
        setError('Lütfen sadece resim dosyası seçin');
        return;
      }

      // Dosya boyutu kontrolü (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Dosya boyutu 5MB\'dan küçük olmalıdır');
        return;
      }

      setSelectedFile(file);
      
      // Preview için FileReader kullan
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setAvatarPreview(result);
      };
      reader.readAsDataURL(file);
      
      setError('');
    }
  };

  const handleAvatarClick = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const removeAvatar = () => {
    setSelectedFile(null);
    setAvatarPreview('');
    setProfileData(prev => ({ ...prev, avatar: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = () => {
        reject(new Error('Dosya okunamadı'));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('social.')) {
      const socialKey = name.split('.')[1];
      setProfileData(prev => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [socialKey]: value
        }
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      let updatedProfileData = { ...profileData };

      // Eğer yeni bir avatar dosyası seçildiyse, Base64'e çevir
      if (selectedFile) {
        try {
          const avatarBase64 = await convertFileToBase64(selectedFile);
          updatedProfileData.avatar = avatarBase64;
        } catch (fileError) {
          setError('Avatar dosyası işlenirken hata oluştu');
          setIsSaving(false);
          return;
        }
      }

      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedProfileData),
      });

      // Response kontrolü
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Profile API Error:', {
          status: response.status,
          statusText: response.statusText,
          url: response.url,
          body: errorText.substring(0, 200) + '...'
        });
        
        if (response.status === 404) {
          throw new Error('Profil güncelleme servisi bulunamadı. Lütfen backend\'in çalıştığından emin olun.');
        } else if (response.status === 401) {
          throw new Error('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
        } else if (response.status >= 500) {
          throw new Error('Sunucu hatası. Lütfen daha sonra tekrar deneyin.');
        } else {
          throw new Error(`Beklenmeyen hata (${response.status})`);
        }
      }

      // JSON parse kontrolü
      let data;
      try {
        const responseText = await response.text();
        if (!responseText.trim()) {
          throw new Error('Sunucudan boş yanıt geldi');
        }
        
        // HTML döndürülüp döndürülmediğini kontrol et
        if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
          throw new Error('API endpoint HTML sayfası döndürdü. Backend konfigürasyonunu kontrol edin.');
        }

        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        throw new Error('Sunucu geçersiz yanıt döndürdü');
      }

      if (data.success) {
        setSuccess('Profil başarıyla güncellendi!');
        setIsEditing(false);
        setSelectedFile(null);
        
        // Local state'i de güncelle (anlık görünüm için)
        setProfileData(updatedProfileData);
        setAvatarPreview(updatedProfileData.avatar);
        
        // User context'i güncelle
        try {
          await refreshUser();
          console.log('Kullanıcı verileri güncellendi');
        } catch (refreshError) {
          console.warn('Kullanıcı verileri yenilenemedi:', refreshError);
          // Context güncellenemezse manuel olarak güncelle
          if (window.location) {
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          }
        }
        
        setTimeout(() => setSuccess(''), 5000);
      } else {
        setError(data.error || data.message || 'Profil güncellenemedi');
      }
    } catch (error: any) {
      console.error('Profile Update Error:', error);
      setError(error.message || 'Profil güncellenirken beklenmeyen bir hata oluştu');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSelectedFile(null);
    setAvatarPreview(user?.avatar || '');
    setError('');
    setSuccess('');
    
    // Form verilerini mevcut user verileriyle sıfırla
    if (user) {
      const resetData = {
        fullName: user.fullName || '',
        bio: user.bio || '',
        avatar: user.avatar || '',
        socialLinks: user.socialLinks || {
          twitter: '',
          instagram: '',
          linkedin: ''
        }
      };
      setProfileData(resetData);
      console.log('Form verileri sıfırlandı:', resetData);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Tarih bilinmiyor';
      }
      return date.toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long'
      });
    } catch (error) {
      return 'Tarih bilinmiyor';
    }
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
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="flex items-center text-gray-600 hover:text-teal-600 transition-colors">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-gray-800">Profil Ayarları</h1>
            </div>
            
            <div className="flex items-center space-x-3">
              {isEditing ? (
                <>
                  <button
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center space-x-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? 'Kaydediliyor...' : 'Kaydet'}</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                  <Settings className="w-4 h-4" />
                  <span>Düzenle</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto grid lg:grid-cols-3 gap-8">
          
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-center">
                {/* Avatar */}
                <div className="relative inline-block mb-4">
                  <div className="relative">
                    <img 
                      src={avatarPreview || '/images/default-avatar.jpg'} 
                      alt={profileData.fullName || 'Profil Fotoğrafı'}
                      className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-white shadow-lg"
                      onError={(e) => {
                        e.currentTarget.src = '/images/default-avatar.jpg';
                      }}
                    />
                    
                    {isEditing && (
                      <>
                        <button
                          onClick={handleAvatarClick}
                          className="absolute inset-0 w-24 h-24 rounded-full bg-black bg-opacity-50 flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity duration-200"
                          title="Fotoğraf değiştir"
                        >
                          <Camera className="w-6 h-6" />
                        </button>
                        
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                      </>
                    )}
                  </div>
                  
                  {isEditing && (
                    <div className="mt-2 space-x-2">
                      <button
                        onClick={handleAvatarClick}
                        className="inline-flex items-center px-3 py-1 text-xs bg-teal-100 text-teal-700 rounded-full hover:bg-teal-200 transition-colors"
                      >
                        <Upload className="w-3 h-3 mr-1" />
                        Değiştir
                      </button>
                      
                      {avatarPreview && (
                        <button
                          onClick={removeAvatar}
                          className="inline-flex items-center px-3 py-1 text-xs bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-colors"
                        >
                          Kaldır
                        </button>
                      )}
                    </div>
                  )}
                  
                  {selectedFile && (
                    <p className="text-xs text-gray-500 mt-1 truncate max-w-[200px] mx-auto">
                      Seçilen dosya: {selectedFile.name}
                    </p>
                  )}
                </div>

                <h2 className="text-xl font-bold text-gray-800 mb-1">{user.fullName || 'İsim Girilmemiş'}</h2>
                <p className="text-gray-600 mb-2">@{user.username}</p>
                <span className="inline-block px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm font-medium">
                  {user.role === 'admin' ? 'Admin' : user.role === 'author' ? 'Yazar' : 'Üye'}
                </span>
              </div>

              {/* Bio */}
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Hakkımda</h3>
                {isEditing ? (
                  <textarea
                    name="bio"
                    value={profileData.bio}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Kendiniz hakkında birkaç cümle yazın..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                    maxLength={500}
                  />
                ) : (
                  <p className="text-gray-600 text-sm">
                    {profileData.bio || 'Henüz bir bio eklenmemiş.'}
                  </p>
                )}
                {isEditing && (
                  <p className="text-xs text-gray-400 mt-1">
                    {profileData.bio.length}/500 karakter
                  </p>
                )}
              </div>

              {/* Join Date */}
              <div className="mt-4 flex items-center text-sm text-gray-500">
                <Calendar className="w-4 h-4 mr-2" />
                <span>{formatDate(stats.joinDate || user.createdAt || new Date().toISOString())} tarihinde katıldı</span>
              </div>
            </div>
          </div>

          {/* Profile Info & Stats */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Notifications */}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center">
                <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                {success}
              </div>
            )}
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center">
                <div className="w-4 h-4 bg-red-500 rounded-full mr-3"></div>
                {error}
              </div>
            )}

            {/* Personal Info */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Kişisel Bilgiler</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ad Soyad
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="fullName"
                      value={profileData.fullName}
                      onChange={handleChange}
                      placeholder="Adınız ve soyadınız"
                      maxLength={100}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  ) : (
                    <p className="text-gray-800">{user.fullName || 'Girilmemiş'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    E-posta
                  </label>
                  <p className="text-gray-600 flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    {user.email}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">E-posta adresinizi değiştiremezsiniz</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kullanıcı Adı
                  </label>
                  <p className="text-gray-600 flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    @{user.username}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Kullanıcı adınızı değiştiremezsiniz</p>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Sosyal Medya</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Twitter
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="social.twitter"
                      value={profileData.socialLinks.twitter}
                      onChange={handleChange}
                      placeholder="@kullaniciadin"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  ) : (
                    <p className="text-gray-600">
                      {profileData.socialLinks.twitter || 'Eklenmemiş'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Instagram
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="social.instagram"
                      value={profileData.socialLinks.instagram}
                      onChange={handleChange}
                      placeholder="@kullaniciadin"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  ) : (
                    <p className="text-gray-600">
                      {profileData.socialLinks.instagram || 'Eklenmemiş'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    LinkedIn
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="social.linkedin"
                      value={profileData.socialLinks.linkedin}
                      onChange={handleChange}
                      placeholder="linkedin.com/in/kullaniciadin"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  ) : (
                    <p className="text-gray-600">
                      {profileData.socialLinks.linkedin || 'Eklenmemiş'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">İstatistikler</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-teal-50 rounded-lg">
                  <FileText className="w-8 h-8 text-teal-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-800">{user.postsCount || 0}</p>
                  <p className="text-sm text-gray-600">Toplam Yazı</p>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Eye className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-800">{stats.totalViews}</p>
                  <p className="text-sm text-gray-600">Görüntülenme</p>
                </div>
                
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Award className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-800">{stats.publishedPosts}</p>
                  <p className="text-sm text-gray-600">Yayınlanan</p>
                </div>
                
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <Settings className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-800">{stats.draftPosts}</p>
                  <p className="text-sm text-gray-600">Taslak</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}