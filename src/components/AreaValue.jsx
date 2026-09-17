import { memo } from 'react'
import { useSelector } from 'react-redux'
import { selectUnitSystem } from '../redux/preferencesSlice'
import { formatArea } from '../utils/units'

function AreaValue({ areaKm2 }) {
  const unitSystem = useSelector(selectUnitSystem)

  return formatArea(areaKm2, unitSystem)
}

export default memo(AreaValue)
