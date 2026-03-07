import { defineStore } from "pinia";
import { getFacilities, getSchedules, getChanges, getHealthStatus, isUsingFallback, getLastExportedAt } from "../api/client";
import { useActivityStore } from "./activity";

export const useScheduleStore = defineStore("schedules", {
  state: () => ({
    facilities: [],
    schedules: [],
    changes: [],
    loading: false,
    error: null,
    usingFallback: false,
    lastExportedAt: null,
    lastScrapedAt: null,
    filters: {
      facility_ids: [],
      days: [],
      activities: [],
    },
  }),

  getters: {
    // Installations filtrées par activité courante
    currentActivityFacilities(state) {
      const activityStore = useActivityStore();
      const facilityType = activityStore.facilityType;
      return state.facilities.filter(f => f.facility_type === facilityType);
    },

    // Activités disponibles pour l'activité courante
    currentActivityActivities(state) {
      const activityStore = useActivityStore();
      const facilityType = activityStore.facilityType;
      const facilityIds = state.facilities
        .filter(f => f.facility_type === facilityType)
        .map(f => f.id);

      return [...new Set(
        state.schedules
          .filter(s => facilityIds.includes(s.facility_id))
          .map(s => s.activity)
      )].sort();
    },

    days() {
      return ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
    },

    // Horaires filtrés par activité et filtres utilisateur
    filteredSchedules(state) {
      const activityStore = useActivityStore();
      const facilityType = activityStore.facilityType;

      // D'abord filtrer par type d'installation (activité)
      const facilityIds = state.facilities
        .filter(f => f.facility_type === facilityType)
        .map(f => f.id);

      return state.schedules.filter((s) => {
        // L'installation fait-elle partie de l'activité courante?
        if (!facilityIds.includes(s.facility_id)) return false;

        // Filtres utilisateur
        if (state.filters.facility_ids.length > 0 &&
            !state.filters.facility_ids.includes(s.facility_id)) return false;

        if (state.filters.days.length > 0 &&
            !state.filters.days.includes(s.day_of_week)) return false;

        if (state.filters.activities.length > 0 &&
            !state.filters.activities.includes(s.activity)) return false;

        return true;
      });
    },

    // Changements filtrés par activité courante
    currentActivityChanges(state) {
      const activityStore = useActivityStore();
      const facilityType = activityStore.facilityType;
      const facilityIds = state.facilities
        .filter(f => f.facility_type === facilityType)
        .map(f => f.id);

      return state.changes.filter(c => facilityIds.includes(c.facility_id));
    },

    hasActiveFilters(state) {
      return state.filters.facility_ids.length > 0 ||
             state.filters.days.length > 0 ||
             state.filters.activities.length > 0;
    },

    isOfflineMode(state) {
      return state.usingFallback;
    },
  },

  actions: {
    async fetchFacilities() {
      const activityStore = useActivityStore();
      const params = {
        facility_type: activityStore.facilityType
      };
      const facilities = await getFacilities(params);
      this.facilities = facilities;
      this.updateFallbackState();
    },

    async fetchHealthStatus() {
      const health = await getHealthStatus();
      if (health && health.last_scraped_at) {
        this.lastScrapedAt = health.last_scraped_at;
      }
    },

    updateFallbackState() {
      this.usingFallback = isUsingFallback();
      this.lastExportedAt = getLastExportedAt();
    },

    async fetchSchedules() {
      this.loading = true;
      this.error = null;
      try {
        const activityStore = useActivityStore();
        const params = {
          facility_type: activityStore.facilityType,
        };

        if (this.filters.facility_ids.length > 0) {
          params.facility_ids = this.filters.facility_ids.join(',');
        }
        if (this.filters.days.length > 0) {
          params.days = this.filters.days.join(',');
        }

        const schedules = await getSchedules(params);

        // Dédupliquer
        const seen = new Set();
        this.schedules = schedules.filter(s => {
          const key = `${s.facility_id}-${s.day_of_week}-${s.activity}-${s.start_time || s.raw_text}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

        this.updateFallbackState();
      } catch (e) {
        this.error = "Erreur de chargement des horaires.";
        console.error(e);
      } finally {
        this.loading = false;
      }
    },

    async fetchChanges() {
      this.loading = true;
      this.error = null;
      try {
        const activityStore = useActivityStore();
        const params = {
          limit: 50,
          facility_type: activityStore.facilityType,
        };

        this.changes = await getChanges(params);
        this.updateFallbackState();
      } catch (e) {
        this.error = "Erreur de chargement des changements.";
        console.error(e);
      } finally {
        this.loading = false;
      }
    },

    // Helpers pour les filtres multi-sélection
    toggleFacility(facilityId) {
      const index = this.filters.facility_ids.indexOf(facilityId);
      if (index === -1) {
        this.filters.facility_ids.push(facilityId);
      } else {
        this.filters.facility_ids.splice(index, 1);
      }
    },

    toggleDay(day) {
      const index = this.filters.days.indexOf(day);
      if (index === -1) {
        this.filters.days.push(day);
      } else {
        this.filters.days.splice(index, 1);
      }
    },

    toggleActivity(activity) {
      const index = this.filters.activities.indexOf(activity);
      if (index === -1) {
        this.filters.activities.push(activity);
      } else {
        this.filters.activities.splice(index, 1);
      }
    },

    clearFilters() {
      this.filters.facility_ids = [];
      this.filters.days = [];
      this.filters.activities = [];
    },

    // Réinitialiser les filtres spécifiques à l'activité
    resetActivityFilters() {
      this.filters.facility_ids = [];
      this.filters.activities = [];
      // Garder les jours car c'est transverse aux activités
    },
  },
});
