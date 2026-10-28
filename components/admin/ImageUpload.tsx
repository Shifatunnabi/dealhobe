'use client';

import { useState, useRef, useCallback } from 'react';
import { FiUploadCloud } from 'react-icons/fi';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { uploadImageFile } from '@/lib/upload-image-client';

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
      const data = await uploadImageFile(file, folder);
      onChange(data.url, data.publicId);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
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
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inputRef.current?.click(); } }}
        role="button"
        tabIndex={0}
        aria-label={value ? `${label}: change image` : `${label}: upload image`}
      >
        {uploading ? (
          <div className="upload-loader">
            <div className="spinner" />
            <span>Uploading...</span>
          </div>
        ) : value ? (
          <div className="image-preview-wrapper">
            {/* contain: show the whole upload at its real aspect ratio, never cropped or stretched */}
            <Image src={value} alt="Preview" fill sizes="(max-width: 640px) 100vw, 600px" style={{ objectFit: 'contain' }} />
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
