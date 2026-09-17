import { useEffect, useState } from 'react'
import { fetchCountryMedia } from '../api/media'

export default function useCountryMedia(
  countryName,
  { enabled = true, limit = 6, forceRefresh = false } = {},
) {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(Boolean(countryName && enabled))
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!countryName || !enabled) {
      setLoading(false)
      return undefined
    }

    const controller = new AbortController()

    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const result = await fetchCountryMedia(countryName, {
          signal: controller.signal,
          limit,
          forceRefresh,
        })
        if (!controller.signal.aborted) setImages(result)
      } catch (mediaError) {
        if (mediaError?.name !== 'AbortError' && !controller.signal.aborted) {
          setImages([])
          setError(mediaError)
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    load()
    return () => controller.abort()
  }, [countryName, enabled, forceRefresh, limit])

  return { images, loading, error }
}
