import { LISTINGS } from '../data/listings'

function safeParse(raw) {
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

/* ---------- Saved (favorited) listings ---------- */

const SAVED_KEY = 'breeddex:saved-listings'

export function getSavedListingIds() {
  if (typeof window === 'undefined') return []
  const raw = window.localStorage.getItem(SAVED_KEY)
  return raw ? safeParse(raw) : []
}

export function isListingSaved(listingId) {
  return getSavedListingIds().includes(listingId)
}

export function toggleSavedListing(listingId) {
  const current = getSavedListingIds()
  const next = current.includes(listingId)
    ? current.filter((id) => id !== listingId)
    : [...current, listingId]
  window.localStorage.setItem(SAVED_KEY, JSON.stringify(next))
  return next
}

/* ---------- User-created listings (demo persistence) ---------- */

const CREATED_KEY = 'breeddex:created-listings'

export function getCreatedListings() {
  if (typeof window === 'undefined') return []
  const raw = window.localStorage.getItem(CREATED_KEY)
  return raw ? safeParse(raw) : []
}

export function addCreatedListing(listing) {
  const current = getCreatedListings()
  const next = [listing, ...current]
  window.localStorage.setItem(CREATED_KEY, JSON.stringify(next))
  return next
}

/**
 * Returns the full mock catalog plus any listings the user has created
 * locally in this browser, newest-first among the created ones.
 */
export function getAllListings() {
  return [...getCreatedListings(), ...LISTINGS]
}

export function getListingByIdWithCreated(id) {
  return getAllListings().find((listing) => listing.id === id)
}

/**
 * Returns listings created by a given seller (matched by sellerId, which is
 * the seller's account email for user-created listings). Used by the Seller
 * Dashboard / "My Listings" page.
 */
export function getListingsBySeller(sellerId) {
  if (!sellerId) return []
  return getCreatedListings().filter((listing) => listing.sellerId === sellerId)
}
