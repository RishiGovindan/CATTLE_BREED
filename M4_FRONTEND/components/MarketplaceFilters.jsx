import { useState } from 'react'
import SearchBar from './SearchBar'
import ThemedSelect from './ThemedSelect'
import ScanAnimalModal from './ScanAnimalModal'

const GENDERS = ['all', 'Female', 'Male']

export default function MarketplaceFilters({ filters, onChange, onClear, breedOptions, locationOptions, resultCount }) {
  const [panelOpen, setPanelOpen] = useState(false)
  const [scanOpen, setScanOpen] = useState(false)

  function set(key, value) {
    onChange({ ...filters, [key]: value })
  }

  return (
    <div className="marketplace-filters">
      <div className="marketplace-filters-bar">
        <SearchBar
          value={filters.query}
          onChange={(value) => set('query', value)}
          placeholder="Search listings, breeds, locations, sellers..."
        />

        <button
          type="button"
          className="scan-animal-trigger"
          onClick={() => setScanOpen(true)}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M4 8V6a2 2 0 0 1 2-2h2M20 8V6a2 2 0 0 0-2-2h-2M4 16v2a2 2 0 0 0 2 2h2M20 16v2a2 2 0 0 1-2 2h-2"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="12" r="3.4" stroke="currentColor" strokeWidth="1.8" />
          </svg>
          Scan Animal
        </button>

        <button
          type="button"
          className="marketplace-filters-toggle"
          onClick={() => setPanelOpen((open) => !open)}
          aria-expanded={panelOpen}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M4 6h16M7 12h10M10 18h4"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
          Filters
        </button>
      </div>

      {scanOpen && <ScanAnimalModal onClose={() => setScanOpen(false)} />}

      <div className={`marketplace-filters-panel${panelOpen ? ' is-open' : ''}`}>
        <div className="filter-group">
          <span className="filter-group-label">Animal Type</span>
          <div className="filter-pill-row">
            {['all', 'cattle', 'buffalo'].map((type) => (
              <button
                key={type}
                type="button"
                className={`filter-pill${filters.animalType === type ? ' is-active' : ''}`}
                onClick={() => set('animalType', type)}
              >
                {type === 'all' ? 'All' : type === 'cattle' ? 'Cattle' : 'Buffalo'}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <label className="filter-group-label" htmlFor="filter-breed">
            Breed
          </label>
          <ThemedSelect
            id="filter-breed"
            value={filters.breed}
            onChange={(value) => set('breed', value)}
            options={[
              { value: 'all', label: 'All breeds' },
              ...breedOptions.map((breed) => ({ value: breed, label: breed })),
            ]}
          />
        </div>

        <div className="filter-group">
          <span className="filter-group-label">Gender</span>
          <div className="filter-pill-row">
            {GENDERS.map((gender) => (
              <button
                key={gender}
                type="button"
                className={`filter-pill${filters.gender === gender ? ' is-active' : ''}`}
                onClick={() => set('gender', gender)}
              >
                {gender === 'all' ? 'All' : gender}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <label className="filter-group-label" htmlFor="filter-location">
            Location
          </label>
          <ThemedSelect
            id="filter-location"
            value={filters.location}
            onChange={(value) => set('location', value)}
            options={[
              { value: 'all', label: 'All locations' },
              ...locationOptions.map((location) => ({ value: location, label: location })),
            ]}
          />
        </div>

        <div className="filter-group filter-group-range">
          <span className="filter-group-label">Age (years)</span>
          <div className="filter-range-inputs">
            <input
              type="number"
              min="0"
              inputMode="decimal"
              placeholder="Min"
              value={filters.minAge}
              onChange={(event) => set('minAge', event.target.value)}
              aria-label="Minimum age"
            />
            <span aria-hidden="true">&ndash;</span>
            <input
              type="number"
              min="0"
              inputMode="decimal"
              placeholder="Max"
              value={filters.maxAge}
              onChange={(event) => set('maxAge', event.target.value)}
              aria-label="Maximum age"
            />
          </div>
        </div>

        <div className="filter-group filter-group-range">
          <span className="filter-group-label">Price (₹)</span>
          <div className="filter-range-inputs">
            <input
              type="number"
              min="0"
              inputMode="numeric"
              placeholder="Min"
              value={filters.minPrice}
              onChange={(event) => set('minPrice', event.target.value)}
              aria-label="Minimum price"
            />
            <span aria-hidden="true">&ndash;</span>
            <input
              type="number"
              min="0"
              inputMode="numeric"
              placeholder="Max"
              value={filters.maxPrice}
              onChange={(event) => set('maxPrice', event.target.value)}
              aria-label="Maximum price"
            />
          </div>
        </div>

        <div className="marketplace-filters-actions">
          <span className="marketplace-filters-count">{resultCount} listing{resultCount === 1 ? '' : 's'}</span>
          <button type="button" className="marketplace-filters-clear" onClick={onClear}>
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  )
}
