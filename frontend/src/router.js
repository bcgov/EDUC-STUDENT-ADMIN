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
import UnAuthorized from './components/UnAuthorized';
import { REQUEST_TYPES } from './utils/constants';
import authStore from './store/modules/auth';
import store from './store/index';

Vue.prototype.moment = moment;

Vue.use(VueRouter);

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/gmp',
      name: REQUEST_TYPES.penRequest.label,
      component: RequestsDisplay,
      props: {
        requestType: REQUEST_TYPES.penRequest.name,
        label: REQUEST_TYPES.penRequest.searchLabel
      },
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/ump',
      name: REQUEST_TYPES.studentRequest.label,
      component: RequestsDisplay,
      props: {
        requestType: REQUEST_TYPES.studentRequest.name,
        label: REQUEST_TYPES.studentRequest.searchLabel
      },
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/studentSearch/basic',
      name: 'basicSearch',
      component: StudentSearchDisplay,
      props: {
        searchType: REQUEST_TYPES.studentSearch.type.basic
      },
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/studentSearch/advanced',
      name: 'advancedSearch',
      component: StudentSearchDisplay,
      props: {
        searchType: REQUEST_TYPES.studentSearch.type.advanced
      },
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/student/:studentID',
      name: REQUEST_TYPES.student.label,
      component: StudentDetail,
      props: true,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/gmp/:requestId',
      name: 'GMP detail',
      component: PenRequestDetail,
      props: true,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/ump/:requestId',
      name: 'UMP detail',
      component: StudentRequestDetail,
      props: true,
      meta: {
        requiresAuth: true
      }
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
      path: '/unauthorized',
      name: 'unauthorized',
      component: UnAuthorized
    },
    {
      path: '*',
      name: 'notfound',
      redirect: '/'
    }
  ]
});

router.beforeEach((to, _from, next) => {
  if (to.meta.requiresAuth) {
    store.dispatch('auth/getJwtToken').then(() => {
      store.dispatch('auth/getUserInfo');
      store.dispatch('student/getCodes');

      if (!authStore.state.isAuthenticated) {
        next('login');
      } else if (!authStore.state.isAuthorizedUser) {
        next('unauthorized');
      } else {
        next();
      }
    });
  }
  else{
    next();
  }
});

export default router;
