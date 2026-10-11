const OPTIONS = [
  { value: 'cattle', label: 'Cattle', icon: '\u{1F404}' },
  { value: 'buffalo', label: 'Buffalo', icon: '\u{1F403}' },
]

export default function AnimalToggle({ value, onChange }) {
  return (
    <div className="animal-toggle" role="tablist" aria-label="Animal type">
      <span
        className="animal-toggle-thumb"
        style={{ transform: value === 'buffalo' ? 'translateX(100%)' : 'translateX(0%)' }}
        aria-hidden="true"
      />
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={value === option.value}
          className={`animal-toggle-option${value === option.value ? ' is-active' : ''}`}
          onClick={() => onChange(option.value)}
        >
          <span className="animal-toggle-icon" aria-hidden="true">
            {option.icon}
          </span>
          {option.label}
        </button>
      ))}
    </div>
  )
}
