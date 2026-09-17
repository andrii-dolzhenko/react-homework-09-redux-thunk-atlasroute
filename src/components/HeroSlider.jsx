import { useEffect, useState } from 'react'
import { featuredSlides, formatPopulation } from '../data/featured'

export default function HeroSlider() {
  const [activeIndex, setActiveIndex] = useState(0)
  const active = featuredSlides[activeIndex]

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (reducedMotion.matches) return undefined

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % featuredSlides.length)
    }, 6500)

    return () => window.clearInterval(timer)
  }, [])

  return (
    <section className="marketing-slider" aria-label="Featured destinations">
      <div className="slider-stage">
        {featuredSlides.map((slide, index) => (
          <img
            key={slide.code}
            className={index === activeIndex ? 'slider-image slider-image--active' : 'slider-image'}
            src={slide.image}
            alt=""
            aria-hidden={index !== activeIndex}
          />
        ))}
        <div className="slider-shade" />

        <div className="slider-stepper" role="tablist" aria-label="Featured destinations">
          <span className="slider-stepper__count">{String(activeIndex + 1).padStart(2, '0')}</span>
          <span className="slider-stepper__line" aria-hidden="true" />
          {featuredSlides.map((slide, index) => (
            <button
              key={slide.code}
              type="button"
              role="tab"
              aria-selected={index === activeIndex}
              aria-label={`Show ${slide.name}`}
              className={index === activeIndex ? 'step-dot step-dot--active' : 'step-dot'}
              onClick={() => setActiveIndex(index)}
            />
          ))}
          <span className="slider-stepper__total">05</span>
        </div>

        <div className="slider-copy shell">
          <p className="eyebrow">Featured route</p>
          <h1>{active.name}</h1>
          <p className="slider-tagline">{active.tagline}</p>
          <div className="slider-meta">
            <span>{active.capital}</span>
            <span>{active.region}</span>
            <span>{formatPopulation(active.population)} people</span>
          </div>
        </div>
      </div>
    </section>
  )
}
