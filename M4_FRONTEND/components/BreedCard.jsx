import { Link } from 'react-router-dom'
import CompareButton from './CompareButton'

export default function BreedCard({ breed }) {
  return (
    <article className="breed-card">
      <Link to={`/breeds/${breed.id}`} className="breed-card-image-wrap">
        <img src={breed.image} alt={breed.name} loading="lazy" className="breed-card-image" />
        <span className="breed-card-type">{breed.type === 'cattle' ? 'Cattle' : 'Buffalo'}</span>
        <div className="breed-card-actions">
          <CompareButton breedId={breed.id} />
        </div>
      </Link>

      <div className="breed-card-body">
        <h3 className="breed-card-name">{breed.name}</h3>
        <p className="breed-card-origin">{breed.origin}</p>
        <p className="breed-card-description">{breed.description}</p>

        <ul className="breed-card-tags">
          {breed.traits.slice(0, 3).map((trait) => (
            <li key={trait}>{trait}</li>
          ))}
        </ul>

        <Link to={`/breeds/${breed.id}`} className="breed-card-cta">
          Explore Breed <span aria-hidden="true">&rarr;</span>
        </Link>
      </div>
    </article>
  )
}
