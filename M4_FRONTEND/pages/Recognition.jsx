import {
  useEffect,
  useRef,
  useState,
} from 'react'

import ImageUploader
  from '../components/ImageUploader'

import RecognitionResult
  from '../components/RecognitionResult'

import RecognitionHistoryList
  from '../components/RecognitionHistoryList'

import {
  historyApi,
  recognizeBreedImage,
} from '../services/api'

import {
  useAuth,
} from '../context/AuthContext'


export default function Recognition() {

  const [
    file,
    setFile,
  ] = useState(null)

  const [
    previewUrl,
    setPreviewUrl,
  ] = useState(null)

  const [
    status,
    setStatus,
  ] = useState('idle')

  const [
    result,
    setResult,
  ] = useState(null)

  const [
    error,
    setError,
  ] = useState('')

  const [
    history,
    setHistory,
  ] = useState([])


  const objectUrlRef =
    useRef(null)


  const {
    isAuthenticated,
  } = useAuth()


  /*
  =========================================================
  LOAD RECOGNITION HISTORY
  =========================================================
  */

  useEffect(
    () => {

      if (!isAuthenticated) {

        setHistory([])

        return

      }


      historyApi
        .all()
        .then(
          (data) => {

            setHistory(
              Array.isArray(data)
                ? data
                : [],
            )

          },
        )
        .catch(
          () => {

            setHistory([])

          },
        )

    },
    [
      isAuthenticated,
    ],
  )


  /*
  =========================================================
  CLEAN UP IMAGE URL
  =========================================================
  */

  useEffect(
    () => {

      return () => {

        if (
          objectUrlRef.current
        ) {

          URL.revokeObjectURL(
            objectUrlRef.current,
          )

        }

      }

    },
    [],
  )


  /*
  =========================================================
  FILE SELECTED
  =========================================================
  */

  function handleFileSelected(
    selectedFile,
  ) {

    if (
      objectUrlRef.current
    ) {

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


    setFile(
      selectedFile,
    )

    setPreviewUrl(
      url,
    )

    setResult(
      null,
    )

    setError(
      '',
    )

    setStatus(
      'idle',
    )

  }


  /*
  =========================================================
  CLEAR IMAGE
  =========================================================
  */

  function handleClearImage() {

    if (
      objectUrlRef.current
    ) {

      URL.revokeObjectURL(
        objectUrlRef.current,
      )

    }


    objectUrlRef.current =
      null


    setFile(
      null,
    )

    setPreviewUrl(
      null,
    )

    setResult(
      null,
    )

    setError(
      '',
    )

    setStatus(
      'idle',
    )

  }


  /*
  =========================================================
  ANALYZE IMAGE WITH REAL AI
  =========================================================
  */

  async function handleAnalyze() {

    if (!file) {

      setError(
        'Please upload an image before analyzing.',
      )

      setStatus(
        'error',
      )

      return

    }


    setError(
      '',
    )

    setStatus(
      'analyzing',
    )


    try {

      /*
      =====================================================
      SEND IMAGE TO REAL BACKEND AI
      =====================================================
      */

      const analysis =
        await recognizeBreedImage(
          file,
        )


      /*
      =====================================================
      VALIDATE AI RESPONSE
      =====================================================
      */

      if (
        !analysis ||
        !analysis.breed
      ) {

        throw new Error(
          'The AI model could not identify a breed from this image.',
        )

      }


      /*
      =====================================================
      SHOW RESULT
      =====================================================
      */

      setResult(
        analysis,
      )

      setStatus(
        'done',
      )


      /*
      =====================================================
      CREATE HISTORY ENTRY
      =====================================================
      */

      const entry = {

        id:
          `${Date.now()}`,

        timestamp:
          new Date()
            .toISOString(),

        image:
          previewUrl,

        breedId:
          analysis.breedId ||
          analysis.breed_id ||
          null,

        breed:
          analysis.breed,

        animalType:
          analysis.animalType ||
          analysis.animal_type,

        confidence:
          analysis.confidence,

      }


      /*
      =====================================================
      LOGGED-IN USER
      SAVE HISTORY TO BACKEND
      =====================================================
      */

      if (
        isAuthenticated
      ) {

        try {

          const savedEntry =
            await historyApi.create(
              entry.image,
              entry,
            )


          setHistory(
            (current) => [

              savedEntry,

              ...current,

            ],
          )

        } catch (
          historyError
        ) {

          console.error(
            'Could not save recognition history:',
            historyError,
          )

        }

      }


      /*
      =====================================================
      GUEST USER
      KEEP HISTORY ONLY IN CURRENT SESSION
      =====================================================
      */

      else {

        setHistory(
          (current) => [

            entry,

            ...current,

          ],
        )

      }

    } catch (
      err
    ) {

      console.error(
        'Recognition error:',
        err,
      )


      setError(
        err?.message ||
          'We couldn’t analyze this image. Please try again.',
      )


      setStatus(
        'error',
      )

    }

  }


  /*
  =========================================================
  REMOVE HISTORY ITEM
  =========================================================
  */

  async function handleRemoveHistoryItem(
    id,
  ) {

    try {

      if (
        isAuthenticated
      ) {

        await historyApi.remove(
          id,
        )

      }


      setHistory(
        (current) =>
          current.filter(
            (entry) =>
              entry.id !== id,
          ),
      )

    } catch (
      err
    ) {

      setError(
        err?.message ||
          'Could not remove this history item.',
      )

    }

  }


  /*
  =========================================================
  CLEAR HISTORY
  =========================================================
  */

  async function handleClearHistory() {

    try {

      if (
        isAuthenticated
      ) {

        await historyApi.clear()

      }


      setHistory(
        [],
      )

    } catch (
      err
    ) {

      setError(
        err?.message ||
          'Could not clear recognition history.',
      )

    }

  }


  /*
  =========================================================
  PAGE
  =========================================================
  */

  return (

    <section
      className="recognition-page"
    >

      <div
        className="recognition-inner"
      >


        {/* =============================================
            INTRO
        ============================================= */}

        <div
          className="recognition-intro"
        >

          <span
            className="eyebrow"
          >

            AI Breed Recognition

          </span>


          <h1
            className="recognition-title"
          >

            Identify a Breed from a Photo.

          </h1>


          <p
            className="recognition-subtitle"
          >

            Upload a clear photo of a cattle or buffalo
            and get an AI-powered breed prediction.

          </p>

        </div>


        {/* =============================================
            RECOGNITION PANEL
        ============================================= */}

        <div
          className="recognition-panel"
        >


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
            disabled={
              status === 'analyzing'
            }
          />


          {/* =========================================
              ANALYZE BUTTON
          ========================================= */}

          {previewUrl &&
            status !== 'done' && (

              <button
                type="button"
                className="btn btn-primary recognition-analyze-btn"
                onClick={
                  handleAnalyze
                }
                disabled={
                  status === 'analyzing'
                }
              >

                {status === 'analyzing'
                  ? 'Analyzing…'
                  : 'Analyze Breed'}

              </button>

            )}


          {/* =========================================
              LOADING
          ========================================= */}

          {status === 'analyzing' && (

            <div
              className="recognition-loading"
              role="status"
              aria-live="polite"
            >

              <span
                className="spinner-ring"
              />

              <span>

                Analyzing image with AI…

              </span>

            </div>

          )}


          {/* =========================================
              ERROR
          ========================================= */}

          {status === 'error' &&
            error && (

              <p
                className="recognition-error"
                role="alert"
              >

                {error}

              </p>

            )}


          {/* =========================================
              AI RESULT
          ========================================= */}

          {status === 'done' &&
            result && (

              <>

                <RecognitionResult
                  result={
                    result
                  }
                />


                <button
                  type="button"
                  className="btn btn-secondary recognition-again-btn"
                  onClick={
                    handleClearImage
                  }
                >

                  Analyze Another Image

                </button>

              </>

            )}

        </div>


        {/* =============================================
            RECOGNITION HISTORY
        ============================================= */}

        <div
          className="recognition-history"
        >

          <div
            className="recognition-history-header"
          >

            <h2
              className="breed-details-section-title"
            >

              Recognition History

            </h2>


            {history.length > 0 && (

              <button
                type="button"
                className="compare-bar-clear"
                onClick={
                  handleClearHistory
                }
              >

                Clear All

              </button>

            )}

          </div>


          <RecognitionHistoryList
            history={
              history
            }
            onRemove={
              handleRemoveHistoryItem
            }
          />

        </div>


      </div>

    </section>

  )

}