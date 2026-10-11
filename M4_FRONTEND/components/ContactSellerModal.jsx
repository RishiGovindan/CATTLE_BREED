import { useState } from 'react'

export default function ContactSellerModal({ seller, listingTitle, onClose }) {
  const [form, setForm] = useState({ name: '', phone: '', message: `Hi, I'm interested in "${listingTitle}". Is it still available?` })
  const [sent, setSent] = useState(false)

  function handleChange(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    setSent(true)
  }

  return (
    <div className="breed-modal-overlay" onClick={onClose}>
      <div
        className="breed-modal contact-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`Contact ${seller?.farmName ?? 'seller'}`}
      >
        <button type="button" className="breed-modal-close" onClick={onClose} aria-label="Close">
          &times;
        </button>

        <span className="eyebrow">Contact Seller</span>
        <h3 className="breed-modal-name contact-modal-name">{seller?.farmName}</h3>
        <p className="breed-modal-origin">{seller?.location}</p>

        <div className="demo-mode-banner contact-modal-banner">
          <strong>Demo feature.</strong> BreedDex doesn&rsquo;t have live messaging yet — this form doesn&rsquo;t
          send a real message to the seller.
        </div>

        {sent ? (
          <div className="contact-modal-success">
            <span className="contact-modal-success-icon" aria-hidden="true">
              &#10003;
            </span>
            <h4>Message queued (demo)</h4>
            <p>
              In a live version of BreedDex, {seller?.farmName} would receive your message and reply directly.
            </p>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        ) : (
          <form className="contact-modal-form" onSubmit={handleSubmit}>
            <label className="contact-modal-field">
              <span>Your Name</span>
              <input
                type="text"
                required
                value={form.name}
                onChange={(event) => handleChange('name', event.target.value)}
                placeholder="Enter your name"
              />
            </label>

            <label className="contact-modal-field">
              <span>Phone Number</span>
              <input
                type="tel"
                required
                value={form.phone}
                onChange={(event) => handleChange('phone', event.target.value)}
                placeholder="Enter your phone number"
              />
            </label>

            <label className="contact-modal-field">
              <span>Message</span>
              <textarea
                required
                rows={4}
                value={form.message}
                onChange={(event) => handleChange('message', event.target.value)}
              />
            </label>

            <button type="submit" className="btn btn-primary contact-modal-submit">
              Send Message (Demo)
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
