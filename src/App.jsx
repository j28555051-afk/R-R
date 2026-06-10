import { useState } from 'react';
import './index.css';
import PasswordGate from './components/PasswordGate';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ProfileModal from './components/ProfileModal';
import { supabase } from './lib/supabase';
import { setAvatarUrl } from './lib/avatar';
import { useEffect } from 'react';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('rr_user');
    return (saved === 'Rahim' || saved === 'Rugiatu') ? saved : null;
  });
  const [activePage, setActivePage] = useState('home');
  const [profileUser, setProfileUser] = useState(null);

  useEffect(() => {
    if (!currentUser) return;
    (async () => {
      try {
        const { data, error } = await supabase.from('user_profiles').select('avatar_url').eq('username', currentUser).single();
        if (!error && data && data.avatar_url) {
          setAvatarUrl(currentUser, data.avatar_url);
        }
      } catch (e) {}
    })();
  }, [currentUser]);

  const handleLogin = (user) => {
    setCurrentUser(user);
    setActivePage('home');
  };

  if (!currentUser) {
    return <PasswordGate onLogin={handleLogin} />;
  }

  const renderPage = () => {
    switch (activePage) {
      case 'home':    return <Home currentUser={currentUser} />;
      default:        return <Home currentUser={currentUser} />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--rose-50)' }}>
      <Navbar
        currentUser={currentUser}
        activePage={activePage}
        setActivePage={setActivePage}
        onOpenProfile={(u) => setProfileUser(u)}
      />
      <main>
        {renderPage()}
        {profileUser && (
          <ProfileModal username={profileUser} currentUser={currentUser} onClose={() => setProfileUser(null)} />
        )}
      </main>
    </div>
  );
}
