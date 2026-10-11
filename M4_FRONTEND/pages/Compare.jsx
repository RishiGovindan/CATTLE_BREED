import { Link } from 'react-router-dom'
import { useCompare } from '../context/CompareContext'
import { getBreedById } from '../data/breeds'
import CompareSelector from '../components/CompareSelector'
import ComparisonTable from '../components/ComparisonTable'
import EmptyState from '../components/EmptyState'

function SlotCard({ breed, onRemove }) {
  return (
    <div className="compare-slot-card">
      <img src={breed.image} alt={breed.name} />
      <div className="compare-slot-card-body">
        <span className="breed-card-type breed-modal-type">
          {breed.type === 'cattle' ? 'Cattle' : 'Buffalo'}
        </span>
        <h3>{breed.name}</h3>
        <p>{breed.origin}</p>
      </div>
      <button type="button" className="compare-slot-remove" onClick={onRemove} aria-label={`Remove ${breed.name}`}>
        &times;
      </button>
    </div>
  )
}

export default function Compare() {
  const { compareIds, setSlot, removeFromCompare, clearCompare } = useCompare()
  const breedA = compareIds[0] ? getBreedById(compareIds[0]) : null
  const breedB = compareIds[1] ? getBreedById(compareIds[1]) : null

  return (
    <section className="compare-page">
      <div className="compare-page-inner">
        <div className="breed-explorer-intro">
          <span className="eyebrow">Compare Breeds</span>
          <h1 className="breed-explorer-title">Side-by-Side Comparison.</h1>
          <p className="breed-explorer-subtitle">
            Select two breeds to compare their characteristics, purpose, and physical traits.
          </p>
        </div>

        <div className="compare-slots">
          <div className="compare-slot">
            {breedA ? (
              <SlotCard breed={breedA} onRemove={() => removeFromCompare(breedA.id)} />
            ) : (
              <CompareSelector
                label="Select Breed A"
                excludeId={breedB?.id}
                onSelect={(id) => setSlot(0, id)}
              />
            )}
          </div>

          <span className="compare-slots-vs" aria-hidden="true">
            VS
          </span>

          <div className="compare-slot">
            {breedB ? (
              <SlotCard breed={breedB} onRemove={() => removeFromCompare(breedB.id)} />
            ) : (
              <CompareSelector
                label="Select Breed B"
                excludeId={breedA?.id}
                onSelect={(id) => setSlot(1, id)}
              />
            )}
          </div>
        </div>

        {(breedA || breedB) && (
          <div className="compare-page-actions">
            <button type="button" className="compare-bar-clear" onClick={clearCompare}>
              Clear Comparison
            </button>
          </div>
        )}

        {breedA && breedB ? (
          <ComparisonTable breedA={breedA} breedB={breedB} />
        ) : (
          <div className="breed-explorer-empty">
            <EmptyState
              icon="⇄"
              title="Select two breeds to compare"
              message="Choose a breed for each slot above to see their characteristics side-by-side."
              actionLabel="Explore Breeds"
              actionHref="/#explore"
            />
          </div>
        )}

        <div className="breed-details-footer-nav">
          <Link to="/" className="btn btn-secondary">
            &larr; Back to Breed Explorer
          </Link>
        </div>
      </div>
    </section>
  )
}
