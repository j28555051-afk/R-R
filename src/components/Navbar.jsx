export default function Navbar({ currentUser, activePage, setActivePage }) {
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
        <div className="navbar-user-badge">
          <span className="navbar-user-dot" />
          {currentUser}
        </div>
      </div>
    </nav>
  );
}
