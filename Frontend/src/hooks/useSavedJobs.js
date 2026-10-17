import { useContext } from 'react'
import { SavedJobsContext } from '../context/savedJobsContextValue'

export default function useSavedJobs() {
  const ctx = useContext(SavedJobsContext)
  if (!ctx) throw new Error('useSavedJobs must be used inside <SavedJobsProvider>')
  return ctx
}