<script setup>
import { computed, ref } from 'vue'
import WordCard from './WordCard.vue'

const props = defineProps({
  entries: { type: Array, required: true },
})

const dialog = ref(null)

const lead = computed(() =>
  props.entries.length === 1
    ? 'En esta partida apareció 1 palabra del habla argentina.'
    : `En esta partida aparecieron ${props.entries.length} palabras del habla argentina`,
)

function open() {
  dialog.value?.showModal()
}

function close() {
  dialog.value?.close()
}

// al tocar el fondo oscuro, fuera de la tarjeta, tambien se cierra.
function onDialogClick(event) {
  if (event.target === dialog.value) close()
}
</script>

<template>
  <section class="learned" aria-labelledby="learned-title">
    <h2 id="learned-title" class="learned-title">Palabras de nuestra cultura</h2>
    <p class="lead">{{ lead }}</p>
    <button type="button" class="open" @click="open">ver qué significan</button>

    <dialog ref="dialog" class="dialog" aria-labelledby="dialog-title" @click="onDialogClick">
      <div class="inner">
        <header class="dialog-head">
          <h2 id="dialog-title">Palabras de esta partida</h2>
          <button type="button" class="close" aria-label="Cerrar" @click="close">✕</button>
        </header>

        <ul class="list">
          <li v-for="entry in entries" :key="entry.id">
            <WordCard :entry="entry" />
          </li>
        </ul>
      </div>
    </dialog>
  </section>
</template>

<style scoped>
.learned {
  margin-top: var(--space-5);
  font-family: var(--font-mono);
}
.learned-title {
  margin: 0 0 var(--space-2);
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
}
.lead {
  margin: 0 0 var(--space-3);
  font-size: 13px;
  color: var(--text-dim);
}
.open {
  min-height: 44px;
  padding: 0 var(--space-3);
  font-family: var(--font-mono);
  color: var(--accent);
  background: transparent;
  border: 1px solid var(--accent-dim);
  border-radius: var(--radius-md);
  cursor: pointer;
}
.open:hover {
  background: var(--surface);
}

/* padding en 0 en el dialog: así un click sobre el dialog mismo es siempre un clic en el fondo */
.dialog {
  width: min(560px, calc(100% - 32px));
  max-height: min(85dvh, 640px);
  padding: 0;
  overflow-y: auto;
  font-family: var(--font-sans);
  color: var(--text);
  background: var(--bg);
  border: 1px solid var(--surface-2);
  border-radius: var(--radius-md);
}
.dialog::backdrop {
  background: rgba(0, 0, 0, 0.65);
}
.inner {
  padding: var(--space-4);
}
.dialog-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  margin-bottom: var(--space-3);
}
.dialog-head h2 {
  margin: 0;
  font-size: 16px;
  color: var(--accent);
}
.close {
  width: 44px;
  height: 44px;
  font-size: 16px;
  color: var(--text-dim);
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
}
.close:hover {
  color: var(--accent);
  background: var(--surface);
}
.list {
  margin: 0;
  padding: 0;
  list-style: none;
}
</style>
