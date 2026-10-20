import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useTypingTest } from '@/composables/useTypingTest'

//'hola mundo hola mundo ...' (329 carac, sin espacios al final)
const TEXT = 'hola mundo '.repeat(30).trim()

function setup(options = {}) {
  return useTypingTest({ initialDuration: 30, textSource: () => TEXT, ...options })
}

function typeString(test, str) {
  for (const ch of str) test.typeChar(ch)
}

describe('useTypingTest', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('arranca en espera, con el texto cargado y todo en cero', () => {
    const t = setup()
    expect(t.status.value).toBe('waiting')
    expect(t.timeLeft.value).toBe(30)
    expect(t.text.value).toBe(TEXT)
    expect(t.currentIndex.value).toBe(0)
    expect(t.score.value).toBe(0)
    expect(t.wpm.value).toBe(0)
    expect(t.accuracy.value).toBe(0)
  })

  it('usa buildText por defecto y genera texto suficiente', () => {
    const t = useTypingTest({ initialDuration: 60 })
    expect(t.text.value.length).toBeGreaterThanOrEqual(840)
  })

  it('no arranca el timer hasta la primera tecla', () => {
    const t = setup()
    vi.advanceTimersByTime(500)
    expect(t.timeLeft.value).toBe(30)
    expect(t.status.value).toBe('waiting')

    t.typeChar('h')
    expect(t.status.value).toBe('running')
    vi.advanceTimersByTime(3000)
    expect(t.timeLeft.value).toBe(27)
  })

  it('marca cada carácter como correcto o incorrecto', () => {
    const t = setup()
    expect(t.typeChar('h')).toBe('correct')
    expect(t.typeChar('x')).toBe('incorrect') // se esperaba 'o'
    expect(t.chars.value[0]).toBe('correct')
    expect(t.chars.value[1]).toBe('incorrect')
    expect(t.currentIndex.value).toBe(2)
  })

  it('backspace retrocede y deja el carácter como pendiente', () => {
    const t = setup()
    expect(t.backspace()).toBe(false) // al inicio no hay nada que borrar
    typeString(t, 'ho')
    expect(t.backspace()).toBe(true)
    expect(t.currentIndex.value).toBe(1)
    expect(t.chars.value[1]).toBe('pending')
    expect(t.chars.value[0]).toBe('correct')
  })

  it('sella una palabra completada bien y suma puntos', () => {
    const t = setup()
    typeString(t, 'hola ')
    expect(t.wordDone.value.slice(0, 5)).toEqual([true, true, true, true, false])
    expect(t.score.value).toBe(10)
    expect(t.wordsCompleted.value).toBe(1)
  })

  it('los errores restan puntos, sin bajar de cero', () => {
    const t = setup()
    t.typeChar('x')
    expect(t.score.value).toBe(0)

    const u = setup()
    typeString(u, 'hola ')
    u.typeChar('x') // se esperaba 'm'
    expect(u.score.value).toBe(8)
  })

  it('no permite borrar una palabra sellada', () => {
    const t = setup()
    typeString(t, 'hola ')
    expect(t.backspace()).toBe(false)
    expect(t.currentIndex.value).toBe(5)

    t.typeChar('m')
    expect(t.backspace()).toBe(true)
    expect(t.currentIndex.value).toBe(5)
  })

  it('no sella una palabra con errores', () => {
    const t = setup()
    typeString(t, 'hxla ')
    expect(t.wordDone.value.every((d) => d === false)).toBe(true)
    expect(t.wordsCompleted.value).toBe(0)
  })

  it('permite corregir una palabra con error y la sellada al completarla bien', () => {
    const t = setup()
    typeString(t, 'hxla ')
    for (let i = 0; i < 4; i++) t.backspace() // vuelve hasta la 'x'
    expect(t.currentIndex.value).toBe(1)

    typeString(t, 'ola ')
    expect(t.wordDone.value.slice(0, 4)).toEqual([true, true, true, true])
    expect(t.wordsCompleted.value).toBe(1)
    expect(t.score.value).toBe(10)
  })

  it('un espacio equivocado no sella la palabra', () => {
    const t = setup()
    typeString(t, 'hola')
    expect(t.typeChar('x')).toBe('incorrect') //se esperaba ' '
    expect(t.wordDone.value[0]).toBe(false)
    expect(t.wordsCompleted.value).toBe(0)
    expect(t.backspace()).toBe(true) //sigue siendo corregible
  })

  it('termina cuando se acaba el tiempo y deja de aceptar teclas', () => {
    const t = setup()
    typeString(t, 'hola')
    vi.advanceTimersByTime(30000)
    expect(t.status.value).toBe('finished')
    expect(t.timeLeft.value).toBe(0)
    expect(t.typeChar('x')).toBeNull()
    expect(t.backspace()).toBe(false)
  })

  it('calcula las palabras por minuto y la precisión finales', () => {
    const t = setup()
    typeString(t, TEXT.slice(0, 50))
    vi.advanceTimersByTime(30000)
    expect(t.wpm.value).toBe(20) // 50 caract / 5 = 10 palabras en medio min
    expect(t.accuracy.value).toBe(100)
  })

  it('calcula la precisión en vivo', () => {
    const t = setup()
    typeString(t, 'hxla') //3 bien, 1mal
    expect(t.accuracy.value).toBe(75)
  })

  it('reset deja todo limpio y frena el timer', () => {
    const t = setup()
    typeString(t, 'hola ')
    t.reset()

    expect(t.status.value).toBe('waiting')
    expect(t.currentIndex.value).toBe(0)
    expect(t.score.value).toBe(0)
    expect(t.wordsCompleted.value).toBe(0)
    expect(t.chars.value.every((c) => c === 'pending')).toBe(true)
    expect(t.wordDone.value.every((d) => d === false)).toBe(true)

    vi.advanceTimersByTime(5000)
    expect(t.timeLeft.value).toBe(30)

    t.typeChar('h')
    expect(t.backspace()).toBe(true) // el bloqueo tambien se reinicio.
  })

  it('setDuration cambia el tiempo, salvo mientras el test corre', () => {
    const t = setup()
    t.setDuration(60)
    expect(t.duration.value).toBe(60)
    expect(t.timeLeft.value).toBe(60)

    t.typeChar('h')
    t.setDuration(15)
    expect(t.duration.value).toBe(60)
  })

  it('agrega más text cuando el usuario se acerca al final', () => {
    const t = setup()
    typeString(t, TEXT.slice(0, 280))
    expect(t.text.value.length).toBeGreaterThan(TEXT.length)
    expect(t.chars.value).toHaveLength(t.text.value.length)
    expect(t.wordDone.value).toHaveLength(t.text.value.length)
  })
})
