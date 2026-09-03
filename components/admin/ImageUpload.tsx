'use client';

import { useState, useRef, useCallback } from 'react';
import { FiUploadCloud } from 'react-icons/fi';
import Image from 'next/image';

interface ImageUploadProps {
  value?: string;         // current image URL (from Cloudinary)
  onChange: (url: string, publicId: string) => void;
  folder?: string;
  label?: string;
  className?: string;
}

export default function ImageUpload({
  value,
  onChange,
  folder = 'dealhobe',
  label = 'Upload Image',
  className = '',
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver]   = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const res    = await fetch('/api/upload', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ data: base64, folder }),
        });
        const data = await res.json();
        if (data.url) onChange(data.url, data.publicId);
      };
      reader.readAsDataURL(file);
    } finally {
      setUploading(false);
    }
  }, [folder, onChange]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className={`image-upload-field ${className}`}>
      <label className="admin-label">{label}</label>
      <div
        className={`image-drop-zone ${dragOver ? 'drag-over' : ''} ${value ? 'has-image' : ''}`}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? (
          <div className="upload-loader">
            <div className="spinner" />
            <span>Uploading...</span>
          </div>
        ) : value ? (
          <div className="image-preview-wrapper">
            <Image src={value} alt="Preview" fill style={{ objectFit: 'cover' }} />
            <div className="image-overlay">
              <span>Click to change</span>
            </div>
          </div>
        ) : (
          <div className="upload-placeholder">
            <div className="upload-icon"><FiUploadCloud size={28} /></div>
            <p>Drag & drop or <span>browse</span></p>
            <p className="upload-hint">PNG, JPG, WEBP up to 10MB</p>
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={e => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
    </div>
  );
}
