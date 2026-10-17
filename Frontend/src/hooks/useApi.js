import { useCallback, useEffect, useState } from 'react'

/**
 * Loads data from an API function whenever `deps` change.
 * Returns { data, error, loading, reload }. Old data stays visible while reloading.
 */
export default function useApi(fetcher, deps = []) {
  const [tick, setTick] = useState(0)
  const [result, setResult] = useState({ key: null, data: null, error: null })
  const key = JSON.stringify([...deps, tick])

  useEffect(() => {
    let cancelled = false
    fetcher()
      .then((data) => !cancelled && setResult({ key, data, error: null }))
      .catch((error) => !cancelled && setResult({ key, data: null, error }))
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  const reload = useCallback(() => setTick((t) => t + 1), [])

  return { data: result.data, error: result.error, loading: result.key !== key, reload }
}