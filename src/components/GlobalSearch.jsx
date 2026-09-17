import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { searchCountries } from '../api/countries'
import InlineLoader from './InlineLoader'

export default function GlobalSearch() {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [focused, setFocused] = useState(false)
  const [loading, setLoading] = useState(false)
  const [matches, setMatches] = useState([])
  const wrapperRef = useRef(null)
  const inputRef = useRef(null)
  const navigate = useNavigate()

  const closeSearch = () => {
    setOpen(false)
    setFocused(false)
    setQuery('')
    setMatches([])
    setLoading(false)
  }

  useEffect(() => {
    if (!open) return undefined
    const frame = window.requestAnimationFrame(() => inputRef.current?.focus())
    return () => window.cancelAnimationFrame(frame)
  }, [open])

  useEffect(() => {
    if (!open && !focused) return undefined

    const handlePointerDown = (event) => {
      if (!wrapperRef.current?.contains(event.target)) closeSearch()
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [open, focused])

  useEffect(() => {
    const normalized = query.trim()
    if (normalized.length < 2) {
      setMatches([])
      setLoading(false)
      return undefined
    }

    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      try {
        setLoading(true)
        const results = await searchCountries(normalized, { signal: controller.signal })
        setMatches(results)
      } catch (error) {
        if (error?.name !== 'AbortError') setMatches([])
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }, 280)

    return () => {
      controller.abort()
      window.clearTimeout(timer)
    }
  }, [query])

  const goToCountry = (code) => {
    closeSearch()
    navigate(`/countries/${code}`)
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') closeSearch()
    if (event.key === 'Enter' && matches[0]) {
      event.preventDefault()
      goToCountry(matches[0].code)
    }
  }

  const active = open || focused

  return (
    <div
      ref={wrapperRef}
      className={`global-search ${active ? 'global-search--focused' : ''} ${open ? 'global-search--open' : ''}`}
    >
      <button
        type="button"
        className="search-toggle"
        aria-label={open ? 'Close country search' : 'Open country search'}
        aria-expanded={open}
        onClick={() => {
          if (open) closeSearch()
          else setOpen(true)
        }}
      >
        <span aria-hidden="true">⌕</span>
      </button>

      <input
        id="global-country-search"
        name="country-search"
        ref={inputRef}
        type="search"
        value={query}
        placeholder="Search countries"
        aria-label="Search countries"
        autoComplete="off"
        onChange={(event) => setQuery(event.target.value)}
        onFocus={() => {
          setFocused(true)
          setOpen(true)
        }}
        onKeyDown={handleKeyDown}
      />

      {active && query.trim().length >= 2 && (
        <div className="suggestions">
          {loading ? (
            <div className="suggestion-status"><InlineLoader /> Searching…</div>
          ) : matches.length ? (
            matches.map((country) => (
              <button
                key={country.code}
                type="button"
                onClick={() => goToCountry(country.code)}
              >
                <span className="suggestion-flag">
                  {country.flagEmoji || <img src={country.flagUrl} alt="" />}
                </span>
                <span>
                  <strong>{country.name}</strong>
                  <small>{country.region} · {country.capital}</small>
                </span>
              </button>
            ))
          ) : (
            <div className="suggestion-status">No countries found</div>
          )}
        </div>
      )}
    </div>
  )
}
