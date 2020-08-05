import Vue from 'vue';
import VueRouter from 'vue-router';

import Home from './components/Home.vue';
import moment from 'moment';
import Login from './components/Login';
import Logout from './components/Logout';
import SessionExpired from './components/SessionExpired';
import RequestsDisplay from './components/RequestsDisplay';
import StudentDetail from './components/penreg/student/StudentDetail';
import StudentSearchDisplay from './components/penreg/student-search/StudentSearchDisplay';
import PenRequestDetail from './components/gmp/PenRequestDetail';

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
      path: '/:requestType/display',
      name: 'display',
      component: RequestsDisplay,
      props: function (route) {
        const requestType = route.params.requestType;
        const label = requestType==='penRequest'?'Select PEN request statuses to view':'Select UMP request statuses to view';
        return {
          requestType: requestType,
          label: label
        };
      }
    },
    {
      path: '/studentSearch/:searchType',
      name: 'basic search',
      component: StudentSearchDisplay,
      props: true
    },
    {
      path: '/student/:studentID',
      name: 'student detail',
      component: StudentDetail,
      props: true
    },
    {
      path: '/gmp/:request',
      name: 'GMP detail',
      component: PenRequestDetail,
      props: true
    },
    {
      path: '/login',
      name: 'login',
      component: Login
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
