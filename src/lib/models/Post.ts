import mongoose, { Schema, Document } from 'mongoose';

export interface IPost extends Document {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage: string;
  category: {
    _id: string;
    name: string;
    slug: string;
    color: string;
  };
  tags: string[];
  author: {
    name: string;
    avatar: string;
  };
  status: 'draft' | 'published' | 'archived';
  views: number;
  isFeatured: boolean;
  metaTitle?: string;
  metaDescription?: string;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new Schema<IPost>({
  title: {
    type: String,
    required: [true, 'Başlık gerekli'],
    trim: true,
    maxlength: [255, 'Başlık çok uzun']
  },
  slug: {
    type: String,
    required: [true, 'Slug gerekli'],
    unique: true,
    lowercase: true,
    trim: true
  },
  content: {
    type: String,
    required: [true, 'İçerik gerekli']
  },
  excerpt: {
    type: String,
    required: [true, 'Özet gerekli'],
    maxlength: [300, 'Özet çok uzun']
  },
  featuredImage: {
    type: String,
    required: [true, 'Öne çıkan görsel gerekli']
  },
  category: {
    _id: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    slug: {
      type: String,
      required: true
    },
    color: {
      type: String,
      required: true
    }
  },
  tags: [{
    type: String,
    trim: true
  }],
  author: {
    _id: {
      type: String,
      required: true
    },
    username: {
      type: String,
      required: true
    },
    fullName: {
      type: String,
      required: true
    },
    avatar: {
      type: String,
      default: '/images/default-avatar.jpg'
    }
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  views: {
    type: Number,
    default: 0
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  metaTitle: {
    type: String,
    maxlength: [60, 'Meta başlık çok uzun']
  },
  metaDescription: {
    type: String,
    maxlength: [160, 'Meta açıklama çok uzun']
  },
  publishedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index'ler - performans için
PostSchema.index({ slug: 1 });
PostSchema.index({ status: 1, publishedAt: -1 });
PostSchema.index({ 'category.slug': 1 });
PostSchema.index({ isFeatured: 1 });

export default mongoose.models.Post || mongoose.model<IPost>('Post', PostSchema);