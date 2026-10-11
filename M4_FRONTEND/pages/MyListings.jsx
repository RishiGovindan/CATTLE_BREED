import {
  useEffect,
  useState,
} from 'react'

import {
  Link,
} from 'react-router-dom'

import {
  listingsApi,
} from '../services/api'


export default function MyListings() {

  const [
    listings,
    setListings,
  ] = useState([])

  const [
    loading,
    setLoading,
  ] = useState(true)

  const [
    error,
    setError,
  ] = useState('')


  /*
  =========================================================
  LOAD SELLER LISTINGS
  =========================================================
  */

  useEffect(
    () => {

      loadListings()

    },
    [],
  )


  async function loadListings() {

    setLoading(true)

    setError('')

    try {

      const result =
        await listingsApi.mine()

      setListings(
        Array.isArray(result)
          ? result
          : [],
      )

    } catch (error) {

      setError(
        error.message ||
          'Could not load your listings. Please try again.',
      )

    } finally {

      setLoading(false)

    }
  }


  /*
  =========================================================
  FORMAT PRICE
  =========================================================
  */

  function formatPrice(price) {

    if (
      price === null ||
      price === undefined
    ) {
      return 'Price not available'
    }

    return new Intl.NumberFormat(
      'en-IN',
      {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      },
    ).format(price)
  }


  /*
  =========================================================
  FORMAT AGE
  =========================================================
  */

  function formatAge(listing) {

    if (listing.ageLabel) {
      return listing.ageLabel
    }

    if (
      listing.age === null ||
      listing.age === undefined ||
      listing.age === ''
    ) {
      return 'Age not specified'
    }

    return `${listing.age} years`
  }


  /*
  =========================================================
  LOADING STATE
  =========================================================
  */

  if (loading) {

    return (

      <section className="marketplace-page">

        <div className="marketplace-inner">

          <div className="breed-explorer-intro">

            <span className="eyebrow">

              Seller Dashboard

            </span>


            <h1 className="breed-explorer-title">

              My Listings

            </h1>


            <p className="breed-explorer-subtitle">

              Loading your livestock listings…

            </p>

          </div>


          <div
            className="create-listing-success"
            style={{
              marginTop: '32px',
            }}
          >

            <p>

              Loading your listings…

            </p>

          </div>

        </div>

      </section>
    )
  }


  /*
  =========================================================
  ERROR STATE
  =========================================================
  */

  if (error) {

    return (

      <section className="marketplace-page">

        <div className="marketplace-inner">

          <div className="breed-explorer-intro">

            <span className="eyebrow">

              Seller Dashboard

            </span>


            <h1 className="breed-explorer-title">

              My Listings

            </h1>

          </div>


          <div
            className="create-listing-success"
            style={{
              marginTop: '32px',
            }}
          >

            <span
              className="contact-modal-success-icon"
              aria-hidden="true"
            >
              !
            </span>


            <h2>

              Could Not Load Listings

            </h2>


            <p>

              {error}

            </p>


            <div
              className="create-listing-success-actions"
            >

              <button
                type="button"
                className="btn btn-primary"
                onClick={
                  loadListings
                }
              >

                Try Again

              </button>


              <Link
                to="/create-listing"
                className="btn btn-secondary"
              >

                Create Listing

              </Link>

            </div>

          </div>

        </div>

      </section>
    )
  }


  /*
  =========================================================
  EMPTY STATE
  =========================================================
  */

  if (listings.length === 0) {

    return (

      <section className="marketplace-page">

        <div className="marketplace-inner">

          <div className="breed-explorer-intro">

            <span className="eyebrow">

              Seller Dashboard

            </span>


            <h1 className="breed-explorer-title">

              My Listings

            </h1>


            <p className="breed-explorer-subtitle">

              Manage the livestock you have listed
              on the BreedDex TradeHub.

            </p>

          </div>


          <div
            className="create-listing-success"
            style={{
              marginTop: '32px',
            }}
          >

            <span
              className="contact-modal-success-icon"
              aria-hidden="true"
            >
              +
            </span>


            <h2>

              No Listings Yet

            </h2>


            <p>

              You have not published any livestock
              listings yet.

            </p>


            <div
              className="create-listing-success-actions"
            >

              <Link
                to="/create-listing"
                className="btn btn-primary"
              >

                Create Your First Listing

              </Link>

            </div>

          </div>

        </div>

      </section>
    )
  }


  /*
  =========================================================
  MAIN PAGE
  =========================================================
  */

  return (

    <section className="marketplace-page">

      <div className="marketplace-inner">


        {/* =================================================
            HEADER
        ================================================= */}

        <div
          className="breed-explorer-intro"
        >

          <span className="eyebrow">

            Seller Dashboard

          </span>


          <h1
            className="breed-explorer-title"
          >

            My Listings

          </h1>


          <p
            className="breed-explorer-subtitle"
          >

            Manage the livestock you have published
            on the BreedDex TradeHub.

          </p>


          <div
            style={{
              marginTop: '24px',
            }}
          >

            <Link
              to="/create-listing"
              className="btn btn-primary"
            >

              + Create New Listing

            </Link>

          </div>

        </div>


        {/* =================================================
            LISTING COUNT
        ================================================= */}

        <div
          style={{
            marginTop: '32px',
            marginBottom: '20px',
          }}
        >

          <p
            style={{
              opacity: 0.75,
            }}
          >

            {listings.length === 1
              ? '1 active listing'
              : `${listings.length} active listings`}

          </p>

        </div>


        {/* =================================================
            LISTINGS GRID
        ================================================= */}

        <div
          className="marketplace-grid"
        >

          {listings.map(
            (listing) => {

              const image =
                listing.images &&
                listing.images.length > 0
                  ? listing.images[0]
                  : null


              return (

                <article
                  key={listing.id}
                  className="marketplace-card"
                >


                  {/* =========================================
                      IMAGE
                  ========================================= */}

                  <div
                    className="marketplace-card-image"
                  >

                    {image ? (

                      <img
                        src={image}
                        alt={
                          listing.title ||
                          listing.breed
                        }
                      />

                    ) : (

                      <div
                        style={{
                          minHeight: '220px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: 0.6,
                        }}
                      >

                        No image

                      </div>

                    )}

                  </div>


                  {/* =========================================
                      CONTENT
                  ========================================= */}

                  <div
                    className="marketplace-card-content"
                  >


                    <div
                      style={{
                        display: 'flex',
                        justifyContent:
                          'space-between',
                        gap: '12px',
                        alignItems:
                          'flex-start',
                      }}
                    >

                      <div>

                        <span
                          className="eyebrow"
                        >

                          {listing.animalType}

                        </span>


                        <h2
                          style={{
                            marginTop: '8px',
                          }}
                        >

                          {listing.title ||
                            listing.breed}

                        </h2>

                      </div>


                      <span
                        style={{
                          fontSize: '0.85rem',
                          padding:
                            '6px 10px',
                          borderRadius:
                            '999px',
                          border:
                            '1px solid currentColor',
                          opacity: 0.8,
                          whiteSpace:
                            'nowrap',
                        }}
                      >

                        Active

                      </span>

                    </div>


                    <p
                      style={{
                        marginTop: '12px',
                        opacity: 0.8,
                      }}
                    >

                      {listing.breed}

                      {' · '}

                      {listing.gender}

                      {' · '}

                      {formatAge(listing)}

                    </p>


                    <p
                      style={{
                        marginTop: '8px',
                        opacity: 0.75,
                      }}
                    >

                      📍 {listing.location}

                    </p>


                    <h3
                      style={{
                        marginTop: '16px',
                      }}
                    >

                      {formatPrice(
                        listing.price,
                      )}

                    </h3>
                    {/* =====================================
    AI BREED VERIFICATION
===================================== */}

{listing.aiVerificationStatus && (

  <div
    style={{
      marginTop: '20px',
      padding: '14px',
      borderRadius: '12px',
      border:
        '1px solid rgba(255, 255, 255, 0.15)',
    }}
  >

    <strong>

      {listing.aiVerificationStatus ===
      'VERIFIED'
        ? '✓ AI Breed Verified'
        : listing.aiVerificationStatus ===
          'REVIEW_REQUIRED'
          ? '⚠ AI Breed Review Recommended'
          : listing.aiVerificationStatus ===
            'LOW_CONFIDENCE_MATCH'
            ? '⚠ Low Confidence Match'
            : listing.aiVerificationStatus ===
              'MISMATCH'
              ? '✕ Breed Mismatch'
              : 'AI Verification Result'}

    </strong>


    {listing.aiTopBreed && (

      <p
        style={{
          marginTop: '8px',
          opacity: 0.8,
        }}
      >

        AI prediction:

        {' '}

        <strong>

          {listing.aiTopBreed}

        </strong>

      </p>

    )}


    {typeof listing.aiTopConfidence ===
      'number' && (

      <p
        style={{
          marginTop: '4px',
          opacity: 0.8,
        }}
      >

        AI confidence:

        {' '}

        {(
          listing.aiTopConfidence *
          100
        ).toFixed(1)}

        %

      </p>

    )}


    {listing.aiMessage && (

      <p
        style={{
          marginTop: '8px',
          fontSize: '0.85rem',
          opacity: 0.65,
        }}
      >

        {listing.aiMessage}

      </p>

    )}

  </div>

)}

                    {/* =====================================
                        ACTIONS
                    ===================================== */}

                    <div
                      className="create-listing-success-actions"
                      style={{
                        marginTop: '24px',
                      }}
                    >

                      <Link
                        to={`/marketplace/${listing.id}`}
                        className="btn btn-primary"
                      >

                        View Listing

                      </Link>


                      <Link
                        to={`/edit-listing/${listing.id}`}
                        className="btn btn-secondary"
                      >

                        Edit

                      </Link>

                    </div>


                    <p
                      style={{
                        marginTop: '16px',
                        fontSize:
                          '0.85rem',
                        opacity: 0.65,
                      }}
                    >

                      Listing ID: {listing.id}

                    </p>

                  </div>

                </article>

              )
            },
          )}

        </div>


        {/* =================================================
            REFRESH BUTTON
        ================================================= */}

        <div
          style={{
            marginTop: '40px',
            textAlign: 'center',
          }}
        >

          <button
            type="button"
            className="btn btn-secondary"
            onClick={
              loadListings
            }
          >

            Refresh Listings

          </button>

        </div>


      </div>

    </section>
  )
}