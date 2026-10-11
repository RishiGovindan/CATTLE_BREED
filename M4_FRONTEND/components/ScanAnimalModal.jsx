import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import ImageUploader from './ImageUploader'
import ListingCard from './ListingCard'
import EmptyState from './EmptyState'
import { mockAnalyzeImage } from '../utils/mockRecognition'
import { recognizeBreedImage } from '../services/api'
import { HAS_BACKEND } from '../utils/constants'
import { addRecognitionHistoryItem } from '../utils/storage'
import { getAllListings } from '../utils/marketplaceStorage'

export default function ScanAnimalModal({ onClose }) {
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [status, setStatus] = useState('idle') // idle | scanning | done | error
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const objectUrlRef = useRef(null)

  function handleFileSelected(selectedFile) {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    const url = URL.createObjectURL(selectedFile)
    objectUrlRef.current = url
    setFile(selectedFile)
    setPreviewUrl(url)
    setResult(null)
    setError('')
    setStatus('idle')
  }

  function handleClearImage() {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    objectUrlRef.current = null
    setFile(null)
    setPreviewUrl(null)
    setResult(null)
    setError('')
    setStatus('idle')
  }

  async function handleScan() {
    if (!file) return
    setError('')
    setStatus('scanning')

    try {
      // Same recognition flow as the dedicated /recognition page: uses the
      // real backend once VITE_API_BASE_URL is configured, otherwise falls
      // back to local demo analysis.
      const analysis = HAS_BACKEND ? await recognizeBreedImage(file) : await mockAnalyzeImage(file)

      if (!analysis || !analysis.breed) {
        throw new Error('The AI model could not identify a breed from this image.')
      }

      setResult(analysis)
      setStatus('done')

      addRecognitionHistoryItem({
        id: `${Date.now()}`,
        timestamp: new Date().toISOString(),
        image: previewUrl,
        breedId: analysis.breedId,
        breed: analysis.breed,
        animalType: analysis.animalType,
        confidence: analysis.confidence,
      })
    } catch (err) {
      setError(err?.message || 'We couldn\u2019t analyze this image. Please try again.')
      setStatus('error')
    }
  }

  const matchingListings = result
    ? (() => {
        const all = getAllListings()
        const sameBreed = all.filter((listing) => listing.breedId === result.breedId)
        if (sameBreed.length > 0) return sameBreed
        return all.filter((listing) => listing.animalType === result.animalType.toLowerCase())
      })()
    : []

  return (
    <div className="breed-modal-overlay" onClick={onClose}>
      <div
        className="breed-modal scan-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Scan an animal to find matching listings"
      >
        <button type="button" className="breed-modal-close" onClick={onClose} aria-label="Close">
          &times;
        </button>

        <span className="eyebrow">Visual Search</span>
        <h3 className="breed-modal-name scan-modal-title">Scan Animal</h3>
        <p className="breed-modal-origin scan-modal-subtitle">
          Upload a photo to identify the breed and find similar listings on TradeHub.
        </p>

        {!HAS_BACKEND && (
          <p className="demo-mode-banner scan-modal-banner">
            <strong>Demo AI Analysis</strong> — results are generated from mock data, not a live
            machine-learning model.
          </p>
        )}

        <div className={`scan-uploader${status === 'scanning' ? ' is-scanning' : ''}`}>
          <ImageUploader
            onFileSelected={handleFileSelected}
            previewUrl={previewUrl}
            onClear={handleClearImage}
            disabled={status === 'scanning'}
          />
          {status === 'scanning' && <span className="scan-sweep" aria-hidden="true" />}
        </div>

        {previewUrl && status !== 'done' && (
          <button
            type="button"
            className="btn btn-primary scan-analyze-btn"
            onClick={handleScan}
            disabled={status === 'scanning'}
          >
            {status === 'scanning' ? 'Scanning…' : 'Analyze Breed'}
          </button>
        )}

        {status === 'scanning' && (
          <div className="recognition-loading" role="status" aria-live="polite">
            <span className="spinner-ring" />
            <span>Scanning image…</span>
          </div>
        )}

        {status === 'error' && error && (
          <p className="recognition-error" role="alert">
            {error}
          </p>
        )}

        {status === 'done' && result && (
          <div className="scan-results">
            <div className="scan-result-summary">
              <div>
                <span className="eyebrow">{HAS_BACKEND ? 'AI Result' : 'Demo Result'}</span>
                <h4 className="scan-result-breed">{result.breed}</h4>
                <p className="recognition-result-type">{result.animalType}</p>
              </div>
              <div className="recognition-confidence scan-result-confidence">
                <div className="recognition-confidence-track">
                  <div className="recognition-confidence-fill" style={{ width: `${result.confidence}%` }} />
                </div>
                <span className="recognition-confidence-label">{result.confidence}% confidence</span>
              </div>
            </div>

            <Link to={`/breeds/${result.breedId}`} className="btn btn-secondary scan-profile-link">
              View Full Breed Profile <span aria-hidden="true">&rarr;</span>
            </Link>

            <h4 className="breed-details-section-title scan-results-title">
              {matchingListings.length > 0 ? 'Matching TradeHub Listings' : 'Similar Available Animals'}
            </h4>

            {matchingListings.length > 0 ? (
              <div className="listing-grid scan-results-grid">
                {matchingListings.slice(0, 4).map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon="⌕"
                title="No matching listings right now"
                message={`There aren't any ${result.breed} listings on TradeHub at the moment. Check back soon or browse all listings.`}
                actionLabel="Browse TradeHub"
                actionHref="/marketplace"
              />
            )}

            <button type="button" className="btn btn-secondary scan-again-btn" onClick={handleClearImage}>
              Scan Another Image
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
