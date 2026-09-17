import Lottie from 'lottie-react'
import animationData from '../assets/inline-loader.json'

export default function InlineLoader() {
  return (
    <Lottie
      animationData={animationData}
      loop
      autoplay
      className="inline-loader"
      aria-hidden="true"
    />
  )
}
