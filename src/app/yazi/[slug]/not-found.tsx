import Link from 'next/link';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-teal-50 flex items-center justify-center">
      <div className="text-center max-w-2xl mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-teal-200 mb-4">404</h1>
          <h2 className="text-4xl font-bold text-teal-800 mb-4">
            Aradığın Yazı Bulunamadı
          </h2>
          <p className="text-lg text-teal-600 mb-8">
            Üzgünüz, aradığınız blog yazısı mevcut değil veya kaldırılmış olabilir.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link 
            href="/"
            className="inline-flex items-center bg-teal-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-teal-700 transition-colors duration-300"
          >
            <Home className="w-4 h-4 mr-2" />
            Ana Sayfaya Dön
          </Link>
          
          <Link 
            href="/blog"
            className="inline-flex items-center border-2 border-teal-600 text-teal-600 px-6 py-3 rounded-full font-semibold hover:bg-teal-600 hover:text-white transition-colors duration-300"
          >
            <Search className="w-4 h-4 mr-2" />
            Tüm Yazıları Gör
          </Link>
        </div>
      </div>
    </div>
  );
}