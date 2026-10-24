import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useProfileStore } from '@/stores/profile'

describe('profile store', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('arranca vacío si no hay apodo guardado', () => {
    expect(useProfileStore().nickname).toBe('')
  })

  it('recuerda el apodo en una sesión nueva', () => {
    useProfileStore().setNickName('Ema')

    setActivePinia(createPinia()) // siempre al recargar la pagina
    expect(useProfileStore().nickname).toBe('Ema')
  })

  it('tolera un almacenamiento que falla', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('bloqueado')
    })
    const profile = useProfileStore()

    expect(() => profile.setNickName('Ema')).not.toThrow()
    expect(profile.nickname).toBe('Ema')
  })
})
