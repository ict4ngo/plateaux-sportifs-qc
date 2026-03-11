<template>
  <div class="changes">
    <section class="hero">
      <p class="eyebrow">{{ activityStore.activityLabel }} — Mises à jour</p>
      <h1>Changements récents</h1>
      <p class="lede">Historique des modifications détectées dans les horaires des {{ activityStore.activityLabel.toLowerCase() }}.</p>
    </section>

    <!-- Loading State -->
    <div v-if="store.loading" class="loading">
      <p>Chargement...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="store.error" class="error">
      <p>{{ store.error }}</p>
      <button @click="loadChanges">Réessayer</button>
    </div>

    <!-- Changes Feed -->
    <section v-else class="changes-list">
      <div v-if="allChanges.length === 0" class="empty">
        <p>Aucun changement récent pour les {{ activityStore.activityLabel.toLowerCase() }}.</p>
      </div>

      <div
        v-for="change in allChanges"
        :key="change.id"
        class="change-card"
        :class="[change.change_type, { 'special-schedule': isSpecialSchedule(change), 'notice': change.is_notice }]"
      >
        <div class="change-header">
          <span class="badge" :class="change.change_type">
            {{ badgeText(change.change_type, change.is_notice) }}
          </span>
          <span v-if="isSpecialSchedule(change)" class="special-badge">
            ⚠️ Special
          </span>
          <span v-if="change.is_notice" class="notice-badge">
            📢 Avis
          </span>
          <span class="facility">{{ change.facility_name }}</span>
          <span class="date">{{ formatDate(change.created_at) }}</span>
        </div>
        
        <p class="description">{{ change.description }}</p>
        
        <div v-if="change.old_value || change.new_value" class="diff">
          <div v-if="change.old_value" class="old">
            <span class="label">Avant:</span> {{ change.old_value }}
          </div>
          <div v-if="change.new_value" class="new">
            <span class="label">Après:</span> {{ change.new_value }}
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { useScheduleStore } from '../stores/schedules'
import { useActivityStore } from '../stores/activity'

const store = useScheduleStore()
const activityStore = useActivityStore()

const loadChanges = async () => {
  await store.fetchChanges()
  await store.fetchNotices() // Also load notices for the changes feed
}

// Combine regular changes with notice changes
const allChanges = computed(() => {
  const changes = [...store.currentActivityChanges]
  
  // Convert notices to change format
  const noticeChanges = store.notices
    .filter(n => n.notice_type === 'cancellation' || n.notice_type === 'closure_temporary')
    .map(n => ({
      id: `notice-${n.id}`,
      facility_name: n.facility_name,
      change_type: n.notice_type === 'cancellation' ? 'removed' : 'modified',
      description: n.title ? `${n.title}: ${n.body}` : n.body,
      created_at: n.first_seen_at,
      is_notice: true,
      old_value: null,
      new_value: null
    }))
  
  // Combine and sort by date (newest first)
  const combined = [...changes, ...noticeChanges]
  combined.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  
  return combined.slice(0, 50) // Limit to 50 most recent
})

const badgeText = (type, isNotice = false) => {
  if (isNotice) {
    const noticeTexts = {
      'removed': 'ANNULATION',
      'modified': 'FERMETURE'
    }
    return noticeTexts[type] || 'AVIS'
  }
  
  const texts = {
    'added': 'AJOUT',
    'removed': 'RETRAIT',
    'modified': 'MODIFIÉ'
  }
  return texts[type] || type.toUpperCase()
}

// Keywords that indicate special schedules (French only -- backend generates French descriptions)
const specialScheduleKeywords = [
  'vacances',
  'férié',
  'congé',
  'fermé',
  'noël',
  'pâques',
  'été',
  'hiver',
  'construction',
  'rénovation',
  'exception',
  'relâche',
]

const isSpecialSchedule = (change) => {
  if (!change.description) return false
  const desc = change.description.toLowerCase()
  return specialScheduleKeywords.some(keyword => desc.includes(keyword.toLowerCase()))
}

const formatDate = (isoDate) => {
  if (!isoDate) return ''
  const date = new Date(isoDate)
  return date.toLocaleDateString('fr-CA', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  loadChanges()
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

.loading, .error, .empty {
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

.changes-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.change-card {
  background: var(--card);
  border-radius: 8px;
  padding: 20px;
  border-left: 4px solid var(--border);
}

.change-card.added {
  border-left-color: #22c55e;
}

.change-card.removed {
  border-left-color: #ef4444;
}

.change-card.modified {
  border-left-color: #f59e0b;
}

/* Special schedule highlighting */
.change-card.special-schedule {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, var(--card) 100%);
  border-left-color: #f59e0b;
  border-left-width: 6px;
}

.change-card.special-schedule.removed {
  border-left-color: #ef4444;
}

.special-badge {
  background: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
}

.change-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.badge.added {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
}

.badge.removed {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.badge.modified {
  background: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
}

.facility {
  font-weight: 600;
  color: var(--text);
}

.date {
  font-size: 12px;
  color: var(--muted);
  margin-left: auto;
}

.description {
  font-size: 15px;
  line-height: 1.5;
  color: var(--text);
  margin-bottom: 12px;
}

.diff {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: var(--bg);
  border-radius: 6px;
  font-family: monospace;
  font-size: 13px;
}

.diff .label {
  font-size: 11px;
  text-transform: uppercase;
  color: var(--muted);
  margin-right: 8px;
}

.diff .old {
  color: #ef4444;
  text-decoration: line-through;
}

.diff .new {
  color: #22c55e;
}

/* Notice change styling */
.change-card.notice {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, var(--card) 100%);
  border-left-color: #f59e0b;
}

.change-card.notice.removed {
  border-left-color: #ef4444;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, var(--card) 100%);
}

.notice-badge {
  background: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
}
</style>
