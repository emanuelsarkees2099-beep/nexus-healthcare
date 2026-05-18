/**
 * Generates PWA PNG icons from public/icons/icon.svg using sharp.
 * Run with: node scripts/generate-icons.mjs
 */
import sharp from 'sharp'
import { readFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root      = join(__dirname, '..')
const svgPath   = join(root, 'public', 'icons', 'icon.svg')
const outDir    = join(root, 'public', 'icons')

mkdirSync(outDir, { recursive: true })

const svg = readFileSync(svgPath)

const sizes = [
  { file: 'icon-192.png', size: 192 },
  { file: 'icon-512.png', size: 512 },
  { file: 'icon-180.png', size: 180 }, // Apple touch icon
]

for (const { file, size } of sizes) {
  const outPath = join(outDir, file)
  await sharp(svg)
    .resize(size, size, { fit: 'contain', background: { r: 2, g: 4, b: 9, alpha: 1 } })
    .png()
    .toFile(outPath)
  console.log(`✓  ${file}  (${size}×${size})`)
}

console.log('\nAll PWA icons generated.')
