import { useState } from 'react';
import ProfileModal from './ProfileModal';
import { getAvatarUrl } from '../lib/avatar';

const CORRECT_PASSWORD = 'memories2024';

const users = [
  {
    id: 'Rugiatu',
    label: 'Rugiatu',
    gradient: 'linear-gradient(135deg, #F9E4D8, #DCAE96)',
    dot: '#DCAE96',
  },
  {
    id: 'Rahim',
    label: 'Rahim',
    gradient: 'linear-gradient(135deg, #FFF3E0, #FFD29D)',
    dot: '#FFD29D',
  },
];

export default function PasswordGate({ onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [step, setStep] = useState('password'); // 'password' | 'select'
  const [profileUser, setProfileUser] = useState(null);

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (password === CORRECT_PASSWORD) {
      setError('');
      setStep('select');
    } else {
      setError("That's not right. Please try again.");
      setShake(true);
      setTimeout(() => setShake(false), 600);
      setPassword('');
    }
  };

  const handleUserSelect = (userId) => {
    localStorage.setItem('rr_user', userId);
    onLogin(userId);
  };

  return (
    <div className="gate-bg">
      {/* Decorative circles */}
      <div className="gate-circle gate-circle--top" />
      <div className="gate-circle gate-circle--bottom" />

      <div className="gate-content">
        {/* Monogram */}
        <div className="gate-monogram">R&R</div>

        <h1 className="gate-title">R &amp; R</h1>
        <p className="gate-subtitle">Our private memory dump.</p>

        {step === 'password' ? (
          <form onSubmit={handlePasswordSubmit}>
            <div className={`gate-card${shake ? ' animate-shake' : ''}`}>
              <p style={{ color: '#7A5547', marginBottom: '20px', fontSize: '0.95rem' }}>
                This space is just for us. Enter the password to continue.
              </p>
              <input
                id="password-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="input-field"
                style={{ marginBottom: '16px', textAlign: 'center', letterSpacing: '3px', fontSize: '1.1rem' }}
                autoFocus
              />
              {error && (
                <p style={{ color: '#C98B6E', fontSize: '0.85rem', marginBottom: '12px', animation: 'fadeIn 0.3s ease' }}>
                  {error}
                </p>
              )}
              <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                Enter
              </button>
            </div>
          </form>
        ) : (
          <div style={{ animation: 'fadeInUp 0.5s ease both' }}>
            <div className="gate-card">
              <p style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '1.3rem',
                color: '#3D2B1F',
                marginBottom: '8px',
              }}>
                Welcome back.
              </p>
              <p style={{ color: '#7A5547', fontSize: '0.9rem', marginBottom: '28px' }}>
                Who are you today?
              </p>
              <div style={{ display: 'flex', gap: '16px', flexDirection: 'column' }}>
                {users.map((u) => (
                  <button
                    key={u.id}
                    id={`user-select-${u.id.toLowerCase()}`}
                    onClick={() => handleUserSelect(u.id)}
                    className="user-select-btn"
                    style={{ background: u.gradient }}
                  >
                    {(() => {
                      const local = getAvatarUrl(u.id);
                      const fallback = u.id === 'Rugiatu' ? '/rugiatu.JPG' : u.id === 'Rahim' ? '/rahim.JPG' : '';
                      const url = local || fallback;
                      return <img src={url} alt={u.label} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); setProfileUser(u.id); }} />;
                    })()}
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', color: '#3D2B1F', fontWeight: 600 }}>
                        {u.label}
                      </div>
                      <div style={{ color: '#7A5547', fontSize: '0.82rem' }}>{u.description}</div>
                    </div>
                    <span style={{ marginLeft: 'auto', color: '#C98B6E', fontSize: '1.1rem', fontWeight: 300 }}>→</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <p style={{ color: '#B08070', fontSize: '0.75rem', marginTop: '24px' }}>
          Made with love, just for us.
        </p>
        {profileUser && (
          <ProfileModal username={profileUser} currentUser={null} onClose={() => setProfileUser(null)} />
        )}
      </div>
    </div>
  );
}
