'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';

interface MultiImageUploadProps {
  images: { url: string; publicId: string }[];
  onChange: (images: { url: string; publicId: string }[]) => void;
  folder?: string;
  label?: string;
}

export default function MultiImageUpload({
  images,
  onChange,
  folder = 'dealhobe',
  label = 'Upload Images'
}: MultiImageUploadProps) {
  const [uploading, setUploading] = useState(false);
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
        if (data.url) {
          onChange([...images, { url: data.url, publicId: data.publicId }]);
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setUploading(false);
    }
  }, [folder, images, onChange]);

  const removeImage = (index: number) => {
      const newImages = [...images];
      newImages.splice(index, 1);
      onChange(newImages);
  };

  return (
    <div className="admin-field">
      <label className="admin-label">{label}</label>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {images.map((img, i) => (
          <div key={i} style={{ position: 'relative', width: 100, height: 100, border: '1px solid #ccc', borderRadius: 8, overflow: 'hidden' }}>
            <Image src={img.url} alt="Uploaded" fill style={{ objectFit: 'cover' }} />
            <button
               type="button"
               onClick={() => removeImage(i)}
               style={{ position: 'absolute', top: 2, right: 2, background: 'red', color: 'white', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: 'none' }}
            >×</button>
          </div>
        ))}
        {uploading && (
             <div style={{ width: 100, height: 100, border: '2px dashed #ccc', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <div className="spinner" style={{ width: 20, height: 20 }} />
             </div>
        )}
        <div
           onClick={() => inputRef.current?.click()}
           style={{ width: 100, height: 100, border: '2px dashed #ccc', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '2rem', color: '#ccc' }}
        >
          +
        </div>
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
