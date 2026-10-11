import { Link } from 'react-router-dom'
import EmptyState from './EmptyState'

function formatTimestamp(iso) {
  const date = new Date(iso)
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

/**
 * Renders a grid of recognition history entries (as saved by
 * utils/storage.js addRecognitionHistoryItem). Shared by the Recognition
 * page (full history, removable) and the Buyer Dashboard (recent preview).
 */
export default function RecognitionHistoryList({ history, limit, onRemove, emptyActionHref = '/recognition' }) {
  const items = typeof limit === 'number' ? history.slice(0, limit) : history

  if (items.length === 0) {
    return (
      <EmptyState
        icon="⌕"
        title="No breed recognitions yet"
        message="Analyze a photo to see your recognition history here."
        actionLabel="Try Breed Recognition"
        actionHref={emptyActionHref}
      />
    )
  }

  return (
    <div className="recognition-history-grid">
      {items.map((entry) => (
        <div className="recognition-history-item" key={entry.id}>
          <Link to={`/breeds/${entry.breedId}`} className="recognition-history-image-link">
            <img src={entry.image} alt={entry.breed} />
          </Link>
          <div className="recognition-history-body">
            <Link to={`/breeds/${entry.breedId}`} className="recognition-history-name">
              {entry.breed}
            </Link>
            <p className="recognition-history-meta">
              {entry.animalType} · {entry.confidence}% match · {formatTimestamp(entry.timestamp)}
            </p>
          </div>
          {onRemove && (
            <button
              type="button"
              className="recognition-history-remove"
              onClick={() => onRemove(entry.id)}
              aria-label={`Remove ${entry.breed} analysis from history`}
            >
              &times;
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
