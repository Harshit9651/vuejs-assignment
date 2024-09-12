// import { createApp } from 'vue'
// import App from './App.vue'

// createApp(App).mount('#app')

import { createApp } from 'vue';
import App from './app.vue';
import { createRouter, createWebHistory } from 'vue-router';
import HomeView from './views/homepage.vue';
import SignUpForm from './components/SignUpForm.vue';
import SignInForm from './components/SignInForm.vue';
import DrawingPage from './components/DrawingPage.vue';

const routes = [
  { path: '/', component: HomeView },
  { path: '/signup', component: SignUpForm },
  { path: '/signin', component: SignInForm },
  { path: '/drawing', component: DrawingPage },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

createApp(App).use(router).mount('#app');
