import { Link } from 'react-router-dom'

export default function EmptyState({ icon, title, message, actionLabel, actionHref }) {
  return (
    <div className="empty-state">
      {icon && (
        <span className="empty-state-icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <h3 className="empty-state-title">{title}</h3>
      {message && <p className="empty-state-message">{message}</p>}
      {actionLabel && actionHref && (
        <Link to={actionHref} className="btn btn-primary">
          {actionLabel}
        </Link>
      )}
    </div>
  )
}
