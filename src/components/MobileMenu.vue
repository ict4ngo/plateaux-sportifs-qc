<template>
  <div class="mobile-menu-container">
    <!-- Bouton Hamburger -->
    <button
      class="hamburger-btn"
      @click="isOpen = true"
      aria-label="Ouvrir le menu"
      aria-expanded="false"
    >
      <span class="hamburger-icon">
        <span></span>
        <span></span>
        <span></span>
      </span>
    </button>

    <!-- Overlay -->
    <Transition name="fade">
      <div v-if="isOpen" class="menu-overlay" @click="isOpen = false"></div>
    </Transition>

    <!-- Drawer -->
    <Transition name="slide">
      <aside
        v-if="isOpen"
        class="menu-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navigation"
      >
        <!-- Header -->
        <div class="drawer-header">
          <span class="drawer-title">Menu</span>
          <button
            class="close-btn"
            @click="isOpen = false"
            aria-label="Fermer le menu"
          >
            ✕
          </button>
        </div>

        <!-- Sélecteur d'activité -->
        <div class="activity-section">
          <span class="section-label">Activité</span>
          <div class="activity-options">
            <button
              v-for="activity in activityStore.availableActivities"
              :key="activity.key"
              class="activity-option"
              :class="{ active: activityStore.isCurrentActivity(activity.key) }"
              @click="switchActivity(activity.key)"
            >
              <span class="activity-icon">{{ activity.icon }}</span>
              <span class="activity-name">{{ activity.label }}</span>
            </button>
          </div>
        </div>

        <!-- Navigation contextuelle -->
        <nav class="nav-section">
          <span class="section-label">Navigation</span>
          <ul class="nav-list">
            <li v-for="item in navItems" :key="item.name">
              <router-link
                :to="{ name: `${activityStore.currentActivity}-${item.route}` }"
                class="nav-link"
                :class="{ active: isRouteActive(item.route) }"
                @click="isOpen = false"
              >
                <span class="nav-icon">{{ item.icon }}</span>
                {{ item.label }}
              </router-link>
            </li>
          </ul>
        </nav>

        <!-- Footer -->
        <div class="drawer-footer">
          <span class="brand">Plateaux Sportifs QC</span>
        </div>
      </aside>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useActivityStore } from "../stores/activity";

const route = useRoute();
const router = useRouter();
const activityStore = useActivityStore();

const isOpen = ref(false);

const navItems = [
  { name: "schedules", label: "Horaires", icon: "📅", route: "schedules" },
  { name: "changes", label: "Changements", icon: "📝", route: "changes" },
  { name: "report", label: "Signaler", icon: "⚠️", route: "report" },
];

const currentRouteBase = computed(() => {
  const name = route.name;
  if (!name) return "";
  const parts = name.split("-");
  return parts.length > 1 ? parts[1] : "";
});

function isRouteActive(routeType) {
  return currentRouteBase.value === routeType;
}

function switchActivity(activityKey) {
  if (activityKey === activityStore.currentActivity) {
    isOpen.value = false;
    return;
  }

  activityStore.setActivity(activityKey);

  // Naviguer vers la route équivalente dans la nouvelle activité
  const targetRoute = `${activityKey}-${currentRouteBase.value || "schedules"}`;
  router.push({ name: targetRoute });

  isOpen.value = false;
}

// Fermer avec la touche Échap
watch(isOpen, (open) => {
  if (open) {
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
  } else {
    document.removeEventListener("keydown", handleEscape);
    document.body.style.overflow = "";
  }
});

function handleEscape(e) {
  if (e.key === "Escape") {
    isOpen.value = false;
  }
}
</script>

<style scoped>
.mobile-menu-container {
  display: none;
}

@media (max-width: 768px) {
  .mobile-menu-container {
    display: block;
  }
}

.hamburger-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 10px;
}

.hamburger-icon {
  display: flex;
  flex-direction: column;
  gap: 5px;
  width: 24px;
}

.hamburger-icon span {
  display: block;
  height: 2px;
  background: var(--text);
  border-radius: 2px;
  transition: all 0.3s;
}

.menu-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 100;
}

.menu-drawer {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 280px;
  max-width: 85vw;
  background: var(--card);
  z-index: 101;
  display: flex;
  flex-direction: column;
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.3);
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
}

.drawer-title {
  font-size: 18px;
  font-weight: 600;
}

.close-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: var(--muted);
  font-size: 20px;
  cursor: pointer;
  border-radius: 6px;
}

.close-btn:hover {
  background: var(--bg);
  color: var(--text);
}

.activity-section,
.nav-section {
  padding: 20px;
  border-bottom: 1px solid var(--border);
}

.section-label {
  display: block;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--muted);
  margin-bottom: 12px;
}

.activity-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.activity-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--bg);
  border: 2px solid transparent;
  border-radius: 8px;
  color: var(--text);
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s;
}

.activity-option:hover {
  border-color: var(--border);
}

.activity-option.active {
  border-color: var(--accent);
  background: rgba(var(--accent-rgb), 0.1);
}

.activity-icon {
  font-size: 20px;
}

.activity-name {
  font-weight: 500;
}

.nav-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  color: var(--text);
  text-decoration: none;
  border-radius: 8px;
  font-size: 15px;
  transition: all 0.2s;
}

.nav-link:hover {
  background: var(--bg);
}

.nav-link.active {
  background: rgba(var(--accent-rgb), 0.15);
  color: var(--accent);
  font-weight: 500;
}

.nav-icon {
  font-size: 18px;
  opacity: 0.8;
}

.drawer-footer {
  margin-top: auto;
  padding: 20px;
  border-top: 1px solid var(--border);
}

.brand {
  font-size: 14px;
  color: var(--muted);
  font-weight: 600;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
}
</style>
