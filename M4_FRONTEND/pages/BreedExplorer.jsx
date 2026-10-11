import { useMemo, useState } from 'react'
import AnimalToggle from '../components/AnimalToggle'
import SearchBar from '../components/SearchBar'
import BreedCard from '../components/BreedCard'
import EmptyState from '../components/EmptyState'
import { BREEDS } from '../data/breeds'

export default function BreedExplorer() {
  const [animalType, setAnimalType] = useState('cattle')
  const [query, setQuery] = useState('')

  const filteredBreeds = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return BREEDS.filter((breed) => {
      const matchesType = breed.type === animalType
      const matchesQuery = normalizedQuery === '' || breed.name.toLowerCase().includes(normalizedQuery)
      return matchesType && matchesQuery
    })
  }, [animalType, query])

  return (
    <section className="breed-explorer" id="explore">
      <div className="breed-explorer-inner">
        <div className="breed-explorer-intro">
          <span className="eyebrow">Breed Explorer</span>
          <h2 className="breed-explorer-title">Explore Livestock Breeds.</h2>
          <p className="breed-explorer-subtitle">
            Discover cattle and buffalo breeds, understand their characteristics, and explore
            detailed breed information powered by BreedDex.
          </p>
        </div>

        <div className="breed-explorer-controls">
          <AnimalToggle value={animalType} onChange={setAnimalType} />
          <SearchBar value={query} onChange={setQuery} />
        </div>

        {filteredBreeds.length > 0 ? (
          <div className="breed-grid">
            {filteredBreeds.map((breed) => (
              <BreedCard key={breed.id} breed={breed} />
            ))}
          </div>
        ) : (
          <div className="breed-explorer-empty">
            <EmptyState
              icon="⌕"
              title="No breeds found"
              message={`No breeds match "${query}". Try a different search term or switch animal type.`}
            />
          </div>
        )}
      </div>
    </section>
  )
}
