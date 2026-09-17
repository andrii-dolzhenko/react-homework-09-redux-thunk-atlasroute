import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const distDir = new URL('../dist/', import.meta.url)
const html = await readFile(new URL('index.html', distDir), 'utf8')
const assetsDir = new URL('assets/', distDir)
const assetNames = await readdir(assetsDir)
const cssFiles = assetNames.filter((name) => name.endsWith('.css'))
const css = (await Promise.all(cssFiles.map((name) => readFile(new URL(name, assetsDir), 'utf8')))).join('\n')

const failures = []
const xhtmlVoidTag = /<(?:meta|link|img|input|br|hr|source|area|base|col|embed|param|track|wbr)\b[^>]*\s\/>/i
if (xhtmlVoidTag.test(html)) failures.push('dist/index.html contains XHTML-style trailing slashes.')

const forbiddenCssPatterns = [
  ['CSS custom properties', /var\(--|^\s*--[a-z0-9_-]+\s*:/im],
  ['vendor-prefixed declarations', /-webkit-|^-moz-|\s-moz-|^-ms-|\s-ms-/im],
  ['vector-effect in CSS', /\bvector-effect\s*:/i],
  ['paint-order in CSS', /\bpaint-order\s*:/i],
  ['mask shorthand/image', /\bmask(?:-image)?\s*:/i],
]
for (const [label, pattern] of forbiddenCssPatterns) {
  if (pattern.test(css)) failures.push(`dist CSS contains ${label}.`)
}

const multiWordFamilies = ['Segoe UI', 'Times New Roman', 'Snell Roundhand', 'Apple Chancery', 'Segoe Script', 'Brush Script MT']
for (const family of multiWordFamilies) {
  if (css.includes(family) && !css.includes(`"${family}"`) && !css.includes(`'${family}'`)) {
    failures.push(`dist CSS contains unquoted multi-word font family: ${family}.`)
  }
}

if (failures.length) {
  console.error('\nBuild validation failed:')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log('Build validation passed: generated HTML/CSS guardrails are clean.')
