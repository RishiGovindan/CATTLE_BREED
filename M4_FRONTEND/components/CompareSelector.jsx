import { useMemo, useState } from 'react'
import { BREEDS } from '../data/breeds'

export default function CompareSelector({ excludeId, onSelect, label }) {
  const [query, setQuery] = useState('')

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return BREEDS.filter((breed) => {
      if (breed.id === excludeId) return false
      if (!normalized) return true
      return breed.name.toLowerCase().includes(normalized)
    })
  }, [query, excludeId])

  return (
    <div className="compare-selector">
      <p className="compare-selector-label">{label}</p>
      <input
        type="text"
        className="compare-selector-search"
        placeholder="Search for a breed..."
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        aria-label={label}
      />
      <div className="compare-selector-list">
        {results.length > 0 ? (
          results.map((breed) => (
            <button
              type="button"
              key={breed.id}
              className="compare-selector-option"
              onClick={() => onSelect(breed.id)}
            >
              <img src={breed.image} alt="" aria-hidden="true" />
              <span>
                <strong>{breed.name}</strong>
                <em>{breed.type === 'cattle' ? 'Cattle' : 'Buffalo'}</em>
              </span>
            </button>
          ))
        ) : (
          <p className="compare-selector-empty">No breeds match "{query}".</p>
        )}
      </div>
    </div>
  )
}
