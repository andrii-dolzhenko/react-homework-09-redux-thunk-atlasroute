import { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import SavedCountriesGrid from '../components/SavedCountriesGrid'
import SavedEmptyState from '../components/SavedEmptyState'
import CountryDataError from '../components/CountryDataError'
import CountryGridSkeleton from '../components/CountryGridSkeleton'
import {
  clearSavedCountries,
  selectSavedCount,
  selectSavedCountryCodes,
} from '../redux/savedCountriesSlice'
import {
  COUNTRY_REQUEST_STATUS,
  fetchCountries,
  selectCountries,
  selectCountriesStatus,
} from '../redux/countriesSlice.js'

export default function SavedCountriesPage() {
  const dispatch = useDispatch()
  const countries = useSelector(selectCountries)
  const countriesStatus = useSelector(selectCountriesStatus)
  const savedCountryCodes = useSelector(selectSavedCountryCodes)
  const savedCount = useSelector(selectSavedCount)

  useEffect(() => {
    if (savedCount > 0) dispatch(fetchCountries())
  }, [dispatch, savedCount])

  const countryByCode = useMemo(
    () => new Map(countries.flatMap((country) => [
      [country.code, country],
      [country.alpha2Code, country],
    ])),
    [countries],
  )

  const savedCountries = useMemo(
    () => savedCountryCodes
      .map((code) => countryByCode.get(code))
      .filter(Boolean),
    [countryByCode, savedCountryCodes],
  )

  const destinationLabel = savedCount === 1 ? 'saved destination' : 'saved destinations'
  const isLoading = savedCount > 0
    && countries.length === 0
    && (countriesStatus === COUNTRY_REQUEST_STATUS.idle || countriesStatus === COUNTRY_REQUEST_STATUS.loading)
  const isError = savedCount > 0
    && countries.length === 0
    && countriesStatus === COUNTRY_REQUEST_STATUS.failed

  return (
    <div className="saved-page shell">
      <section className="saved-hero" aria-labelledby="saved-page-title">
        <div className="saved-hero__copy">
          <p className="eyebrow">My Atlas</p>
          <h1 id="saved-page-title">Countries worth coming back to.</h1>
          <p>
            Keep the places that catch your attention in one personal atlas.
            Your saved routes stay available while you continue exploring.
          </p>
        </div>

        <div className="saved-hero__summary" aria-label={`${savedCount} ${destinationLabel}`}>
          <span className="saved-hero__summary-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false">
              <path d="M6.75 4.75A2.75 2.75 0 0 1 9.5 2h5A2.75 2.75 0 0 1 17.25 4.75V21L12 17.65 6.75 21V4.75Z"></path>
            </svg>
          </span>
          <strong>{savedCount}</strong>
          <span>{destinationLabel}</span>
        </div>
      </section>

      {savedCount === 0 ? (
        <SavedEmptyState />
      ) : (
        <section className="saved-collection" aria-labelledby="saved-collection-title">
          <div className="section-heading saved-collection__heading">
            <div>
              <p className="eyebrow">Saved routes</p>
              <h2 id="saved-collection-title">Your personal country collection</h2>
            </div>

            <button
              className="saved-clear-button"
              type="button"
              onClick={() => dispatch(clearSavedCountries())}
            >
              Clear all
            </button>
          </div>

          {isLoading && <CountryGridSkeleton count={Math.min(savedCount, 9)} className="saved-country-grid" />}

          {isError && (
            <CountryDataError
              compact
              title="Your saved routes are safe."
              message="We couldn’t refresh the country information right now. Try the data request again without changing your saved list."
              onRetry={() => dispatch(fetchCountries({ force: true }))}
            />
          )}

          {!isLoading && !isError && savedCountries.length > 0 && (
            <SavedCountriesGrid countries={savedCountries} />
          )}
        </section>
      )}
    </div>
  )
}
