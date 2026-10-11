import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const MODES = [
  { value: 'buyer', label: 'Buyer', to: '/buyer-dashboard' },
  { value: 'seller', label: 'Seller', to: '/my-listings' },
]

/**
 * Compact Buyer/Seller selector for the same logged-in account.
 *
 * Reuses the existing `.filter-pill` / `.filter-pill.is-active` styling
 * (already used for the Marketplace filters and the User Type field on
 * Account Details) so the selected state is shown purely through button
 * styling — light green fill + dark text when active, transparent/border
 * when not. No icons, checkmarks, or badges.
 *
 * `variant="mobile"` renders inside the mobile nav menu instead of the
 * desktop navbar; pass `onNavigate` to close that menu on selection.
 */
export default function ModeSwitch({ variant = 'desktop', onNavigate }) {
  const { isAuthenticated, activeMode, switchMode } = useAuth()
  const navigate = useNavigate()

  if (!isAuthenticated || !activeMode) return null

  function handleSelect(mode) {
    if (mode.value !== activeMode) {
      switchMode(mode.value)
    }
    navigate(mode.to)
    onNavigate?.()
  }

  return (
    <div className={variant === 'mobile' ? 'mode-switch-mobile' : 'mode-switch'}>
      <span className="mode-switch-label">User Type</span>
      <div className="mode-switch-row" role="group" aria-label="Switch between buyer and seller mode">
        {MODES.map((mode) => (
          <button
            key={mode.value}
            type="button"
            className={`filter-pill mode-switch-pill${activeMode === mode.value ? ' is-active' : ''}`}
            aria-pressed={activeMode === mode.value}
            onClick={() => handleSelect(mode)}
          >
            {mode.label}
          </button>
        ))}
      </div>
    </div>
  )
}
