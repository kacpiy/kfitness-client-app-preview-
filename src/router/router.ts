import { createWebHistory, createRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import { useNotificationStore } from '@/stores/notificationStore';
// import { tryViewAPITransition } from '@/composables/transitions';

const routes = [
  
];

const isRunningAsPWA = () => {
  return window.matchMedia('(display-mode: standalone)').matches;
  //return true;
}


const router = createRouter({
  history: createWebHistory(),
  routes,
  linkExactActiveClass: 'router-link-exact-active',
  linkActiveClass: 'router-link-active'
});

// Authentication check
router.beforeEach(async (to, _, next) => {
  
});

export default router;
