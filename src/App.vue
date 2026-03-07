<script setup>
import { computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useScheduleStore } from './stores/schedules'
import { useActivityStore } from './stores/activity'
import MobileMenu from './components/MobileMenu.vue'

const route = useRoute()
const store = useScheduleStore()
const activityStore = useActivityStore()

const isOffline = computed(() => store.isOfflineMode)

const lastExportedAt = computed(() => {
  if (!store.lastExportedAt) return null
  const date = new Date(store.lastExportedAt)
  return date.toLocaleString('fr-CA', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
})

// Synchroniser l'activité depuis la route
watch(() => route.meta?.activity, (activity) => {
  if (activity && activity !== activityStore.currentActivity) {
    activityStore.setActivity(activity)
    store.resetActivityFilters()
  }
}, { immediate: true })

// Navigation contextuelle
const navItems = [
  { route: 'schedules', label: 'Horaires' },
  { route: 'changes', label: 'Changements' },
  { route: 'report', label: 'Signaler' },
]

function isRouteActive(routeType) {
  const currentRoute = route.name
  if (!currentRoute) return false
  return currentRoute.endsWith(`-${routeType}`)
}

function getRouteForActivity(activityKey, routeType) {
  return { name: `${activityKey}-${routeType}` }
}

onMounted(() => {
  activityStore.loadPersistedActivity()
  store.fetchHealthStatus()
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
      <!-- Navigation principale -->
      <nav class="navbar">
        <!-- Mobile: Menu hamburger -->
        <MobileMenu class="mobile-only" />

        <!-- Brand -->
        <router-link
          :to="getRouteForActivity(activityStore.currentActivity, 'schedules')"
          class="brand"
        >
          <span class="brand-icon">{{ activityStore.activityIcon }}</span>
          <span class="brand-text">Plateaux Sportifs QC</span>
        </router-link>

        <!-- Desktop: Onglets d'activité -->
        <div class="activity-tabs desktop-only">
          <router-link
            v-for="activity in activityStore.availableActivities"
            :key="activity.key"
            :to="getRouteForActivity(activity.key, 'schedules')"
            class="activity-tab"
            :class="{ active: activityStore.isCurrentActivity(activity.key) }"
          >
            <span class="tab-icon">{{ activity.icon }}</span>
            {{ activity.label }}
          </router-link>
        </div>

        <!-- Desktop: Badge d'activité courante -->
        <div class="current-activity-badge desktop-only">
          <span class="activity-badge">
            {{ activityStore.activityIcon }} {{ activityStore.activityLabel }}
          </span>
        </div>
      </nav>

      <!-- Sous-navigation contextuelle (Desktop) -->
      <nav class="subnav desktop-only">
        <div class="subnav-content">
          <div class="subnav-links">
            <router-link
              v-for="item in navItems"
              :key="item.route"
              :to="getRouteForActivity(activityStore.currentActivity, item.route)"
              class="subnav-link"
              :class="{ active: isRouteActive(item.route) }"
            >
              {{ item.label }}
            </router-link>
          </div>
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
  gap: 24px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  font-size: 18px;
  color: var(--accent);
  text-decoration: none;
  white-space: nowrap;
}

.brand-icon {
  font-size: 24px;
}

/* Onglets d'activité (Desktop) */
.activity-tabs {
  display: flex;
  gap: 8px;
  flex: 1;
  justify-content: center;
}

.activity-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 8px;
  color: var(--muted);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.activity-tab:hover {
  background: var(--bg);
  color: var(--text);
}

.activity-tab.active {
  background: rgba(var(--accent-rgb), 0.15);
  color: var(--accent);
}

.tab-icon {
  font-size: 18px;
}

/* Badge d'activité courante */
.current-activity-badge {
  display: flex;
  align-items: center;
}

/* Sous-navigation */
.subnav {
  background: var(--card);
  border-bottom: 1px solid var(--border);
}

.subnav-content {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 24px;
}

.subnav-links {
  display: flex;
  gap: 4px;
}

.subnav-link {
  padding: 12px 20px;
  color: var(--muted);
  text-decoration: none;
  font-size: 14px;
  transition: all 0.2s;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
}

.subnav-link:hover {
  color: var(--text);
}

.subnav-link.active {
  color: var(--accent);
  border-bottom-color: var(--accent);
  font-weight: 500;
}

main {
  max-width: 1100px;
  margin: 24px auto;
  padding: 0 24px;
}

/* Mobile Styles */
@media (max-width: 768px) {
  .navbar {
    padding: 12px 16px;
    gap: 12px;
  }

  .brand-text {
    font-size: 16px;
  }

  main {
    margin: 16px auto;
    padding: 0 16px;
  }

  .subnav {
    display: none;
  }
}
</style>
