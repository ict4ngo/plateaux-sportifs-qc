<template>
  <div class="facility-detail">
    <div v-if="loading" class="loading">
      <p>Chargement...</p>
    </div>

     <div v-else-if="error" class="error">
      <p>{{ error }}</p>
      <router-link :to="{ name: `${activityStore.currentActivity}-schedules` }">← Retour aux horaires</router-link>
    </div>

    <div v-else-if="facility" class="facility-content">
      <!-- Header -->
      <section class="hero">
        <router-link :to="{ name: `${activityStore.currentActivity}-schedules` }" class="back-link">← Retour aux horaires</router-link>
        <p class="eyebrow">{{ facility.facility_type }}</p>
        <h1>{{ facility.name }}</h1>
        <a 
          v-if="facility.source_url" 
          :href="facility.source_url" 
          target="_blank" 
          rel="noopener"
          class="source-link"
        >
          Voir sur ville.quebec.qc.ca →
        </a>
      </section>

      <!-- Weekly Schedule -->
      <section class="schedule-section">
        <h2>Horaire hebdomadaire</h2>
        <p v-if="lastUpdated" class="last-updated">
          Dernière mise à jour : {{ lastUpdated }}
        </p>
        
        <div v-if="facilitySchedules.length === 0" class="empty">
          <p>Aucun horaire disponible pour cette installation.</p>
        </div>

        <ScheduleTable v-else :schedules="facilitySchedules" :isSingleFacility="true" />
      </section>

      <!-- Recent Changes -->
      <section v-if="facilityChanges.length > 0" class="changes-section">
        <h2>Changements récents</h2>
        <div class="mini-changes">
          <div 
            v-for="change in facilityChanges.slice(0, 5)" 
            :key="change.id"
            class="mini-change"
            :class="change.change_type"
          >
            <span class="badge" :class="change.change_type">
              {{ change.change_type }}
            </span>
            <span class="desc">{{ change.description }}</span>
            <span class="date">{{ formatDate(change.created_at) }}</span>
          </div>
        </div>
        <router-link :to="{ name: `${activityStore.currentActivity}-changes` }" class="view-all">
          Voir tous les changements →
        </router-link>
      </section>

      <!-- Report Issue -->
      <section class="report-section">
        <h2>Signaler une erreur</h2>
        <p>Vous constatez un horaire incorrect? Signalez-le nous.</p>
        <router-link
          :to="{ name: `${activityStore.currentActivity}-report`, query: { facility: facility.id } }"
          class="btn-report"
        >
          Signaler un problème
        </router-link>
      </section>
    </div>

    <div v-else class="not-found">
      <h2>Installation non trouvée</h2>
      <router-link :to="{ name: `${activityStore.currentActivity}-schedules` }">← Retour aux horaires</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useScheduleStore } from '../stores/schedules'
import { useActivityStore } from '../stores/activity'
import { getFacilities, getSchedules, getChanges } from '../api/client'
import ScheduleTable from '../components/ScheduleTable.vue'

const route = useRoute()
const router = useRouter()
const store = useScheduleStore()
const activityStore = useActivityStore()

const facility = ref(null)
const facilitySchedules = ref([])
const facilityChanges = ref([])
const loading = ref(true)
const error = ref(null)

// Use last scrape time from the store (fetched via health endpoint)
const lastUpdated = computed(() => {
  if (!store.lastScrapedAt) return null
  
  const date = new Date(store.lastScrapedAt)
  return date.toLocaleString('fr-CA', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
})

const formatDate = (isoDate) => {
  if (!isoDate) return ''
  const date = new Date(isoDate)
  return date.toLocaleDateString('fr-CA', {
    timeZone: 'America/New_York',
    month: 'short',
    day: 'numeric'
  })
}

const loadFacility = async () => {
  const facilityId = parseInt(route.params.id)
  
  try {
    loading.value = true
    error.value = null
    
    // Fetch last scrape time (fire-and-forget)
    store.fetchHealthStatus()
    
    // Load facility details
    const facilities = await getFacilities()
    facility.value = facilities.find(f => f.id === facilityId)
    
    if (!facility.value) {
      error.value = "Installation non trouvée"
      return
    }
    
    // Load schedules for this facility
    const schedules = await getSchedules({ facility_id: facilityId })
    facilitySchedules.value = schedules
    
    // Load recent changes
    const changes = await getChanges({ facility_id: facilityId, limit: 10 })
    facilityChanges.value = changes
    
  } catch (e) {
    error.value = "Erreur de chargement des données"
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadFacility()
})
</script>

<style scoped>
.loading, .error, .not-found {
  text-align: center;
  padding: 48px;
  color: var(--muted);
}

.error {
  color: #f87171;
}

.back-link {
  display: inline-block;
  margin-bottom: 16px;
  color: var(--muted);
  text-decoration: none;
}

.back-link:hover {
  color: var(--accent);
}

.hero {
  padding: 32px 0;
  border-bottom: 1px solid var(--border);
  margin-bottom: 32px;
}

.eyebrow {
  color: var(--accent);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 8px;
}

h1 {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 16px;
}

.source-link {
  display: inline-block;
  font-size: 14px;
  color: var(--accent);
  text-decoration: none;
}

.source-link:hover {
  text-decoration: underline;
}

.schedule-section, .changes-section, .report-section {
  margin-bottom: 40px;
}

.last-updated {
  color: var(--accent);
  font-size: 13px;
  margin-bottom: 16px;
  font-style: italic;
}

h2 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--text);
}

.empty {
  padding: 32px;
  text-align: center;
  color: var(--muted);
  background: var(--card);
  border-radius: 8px;
}

.mini-changes {
  background: var(--card);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mini-change {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid var(--border);
}

.mini-change:last-child {
  border-bottom: none;
}

.badge {
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  flex-shrink: 0;
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

.desc {
  flex: 1;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.date {
  font-size: 12px;
  color: var(--muted);
  flex-shrink: 0;
}

.view-all {
  display: inline-block;
  margin-top: 12px;
  font-size: 14px;
  color: var(--accent);
  text-decoration: none;
}

.report-section {
  background: var(--card);
  border-radius: 8px;
  padding: 24px;
  text-align: center;
}

.report-section p {
  color: var(--muted);
  margin-bottom: 16px;
}

.btn-report {
  display: inline-block;
  padding: 12px 24px;
  background: var(--accent);
  color: var(--bg);
  text-decoration: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 14px;
}

.btn-report:hover {
  opacity: 0.9;
}
</style>
