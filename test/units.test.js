import test from 'node:test'
import assert from 'node:assert/strict'
import { convertArea, formatArea } from '../src/utils/units.js'

test('metric area remains unchanged', () => {
  assert.equal(convertArea(103000, 'metric'), 103000)
  assert.equal(formatArea(103000, 'metric'), '103,000 km²')
})

test('imperial area uses square-mile conversion', () => {
  const converted = convertArea(103000, 'imperial')
  assert.ok(Math.abs(converted - 39768.5223) < 0.001)
  assert.equal(formatArea(103000, 'imperial'), '39,769 mi²')
})

test('small areas keep useful decimal precision', () => {
  assert.equal(formatArea(0.49, 'metric'), '0.49 km²')
  assert.equal(formatArea(0.49, 'imperial'), '0.19 mi²')
})

test('invalid area values render the fallback', () => {
  assert.equal(convertArea('not-a-number', 'metric'), null)
  assert.equal(formatArea('not-a-number', 'imperial'), '—')
})
