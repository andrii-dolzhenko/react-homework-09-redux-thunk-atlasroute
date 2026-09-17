import { useEffect, useRef, useState } from 'react'
import Lottie from 'lottie-react'
import navigateAnimation from '../assets/navigate.json'
import discoverAnimation from '../assets/discover.json'
import goDeeperAnimation from '../assets/go-deeper.json'

const cards = [
  {
    number: '01',
    title: 'Navigate',
    text: 'Move between countries without full page reloads. Every destination has its own URL, so navigation stays fast, clear and shareable.',
    animation: navigateAnimation,
    delay: 0,
  },
  {
    number: '02',
    title: 'Discover',
    text: 'Search the world, filter by region and use URL-based state to keep the current discovery context visible and easy to revisit.',
    animation: discoverAnimation,
    delay: 850,
  },
  {
    number: '03',
    title: 'Go deeper',
    text: 'Open a country route for live facts, curated imagery and connected neighbours, then continue the journey without losing context.',
    animation: goDeeperAnimation,
    delay: 1700,
  },
]

function ConceptCard({ card }) {
  const lottieRef = useRef(null)
  const [revealed, setRevealed] = useState(card.delay === 0)

  useEffect(() => {
    if (card.delay === 0) return undefined
    const revealTimer = window.setTimeout(() => setRevealed(true), card.delay)
    return () => window.clearTimeout(revealTimer)
  }, [card.delay])

  useEffect(() => {
    if (!revealed || !lottieRef.current) return undefined
    const animation = lottieRef.current
    animation.setSpeed(0.62)
    animation.goToAndStop(0, true)
    const playTimer = window.setTimeout(() => animation.play(), 80)
    return () => window.clearTimeout(playTimer)
  }, [revealed])

  return (
    <article>
      <div className="concept-card__top">
        <span>{card.number}</span>
        <div className={`concept-card__animation-frame ${revealed ? 'concept-card__animation-frame--visible' : ''}`}>
          {revealed && (
            <div className="concept-card__animation-scale">
              <Lottie
                lottieRef={lottieRef}
                animationData={card.animation}
                loop
                autoplay={false}
                className="concept-card__animation"
                aria-hidden="true"
              />
            </div>
          )}
        </div>
      </div>
      <strong>{card.title}</strong>
      <p>{card.text}</p>
    </article>
  )
}

export default function AboutPage() {
  return (
    <section className="shell simple-page about-page">
      <p className="eyebrow">About AtlasRoute</p>
      <h1>Every country has a route.</h1>
      <p>
        AtlasRoute is a visual country explorer built around client-side routing.
        It connects meaningful URLs with live country data, searchable discovery and
        destination-to-destination navigation, so exploring the world feels like one
        continuous journey rather than a collection of disconnected pages.
      </p>

      <div className="concept-cards">
        {cards.map((card) => <ConceptCard key={card.number} card={card} />)}
      </div>
    </section>
  )
}
