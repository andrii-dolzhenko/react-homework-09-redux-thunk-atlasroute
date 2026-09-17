import test from 'node:test'
import assert from 'node:assert/strict'

import { continentMapViews, projectLonLat } from '../src/data/mapPaths.js'
import { wrapProjectedXToView } from '../src/utils/mapProjection.js'

const [oceaniaX, , oceaniaW] = continentMapViews.Oceania.viewBox

test('Oceania destinations east of the dateline stay on the native world copy', () => {
  const [guamX] = projectLonLat([144.8, 13.5])
  const wrappedX = wrapProjectedXToView(guamX, oceaniaX, oceaniaW)

  assert.equal(wrappedX, guamX)
})

test('Oceania destinations west of the dateline wrap to the neighbouring world copy', () => {
  const [niueX] = projectLonLat([-169.9, -19.1])
  const wrappedX = wrapProjectedXToView(niueX, oceaniaX, oceaniaW)

  assert.ok(wrappedX > 1000)
  assert.ok(Math.abs(wrappedX - (niueX + 1000)) < Number.EPSILON)
})

test('French Polynesia uses the Pacific-side wrapped coordinate instead of the far-left world edge', () => {
  const [polynesiaX] = projectLonLat([-149.4, -17.7])
  const wrappedX = wrapProjectedXToView(polynesiaX, oceaniaX, oceaniaW)

  assert.ok(wrappedX > 1000)
  assert.ok(Math.abs(wrappedX - (polynesiaX + 1000)) < Number.EPSILON)
})
