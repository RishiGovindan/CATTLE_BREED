import { createContext, useContext, useMemo, useState } from 'react'

const CompareContext = createContext(null)

const MAX_COMPARE = 2

export function CompareProvider({ children }) {
  const [compareIds, setCompareIds] = useState([])

  const value = useMemo(() => {
    function isInCompare(breedId) {
      return compareIds.includes(breedId)
    }

    function toggleCompare(breedId) {
      setCompareIds((current) => {
        if (current.includes(breedId)) {
          return current.filter((id) => id !== breedId)
        }
        if (current.length >= MAX_COMPARE) {
          return [current[1], breedId]
        }
        return [...current, breedId]
      })
    }

    function setSlot(index, breedId) {
      setCompareIds((current) => {
        const next = [...current]
        next[index] = breedId
        return next.slice(0, MAX_COMPARE).filter(Boolean)
      })
    }

    function removeFromCompare(breedId) {
      setCompareIds((current) => current.filter((id) => id !== breedId))
    }

    function clearCompare() {
      setCompareIds([])
    }

    return {
      compareIds,
      isInCompare,
      toggleCompare,
      setSlot,
      removeFromCompare,
      clearCompare,
      isFull: compareIds.length >= MAX_COMPARE,
      maxCompare: MAX_COMPARE,
    }
  }, [compareIds])

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>
}

export function useCompare() {
  const context = useContext(CompareContext)
  if (!context) {
    throw new Error('useCompare must be used within a CompareProvider')
  }
  return context
}
