<script setup>
import { computed } from 'vue'

const props = defineProps({
  id: { type: String, required: true },
  label: { type: String, required: true },
  hint: { type: String, default: '' },
  error: { type: String, default: '' },
  optional: { type: Boolean, default: false },
})

const hintId = computed(() => `${props.id}-hint`)
const errorId = computed(() => `${props.id}-error`)
const describedBy = computed(
  () =>
    [props.hint && hintId.value, props.error && errorId.value].filter(Boolean).join(' ') ||
    undefined,
)
</script>

<template>
  <div class="field">
    <label :for="id"
      >{{ label }}
      <span v-if="optional" class="optional">(opcional)</span>
    </label>
    <p v-if="hint" :id="hintId" class="hint">{{ hint }}</p>
    <slot
      :control="{
        id,
        'aria-describedby': describedBy,
        'aria-invalid': error ? 'true' : undefined,
      }"
    />
    <p v-if="error" :id="errorId" class="error" role="alert">{{ error }}</p>
  </div>
</template>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}
label {
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--text);
}
.optional {
  color: var(--text-dim);
}
.hint {
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  color: var(--text-dim);
}
.error {
  margin: 0;
  font-size: 13px;
  color: var(--error);
}
</style>
