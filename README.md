# Plateaux Sportifs Québec

Frontend Vue.js application for displaying sports facility schedules in Quebec City.

## Docker Development Setup

No Node.js installation required - everything runs in Docker!

### Prerequisites
- Docker and Docker Compose installed
- Backend API running on port 8000

### Quick Start

```bash
# Start the frontend dev server
docker compose up

# Or run in background
docker compose up -d
```

The dev server will be available at: **http://localhost:5173**

### Features
- Hot reload - changes are instantly reflected
- API proxy - automatically forwards `/api/*` requests to the backend
- No local Node.js installation needed

### Stopping

```bash
docker compose down
```

### Rebuild

If you change package.json:

```bash
docker compose up --build
```

## Project Structure

```
src/
├── api/client.js        # API communication
├── router/index.js      # Vue Router configuration
├── stores/schedules.js  # Pinia state management
├── views/               # Page components
│   ├── DashboardView.vue
│   ├── FacilityView.vue
│   ├── ChangesView.vue
│   └── ReportView.vue
└── App.vue             # Root component
```

## Development Notes

The frontend uses hash-based routing (`/#/changes`) for GitHub Pages compatibility.

When deployed to production (GitHub Pages), it connects to the homelab backend via HTTPS.
