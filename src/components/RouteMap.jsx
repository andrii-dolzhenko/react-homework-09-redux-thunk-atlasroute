import { continentMapViews, mapCountries, projectLonLat } from '../data/mapPaths'
import { WORLD_WRAP_OFFSETS, wrapProjectedXToView } from '../utils/mapProjection'
import RouteFlagMarker from './RouteFlagMarker'

const normalize = (value = '') => value
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]/g, '')

const countryNameAliases = {
  unitedstates: 'unitedstatesofamerica',
  czechia: 'czechrepublic',
  democraticrepublicofthecongo: 'demrepcongo',
  republicofthecongo: 'congo',
  eswatini: 'eswatini',
  northmacedonia: 'macedonia',
  bosniaandherzegovina: 'bosniaandherz',
  dominicanrepublic: 'dominicanrep',
  equatorialguinea: 'eqguinea',
  centralafricanrepublic: 'centralafricanrep',
  southsudan: 'ssudan',
}

const getContinent = (country) => {
  if (country.region === 'Europe') return 'Europe'
  if (country.region === 'Asia') return 'Asia'
  if (country.region === 'Africa') return 'Africa'
  if (country.region === 'Oceania') return 'Oceania'
  if (country.region === 'Polar' || /antarct/i.test(`${country.region} ${country.subregion} ${country.name}`)) return 'Antarctica'
  if (country.region === 'Americas') {
    return /south america/i.test(country.subregion ?? '') ? 'South America' : 'North America'
  }
  return 'Europe'
}

const isSelectedCountry = (geo, country) => {
  if (geo.code && country.code && geo.code === country.code.toUpperCase()) return true
  const expectedName = countryNameAliases[normalize(country.name)] ?? normalize(country.name)
  return normalize(geo.name) === expectedName
}

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

const getPathBounds = (path = '') => {
  const coordinatePattern = /(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g
  const points = [...path.matchAll(coordinatePattern)]
    .map((match) => [Number(match[1]), Number(match[2])])
    .filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y))

  if (!points.length) return null

  const xs = points.map(([x]) => x)
  const ys = points.map(([, y]) => y)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)

  return { minX, minY, width: maxX - minX, height: maxY - minY }
}

const formatCoordinate = (value, positive, negative) => {
  const numericValue = Number(value)
  if (!Number.isFinite(numericValue)) return null
  const hemisphere = numericValue >= 0 ? positive : negative
  return `${Math.abs(numericValue).toFixed(1)}° ${hemisphere}`
}

export default function RouteMap({ country }) {
  const continent = getContinent(country)
  const view = continentMapViews[continent] ?? continentMapViews.Europe
  const [viewX, viewY, viewW, viewH] = view.viewBox

  const hasCoordinates = Array.isArray(country.latlng) && country.latlng.length >= 2
  const [projectedDestinationX, destinationY] = hasCoordinates
    ? projectLonLat([country.latlng[1], country.latlng[0]])
    : [viewX + viewW * .58, viewY + viewH * .48]
  const destinationX = wrapProjectedXToView(projectedDestinationX, viewX, viewW)

  const markerX = clamp(destinationX, viewX + 8, viewX + viewW - 8)
  const markerY = clamp(destinationY, viewY + 8, viewY + viewH - 8)

  // Keep the locator trajectory regional instead of drawing a long diagonal
  // across unrelated geography. The route always terminates at the same
  // projected coordinate used by the destination marker.
  const startX = viewX + viewW * .07
  const startY = clamp(markerY + viewH * .18, viewY + viewH * .28, viewY + viewH * .78)
  const horizontalDistance = Math.max(viewW * .18, markerX - startX)
  const control1X = startX + horizontalDistance * .34
  const control2X = markerX - horizontalDistance * .26
  const control1Y = startY - viewH * .12
  const control2Y = markerY + viewH * .08
  const routePath = `M${startX.toFixed(2)} ${startY.toFixed(2)} C${control1X.toFixed(2)} ${control1Y.toFixed(2)} ${control2X.toFixed(2)} ${control2Y.toFixed(2)} ${markerX.toFixed(2)} ${markerY.toFixed(2)}`
  const markerScale = Math.max(1, Math.min(4.5, viewW / 235))

  const selectedGeo = mapCountries.find((geo) => isSelectedCountry(geo, country))
  const selectedBounds = selectedGeo ? getPathBounds(selectedGeo.path) : null
  const selectedIsSmall = !selectedBounds
    || (selectedBounds.width / viewW < .16 && selectedBounds.height / viewH < .16)

  const insetW = Math.min(82, Math.max(56, viewW * .34))
  const insetH = Math.min(72, Math.max(50, viewH * .34))
  // Local view can cross the ±180° seam. Keep the inset centred on the
  // wrapped destination coordinate and render neighbouring world copies,
  // rather than clamping Pacific islands to the opposite side of the map.
  const insetX = destinationX - insetW / 2
  const insetY = clamp(destinationY - insetH / 2, 0, 500 - insetH)

  const latitude = hasCoordinates ? formatCoordinate(country.latlng[0], 'N', 'S') : null
  const longitude = hasCoordinates ? formatCoordinate(country.latlng[1], 'E', 'W') : null
  const coordinateLabel = latitude && longitude ? `${latitude} · ${longitude}` : null
  const locationLabel = country.subregion || country.region || continent

  return (
    <aside className="route-map-card" aria-label={`Route focus for ${country.name}`}>
      <div className="route-map-card__header">
        <div>
          <span>Route focus</span>
          <strong>{country.name}</strong>
          {coordinateLabel && <em>{coordinateLabel}</em>}
        </div>
        <small>{continent}</small>
      </div>

      <div className="route-map-card__viewport">
        <svg
          className="route-map-card__map"
          viewBox={`${viewX} ${viewY} ${viewW} ${viewH}`}
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
        >
          <rect
            className="route-map-card__ocean"
            x={viewX}
            y={viewY}
            width={viewW}
            height={viewH}
            rx={8}
          />

          {WORLD_WRAP_OFFSETS.map((offset) => (
            <g
              key={`world-${offset}`}
              className="route-map-card__geographies"
              transform={`translate(${offset} 0)`}
            >
              {mapCountries.map((geo) => {
                const selected = isSelectedCountry(geo, country)
                return (
                  <path
                    key={`${geo.name}-${geo.code ?? 'na'}`}
                    d={geo.path}
                    className={selected ? 'route-map-card__country route-map-card__country--selected' : 'route-map-card__country'}
                    fillRule="evenodd"
                    vectorEffect="non-scaling-stroke"
                  />
                )
              })}
            </g>
          ))}

          <path className="route-map-card__route-path" d={routePath} />
          <circle className="route-map-card__origin" cx={startX} cy={startY} r={Math.max(1.7, viewW * .007)} />

          <RouteFlagMarker
            x={markerX}
            y={markerY}
            flagUrl={country.flagUrl}
            flagEmoji={country.flagEmoji}
            alpha2Code={country.alpha2Code}
            scale={markerScale}
          />
        </svg>

        {selectedIsSmall && (
          <div className="route-map-card__inset" aria-hidden="true">
            <span>Local view</span>
            <svg
              viewBox={`${insetX} ${insetY} ${insetW} ${insetH}`}
              preserveAspectRatio="xMidYMid meet"
            >
              <rect
                className="route-map-card__ocean"
                x={insetX}
                y={insetY}
                width={insetW}
                height={insetH}
                rx={4}
              />
              {WORLD_WRAP_OFFSETS.map((offset) => (
                <g
                  key={`inset-world-${offset}`}
                  className="route-map-card__geographies"
                  transform={`translate(${offset} 0)`}
                >
                  {mapCountries.map((geo) => (
                    <path
                      key={`inset-${offset}-${geo.name}-${geo.code ?? 'na'}`}
                      d={geo.path}
                      className={isSelectedCountry(geo, country)
                        ? 'route-map-card__country route-map-card__country--selected'
                        : 'route-map-card__country'}
                      fillRule="evenodd"
                      vectorEffect="non-scaling-stroke"
                    />
                  ))}
                </g>
              ))}

              <g className="route-map-card__local-locator">
                <line
                  x1={destinationX - insetW * .14}
                  y1={destinationY}
                  x2={destinationX + insetW * .14}
                  y2={destinationY}
                />
                <line
                  x1={destinationX}
                  y1={destinationY - insetH * .14}
                  x2={destinationX}
                  y2={destinationY + insetH * .14}
                />
                <circle cx={destinationX} cy={destinationY} r={Math.max(2.6, insetW * .045)} />
              </g>

              <RouteFlagMarker
                x={destinationX}
                y={destinationY}
                flagUrl={country.flagUrl}
                flagEmoji={country.flagEmoji}
                alpha2Code={country.alpha2Code}
                scale={0.46}
              />
            </svg>
          </div>
        )}

        <div className="route-map-card__capital">
          <span>Destination</span>
          <strong>{country.capital}</strong>
        </div>
      </div>

      <p>
        Located in {locationLabel}. Destination: {country.capital}.
      </p>
    </aside>
  )
}
