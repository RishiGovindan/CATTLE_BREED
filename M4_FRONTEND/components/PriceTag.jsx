function formatPrice(price) {
  return `\₹${price.toLocaleString('en-IN')}`
}

/**
 * TradeHub's shared price display. Two sizes share the same visual
 * language (label + amount in a soft accent panel) so a listing's price
 * looks the same whether it's on a card, a details page, or a dashboard.
 *
 * size="compact" — used on ListingCard (grid density).
 * size="large" — used on ListingDetails (the main price moment).
 */
export default function PriceTag({ price, size = 'compact', className = '' }) {
  return (
    <div className={`price-tag price-tag-${size} ${className}`.trim()}>
      <span className="price-tag-label">Asking Price</span>
      <span className="price-tag-amount">{formatPrice(price)}</span>
    </div>
  )
}
