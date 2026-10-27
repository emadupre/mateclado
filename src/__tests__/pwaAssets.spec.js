import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const PNG_SIGNATURE = '89504e470d0a1a0a'

const ICONS = [
  ['public/icons/icon-192.png', 192],
  ['public/icons/icon-512.png', 512],
  ['public/icons/maskable-512.png', 512],
  ['public/apple-touch-icon.png', 180],
]

describe('íconos de la PWA', () => {
  it.each(ICONS)('%s existe, es un PNG y mide %i x %i', (file, size) => {
    const path = resolve(process.cwd(), file)
    expect(existsSync(path), `falta ${file}`).toBe(true)

    const bytes = readFileSync(path)
    expect(bytes.subarray(0, 8).toString('hex')).toBe(PNG_SIGNATURE)
    expect(bytes.readUInt32BE(16)).toBe(size) // ancho
    expect(bytes.readUInt32BE(20)).toBe(size) // alto
  })

  it('existe el favicon', () => {
    expect(existsSync(resolve(process.cwd(), 'public/favicon.svg'))).toBe(true)
  })
})
