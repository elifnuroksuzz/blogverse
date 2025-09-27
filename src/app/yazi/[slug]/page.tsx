import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, Eye, Tag } from 'lucide-react';
import connectToDatabase from '@/lib/mongodb';
import Post from '@/lib/models/Post';

interface BlogPost {
  _id: string;
  title: string;
  content: string;
  excerpt: string;
  featuredImage: string;
  category: {
    name: string;
    color: string;
    slug: string;
  };
  tags: string[];
  author: {
    name: string;
    avatar: string;
  };
  views: number;
  publishedAt: string;
  metaTitle?: string;
  metaDescription?: string;
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Blog yazısını getir
async function getBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    await connectToDatabase();
    
    const post = await Post.findOne({ 
      slug: slug,
      status: 'published' 
    }).lean() as any;

    if (!post) {
      return null;
    }

    // Görüntülenme sayısını artır
    await Post.findByIdAndUpdate(post._id, { 
      $inc: { views: 1 } 
    });

    return {
      _id: post._id.toString(),
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      featuredImage: post.featuredImage,
      category: post.category,
      tags: post.tags || [],
      author: post.author,
      views: post.views + 1,
      publishedAt: post.publishedAt?.toISOString() || post.createdAt.toISOString(),
      metaTitle: post.metaTitle,
      metaDescription: post.metaDescription
    };
  } catch (error) {
    console.error('Blog post getirilemedi:', error);
    return null;
  }
}

// Metadata için
export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  
  if (!post) {
    return {
      title: 'Yazı Bulunamadı - BlogVerse',
      description: 'Aradığınız blog yazısı bulunamadı.'
    };
  }

  return {
    title: post.metaTitle || `${post.title} - BlogVerse`,
    description: post.metaDescription || post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.featuredImage],
      type: 'article',
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    notFound();
  }

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
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link 
            href="/"
            className="inline-flex items-center text-teal-600 hover:text-teal-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Ana Sayfaya Dön
          </Link>
        </div>

        {/* Article */}
        <article className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Featured Image */}
          <div className="h-64 md:h-96 overflow-hidden">
            <img 
              src={post.featuredImage} 
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Article Content */}
          <div className="p-8 md:p-12">
            {/* Category */}
            <div className="mb-4">
              <span 
                className="inline-block px-3 py-1 rounded-full text-sm font-semibold text-white"
                style={{ backgroundColor: post.category.color }}
              >
                {post.category.name}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
              {post.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-8 pb-6 border-b border-gray-200">
              <div className="flex items-center">
                <img 
                  src={post.author.avatar} 
                  alt={post.author.name}
                  className="w-8 h-8 rounded-full mr-2"
                />
                <span className="font-medium">{post.author.name}</span>
              </div>
              
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                <span>{formatDate(post.publishedAt)}</span>
              </div>
              
              <div className="flex items-center">
                <Eye className="w-4 h-4 mr-1" />
                <span>{post.views} görüntülenme</span>
              </div>
            </div>

            {/* Content */}
            <div 
              className="prose prose-lg prose-teal max-w-none"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="mt-12 pt-8 border-t border-gray-200">
                <div className="flex items-center flex-wrap gap-2">
                  <Tag className="w-4 h-4 text-gray-500 mr-2" />
                  {post.tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="inline-block bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </article>

        {/* Back to Home */}
        <div className="text-center mt-12">
          <Link 
            href="/"
            className="inline-block bg-teal-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-teal-700 transition-colors duration-300 hover:scale-105 transform"
          >
            Daha Fazla Yazı İçin Ana Sayfa
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