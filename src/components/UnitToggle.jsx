import { memo, useId } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectUnitSystem, setUnitSystem } from '../redux/preferencesSlice'

const OPTIONS = [
  { value: 'metric', shortLabel: 'km²', accessibleLabel: 'Metric, square kilometers' },
  { value: 'imperial', shortLabel: 'mi²', accessibleLabel: 'Imperial, square miles' },
]

function UnitToggle({ className = '' }) {
  const dispatch = useDispatch()
  const unitSystem = useSelector(selectUnitSystem)
  const groupId = useId()
  const groupName = `area-display-units-${groupId}`

  return (
    <fieldset className={`unit-toggle ${className}`.trim()}>
      <legend className="visually-hidden">Area display units</legend>

      {OPTIONS.map((option) => (
        <label
          key={option.value}
          className="unit-toggle__option"
          title={option.accessibleLabel}
        >
          <input
            className="unit-toggle__input visually-hidden"
            type="radio"
            name={groupName}
            value={option.value}
            checked={unitSystem === option.value}
            aria-label={option.accessibleLabel}
            onChange={() => dispatch(setUnitSystem(option.value))}
          />
          <span className="unit-toggle__label">{option.shortLabel}</span>
        </label>
      ))}
    </fieldset>
  )
}

export default memo(UnitToggle)
