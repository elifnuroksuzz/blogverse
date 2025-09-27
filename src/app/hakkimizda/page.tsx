import Link from 'next/link';
import { Menu, Heart, Target, Users } from 'lucide-react';

export default function AboutPage() {
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
            <Link href="/hakkimizda" className="text-teal-600 hover:text-teal-700 transition duration-300 font-semibold">Biz Kimiz?</Link>
            <Link href="/kategoriler" className="text-gray-600 hover:text-teal-600 transition duration-300">Kategoriler</Link>
            <Link href="/blog" className="text-gray-600 hover:text-teal-600 transition duration-300">Trend Yazılar</Link>
            <Link href="/iletisim" className="text-gray-600 hover:text-teal-600 transition duration-300">İletişim</Link>
          </nav>
          
          <button className="md:hidden text-teal-700">
            <Menu className="w-7 h-7" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h1 className="text-5xl font-extrabold text-teal-800 mb-6">
            Biz Kimiz?
          </h1>
          <p className="text-xl text-teal-600 font-light max-w-3xl mx-auto">
            Merak Eden, Araştıran ve Paylaşan Bir Ekip!
          </p>
        </section>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 mb-12">
            <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
              <p className="text-xl leading-relaxed">
                Biz, aklındakileri ve keşfettiklerini seninle paylaşmak için sabırsızlanan bir grup genciz. Trendleri takip ediyor, oyun dünyasını didik didik ediyor, en iyi filmleri listeliyor ve bazen de ders çalışma tüyoları veriyoruz. Kısacası, bizim de keyif aldığımız her şeyi seninle paylaşıyoruz.
              </p>
              
              <p className="text-lg leading-relaxed">
                Amacımız, sıkıcı bilgilerle dolu bir ansiklopedi olmak değil; sanki en yakın arkadaşınla sohbet ediyormuşsun gibi hissedeceğin, samimi ve faydalı içerikler oluşturmak. Bu yolculukta bize katıldığın için çok mutluyuz!
              </p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow duration-300">
              <Heart className="w-12 h-12 text-teal-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-3">Samimi İçerik</h3>
              <p className="text-gray-600">
                Arkadaş gibi, sıcak ve samimi bir dille yazıyoruz. Hiç yabancılık çekmeyeceksin!
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow duration-300">
              <Target className="w-12 h-12 text-teal-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-3">Güncel Trendler</h3>
              <p className="text-gray-600">
                En yeni trendleri takip ediyor, önemli olanları seninle paylaşıyoruz.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow duration-300">
              <Users className="w-12 h-12 text-teal-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-3">Topluluk</h3>
              <p className="text-gray-600">
                Sadece yazan değil, dinleyen de ekibiz. Görüşlerini hep merak ediyoruz!
              </p>
            </div>
          </div>

          {/* Call to Action */}
          <div className="bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl shadow-lg p-8 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Birlikte Büyüyelim!</h2>
            <p className="text-xl mb-6">
              Fikirlerini, önerilerini ve sorularını bizimle paylaş. BlogVerse senin de evin!
            </p>
            <Link 
              href="/iletisim"
              className="inline-block bg-white text-teal-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors duration-300 hover:scale-105 transform"
            >
              Hemen İletişime Geç
            </Link>
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