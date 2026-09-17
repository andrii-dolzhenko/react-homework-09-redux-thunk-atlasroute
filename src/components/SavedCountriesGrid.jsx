import { memo } from 'react'
import CountryCard from './CountryCard'

function SavedCountriesGrid({ countries }) {
  return (
    <div className="country-grid saved-country-grid">
      {countries.map((country) => (
        <CountryCard key={country.code} country={country} />
      ))}
    </div>
  )
}

export default memo(SavedCountriesGrid)
