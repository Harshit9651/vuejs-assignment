// main.js
import { createApp } from 'vue';
import App from './app.vue';
import { createRouter, createWebHistory } from 'vue-router';
import HomeView from './views/homepage.vue';
import SignUpForm from './components/SignUpForm.vue';
import SignInForm from './components/SignInForm.vue';
import DrawingPage from './components/DrawingPage.vue';

// Mock authentication check (replace with actual authentication service)
const isAuthenticated = () => {
  return !!sessionStorage.getItem('authToken'); // Replace with real authentication check
};

const routes = [
  { path: '/', component: HomeView },
  { path: '/signup', component: SignUpForm },
  { path: '/signin', component: SignInForm },
  {
    path: '/drawing',
    component: DrawingPage,
    meta: { requiresAuth: true }, // Protected route
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  // Check if the route requires authentication
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!isAuthenticated()) {
      // Redirect to SignIn page if not authenticated
      next({ path: '/signin' });
    } else {
      next(); // Proceed if authenticated
    }
  } else {
    next(); // Always call next() to resolve the hook
  }
});

createApp(App).use(router).mount('#app');
