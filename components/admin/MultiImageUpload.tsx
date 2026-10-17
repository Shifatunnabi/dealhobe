'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';

interface MultiImageUploadProps {
  images: { url: string; publicId: string }[];
  onChange: (images: { url: string; publicId: string }[]) => void;
  folder?: string;
  label?: string;
}

const readAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

export default function MultiImageUpload({
  images,
  onChange,
  folder = 'dealhobe',
  label = 'Upload Images'
}: MultiImageUploadProps) {
  const [pending, setPending] = useState(0);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);

  // Uploads finish after the render that started them, so read the latest
  // images/onChange from refs instead of the stale closure.
  const imagesRef = useRef(images);
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    imagesRef.current = images;
    onChangeRef.current = onChange;
  }, [images, onChange]);

  const uploadOne = useCallback(async (file: File) => {
    const base64 = await readAsDataUrl(file);
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: base64, folder }),
    });
    const data = await res.json();
    if (!res.ok || !data.url) throw new Error(data.error || 'Upload failed');
    return { url: data.url as string, publicId: data.publicId as string };
  }, [folder]);

  const handleFiles = useCallback(async (fileList: FileList | File[]) => {
    const all = Array.from(fileList);
    const files = all.filter(f => f.type.startsWith('image/'));
    if (all.length > files.length) toast.error('Only image files can be uploaded');
    if (!files.length) return;

    setPending(p => p + files.length);
    // Upload in parallel but keep the dropped order.
    const results = await Promise.all(
      files.map(async (file) => {
        try {
          return await uploadOne(file);
        } catch (err) {
          toast.error(`${file.name}: ${err instanceof Error ? err.message : 'Upload failed'}`);
          return null;
        } finally {
          setPending(p => p - 1);
        }
      })
    );
    const uploaded = results.filter((r): r is { url: string; publicId: string } => r !== null);
    if (uploaded.length) onChangeRef.current([...imagesRef.current, ...uploaded]);
  }, [uploadOne]);

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    onChange(newImages);
  };

  const hasFiles = (e: React.DragEvent) => Array.from(e.dataTransfer?.types || []).includes('Files');

  const onDragEnter = (e: React.DragEvent) => {
    if (!hasFiles(e)) return;
    e.preventDefault();
    dragDepth.current += 1;
    setDragging(true);
  };
  const onDragOver = (e: React.DragEvent) => {
    if (!hasFiles(e)) return;
    e.preventDefault(); // required to allow drop
    e.dataTransfer.dropEffect = 'copy';
  };
  const onDragLeave = (e: React.DragEvent) => {
    if (!hasFiles(e)) return;
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) setDragging(false);
  };
  const onDrop = (e: React.DragEvent) => {
    if (!hasFiles(e)) return;
    e.preventDefault();
    dragDepth.current = 0;
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="admin-field">
      <label className="admin-label">{label}</label>
      <div
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}
      >
        {(images.length > 0 || pending > 0) && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {images.map((img, i) => (
              <div key={img.url + i} style={{ position: 'relative', width: 100, height: 100, border: '1px solid #ccc', borderRadius: 8, overflow: 'hidden' }}>
                <Image src={img.url} alt="Uploaded" fill style={{ objectFit: 'cover' }} />
                <button
                   type="button"
                   onClick={() => removeImage(i)}
                   style={{ position: 'absolute', top: 2, right: 2, background: 'red', color: 'white', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: 'none' }}
                >×</button>
              </div>
            ))}
            {Array.from({ length: pending }).map((_, i) => (
              <div key={`pending-${i}`} style={{ width: 100, height: 100, border: '2px dashed #ccc', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="spinner" style={{ width: 20, height: 20 }} />
              </div>
            ))}
          </div>
        )}
        <div
           onClick={() => inputRef.current?.click()}
           style={{
             width: '100%', boxSizing: 'border-box', minHeight: 120, padding: '1.25rem 1rem',
             display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
             cursor: 'pointer', textAlign: 'center', borderRadius: 10,
             border: `2px dashed ${dragging ? '#2563eb' : '#ccc'}`,
             background: dragging ? 'rgba(37, 99, 235, 0.06)' : 'transparent',
             color: dragging ? '#2563eb' : '#888',
             transition: 'background 0.15s, border-color 0.15s, color 0.15s',
           }}
        >
          <span style={{ fontSize: '2rem', lineHeight: 1 }}>+</span>
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
            {dragging ? 'Drop to upload' : 'Drag & drop images here, or click to browse'}
          </span>
          <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>You can select or drop multiple images</span>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={e => {
          if (e.target.files?.length) handleFiles(e.target.files);
          e.target.value = ''; // allow re-selecting the same file
        }}
      />
    </div>
  );
}
