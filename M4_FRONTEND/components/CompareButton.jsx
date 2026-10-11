import { useCompare } from '../context/CompareContext'

export default function CompareButton({ breedId, className = '', variant = 'icon' }) {
  const { isInCompare, toggleCompare, isFull } = useCompare()
  const active = isInCompare(breedId)
  const disabled = !active && isFull

  function handleClick(event) {
    event.preventDefault()
    event.stopPropagation()
    if (disabled) return
    toggleCompare(breedId)
  }

  if (variant === 'text') {
    return (
      <button
        type="button"
        className={`compare-button-text${active ? ' is-active' : ''} ${className}`.trim()}
        onClick={handleClick}
        disabled={disabled}
        aria-pressed={active}
      >
        <span className="compare-button-icon" aria-hidden="true">
          {active ? '✓' : '⇄'}
        </span>
        {active ? 'Added to Compare' : 'Add to Compare'}
      </button>
    )
  }

  return (
    <button
      type="button"
      className={`compare-button${active ? ' is-active' : ''} ${className}`.trim()}
      onClick={handleClick}
      disabled={disabled}
      aria-pressed={active}
      aria-label={active ? 'Remove from comparison' : 'Add to comparison'}
      title={disabled ? 'You can compare up to 2 breeds' : active ? 'Remove from comparison' : 'Add to comparison'}
    >
      <span aria-hidden="true">{active ? '✓' : '⇄'}</span>
    </button>
  )
}
