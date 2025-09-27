'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, Send, Mail, MessageCircle, CheckCircle } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setIsSubmitted(true);
        setFormData({ name: '', email: '', message: '' });
      } else {
        setError(data.error || 'Bir hata oluştu. Lütfen tekrar deneyin.');
      }
    } catch (error) {
      setError('Bağlantı hatası. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
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
            <Link href="/blog" className="text-gray-600 hover:text-teal-600 transition duration-300">Trend Yazılar</Link>
            <Link href="/iletisim" className="text-teal-600 hover:text-teal-700 transition duration-300 font-semibold">İletişim</Link>
          </nav>
          
          <button className="md:hidden text-teal-700">
            <Menu className="w-7 h-7" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-extrabold text-teal-800 mb-4">
              Bize Yaz!
            </h1>
            <p className="text-xl text-teal-600 font-light">
              Fikirlerin, soruların veya sadece bir "selam" için buradayız!
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              {isSubmitted ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    Mesajın Alındı!
                  </h3>
                  <p className="text-gray-600 mb-6">
                    En kısa sürede dönüş yapacağız. Teşekkürler!
                  </p>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="text-teal-600 hover:text-teal-700 font-semibold"
                  >
                    Yeni Mesaj Gönder
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Adın
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Adını buraya yaz..."
                      className="w-full px-4 py-3 bg-teal-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      E-posta Adresin
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="e-postan@example.com"
                      className="w-full px-4 py-3 bg-teal-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Mesajın
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      placeholder="Aklındakileri dökül..."
                      className="w-full px-4 py-3 bg-teal-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>

                  {error && (
                    <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                      {error}
                    </div>
                  )}
                  
                  <div className="text-center">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center justify-center py-3 px-8 border border-transparent shadow-lg text-base font-bold rounded-full text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Gönderiliyor...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Gönder Gelsin!
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Contact Info */}
            <div className="space-y-8">
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <MessageCircle className="w-6 h-6 mr-2 text-teal-600" />
                  İletişim Yolları
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Mail className="w-5 h-5 text-teal-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-800">E-posta</p>
                      <p className="text-gray-600">elifnuroksuz4@gmail.com</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  Hızlı İpuçları
                </h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-teal-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Yazı önerilerini çok severiz!</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-teal-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Teknik sorunlar için detaylı açıklama yapın</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-teal-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Geri dönüş süresi genellikle 24 saattir</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-teal-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Sadece selam demek de çok güzel!</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
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