import { createRouter, createWebHashHistory } from "vue-router";
import { useActivityStore } from "../stores/activity";

// Configuration des activités
export const ACTIVITIES = {
  piscines: {
    key: "piscines",
    label: "Piscines",
    type: "piscine",
    color: "#38bdf8",
    icon: "🏊",
    isDefault: true,
  },
  patinoires: {
    key: "patinoires",
    label: "Patinoires",
    type: "patinoire",
    color: "#22d3ee",
    icon: "⛸️",
    isDefault: false,
  },
};

// Fonction utilitaire pour créer les routes d'une activité
function createActivityRoutes(activityKey, config) {
  const basePath = `/${activityKey}`;

  return [
    {
      path: basePath,
      redirect: `${basePath}/horaires`,
    },
    {
      path: `${basePath}/horaires`,
      name: `${activityKey}-schedules`,
      component: () => import("../views/DashboardView.vue"),
      meta: {
        activity: activityKey,
        facilityType: config.type,
        title: `Horaires - ${config.label}`,
      },
    },
    {
      path: `${basePath}/changements`,
      name: `${activityKey}-changes`,
      component: () => import("../views/ChangesView.vue"),
      meta: {
        activity: activityKey,
        facilityType: config.type,
        title: `Changements - ${config.label}`,
      },
    },
    {
      path: `${basePath}/signaler`,
      name: `${activityKey}-report`,
      component: () => import("../views/ReportView.vue"),
      meta: {
        activity: activityKey,
        facilityType: config.type,
        title: `Signaler - ${config.label}`,
      },
    },
    {
      path: `${basePath}/installation/:id`,
      name: `${activityKey}-facility`,
      component: () => import("../views/FacilityView.vue"),
      meta: {
        activity: activityKey,
        facilityType: config.type,
        title: `Installation - ${config.label}`,
      },
    },
  ];
}

// Routes principales
const routes = [
  // Redirection racine vers l'activité par défaut
  {
    path: "/",
    redirect: "/piscines/horaires",
  },

  // Redirections legacy pour les bookmarks existants
  {
    path: "/changes",
    redirect: "/piscines/changements",
  },
  {
    path: "/report",
    redirect: "/piscines/signaler",
  },
  {
    path: "/facility/:id",
    redirect: (to) => {
      // Redirection vers piscines par défaut
      return `/piscines/installation/${to.params.id}`;
    },
  },

  // Routes spécifiques à chaque activité
  ...Object.entries(ACTIVITIES).flatMap(([key, config]) =>
    createActivityRoutes(key, config)
  ),
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

// Navigation guard pour synchroniser l'activité avec le store
router.beforeEach((to, from, next) => {
  const activityStore = useActivityStore();

  // Si la route a une métadonnée d'activité, la définir
  if (to.meta?.activity) {
    const activityKey = to.meta.activity;
    if (ACTIVITIES[activityKey]) {
      activityStore.setActivity(activityKey);
    }
  }

  // Mise à jour du titre de la page
  if (to.meta?.title) {
    document.title = `${to.meta.title} | Plateaux Sportifs QC`;
  } else {
    document.title = "Plateaux Sportifs QC";
  }

  next();
});

export default router;
