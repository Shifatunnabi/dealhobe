/** Send images directly to Cloudinary, avoiding base64/serverless request size limits. */
export async function uploadImageFile(file: File, folder: string): Promise<{ url: string; publicId: string }> {
  const signatureResponse = await fetch('/api/admin/upload-signature', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ folder }),
  });
  const signature = await signatureResponse.json();
  if (!signatureResponse.ok) throw new Error(signature.error || 'Could not start the upload');

  const form = new FormData();
  form.append('file', file);
  form.append('api_key', signature.apiKey);
  form.append('timestamp', String(signature.timestamp));
  form.append('folder', signature.folder);
  form.append('signature', signature.signature);
  const response = await fetch(`https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`, {
    method: 'POST', body: form,
  });
  const result = await response.json();
  if (!response.ok || !result.secure_url || !result.public_id) {
    throw new Error(result.error?.message || 'Upload failed');
  }
  return { url: result.secure_url, publicId: result.public_id };
}
