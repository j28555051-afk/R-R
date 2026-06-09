import { useState } from 'react';
import CommentSection from './CommentSection';

export default function DetailModal({
  item,
  currentUser,
  liked,
  likeCount,
  onLikeToggle,
  comments,
  onCommentsChange,
  onClose,
  onDelete,
}) {
  const [fullscreen, setFullscreen] = useState(false);
  const [heartAnim, setHeartAnim] = useState(false);

  const isVideo = item.file_type === 'video';
  const isNote = item.file_type === 'note';

  const formatDate = (ts) => {
    return new Date(ts).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleLikeClick = () => {
    setHeartAnim(true);
    setTimeout(() => setHeartAnim(false), 500);
    onLikeToggle();
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose} style={{ zIndex: 900 }}>
        <div
          className="modal-box detail-modal-box"
          onClick={(e) => e.stopPropagation()}
          style={{
            maxWidth: '900px',
            width: '90%',
            padding: 0,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '90vh',
            background: 'white',
          }}
        >
          {/* Main Content Area */}
          <div style={{ display: 'flex', flex: 1, minHeight: 0, flexDirection: 'row' }} className="detail-modal-content">

            {/* Left Side: Media */}
            <div style={{
              flex: 1.3,
              background: '#1A110B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              minHeight: '300px',
            }} className="detail-modal-media-container">
              {!isNote && item.file_url && (
                <>
                  {isVideo ? (
                    <video
                      src={item.file_url}
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block' }}
                      controls
                    />
                  ) : (
                    <img
                      src={item.file_url}
                      alt={item.caption || 'Memory'}
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block' }}
                    />
                  )}
                  {/* Fullscreen Button */}
                  <button
                    onClick={() => setFullscreen(true)}
                    className="fullscreen-btn"
                    title="Fullscreen"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3" />
                    </svg>
                  </button>
                </>
              )}

              {isNote && (
                <div style={{
                  background: 'linear-gradient(135deg, #FDF5F0, #F9E4D8)',
                  width: '100%',
                  height: '100%',
                  minHeight: '300px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '40px',
                }}>
                  <p style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: '1.4rem',
                    color: '#3D2B1F',
                    textAlign: 'center',
                    lineHeight: 1.6,
                    fontStyle: 'italic',
                  }}>
                    "{item.caption}"
                  </p>
                </div>
              )}
            </div>

            {/* Right Side: Details & Comments */}
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              padding: '28px',
              overflowY: 'auto',
              borderLeft: '1px solid rgba(220, 174, 150, 0.2)',
              background: '#FDFAF8',
            }} className="detail-modal-sidebar">

              {/* Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
                paddingBottom: '16px',
                borderBottom: '1px solid rgba(220,174,150,0.15)',
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span className="uploader-dot" style={{ background: item.uploader === 'Rugiatu' ? '#DCAE96' : '#FFD29D' }} />
                    <span style={{ fontWeight: 700, color: '#A96A4E', fontSize: '0.95rem' }}>{item.uploader === currentUser ? 'You' : item.uploader}</span>
                  </div>
                  <span style={{ fontSize: '0.78rem', color: '#B08070' }}>{formatDate(item.created_at)}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {item.uploader === currentUser && onDelete && (
                    <button
                      onClick={() => {
                        if (window.confirm('Delete this memory? This cannot be undone.')) {
                          onDelete(item.id, item.file_url);
                        }
                      }}
                      className="delete-btn"
                      title="Delete Memory"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6M14 11v6" />
                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                      </svg>
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="close-btn"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Caption */}
              {!isNote && item.caption && (
                <div style={{ marginBottom: '24px' }}>
                  <p style={{ fontSize: '0.95rem', color: '#3D2B1F', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                    {item.caption}
                  </p>
                </div>
              )}

              {/* Likes */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '20px',
                paddingBottom: '16px',
                borderBottom: '1px solid rgba(220,174,150,0.15)',
              }}>
                <button
                  onClick={handleLikeClick}
                  className={`action-btn${liked ? ' action-btn--liked' : ''}`}
                  style={{ padding: '7px 16px', fontSize: '0.85rem' }}
                >
                  <span style={{
                    display: 'inline-block',
                    animation: heartAnim ? 'heartPop 0.5s ease' : 'none',
                  }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </span>
                  {likeCount > 0 ? likeCount : ''}
                </button>
                <span style={{ fontSize: '0.82rem', color: '#B08070', fontWeight: 600 }}>
                  {likeCount === 1 ? '1 love' : likeCount > 1 ? `${likeCount} loves` : 'Be the first to love this'}
                </span>
              </div>

              {/* Comments Section */}
              <div style={{ flex: 1, minHeight: 0 }} className="modal-comments-wrapper">
                <CommentSection
                  mediaId={item.id}
                  currentUser={currentUser}
                  initialComments={comments}
                  defaultOpen={true}
                  onCommentsChange={onCommentsChange}
                />
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Fullscreen Lightbox */}
      {fullscreen && !isNote && (
        <div
          onClick={() => setFullscreen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'black',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            cursor: 'zoom-out',
            animation: 'fadeIn 0.25s ease',
          }}
        >
          {isVideo ? (
            <video
              src={item.file_url}
              style={{ maxWidth: '98vw', maxHeight: '98vh', objectFit: 'contain' }}
              controls
              autoPlay
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <img
              src={item.file_url}
              alt={item.caption || 'Memory'}
              style={{ maxWidth: '98vw', maxHeight: '98vh', objectFit: 'contain' }}
            />
          )}
          <button
            onClick={() => setFullscreen(false)}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '1.5rem',
              color: 'white',
              backdropFilter: 'blur(4px)',
            }}
          >
            ×
          </button>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .detail-modal-box { max-height: 95vh !important; height: auto !important; }
          .detail-modal-content { flex-direction: column !important; overflow-y: auto !important; }
          .detail-modal-media-container { flex: none !important; height: 300px !important; min-height: auto !important; }
          .detail-modal-sidebar { flex: none !important; border-left: none !important; border-top: 1px solid rgba(220,174,150,0.2) !important; }
        }
      `}</style>
    </>
  );
}
