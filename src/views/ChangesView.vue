<template>
  <div class="changes">
    <section class="hero">
      <p class="eyebrow">Mises à jour</p>
      <h1>Changements récents</h1>
      <p class="lede">Historique des modifications détectées dans les horaires.</p>
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
      <div v-if="store.changes.length === 0" class="empty">
        <p>Aucun changement récent.</p>
      </div>

      <div 
        v-for="change in store.changes" 
        :key="change.id"
        class="change-card"
        :class="change.change_type"
      >
        <div class="change-header">
          <span class="badge" :class="change.change_type">
            {{ badgeText(change.change_type) }}
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
import { onMounted } from 'vue'
import { useScheduleStore } from '../stores/schedules'

const store = useScheduleStore()

const loadChanges = async () => {
  await store.fetchChanges()
}

const badgeText = (type) => {
  const texts = {
    'added': 'AJOUT',
    'removed': 'RETRAIT',
    'modified': 'MODIFIÉ'
  }
  return texts[type] || type.toUpperCase()
}

const formatDate = (isoDate) => {
  if (!isoDate) return ''
  const date = new Date(isoDate)
  return date.toLocaleDateString('fr-CA', {
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
</style>
