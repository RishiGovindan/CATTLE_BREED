export default function NotFound() {
  return (
    <div className="not-found">
      <p className="eyebrow">404</p>
      <h1>This pasture is empty.</h1>
      <p className="muted">The page you're looking for doesn't exist.</p>
      <a href="/" className="btn btn-primary">
        Back to Home
      </a>
    </div>
  )
}
