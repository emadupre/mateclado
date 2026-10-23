import { defineStore } from 'pinia'
import { ref } from 'vue'

const STORAGE_KEY = 'mateclado:nickname'

//localStorage puede estar bloqueado (modo privado, politicas del navegador): no es grave.
function readStored() {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? ''
  } catch {
    return ''
  }
}

function writeStored(value) {
  try {
    localStorage.setItem(STORAGE_KEY, value)
  } catch {
    //sin alm. disponible: el apodo solo dura mientra la pestaña esta abierta.
  }
}

export const useProfileStore = defineStore('profile', () => {
  const nickname = ref(readStored())

  function setNickName(value) {
    nickname.value = value
    writeStored(value)
  }

  return { nickname, setNickName }
})
