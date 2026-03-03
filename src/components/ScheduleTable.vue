<template>
  <section class="table-wrapper">
    <div class="table-header">
      <h3>Horaires</h3>
      <span class="result-count">{{ schedules.length }} résultat(s)</span>
    </div>

    <table v-if="schedules.length > 0" class="schedule-table">
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
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({ schedules: Array })
const router = useRouter()

// Sorting
const sortKey = ref('facility_name')
const sortOrder = ref('asc')

const sortedSchedules = computed(() => {
  const sorted = [...props.schedules]
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

@media (max-width: 720px) {
  .schedule-table th:nth-child(1), 
  .schedule-table td:nth-child(1) { 
    display: none; 
  }
}
</style>