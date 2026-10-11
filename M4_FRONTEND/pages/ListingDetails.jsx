import {
  useEffect,
  useState,
} from 'react'

import {
  Link,
  useNavigate,
  useParams,
} from 'react-router-dom'

import {
  listingsApi,
} from '../services/api'

import ListingGallery from '../components/ListingGallery'

import SaveListingButton from '../components/SaveListingButton'

import SellerCard from '../components/SellerCard'

import CompareButton from '../components/CompareButton'

import ContactSellerModal from '../components/ContactSellerModal'

import EmptyState from '../components/EmptyState'

import PriceTag from '../components/PriceTag'


export default function ListingDetails() {


  const {
    listingId,
  } = useParams()


  const navigate =
    useNavigate()


  const [
    listing,
    setListing,
  ] = useState(null)


  const [
    loading,
    setLoading,
  ] = useState(true)


  const [
    contactOpen,
    setContactOpen,
  ] = useState(false)


  /*
  =========================================================
  LOAD LISTING
  =========================================================
  */

  useEffect(
    () => {

      listingsApi
        .byId(listingId)
        .then(
          setListing,
        )
        .catch(
          () => setListing(null),
        )
        .finally(
          () => setLoading(false),
        )

    },
    [
      listingId,
    ],
  )


  /*
  =========================================================
  LOADING
  =========================================================
  */

  if (loading) {

    return (

      <section
        className="breed-details-page"
      >

        <div
          className="breed-details-inner"
        >

          <p>

            Loading listing…

          </p>

        </div>

      </section>

    )

  }


  /*
  =========================================================
  NOT FOUND
  =========================================================
  */

  if (!listing) {

    return (

      <section
        className="breed-details-page"
      >

        <div
          className="breed-details-inner"
        >

          <EmptyState
            icon="?"
            title="Listing not found"
            message="This listing may have been removed or the link is incorrect."
            actionLabel="Back to TradeHub"
            actionHref="/marketplace"
          />

        </div>

      </section>

    )

  }


  const seller =
    listing.seller


  /*
  =========================================================
  MAIN PAGE
  =========================================================
  */

  return (

    <section
      className="breed-details-page listing-details-page"
    >

      <div
        className="breed-details-inner"
      >


        {/* =================================================
            BACK BUTTON
        ================================================= */}

        <button
          type="button"
          className="breed-details-back"
          onClick={
            () => navigate(-1)
          }
        >

          <span
            aria-hidden="true"
          >

            &larr;

          </span>

          {' '}

          Back to TradeHub

        </button>


        <div
          className="listing-details-layout"
        >


          {/* ===============================================
              MAIN CONTENT
          ================================================ */}

          <div
            className="listing-details-main"
          >


            {/* =============================================
                IMAGE GALLERY
            ============================================== */}

            <ListingGallery
              images={
                listing.images?.length
                  ? listing.images
                  : []
              }
              alt={
                listing.title
              }
            />


            {/* =============================================
                LISTING HEADING
            ============================================== */}

            <div
              className="listing-details-heading"
            >


              <div
                className="listing-details-heading-top"
              >

                <span
                  className="breed-card-type listing-details-type"
                >

                  {listing.animalType ===
                  'cattle'
                    ? 'Cattle'
                    : 'Buffalo'}

                </span>


                <SaveListingButton
                  listingId={
                    listing.id
                  }
                  className="breed-details-favorite"
                />

              </div>


              <h1
                className="breed-details-name"
              >

                {listing.title}

              </h1>


              <PriceTag
                price={
                  listing.price
                }
                size="large"
              />


              {/* =========================================
                  LISTING FACTS
              ========================================== */}

              <ul
                className="listing-details-facts"
              >

                <li>

                  <span>

                    Breed

                  </span>

                  {listing.breed}

                </li>


                <li>

                  <span>

                    Age

                  </span>

                  {listing.ageLabel}

                </li>


                <li>

                  <span>

                    Gender

                  </span>

                  {listing.gender}

                </li>


                <li>

                  <span>

                    Location

                  </span>

                  {listing.location}

                </li>

              </ul>


              {/* =========================================
                  AI BREED VERIFICATION
              ========================================== */}

              {listing.aiVerificationStatus && (

                <div
                  style={{
                    marginTop: '28px',
                    padding: '20px',
                    borderRadius: '14px',
                    border:
                      '1px solid rgba(255, 255, 255, 0.15)',
                  }}
                >


                  <h2
                    className="breed-details-section-title"
                    style={{
                      marginBottom: '16px',
                    }}
                  >

                    AI Breed Verification

                  </h2>


                  <p>

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

                  </p>


                  {/* AI TOP BREED */}

                  {listing.aiTopBreed && (

                    <p
                      style={{
                        marginTop: '12px',
                      }}
                    >

                      AI prediction:

                      {' '}

                      <strong>

                        {listing.aiTopBreed}

                      </strong>

                    </p>

                  )}


                  {/* AI CONFIDENCE */}

                  {typeof
                    listing.aiTopConfidence ===
                    'number' && (

                    <p
                      style={{
                        marginTop: '6px',
                      }}
                    >

                      AI confidence:

                      {' '}

                      <strong>

                        {(
                          listing.aiTopConfidence *
                          100
                        ).toFixed(1)}

                        %

                      </strong>

                    </p>

                  )}


                  {/* AI MESSAGE */}

                  {listing.aiMessage && (

                    <p
                      className="listing-details-description"
                      style={{
                        marginTop: '14px',
                      }}
                    >

                      {listing.aiMessage}

                    </p>

                  )}

                </div>

              )}


              {/* =========================================
                  COMPARE BUTTON
              ========================================== */}

              {listing.breedId && (

                <div
                  className="breed-details-heading-actions"
                >

                  <CompareButton
                    breedId={
                      listing.breedId
                    }
                    variant="text"
                  />

                </div>

              )}

            </div>


            {/* =============================================
                DESCRIPTION
            ============================================== */}

            <div
              className="listing-details-section"
            >

              <h2
                className="breed-details-section-title"
              >

                Description

              </h2>


              <p
                className="listing-details-description"
              >

                {listing.description}

              </p>

            </div>


            {/* =============================================
                HEALTH + VACCINATION
            ============================================== */}

            <div
              className="breed-details-columns"
            >


              <div
                className="breed-details-column"
              >

                <h2
                  className="breed-details-section-title"
                >

                  Health Information

                </h2>


                <p
                  className="listing-details-description"
                >

                  {listing.healthStatus}

                </p>

              </div>


              <div
                className="breed-details-column"
              >

                <h2
                  className="breed-details-section-title"
                >

                  Vaccination Status

                </h2>


                <p
                  className="listing-details-description"
                >

                  {listing.vaccinationStatus}

                </p>

              </div>


            </div>


          </div>


          {/* ===============================================
              SIDEBAR
          ================================================ */}

          <aside
            className="listing-details-sidebar"
          >

            {seller && (

              <>

                <SellerCard
                  seller={
                    seller
                  }
                />


                <button
                  type="button"
                  className="btn btn-primary listing-details-contact"
                  onClick={
                    () => setContactOpen(true)
                  }
                >

                  Contact Seller

                </button>

              </>

            )}

          </aside>


        </div>


        {/* =================================================
            FOOTER NAVIGATION
        ================================================= */}

        <div
          className="breed-details-footer-nav"
        >

          <Link
            to="/marketplace"
            className="btn btn-secondary"
          >

            &larr; Back to TradeHub

          </Link>


          <Link
            to="/saved-listings"
            className="btn btn-secondary"
          >

            View Saved Listings

          </Link>

        </div>


      </div>


      {/* ===================================================
          CONTACT SELLER MODAL
      ==================================================== */}

      {contactOpen && (

        <ContactSellerModal
          seller={
            seller
          }
          listingTitle={
            listing.title
          }
          onClose={
            () => setContactOpen(false)
          }
        />

      )}


    </section>

  )

}