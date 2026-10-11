import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import ListingCard from '../components/ListingCard'
import MarketplaceFilters from '../components/MarketplaceFilters'
import EmptyState from '../components/EmptyState'
import ThemedSelect from '../components/ThemedSelect'
import { listingsApi } from '../services/api'
import { useAuth } from '../context/AuthContext'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'age-asc', label: 'Age: Youngest' },
  { value: 'age-desc', label: 'Age: Oldest' },
]

const DEFAULT_FILTERS = {
  query: '',
  animalType: 'all',
  breed: 'all',
  gender: 'all',
  location: 'all',
  minAge: '',
  maxAge: '',
  minPrice: '',
  maxPrice: '',
}

export default function Marketplace() {
  const { activeMode } = useAuth()
  const isSeller = activeMode === 'seller'
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    listingsApi.all().then(setListings).catch((error) => setLoadError(error.message || 'Could not load listings.')).finally(() => setLoading(false))
  }, [])
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [sort, setSort] = useState('newest')

  const breedOptions = useMemo(
    () => [...new Set(listings.map((listing) => listing.breed))].sort(),
    [listings],
  )
  const locationOptions = useMemo(
    () => [...new Set(listings.map((listing) => listing.location))].sort(),
    [listings],
  )

  const filteredListings = useMemo(() => {
    const normalizedQuery = filters.query.trim().toLowerCase()

    const result = listings.filter((listing) => {
      const sellerName = listing.sellerName ?? listing.seller?.farmName ?? ''
      const matchesQuery =
        normalizedQuery === '' ||
        listing.title.toLowerCase().includes(normalizedQuery) ||
        listing.breed.toLowerCase().includes(normalizedQuery) ||
        listing.location.toLowerCase().includes(normalizedQuery) ||
        sellerName.toLowerCase().includes(normalizedQuery)

      const matchesType = filters.animalType === 'all' || listing.animalType === filters.animalType
      const matchesBreed = filters.breed === 'all' || listing.breed === filters.breed
      const matchesGender = filters.gender === 'all' || listing.gender === filters.gender
      const matchesLocation = filters.location === 'all' || listing.location === filters.location

      const minAge = filters.minAge === '' ? -Infinity : Number(filters.minAge)
      const maxAge = filters.maxAge === '' ? Infinity : Number(filters.maxAge)
      const numericAge = Number(listing.age)
      const matchesAge = numericAge >= minAge && numericAge <= maxAge

      const minPrice = filters.minPrice === '' ? -Infinity : Number(filters.minPrice)
      const maxPrice = filters.maxPrice === '' ? Infinity : Number(filters.maxPrice)
      const matchesPrice = listing.price >= minPrice && listing.price <= maxPrice

      return (
        matchesQuery &&
        matchesType &&
        matchesBreed &&
        matchesGender &&
        matchesLocation &&
        matchesAge &&
        matchesPrice
      )
    })

    const sorted = [...result]
    switch (sort) {
      case 'price-asc':
        sorted.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        sorted.sort((a, b) => b.price - a.price)
        break
      case 'age-asc':
        sorted.sort((a, b) => a.age - b.age)
        break
      case 'age-desc':
        sorted.sort((a, b) => b.age - a.age)
        break
      case 'newest':
      default:
        sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        break
    }

    return sorted
  }, [listings, filters, sort])

  function handleQueryFromSearch(query) {
    setFilters((current) => ({ ...current, query }))
  }

  return (
    <section className="marketplace-page" id="marketplace">
      <div className="marketplace-inner">
        <div className="marketplace-intro">
          <span className="eyebrow">Livestock TradeHub</span>
          <h1 className="marketplace-title">Find Your Next Animal.</h1>
          <p className="marketplace-subtitle">
            Browse verified cattle and buffalo listings from farmers across India, or list your own
            livestock for other breeders to discover.
          </p>

          <div className="marketplace-intro-actions">
            {isSeller ? (
              <>
                <Link to="/create-listing" className="btn btn-primary">
                  List Your Livestock
                </Link>
                <Link to="/my-listings" className="btn btn-secondary">
                  My Listings
                </Link>
              </>
            ) : (
              <>
                <a href="#marketplace-results" className="btn btn-primary">
                  Explore Livestock
                </a>
                <Link to="/buyer-dashboard" className="btn btn-secondary">
                  My Dashboard
                </Link>
              </>
            )}
          </div>
        </div>

        <MarketplaceFilters
          filters={filters}
          onChange={setFilters}
          onClear={() => setFilters(DEFAULT_FILTERS)}
          breedOptions={breedOptions}
          locationOptions={locationOptions}
          resultCount={filteredListings.length}
        />

        <div className="marketplace-sort-row" id="marketplace-results">
          <label htmlFor="marketplace-sort" className="marketplace-sort-label">
            Sort by
          </label>
          <ThemedSelect id="marketplace-sort" value={sort} onChange={setSort} options={SORT_OPTIONS} />
        </div>

        {loading ? (
          <div className="breed-explorer-empty"><p>Loading listings…</p></div>
        ) : loadError ? (
          <div className="breed-explorer-empty"><p className="recognition-error">{loadError}</p></div>
        ) : filteredListings.length > 0 ? (
          <div className="listing-grid">
            {filteredListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="breed-explorer-empty">
            <EmptyState
              icon="⌕"
              title="No listings found"
              message="Try adjusting your filters or search term to see more livestock listings."
            />
          </div>
        )}
      </div>
    </section>
  )
}
