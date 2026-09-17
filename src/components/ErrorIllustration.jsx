import errorIllustrationSvg from '../assets/404-error-map.svg?raw'

export default function ErrorIllustration() {
  return (
    <div
      className="error-illustration error-illustration--inline"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: errorIllustrationSvg }}
    />
  )
}
