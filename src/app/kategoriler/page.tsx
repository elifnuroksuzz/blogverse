import Link from 'next/link';
import { Menu } from 'lucide-react';
import connectToDatabase from '@/lib/mongodb';
import Category from '@/lib/models/Category';

interface CategoryData {
  _id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  image: string;
  postCount: number;
}

// Kategorileri getir
async function getCategories(): Promise<CategoryData[]> {
  try {
    await connectToDatabase();
    
    const categories = await Category.find({ 
      isActive: true 
    }).sort({ name: 1 }).lean() as any[];

    return categories.map(cat => ({
      _id: cat._id.toString(),
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      color: cat.color,
      image: cat.image,
      postCount: cat.postCount
    }));
  } catch (error) {
    console.error('Kategoriler getirilemedi:', error);
    return [];
  }
}

export default async function CategoriesPage() {
  const categories = await getCategories();

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
            <Link href="/kategoriler" className="text-teal-600 hover:text-teal-700 transition duration-300 font-semibold">Kategoriler</Link>
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
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-extrabold text-teal-800 mb-4">
            Neler Var Neler?
          </h1>
          <p className="text-xl text-teal-600 font-light">
            İlgini Çeken Konuya Işınlan!
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category, index) => (
            <Link 
              key={category._id}
              href={`/kategori/${category.slug}`}
              className="group relative rounded-xl overflow-hidden hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="h-64 overflow-hidden">
                <img 
                  src={category.image} 
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              
              <div className="absolute inset-0 bg-black bg-opacity-60 group-hover:bg-opacity-70 transition-all duration-300 flex flex-col items-center justify-center p-6 text-center">
                <h2 className="text-4xl font-bold text-white mb-2 group-hover:scale-105 transition-transform duration-300">
                  {category.name}
                </h2>
                <p className="text-gray-200 text-sm mb-4 opacity-90">
                  {category.description}
                </p>
                <div className="flex items-center space-x-4 text-sm text-gray-300">
                  <span>{category.postCount} yazı</span>
                  <span 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  ></span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Back to Home */}
        <div className="text-center mt-16">
          <Link 
            href="/"
            className="inline-block bg-teal-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-teal-700 transition-colors duration-300 hover:scale-105 transform"
          >
            Ana Sayfaya Dön
          </Link>
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