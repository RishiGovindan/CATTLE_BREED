import { Link, useNavigate, useParams } from 'react-router-dom'
import { getBreedById, getRelatedBreeds } from '../data/breeds'
import CompareButton from '../components/CompareButton'
import BreedCard from '../components/BreedCard'
import EmptyState from '../components/EmptyState'

const PROFILE_FIELDS = [
  { key: 'purpose', label: 'Primary Purpose' },
  { key: 'climate', label: 'Climate Adaptability' },
  { key: 'milkYield', label: 'Milk Production' },
  { key: 'size', label: 'Average Size / Build' },
  { key: 'temperament', label: 'Temperament' },
]

export default function BreedDetails() {
  const { breedId } = useParams()
  const navigate = useNavigate()
  const breed = getBreedById(breedId)

  if (!breed) {
    return (
      <section className="breed-details-page">
        <div className="breed-details-inner">
          <EmptyState
            icon="?"
            title="Breed not found"
            message="We couldn't find a breed with that ID. It may have been renamed or removed."
            actionLabel="Back to Breed Explorer"
            actionHref="/#explore"
          />
        </div>
      </section>
    )
  }

  const related = getRelatedBreeds(breed, 4)

  return (
    <section className="breed-details-page">
      <div className="breed-details-inner">
        <button type="button" className="breed-details-back" onClick={() => navigate(-1)}>
          <span aria-hidden="true">&larr;</span> Back to Breed Explorer
        </button>

        <div className="breed-details-hero">
          <div className="breed-details-hero-image-wrap">
            <img src={breed.image} alt={breed.name} className="breed-details-hero-image" />
            <span className="breed-card-type breed-details-type">
              {breed.type === 'cattle' ? 'Cattle' : 'Buffalo'}
            </span>
          </div>

          <div className="breed-details-heading">
            <span className="eyebrow">{breed.purpose} Breed</span>
            <h1 className="breed-details-name">{breed.name}</h1>
            <p className="breed-details-origin">{breed.origin}</p>
            <p className="breed-details-description">{breed.description}</p>

            <ul className="breed-card-tags breed-details-tags">
              {breed.tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>

            <div className="breed-details-heading-actions">
              <CompareButton breedId={breed.id} variant="text" />
            </div>
          </div>
        </div>

        <div className="breed-details-profile-grid">
          {PROFILE_FIELDS.map((field) => (
            <div className="profile-stat-card" key={field.key}>
              <span className="profile-stat-label">{field.label}</span>
              <p className="profile-stat-value">{breed[field.key]}</p>
            </div>
          ))}
        </div>

        <div className="breed-details-columns">
          <div className="breed-details-column">
            <h2 className="breed-details-section-title">Key Characteristics</h2>
            <ul className="breed-details-list">
              {breed.characteristics.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="breed-details-column">
            <h2 className="breed-details-section-title">Distinctive Physical Features</h2>
            <ul className="breed-details-list">
              {breed.physicalFeatures.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        {related.length > 0 && (
          <div className="related-breeds">
            <h2 className="breed-details-section-title">You May Also Like</h2>
            <div className="breed-grid">
              {related.map((relatedBreed) => (
                <BreedCard key={relatedBreed.id} breed={relatedBreed} />
              ))}
            </div>
          </div>
        )}

        <div className="breed-details-footer-nav">
          <Link to="/" className="btn btn-secondary">
            &larr; Back to Breed Explorer
          </Link>
          <Link to="/compare" className="btn btn-secondary">
            Compare Breeds
          </Link>
        </div>
      </div>
    </section>
  )
}
