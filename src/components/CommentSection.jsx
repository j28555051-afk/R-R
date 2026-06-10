import { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';

export default function CommentSection({ mediaId, currentUser, initialComments = [], defaultOpen = false, onCommentsChange, onOpenProfile }) {
  const [comments, setComments] = useState(initialComments);
  const [prevInitialComments, setPrevInitialComments] = useState(initialComments);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(defaultOpen);
  const inputRef = useRef(null);

  if (initialComments !== prevInitialComments) {
    setComments(initialComments);
    setPrevInitialComments(initialComments);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);

    const optimistic = {
      id: `temp-${Date.now()}`,
      user_name: currentUser,
      comment_text: text.trim(),
      created_at: new Date().toISOString(),
      interaction_type: 'comment',
    };
    const newCommentsOpt = [...comments, optimistic];
    setComments(newCommentsOpt);
    if (onCommentsChange) onCommentsChange(newCommentsOpt);
    setText('');

    const { data, error } = await supabase.from('media_interactions').insert({
      media_id: mediaId,
      user_name: currentUser,
      interaction_type: 'comment',
      comment_text: optimistic.comment_text,
    }).select().single();

    if (!error && data) {
      setComments((prev) => {
        const next = prev.map((c) => (c.id === optimistic.id ? data : c));
        if (onCommentsChange) onCommentsChange(next);
        return next;
      });
    } else if (error) {
      setComments((prev) => {
        const next = prev.filter((c) => c.id !== optimistic.id);
        if (onCommentsChange) onCommentsChange(next);
        return next;
      });
    }
    setLoading(false);
  };

  const formatTime = (ts) => {
    const d = new Date(ts);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) +
      ' · ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ borderTop: '1px solid rgba(220,174,150,0.2)', paddingTop: '12px' }}>
      <button
        id={`toggle-comments-${mediaId}`}
        onClick={() => {
          setOpen(!open);
          if (!open) setTimeout(() => inputRef.current?.focus(), 200);
        }}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#7A5547', fontSize: '0.85rem', fontFamily: "'Lato', sans-serif",
          fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px',
          padding: '4px 0', transition: 'color 0.2s',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
        <span style={{ fontSize: '0.72rem', color: '#B08070' }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div style={{ marginTop: '12px', animation: 'fadeInUp 0.3s ease' }}>
          {comments.length === 0 && ( 
            <p style={{ color: '#B08070', fontSize: '0.83rem', fontStyle: 'italic', marginBottom: '12px' }}>
              Be the first to leave a comment.
            </p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
            {comments.map((c) => {
              const uname = c.user_name || '';
              const lower = uname.toLowerCase();
              const avatarUrl = lower === 'rugiatu' ? '/rugiatu.JPG' : lower === 'rahim' ? '/rahim.JPG' : null;
              return (
                <div key={c.id} style={{
                  background: c.user_name === currentUser ? 'rgba(220,174,150,0.15)' : 'rgba(249,228,216,0.5)',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  borderLeft: `3px solid ${c.user_name === currentUser ? '#DCAE96' : '#F2C5A8'}`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {avatarUrl ? (
                        <img src={avatarUrl} alt={uname} style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
                      ) : (
                        <span className="uploader-dot" style={{ background: c.user_name === currentUser ? '#DCAE96' : '#FFD29D', width: '8px', height: '8px' }} />
                      )}
                      <span style={{ fontWeight: 700, fontSize: '0.82rem', color: '#A96A4E', cursor: onOpenProfile ? 'pointer' : 'default' }} onClick={() => onOpenProfile && onOpenProfile(c.user_name)}>{c.user_name === currentUser ? 'You' : c.user_name}</span>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#B08070' }}>{formatTime(c.created_at)}</span>
                  </div>
                  <p style={{ fontSize: '0.88rem', color: '#3D2B1F', lineHeight: 1.5 }}>{c.comment_text}</p>
                </div>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px' }}>
            <input
              ref={inputRef}
              id={`comment-input-${mediaId}`}
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write something…"
              className="input-field"
              style={{ flex: 1, fontSize: '0.88rem', padding: '10px 14px' }}
              disabled={loading}
            />
            <button
              id={`send-comment-${mediaId}`}
              type="submit"
              className="btn-primary"
              style={{ padding: '10px 18px', fontSize: '0.85rem', whiteSpace: 'nowrap' }}
              disabled={loading || !text.trim()}
            >
              {loading ? '…' : 'Send'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
