import { Link } from 'react-router-dom'
import SaveListingButton from './SaveListingButton'
import PriceTag from './PriceTag'

export default function ListingCard({ listing }) {
  const seller = listing.seller || null

  return (
    <article className="listing-card">
      <Link to={`/marketplace/${listing.id}`} className="listing-card-image-wrap">
        <img src={listing.images?.[0] || '/placeholder-animal.svg'} alt={listing.title} loading="lazy" className="listing-card-image" />
        <span className="breed-card-type">{listing.animalType === 'cattle' ? 'Cattle' : 'Buffalo'}</span>
        <div className="breed-card-actions">
          <SaveListingButton listingId={listing.id} />
        </div>
      </Link>

      <div className="listing-card-body">
        <div className="listing-card-heading">
          <h3 className="listing-card-title">{listing.title}</h3>
        </div>

        <PriceTag price={listing.price} size="compact" />

        <ul className="listing-card-meta">
          <li>{listing.breed}</li>
          <li>{listing.ageLabel}</li>
          <li>{listing.gender}</li>
        </ul>

        <p className="listing-card-location">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M12 22s7-7.2 7-12.5A7 7 0 0 0 5 9.5C5 14.8 12 22 12 22Z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="9.5" r="2.4" stroke="currentColor" strokeWidth="1.6" />
          </svg>
          {listing.location}
        </p>

        <div className="listing-card-footer">
          <span className="listing-card-seller">
            {seller?.farmName || listing.sellerName || 'Private Seller'}
            {seller?.verified && (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="listing-card-seller-check">
                <path
                  d="M9 12.5 11 14.5 15.5 9.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
              </svg>
            )}
          </span>
          <Link to={`/marketplace/${listing.id}`} className="listing-card-cta">
            View <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </div>
    </article>
  )
}
