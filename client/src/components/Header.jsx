import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, Search, UserRound, ShoppingBag, ChevronDown, Instagram, Music2 } from 'lucide-react';
import Logo from './Logo';
import { useCart } from '../context/CartContext';
import { useContent } from '../context/ContentContext';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const { getCartCount } = useCart();
  const { categories, store } = useContent();
  const navigate = useNavigate();

  const submitSearch = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/products?q=${encodeURIComponent(query.trim())}`);
    setSearchOpen(false);
    setMenuOpen(false);
  };

  return (
    <>
      <div className="announcement-bar">
        <div className="container announcement-inner">
          <span>{store.announcementText}</span>
          <div className="announcement-socials" aria-label="Social links">
            <Instagram size={15} />
            <span className="social-dot">◎</span>
            <Music2 size={15} />
          </div>
        </div>
      </div>

      <header className="site-header">
        <div className="container header-inner">
          <button className="icon-btn mobile-only" onClick={() => setMenuOpen(true)} aria-label="Open menu"><Menu /></button>
          <Link to="/" className="logo-link"><Logo /></Link>

          <nav className="desktop-nav" aria-label="Primary navigation">
            <NavLink to="/">Home</NavLink>
            <div className="nav-dropdown">
              <NavLink to="/products">Products <ChevronDown size={15} /></NavLink>
              <div className="dropdown-menu">
                {categories.map((category) => (
                  <Link key={category.name} to={`/category/${encodeURIComponent(category.name)}`}>{category.name}</Link>
                ))}
              </div>
            </div>
            <NavLink to="/about">About</NavLink>
            <NavLink to="/contact">Contact</NavLink>
          </nav>

          <div className="header-actions">
            <button className="icon-btn" onClick={() => setSearchOpen((v) => !v)} aria-label="Search"><Search /></button>
            <button className="icon-btn desktop-only" aria-label="Account"><UserRound /></button>
            <Link to="/cart" className="icon-btn cart-icon" aria-label="Cart">
              <ShoppingBag />
              {getCartCount() > 0 && <span className="cart-badge">{getCartCount()}</span>}
            </Link>
          </div>
        </div>

        {searchOpen && (
          <div className="search-panel">
            <form className="container search-form" onSubmit={submitSearch}>
              <Search size={19} />
              <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products, categories or benefits…" />
              <button className="btn btn-dark" type="submit">Search</button>
            </form>
          </div>
        )}
      </header>

      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-head">
          <Logo compact />
          <button className="icon-btn" onClick={() => setMenuOpen(false)} aria-label="Close menu"><X /></button>
        </div>
        <form className="mobile-search" onSubmit={submitSearch}>
          <Search size={18} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search…" />
        </form>
        <NavLink onClick={() => setMenuOpen(false)} to="/">Home</NavLink>
        <NavLink onClick={() => setMenuOpen(false)} to="/products">All Products</NavLink>
        <div className="mobile-subnav">
          {categories.map((category) => <Link key={category.name} onClick={() => setMenuOpen(false)} to={`/category/${encodeURIComponent(category.name)}`}>{category.name}</Link>)}
        </div>
        <NavLink onClick={() => setMenuOpen(false)} to="/about">About</NavLink>
        <NavLink onClick={() => setMenuOpen(false)} to="/contact">Contact</NavLink>
      </div>
      {menuOpen && <button aria-label="Close mobile menu" className="menu-backdrop" onClick={() => setMenuOpen(false)} />}
    </>
  );
}
