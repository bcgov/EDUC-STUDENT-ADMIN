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
import StudentRequestDetail from './components/ump/StudentRequestDetail';
import { REQUEST_TYPES } from './utils/constants';

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
      path: '/gmp',
      name: REQUEST_TYPES.penRequest.label,
      component: RequestsDisplay,
      props: {
        requestType: REQUEST_TYPES.penRequest.name,
        label: REQUEST_TYPES.penRequest.searchLabel
      }
    },
    {
      path: '/ump',
      name: REQUEST_TYPES.studentRequest.label,
      component: RequestsDisplay,
      props: {
        requestType: REQUEST_TYPES.studentRequest.name,
        label: REQUEST_TYPES.studentRequest.searchLabel
      }
    },
    {
      path: '/studentSearch/basic',
      name: 'basicSearch',
      component: StudentSearchDisplay,
      props: {
        searchType: REQUEST_TYPES.studentSearch.type.basic
      }
    },
    {
      path: '/studentSearch/advanced',
      name: 'advancedSearch',
      component: StudentSearchDisplay,
      props: {
        searchType: REQUEST_TYPES.studentSearch.type.advanced
      }
    },
    {
      path: '/student/:studentID',
      name: REQUEST_TYPES.student.label,
      component: StudentDetail,
      props: true
    },
    {
      path: '/gmp/:requestId',
      name: 'GMP detail',
      component: PenRequestDetail,
      props: true
    },
    {
      path: '/ump/:requestId',
      name: 'UMP detail',
      component: StudentRequestDetail,
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
