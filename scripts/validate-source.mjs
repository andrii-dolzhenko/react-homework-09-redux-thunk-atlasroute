import { readFile } from 'node:fs/promises'

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8')
const css = await readFile(new URL('../src/styles.css', import.meta.url), 'utf8')

const failures = []

const xhtmlVoidTag = /<(?:meta|link|img|input|br|hr|source|area|base|col|embed|param|track|wbr)\b[^>]*\s\/>/i
if (xhtmlVoidTag.test(html)) {
  failures.push('index.html contains XHTML-style trailing slashes on void elements.')
}

const forbiddenCssPatterns = [
  ['CSS custom properties', /var\(--|^\s*--[a-z0-9_-]+\s*:/im],
  ['vendor-prefixed declarations', /-webkit-|^-moz-|\s-moz-|^-ms-|\s-ms-/im],
  ['vector-effect in CSS', /\bvector-effect\s*:/i],
  ['paint-order in CSS', /\bpaint-order\s*:/i],
  ['mask shorthand/image', /\bmask(?:-image)?\s*:/i],
]

for (const [label, pattern] of forbiddenCssPatterns) {
  if (pattern.test(css)) failures.push(`styles.css contains ${label}.`)
}

if (failures.length) {
  console.error('\nSource validation failed:')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log('Source validation passed: HTML void tags and CSS validator guardrails are clean.')
