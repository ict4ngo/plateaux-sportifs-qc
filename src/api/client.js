import axios from "axios";

// API base URL from environment variable
// In production (.env.production): Cloudflare tunnel URL
// In development (.env.development or fallback): local FastAPI server
const apiBase = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Path to static snapshot file (raw GitHub URL - updates immediately on push)
const snapshotUrl = "https://raw.githubusercontent.com/ict4ngo/plateaux-sportifs-qc/main/public/data/snapshot.json";

const client = axios.create({
  baseURL: apiBase,
  timeout: 8000, // Reduced timeout for faster fallback
});

// Track if we're using fallback data
let usingFallback = false;
let lastExportedAt = null;

// Cache the snapshot to avoid redundant fetches
let cachedSnapshot = null;

export function isUsingFallback() {
  return usingFallback;
}

export function getLastExportedAt() {
  return lastExportedAt;
}

// Helper to reset fallback state (call when API succeeds)
function resetFallbackState() {
  usingFallback = false;
  lastExportedAt = null;
}

// Helper to set fallback state from snapshot data
function setFallbackState(snapshot) {
  usingFallback = true;
  lastExportedAt = snapshot.exported_at || null;
}

// Fetch snapshot with caching (only fetch once per session)
async function getSnapshot() {
  if (cachedSnapshot) return cachedSnapshot;

  const response = await fetch(snapshotUrl);
  if (!response.ok) {
    throw new Error(`Snapshot not available: ${response.status}`);
  }
  cachedSnapshot = await response.json();
  return cachedSnapshot;
}

// Fetch with automatic fallback to static snapshot
async function fetchWithFallback(apiPath, transformSnapshot = null) {
  try {
    // Try API first
    const response = await client.get(apiPath);
    resetFallbackState();
    return response.data;
  } catch (error) {
    console.warn(`API request failed (${apiPath}), trying fallback snapshot:`, error.message);
    
    // Fallback to static snapshot
    try {
      const snapshot = await getSnapshot();
      setFallbackState(snapshot);
      
      // Transform snapshot data to match API format if needed
      if (transformSnapshot) {
        return transformSnapshot(snapshot);
      }
      
      return snapshot;
    } catch (snapshotError) {
      console.error("Fallback snapshot also failed:", snapshotError.message);
      throw new Error("API indisponible et données hors ligne non disponibles");
    }
  }
}

export default client;

// Convenience functions with fallback support
export async function getFacilities(params = {}) {
  const data = await fetchWithFallback("/api/facilities/", (snapshot) => {
    // Filter by facility_type if specified
    let facilities = snapshot.facilities || [];
    if (params.facility_type) {
      facilities = facilities.filter(f => f.facility_type === params.facility_type);
    }
    return facilities;
  });
  return data;
}

export async function getSchedules(params = {}) {
  const data = await fetchWithFallback("/api/schedules/", (snapshot) => {
    let schedules = snapshot.schedules || [];

    // Filter by facility_type if specified
    if (params.facility_type) {
      const facilityIds = (snapshot.facilities || [])
        .filter(f => f.facility_type === params.facility_type)
        .map(f => f.id);
      schedules = schedules.filter(s => facilityIds.includes(s.facility_id));
    }

    // Apply filters from params
    if (params.facility_id) {
      // Single facility filter (used by FacilityView)
      const id = parseInt(params.facility_id);
      schedules = schedules.filter(s => s.facility_id === id);
    } else if (params.facility_ids) {
      // Multi facility filter (comma-separated, used by DashboardView)
      const ids = params.facility_ids.split(',').map(Number);
      schedules = schedules.filter(s => ids.includes(s.facility_id));
    }

    if (params.days) {
      const days = params.days.split(',');
      schedules = schedules.filter(s => days.includes(s.day_of_week));
    }

    if (params.activities) {
      const activities = params.activities.split(',');
      schedules = schedules.filter(s => activities.includes(s.activity));
    }

    return schedules;
  });
  return data;
}

export async function getChanges(params = {}) {
  const data = await fetchWithFallback("/api/changes/", (snapshot) => {
    let changes = snapshot.changes || [];

    // Filter by facility_type if specified
    if (params.facility_type) {
      const facilityIds = (snapshot.facilities || [])
        .filter(f => f.facility_type === params.facility_type)
        .map(f => f.id);
      changes = changes.filter(c => facilityIds.includes(c.facility_id));
    }

    // Apply facility_id filter if specified
    if (params.facility_id) {
      changes = changes.filter(c => c.facility_id === parseInt(params.facility_id));
    }

    // Apply limit
    if (params.limit) {
      changes = changes.slice(0, parseInt(params.limit));
    }

    return changes;
  });
  return data;
}

export async function getHealthStatus() {
  // Fetch last scrape time from the health endpoint (no fallback needed)
  try {
    const { data } = await client.get("/api/health");
    return data;
  } catch {
    return null;
  }
}

export async function submitReport(report) {
  // Reports always require the API - no fallback for write operations
  const { data } = await client.post("/api/reports/", report);
  return data;
}

export async function getFacilityNotices(facilityId) {
  const data = await fetchWithFallback(`/api/facilities/${facilityId}/notices`, (snapshot) => {
    // Filter notices from snapshot for this facility
    const notices = snapshot.notices || [];
    return notices.filter(n => n.facility_id === facilityId);
  });
  return data;
}
