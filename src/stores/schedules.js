import { defineStore } from "pinia";
import { getFacilities, getSchedules, getChanges } from "../api/client";

export const useScheduleStore = defineStore("schedules", {
  state: () => ({
    facilities: [],
    schedules: [],
    changes: [],
    loading: false,
    error: null,
    filters: {
      facility_ids: [],      // Array of selected facility IDs
      facility_type: null,   // Single type filter (optional)
      days: [],              // Array of selected days
      activities: [],        // Array of selected activities
    },
  }),

  getters: {
    facilityTypes(state) {
      return [...new Set(state.facilities.map((f) => f.facility_type))].sort();
    },
    activities(state) {
      return [...new Set(state.schedules.map((s) => s.activity))].sort();
    },
    days() {
      return ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
    },
    filteredSchedules(state) {
      return state.schedules.filter((s) => {
        // Check facility_ids (if any selected)
        if (state.filters.facility_ids.length > 0 && 
            !state.filters.facility_ids.includes(s.facility_id)) return false;
        
        // Check days (if any selected)
        if (state.filters.days.length > 0 && 
            !state.filters.days.includes(s.day_of_week)) return false;
        
        // Check activities (if any selected)
        if (state.filters.activities.length > 0 && 
            !state.filters.activities.includes(s.activity)) return false;
        
        return true;
      });
    },
    hasActiveFilters(state) {
      return state.filters.facility_ids.length > 0 ||
             state.filters.days.length > 0 ||
             state.filters.activities.length > 0;
    },
  },

  actions: {
    async fetchFacilities() {
      const params = {};
      if (this.filters.facility_type) params.facility_type = this.filters.facility_type;
      this.facilities = await getFacilities(params);
    },
    async fetchSchedules() {
      this.loading = true;
      this.error = null;
      try {
        const params = {};
        // Only send facility-related filters to API
        // Activity filtering is done client-side to keep the activities list complete
        if (this.filters.facility_ids.length > 0) {
          params.facility_ids = this.filters.facility_ids.join(',');
        }
        if (this.filters.days.length > 0) {
          params.days = this.filters.days.join(',');
        }
        this.schedules = await getSchedules(params);
      } catch (e) {
        this.error = "Erreur de chargement des horaires.";
        console.error(e);
      } finally {
        this.loading = false;
      }
    },
    async fetchChanges() {
      this.changes = await getChanges({ limit: 50 });
    },
    
    // Multi-select helpers
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
      this.filters.facility_type = null;
    },
    
    setFacilityType(type) {
      this.filters.facility_type = type;
    },
  },
});
