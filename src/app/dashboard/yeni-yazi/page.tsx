'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Eye, Send } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

import ImageUpload from '@/components/ImageUpload';

interface Category {
  _id: string;
  name: string;
  slug: string;
  color: string;
}

export default function NewPostPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    categoryId: '',
    tags: '',
    featuredImage: ''
  });
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Giriş kontrolü
  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  // Kategorileri yükle
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories?active=true');
      const data = await response.json();
      if (data.success) {
        setCategories(data.data.categories);
      }
    } catch (error) {
      console.error('Kategoriler yüklenemedi:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (status: 'draft' | 'published') => {
    if (!formData.title || !formData.content || !formData.excerpt || !formData.categoryId) {
      setError('Başlık, içerik, özet ve kategori gerekli');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/posts/my', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
          status
        }),
      });

      const data = await response.json();

      if (data.success) {
        router.push('/dashboard');
      } else {
        setError(data.error || 'Yazı kaydedilemedi');
      }
    } catch (error) {
      setError('Bağlantı hatası');
    } finally {
      setIsSubmitting(false);
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
                Dashboard'a Dön
              </Link>
              <h1 className="text-2xl font-bold text-gray-800">Yeni Yazı</h1>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleSubmit('draft')}
                disabled={isSubmitting}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>Taslak Kaydet</span>
              </button>
              
              <button
                onClick={() => handleSubmit('published')}
                disabled={isSubmitting}
                className="flex items-center space-x-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>Yayınla</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            {error && (
              <div className="mb-6 text-red-600 bg-red-50 p-4 rounded-lg">
                {error}
              </div>
            )}

            <div className="space-y-6">
              {/* Başlık */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Yazı Başlığı *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Başlığınızı buraya yazın..."
                  className="w-full px-4 py-3 text-xl border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  required
                />
              </div>

              {/* Kategori ve Etiketler */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-2">
                    Kategori *
                  </label>
                  <select
                    id="categoryId"
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    required
                  >
                    <option value="">Kategori seçin</option>
                    {categories.map(category => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                    Etiketler
                  </label>
                  <input
                    type="text"
                    id="tags"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="etiket1, etiket2, etiket3"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
              </div>

              {/* Özet */}
              <div>
                <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-2">
                  Yazı Özeti *
                </label>
                <textarea
                  id="excerpt"
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Yazınızın kısa bir özetini buraya yazın..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  {formData.excerpt.length}/300 karakter
                </p>
              </div>

              {/* İçerik */}
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                  Yazı İçeriği *
                </label>
                <textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  rows={20}
                  placeholder="Yazınızın içeriğini buraya yazın... HTML etiketleri kullanabilirsiniz."
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  HTML etiketleri desteklenir: &lt;h3&gt;, &lt;p&gt;, &lt;strong&gt;, &lt;em&gt;
                </p>
              </div>

              {/* Öne Çıkan Görsel */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Öne Çıkan Görsel
                </label>
                <ImageUpload
                  onUpload={(url) => setFormData(prev => ({ ...prev, featuredImage: url }))}
                  currentImage={formData.featuredImage}
                  className="mb-4"
                />
                <p className="text-sm text-gray-500">
                  Yazınız için bir kapak görseli yükleyin veya URL girin
                </p>
                
                {/* Manuel URL girişi */}
                <div className="mt-3">
                  <input
                    type="url"
                    name="featuredImage"
                    value={formData.featuredImage}
                    onChange={handleChange}
                    placeholder="Veya görsel URL'si girin: https://example.com/image.jpg"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-end">
              <button
                onClick={() => handleSubmit('draft')}
                disabled={isSubmitting}
                className="flex items-center justify-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>Taslak Olarak Kaydet</span>
              </button>
              
              <button
                onClick={() => handleSubmit('published')}
                disabled={isSubmitting}
                className="flex items-center justify-center space-x-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Kaydediliyor...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Yayınla</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}