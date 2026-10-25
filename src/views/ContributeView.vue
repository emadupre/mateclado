<script setup>
import { reactive, ref, watch } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import FormField from '@/components/FormField.vue'
import { useScoreSubmission } from '@/composables/useScoreSubmission'
import { REGION_OPTIONS } from '@/data/regions'
import { saveContribution } from '@/services/contributions'
import { LIMITS, validateContribution } from '@/utils/contribution'
import { NICKNAME_MAX } from '@/utils/nickname'

const blank = () => ({
  term: '',
  region: '',
  meaning: '',
  example: '',
  origin: '',
  source: '',
  contributor: '',
  trampa: '', //campo trampa para bots: una persona nunca lo ve ni lo completa.
})

const form = reactive(blank())
const errors = ref({})
const formEl = ref(null)

// si el campo trampa vino completo, hace como que se envió pero no mandamos nada.
const submission = useScoreSubmission((draft) =>
  draft.trampa ? Promise.resolve() : saveContribution(draft),
)
const { status, error: sendError } = submission

//una vez que hubo errores, se actualizan mientras la persona corrige
watch(form, () => {
  submission.clearError()
  if (Object.keys(errors.value).length) errors.value = validateContribution(form).errors
})

async function onSubmit() {
  errors.value = validateContribution(form).errors
  const [first] = Object.keys(errors.value)
  if (first) {
    formEl.value?.querySelector(`#${first}`)?.focus()
    return
  }
  await submission.submit({ ...form })
}

function another() {
  submission.reset()
  Object.assign(form, blank())
  errors.value = {}
}

if (import.meta.env.DEV) {
  import('../services/supabase').then((c) => {
    window.sb = c.getSupabase()
  })
}
</script>

<template>
  <main class="contribute">
    <AppHeader />

    <h1 class="title">Aportá una palabra</h1>
    <p class="intro">
      ¿Conocés una palabra o una expresión de tu zona que no está en el diccionario? Contame qué
      significa. Voy a revisar cada aporte antes de publicarlo.
    </p>
    <p class="privacy">
      Por seguridad, no escribas datos personales: ni tu nombre completo, ni tu dirección, ni tu
      telefono.
    </p>

    <div v-if="status === 'saved'" class="thanks" role="status">
      <p class="thanks-title">Gracias por tu aporte!</p>
      <p>Quedó pendiente de revisión. Si se aprueba, va a parecer en el diccionario.</p>
      <button type="button" class="secondary" @click="another">aportar otra palabra</button>
    </div>

    <form v-else ref="formEl" class="form" novalidate @submit.prevent="onSubmit">
      <FormField
        id="term"
        label="Palabra o expresión"
        hint="Escribila como la usás. Si es una expresión que cambia al conjugarse, escribí solo la parte fija, por ejemplo <<de fierro>>."
        :error="errors.term"
        v-slot="{ control }"
      >
        <input
          type="text"
          v-bind="control"
          v-model="form.term"
          autocomplete="off"
          :maxlength="LIMITS.term.max"
        />
      </FormField>

      <FormField id="region" label="¿De dónde es?" :error="errors.region" v-slot="{ control }">
        <select v-bind="control" v-model="form.region">
          <option value="" disabled>Elegí una opción</option>
          <option v-for="option in REGION_OPTIONS" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </FormField>

      <FormField
        id="meaning"
        label="¿Qué significa?"
        hint="Explicalo con tus palabras, como se lo explicarías a un chico."
        :error="errors.meaning"
        v-slot="{ control }"
      >
        <textarea
          v-bind="control"
          v-model="form.meaning"
          rows="3"
          :maxlength="LIMITS.meaning.max"
        ></textarea>
      </FormField>

      <FormField
        id="example"
        label="Una frase de ejemplo"
        hint="Una frase corta donde se usa la palabra tal como la escribiste arriba. Usá solo las letras y signos comunes: más adelante puede usarse en el juego, y hay que poder tipearla."
        :error="errors.example"
        v-slot="{ control }"
      >
        <input
          v-bind="control"
          type="text"
          v-model="form.example"
          autocomplete="off"
          :maxlength="LIMITS.example.max"
        />
      </FormField>

      <FormField
        id="origin"
        label="¿De dónde viene?"
        optional
        hint="Si no lo sabés, dejalo vacío: preferimos que quede sin origen antes que inventado."
        :error="errors.origin"
        v-slot="{ control }"
      >
        <textarea
          v-bind="control"
          v-model="form.origin"
          rows="2"
          :maxlength="LIMITS.origin.max"
        ></textarea>
      </FormField>

      <FormField
        id="source"
        label="fuente"
        optional
        hint="Por ejemplo: un libro, un diccionario o <lo dice mi familia>."
        :error="errors.source"
        v-slot="{ control }"
      >
        <input
          type="text"
          v-bind="control"
          v-model="form.source"
          autocomplete="off"
          :maxlength="LIMITS.source.max"
        />
      </FormField>

      <FormField
        id="contributor"
        label="Tu apodo"
        optional
        hint="Si querés que figure quién aportó la palabra. No uses tu nombre completo."
        :error="errors.contributor"
        v-slot="{ control }"
      >
        <input
          v-bind="control"
          v-model="form.contributor"
          type="text"
          autocomplete="off"
          :maxlength="NICKNAME_MAX"
        />
      </FormField>

      <div class="trap" aria-hidden="true">
        <label for="trampa">No completes este campo</label>
        <input
          type="text"
          id="trampa"
          v-model="form.trampa"
          name="trampa"
          tabindex="-1"
          autocomplete="off"
        />
      </div>

      <p v-if="status === 'error'" class="send-error" role="alert">{{ sendError }}</p>
      <button type="submit" class="submit" :disabled="status === 'saving'">
        {{ status === 'saving' ? 'enviado...' : 'enviar aporte' }}
      </button>
    </form>
  </main>
</template>

<style scoped>
.title {
  margin: 0 0 var(--space-2);
  font-family: var(--font-mono);
  font-size: 18px;
  font-weight: 600;
  color: var(--text);
}
.intro {
  margin: 0 0 var(--space-2);
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-dim);
}
.privacy {
  margin: 0 0 var(--space-4);
  font-size: 13px;
  line-height: 1.5;
  color: var(--accent);
}
.form {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  max-width: 520px;
}

input,
select,
textarea {
  width: 100%;
  min-height: 44px;
  padding: 10px 12px;
  font: inherit;
  font-size: 16px;
  color: var(--text);
  background: var(--surface);
  border: 1px solid var(--surface-2);
  border-radius: var(--radius-md);
}
textarea {
  line-height: 1.4;
  resize: vertical;
}
[aria-invalid='true'] {
  border-color: var(--error);
}

.trap {
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  overflow: hidden;
}

.send-error {
  margin: 0;
  font-size: 13px;
  color: var(--error);
}

.submit {
  align-self: flex-start;
  min-height: 44px;
  padding: 0 var(--space-4);
  font-weight: 700;
  color: var(--bg);
  background: var(--accent);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
}
.submit:disabled {
  opacity: 0.6;
  cursor: default;
}

.thanks {
  max-width: 520px;
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-dim);
}
.thanks-title {
  margin: 0 0 var(--space-2);
  font-family: var(--font-mono);
  font-size: 16px;
  color: var(--success);
}
.secondary {
  min-height: 44px;
  padding: 0 var(--space-3);
  font-family: var(--font-mono);
  color: var(--accent);
  background: var(--surface);
  border: 1px solid var(--surface-2);
  border-radius: var(--radius-md);
  cursor: pointer;
}
</style>
