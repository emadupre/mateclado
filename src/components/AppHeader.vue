<template>
  <header class="app-header">
    <RouterLink to="/" class="logo" aria-label="mateclado, ir al inicio"
      >mate<span>clado</span></RouterLink
    >
    <div class="actions">
      <slot />
    </div>
  </header>
</template>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-3);
  margin-bottom: var(--space-5);
}
.logo {
  font-family: var(--font-mono);
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--accent);
  text-decoration: none;
}
.logo span {
  color: var(--text-dim);
  font-weight: 400;
}
.actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-3);
}
</style>
