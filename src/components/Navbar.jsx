export default function Navbar({ currentUser, activePage, setActivePage, onOpenProfile }) {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <button
          onClick={() => setActivePage('home')}
          className="navbar-logo"
        >
          <span className="navbar-logo-mark">R</span>
          <span className="navbar-logo-amp">&</span>
          <span className="navbar-logo-mark">R</span>
        </button>

        {/* User badge */}
        <div className="navbar-user-badge" style={{ cursor: onOpenProfile ? 'pointer' : 'default' }} onClick={() => onOpenProfile && onOpenProfile(currentUser)}>
          {(() => {
            const u = (currentUser || '').toLowerCase();
            const url = u === 'rugiatu' ? '/rugiatu.JPG' : u === 'rahim' ? '/rahim.JPG' : null;
            return url ? <img src={url} alt={currentUser} style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover', marginRight: 8 }} /> : <span className="navbar-user-dot" />;
          })()}
          {currentUser}
        </div>
      </div>
    </nav>
  );
}
