import { describe, expect, it } from 'vitest'
import { REGION_OPTIONS, REGION_VALUES } from '@/data/regions'
import { validateContribution } from '@/utils/contribution'

const valid = {
  term: 'Pandito',
  region: 'San Luis',
  meaning: 'Lugar poco profundo.',
  example: 'Los chicos jugaban en el pandito del arroyo.',
  origin: '',
  source: '',
  contributor: '',
}
const check = (changes) => validateContribution({ ...valid, ...changes })

describe('validateContribution', () => {
  it('acepta un aporte completo y deja en null lo opcional vacío', () => {
    const { errors, clean } = check({})
    expect(errors).toEqual({})
    expect(clean).toEqual({
      term: 'Pandito',
      region: 'San Luis',
      meaning: 'Lugar poco profundo.',
      example: 'Los chicos jugaban en el pandito del arroyo.',
      origin: null,
      source: null,
      contributor: null,
    })
  })

  it('saca los espacios de más', () => {
    const { clean } = check({ term: '  Pandito ', meaning: 'Lugar   poco\nprofundo.' })
    expect(clean.term).toBe('Pandito')
    expect(clean.meaning).toBe('Lugar poco profundo.')
  })

  it('conserva los campos opcionales cuando vienen completos', () => {
    const { errors, clean } = check({
      origin: 'Del quechua.',
      source: 'Un libro',
      contributor: ' Ema ',
    })
    expect(errors).toEqual({})
    expect(clean.origin).toBe('Del quechua.')
    expect(clean.source).toBe('Un libro')
    expect(clean.contributor).toBe('Ema')
  })

  it('rechaza una palabra muy corta, muy larga o con caracteres raros', () => {
    expect(check({ term: 'a' }).errors.term).toMatch(/mínimo 2/)
    expect(check({ term: 'x'.repeat(41) }).errors.term).toMatch(/máximo 40/)
    expect(check({ term: 'pan<dito' }).errors.term).toMatch(/solo letras/)
  })

  it('exige elegir un lugar de la lista', () => {
    expect(check({ region: '' }).errors.region).toBeTruthy()
    expect(check({ region: 'Marte' }).errors.region).toBeTruthy()
  })

  it('rechaza un significado muy corto', () => {
    expect(check({ meaning: 'Hola' }).errors.meaning).toMatch(/mínimo 5/)
  })

  it('rechaza una frase muy corta o muy larga', () => {
    expect(check({ example: 'Hola pandito' }).errors.example).toMatch(/mínimo 15/)
    expect(check({ example: `El pandito ${'x'.repeat(140)}` }).errors.example).toMatch(/máximo 140/)
  })

  it('rechaza una frase con caracteres que no se pueden tipear', () => {
    expect(check({ example: 'El pandito del arroyo 😀 es lindo.' }).errors.example).toMatch(
      /nada de emojis/,
    )
    expect(check({ example: 'El pandito del arroyo — es lindo.' }).errors.example).toMatch(
      /nada de emojis/,
    )
  })

  it('exige que la frase use la palabra', () => {
    const { errors } = check({ example: 'Los chicos jugaban en el arroyo del barrio.' })
    expect(errors.example).toMatch(/tiene que usar la palabra/)
  })

  it('reconoce la palabra sin importar mayúsculas ni tildes', () => {
    const { errors } = check({ term: 'Tomátelas', example: 'Che, TOMATELAS de acá ya mismo.' })
    expect(errors).toEqual({})
  })

  it('no suma un segundo error en la frase si la palabra ya es inválida', () => {
    const { errors } = check({ term: 'a' })
    expect(errors.term).toBeTruthy()
    expect(errors.example).toBeUndefined()
  })

  it('rechaza origen y fuente demasiado largos', () => {
    expect(check({ origin: 'x'.repeat(301) }).errors.origin).toMatch(/máximo 300/)
    expect(check({ source: 'x'.repeat(201) }).errors.source).toMatch(/máximo 200/)
  })

  it('valida el apodo opcional con las mismas reglas que el ranking', () => {
    expect(check({ contributor: 'a' }).errors.contributor).toBeTruthy()
    expect(check({ contributor: '<b>' }).errors.contributor).toBeTruthy()
  })

  it('devuelve los errores en el orden del formulario', () => {
    const { errors } = validateContribution({
      term: '',
      region: '',
      meaning: '',
      example: '',
      origin: 'x'.repeat(400),
      source: '',
      contributor: 'a',
    })
    expect(Object.keys(errors)).toEqual([
      'term',
      'region',
      'meaning',
      'example',
      'origin',
      'contributor',
    ])
  })
})

describe('REGION_OPTIONS', () => {
  it('no repite valores y entran en el límite de la base (40 caracteres)', () => {
    expect(new Set(REGION_VALUES).size).toBe(REGION_VALUES.length)
    expect(REGION_VALUES.filter((value) => value.length > 40)).toEqual([])
  })

  it('incluye el país entero, las 24 jurisdicciones y la opción "no sé"', () => {
    expect(REGION_OPTIONS).toHaveLength(26)
    expect(REGION_VALUES).toContain('Argentina')
    expect(REGION_VALUES).toContain('San Luis')
    expect(REGION_VALUES).toContain('Región por confirmar')
  })
})
