'use client';

import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  onUpload: (url: string) => void;
  currentImage?: string;
  className?: string;
  accept?: string;
}

export default function ImageUpload({ 
  onUpload, 
  currentImage, 
  className = '',
  accept = 'image/*'
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string>(currentImage || '');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setIsUploading(true);

    // Preview oluştur
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        onUpload(data.data.url);
        setPreview(data.data.url);
      } else {
        setError(data.error || 'Yükleme başarısız');
        setPreview(currentImage || '');
      }
    } catch (error) {
      setError('Bağlantı hatası');
      setPreview(currentImage || '');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview('');
    onUpload('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`relative ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />

      {preview ? (
        <div className="relative group">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
            <div className="flex space-x-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-4 py-2 bg-white text-gray-800 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                <Upload className="w-4 h-4 mr-2 inline" />
                Değiştir
              </button>
              <button
                onClick={handleRemove}
                disabled={isUploading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                <X className="w-4 h-4 mr-2 inline" />
                Kaldır
              </button>
            </div>
          </div>
          {isUploading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 rounded-lg flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg hover:border-teal-500 transition-colors flex flex-col items-center justify-center text-gray-500 hover:text-teal-600 disabled:opacity-50"
        >
          {isUploading ? (
            <>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mb-2"></div>
              <span>Yükleniyor...</span>
            </>
          ) : (
            <>
              <ImageIcon className="w-12 h-12 mb-2" />
              <span className="text-lg font-medium">Görsel Yükle</span>
              <span className="text-sm">JPG, PNG, GIF (max 5MB)</span>
            </>
          )}
        </button>
      )}

      {error && (
        <div className="mt-2 text-red-600 text-sm bg-red-50 p-2 rounded">
          {error}
        </div>
      )}
    </div>
  );
}