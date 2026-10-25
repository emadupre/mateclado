<script setup>
import { computed } from 'vue'
import { CATEGORIES } from '@/data/glosario'
import { exampleFor } from '@/utils/glosario'

const props = defineProps({
  entry: { type: Object, required: true },
  headingLevel: { type: Number, default: 3 },
})

// la frase del juego donde aparece la palabra sirve de ejemplo
const example = computed(() => exampleFor(props.entry))
const heading = computed(() => `h${props.headingLevel}`)
</script>

<template>
  <article class="word-card">
    <component :is="heading" class="term">{{ entry.term }}</component>
    <p class="tags">{{ CATEGORIES[entry.category] }} · {{ entry.region }}</p>
    <p class="meaning">{{ entry.meaning }}</p>
    <p v-if="example" class="example">{{ example }}</p>
    <p class="origin">
      <strong>Origen:</strong>
      {{ entry.origin ?? 'Todavía no está documentado.' }}
    </p>
    <p v-if="entry.sources.length" class="origin">
      <strong>Fuentes:</strong> {{ entry.sources.join('; ') }}
    </p>
    <p v-if="!entry.reviewed" class="draft">Ficha en revisión</p>
  </article>
</template>

<style scoped>
.word-card {
  padding: var(--space-3) 0;
  border-top: 1px solid var(--surface-2);
}
.term {
  margin: 0 0 var(--space-1);
  font-size: 17px;
  color: var(--accent);
}
.tags {
  margin: 0 0 var(--space-2);
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text-dim);
}
.meaning {
  margin: 0 0 var(--space-2);
  font-size: 15px;
  line-height: 1.5;
}
.example {
  margin: 0 0 var(--space-2);
  font-size: 13px;
  font-style: italic;
  line-height: 1.5;
  color: var(--text-dim);
}
.origin {
  margin: 0 0 var(--space-1);
  font-size: 13px;
  line-height: 1.5;
  color: var(--text-dim);
}
.draft {
  margin: var(--space-2) 0 0;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--accent-dim);
}
</style>
