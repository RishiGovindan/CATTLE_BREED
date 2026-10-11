export const APP_NAME = 'BreedDex'

export const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Explore Breeds', href: '/#explore' },
  { label: 'Compare', href: '/compare' },
  { label: 'TradeHub', href: '/marketplace' },
]

// Nav links that stay visible once the visitor is inside the Marketplace
// section (see isMarketplaceRoute below) — everything else is hidden there
// in favor of the Buyer/Seller switch.
const MARKETPLACE_VISIBLE_HREFS = new Set(['/', '/marketplace'])

export function getNavLinksForRoute(pathname) {
  return isMarketplaceRoute(pathname)
    ? NAV_LINKS.filter((link) => MARKETPLACE_VISIBLE_HREFS.has(link.href))
    : NAV_LINKS
}

// Route prefixes that belong to the Marketplace experience. Used to switch
// the navbar between the normal-site layout and the Marketplace layout
// (Buyer/Seller switch shown, Explore Breeds/Compare hidden, etc).
const MARKETPLACE_ROUTE_PREFIXES = [
  '/marketplace',
  '/create-listing',
  '/my-listings',
  '/buyer-dashboard',
  '/saved-listings',
]

export function isMarketplaceRoute(pathname) {
  return MARKETPLACE_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  )
}

export const HERO_STATS = [
  { value: '50+', label: 'Breeds', sublabel: 'Cattle & Buffalo' },
  { value: 'AI-Powered', label: 'Smart Recognition', sublabel: '' },
  { value: 'Built for Farmers', label: 'Better Decisions', sublabel: '' },
]

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

// True once a real backend URL has been configured (via VITE_API_BASE_URL).
// Until then, features that need a backend (AI recognition, etc.) fall back
// to local demo/mock behavior instead of calling a server that doesn't exist.
export const HAS_BACKEND = Boolean(import.meta.env.VITE_API_BASE_URL)
