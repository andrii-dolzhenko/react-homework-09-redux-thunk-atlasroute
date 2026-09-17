import { MAP_WIDTH } from '../data/mapPaths.js'

export const WORLD_WRAP_OFFSETS = [-MAP_WIDTH, 0, MAP_WIDTH]

export const wrapProjectedXToView = (projectedX, viewX, viewW) => {
  const viewCenterX = viewX + viewW / 2

  return WORLD_WRAP_OFFSETS
    .map((offset) => projectedX + offset)
    .reduce((closest, candidate) => (
      Math.abs(candidate - viewCenterX) < Math.abs(closest - viewCenterX)
        ? candidate
        : closest
    ))
}
