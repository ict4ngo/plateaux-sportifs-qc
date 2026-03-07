<template>
  <div class="dashboard">
    <!-- Hero Section -->
    <section class="hero">
      <p class="eyebrow">{{ activityStore.activityLabel }} — Ville de Québec</p>
      <h1>Horaires des {{ activityStore.activityLabel.toLowerCase() }}</h1>
      <p class="lede">Consultez et filtrez les horaires. Sélectionnez plusieurs installations ou jours.</p>
      <p v-if="lastUpdated" class="last-updated">
        <span v-if="store.isOfflineMode" class="offline-badge">Hors ligne</span>
        Dernière mise à jour : {{ lastUpdated }}
      </p>
    </section>

    <!-- Filters -->
    <FilterBar />

    <!-- Loading State -->
    <div v-if="store.loading" class="loading">
      <p>Chargement des horaires...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="store.error" class="error">
      <p>{{ store.error }}</p>
      <button @click="loadData">Réessayer</button>
    </div>

    <!-- Schedule Table -->
    <ScheduleTable v-else :schedules="store.filteredSchedules" />
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useScheduleStore } from '../stores/schedules'
import { useActivityStore } from '../stores/activity'
import FilterBar from '../components/FilterBar.vue'
import ScheduleTable from '../components/ScheduleTable.vue'

const store = useScheduleStore()
const activityStore = useActivityStore()

// Compute last updated from the last scrape time or exported_at
const lastUpdated = computed(() => {
  // If using fallback, show the exported_at date
  if (store.isOfflineMode && store.lastExportedAt) {
    const date = new Date(store.lastExportedAt)
    return date.toLocaleString('fr-CA', {
      timeZone: 'America/New_York',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  // Use last scrape time from health endpoint
  if (store.lastScrapedAt) {
    const date = new Date(store.lastScrapedAt)
    return date.toLocaleString('fr-CA', {
      timeZone: 'America/New_York',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  return null
})

// Load data
const loadData = async () => {
  store.fetchHealthStatus()  // fire-and-forget, non-blocking
  await store.fetchFacilities()
  await store.fetchSchedules()
}

// Watch for filter changes and reload data
watch(() => [
  store.filters.facility_ids.length,
  store.filters.days.length,
  store.filters.activities.length
], async () => {
  await store.fetchSchedules()
}, { deep: true })

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.hero {
  padding: 32px 0;
  border-bottom: 1px solid var(--border);
  margin-bottom: 24px;
}

.eyebrow {
  color: var(--accent);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 8px;
}

h1 {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 8px;
}

.lede {
  color: var(--muted);
  font-size: 16px;
}

.last-updated {
  color: var(--accent);
  font-size: 13px;
  margin-top: 12px;
  font-style: italic;
}

.offline-badge {
  background: #f59e0b;
  color: #fff;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  font-style: normal;
  margin-right: 8px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.loading, .error {
  text-align: center;
  padding: 48px;
  color: var(--muted);
}

.error {
  color: #f87171;
}

.error button {
  margin-top: 16px;
  padding: 8px 16px;
  background: var(--accent);
  border: none;
  border-radius: 6px;
  color: var(--bg);
  cursor: pointer;
}
</style>
