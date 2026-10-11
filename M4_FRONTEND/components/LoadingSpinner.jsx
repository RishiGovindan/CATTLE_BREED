export default function LoadingSpinner({ label = 'Loading' }) {
  return (
    <div className="spinner-wrap" role="status" aria-live="polite">
      <span className="spinner-ring" />
      <span className="spinner-label">{label}</span>
    </div>
  )
}
