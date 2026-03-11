<template>
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
          v-for="facility in store.currentActivityFacilities"
          :key="facility.id"
          class="facility-checkbox"
          :class="{ 
            active: store.filters.facility_ids.includes(facility.id),
            'has-notice': store.facilitiesWithNotices.includes(facility.id)
          }"
          :title="getNoticeTooltip(facility.id)"
        >
          <input
            type="checkbox"
            :value="facility.id"
            :checked="store.filters.facility_ids.includes(facility.id)"
            @change="store.toggleFacility(facility.id)"
          />
          <span class="checkmark">✓</span>
          <span class="label">{{ facility.name }}</span>
          <span v-if="store.facilitiesWithNotices.includes(facility.id)" class="notice-badge">
            {{ getNoticeIcon(facility.id) }}
          </span>
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
          @click="store.toggleDay(day)"
        >
          {{ day.substring(0, 3) }}
        </button>
      </div>
    </div>

    <!-- Activities Multi-Select -->
    <div class="filter-section" v-if="store.currentActivityActivities.length > 0">
      <div class="filter-header">
        <label>Activités</label>
        <span class="filter-count" v-if="store.filters.activities.length > 0">
          {{ store.filters.activities.length }} sélectionnée(s)
        </span>
      </div>
      <div class="activity-list">
        <label
          v-for="activity in store.currentActivityActivities"
          :key="activity"
          class="activity-checkbox"
          :class="{ active: store.filters.activities.includes(activity) }"
        >
          <input
            type="checkbox"
            :value="activity"
            :checked="store.filters.activities.includes(activity)"
            @change="store.toggleActivity(activity)"
          />
          <span class="checkmark">✓</span>
          <span class="label">{{ activity }}</span>
        </label>
      </div>
    </div>

    <!-- Clear Filters -->
    <div class="filter-actions">
      <button class="btn-clear" @click="store.clearFilters" v-if="store.hasActiveFilters">
        <span>✕</span> Effacer les filtres
      </button>
      <span v-else class="no-filters">Tous les horaires affichés</span>
    </div>
  </section>
</template>

<script setup>
import { useScheduleStore } from '../stores/schedules'

const store = useScheduleStore()

const getNoticeIcon = (facilityId) => {
  const noticeTypes = store.getFacilityNoticeTypes(facilityId)
  if (noticeTypes.includes('cancellation')) return '⚠️'
  if (noticeTypes.includes('closure_temporary')) return '🚫'
  if (noticeTypes.includes('closure_holiday')) return '🎉'
  return 'ℹ️'
}

const getNoticeTooltip = (facilityId) => {
  const noticeTypes = store.getFacilityNoticeTypes(facilityId)
  if (noticeTypes.includes('cancellation')) return 'Annulation(s) en cours - cliquez pour voir les détails'
  if (noticeTypes.includes('closure_temporary')) return 'Fermeture temporaire'
  if (noticeTypes.includes('closure_holiday')) return 'Fermetures à venir'
  return ''
}
</script>

<style scoped>
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

.notice-badge {
  font-size: 12px;
  margin-left: 4px;
}

/* Highlight facilities with notices */
.facility-checkbox.has-notice:not(.active) {
  border-color: #f59e0b;
  background: rgba(245, 158, 11, 0.1);
}

.facility-checkbox.has-notice:not(.active):hover {
  border-color: #f59e0b;
  background: rgba(245, 158, 11, 0.2);
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
</style>