import { useState } from 'react'

export default function ListingGallery({ images, alt }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const safeImages = images && images.length > 0 ? images : []

  if (safeImages.length === 0) return null

  return (
    <div className="listing-gallery">
      <div className="listing-gallery-main">
        <img src={safeImages[activeIndex]} alt={alt} className="listing-gallery-main-image" />
      </div>

      {safeImages.length > 1 && (
        <div className="listing-gallery-thumbs" role="tablist" aria-label="Listing photos">
          {safeImages.map((image, index) => (
            <button
              key={image + index}
              type="button"
              role="tab"
              aria-selected={index === activeIndex}
              className={`listing-gallery-thumb${index === activeIndex ? ' is-active' : ''}`}
              onClick={() => setActiveIndex(index)}
            >
              <img src={image} alt={`${alt} view ${index + 1}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
