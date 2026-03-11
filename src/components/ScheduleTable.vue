<template>
  <section class="table-wrapper">
    <div class="table-header">
      <h3>Horaires</h3>
      <span class="result-count">{{ schedules.length }} résultat(s)</span>
    </div>

    <table v-if="schedules.length > 0" class="schedule-table">
      <thead>
        <tr>
          <th @click="sortBy('facility_name')" class="sortable installation-col" v-if="!isSingleFacility">
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
          :class="{ cancelled: store.isScheduleCancelled(slot) }"
        >
          <td class="facility installation-col" v-if="!isSingleFacility">
            <span class="full-name">{{ slot.facility_name }}</span>
            <span class="short-name">{{ getShortName(slot.facility_name) }}</span>
          </td>
          <td class="day">{{ slot.day_of_week }}</td>
          <td class="activity">
            {{ slot.activity }}
            <span v-if="store.isScheduleCancelled(slot)" class="cancelled-badge">ANNULÉ</span>
          </td>
          <td class="time">
            <span v-if="slot.start_time" :class="{ 'cancelled-time': store.isScheduleCancelled(slot) }">
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
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useScheduleStore } from '../stores/schedules'

const props = defineProps({ 
  schedules: Array,
  isSingleFacility: { type: Boolean, default: false }
})
const router = useRouter()
const store = useScheduleStore()

// Short name mapping based on location/neighborhood
const shortNames = {
  "Centre communautaire Ferland": "Ferland",
  "Centre communautaire Lucien-Borne": "Maizerets",
  "Centre communautaire Michel-Labadie": "Duberger",
  "Centre municipal Monseigneur-De Laval": "St-Sauveur",
  "Complexe Jean-Paul-Nolin": "Beauport",
  "Pavillon de l'éducation physique et des sports de l'Université Laval (PEPS)": "PEPS",
  "Piscine A. Couture (Collège François-de-Laval)": "St-Jean-Baptiste",
  "Piscine Jacques-Amyot": "Montcalm",
  "Piscine Jos.-A.-Lachance": "Vanier",
  "Piscine Jules-Dallaire - Patro Roc-Amadour": "Patro-Rocamadour",
  "Piscine Lucien-Flamand (centre Wilbrod-Bhérer)": "Belvédère",
  "Piscine Sylvie-Bernier": "St-Louis",
  "Piscine Wilfrid-Hamel": "Les Saules",
  "Piscine de l'école L'Odyssée": "St-Émile",
  "Piscine de l'édifice Denis-Giguère": "Lauzon",
  "Piscine du Campus Notre-Dame-de-Foy": "ND-Foy",
  "Piscine municipale du Bourg-Royal": "Bourg-Royal",
  "YMCA St-Roch": "St-Roch",
  "YWCA Québec": "St-Roch",
  "École secondaire de La Seigneurie": "Neufchâtel",
  "Arpidrome": "Arpidrome"
}

const getShortName = (fullName) => {
  return shortNames[fullName] || fullName.substring(0, 20)
}

// Sorting - default to 'start_time' when viewing single facility
const sortKey = ref(props.isSingleFacility ? 'start_time' : 'facility_name')
const sortOrder = ref('asc')

const sortedSchedules = computed(() => {
  const sorted = [...props.schedules]
  sorted.sort((a, b) => {
    let aVal = a[sortKey.value]
    let bVal = b[sortKey.value]
    
    if (aVal === null) aVal = ''
    if (bVal === null) bVal = ''
    
    // For start_time sorting, ensure proper time comparison
    if (sortKey.value === 'start_time' && aVal && bVal) {
      return sortOrder.value === 'asc' 
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal)
    }
    
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

const goToFacility = (id) => {
  router.push(`/facility/${id}`)
}
</script>

<style scoped>
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

.facility .short-name {
  display: none;
}

.facility .full-name {
  display: inline;
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

/* Cancelled schedule styling */
.schedule-table tr.cancelled {
  background: rgba(239, 68, 68, 0.05);
}

.schedule-table tr.cancelled:hover {
  background: rgba(239, 68, 68, 0.1);
}

.cancelled-badge {
  display: inline-block;
  margin-left: 8px;
  padding: 2px 6px;
  background: #ef4444;
  color: white;
  font-size: 10px;
  font-weight: 700;
  border-radius: 3px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.cancelled-time {
  text-decoration: line-through;
  opacity: 0.6;
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

/* Mobile: show short names */
@media (max-width: 720px) {
  .installation-col {
    max-width: 100px;
  }
  
  .facility .short-name {
    display: inline;
  }
  
  .facility .full-name {
    display: none;
  }
  
  .schedule-table th {
    font-size: 11px;
    padding: 10px 8px;
  }
  
  .schedule-table td {
    font-size: 13px;
    padding: 10px 8px;
  }
}
</style>
