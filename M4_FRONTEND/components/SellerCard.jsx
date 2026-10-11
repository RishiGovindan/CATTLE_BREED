import { Link } from 'react-router-dom'
import VerifiedBadge from './VerifiedBadge'

export default function SellerCard({ seller }) {
  if (!seller) return null

  const listingCount = seller.listingCount ?? seller.listingsCount ?? 0

  return (
    <div className="seller-card">
      <img src={seller.image} alt={seller.farmName} className="seller-card-image" />

      <div className="seller-card-body">
        <div className="seller-card-heading">
          <h3 className="seller-card-name">{seller.farmName}</h3>
          {seller.verified && <VerifiedBadge />}
        </div>
        <p className="seller-card-location">{seller.location}</p>
        <p className="seller-card-meta">
          {seller.experience} years experience &middot; {listingCount} listing{listingCount === 1 ? '' : 's'}
        </p>

        <Link to={`/farmers/${seller.id}`} className="seller-card-link">
          View Farmer Profile <span aria-hidden="true">&rarr;</span>
        </Link>
      </div>
    </div>
  )
}
