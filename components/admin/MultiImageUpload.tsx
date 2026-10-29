'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { FiUploadCloud } from 'react-icons/fi';
import { uploadImageFile } from '@/lib/upload-image-client';

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
    return uploadImageFile(file, folder);
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
        className="multi-upload"
      >
        {(images.length > 0 || pending > 0) && (
          <div className="multi-upload-grid">
            {images.map((img, i) => (
              <div key={img.url + i} className="multi-upload-thumb">
                <Image src={img.url} alt={`Image ${i + 1}`} fill sizes="120px" style={{ objectFit: 'cover' }} />
                {i === 0 && <span className="is-cover">Cover</span>}
                <button
                   type="button"
                   className="multi-upload-remove"
                   onClick={() => removeImage(i)}
                   aria-label={`Remove image ${i + 1}`}
                >×</button>
              </div>
            ))}
            {Array.from({ length: pending }).map((_, i) => (
              <div key={`pending-${i}`} className="multi-upload-thumb is-pending">
                <div className="spinner" style={{ width: 20, height: 20 }} />
              </div>
            ))}
          </div>
        )}
        <button
           type="button"
           onClick={() => inputRef.current?.click()}
           className={`multi-upload-drop ${dragging ? 'is-dragging' : ''}`}
        >
          <FiUploadCloud size={26} aria-hidden="true" />
          <strong>
            {dragging ? 'Drop to upload' : 'Drag & drop images here, or click to browse'}
          </strong>
          <small>You can select or drop multiple images</small>
        </button>
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
