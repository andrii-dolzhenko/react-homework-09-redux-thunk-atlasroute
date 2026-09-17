import { Link } from 'react-router'
import HomeHeroMap from '../components/HomeHeroMap'
import RecentlyExploredSection from '../components/RecentlyExploredSection'
import { publicAsset } from '../utils/publicAsset'

const popularDestinations = [
  {
    code: 'ISL',
    name: 'Iceland',
    tagline: 'Where fire, ice and ocean meet.',
    image: publicAsset('assets/hero/hero-japan.png'),
  },
  {
    code: 'CHE',
    name: 'Switzerland',
    tagline: 'Alpine calm, clear lakes and precise design.',
    image: publicAsset('assets/hero/hero-new-zealand.png'),
  },
  {
    code: 'JPN',
    name: 'Japan',
    tagline: 'Tradition meets tomorrow.',
    image: publicAsset('assets/hero/hero-switzerland.png'),
  },
]

const regionShowcase = [
  { name: 'Europe', slug: 'europe', image: publicAsset('assets/hero/hero-new-zealand.png') },
  { name: 'Asia', slug: 'asia', image: publicAsset('assets/hero/hero-switzerland.png') },
  { name: 'Africa', slug: 'africa', image: publicAsset('assets/hero/hero-morocco.png') },
  { name: 'Americas', slug: 'americas', image: publicAsset('assets/hero/hero-japan.png') },
  { name: 'Oceania', slug: 'oceania', image: publicAsset('assets/hero/hero-iceland.png') },
]

export default function HomePage() {
  return (
    <>
      <section className="home-hero home-hero--bleed home-hero--reference">
        <div className="home-hero__copy">
          <p className="eyebrow">Explore. Learn. Go further.</p>
          <h1 className="home-hero__title">
            <span>Explore the world,</span>
            <span>one route at a time.</span>
          </h1>
          <p>
            AtlasRoute turns country discovery into a navigable experience:
            routes, geography and essential facts connected through the URL.
          </p>
          <Link className="primary-button" to="/countries">Start exploring <span>→</span></Link>

          <div className="hero-stats">
            <div><strong>195+</strong><span>Countries</span></div>
            <div><strong>7</strong><span>Continents</span></div>
            <div><strong>∞</strong><span>Routes to explore</span></div>
          </div>
        </div>

        <div className="home-hero__visual" aria-hidden="true">
          <HomeHeroMap />
        </div>
      </section>

      <section className="shell section home-popular-section">
        <div className="section-heading home-popular-heading">
          <h2>Popular Destinations</h2>
          <Link className="text-link" to="/countries">View all →</Link>
        </div>

        <div className="destination-strip destination-strip--home-target">
          {popularDestinations.map((country) => (
            <Link key={country.code} to={`/countries/${country.code}`} className="destination-tile destination-tile--home-target">
              <img src={country.image} alt="" />
              <div>
                <strong>{country.name}</strong>
                <span>{country.tagline}</span>
              </div>
              <span className="destination-tile__arrow" aria-hidden="true">→</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="shell home-region-showcase">
        <div className="home-region-showcase__heading">
          <div>
            <strong>Not sure where to go?</strong>
            <h2>Explore by region</h2>
          </div>
          <Link className="text-link" to="/countries">See all regions →</Link>
        </div>

        <div className="home-region-showcase__list">
          {regionShowcase.map((region) => (
            <Link key={region.name} to={`/countries?region=${region.slug}`} className="home-region-showcase__item">
              <span className="home-region-showcase__image"><img src={region.image} alt="" /></span>
              <span>{region.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <RecentlyExploredSection></RecentlyExploredSection>
    </>
  )
}
