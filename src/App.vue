<script setup>
import { computed } from 'vue'
import { useScheduleStore } from './stores/schedules'

const store = useScheduleStore()

const isOffline = computed(() => store.isOfflineMode)

const lastExportedAt = computed(() => {
  if (!store.lastExportedAt) return null
  const date = new Date(store.lastExportedAt)
  return date.toLocaleString('fr-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
})
</script>

<template>
  <div id="app">
    <!-- Offline Warning Banner -->
    <div v-if="isOffline" class="offline-banner">
      <span class="offline-icon">⚠️</span>
      <span>
        Mode hors ligne — API indisponible. 
        <span v-if="lastExportedAt">Dernière mise à jour : {{ lastExportedAt }}</span>
      </span>
    </div>

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
.offline-banner {
  background: linear-gradient(90deg, #f59e0b 0%, #d97706 100%);
  color: #fff;
  padding: 10px 24px;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.offline-icon {
  font-size: 16px;
}

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
