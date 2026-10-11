import { Link } from 'react-router-dom'

export default function RecognitionResult({
  result,
}) {

  if (!result) {
    return null
  }

  const confidence =
    typeof result.confidence === 'number'
      ? result.confidence <= 1
        ? result.confidence * 100
        : result.confidence
      : null


  const breed =
    result.breed ||
    result.topBreed ||
    result.predictedBreed ||
    'Unknown Breed'


  const animalType =
    result.animalType ||
    result.animal_type ||
    ''


  const message =
    result.message ||
    result.explanation ||
    result.description ||
    'The AI analyzed the uploaded image and found the closest breed match.'


  const possibleMatches =
    result.matches ||
    result.otherMatches ||
    result.predictions ||
    []


  return (

    <div
      className="recognition-result"
    >

      <div
        style={{
          marginTop: '32px',
          paddingTop: '28px',
          borderTop:
            '1px solid rgba(255, 255, 255, 0.1)',
          textAlign: 'center',
        }}
      >

        <span className="eyebrow">

          AI RESULT

        </span>


        <h2
          style={{
            marginTop: '12px',
          }}
        >

          {breed}

        </h2>


        {animalType && (

          <p
            style={{
              marginTop: '6px',
              opacity: 0.8,
            }}
          >

            {animalType}

          </p>

        )}


        {confidence !== null && (

          <>

            <div
              style={{
                width: '100%',
                maxWidth: '320px',
                height: '8px',
                margin:
                  '20px auto 8px',
                borderRadius: '999px',
                overflow: 'hidden',
                background:
                  'rgba(255, 255, 255, 0.1)',
              }}
            >

              <div
                style={{
                  width:
                    `${Math.min(
                      Math.max(
                        confidence,
                        0,
                      ),
                      100,
                    )}%`,
                  height: '100%',
                  borderRadius: '999px',
                  background:
                    'var(--color-primary, #b6d77a)',
                }}
              />

            </div>


            <p
              style={{
                fontSize: '0.9rem',
                opacity: 0.75,
              }}
            >

              {confidence.toFixed(1)}
              % confidence

            </p>

          </>

        )}


        <p
          style={{
            maxWidth: '600px',
            margin:
              '24px auto 0',
            lineHeight: 1.7,
            opacity: 0.8,
          }}
        >

          {message}

        </p>


        {Array.isArray(possibleMatches) &&
          possibleMatches.length > 0 && (

          <div
            style={{
              marginTop: '32px',
              textAlign: 'left',
            }}
          >

            <h3
              style={{
                textAlign: 'center',
                marginBottom: '16px',
              }}
            >

              Other Possible Matches

            </h3>


            {possibleMatches
              .filter(
                (match) => {

                  const matchBreed =
                    typeof match === 'string'
                      ? match
                      : match.breed ||
                        match.name

                  return (
                    matchBreed &&
                    matchBreed !== breed
                  )
                },
              )
              .slice(0, 3)
              .map(
                (
                  match,
                  index,
                ) => {

                  const matchBreed =
                    typeof match === 'string'
                      ? match
                      : match.breed ||
                        match.name

                  let matchConfidence =
                    typeof match === 'object'
                      ? match.confidence
                      : null

                  if (
                    typeof matchConfidence ===
                    'number'
                  ) {

                    if (
                      matchConfidence <= 1
                    ) {
                      matchConfidence =
                        matchConfidence *
                        100
                    }

                  }


                  return (

                    <div
                      key={`${matchBreed}-${index}`}
                      style={{
                        display: 'flex',
                        justifyContent:
                          'space-between',
                        alignItems:
                          'center',
                        padding:
                          '12px 16px',
                        marginBottom:
                          '8px',
                        borderRadius:
                          '10px',
                        background:
                          'rgba(255, 255, 255, 0.04)',
                      }}
                    >

                      <strong>

                        {matchBreed}

                      </strong>


                      {typeof matchConfidence ===
                        'number' && (

                        <span
                          style={{
                            opacity: 0.7,
                          }}
                        >

                          {matchConfidence.toFixed(
                            1,
                          )}

                          %

                        </span>

                      )}

                    </div>

                  )

                },
              )}

          </div>

        )}


        <div
          style={{
            marginTop: '32px',
            display: 'flex',
            justifyContent:
              'center',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >

          <Link
            to="/marketplace"
            className="btn btn-primary"
          >

            Explore TradeHub

          </Link>


          <Link
            to="/breed-explorer"
            className="btn btn-secondary"
          >

            Explore Breeds

          </Link>

        </div>

      </div>

    </div>

  )

}