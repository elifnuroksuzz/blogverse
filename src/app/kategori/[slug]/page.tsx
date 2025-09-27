import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Menu } from 'lucide-react';
import connectToDatabase from '@/lib/mongodb';
import Category from '@/lib/models/Category';
import Post from '@/lib/models/Post';

interface CategoryData {
  _id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  image: string;
  postCount: number;
}

interface PostData {
  _id: string;
  title: string;
  excerpt: string;
  slug: string;
  featuredImage: string;
  views: number;
  publishedAt: string;
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Kategori ve yazılarını getir
async function getCategoryWithPosts(slug: string): Promise<{ category: CategoryData; posts: PostData[] } | null> {
  try {
    await connectToDatabase();
    
    // Kategoriyi bul
    const category = await Category.findOne({ 
      slug: slug,
      isActive: true 
    }).lean() as any;

    if (!category) {
      return null;
    }

    // Kategoriye ait yazıları bul
    const posts = await Post.find({ 
      'category.slug': slug,
      status: 'published' 
    })
    .sort({ publishedAt: -1, createdAt: -1 })
    .lean() as any[];

    return {
      category: {
        _id: category._id.toString(),
        name: category.name,
        slug: category.slug,
        description: category.description,
        color: category.color,
        image: category.image,
        postCount: category.postCount
      },
      posts: posts.map(post => ({
        _id: post._id.toString(),
        title: post.title,
        excerpt: post.excerpt,
        slug: post.slug,
        featuredImage: post.featuredImage,
        views: post.views,
        publishedAt: post.publishedAt?.toISOString() || post.createdAt.toISOString()
      }))
    };
  } catch (error) {
    console.error('Kategori getirilemedi:', error);
    return null;
  }
}

// Metadata için
export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const data = await getCategoryWithPosts(slug);
  
  if (!data) {
    return {
      title: 'Kategori Bulunamadı - BlogVerse',
      description: 'Aradığınız kategori bulunamadı.'
    };
  }

  return {
    title: `${data.category.name} - BlogVerse`,
    description: data.category.description,
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getCategoryWithPosts(slug);

  if (!data) {
    notFound();
  }

  const { category, posts } = data;

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
            <Link href="/blog" className="text-gray-600 hover:text-teal-600 transition duration-300">Trend Yazılar</Link>
            <Link href="/iletisim" className="text-gray-600 hover:text-teal-600 transition duration-300">İletişim</Link>
          </nav>
          
          <button className="md:hidden text-teal-700">
            <Menu className="w-7 h-7" />
          </button>
        </div>
      </header>

      {/* Category Hero */}
      <div 
        className="relative h-64 md:h-80 bg-cover bg-center"
        style={{ backgroundImage: `url(${category.image})` }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-60"></div>
        <div className="relative h-full flex items-center justify-center text-center px-6">
          <div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4">
              {category.name}
            </h1>
            <p className="text-xl text-gray-200 max-w-2xl">
              {category.description}
            </p>
            <div className="mt-4 flex items-center justify-center space-x-4 text-gray-300">
              <span>{category.postCount} yazı</span>
              <span 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: category.color }}
              ></span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        {/* Back Button */}
        <div className="mb-8">
          <Link 
            href="/kategoriler"
            className="inline-flex items-center text-teal-600 hover:text-teal-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Tüm Kategoriler
          </Link>
        </div>

        {/* Posts */}
        {posts.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, index) => (
              <article 
                key={post._id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
                style={{ animationDelay: `${index * 150}ms` }}
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
                    style={{ color: category.color }}
                  >
                    {category.name}
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
              Bu kategoride henüz yazı yok
            </h3>
            <p className="text-gray-500 mb-8">
              Çok yakında harika içeriklerle burada olacağız!
            </p>
            <Link 
              href="/kategoriler"
              className="inline-block bg-teal-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-teal-700 transition-colors"
            >
              Diğer Kategorileri Gör
            </Link>
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