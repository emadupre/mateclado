import { describe, expect, it } from 'vitest'
import { FRASES } from '@/data/frases'
import { CATEGORIES, GLOSARIO } from '@/data/glosario'
import {
  exampleFor,
  findWords,
  indexOfWord,
  normalizeText,
  publishableEntries,
} from '@/utils/glosario'

describe('normalizeText', () => {
  it('pasa a minúsculas y saca las tildes', () => {
    expect(normalizeText('Tomátelas, CHÉ')).toBe('tomatelas, che')
  })

  it('conserva la ñ', () => {
    expect(normalizeText('Año')).toBe('año')
    expect(normalizeText('caña')).not.toBe(normalizeText('cana'))
  })

  it('no cambia el largo de ninguna frase (si no, las posiciones no coincidirían)', () => {
    const cambian = FRASES.filter((frase) => normalizeText(frase).length !== frase.length)
    expect(cambian).toEqual([])
  })
})

describe('indexOfWord', () => {
  it('encuentra una palabra entera', () => {
    expect(indexOfWord('hola che amigo', 'che')).toBe(5)
  })

  it('no la encuentra dentro de otra palabra', () => {
    expect(indexOfWord('esta noche', 'che')).toBe(-1)
    expect(indexOfWord('toca la guitarra', 'guita')).toBe(-1)
  })

  it('encuentra expresiones de varias palabras', () => {
    expect(indexOfWord('hoy me pinta ir', 'me pinta')).toBe(4)
  })

  it('respeta la puntuación alrededor', () => {
    expect(indexOfWord('¿posta?', 'posta')).toBe(1)
  })

  it('sigue buscando si la primera coincidencia está dentro de otra palabra', () => {
    expect(indexOfWord('noche che', 'che')).toBe(6)
  })

  it('ignora formas vacías', () => {
    expect(indexOfWord('hola', '')).toBe(-1)
  })
})

describe('findWords', () => {
  const entries = [
    { id: 'che', forms: ['che'] },
    { id: 'guita', forms: ['guita'] },
    { id: 'tomatelas', forms: ['tomátelas'] },
  ]
  const ids = (found) => found.map((entry) => entry.id)

  it('devuelve las palabras en orden de aparición', () => {
    const text = 'Che, tomátelas rápido con la guita'
    expect(ids(findWords(text, text.length, entries))).toEqual(['che', 'tomatelas', 'guita'])
  })

  it('ignora las palabras que no se llegaron a completar', () => {
    const text = 'Che, tomátelas ya'
    const start = text.indexOf('tomátelas')
    expect(ids(findWords(text, start + 4, entries))).toEqual(['che'])
  })

  it('cuenta una palabra recién terminada, aunque falte el espacio', () => {
    const text = 'Che, tomátelas ya'
    const end = text.indexOf('tomátelas') + 'tomátelas'.length
    expect(ids(findWords(text, end, entries))).toEqual(['che', 'tomatelas'])
  })

  it('no repite una palabra que aparece varias veces', () => {
    expect(ids(findWords('che che che', 11, entries))).toEqual(['che'])
  })

  it('reconoce mayúsculas y tildes', () => {
    expect(ids(findWords('TOMATELAS ya', 12, entries))).toEqual(['tomatelas'])
  })

  it('no confunde palabras parecidas', () => {
    expect(findWords('noche con guitarra', 18, entries)).toEqual([])
  })
})

describe('publishableEntries', () => {
  const sample = [
    { id: 'a', allAges: true, reviewed: true },
    { id: 'b', allAges: true, reviewed: false },
    { id: 'c', allAges: false, reviewed: true },
  ]
  const ids = (list) => list.map((entry) => entry.id)

  it('en producción solo muestra lo apto y revisado', () => {
    expect(ids(publishableEntries(sample, false))).toEqual(['a'])
  })

  it('en desarrollo suma lo que falta revisar, pero nunca lo no apto', () => {
    expect(ids(publishableEntries(sample, true))).toEqual(['a', 'b'])
  })
})

describe('exampleFor', () => {
  it('devuelve la primera frase que usa la palabra', () => {
    const phrases = ['Hola mundo', '¿Posta que sí?']
    expect(exampleFor({ forms: ['posta'] }, phrases)).toBe('¿Posta que sí?')
  })

  it('devuelve null si ninguna frase la usa', () => {
    expect(exampleFor({ forms: ['posta'] }, ['Hola mundo'])).toBeNull()
  })
})

describe('GLOSARIO', () => {
  const problemas = (regla) => GLOSARIO.filter((entry) => !regla(entry)).map((entry) => entry.id)

  it('cada ficha tiene id, término, significado y formas', () => {
    expect(
      problemas(
        (e) =>
          /^[a-z0-9-]+$/.test(e.id) &&
          e.term.trim() &&
          e.meaning.trim() &&
          e.forms.length > 0 &&
          e.forms.every((form) => form.trim()),
      ),
    ).toEqual([])
  })

  it('la categoría de cada ficha existe', () => {
    expect(problemas((e) => e.category in CATEGORIES)).toEqual([])
  })

  it('las fichas no aptas explican el motivo', () => {
    expect(problemas((e) => e.allAges || Boolean(e.note))).toEqual([])
  })

  it('los id no se repiten', () => {
    const ids = GLOSARIO.map((e) => e.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('ninguna forma se repite entre fichas', () => {
    const forms = GLOSARIO.flatMap((e) => e.forms.map(normalizeText))
    expect(new Set(forms).size).toBe(forms.length)
  })

  it('cada ficha apta aparece en al menos una frase del juego', () => {
    const sinFrase = GLOSARIO.filter((e) => e.allAges && exampleFor(e) === null).map((e) => e.id)
    expect(sinFrase).toEqual([])
  })

  it('ninguna frase usa palabras marcadas como no aptas', () => {
    const noAptas = GLOSARIO.filter((e) => !e.allAges)
    const infractoras = FRASES.flatMap((frase) =>
      findWords(frase, frase.length, noAptas).map((e) => `${e.id}: ${frase}`),
    )
    expect(infractoras).toEqual([])
  })
})
