import { BREEDS } from '../data/breeds'

const EXPLANATIONS = [
  'The visible characteristics closely match this breed\u2019s typical coat pattern and build.',
  'Facial structure and ear shape in the image align closely with this breed\u2019s known traits.',
  'The horn shape and body proportions are consistent with this breed.',
  'Coat color and frame size are strong indicators pointing to this breed.',
]

function pseudoRandomIndex(seed, max) {
  const hash = Array.from(seed).reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return hash % max
}

/**
 * DEMO ONLY — this does not run real image analysis. It picks a breed using
 * a simple pseudo-random selection (seeded loosely from the file name/size so
 * results feel consistent for the same upload) and returns a mock confidence
 * score. Wire this up to a real vision model / API to make it functional.
 */
export function mockAnalyzeImage(file) {
  const seed = `${file?.name || 'sample'}-${file?.size || Date.now()}`
  const index = pseudoRandomIndex(seed, BREEDS.length)
  const breed = BREEDS[index]
  const confidence = 78 + (pseudoRandomIndex(seed + 'c', 20))
  const explanation = EXPLANATIONS[pseudoRandomIndex(seed + 'e', EXPLANATIONS.length)]

  const sameTypeBreeds = BREEDS.filter((candidate) => candidate.type === breed.type && candidate.id !== breed.id)
  const altIndexA = pseudoRandomIndex(seed + 'alt1', sameTypeBreeds.length || 1)
  const altBreedA = sameTypeBreeds[altIndexA]
  const remaining = sameTypeBreeds.filter((candidate) => candidate.id !== altBreedA?.id)
  const altIndexB = pseudoRandomIndex(seed + 'alt2', remaining.length || 1)
  const altBreedB = remaining[altIndexB]

  const alternatives = [
    altBreedA && { breedId: altBreedA.id, breed: altBreedA.name, confidence: Math.max(confidence - 15, 5) },
    altBreedB && { breedId: altBreedB.id, breed: altBreedB.name, confidence: Math.max(confidence - 28, 3) },
  ].filter(Boolean)

  const result = {
    breedId: breed.id,
    breed: breed.name,
    animalType: breed.type === 'cattle' ? 'Cattle' : 'Buffalo',
    confidence,
    explanation,
    traits: breed.traits,
    alternatives,
  }

  return new Promise((resolve) => {
    setTimeout(() => resolve(result), 1600)
  })
}
