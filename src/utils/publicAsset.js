const baseUrl = import.meta.env?.BASE_URL ?? '/'

export const publicAsset = (path) => (
  `${baseUrl}${String(path).replace(/^\/+/, '')}`
)
