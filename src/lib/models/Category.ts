import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  slug: string;
  description: string;
  color: string;
  image: string;
  postCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>({
  name: {
    type: String,
    required: [true, 'Kategori adı gerekli'],
    trim: true,
    maxlength: [100, 'Kategori adı çok uzun']
  },
  slug: {
    type: String,
    required: [true, 'Slug gerekli'],
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Açıklama gerekli'],
    maxlength: [500, 'Açıklama çok uzun']
  },
  color: {
    type: String,
    required: [true, 'Renk kodu gerekli'],
    match: [/^#[0-9a-fA-F]{6}$/, 'Geçerli hex renk kodu girin']
  },
  image: {
    type: String,
    required: [true, 'Kategori görseli gerekli']
  },
  postCount: {
    type: Number,
    default: 0,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index'ler
CategorySchema.index({ slug: 1 });
CategorySchema.index({ isActive: 1 });

export default mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);