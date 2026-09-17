import test from 'node:test'
import assert from 'node:assert/strict'

import { normalizeBorders } from '../src/utils/countryBorders.js'

test('Czech Republic receives the known border fallback when the API omits borders', () => {
  assert.deepEqual(normalizeBorders({ alpha3Code: 'CZE', borders: [] }), [
    'AUT',
    'DEU',
    'POL',
    'SVK',
  ])
})

test('valid Czech border data from the API is preserved unchanged', () => {
  assert.deepEqual(normalizeBorders({ alpha3Code: 'CZE', borders: ['DEU', 'POL'] }), [
    'DEU',
    'POL',
  ])
})

test('countries without borders remain borderless when no fallback exists', () => {
  assert.deepEqual(normalizeBorders({ alpha3Code: 'ISL', borders: [] }), [])
})

test('Brazil keeps the existing French Guiana border normalization', () => {
  assert.deepEqual(normalizeBorders({
    alpha3Code: 'BRA',
    borders: ['ARG', 'FRA', 'GUF', 'URY'],
  }), ['ARG', 'GUF', 'URY'])
})
