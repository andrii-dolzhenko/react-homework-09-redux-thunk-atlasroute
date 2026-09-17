const SQUARE_KILOMETERS_TO_SQUARE_MILES = 0.3861021585424458

const formatterFor = (value) => new Intl.NumberFormat('en', {
  maximumFractionDigits: Math.abs(value) < 10 ? 2 : Math.abs(value) < 100 ? 1 : 0,
})

export const convertArea = (areaKm2, unitSystem = 'metric') => {
  const numericArea = Number(areaKm2)
  if (!Number.isFinite(numericArea)) return null

  return unitSystem === 'imperial'
    ? numericArea * SQUARE_KILOMETERS_TO_SQUARE_MILES
    : numericArea
}

export const formatArea = (areaKm2, unitSystem = 'metric') => {
  const convertedArea = convertArea(areaKm2, unitSystem)
  if (convertedArea === null) return '—'

  const unit = unitSystem === 'imperial' ? 'mi²' : 'km²'
  return `${formatterFor(convertedArea).format(convertedArea)} ${unit}`
}
