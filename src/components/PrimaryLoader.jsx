import Lottie from 'lottie-react'
import animationData from '../assets/primary-loader.json'

export default function PrimaryLoader({ label = 'Loading route' }) {
  return (
    <div className="primary-loader" role="status" aria-live="polite">
      <Lottie animationData={animationData} loop autoplay className="primary-loader__animation" />
      <span>{label}</span>
    </div>
  )
}
