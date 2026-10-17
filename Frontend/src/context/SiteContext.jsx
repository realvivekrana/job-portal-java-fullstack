import { useCallback, useEffect, useMemo, useState } from 'react'
import { SiteContext } from './siteContextValue'
import { getOverview, getSite } from '../api/siteApi'
import { DEFAULT_SITE } from '../utils/constants'

/**
 * Website texts (name, hero, footer...) and live home page numbers, both served by the backend.
 * The app renders immediately with DEFAULT_SITE and swaps in the real values when they arrive.
 */
export function SiteProvider({ children }) {
  const [site, setSite] = useState(DEFAULT_SITE)
  const [overview, setOverview] = useState(null)

  const applySite = useCallback((data) => setSite({ ...DEFAULT_SITE, ...data }), [])
  const refreshOverview = useCallback(() => getOverview().then(setOverview).catch(() => {}), [])

  useEffect(() => {
    getSite()
      .then(applySite)
      .catch(() => {})
  }, [applySite])

  useEffect(() => {
    document.title = `${site.siteName} - ${site.siteTagline}`
  }, [site.siteName, site.siteTagline])

  const value = useMemo(
    () => ({ site, overview, applySite, refreshOverview }),
    [site, overview, applySite, refreshOverview],
  )

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>
}