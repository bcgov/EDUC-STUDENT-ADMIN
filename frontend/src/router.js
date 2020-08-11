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
import PenRequestBatchDisplay from './components/penreg/penrequest-batch/PenRequestBatchDisplay';
import UnAuthorized from './components/UnAuthorized';
import { REQUEST_TYPES } from './utils/constants';
import authStore from './store/modules/auth';
import ErrorPage from './components/ErrorPage';
import store from './store/index';
import RouterView from './components/RouterView';

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
      component: RouterView,
      children: [
        {
          path: '',
          name: REQUEST_TYPES.penRequest.label,
          component: RequestsDisplay,
          props: {
            requestType: REQUEST_TYPES.penRequest.name,
            label: REQUEST_TYPES.penRequest.searchLabel
          },
          meta: {
            requiresAuth: true
          },
          beforeEnter(to, from, next) {
            store.commit('app/setRequestType',REQUEST_TYPES.penRequest.name);
            next();
          }
        },
        {
          path: ':requestId',
          name: 'GMP detail',
          component: PenRequestDetail,
          props: true,
          meta: {
            requiresAuth: true
          }
        },
      ]
    },
    {
      path: '/ump',
      component: RouterView,
      children: [
        {
          path: '',
          name: REQUEST_TYPES.studentRequest.label,
          component: RequestsDisplay,
          props: {
            requestType: REQUEST_TYPES.studentRequest.name,
            label: REQUEST_TYPES.studentRequest.searchLabel
          },
          meta: {
            requiresAuth: true
          },
          beforeEnter(to, from, next) {
            store.commit('app/setRequestType',REQUEST_TYPES.studentRequest.name);
            next();
          }
        },
        {
          path: ':requestId',
          name: 'UMP detail',
          component: StudentRequestDetail,
          props: true,
          meta: {
            requiresAuth: true
          }
        }
      ]
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
      path: '/penRequestBatch',
      name: 'penRequestBatch',
      component: PenRequestBatchDisplay,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: {
        requiresAuth: false
      }
    },
    {
      path: '/logout',
      name: 'logout',
      component: Logout,
      meta: {
        requiresAuth: false
      }
    },
    {
      path: '/session-expired',
      name: 'session-expired',
      component: SessionExpired,
      meta: {
        requiresAuth: false
      }
    },
    {
      path: '/unauthorized',
      name: 'unauthorized',
      component: UnAuthorized,
      meta: {
        requiresAuth: false
      }
    },
    {
      path: '/error',
      name: 'error',
      component: ErrorPage,
      meta: {
        requiresAuth: false
      }
    },
    {
      path: '*',
      name: 'notfound',
      redirect: '/',
      meta: {
        requiresAuth: true
      }
    }
  ]
});

router.beforeEach((to, _from, next) => {
  if (to.meta.requiresAuth) {
    store.dispatch('auth/getJwtToken').then(() => {
      if (!authStore.state.isAuthenticated) {
        next('login');
      } else if (!authStore.state.isAuthorizedUser) {
        next('unauthorized');
      } else {
        store.dispatch('auth/getUserInfo').then(() => {
          next();
        }).catch(() => {
          console.log('Unable to get user info');
          next('error');
        });
      }
    }).catch(() => {
      console.log('Unable to get token');
      next('login');
    });
  }
  else{
    next();
  }
});

export default router;
