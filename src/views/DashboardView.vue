<template>
  <div class="dashboard">
    <!-- Hero Section -->
    <section class="hero">
      <p class="eyebrow">Ville de Québec</p>
      <h1>Horaires des installations sportives</h1>
      <p class="lede">Consultez et filtrez les horaires. Sélectionnez plusieurs installations ou jours.</p>
      <p v-if="lastUpdated" class="last-updated">
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
import FilterBar from '../components/FilterBar.vue'
import ScheduleTable from '../components/ScheduleTable.vue'

const store = useScheduleStore()

// Compute last updated from the most recent schedule
const lastUpdated = computed(() => {
  if (!store.schedules || store.schedules.length === 0) return null
  
  // Find the most recent created_at date
  const dates = store.schedules
    .map(s => s.created_at)
    .filter(Boolean)
    .map(d => new Date(d))
  
  if (dates.length === 0) return null
  
  const mostRecent = new Date(Math.max(...dates))
  return mostRecent.toLocaleString('fr-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
})

// Load data
const loadData = async () => {
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
