// Phase 8: breed-level favorites were removed — "Favorites"/"Save" now
// applies only to marketplace livestock listings (see
// marketplaceStorage.js's getSavedListingIds/toggleSavedListing). Explore
// Breeds is purely informational.

function safeParse(raw) {
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

/* ---------- Recognition history ---------- */

const HISTORY_KEY = 'breeddex:recognition-history'
const HISTORY_LIMIT = 20

export function getRecognitionHistory() {
  if (typeof window === 'undefined') return []
  const raw = window.localStorage.getItem(HISTORY_KEY)
  return raw ? safeParse(raw) : []
}

export function addRecognitionHistoryItem(item) {
  const current = getRecognitionHistory()
  const next = [item, ...current].slice(0, HISTORY_LIMIT)
  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(next))
  return next
}

export function removeRecognitionHistoryItem(entryId) {
  const current = getRecognitionHistory()
  const next = current.filter((entry) => entry.id !== entryId)
  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(next))
  return next
}

export function clearRecognitionHistory() {
  window.localStorage.setItem(HISTORY_KEY, JSON.stringify([]))
  return []
}
