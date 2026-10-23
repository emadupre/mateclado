<script setup>
import { NICKNAME_MAX } from '@/utils/nickname'
defineProps({
  modelValue: { type: String, default: '' },
  status: { type: String, default: 'idle' }, //'idle' | 'saving' | 'saved' | 'error'
  error: { type: String, default: '' },
  duration: { type: Number, required: true },
})
defineEmits(['update:modelValue', 'submit'])
</script>

<template>
  <section class="score-submit">
    <p v-if="status === 'saved'" class="saved" role="status">
      ¡Puntaje guardado!
      <RouterLink :to="{ name: 'ranking', query: { d: duration } }">ver el ranking</RouterLink>
    </p>

    <form v-else @submit.prevent="$emit('submit')">
      <label for="nickname" class="label">guardá tu puntaje en el ranking de {{ duration }}s</label>
      <div class="row">
        <input
          type="text"
          name="nickname"
          id="nickname"
          :value="modelValue"
          :maxlength="NICKNAME_MAX"
          :disabled="status === 'saving'"
          placeholder="tu apodo"
          autocomplete="nickname"
          enterkeyhint="send"
          @input="$emit('update:modelValue', $event.target.value)"
        />
        <button type="submit" :disabled="status === 'saving'">
          {{ status === 'saving' ? 'guardando...' : 'guardar' }}
        </button>
      </div>
      <p v-if="status === 'error'" class="error" role="alert">{{ error }}</p>
    </form>
  </section>
</template>

<style scoped>
.score-submit {
  margin-top: var(--space-5);
  font-family: var(--font-mono);
}
.label {
  display: block;
  margin-bottom: var(--space-2);
  font-size: 13px;
  color: var(--text-dim);
}
.row {
  display: flex;
  gap: var(--space-2);
  max-width: 420px;
}
input {
  flex: 1;
  min-width: 0;
  min-height: 44px;
  padding: 10px 12px;
  font: inherit;
  font-size: 16px; /* 16px evita el zoom automatico de iOS al enfocar*/
  color: var(--text);
  background: var(--surface);
  border: 1px solid var(--surface-2);
  border-radius: var(--radius-md);
}
input::placeholder {
  color: var(--text-faint);
}
button {
  min-height: 44px;
  padding: 0 var(--space-3);
  font-weight: 700;
  color: var(--bg);
  background: var(--accent);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
}
input:disabled,
button:disabled {
  opacity: 0.6;
  cursor: default;
}
.error {
  margin: var(--space-2) 0 0;
  font-size: 13px;
  color: var(--error);
}
.saved {
  margin: 0;
  font-size: 14px;
  color: var(--success);
}
.saved a {
  margin-left: var(--space-2);
  color: var(--accent);
}
</style>
