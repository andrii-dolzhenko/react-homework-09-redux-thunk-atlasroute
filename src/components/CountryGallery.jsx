import { useEffect, useState } from 'react'
import InlineLoader from './InlineLoader'

export default function CountryGallery({ country, images, loading, error }) {
  const [activeIndex, setActiveIndex] = useState(null)

  const galleryImages = country.heroImage
    ? images.slice(0, 3)
    : images.length >= 4
      ? images.slice(1, 4)
      : images.slice(0, 3)

  useEffect(() => {
    if (activeIndex === null || !galleryImages.length) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setActiveIndex(null)
      if (event.key === 'ArrowRight') {
        setActiveIndex((current) => (current + 1) % galleryImages.length)
      }
      if (event.key === 'ArrowLeft') {
        setActiveIndex((current) => (current - 1 + galleryImages.length) % galleryImages.length)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [activeIndex, galleryImages.length])

  const showPrevious = () => {
    setActiveIndex((current) => (current - 1 + galleryImages.length) % galleryImages.length)
  }

  const showNext = () => {
    setActiveIndex((current) => (current + 1) % galleryImages.length)
  }

  return (
    <section className="shell gallery-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">See the country</p>
          <h2>Views from {country.name}</h2>
        </div>
        <span>{galleryImages.length ? 'Photography via Pixabay' : 'Travel photography'}</span>
      </div>

      {loading ? (
        <div className="gallery-loading"><InlineLoader /> Loading gallery…</div>
      ) : galleryImages.length ? (
        <div className="gallery-grid">
          {galleryImages.map((image, index) => (
            <button
              type="button"
              className={`gallery-item ${index === 0 ? 'gallery-main' : ''}`}
              key={`${image.id ?? image.src}-${index}`}
              onClick={() => setActiveIndex(index)}
              aria-label={`Open ${country.name} image ${index + 1}`}
            >
              <img
                src={image.src}
                alt={image.title}
                loading={index === 0 ? 'eager' : 'lazy'}
                fetchPriority={index === 0 ? 'low' : 'auto'}
                decoding="async"
              />
              <span className="gallery-item__hint">View</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="gallery-empty">
          <strong>{error?.code === 'PIXABAY_KEY_MISSING' ? 'Pixabay gallery is ready to connect.' : 'No travel photos available right now.'}</strong>
          <p>
            {error?.code === 'PIXABAY_KEY_MISSING'
              ? 'Add VITE_PIXABAY_API_KEY to .env.local and restart Vite.'
              : 'Country facts and routing remain available even when the media source is unavailable.'}
          </p>
        </div>
      )}

      {activeIndex !== null && galleryImages[activeIndex] && (
        <div
          className="gallery-modal"
          role="dialog"
          aria-modal="true"
          aria-label={`${country.name} gallery`}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setActiveIndex(null)
          }}
        >
          <div className="gallery-modal__panel">
            <button
              type="button"
              className="gallery-modal__close"
              onClick={() => setActiveIndex(null)}
              aria-label="Close gallery"
            >
              ×
            </button>

            <button
              type="button"
              className="gallery-modal__arrow gallery-modal__arrow--prev"
              onClick={showPrevious}
              aria-label="Previous image"
            >
              ←
            </button>

            <img
              className="gallery-modal__image"
              src={galleryImages[activeIndex].src}
              alt={galleryImages[activeIndex].title}
              fetchPriority="high"
              decoding="async"
            />

            <button
              type="button"
              className="gallery-modal__arrow gallery-modal__arrow--next"
              onClick={showNext}
              aria-label="Next image"
            >
              →
            </button>

            <div className="gallery-modal__footer">
              <span>{String(activeIndex + 1).padStart(2, '0')} / {String(galleryImages.length).padStart(2, '0')}</span>
              <div>
                {galleryImages[activeIndex].photographer && <span>Photo: {galleryImages[activeIndex].photographer}</span>}
                {galleryImages[activeIndex].source && (
                  <a href={galleryImages[activeIndex].source} target="_blank" rel="noreferrer">Pixabay ↗</a>
                )}
              </div>
            </div>
            <div className="gallery-progress" aria-hidden="true">
              <span style={{ width: `${((activeIndex + 1) / galleryImages.length) * 100}%` }} />
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
