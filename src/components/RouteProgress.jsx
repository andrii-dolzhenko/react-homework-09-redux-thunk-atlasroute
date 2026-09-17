import { useNavigation } from 'react-router'

export default function RouteProgress() {
  const navigation = useNavigation()
  const active = navigation.state !== 'idle'

  return (
    <div
      className={`route-progress ${active ? 'route-progress--active' : ''}`}
      aria-hidden="true"
    >
      <span />
    </div>
  )
}
