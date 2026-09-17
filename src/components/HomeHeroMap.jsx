import { publicAsset } from '../utils/publicAsset'

export default function HomeHeroMap() {
  return (
    <div className="home-hero-map-stage" aria-hidden="true">
      <img
        className="home-hero-composite home-hero-composite--light"
        src={publicAsset('assets/hero/home-hero-composite-v14.png')}
        alt=""
      />

      <img
        className="home-hero-composite home-hero-composite--dark"
        src={publicAsset('assets/hero/home-hero-composite-dark.png')}
        alt=""
      />

      <p className="home-hero__script-note">
        <span>Big journeys start</span>
        <span>with a single route.</span>
      </p>
    </div>
  )
}
