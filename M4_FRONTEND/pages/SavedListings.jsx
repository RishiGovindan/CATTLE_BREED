import { useEffect, useState } from 'react'
import { savedApi } from '../services/api'
import ListingCard from '../components/ListingCard'
import EmptyState from '../components/EmptyState'

export default function SavedListings() {
  const [savedListings, setSavedListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => {
    savedApi.all().then(setSavedListings).catch((e) => setError(e.message || 'Could not load saved listings.')).finally(() => setLoading(false))
  }, [])
  return <section className="breed-explorer favorites-page" id="saved-listings"><div className="breed-explorer-inner">
    <div className="breed-explorer-intro"><span className="eyebrow">Your Collection</span><h2 className="breed-explorer-title">Saved Listings.</h2>
      <p className="breed-explorer-subtitle">Livestock listings you&apos;ve saved to your BreedDex account.</p></div>
    {loading ? <div className="breed-explorer-empty"><p>Loading saved listings…</p></div> :
      error ? <p className="recognition-error">{error}</p> :
      savedListings.length > 0 ? <div className="listing-grid">{savedListings.map((listing)=><ListingCard key={listing.id} listing={listing}/>)}</div> :
      <div className="breed-explorer-empty"><EmptyState icon="♡" title="No saved listings yet" message="Tap the heart icon on any listing to save it here." actionLabel="Explore TradeHub" actionHref="/marketplace"/></div>}
  </div></section>
}