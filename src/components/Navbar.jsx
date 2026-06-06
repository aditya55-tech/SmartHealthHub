import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";

export default function Navbar({ cartCount }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); setProfileOpen(false); }, [location]);

  const nav = [
    { to: "/", label: "Home" },
    { to: "/medicines", label: "Medicines" },
    { to: "/prescription", label: "Prescription" },
    { to: "/reminders", label: "Reminders" },
    { to: "/contact", label: "Contact" },
  ];

  const isActive = (to) => location.pathname === to;

  return (
    <nav className={"navbar" + (scrolled ? " scrolled" : "")}>
      <div className="navbar-inner container">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">🏥</span>
          <span className="logo-text">Medi<span>Nest</span></span>
        </Link>

        <ul className={"nav-links" + (menuOpen ? " open" : "")}>
          {nav.map((n) => (
            <li key={n.to}>
              <Link to={n.to} className={isActive(n.to) ? "active" : ""}>{n.label}</Link>
            </li>
          ))}
        </ul>

        <div className="nav-actions">
          <Link to="/cart" className="cart-btn">
            🛒
            {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
          </Link>
          <div className="profile-menu-wrap">
            <button className="profile-btn" onClick={() => setProfileOpen(!profileOpen)}>👤</button>
            {profileOpen && (
              <div className="profile-dropdown">
                <Link to="/profile">👤 My Profile</Link>
                <Link to="/orders">📦 My Orders</Link>
                <Link to="/reminders">⏰ Reminders</Link>
                <Link to="/admin">⚙️ Admin Panel</Link>
                <div className="dropdown-divider"></div>
                <Link to="/login" className="logout-link">🚪 Logout</Link>
              </div>
            )}
          </div>
          <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
          <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
        </div>

        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
          <span></span><span></span><span></span>
        </button>
      </div>

      {menuOpen && (
        <div className="mobile-menu">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} className={isActive(n.to) ? "active" : ""}>{n.label}</Link>
          ))}
          <Link to="/profile">👤 Profile</Link>
          <Link to="/orders">📦 Orders</Link>
          <div className="mobile-actions">
            <Link to="/cart" className="btn btn-outline btn-sm">🛒 Cart {cartCount > 0 && "("+cartCount+")"}</Link>
            <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
