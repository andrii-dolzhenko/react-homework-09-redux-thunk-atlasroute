const PIXABAY_API = 'https://pixabay.com/api/'
const CACHE_PREFIX = 'atlasroute:pixabay:'
const CACHE_TTL = 24 * 60 * 60 * 1000
const BLOCKED_TAGS = /\b(flag|map|passport|document|logo|symbol|coat of arms|currency|banknote|money|text|sign|diagram|illustration)\b/i
const REQUEST_GAP_MS = 720
let requestQueue = Promise.resolve()
let lastRequestAt = 0

const createAbortError = () => {
  const error = new Error('The operation was aborted')
  error.name = 'AbortError'
  return error
}

const waitForRequestGap = (milliseconds, signal) => new Promise((resolve, reject) => {
  if (!milliseconds) {
    resolve()
    return
  }

  if (signal?.aborted) {
    reject(createAbortError())
    return
  }

  let timer
  const handleAbort = () => {
    window.clearTimeout(timer)
    reject(createAbortError())
  }

  timer = window.setTimeout(() => {
    signal?.removeEventListener('abort', handleAbort)
    resolve()
  }, milliseconds)

  signal?.addEventListener('abort', handleAbort, { once: true })
})

const scheduleRequest = (task, { signal } = {}) => {
  const run = requestQueue.then(async () => {
    if (signal?.aborted) throw createAbortError()

    const wait = Math.max(0, REQUEST_GAP_MS - (Date.now() - lastRequestAt))
    await waitForRequestGap(wait, signal)

    if (signal?.aborted) throw createAbortError()

    lastRequestAt = Date.now()
    return task()
  })
  requestQueue = run.catch(() => undefined)
  return run
}

const getApiKey = () => import.meta.env.VITE_PIXABAY_API_KEY?.trim() ?? ''

const readCache = (key) => {
  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}${key}`)
    if (!raw) return null
    const cached = JSON.parse(raw)
    if (!cached?.timestamp || Date.now() - cached.timestamp > CACHE_TTL) {
      localStorage.removeItem(`${CACHE_PREFIX}${key}`)
      return null
    }
    return cached.items ?? null
  } catch {
    return null
  }
}

const writeCache = (key, items) => {
  try {
    localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify({ timestamp: Date.now(), items }))
  } catch {
    // Storage is an optimisation only; media loading must still work without it.
  }
}

const mapPhoto = (photo, countryName) => ({
  id: photo.id,
  src: photo.largeImageURL || photo.webformatURL,
  preview: photo.webformatURL || photo.largeImageURL,
  title: photo.tags || `${countryName} travel photo`,
  source: photo.pageURL,
  photographer: photo.user,
  width: photo.imageWidth || photo.webformatWidth || 0,
  height: photo.imageHeight || photo.webformatHeight || 0,
})

const isUsefulPhoto = (photo) => {
  if (!photo.src || !photo.width || !photo.height) return false
  const ratio = photo.width / photo.height
  if (photo.width < 1200 || ratio < 1.18 || ratio > 2.65) return false
  return !BLOCKED_TAGS.test(photo.title)
}

const searchPixabay = async (query, { signal, perPage = 18 } = {}) => {
  const key = getApiKey()
  if (!key) {
    const error = new Error('Pixabay API key is not configured')
    error.code = 'PIXABAY_KEY_MISSING'
    throw error
  }

  const params = new URLSearchParams({
    key,
    q: query,
    image_type: 'photo',
    orientation: 'horizontal',
    category: 'travel',
    safesearch: 'true',
    order: 'popular',
    min_width: '1200',
    per_page: String(perPage),
  })

  const response = await scheduleRequest(
    () => fetch(`${PIXABAY_API}?${params}`, { signal }),
    { signal },
  )
  if (!response.ok) throw new Error(`Pixabay returned ${response.status}`)
  const data = await response.json()
  return data.hits ?? []
}

export const fetchCountryMedia = async (countryName, { signal, limit = 6, forceRefresh = false } = {}) => {
  const cacheKey = countryName.trim().toLowerCase()
  const cached = forceRefresh ? null : readCache(cacheKey)
  if (cached?.length) return cached.slice(0, limit)

  const queries = [
    `${countryName} travel landscape`,
    `${countryName} city nature`,
    countryName,
  ]

  const collected = []
  const seen = new Set()

  for (const query of queries) {
    if (collected.length >= limit) break
    const hits = await searchPixabay(query, { signal })
    for (const hit of hits) {
      const photo = mapPhoto(hit, countryName)
      if (!isUsefulPhoto(photo) || seen.has(photo.id)) continue
      seen.add(photo.id)
      collected.push(photo)
      if (collected.length >= Math.max(limit, 6)) break
    }
  }

  writeCache(cacheKey, collected)
  return collected.slice(0, limit)
}
