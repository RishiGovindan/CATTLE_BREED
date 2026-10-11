import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Phase 8: BreedDex now uses a single unified account that can act as both
 * Buyer and Seller (see AuthContext's `activeMode`). By default this guard
 * no longer permanently blocks a logged-in user from the "other"
 * experience's routes — `role` / `redirectTo` are kept as props for that
 * case, but are otherwise unused so My Listings / Buyer Dashboard stay
 * reachable regardless of mode. It just ensures the visitor is
 * authenticated with a complete profile, same as RequireCompleteProfile.
 *
 * Phase 8.2: some routes (e.g. Saved Listings) DO need to depend on the
 * active mode — pass `enforceMode` to opt a route into that check. When
 * `activeMode` doesn't match `role`, the visitor is redirected to
 * `redirectTo` instead of seeing the page. Switching modes never deletes
 * data, so this only changes what's reachable, not what's stored.
 */
export default function RequireRole({ children, role, redirectTo, enforceMode = false }) {
  const { isAuthenticated, isProfileComplete, activeMode, ready } = useAuth()
  const location = useLocation()

  if (!ready) return null

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (!isProfileComplete) {
    return <Navigate to="/complete-profile" replace state={{ from: location }} />
  }

  if (enforceMode && role && activeMode !== role) {
    return <Navigate to={redirectTo ?? '/'} replace />
  }

  return children
}
