import { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';

const MAX_FILE_SIZE_MB = 50;

export default function UploadModal({ currentUser, onClose, onUploaded }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  const handleFile = (f) => {
    if (!f) return;
    if (f.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`File too large. Max size is ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }
    setFile(f);
    setError('');
    const url = URL.createObjectURL(f);
    setPreview({ url, type: f.type.startsWith('video') ? 'video' : 'image' });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleUpload = async () => {
    setUploading(true);
    setError('');

    try {
      if (!file) { setError('Please choose a file.'); setUploading(false); return; }
      const ext = file.name.split('.').pop();
      const filePath = `${currentUser}/${Date.now()}.${ext}`;
      const fileType = file.type.startsWith('video') ? 'video' : 'image';

      const { error: storageErr } = await supabase.storage
        .from('memories')
        .upload(filePath, file, { upsert: false });
      if (storageErr) throw storageErr;

      const { data: { publicUrl } } = supabase.storage.from('memories').getPublicUrl(filePath);

      const { data, error: dbErr } = await supabase.from('media_items').insert({
        file_type: fileType,
        file_url: publicUrl,
        caption: caption.trim() || null,
        uploader: currentUser,
      }).select().single();
      if (dbErr) throw dbErr;
      onUploaded(data);
      onClose();
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', color: '#3D2B1F' }}>
            Share a Memory
          </h2>
          <button onClick={onClose} className="close-btn">×</button>
        </div>

        {/* Drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => fileRef.current?.click()}
          className={`drop-zone${dragOver ? ' drop-zone--active' : ''}`}
          style={{ minHeight: preview ? 'auto' : '150px' }}
        >
          {preview ? (
            preview.type === 'video' ? (
              <video src={preview.url} style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '10px' }} controls />
            ) : (
              <img src={preview.url} alt="Preview" style={{ maxWidth: '100%', maxHeight: '220px', borderRadius: '10px', objectFit: 'cover' }} />
            )
          ) : (
            <>
              <div className="drop-zone-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="3" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
              </div>
              <p style={{ color: '#7A5547', fontSize: '0.9rem', fontWeight: 700 }}>
                Drag &amp; drop or click to choose
              </p>
              <p style={{ color: '#B08070', fontSize: '0.78rem' }}>Photos &amp; videos up to {MAX_FILE_SIZE_MB}MB</p>
            </>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*,video/*"
          style={{ display: 'none' }}
          onChange={(e) => handleFile(e.target.files[0])}
        />

        <input
          type="text"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Add a caption (optional)…"
          className="input-field"
          style={{ marginBottom: '16px' }}
        />

        {error && (
          <p style={{ color: '#C98B6E', fontSize: '0.85rem', marginBottom: '12px' }}>{error}</p>
        )}

        <button
          id="upload-submit-btn"
          onClick={handleUpload}
          className="btn-primary"
          style={{ width: '100%' }}
          disabled={uploading}
        >
          {uploading ? 'Sharing…' : 'Share Memory'}
        </button>

        <p style={{ textAlign: 'center', color: '#B08070', fontSize: '0.78rem', marginTop: '14px' }}>
          {currentUser === 'Rugiatu' ? 'Rahim' : 'Rugiatu'} will see this in the gallery.
        </p>
      </div>
    </div>
  );
}
