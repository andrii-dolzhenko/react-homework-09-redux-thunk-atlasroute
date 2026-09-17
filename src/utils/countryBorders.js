const BORDER_FALLBACKS = {
  CZE: ['AUT', 'DEU', 'POL', 'SVK'],
}

export const normalizeBorders = (country) => {
  const borders = Array.isArray(country.borders) ? [...country.borders] : []
  const countryCode = country.alpha3Code?.toUpperCase() ?? ''

  // Preserve live API data whenever it is present. This only fills a known
  // upstream omission for Czech Republic, without changing other countries.
  if (!borders.length && BORDER_FALLBACKS[countryCode]) {
    return [...BORDER_FALLBACKS[countryCode]]
  }

  // countries.dev can expose both sovereign France (FRA) and French Guiana (GUF)
  // for Brazil. AtlasRoute lists the geographically adjacent destination itself,
  // so the duplicate sovereign reference is removed when GUF is already present.
  if (countryCode === 'BRA' && borders.includes('GUF')) {
    return borders.filter((borderCode) => borderCode !== 'FRA')
  }

  return borders
}
