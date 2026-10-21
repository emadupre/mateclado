import { describe, it, expect } from 'vitest'
import { buildText } from '@/utils/buildText'

describe('buildText', () => {
  it('alcanza como mínimo la cantidad de caracteres pedida', () => {
    expect(buildText(300).length).toBeGreaterThanOrEqual(300)
    expect(buildText(1500).length).toBeGreaterThanOrEqual(1500)
  })

  it('no empieza ni termina con espacios', () => {
    const text = buildText(400)
    expect(text).toBe(text.trim())
  })

  it('usa solo frases del banco indicado', () => {
    const phrases = ['uno', 'dos', 'tres']
    const words = buildText(100, { phrases }).split(' ')
    for (const word of words) {
      expect(phrases).toContain(word)
    }
  })

  it('no repite la misma frase dos veces seguidas', () => {
    for (let n = 0; n < 20; n++) {
      const words = buildText(200, { phrases: ['a', 'b'] }).split(' ')
      for (let i = 1; i < words.length; i++) {
        expect(words[i]).not.toBe(words[i - 1])
      }
    }
  })

  it('lanza un error si no hay frases', () => {
    expect(() => buildText(100, { phrases: [] })).toThrow('al menos una frase')
  })
})
