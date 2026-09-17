import { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams } from 'react-router'
import HeroSlider from '../components/HeroSlider'
import CountryCard from '../components/CountryCard'
import CountryDataError from '../components/CountryDataError'
import CountryDataLoader from '../components/CountryDataLoader'
import CountryGridSkeleton from '../components/CountryGridSkeleton'
import CountrySortMenu from '../components/CountrySortMenu'
import {
  COUNTRY_REQUEST_STATUS,
  fetchCountries,
  selectCountries,
  selectCountriesStatus,
} from '../redux/countriesSlice.js'

const regions = ['all', 'Europe', 'Asia', 'Americas', 'Africa', 'Oceania']
const PAGE_SIZE = 15

const getPaginationItems = (currentPage, totalPages) => {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1)

  const items = [1]
  const start = Math.max(2, currentPage - 1)
  const end = Math.min(totalPages - 1, currentPage + 1)

  if (start > 2) items.push('start-ellipsis')
  for (let page = start; page <= end; page += 1) items.push(page)
  if (end < totalPages - 1) items.push('end-ellipsis')

  items.push(totalPages)
  return items
}

export default function CountriesPage() {
  const dispatch = useDispatch()
  const countries = useSelector(selectCountries)
  const status = useSelector(selectCountriesStatus)
  const [searchParams, setSearchParams] = useSearchParams()

  const query = searchParams.get('q') ?? ''
  const region = searchParams.get('region') ?? 'all'
  const sortOrder = searchParams.get('sort') === 'za' ? 'za' : 'az'

  useEffect(() => {
    dispatch(fetchCountries())
  }, [dispatch])

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    const matchingCountries = countries.filter((country) => {
      const regionMatch = region === 'all' || country.region.toLowerCase() === region.toLowerCase()
      const queryMatch =
        !normalizedQuery ||
        `${country.name} ${country.capital} ${country.code}`.toLowerCase().includes(normalizedQuery)
      return regionMatch && queryMatch
    })

    return [...matchingCountries].sort((first, second) => {
      const comparison = first.name.localeCompare(second.name, 'en', { sensitivity: 'base' })
      return sortOrder === 'za' ? -comparison : comparison
    })
  }, [countries, query, region, sortOrder])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const requestedPage = Number.parseInt(searchParams.get('page') ?? '1', 10)
  const currentPage = Number.isFinite(requestedPage)
    ? Math.min(Math.max(requestedPage, 1), totalPages)
    : 1
  const firstItemIndex = (currentPage - 1) * PAGE_SIZE
  const visibleCountries = filtered.slice(firstItemIndex, firstItemIndex + PAGE_SIZE)
  const paginationItems = getPaginationItems(currentPage, totalPages)

  const isInitialLoading = countries.length === 0
    && (status === COUNTRY_REQUEST_STATUS.idle || status === COUNTRY_REQUEST_STATUS.loading)
  const isInitialError = countries.length === 0 && status === COUNTRY_REQUEST_STATUS.failed

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams)
    const shouldDelete = !value
      || value === 'all'
      || (key === 'sort' && value === 'az')

    if (shouldDelete) next.delete(key)
    else next.set(key, value)

    next.delete('page')
    setSearchParams(next)
  }

  const goToPage = (page) => {
    const nextPage = Math.min(Math.max(page, 1), totalPages)
    const next = new URLSearchParams(searchParams)
    if (nextPage === 1) next.delete('page')
    else next.set('page', String(nextPage))
    setSearchParams(next)
  }

  if (isInitialLoading) {
    return (
      <main className="shell countries-loading-state">
        <CountryDataLoader />
        <CountryGridSkeleton count={PAGE_SIZE} />
      </main>
    )
  }

  return (
    <>
      <HeroSlider />

      <section className="shell explorer-section">
        <div className="section-heading explorer-heading">
          <div>
            <p className="eyebrow">Country explorer</p>
            <h2>Find your next route</h2>
          </div>
          <span>{`${filtered.length} destinations`}</span>
        </div>

        <div className="catalog-controls">
          <label className="catalog-search">
            <span aria-hidden="true">⌕</span>
            <input
              id="country-catalog-search"
              name="country-catalog-search"
              type="search"
              value={query}
              placeholder="Search by country, capital or code"
              autoComplete="off"
              disabled={isInitialError}
              onChange={(event) => updateParam('q', event.target.value)}
            />
          </label>

          <CountrySortMenu
            value={sortOrder}
            disabled={isInitialError}
            onChange={(value) => updateParam('sort', value)}
          />

          <div className="region-tabs" aria-label="Filter by region">
            {regions.map((item) => {
              const active = region.toLowerCase() === item.toLowerCase()
              return (
                <button
                  key={item}
                  type="button"
                  className={active ? 'region-tab region-tab--active' : 'region-tab'}
                  aria-pressed={active}
                  disabled={isInitialError}
                  onClick={() => updateParam('region', item)}
                >
                  {item === 'all' ? 'All' : item}
                </button>
              )
            })}
          </div>
        </div>



        {isInitialError && (
          <CountryDataError onRetry={() => dispatch(fetchCountries())} />
        )}

        {!isInitialError && filtered.length > 0 && (
          <>
            <div className="country-grid">
              {visibleCountries.map((country, index) => (
                <CountryCard
                  key={country.code}
                  country={country}
                  imagePriority={index < 3}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <nav className="catalog-pagination" aria-label="Countries pagination">
                <button
                  type="button"
                  className="catalog-pagination__nav"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                >
                  ←
                </button>

                <div className="catalog-pagination__pages">
                  {paginationItems.map((item) => (
                    typeof item === 'number' ? (
                      <button
                        key={item}
                        type="button"
                        className={item === currentPage ? 'catalog-pagination__page catalog-pagination__page--active' : 'catalog-pagination__page'}
                        onClick={() => goToPage(item)}
                        aria-current={item === currentPage ? 'page' : undefined}
                        aria-label={`Page ${item}`}
                      >
                        {item}
                      </button>
                    ) : (
                      <span key={item} className="catalog-pagination__ellipsis" aria-hidden="true">…</span>
                    )
                  ))}
                </div>

                <button
                  type="button"
                  className="catalog-pagination__nav"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  aria-label="Next page"
                >
                  →
                </button>
              </nav>
            )}
          </>
        )}

        {!isInitialError && filtered.length === 0 && (
          <div className="empty-state">
            <strong>No countries found</strong>
            <p>Try another name or remove the current region filter.</p>
          </div>
        )}
      </section>
    </>
  )
}
