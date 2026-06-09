import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import MediaCard from '../components/MediaCard';
import UploadModal from '../components/UploadModal';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'new', label: 'Recent' },
  { id: 'images', label: 'Photos' },
  { id: 'videos', label: 'Videos' },
  { id: 'rugiatu', label: 'By Rugiatu' },
  { id: 'rahim', label: 'By Rahim' },
];

export default function Home({ currentUser }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showUpload, setShowUpload] = useState(false);
  const [error, setError] = useState('');

  const fetchMedia = async () => {
    setLoading(true);
    setError('');
    if (!isSupabaseConfigured) {
      setError('Supabase not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment (e.g., Vercel project settings).');
      setLoading(false);
      return;
    }
    const { data: mediaItems, error: mediaErr } = await supabase
      .from('media_items')
      .select('*')
      .order('created_at', { ascending: false });

    if (mediaErr) { setError('Could not load memories. Check your Supabase connection.'); setLoading(false); return; }

    const ids = mediaItems.map((m) => m.id);
    let interactions = [];
    let views = [];

    if (ids.length > 0) {
      const { data: interactionsData } = await supabase
        .from('media_interactions')
        .select('*')
        .in('media_id', ids);
      if (interactionsData) interactions = interactionsData;

      const { data: viewsData } = await supabase
        .from('user_views')
        .select('*')
        .in('media_id', ids);
      if (viewsData) views = viewsData;
    }

    const enriched = mediaItems.map((m) => ({
      ...m,
      interactions: interactions.filter((i) => i.media_id === m.id),
      views: views.filter((v) => v.media_id === m.id),
    }));

    setItems(enriched);
    setLoading(false);
  };

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchMedia();
    });
  }, [currentUser]);

  const handleUploaded = (newItem) => {
    setItems((prev) => [{ ...newItem, interactions: [], views: [] }, ...prev]);
  };

  const handleDelete = async (itemId, fileUrl) => {
    try {
      const { error: dbErr } = await supabase
        .from('media_items')
        .delete()
        .eq('id', itemId);
      if (dbErr) throw dbErr;

      if (fileUrl) {
        const parts = fileUrl.split('/public/memories/');
        if (parts.length > 1) {
          const filePath = parts[1];
          const { error: storageErr } = await supabase.storage
            .from('memories')
            .remove([filePath]);
          if (storageErr) console.error('Failed to delete storage file:', storageErr);
        }
      }

      setItems((prev) => prev.filter((item) => item.id !== itemId));
    } catch (err) {
      alert(err.message || 'Failed to delete the memory.');
    }
  };

  const getFiltered = () => {
    let result = [...items];
    if (filter === 'new') {
      result = result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (filter === 'images') {
      result = result.filter((m) => m.file_type === 'image');
    } else if (filter === 'videos') {
      result = result.filter((m) => m.file_type === 'video');
    } else if (filter === 'rugiatu') {
      result = result.filter((m) => m.uploader === 'Rugiatu');
    } else if (filter === 'rahim') {
      result = result.filter((m) => m.uploader === 'Rahim');
    }
    return result;
  };

  const filtered = getFiltered();

  return (
    <div className="page-container">
      {/* Hero banner */}
      <div className="hero-banner">
        <div className="hero-bg-circle" />
        <p className="hero-tagline">
          A private corner to share and keep memories while you're away.
          Every picture, note, and smile lives here for us.
        </p>
        <button
          id="upload-btn"
          onClick={() => setShowUpload(true)}
          className="btn-primary"
          style={{ fontSize: '1rem', padding: '12px 32px' }}
        >
          + Share a Memory
        </button>
      </div>

      {/* Filter bar */}
      <div className="filter-bar">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            id={`filter-${f.id}`}
            onClick={() => setFilter(f.id)}
            className={`filter-btn${filter === f.id ? ' active' : ''}`}
          >
            {f.label}
          </button>
        ))}
        <button onClick={fetchMedia} className="filter-btn" style={{ marginLeft: 'auto' }}>
          Refresh
        </button>
      </div>

      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}

      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner" />
          <p>Loading your memories…</p>
        </div>
      ) : (
        <>
          {filtered.length > 0 ? (
            <section style={{ marginBottom: '48px' }}>
              <div className="media-grid">
                {filtered.map((item) => (
                  <MediaCard
                    key={item.id}
                    item={item}
                    currentUser={currentUser}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </section>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="3" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
              </div>
              <h3>{items.length === 0 ? 'No memories yet' : 'No memories found'}</h3>
              <p>
                {items.length === 0
                  ? 'Start building your collection — share the first photo, video, or note.'
                  : 'Try changing your filters or share a new memory.'}
              </p>
              <button onClick={() => setShowUpload(true)} className="btn-primary">
                + Share First Memory
              </button>
            </div>
          )}
        </>
      )}

      {showUpload && (
        <UploadModal
          currentUser={currentUser}
          onClose={() => setShowUpload(false)}
          onUploaded={handleUploaded}
        />
      )}
    </div>
  );
}
