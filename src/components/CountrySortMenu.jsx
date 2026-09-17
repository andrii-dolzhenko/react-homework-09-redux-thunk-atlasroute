import { useEffect, useRef, useState } from 'react'

const options = [
  { value: 'az', label: 'A → Z' },
  { value: 'za', label: 'Z → A' },
]

export default function CountrySortMenu({ value = 'az', onChange, disabled = false }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined

    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false)
    }
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  const selectOption = (nextValue) => {
    onChange(nextValue)
    setOpen(false)
  }

  return (
    <div className="catalog-sort" ref={rootRef}>
      <button
        className={open || value === 'za' ? 'catalog-sort__button catalog-sort__button--active' : 'catalog-sort__button'}
        type="button"
        aria-label={`Sort countries by name, ${value === 'za' ? 'Z to A' : 'A to Z'}`}
        aria-expanded={open}
        aria-haspopup="menu"
        title="Sort countries"
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M8 5v14m0 0-3-3m3 3 3-3M13 7h7M13 12h5M13 17h3" />
        </svg>
      </button>

      {open && (
        <div className="catalog-sort__menu" role="menu" aria-label="Sort by name">
          <span className="catalog-sort__label">Sort by name</span>
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              role="menuitemradio"
              aria-checked={value === option.value}
              className={value === option.value ? 'catalog-sort__option catalog-sort__option--active' : 'catalog-sort__option'}
              onClick={() => selectOption(option.value)}
            >
              <span>{option.label}</span>
              {value === option.value && <span aria-hidden="true">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
