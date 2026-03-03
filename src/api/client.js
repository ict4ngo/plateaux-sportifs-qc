import axios from "axios";

// In production, this points to the homelab API via Cloudflare Tunnel.
// In development, it points to the local FastAPI server.
const apiBase =
  import.meta.env.VITE_API_URL || "http://localhost:8000";

const client = axios.create({
  baseURL: apiBase,
  timeout: 15000,
});

export default client;

// Convenience functions
export async function getFacilities(params = {}) {
  const { data } = await client.get("/api/facilities/", { params });
  return data;
}

export async function getSchedules(params = {}) {
  const { data } = await client.get("/api/schedules/", { params });
  return data;
}

export async function getChanges(params = {}) {
  const { data } = await client.get("/api/changes/", { params });
  return data;
}

export async function submitReport(report) {
  const { data } = await client.post("/api/reports/", report);
  return data;
}
