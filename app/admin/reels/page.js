'use client';

import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2, X, Upload, Loader2, Video, Pencil } from 'lucide-react';

const emptyForm = { title: '', videoUrl: '', thumbnail: '', instagramLink: '', product: '', sortOrder: 0, isActive: true };

// Keep these in sync with MAX_*_BYTES in app/api/upload/sign/route.js
const MAX_VIDEO_MB = 50;
const MAX_IMAGE_MB = 10; // checked AFTER the image is shrunk

const VIDEO_EXT = { mp4: 'video/mp4', webm: 'video/webm' };
const IMAGE_EXT = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif' };

const mb = (bytes) => (bytes / 1024 / 1024).toFixed(1);

// Read a response as JSON without crashing when the server sends plain text
async function safeJson(res) {
  try {
    return await res.json();
  } catch {
    return {};
  }
}

// Some browsers return an empty file.type. Fall back to the file extension.
function getContentType(file) {
  if (file.type) return file.type;
  const ext = file.name.split('.').pop()?.toLowerCase();
  return VIDEO_EXT[ext] || IMAGE_EXT[ext] || '';
}

// Files go straight from the browser to Cloudflare R2 using a presigned URL
async function uploadDirect(file, contentType, folder, onProgress) {
  const signRes = await fetch('/api/upload/sign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ folder, contentType, size: file.size }),
  });
  const sign = await safeJson(signRes);
  if (!signRes.ok) throw new Error(sign.error || `Could not start upload (server replied ${signRes.status})`);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', sign.uploadUrl);
    xhr.setRequestHeader('Content-Type', contentType); // must match the signed type
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve(sign.publicUrl);
      else if (xhr.status === 403) reject(new Error('Upload rejected (403). The link may have expired or R2 keys/signature are wrong.'));
      else reject(new Error(`Upload failed (${xhr.status})`));
    };
    xhr.onerror = () =>
      reject(new Error(
        `Upload blocked. Usually R2 CORS: add this site (${window.location.origin}) to AllowedOrigins. Can also be a network drop.`
      ));
    xhr.ontimeout = () => reject(new Error('Upload timed out. Try a smaller video or better connection.'));
    xhr.send(file);
  });
}

// Downscale big photos to 1600px wide WebP in the browser.
async function shrinkImage(file, maxWidth = 1600) {
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
    const scale = Math.min(1, maxWidth / bitmap.width);
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise((res) => canvas.toBlob(res, 'image/webp', 0.85));
    if (!blob || blob.type !== 'image/webp') return file;
    return new File([blob], 'image.webp', { type: 'image/webp' });
  } catch {
    return file;
  }
}

function UploadSlot({ value, accept, folder, placeholder, icon: Icon, preview: PreviewComp, isVideo, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileRef = useRef();

  async function handleFile(e) {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow picking the same file again after an error
    if (!file) return;

    const limitMb = isVideo ? MAX_VIDEO_MB : MAX_IMAGE_MB;
    const MAX_PICK_MB = 40; // sanity cap on raw photos before shrinking

    // Videos are checked now. Images are checked after shrinking.
    if (isVideo && file.size > limitMb * 1024 * 1024) {
      toast.error(`Video is ${mb(file.size)} MB. Max is ${limitMb} MB. Compress it and try again.`);
      return;
    }
    if (!isVideo && file.size > MAX_PICK_MB * 1024 * 1024) {
      toast.error(`Image is ${mb(file.size)} MB, too large to process.`);
      return;
    }

    setUploading(true);
    setProgress(0);
    try {
      const toUpload = isVideo ? file : await shrinkImage(file);
      if (toUpload.size > limitMb * 1024 * 1024) {
        throw new Error(`File is ${mb(toUpload.size)} MB. Max is ${limitMb} MB.`);
      }
      const contentType = getContentType(toUpload);
      if (!contentType) throw new Error('Unsupported file type');

      const url = await uploadDirect(toUpload, contentType, folder, setProgress);
      onChange(url);
      toast.success('Uploaded');
    } catch (err) {
      toast.error(err.message || 'Upload failed', { duration: 7000 });
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-1">
      <div
        onClick={() => !uploading && fileRef.current?.click()}
        className="w-full h-28 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-brand-magenta transition-colors overflow-hidden relative bg-brand-cream/40"
      >
        {value ? (
          PreviewComp ? <PreviewComp url={value} /> : <img src={value} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-1 text-brand-ink/40 text-xs">
            <Icon size={22} />
            <span>{placeholder}</span>
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-white/70 flex flex-col items-center justify-center gap-1">
            <Loader2 size={22} className="animate-spin text-brand-magenta" />
            <span className="text-xs text-brand-ink/70">{progress}%</span>
          </div>
        )}
      </div>
      <input ref={fileRef} type="file" accept={accept} className="hidden" onChange={handleFile} />

      <input
        placeholder={`Or paste URL: ${placeholder}`}
        className="w-full border rounded-lg px-3 py-2 text-xs text-brand-ink/60"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function VideoPreview({ url }) {
  return (
    <video src={url} className="w-full h-full object-cover" muted playsInline
      onMouseEnter={(e) => e.target.play()} onMouseLeave={(e) => { e.target.pause(); e.target.currentTime = 0; }}
    />
  );
}

export default function AdminReelsPage() {
  const [reels, setReels] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);

  async function load() {
    const [r1, r2] = await Promise.all([fetch('/api/reels?all=true'), fetch('/api/products?limit=200')]);
    setReels((await safeJson(r1)).reels || []);
    setProducts((await safeJson(r2)).products || []);
  }
  useEffect(() => { load(); }, []);

  function closeForm() { setShowForm(false); setForm(emptyForm); setEditingId(null); }

  function startEdit(r) {
    setForm({
      title: r.title || '',
      videoUrl: r.videoUrl || '',
      thumbnail: r.thumbnail || '',
      instagramLink: r.instagramLink || '',
      product: r.product?._id || '',
      sortOrder: r.sortOrder ?? 0,
      isActive: r.isActive !== false,
    });
    setEditingId(r._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function submit(e) {
    e.preventDefault();
    if (!form.videoUrl) { toast.error('Please upload a video'); return; }
    setSaving(true);
    try {
      const payload = { ...form, product: form.product || null, sortOrder: Number(form.sortOrder) || 0 };
      const res = await fetch(editingId ? `/api/reels/${editingId}` : '/api/reels', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        toast.success(editingId ? 'Reel updated' : 'Reel added');
        closeForm();
        load();
      } else {
        const data = await safeJson(res);
        toast.error(data.error || 'Could not save reel');
      }
    } finally {
      setSaving(false);
    }
  }

  async function remove(id) {
    if (!confirm('Delete this reel?')) return;
    const res = await fetch(`/api/reels/${id}`, { method: 'DELETE' });
    if (!res.ok) toast.error('Could not delete reel');
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-display text-2xl font-bold text-brand-magenta">Shop by Reels</h1>
        <button onClick={() => { setForm(emptyForm); setEditingId(null); setShowForm(true); }} className="btn-primary flex items-center gap-1 text-sm">
          <Plus size={16} /> Add Reel
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="card-soft p-5 mb-6 space-y-3">
          <div className="flex justify-between">
            <h2 className="font-semibold">{editingId ? 'Edit Reel' : 'New Reel'}</h2>
            <button type="button" onClick={closeForm}><X size={18} /></button>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-brand-ink/60 mb-1">
                Video * (.mp4 or .webm, 720p or lower, up to {MAX_VIDEO_MB} MB)
              </p>
              <UploadSlot
                value={form.videoUrl}
                accept="video/mp4,video/webm"
                folder="reels-videos"
                placeholder="Click to upload video"
                icon={Video}
                preview={VideoPreview}
                isVideo
                onChange={(url) => setForm((f) => ({ ...f, videoUrl: url }))}
              />
            </div>
            <div>
              <p className="text-xs font-medium text-brand-ink/60 mb-1">
                Thumbnail image (shown while loading and in Low Power Mode)
              </p>
              <UploadSlot
                value={form.thumbnail}
                accept="image/*"
                folder="reels-thumbnails"
                placeholder="Click to upload thumbnail"
                icon={Upload}
                onChange={(url) => setForm((f) => ({ ...f, thumbnail: url }))}
              />
            </div>
          </div>

          <input
            placeholder="Instagram reel link"
            className="w-full border rounded-lg px-3 py-2 text-sm"
            value={form.instagramLink}
            onChange={(e) => setForm({ ...form, instagramLink: e.target.value })}
          />
          <select
            className="w-full border rounded-lg px-3 py-2 text-sm"
            value={form.product}
            onChange={(e) => setForm({ ...form, product: e.target.value })}
          >
            <option value="">Link to product (optional)</option>
            {products.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>
          <div>
            <p className="text-xs font-medium text-brand-ink/60 mb-1">Display order (lower numbers show first)</p>
            <input
              type="number"
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={form.sortOrder}
              onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            />
            Show on homepage
          </label>

          <button disabled={saving} className="btn-primary text-sm disabled:opacity-60">
            {saving ? 'Saving...' : editingId ? 'Save changes' : 'Create'}
          </button>
        </form>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {reels.map((r) => (
          <div key={r._id} className="card-soft overflow-hidden">
            <div className="aspect-[9/16] bg-brand-cream overflow-hidden">
              {r.thumbnail
                ? <img src={r.thumbnail} alt={r.title} className="w-full h-full object-cover" />
                : r.videoUrl
                  ? <video src={r.videoUrl} className="w-full h-full object-cover" muted playsInline
                      onMouseEnter={(e) => e.target.play()} onMouseLeave={(e) => { e.target.pause(); e.target.currentTime = 0; }} />
                  : null
              }
            </div>
            <div className="p-2 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs line-clamp-1">{r.product?.name || r.title || 'Reel'}</p>
                {r.isActive === false && <p className="text-[10px] text-brand-ink/50">Hidden</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => startEdit(r)} className="text-brand-ink/70 hover:text-brand-magenta" aria-label="Edit reel"><Pencil size={14} /></button>
                <button onClick={() => remove(r._id)} className="text-brand-magenta" aria-label="Delete reel"><Trash2 size={14} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
