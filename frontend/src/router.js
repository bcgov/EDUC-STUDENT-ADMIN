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
import { REQUEST_TYPES, PAGE_TITLES } from './utils/constants';
import authStore from './store/modules/auth';
import ErrorPage from './components/ErrorPage';
import store from './store/index';
import RouterView from './components/RouterView';
import BackendSessionExpired from '@/components/BackendSessionExpired';
import UnAuthorizedPage from './components/UnAuthorizedPage';
import PenMatch from './components/penreg/PenMatch';
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
        pageTitle: PAGE_TITLES.DASHBOARD,
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
            pageTitle: PAGE_TITLES.GMP,
            requiresAuth: true,
            role: 'isValidGMPUser'
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
            pageTitle: PAGE_TITLES.GMP_DETAILS,
            requiresAuth: true,
            role: 'isValidGMPUser'
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
            label: REQUEST_TYPES.studentRequest.searchLabel,
            penName: REQUEST_TYPES.studentRequest.penName
          },
          meta: {
            pageTitle: PAGE_TITLES.UMP,
            requiresAuth: true,
            role: 'isValidUMPUser'
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
            pageTitle: PAGE_TITLES.UMP_DETAILS,
            requiresAuth: true,
            role: 'isValidUMPUser'
          }
        }
      ]
    },
    {
      path: '/studentSearch/basic',
      name: 'basicSearch',
      component: StudentSearchDisplay,
      props: (route) => ({ searchType: REQUEST_TYPES.studentSearch.type.basic, initialPenSearch: route.query.pen }),
      meta: {
        pageTitle: PAGE_TITLES.STUDENT_SEARCH,
        requiresAuth: true,
        role: 'isValidStudentSearchUser'
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
        pageTitle: PAGE_TITLES.STUDENT_SEARCH,
        requiresAuth: true,
        role: 'isValidStudentSearchUser'
      }
    },
    {
      path: '/student/:studentID',
      name: REQUEST_TYPES.student.label,
      component: StudentDetail,
      props: true,
      meta: {
        pageTitle: PAGE_TITLES.STUDENT_DETAILS,
        requiresAuth: true,
        role: 'isValidStudentSearchUser'
      }
    },
    {
      path: '/penRequestBatch',
      name: 'penRequestBatch',
      component: PenRequestBatchDisplay,
      props: (route) => ({ schoolGroup: route.query.schoolGroup }),
      meta: {
        pageTitle: PAGE_TITLES.PEN_REQ_FILES,
        requiresAuth: true,
        role: 'isValidPenRequestBatchUser'
      }
    },
    {
      path: '/penMatch',
      name: 'penMatch',
      component: PenMatch,
      meta: {
        pageTitle: PAGE_TITLES.PEN_MATCH,
        requiresAuth: true,
        role: 'isValidStudentSearchUser'
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
      path: '/unauthorized-page',
      name: 'unauthorized-page',
      component: UnAuthorizedPage,
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
      },
    },
    {
      path: '/token-expired',
      name: 'backend-session-expired',
      component: BackendSessionExpired
    }
  ]
});

router.beforeEach((to, _from, next) => {
  function validateAndExecute(nextRouteInError) {
    store.dispatch('auth/getJwtToken').then(() => {
      if (!authStore.state.isAuthenticated) {
        next(nextRouteInError);
      } else {
        store.dispatch('auth/getUserInfo').then(() => {
          if (!authStore.state.isAuthorizedUser) {
            next('unauthorized');
          } else if (to.meta.role && !authStore.state[`${to.meta.role}`]) {
            next('unauthorized-page');
          } else {
            next();
          }
        }).catch(() => {
          console.log('Unable to get user info');
          next('error');
        });
      }
    }).catch(() => {
      console.log('Unable to get token');
      next(nextRouteInError);
    });
  }
  // this section is to set page title in vue store
  if (to && to.meta) {
    store.commit('app/setPageTitle',to.meta.pageTitle);
  } else {
    store.commit('app/setPageTitle','');
  }

  // this section is to handle the backend session expiry, where frontend vue session is still valid.
  if (to.meta.requiresAuth && authStore.state.isAuthenticated) {
    validateAndExecute('/token-expired');
  }else if (to.meta.requiresAuth) {
    validateAndExecute('login');
  }
  else{
    next();
  }
});

export default router;
