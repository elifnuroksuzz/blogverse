import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  fullName: string;
  avatar?: string;
  bio?: string;
  role: 'user' | 'author' | 'admin';
  isActive: boolean;
  emailVerified: boolean;
  postsCount: number;
  followersCount: number;
  followingCount: number;
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
  username: {
    type: String,
    required: [true, 'Kullanıcı adı gerekli'],
    unique: true,
    trim: true,
    lowercase: true,
    minlength: [3, 'Kullanıcı adı en az 3 karakter olmalı'],
    maxlength: [30, 'Kullanıcı adı en fazla 30 karakter olabilir'],
    match: [/^[a-zA-Z0-9_-]+$/, 'Kullanıcı adı sadece harf, rakam, - ve _ içerebilir']
  },
  email: {
    type: String,
    required: [true, 'E-posta gerekli'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Geçerli e-posta adresi girin']
  },
  password: {
    type: String,
    required: [true, 'Şifre gerekli'],
    minlength: [6, 'Şifre en az 6 karakter olmalı']
  },
  fullName: {
    type: String,
    required: [true, 'Ad soyad gerekli'],
    trim: true,
    maxlength: [100, 'Ad soyad çok uzun']
  },
  avatar: {
    type: String,
    default: '/images/default-avatar.jpg'
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio çok uzun']
  },
  role: {
    type: String,
    enum: ['user', 'author', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  postsCount: {
    type: Number,
    default: 0
  },
  followersCount: {
    type: Number,
    default: 0
  },
  followingCount: {
    type: Number,
    default: 0
  },
  socialLinks: {
    twitter: {
      type: String,
      trim: true
    },
    instagram: {
      type: String,
      trim: true
    },
    linkedin: {
      type: String,
      trim: true
    }
  },
  lastLoginAt: Date
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      if (ret.password) delete ret.password;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Password hash middleware
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Password comparison method
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Virtual for display name
UserSchema.virtual('displayName').get(function() {
  return this.fullName || this.username;
});

// Indexes
UserSchema.index({ username: 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ isActive: 1 });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);