import {
  useRef,
  useState,
} from 'react'

import {
  Link,
} from 'react-router-dom'

import ImageUploader from '../components/ImageUploader'
import ThemedSelect from '../components/ThemedSelect'

import {
  listingsApi,
  verifyListingBreed,
} from '../services/api'


const ANIMAL_TYPE_OPTIONS = [
  {
    value: 'cattle',
    label: 'Cattle',
  },
  {
    value: 'buffalo',
    label: 'Buffalo',
  },
]


const GENDER_OPTIONS = [
  {
    value: 'Female',
    label: 'Female',
  },
  {
    value: 'Male',
    label: 'Male',
  },
]


const INITIAL_FORM = {
  title: '',
  animalType: 'cattle',
  breed: '',
  age: '',
  gender: 'Female',
  price: '',
  location: '',
  description: '',
  healthStatus: '',
}


export default function CreateListing() {

  const [submitting, setSubmitting] =
    useState(false)

  const [verifying, setVerifying] =
    useState(false)

  const [form, setForm] =
    useState(INITIAL_FORM)

  const [errors, setErrors] =
    useState({})

  const [file, setFile] =
    useState(null)

  const [previewUrl, setPreviewUrl] =
    useState(null)

  const [createdListing, setCreatedListing] =
    useState(null)

  const [submitError, setSubmitError] =
    useState('')

  const [verificationResult, setVerificationResult] =
    useState(null)

  const objectUrlRef =
    useRef(null)


  /*
  =========================================================
  FORM HELPERS
  =========================================================
  */

  function update(field, value) {

    setForm((current) => ({
      ...current,
      [field]: value,
    }))

    setErrors((current) => ({
      ...current,
      [field]: '',
    }))
  }


  function handleAnimalTypeChange(value) {

    setForm((current) => ({
      ...current,
      animalType: value,
    }))
  }


  function handleFileSelected(selectedFile) {

    if (!selectedFile) {
      return
    }

    if (objectUrlRef.current) {

      URL.revokeObjectURL(
        objectUrlRef.current,
      )
    }

    const url =
      URL.createObjectURL(
        selectedFile,
      )

    objectUrlRef.current =
      url

    setFile(selectedFile)

    setPreviewUrl(url)

    setVerificationResult(null)

    setErrors((current) => ({
      ...current,
      image: '',
    }))
  }


  function handleClearImage() {

    if (objectUrlRef.current) {

      URL.revokeObjectURL(
        objectUrlRef.current,
      )
    }

    objectUrlRef.current =
      null

    setFile(null)

    setPreviewUrl(null)

    setVerificationResult(null)
  }


  /*
  =========================================================
  VALIDATION
  =========================================================
  */

  function validate() {

    const nextErrors = {}

    if (!form.title.trim()) {

      nextErrors.title =
        'Listing title is required.'
    }

    if (!form.breed.trim()) {

      nextErrors.breed =
        'Enter the breed name.'
    }

    if (
      !form.age ||
      Number(form.age) <= 0
    ) {

      nextErrors.age =
        'Enter a valid age.'
    }

    if (
      !form.price ||
      Number(form.price) <= 0
    ) {

      nextErrors.price =
        'Enter a valid price.'
    }

    if (!form.location.trim()) {

      nextErrors.location =
        'Location is required.'
    }

    if (!form.description.trim()) {

      nextErrors.description =
        'Add a short description.'
    }

    if (!form.healthStatus.trim()) {

      nextErrors.healthStatus =
        'Add a health status note.'
    }

    if (!file) {

      nextErrors.image =
        'Upload a photo of the animal.'
    }

    setErrors(nextErrors)

    return (
      Object.keys(nextErrors).length === 0
    )
  }


  /*
  =========================================================
  CONVERT IMAGE TO BASE64
  =========================================================
  */

  function convertImageToBase64(imageFile) {

    return new Promise(
      (resolve, reject) => {

        const reader =
          new FileReader()

        reader.onload = () => {

          resolve(
            reader.result,
          )
        }

        reader.onerror =
          reject

        reader.readAsDataURL(
          imageFile,
        )
      },
    )
  }


  /*
  =========================================================
  CREATE LISTING

  This permanently saves the AI verification data.
  =========================================================
  */
async function publishListing({
  verification = null,
} = {}) {

  setSubmitting(true)

  setSubmitError('')

  try {

    const image =
      await convertImageToBase64(
        file,
      )

    const listing =
      await listingsApi.create({

        /*
        =================================================
        BASIC LISTING DATA
        =================================================
        */

        title:
          form.title.trim(),

        animal_type:
          form.animalType,

        breed:
          form.breed.trim(),

        breed_id:
          null,

        age:
          String(form.age),

        gender:
          form.gender,

        price:
          Number(form.price),

        location:
          form.location.trim(),

        description:
          form.description.trim(),

        health_status:
          form.healthStatus.trim(),

        vaccination_status:
          'Not specified — contact the seller for vaccination records.',

        image,


        /*
        =================================================
        AI BREED VERIFICATION
        =================================================
        */

        ai_verification_status:
          verification
            ?.verification_status ||
          null,


        ai_top_breed:
          verification
            ?.ai_top_breed ||
          null,


        ai_top_confidence:
          verification
            ?.ai_top_confidence ??
          null,


        ai_seller_breed_in_top_3:
          verification
            ?.seller_breed_in_top_3 ??
          null,


        ai_seller_breed_confidence:
          verification
            ?.seller_breed_confidence ??
          null,


        ai_message:
          verification
            ?.message ||
          null,


        ai_top_predictions:
          verification
            ?.top_predictions ||
          null,

      })


    setVerificationResult(null)

    setCreatedListing(
      listing,
    )

  } catch (error) {

    setSubmitError(

      error.message ||

      'Something went wrong while publishing your listing. Please try again.',
    )

  } finally {

    setSubmitting(false)

  }
}


  /*
  =========================================================
  MAIN SUBMIT

  First validate the listing.

  Then send the image and seller breed
  to the AI verification endpoint.
  =========================================================
  */

  async function handleSubmit(event) {

    event.preventDefault()

    setSubmitError('')

    setVerificationResult(null)

    if (!validate()) {

      return
    }


    /*
    =====================================================
    STEP 1
    VERIFY BREED WITH AI
    =====================================================
    */

    setVerifying(true)

    try {

      const result =
        await verifyListingBreed(
          form.breed.trim(),
          file,
        )


      /*
      ===================================================
      VERIFIED

      AI strongly agrees with seller.

      Publish immediately.
      ===================================================
      */

      if (
        result.verification_status ===
        'VERIFIED'
      ) {

        setVerifying(false)

        await publishListing({

  verification:
    result,

})

        return
      }


      /*
      ===================================================
      ALL OTHER RESULTS

      Let the seller review the result
      and decide whether to publish.
      ===================================================
      */

      setVerificationResult(
        result,
      )

    } catch (error) {

      setSubmitError(

        error.message ||

        'Could not verify the animal breed. Please try again.',
      )

    } finally {

      setVerifying(false)
    }
  }


  /*
  =========================================================
  SELLER CONFIRMS "PUBLISH ANYWAY"

  This permanently records that the seller
  confirmed the listing after seeing the
  AI verification result.
  =========================================================
  */

  async function handlePublishAnyway() {

    const result =
      verificationResult

    if (!result) {

      return
    }

    await publishListing({

  verification:
    result,

})
  }


  /*
  =========================================================
  GO BACK TO FORM
  =========================================================
  */

  function handleGoBack() {

    setVerificationResult(
      null,
    )
  }


  /*
  =========================================================
  SELLER WANTS TO TRY ANOTHER IMAGE
  =========================================================
  */

  function handleUploadAnother() {

    setVerificationResult(
      null,
    )

    handleClearImage()
  }


  /*
  =========================================================
  CREATE ANOTHER LISTING
  =========================================================
  */

  function handleCreateAnother() {

    setForm(
      INITIAL_FORM,
    )

    setErrors({})

    setSubmitError('')

    handleClearImage()

    setCreatedListing(null)

    setVerificationResult(null)
  }


  /*
  =========================================================
  GET VERIFICATION DISPLAY DETAILS
  =========================================================
  */

  function getVerificationDetails(result) {

    const status =
      result.verification_status

    let title =
      'Breed Verification'

    let description =
      result.message ||
      'The AI has completed the breed verification.'


    if (
      status ===
      'LOW_CONFIDENCE_MATCH'
    ) {

      title =
        'Low Confidence Match'

      const confidence =
        result.ai_top_confidence

      description =
        `The AI prediction matches "${result.seller_breed}", but the confidence is ${
          typeof confidence === 'number'
            ? `${(confidence * 100).toFixed(1)}%`
            : 'low'
        }.`
    }


    if (
      status ===
      'REVIEW_REQUIRED'
    ) {

      title =
        'Breed Review Recommended'

      description =
        `You selected "${result.seller_breed}", but the AI's top prediction is "${result.ai_top_breed}". Your selected breed appears in the AI's Top-3 predictions.`
    }


    if (
      status ===
      'MISMATCH'
    ) {

      title =
        'Breed Could Not Be Verified'

      description =
        `You selected "${result.seller_breed}", but the AI identified the animal as "${result.ai_top_breed}". Please review the information before publishing.`
    }


    if (
      status ===
      'UNSUPPORTED'
    ) {

      title =
        'AI Could Not Verify This Image'

      description =
        result.message ||
        'The uploaded image could not be verified by the AI.'
    }


    if (
      status ===
      'ERROR'
    ) {

      title =
        'Breed Verification Could Not Be Completed'

      description =
        result.message ||
        'The AI could not complete the breed verification. You may review your listing and choose whether to continue.'
    }


    return {
      title,
      description,
    }
  }


  /*
  =========================================================
  VERIFICATION RESULT SCREEN
  =========================================================
  */

  if (verificationResult) {

    const result =
      verificationResult

    const status =
      result.verification_status

    const {
      title,
      description,
    } =
      getVerificationDetails(
        result,
      )


    return (

      <section className="create-listing-page">

        <div className="create-listing-inner">

          <div className="create-listing-success">


            <span
              className="contact-modal-success-icon"
              aria-hidden="true"
            >
              !
            </span>


            <h1 className="breed-explorer-title">

              {title}

            </h1>


            <p className="breed-explorer-subtitle">

              {description}

            </p>


            {/* ============================================
                VERIFICATION STATUS
            ============================================= */}

            <div
              style={{
                marginTop: '24px',
                textAlign: 'left',
              }}
            >

              <p>

                <strong>
                  Verification status:
                </strong>

                {' '}

                {status}

              </p>


              <p>

                <strong>
                  Your selected breed:
                </strong>

                {' '}

                {result.seller_breed}

              </p>


              {result.ai_top_breed && (

                <p>

                  <strong>
                    AI prediction:
                  </strong>

                  {' '}

                  {result.ai_top_breed}

                </p>

              )}


              {typeof result.ai_top_confidence ===
                'number' && (

                <p>

                  <strong>
                    AI confidence:
                  </strong>

                  {' '}

                  {(
                    result.ai_top_confidence *
                    100
                  ).toFixed(1)}

                  %

                </p>

              )}

            </div>


            {/* ============================================
                TOP PREDICTIONS
            ============================================= */}

            {result.top_predictions &&
              result.top_predictions.length > 0 && (

              <div
                style={{
                  marginTop: '24px',
                  textAlign: 'left',
                }}
              >

                <strong>

                  AI Top Predictions

                </strong>


                <ol>

                  {result.top_predictions.map(
                    (
                      prediction,
                      index,
                    ) => (

                      <li
                        key={
                          prediction.breed ||
                          index
                        }
                      >

                        {prediction.breed ||
                          'Unknown'}

                        {' — '}

                        {typeof prediction.confidence ===
                          'number'
                          ? `${(
                              prediction.confidence *
                              100
                            ).toFixed(1)}%`
                          : 'Confidence unavailable'}

                      </li>

                    ),
                  )}

                </ol>

              </div>

            )}


            {/* ============================================
                ACTION BUTTONS
            ============================================= */}

            <div
              className="create-listing-success-actions"
              style={{
                marginTop: '32px',
              }}
            >


              <button
                type="button"
                className="btn btn-secondary"
                onClick={
                  handleGoBack
                }
                disabled={
                  submitting
                }
              >

                Go Back

              </button>


              <button
                type="button"
                className="btn btn-secondary"
                onClick={
                  handleUploadAnother
                }
                disabled={
                  submitting
                }
              >

                Upload Another Image

              </button>


              <button
                type="button"
                className="btn btn-primary"
                onClick={
                  handlePublishAnyway
                }
                disabled={
                  submitting
                }
              >

                {submitting
                  ? 'Publishing…'
                  : 'Publish Anyway'}

              </button>


            </div>


            <p
              style={{
                marginTop: '20px',
                fontSize: '0.9rem',
                opacity: 0.75,
              }}
            >

              By publishing, you confirm that the listing
              information you provided is correct.

            </p>


          </div>

        </div>

      </section>
    )
  }


  /*
  =========================================================
  SUCCESS SCREEN
  =========================================================
  */

  if (createdListing) {

    return (

      <section className="create-listing-page">

        <div className="create-listing-inner">

          <div className="create-listing-success">


            <span
              className="contact-modal-success-icon"
              aria-hidden="true"
            >
              ✓
            </span>


            <h1 className="breed-explorer-title">

              Listing Created

            </h1>


            <p className="breed-explorer-subtitle">

              &ldquo;
              {createdListing.title}
              &rdquo;

              {' has been published to the BreedDex TradeHub.'}

            </p>


            <div
              className="create-listing-success-actions"
            >

              <Link
                to={`/marketplace/${createdListing.id}`}
                className="btn btn-primary"
              >

                View Listing

              </Link>


              <button
                type="button"
                className="btn btn-secondary"
                onClick={
                  handleCreateAnother
                }
              >

                Create Another Listing

              </button>


            </div>


          </div>

        </div>

      </section>
    )
  }


  /*
  =========================================================
  MAIN FORM
  =========================================================
  */

  return (

    <section className="create-listing-page">

      <div className="create-listing-inner">


        <div
          className="breed-explorer-intro"
        >

          <span className="eyebrow">

            List Your Livestock

          </span>


          <h1
            className="breed-explorer-title"
          >

            Create a Listing.

          </h1>


          <p
            className="breed-explorer-subtitle"
          >

            Add your cattle or buffalo to the
            BreedDex TradeHub.

            {' '}

            Your animal photo will first be checked
            using AI before publishing.

          </p>

        </div>


        <form
          className="create-listing-form"
          onSubmit={
            handleSubmit
          }
          noValidate
        >


          {/* LISTING TITLE */}

          <div
            className="create-listing-field"
          >

            <label
              htmlFor="listing-title"
            >

              Listing Title

            </label>


            <input
              id="listing-title"
              type="text"
              value={form.title}
              onChange={(event) =>
                update(
                  'title',
                  event.target.value,
                )
              }
              placeholder="e.g. Healthy Gir Cow, 4 Years"
            />


            {errors.title && (

              <span
                className="create-listing-error"
              >

                {errors.title}

              </span>

            )}

          </div>


          {/* ANIMAL TYPE + BREED */}

          <div
            className="create-listing-row"
          >


            <div
              className="create-listing-field"
            >

              <label
                htmlFor="listing-animal-type"
              >

                Animal Type

              </label>


              <ThemedSelect
                id="listing-animal-type"
                value={form.animalType}
                onChange={
                  handleAnimalTypeChange
                }
                options={
                  ANIMAL_TYPE_OPTIONS
                }
              />

            </div>


            <div
              className="create-listing-field"
            >

              <label
                htmlFor="listing-breed"
              >

                Breed

              </label>


              <input
                id="listing-breed"
                type="text"
                value={form.breed}
                onChange={(event) =>
                  update(
                    'breed',
                    event.target.value,
                  )
                }
                placeholder="Enter breed name"
              />


              {errors.breed && (

                <span
                  className="create-listing-error"
                >

                  {errors.breed}

                </span>

              )}

            </div>

          </div>


          {/* AGE + GENDER */}

          <div
            className="create-listing-row"
          >


            <div
              className="create-listing-field"
            >

              <label
                htmlFor="listing-age"
              >

                Age (years)

              </label>


              <input
                id="listing-age"
                type="number"
                min="0"
                step="0.5"
                value={form.age}
                onChange={(event) =>
                  update(
                    'age',
                    event.target.value,
                  )
                }
                placeholder="e.g. 4"
              />


              {errors.age && (

                <span
                  className="create-listing-error"
                >

                  {errors.age}

                </span>

              )}

            </div>


            <div
              className="create-listing-field"
            >

              <label
                htmlFor="listing-gender"
              >

                Gender

              </label>


              <ThemedSelect
                id="listing-gender"
                value={form.gender}
                onChange={(value) =>
                  update(
                    'gender',
                    value,
                  )
                }
                options={
                  GENDER_OPTIONS
                }
              />

            </div>

          </div>


          {/* PRICE + LOCATION */}

          <div
            className="create-listing-row"
          >


            <div
              className="create-listing-field"
            >

              <label
                htmlFor="listing-price"
              >

                Price (₹)

              </label>


              <input
                id="listing-price"
                type="number"
                min="0"
                value={form.price}
                onChange={(event) =>
                  update(
                    'price',
                    event.target.value,
                  )
                }
                placeholder="e.g. 85000"
              />


              {errors.price && (

                <span
                  className="create-listing-error"
                >

                  {errors.price}

                </span>

              )}

            </div>


            <div
              className="create-listing-field"
            >

              <label
                htmlFor="listing-location"
              >

                Location

              </label>


              <input
                id="listing-location"
                type="text"
                value={form.location}
                onChange={(event) =>
                  update(
                    'location',
                    event.target.value,
                  )
                }
                placeholder="e.g. Junagadh, Gujarat"
              />


              {errors.location && (

                <span
                  className="create-listing-error"
                >

                  {errors.location}

                </span>

              )}

            </div>

          </div>


          {/* DESCRIPTION */}

          <div
            className="create-listing-field"
          >

            <label
              htmlFor="listing-description"
            >

              Description

            </label>


            <textarea
              id="listing-description"
              rows={4}
              value={form.description}
              onChange={(event) =>
                update(
                  'description',
                  event.target.value,
                )
              }
              placeholder="Describe temperament, lactation, lineage, or anything else buyers should know."
            />


            {errors.description && (

              <span
                className="create-listing-error"
              >

                {errors.description}

              </span>

            )}

          </div>


          {/* HEALTH STATUS */}

          <div
            className="create-listing-field"
          >

            <label
              htmlFor="listing-health"
            >

              Health Status

            </label>


            <textarea
              id="listing-health"
              rows={2}
              value={form.healthStatus}
              onChange={(event) =>
                update(
                  'healthStatus',
                  event.target.value,
                )
              }
              placeholder="e.g. Excellent health, recently dewormed"
            />


            {errors.healthStatus && (

              <span
                className="create-listing-error"
              >

                {errors.healthStatus}

              </span>

            )}

          </div>


          {/* IMAGE */}

          <div
            className="create-listing-field"
          >

            <label>

              Animal Photo

            </label>


            <ImageUploader
              onFileSelected={
                handleFileSelected
              }
              previewUrl={
                previewUrl
              }
              onClear={
                handleClearImage
              }
            />


            {errors.image && (

              <span
                className="create-listing-error"
              >

                {errors.image}

              </span>

            )}

          </div>


          {/* SUBMIT ERROR */}

          {submitError && (

            <p
              className="create-listing-submit-error"
              role="alert"
            >

              {submitError}

            </p>

          )}


          {/* SUBMIT BUTTON */}

          <button
            type="submit"
            className="btn btn-primary create-listing-submit"
            disabled={
              submitting ||
              verifying
            }
          >

            {verifying
              ? 'Verifying Breed…'
              : submitting
                ? 'Publishing…'
                : 'Verify & Publish Listing'}

          </button>


        </form>


      </div>

    </section>
  )
}