import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { getAvatarUrl, setAvatarUrl } from '../lib/avatar';

export default function ProfileModal({ username, currentUser, onClose }) {
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  if (!username) return null;

  const localUrl = getAvatarUrl(username);
  const publicFallback = (username || '').toLowerCase() === 'rugiatu' ? '/rugiatu.JPG' : (username || '').toLowerCase() === 'rahim' ? '/rahim.JPG' : null;
  const displayUrl = preview ? preview.url : (localUrl || publicFallback);

  const handleFile = (f) => {
    if (!f) return;
    const url = URL.createObjectURL(f);
    setPreview({ file: f, url });
  };

  const handleUpload = async () => {
    if (!preview || !preview.file) return;
    setUploading(true);
    try {
      const file = preview.file;
      const ext = file.name.split('.').pop();
      const path = `avatars/${username}-${Date.now()}.${ext}`;
      const { error: storageErr } = await supabase.storage.from('memories').upload(path, file, { upsert: true });
      if (storageErr) throw storageErr;
      const { data } = supabase.storage.from('memories').getPublicUrl(path);
      const publicUrl = data.publicUrl;
      // persist server-side (if table exists)
      try {
        await supabase.from('user_profiles').upsert({ username, avatar_url: publicUrl });
      } catch (e) {
        // ignore if table not present
      }
      setAvatarUrl(username, publicUrl);
      setPreview(null);
      onClose();
    } catch (err) {
      alert(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    // try to fetch stored avatar URL from server if not present locally
    (async () => {
      const local = getAvatarUrl(username);
      if (local) return;
      try {
        const { data, error } = await supabase.from('user_profiles').select('avatar_url').eq('username', username).single();
        if (!error && data && data.avatar_url) {
          setAvatarUrl(username, data.avatar_url);
        }
      } catch (e) {
        // ignore
      }
    })();
  }, [username]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520, textAlign: 'center' }}>
        <h3 style={{ marginTop: 0 }}>{username}</h3>
        {displayUrl ? (
          <img src={displayUrl} alt={username} style={{ width: 220, height: 220, borderRadius: '8px', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: 220, height: 220, borderRadius: 8, background: '#F2C5A8', display: 'inline-block' }} />
        )}

        {username === currentUser && (
          <div style={{ marginTop: 16 }}>
            <input type="file" accept="image/*" onChange={(e) => handleFile(e.target.files[0])} />
            {preview && <div style={{ marginTop: 12 }}>
              <img src={preview.url} alt="preview" style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 8 }} />
              <div style={{ marginTop: 8 }}>
                <button onClick={handleUpload} className="btn-primary" disabled={uploading}>{uploading ? 'Uploading…' : 'Save'}</button>
              </div>
            </div>}
          </div>
        )}

        <div style={{ marginTop: 18 }}>
          <button onClick={onClose} className="btn-primary">Close</button>
        </div>
      </div>
    </div>
  );
}
