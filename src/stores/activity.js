import { defineStore } from "pinia";
import { ref, computed } from "vue";

// Configuration des activités disponibles
export const ACTIVITIES = {
  piscines: {
    key: "piscines",
    label: "Piscines",
    type: "piscine",
    color: "#38bdf8", // Bleu ciel
    icon: "🏊",
    isDefault: true,
  },
  patinoires: {
    key: "patinoires",
    label: "Patinoires",
    type: "patinoire",
    color: "#22d3ee", // Cyan
    icon: "⛸️",
    isDefault: false,
  },
};

export const useActivityStore = defineStore("activity", () => {
  // État
  const currentActivity = ref("piscines"); // Activité par défaut

  // Getters
  const currentConfig = computed(() => ACTIVITIES[currentActivity.value]);

  const facilityType = computed(() => currentConfig.value?.type);

  const themeColor = computed(() => currentConfig.value?.color);

  const activityLabel = computed(() => currentConfig.value?.label);

  const activityIcon = computed(() => currentConfig.value?.icon);

  const availableActivities = computed(() =>
    Object.values(ACTIVITIES).map((config) => ({
      ...config,
    }))
  );

  // Actions
  function setActivity(activityKey) {
    if (ACTIVITIES[activityKey]) {
      currentActivity.value = activityKey;
      // Persister dans localStorage pour la continuité de session
      localStorage.setItem("lastActivity", activityKey);

      // Mettre à jour l'attribut data-activity sur le document pour le CSS
      document.documentElement.setAttribute("data-activity", activityKey);

      return true;
    }
    return false;
  }

  function loadPersistedActivity() {
    const saved = localStorage.getItem("lastActivity");
    if (saved && ACTIVITIES[saved]) {
      currentActivity.value = saved;
      document.documentElement.setAttribute("data-activity", saved);
    } else {
      document.documentElement.setAttribute("data-activity", currentActivity.value);
    }
  }

  function isCurrentActivity(activityKey) {
    return currentActivity.value === activityKey;
  }

  function getActivityByType(facilityType) {
    const entry = Object.values(ACTIVITIES).find(
      (a) => a.type === facilityType
    );
    return entry || ACTIVITIES.piscines;
  }

  return {
    currentActivity,
    currentConfig,
    facilityType,
    themeColor,
    activityLabel,
    activityIcon,
    availableActivities,
    setActivity,
    loadPersistedActivity,
    isCurrentActivity,
    getActivityByType,
  };
});
