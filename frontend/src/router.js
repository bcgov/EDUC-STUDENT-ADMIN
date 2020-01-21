import Vue from 'vue';
import VueRouter from 'vue-router';

import Home from '@/components/Home.vue';
import PenRequestDetail from '@/components/PenRequestDetail.vue';
import moment from 'moment';

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
      path: '/penrequestdetail/:id',
      name: 'penrequestdetail',
      component: PenRequestDetail
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
