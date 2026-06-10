import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import DetailModal from './DetailModal';

export default function MediaCard({ item, currentUser, onLikeToggle, onDelete, onOpenProfile }) {
  const initialLikes = item.interactions ? item.interactions.filter((i) => i.interaction_type === 'like') : [];

  const [liked, setLiked] = useState(initialLikes.some((i) => i.user_name === currentUser));
  const [likeCount, setLikeCount] = useState(initialLikes.length);
  const [comments, setComments] = useState(item.interactions ? item.interactions.filter((i) => i.interaction_type === 'comment') : []);
  const [viewed, setViewed] = useState(item.views ? item.views.some((v) => v.user_name === currentUser) : false);
  const [heartAnim, setHeartAnim] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const cardRef = useRef(null);

  const [prevItem, setPrevItem] = useState(item);
  const [prevCurrentUser, setPrevCurrentUser] = useState(currentUser);

  if (item !== prevItem || currentUser !== prevCurrentUser) {
    setPrevItem(item);
    setPrevCurrentUser(currentUser);
    const likes = item.interactions ? item.interactions.filter((i) => i.interaction_type === 'like') : [];
    setLikeCount(likes.length);
    setLiked(likes.some((i) => i.user_name === currentUser));
    setComments(item.interactions ? item.interactions.filter((i) => i.interaction_type === 'comment') : []);
    setViewed(item.views ? item.views.some((v) => v.user_name === currentUser) : false);
  }

  useEffect(() => {
    if (viewed) return;
    const observer = new IntersectionObserver(
      async ([entry]) => {
        if (entry.isIntersecting) {
          observer.disconnect();
          await supabase.from('user_views').insert({ media_id: item.id, user_name: currentUser });
          setViewed(true);
        }
      },
      { threshold: 0.5 }
    );
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [item.id, currentUser, viewed]);

  const handleLike = async () => {
    setHeartAnim(true);
    setTimeout(() => setHeartAnim(false), 500);

    if (liked) {
      setLiked(false);
      setLikeCount((n) => n - 1);
      await supabase.from('media_interactions')
        .delete()
        .eq('media_id', item.id)
        .eq('user_name', currentUser)
        .eq('interaction_type', 'like');
    } else {
      setLiked(true);
      setLikeCount((n) => n + 1);
      await supabase.from('media_interactions').insert({
        media_id: item.id,
        user_name: currentUser,
        interaction_type: 'like',
      });
    }
    if (onLikeToggle) onLikeToggle(item.id, !liked);
  };

  const formatDate = (ts) => {
    const d = new Date(ts);
    const dateStr = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    const timeStr = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    return `${dateStr} · ${timeStr}`;
  };

  const isVideo = item.file_type === 'video';
  const isNote = item.file_type === 'note';
  const uploaderAvatar = (() => {
    const u = (item.uploader || '').toLowerCase();
    // prefer localStorage-stored avatar if available
    try {
      if (typeof window !== 'undefined') {
        const local = localStorage.getItem(`avatar_${u}`);
        if (local) return local;
      }
    } catch (e) {}
    return u === 'rugiatu' ? '/rugiatu.JPG' : u === 'rahim' ? '/rahim.JPG' : null;
  })();

  return (
    <>
      <div
        ref={cardRef}
        className="card animate-fadeInUp"
        style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer' }}
        onClick={() => setShowDetail(true)}
      >
        {/* Media display */}
        {!isNote && item.file_url && (
          <div style={{ position: 'relative' }}>
            {isVideo ? (
              <video
                src={item.file_url}
                style={{ width: '100%', maxHeight: '320px', objectFit: 'cover', display: 'block' }}
                onClick={(e) => e.stopPropagation()}
                controls
              />
            ) : (
              <img
                src={item.file_url}
                alt={item.caption || 'Memory'}
                style={{ width: '100%', maxHeight: '320px', objectFit: 'cover', display: 'block' }}
                loading="lazy"
              />
            )}
            {viewed && (
              <span className="seen-badge">Seen</span>
            )}
          </div>
        )}

        {/* Note card */}
        {isNote && (
          <div className="note-card-display">
            <p className="note-card-text">"{item.caption}"</p>
          </div>
        )}

        {/* Card body */}
        <div style={{ padding: '16px 18px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Uploader + date */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="uploader-tag" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {uploaderAvatar ? (
                <img src={uploaderAvatar} alt={item.uploader} style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover', cursor: onOpenProfile ? 'pointer' : 'default' }} onClick={(e) => { e.stopPropagation(); onOpenProfile && onOpenProfile(item.uploader); }} />
              ) : (
                <span className="uploader-dot" style={{ background: item.uploader === currentUser ? '#DCAE96' : '#FFD29D' }} />
              )}
              <span style={{ cursor: onOpenProfile ? 'pointer' : 'default' }} onClick={(e) => { e.stopPropagation(); onOpenProfile && onOpenProfile(item.uploader); }}>{item.uploader === currentUser ? 'You' : item.uploader}</span>
            </span>
            <span style={{ fontSize: '0.75rem', color: '#B08070' }}>{formatDate(item.created_at)}</span>
          </div>

          {/* Caption */}
          {!isNote && item.caption && (
            <p style={{
              fontSize: '0.9rem',
              color: '#3D2B1F',
              lineHeight: 1.5,
              margin: 0,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {item.caption}
            </p>
          )}

          {/* Bottom actions row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* Like Button */}
              <button
                id={`like-btn-${item.id}`}
                onClick={(e) => { e.stopPropagation(); handleLike(); }}
                className={`action-btn${liked ? ' action-btn--liked' : ''}`}
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

              {/* Comment count */}
              <div className="action-btn">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <span>{comments.length}</span>
              </div>
            </div>

            {/* Delete button */}
            {item.uploader === currentUser && onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm('Delete this memory? This cannot be undone.')) {
                    onDelete(item.id, item.file_url);
                  }
                }}
                className="delete-btn"
                title="Delete Memory"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  <path d="M10 11v6M14 11v6" />
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {showDetail && (
        <DetailModal
          item={item}
          currentUser={currentUser}
          liked={liked}
          likeCount={likeCount}
          onLikeToggle={handleLike}
          comments={comments}
          onCommentsChange={(newComments) => setComments(newComments)}
          onClose={() => setShowDetail(false)}
          onDelete={(id, url) => {
            setShowDetail(false);
            onDelete(id, url);
          }}
          onOpenProfile={onOpenProfile}
        />
      )}
    </>
  );
}
