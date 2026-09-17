import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router'
import GlobalSearch from './GlobalSearch'
import ThemeToggle from './ThemeToggle'
import SavedCountriesLink from './SavedCountriesLink'
import UnitToggle from './UnitToggle'
import { navigationRoutes } from '../config/routes'
import { publicAsset } from '../utils/publicAsset'

export default function Header() {
  const { pathname } = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!mobileMenuOpen) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setMobileMenuOpen(false)
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [mobileMenuOpen])

  const handleBrandClick = (event) => {
    setMobileMenuOpen(false)
    if (pathname !== '/') return

    event.preventDefault()
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, left: 0, behavior: reduceMotion ? 'auto' : 'smooth' })
  }

  return (
    <header className={`site-header ${mobileMenuOpen ? 'site-header--menu-open' : ''}`}>
      <div className="shell header-inner">
        <NavLink className="brand" to="/" aria-label="AtlasRoute home" onClick={handleBrandClick}>
          <img className="brand-icon" src={publicAsset('favicon.svg')} alt="" aria-hidden="true" />
          <span className="brand-word"><span>Atlas</span><span className="brand-route">Route</span></span>
        </NavLink>

        <nav id="primary-navigation" className="main-nav" aria-label="Primary navigation">
          {navigationRoutes.map(({ key, path, label, end }) => (
            <NavLink
              key={key}
              to={path}
              end={end}
              onClick={() => setMobileMenuOpen(false)}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="header-search">
          <GlobalSearch />
        </div>

        <div className="mobile-display-preferences" aria-label="Display preferences">
          <div>
            <strong>Area units</strong>
            <span>Metric / Imperial</span>
          </div>
          <UnitToggle className="unit-toggle--mobile" />
        </div>

        <div className="header-actions">
          <div className="header-unit-control">
            <UnitToggle />
          </div>
          <ThemeToggle />
          <SavedCountriesLink />
          <button
            type="button"
            className="mobile-menu-toggle"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-controls="primary-navigation"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((current) => !current)}
          >
            <span aria-hidden="true" />
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  )
}
