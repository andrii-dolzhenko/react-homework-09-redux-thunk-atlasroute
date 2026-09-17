import Lottie from 'lottie-react'
import animationData from '../assets/country-data-loader.json'
import { MAP_HEIGHT, MAP_WIDTH, mapCountries } from '../data/mapPaths.js'
import { publicAsset } from '../utils/publicAsset.js'

export default function CountryDataLoader({
  title = 'Mapping the world for you…',
  label = 'Loading country data',
  compact = false,
}) {
  return (
    <div className={compact ? 'country-data-loader country-data-loader--compact' : 'country-data-loader'} role="status" aria-live="polite">
      <svg
        className="country-data-loader__map"
        viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
        aria-hidden="true"
        focusable="false"
      >
        {mapCountries.map((country, index) => (
          <path
            key={`${country.code ?? country.name}-${index}`}
            d={country.path}
            fill="currentColor"
          />
        ))}
      </svg>
      <div className="country-data-loader__content">
        <div className="country-data-loader__brand" aria-hidden="true">
          <img src={publicAsset('assets/brand/logo.svg')} alt="" />
          <strong>Atlas<span>Route</span></strong>
        </div>
        <strong className="country-data-loader__title">{title}</strong>
        <Lottie
          animationData={animationData}
          loop
          autoplay
          className="country-data-loader__animation"
        />
        <span className="country-data-loader__label">{label}</span>
      </div>
    </div>
  )
}
