import { useId } from 'react'

const alpha2ToFlag = (alpha2 = '') => {
  const code = alpha2.toUpperCase()
  if (!/^[A-Z]{2}$/.test(code)) return '●'
  return String.fromCodePoint(...[...code].map((letter) => 127397 + letter.charCodeAt(0)))
}

export default function RouteFlagMarker({ x, y, flagUrl, flagEmoji, alpha2Code, scale = 1 }) {
  const clipId = `route-flag-${useId().replace(/:/g, '')}`
  const outerRadius = 13.5 * scale
  const badgeRadius = 10.5 * scale
  const flagRadius = 7.25 * scale
  const flag = flagEmoji || alpha2ToFlag(alpha2Code)

  return (
    <g className="route-map-card__destination-marker" transform={`translate(${x} ${y})`}>
      <circle
        r={outerRadius}
        className="route-map-card__pin-ripple route-map-card__pin-ripple--one"
      />
      <circle
        r={outerRadius}
        className="route-map-card__pin-ripple route-map-card__pin-ripple--two"
      />
      <circle r={badgeRadius} className="route-map-card__pin-ring" />
      <circle r={badgeRadius - (1.7 * scale)} className="route-map-card__pin-core" />

      <defs>
        <clipPath id={clipId}>
          <circle r={flagRadius} />
        </clipPath>
      </defs>

      <text
        className="route-map-card__flag-fallback"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={11.6 * scale}
      >
        {flag}
      </text>

      {flagUrl && (
        <image
          className="route-map-card__flag-image"
          href={flagUrl}
          x={-flagRadius}
          y={-flagRadius}
          width={flagRadius * 2}
          height={flagRadius * 2}
          preserveAspectRatio="xMidYMid slice"
          clipPath={`url(#${clipId})`}
        />
      )}
    </g>
  )
}
