'use client';

import { useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { FiUploadCloud } from 'react-icons/fi';

export type UploadedMedia = { url: string; publicId: string; width?: number; height?: number };

const MAX_MB = 40;

/** Uploads an image, animated GIF/WebP or MP4 straight to Cloudinary using a server-signed request. */
export default function MediaUpload({ onUploaded, label = 'Upload', folder = 'dealhobe/homepage', compact }: {
  onUploaded: (m: UploadedMedia) => void;
  label?: string;
  folder?: string;
  compact?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);

  const upload = async (file: File) => {
    if (!/^(image|video)\//.test(file.type)) return toast.error('Choose an image, GIF or MP4 file');
    if (file.size > MAX_MB * 1024 * 1024) return toast.error(`Files must be under ${MAX_MB} MB`);
    setProgress(0);
    try {
      const sig = await fetch('/api/admin/upload-signature', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ folder }),
      }).then((r) => (r.ok ? r.json() : Promise.reject(new Error('Could not start the upload'))));

      const form = new FormData();
      form.append('file', file);
      form.append('api_key', sig.apiKey);
      form.append('timestamp', String(sig.timestamp));
      form.append('folder', sig.folder);
      form.append('signature', sig.signature);

      // XHR (not fetch) for upload progress on large GIFs/videos.
      const result = await new Promise<Record<string, unknown>>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `https://api.cloudinary.com/v1_1/${sig.cloudName}/auto/upload`);
        xhr.upload.onprogress = (e) => e.lengthComputable && setProgress(Math.round((e.loaded / e.total) * 100));
        xhr.onload = () => (xhr.status < 300 ? resolve(JSON.parse(xhr.responseText)) : reject(new Error('Upload failed')));
        xhr.onerror = () => reject(new Error('Upload failed'));
        xhr.send(form);
      });
      onUploaded({
        url: String(result.secure_url),
        publicId: String(result.public_id),
        width: Number(result.width) || undefined,
        height: Number(result.height) || undefined,
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setProgress(null);
      if (input.current) input.current.value = '';
    }
  };

  return (
    <>
      <button
        type="button"
        className={`btn-admin-secondary hb-upload-btn${compact ? ' hb-upload-compact' : ''}`}
        onClick={() => input.current?.click()}
        disabled={progress !== null}
      >
        <FiUploadCloud size={15} />
        {progress === null ? label : `Uploading ${progress}%`}
      </button>
      <input
        ref={input}
        type="file"
        accept="image/*,video/mp4,video/webm"
        hidden
        onChange={(e) => { const f = e.target.files?.[0]; if (f) void upload(f); }}
      />
    </>
  );
}
