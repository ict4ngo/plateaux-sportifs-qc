<template>
  <div id="app">
    <header>
      <nav class="navbar">
        <router-link to="/" class="brand">Plateaux Sportifs QC</router-link>
        <div class="nav-links">
          <router-link to="/">Horaires</router-link>
          <router-link to="/changes">Changements</router-link>
          <router-link to="/report">Signaler</router-link>
        </div>
      </nav>
    </header>
    <main>
      <router-view />
    </main>
  </div>
</template>

<style>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid var(--border);
}

.brand {
  font-weight: 700;
  font-size: 18px;
  color: var(--accent);
  text-decoration: none;
}

.nav-links { display: flex; gap: 16px; }

.nav-links a {
  color: var(--muted);
  text-decoration: none;
  font-size: 14px;
}

.nav-links a.router-link-active { color: var(--accent); }

main {
  max-width: 1100px;
  margin: 24px auto;
  padding: 0 24px;
}
</style>
