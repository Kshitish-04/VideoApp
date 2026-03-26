import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { searchVideos } from '../hooks/useSupabase';
import { Search, Upload, LayoutDashboard, Users, LogOut, Menu, X, Play } from 'lucide-react';

export default function Navbar() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handler = setTimeout(async () => {
      if (query.trim().length >= 2) {
        const data = await searchVideos(query);
        setResults(data);
        setShowResults(true);
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const initials = profile?.username?.charAt(0).toUpperCase() || '?';

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__inner">
        {/* Logo */}
        <Link to="/" className="navbar__logo">
          <span className="navbar__logo-icon">▶</span>
          <span className="navbar__logo-text">Lumina<span>Stream</span></span>
        </Link>

        {/* Nav Links */}
        <div className="navbar__links">
          <Link to="/" className="navbar__link">Home</Link>
          <Link to="/community" className="navbar__link">Community</Link>
          {user && <Link to="/upload" className="navbar__link">Upload</Link>}
        </div>

        {/* Search */}
        <div className="navbar__search" ref={searchRef}>
          <Search size={16} className="navbar__search-icon" />
          <input
            className="navbar__search-input"
            placeholder="Search videos..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => results.length > 0 && setShowResults(true)}
          />
          {showResults && results.length > 0 && (
            <div className="search-dropdown">
              {results.slice(0, 6).map(v => (
                <div
                  key={v.id}
                  className="search-dropdown__item"
                  onClick={() => { navigate(`/watch/${v.id}`); setShowResults(false); setQuery(''); }}
                >
                  {v.thumbnail_url
                    ? <img src={v.thumbnail_url} alt="" className="search-dropdown__thumb" />
                    : <div className="search-dropdown__thumb search-dropdown__thumb--placeholder"><Play size={14}/></div>
                  }
                  <div>
                    <p className="search-dropdown__title">{v.title}</p>
                    <p className="search-dropdown__meta">{v.category}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Section */}
        <div className="navbar__right">
          {user ? (
            <>
              <Link to="/upload" className="navbar__icon-btn" title="Upload">
                <Upload size={18} />
              </Link>
              <Link to="/dashboard" className="navbar__icon-btn" title="Dashboard">
                <LayoutDashboard size={18} />
              </Link>
              <Link to="/community" className="navbar__icon-btn" title="Community">
                <Users size={18} />
              </Link>
              <div className="navbar__avatar" title={profile?.username}>
                {profile?.avatar_url
                  ? <img src={profile.avatar_url} alt="avatar" />
                  : <span>{initials}</span>
                }
              </div>
              <button className="navbar__icon-btn" onClick={handleSignOut} title="Sign Out">
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn--ghost">Sign In</Link>
              <Link to="/register" className="btn btn--primary">Get Started</Link>
            </>
          )}

          <button className="navbar__hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={20}/> : <Menu size={20}/>}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="navbar__mobile-menu">
          <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/community" onClick={() => setMenuOpen(false)}>Community</Link>
          {user && <Link to="/upload" onClick={() => setMenuOpen(false)}>Upload</Link>}
          {user && <Link to="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</Link>}
          {!user && <Link to="/login" onClick={() => setMenuOpen(false)}>Sign In</Link>}
          {!user && <Link to="/register" onClick={() => setMenuOpen(false)}>Get Started</Link>}
          {user && <button onClick={handleSignOut}>Sign Out</button>}
        </div>
      )}
    </nav>
  );
}
