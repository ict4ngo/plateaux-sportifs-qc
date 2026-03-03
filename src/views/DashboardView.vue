<template>
  <div class="dashboard">
    <!-- Hero Section -->
    <section class="hero">
      <p class="eyebrow">Ville de Québec</p>
      <h1>Horaires des installations sportives</h1>
      <p class="lede">Consultez et filtrez les horaires. Sélectionnez plusieurs installations ou jours.</p>
    </section>

    <!-- Filters -->
    <section class="controls">
      <!-- Facilities Multi-Select -->
      <div class="filter-section">
        <div class="filter-header">
          <label>Installations</label>
          <span class="filter-count" v-if="store.filters.facility_ids.length > 0">
            {{ store.filters.facility_ids.length }} sélectionnée(s)
          </span>
        </div>
        <div class="facility-list">
          <label 
            v-for="facility in store.facilities" 
            :key="facility.id"
            class="facility-checkbox"
            :class="{ active: store.filters.facility_ids.includes(facility.id) }"
          >
            <input 
              type="checkbox" 
              :value="facility.id"
              :checked="store.filters.facility_ids.includes(facility.id)"
              @change="toggleFacility(facility.id)"
            />
            <span class="checkmark">✓</span>
            <span class="label">{{ facility.name }}</span>
          </label>
        </div>
      </div>

      <!-- Days Multi-Select (Toggle Buttons) -->
      <div class="filter-section">
        <div class="filter-header">
          <label>Jours</label>
          <span class="filter-count" v-if="store.filters.days.length > 0">
            {{ store.filters.days.length }} sélectionné(s)
          </span>
        </div>
        <div class="day-toggles">
          <button
            v-for="day in store.days"
            :key="day"
            class="day-btn"
            :class="{ active: store.filters.days.includes(day) }"
            @click="toggleDay(day)"
          >
            {{ day.substring(0, 3) }}
          </button>
        </div>
      </div>

      <!-- Activities Multi-Select -->
      <div class="filter-section" v-if="store.activities.length > 0">
        <div class="filter-header">
          <label>Activités</label>
          <span class="filter-count" v-if="store.filters.activities.length > 0">
            {{ store.filters.activities.length }} sélectionnée(s)
          </span>
        </div>
        <div class="activity-list">
          <label 
            v-for="activity in store.activities" 
            :key="activity"
            class="activity-checkbox"
            :class="{ active: store.filters.activities.includes(activity) }"
          >
            <input 
              type="checkbox" 
              :value="activity"
              :checked="store.filters.activities.includes(activity)"
              @change="toggleActivity(activity)"
            />
            <span class="checkmark">✓</span>
            <span class="label">{{ activity }}</span>
          </label>
        </div>
      </div>

      <!-- Clear Filters -->
      <div class="filter-actions">
        <button class="btn-clear" @click="clearFilters" v-if="store.hasActiveFilters">
          <span>✕</span> Effacer les filtres
        </button>
        <span v-else class="no-filters">Tous les horaires affichés</span>
      </div>
    </section>

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
    <section v-else class="table-wrapper">
      <div class="table-header">
        <h3>Horaires</h3>
        <span class="result-count">{{ store.filteredSchedules.length }} résultat(s)</span>
      </div>

      <table v-if="store.filteredSchedules.length > 0" class="schedule-table">
        <thead>
          <tr>
            <th @click="sortBy('facility_name')" class="sortable">
              Installation {{ sortIcon('facility_name') }}
            </th>
            <th @click="sortBy('day_of_week')" class="sortable">
              Jour {{ sortIcon('day_of_week') }}
            </th>
            <th @click="sortBy('activity')" class="sortable">
              Activité {{ sortIcon('activity') }}
            </th>
            <th @click="sortBy('start_time')" class="sortable">
              Horaire {{ sortIcon('start_time') }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="slot in sortedSchedules" 
            :key="slot.id"
            @click="goToFacility(slot.facility_id)"
            class="clickable"
          >
            <td class="facility">{{ slot.facility_name }}</td>
            <td class="day">{{ slot.day_of_week }}</td>
            <td class="activity">{{ slot.activity }}</td>
            <td class="time">
              <span v-if="slot.start_time">
                {{ slot.start_time }} - {{ slot.end_time }}
              </span>
              <span v-else class="raw">{{ slot.raw_text }}</span>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-else class="empty">
        <p>Aucune plage horaire trouvée pour ces filtres.</p>
        <p class="hint">Essayez de sélectionner d'autres installations ou jours.</p>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useScheduleStore } from '../stores/schedules'

const store = useScheduleStore()
const router = useRouter()

// Sorting
const sortKey = ref('facility_name')
const sortOrder = ref('asc')

const sortedSchedules = computed(() => {
  const sorted = [...store.filteredSchedules]
  sorted.sort((a, b) => {
    let aVal = a[sortKey.value]
    let bVal = b[sortKey.value]
    
    if (aVal === null) aVal = ''
    if (bVal === null) bVal = ''
    
    if (sortOrder.value === 'asc') {
      return aVal > bVal ? 1 : -1
    } else {
      return aVal < bVal ? 1 : -1
    }
  })
  return sorted
})

const sortBy = (key) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'asc'
  }
}

const sortIcon = (key) => {
  if (sortKey.value !== key) return '⇅'
  return sortOrder.value === 'asc' ? '↑' : '↓'
}

// Multi-select toggle functions
const toggleFacility = (facilityId) => {
  store.toggleFacility(facilityId)
}

const toggleDay = (day) => {
  store.toggleDay(day)
}

const toggleActivity = (activity) => {
  store.toggleActivity(activity)
}

const clearFilters = () => {
  store.clearFilters()
}

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

// Navigate to facility detail
const goToFacility = (id) => {
  router.push(`/facility/${id}`)
}

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

.controls {
  background: var(--card);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.filter-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-header label {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--accent);
}

.filter-count {
  font-size: 11px;
  color: var(--muted);
  background: var(--bg);
  padding: 2px 8px;
  border-radius: 12px;
}

/* Facility Checkboxes */
.facility-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  max-height: 120px;
  overflow-y: auto;
  padding: 4px;
}

.facility-checkbox {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 20px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
  user-select: none;
}

.facility-checkbox:hover {
  border-color: var(--accent);
}

.facility-checkbox.active {
  background: rgba(56, 189, 248, 0.15);
  border-color: var(--accent);
}

.facility-checkbox input {
  display: none;
}

.facility-checkbox .checkmark {
  display: none;
  color: var(--accent);
  font-size: 12px;
}

.facility-checkbox.active .checkmark {
  display: inline;
}

/* Day Toggle Buttons */
.day-toggles {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.day-btn {
  padding: 8px 14px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--muted);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 60px;
}

.day-btn:hover {
  border-color: var(--accent);
  color: var(--text);
}

.day-btn.active {
  background: rgba(56, 189, 248, 0.2);
  border-color: var(--accent);
  color: var(--accent);
  font-weight: 600;
}

/* Activity Checkboxes */
.activity-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.activity-checkbox {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
  user-select: none;
}

.activity-checkbox:hover {
  border-color: var(--accent);
}

.activity-checkbox.active {
  background: rgba(56, 189, 248, 0.15);
  border-color: var(--accent);
}

.activity-checkbox input {
  display: none;
}

.activity-checkbox .checkmark {
  display: none;
  color: var(--accent);
  font-size: 11px;
}

.activity-checkbox.active .checkmark {
  display: inline;
}

/* Filter Actions */
.filter-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 10px;
  border-top: 1px solid var(--border);
}

.btn-clear {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--muted);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-clear:hover {
  border-color: #ef4444;
  color: #ef4444;
}

.no-filters {
  font-size: 13px;
  color: var(--muted);
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

.table-wrapper {
  background: var(--card);
  border-radius: 8px;
  overflow: hidden;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
}

.table-header h3 {
  font-size: 16px;
  font-weight: 600;
}

.result-count {
  font-size: 13px;
  color: var(--muted);
}

.schedule-table {
  width: 100%;
  border-collapse: collapse;
}

.schedule-table th {
  text-align: left;
  padding: 12px 16px;
  background: rgba(56, 189, 248, 0.1);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--accent);
  font-weight: 600;
  border-bottom: 1px solid var(--border);
}

.schedule-table th.sortable {
  cursor: pointer;
  user-select: none;
}

.schedule-table th.sortable:hover {
  background: rgba(56, 189, 248, 0.2);
}

.schedule-table td {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
  font-size: 14px;
}

.schedule-table tr.clickable {
  cursor: pointer;
}

.schedule-table tr.clickable:hover {
  background: rgba(56, 189, 248, 0.05);
}

.schedule-table tr:last-child td {
  border-bottom: none;
}

.facility {
  font-weight: 500;
}

.day {
  color: var(--muted);
}

.activity {
  color: var(--text);
}

.time {
  font-family: monospace;
  font-size: 13px;
}

.time .raw {
  color: var(--muted);
  font-style: italic;
}

.empty {
  text-align: center;
  padding: 48px;
  color: var(--muted);
}

.empty .hint {
  margin-top: 8px;
  font-size: 13px;
  opacity: 0.7;
}
</style>
