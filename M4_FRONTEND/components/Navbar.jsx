import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { getNavLinksForRoute, isMarketplaceRoute } from '../utils/constants'
import { useAuth } from '../context/AuthContext'
import ModeSwitch from './ModeSwitch'

function LogoMark() {
  return (
    <svg
      className="logo-mark"
      width="34"
      height="34"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M20 26C13 26 9 20.5 9 14C9 10.5 10.6 8 12.4 8C14 8 14.6 10 14.4 12.4C14.2 14.6 14.6 17.4 17 19.6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M20 26C27 26 31 20.5 31 14C31 10.5 29.4 8 27.6 8C26 8 25.4 10 25.6 12.4C25.8 14.6 25.4 17.4 23 19.6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M20 26C20 30.5 20 33.5 20 35"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.5"
      />
      <circle cx="20" cy="26" r="2.4" fill="currentColor" />
    </svg>
  )
}

function AccountMenu() {
  const { isAuthenticated, profile, activeMode, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    function handleClickOutside(event) {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleLogout() {
    setOpen(false)
    logout()
    navigate('/')
  }

  if (!isAuthenticated) {
    return (
      <Link to="/login" className="btn btn-secondary btn-nav">
        Log In
      </Link>
    )
  }

  const displayName = profile?.full_name?.trim().split(' ')[0] || 'Account'
  const initial = (profile?.full_name?.trim().charAt(0) || 'A').toUpperCase()

  return (
    <div className="navbar-account" ref={rootRef}>
      <button
        type="button"
        className="account-chip"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        {profile?.profile_image ? (
          <img src={profile.profile_image} alt="" className="account-avatar" />
        ) : (
          <span className="account-avatar account-avatar-fallback" aria-hidden="true">
            {initial}
          </span>
        )}
        <span className="account-chip-name">{displayName}</span>
      </button>

      {open && (
        <div className="account-menu-dropdown" role="menu">
          <Link to="/account" role="menuitem" onClick={() => setOpen(false)}>
            Account Details
          </Link>
          {activeMode === 'seller' ? (
            <Link to="/my-listings" role="menuitem" onClick={() => setOpen(false)}>
              My Listings
            </Link>
          ) : (
            <Link to="/buyer-dashboard" role="menuitem" onClick={() => setOpen(false)}>
              Buyer Dashboard
            </Link>
          )}
          <button type="button" role="menuitem" onClick={handleLogout}>
            Log Out
          </button>
        </div>
      )}
    </div>
  )
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const { isAuthenticated, profile, activeMode } = useAuth()

  const inMarketplace = isMarketplaceRoute(location.pathname)
  const navLinks = getNavLinksForRoute(location.pathname)

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname, location.hash])

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="navbar-left">
          <Link to="/" className="brand">
            <LogoMark />
            <span className="brand-name">
              Breed<span className="brand-accent">Dex</span>
            </span>
          </Link>

          <nav className="nav-links" aria-label="Primary">
            {navLinks.map((link) => (
              <Link key={link.href} to={link.href}>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="navbar-right">
          <Link to="/recognition" className="btn btn-primary btn-nav navbar-cta">
            Try AI Recognition
          </Link>

          {inMarketplace && <ModeSwitch />}

          <AccountMenu />
        </div>

        <button
          type="button"
          className={`navbar-menu-toggle${menuOpen ? ' is-open' : ''}`}
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {menuOpen && (
        <nav className="navbar-mobile-menu" aria-label="Mobile">
          {navLinks.map((link) => (
            <Link key={link.href} to={link.href} onClick={() => setMenuOpen(false)}>
              {link.label}
            </Link>
          ))}
          <Link to="/recognition" className="btn btn-primary" onClick={() => setMenuOpen(false)}>
            Try AI Recognition
          </Link>
          {isAuthenticated ? (
            <>
              {inMarketplace && <ModeSwitch variant="mobile" onNavigate={() => setMenuOpen(false)} />}
              <Link to="/account" onClick={() => setMenuOpen(false)}>
                Account Details
              </Link>
              {activeMode === 'seller' ? (
                <Link to="/my-listings" onClick={() => setMenuOpen(false)}>
                  My Listings
                </Link>
              ) : (
                <Link to="/buyer-dashboard" onClick={() => setMenuOpen(false)}>
                  Buyer Dashboard
                </Link>
              )}
            </>
          ) : (
            <Link to="/login" onClick={() => setMenuOpen(false)}>
              Log In
            </Link>
          )}
        </nav>
      )}
    </header>
  )
}
