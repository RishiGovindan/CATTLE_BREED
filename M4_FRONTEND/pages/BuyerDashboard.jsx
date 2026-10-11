import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { savedApi, historyApi } from '../services/api'
import ListingCard from '../components/ListingCard'
import RecognitionHistoryList from '../components/RecognitionHistoryList'
import EmptyState from '../components/EmptyState'
import LoadingSpinner from '../components/LoadingSpinner'

const RECENT_RECOGNITIONS_LIMIT = 4

export default function BuyerDashboard() {
  const { profile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [savedListings, setSavedListings] = useState([])
  const [recognitionHistory, setRecognitionHistory] = useState([])

  useEffect(() => {
    Promise.all([savedApi.all(), historyApi.all()])
      .then(([saved, history]) => { setSavedListings(saved); setRecognitionHistory(history) })
      .catch(() => setError('We couldn\u2019t load your dashboard data. Please refresh and try again.'))
      .finally(() => setLoading(false))
  }, [])

  const firstName = profile?.full_name?.trim().split(' ')[0]

  if (loading) {
    return (
      <section className="breed-explorer favorites-page" id="buyer-dashboard">
        <div className="breed-explorer-inner">
          <LoadingSpinner label="Loading your dashboard…" />
        </div>
      </section>
    )
  }

  return (
    <section className="breed-explorer favorites-page buyer-dashboard-page" id="buyer-dashboard">
      <div className="breed-explorer-inner">
        <div className="breed-explorer-intro">
          <span className="eyebrow">Buyer Dashboard</span>
          <h1 className="breed-explorer-title">
            Welcome back{firstName ? `, ${firstName}` : ''}.
          </h1>
          <p className="breed-explorer-subtitle">
            Pick up where you left off — explore new livestock listings or identify a breed from a
            photo.
          </p>

          <div className="marketplace-intro-actions">
            <Link to="/marketplace" className="btn btn-primary">
              Explore TradeHub
            </Link>
            <Link to="/recognition" className="btn btn-secondary">
              Try Breed Recognition
            </Link>
          </div>
        </div>

        {error && (
          <p className="recognition-error" role="alert">
            {error}
          </p>
        )}

        <div className="dashboard-stats-grid">
          <div className="profile-stat-card dashboard-stat-card">
            <span className="profile-stat-label">Saved Listings</span>
            <p className="dashboard-stat-value">{savedListings.length}</p>
          </div>
          <div className="profile-stat-card dashboard-stat-card">
            <span className="profile-stat-label">Recent Breed Recognitions</span>
            <p className="dashboard-stat-value">{recognitionHistory.length}</p>
          </div>
        </div>

        <div className="dashboard-quick-actions">
          <h2 className="breed-details-section-title">Quick Actions</h2>
          <div className="marketplace-intro-actions">
            <Link to="/marketplace" className="btn btn-secondary">
              Explore TradeHub
            </Link>
            <Link to="/recognition" className="btn btn-secondary">
              Try Breed Recognition
            </Link>
            <Link to="/saved-listings" className="btn btn-secondary">
              View Saved Listings
            </Link>
          </div>
        </div>

        <div className="dashboard-section" id="buyer-saved-listings">
          <h2 className="breed-details-section-title">Saved Listings</h2>

          {savedListings.length > 0 ? (
            <div className="listing-grid">
              {savedListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="breed-explorer-empty">
              <EmptyState
                icon="♡"
                title="No saved listings yet"
                message="Tap the heart icon on any listing to save it here for quick access."
                actionLabel="Explore TradeHub"
                actionHref="/marketplace"
              />
            </div>
          )}
        </div>

        <div className="dashboard-section">
          <h2 className="breed-details-section-title">Recent Breed Recognitions</h2>
          <RecognitionHistoryList history={recognitionHistory.slice(0, RECENT_RECOGNITIONS_LIMIT)} />
        </div>
      </div>
    </section>
  )
}
