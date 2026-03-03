import { createRouter, createWebHashHistory } from "vue-router";

// Use hash history because GitHub Pages doesn't support SPA fallback
const routes = [
  {
    path: "/",
    name: "dashboard",
    component: () => import("../views/DashboardView.vue"),
  },
  {
    path: "/facility/:id",
    name: "facility",
    component: () => import("../views/FacilityView.vue"),
  },
  {
    path: "/changes",
    name: "changes",
    component: () => import("../views/ChangesView.vue"),
  },
  {
    path: "/report",
    name: "report",
    component: () => import("../views/ReportView.vue"),
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
