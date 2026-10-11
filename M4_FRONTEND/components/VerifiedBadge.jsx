export default function VerifiedBadge({ className = '' }) {
  return (
    <span className={`verified-badge ${className}`.trim()}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M9 12.5 11 14.5 15.5 9.5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      </svg>
      Verified Seller
    </span>
  )
}
