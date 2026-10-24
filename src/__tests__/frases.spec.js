import { describe, it, expect } from 'vitest'
import { FRASES } from '@/data/frases'

describe('banco de frases', () => {
  it('tiene una cantidad razonable de frases', () => {
    expect(FRASES.length).toBeGreaterThanOrEqual(40)
  })

  it('no tiene frases repetidas', () => {
    expect(new Set(FRASES).size).toBe(FRASES.length)
  })

  it('no tiene espacios sobrantes ni saltos de linea', () => {
    for (const frase of FRASES) {
      expect(frase).toBe(frase.trim())
      expect(frase).not.toMatch(/\s{2,}/)
      expect(frase).not.toMatch(/\n/)
    }
  })

  it('solo usa caracteres que se pueden tipear en un teclado común', () => {
    const raras = FRASES.filter((frase) => !/^[\p{L}\p{N} ,.;:¿?¡!'"()-]+$/u.test(frase))
    expect(raras).toEqual([])
  })
})
