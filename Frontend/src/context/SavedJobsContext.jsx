import { useCallback, useEffect, useMemo, useState } from 'react'
import { SavedJobsContext } from './savedJobsContextValue'
import useAuth from '../hooks/useAuth'
import useToast from '../hooks/useToast'
import { getSavedJobIds, saveJob, unsaveJob } from '../api/savedApi'
import { ROLES } from '../utils/constants'
import { getErrorMessage } from '../utils/helpers'

/** Keeps the candidate's saved job ids in memory so every bookmark icon stays in sync. */
export function SavedJobsProvider({ children }) {
  const { user, isAuthenticated } = useAuth()
  const toast = useToast()
  const [loaded, setIds] = useState([])
  const isCandidate = isAuthenticated && user?.role === ROLES.CANDIDATE
  // only a signed in candidate has saved jobs; everyone else sees an empty list
  const ids = isCandidate ? loaded : []

  useEffect(() => {
    let cancelled = false
    if (!isCandidate) return undefined
    getSavedJobIds()
      .then((list) => !cancelled && setIds(list || []))
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [isCandidate])

  const toggle = useCallback(
    async (jobId) => {
      const wasSaved = ids.includes(jobId)
      // optimistic update, rolled back if the server says no
      setIds((list) => (wasSaved ? list.filter((i) => i !== jobId) : [...list, jobId]))
      try {
        if (wasSaved) await unsaveJob(jobId)
        else await saveJob(jobId)
        toast.success(wasSaved ? 'Removed from saved jobs' : 'Job saved')
      } catch (e) {
        setIds((list) => (wasSaved ? [...list, jobId] : list.filter((i) => i !== jobId)))
        toast.error(getErrorMessage(e))
      }
    },
    [ids, toast],
  )

  const value = useMemo(
    () => ({ ids, isSaved: (jobId) => ids.includes(jobId), toggle, enabled: isCandidate }),
    [ids, toggle, isCandidate],
  )

  return <SavedJobsContext.Provider value={value}>{children}</SavedJobsContext.Provider>
}