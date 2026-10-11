import { Link } from 'react-router-dom'
import { useCompare } from '../context/CompareContext'
import { getBreedById } from '../data/breeds'

export default function CompareBar() {
  const { compareIds, removeFromCompare, clearCompare } = useCompare()

  if (compareIds.length === 0) return null

  const breeds = compareIds.map((id) => getBreedById(id)).filter(Boolean)

  return (
    <div className="compare-bar" role="region" aria-label="Breed comparison selection">
      <div className="compare-bar-inner">
        <div className="compare-bar-items">
          {breeds.map((breed) => (
            <div className="compare-bar-item" key={breed.id}>
              <img src={breed.image} alt={breed.name} />
              <span>{breed.name}</span>
              <button
                type="button"
                onClick={() => removeFromCompare(breed.id)}
                aria-label={`Remove ${breed.name} from comparison`}
              >
                &times;
              </button>
            </div>
          ))}
          {breeds.length < 2 && (
            <span className="compare-bar-hint">Select {2 - breeds.length} more breed{2 - breeds.length > 1 ? 's' : ''} to compare</span>
          )}
        </div>

        <div className="compare-bar-actions">
          <button type="button" className="compare-bar-clear" onClick={clearCompare}>
            Clear
          </button>
          <Link
            to="/compare"
            className={`btn btn-primary btn-nav${breeds.length < 2 ? ' is-disabled' : ''}`}
            aria-disabled={breeds.length < 2}
            onClick={(event) => {
              if (breeds.length < 2) event.preventDefault()
            }}
          >
            Compare Now
          </Link>
        </div>
      </div>
    </div>
  )
}
