import { useEffect, useState } from 'react'
import { savedApi } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function SaveListingButton({ listingId, className = '', onToggle }) {
  const { isAuthenticated } = useAuth()
  const [active, setActive] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) { setActive(false); return }
    savedApi.ids().then((ids) => setActive(ids.includes(String(listingId)))).catch(() => setActive(false))
  }, [listingId, isAuthenticated])

  async function handleClick(event) {
    event.preventDefault(); event.stopPropagation()
    if (!isAuthenticated || busy) return
    setBusy(true)
    try {
      if (active) await savedApi.remove(listingId)
      else await savedApi.save(listingId)
      const next = !active
      setActive(next); onToggle?.(next)
    } finally { setBusy(false) }
  }

  return <button type="button" className={`favorite-button${active ? ' is-active' : ''} ${className}`.trim()}
    onClick={handleClick} disabled={busy || !isAuthenticated} aria-pressed={active}
    aria-label={active ? 'Remove from saved listings' : 'Save listing'} title={isAuthenticated ? (active ? 'Remove from saved listings' : 'Save listing') : 'Log in to save listings'}>
    <svg width="18" height="18" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20.5s-7.5-4.6-10-9.3C0.4 7.8 2 4 5.6 3.3c2.2-0.4 4.3 0.7 6.4 3 2.1-2.3 4.2-3.4 6.4-3 3.6 0.7 5.2 4.5 3.6 7.9-2.5 4.7-10 9.3-10 9.3Z" />
    </svg>
  </button>
}