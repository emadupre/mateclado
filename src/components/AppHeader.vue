<template>
  <header class="app-header">
    <RouterLink to="/" class="logo" aria-label="mateclado, ir al inicio"
      >mate<span>clado</span></RouterLink
    >
    <div class="actions">
      <nav class="nav" aria-label="Secciones">
        <RouterLink to="/ranking" class="text-link">ranking</RouterLink>
        <RouterLink to="/diccionario" class="text-link">diccionario</RouterLink>
      </nav>
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
.nav {
  display: flex;
  gap: var(--space-3);
}
.nav a.router-link-active {
  color: var(--accent);
}
</style>
