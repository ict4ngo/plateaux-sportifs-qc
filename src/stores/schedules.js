import { defineStore } from "pinia";
import { getFacilities, getSchedules, getChanges, isUsingFallback, getLastExportedAt } from "../api/client";

export const useScheduleStore = defineStore("schedules", {
  state: () => ({
    facilities: [],
    schedules: [],
    changes: [],
    loading: false,
    error: null,
    usingFallback: false,
    lastExportedAt: null,
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
    isOfflineMode(state) {
      return state.usingFallback;
    },
  },

  actions: {
    async fetchFacilities() {
      const params = {};
      if (this.filters.facility_type) params.facility_type = this.filters.facility_type;
      const facilities = await getFacilities(params);
      // Add short names for display
      this.facilities = facilities.map(f => ({
        ...f,
        short_name: this.getShortName(f.name)
      }));
      this.updateFallbackState();
    },
    
    getShortName(fullName) {
      // Mapping of long names to short display names
      const shortNames = {
        "Centre communautaire Ferland": "Ferland",
        "Centre communautaire Lucien-Borne": "Lucien-Borne",
        "Centre communautaire Michel-Labadie": "Labadie",
        "Centre municipal Monseigneur-De Laval": "De Laval",
        "Complexe Jean-Paul-Nolin": "Nolin",
        "Pavillon de l'éducation physique et des sports de l'Université Laval (PEPS)": "PEPS",
        "Piscine A. Couture (Collège François-de-Laval)": "A. Couture",
        "Piscine Jacques-Amyot": "Jacques-Amyot",
        "Piscine Jos.-A.-Lachance": "Jos.-A.-Lachance",
        "Piscine Jules-Dallaire - Patro Roc-Amadour": "Jules-Dallaire",
        "Piscine Lucien-Flamand (centre Wilbrod-Bhérer)": "Lucien-Flamand",
        "Piscine Sylvie-Bernier": "Sylvie-Bernier",
        "Piscine Wilfrid-Hamel": "Wilfrid-Hamel",
        "Piscine de l'école L'Odyssée": "L'Odyssée",
        "Piscine de l'édifice Denis-Giguère": "Denis-Giguère",
        "Piscine du Campus Notre-Dame-de-Foy": "ND de Foy",
        "Piscine municipale du Bourg-Royal": "Bourg-Royal",
        "YMCA St-Roch": "YMCA St-Roch",
        "YWCA Québec": "YWCA",
        "École secondaire de La Seigneurie": "La Seigneurie"
      };
      return shortNames[fullName] || fullName;
    },
    
    updateFallbackState() {
      this.usingFallback = isUsingFallback();
      this.lastExportedAt = getLastExportedAt();
    },
    
    async fetchSchedules() {
      this.loading = true;
      this.error = null;
      try {
        const params = {};
        if (this.filters.facility_ids.length > 0) {
          params.facility_ids = this.filters.facility_ids.join(',');
        }
        if (this.filters.days.length > 0) {
          params.days = this.filters.days.join(',');
        }
        const schedules = await getSchedules(params);
        
        // Deduplicate: keep only unique combinations of facility + day + activity + time
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
      this.changes = await getChanges({ limit: 50 });
      this.updateFallbackState();
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
