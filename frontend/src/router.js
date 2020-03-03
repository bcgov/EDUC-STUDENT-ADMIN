import Vue from 'vue';
import VueRouter from 'vue-router';

import Home from './components/Home.vue';
import moment from 'moment';
import Logout from './components/Logout';
import SessionExpired from './components/SessionExpired';

Vue.prototype.moment = moment;

Vue.use(VueRouter);

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/logout',
      name: 'logout',
      component: Logout
    },
    {
      path: '/session-expired',
      name: 'session-expired',
      component: SessionExpired
    },
    {
      path: '*',
      name: 'notfound',
      redirect: '/'
    }
  ]
});

/*router.beforeEach((to, _from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!store.getters.isAuthenticated) {
      next('home');
    }
  }
  else{
    next();
  }
});*/

export default router;
