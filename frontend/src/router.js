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
import PrbStudentListDisplay from './components/penreg/penrequest-batch/PrbStudentListDisplay';
import PrbStudentDetailsDisplay from './components/penreg/penrequest-batch/PrbStudentDetailsDisplay';
import ArchivedRequestBatchDisplay from './components/penreg/penrequest-batch/ArchivedRequestBatchDisplay';
import LoadFailedBatchList from './components/penreg/penrequest-batch/LoadFailedBatchList';
import HeldRequestBatchDisplay from './components/penreg/penrequest-batch/HeldRequestBatchDisplay';
import CreateNewPEN from './components/CreateNewPEN';
import UnAuthorized from './components/UnAuthorized';
import { REQUEST_TYPES, PAGE_TITLES } from './utils/constants';
import authStore from './store/modules/auth';
import ErrorPage from './components/ErrorPage';
import store from './store/index';
import RouterView from './components/RouterView';
import BackendSessionExpired from '@/components/BackendSessionExpired';
import UnAuthorizedPage from './components/UnAuthorizedPage';
import CompareStudents from './components/CompareStudents';
import PenCoordinatorsDisplay from './components/penreg/coordinator/PenCoordinatorsDisplay';
import MacrosDisplay from './components/admin/MacrosDisplay';
import NominalRoll from './components/admin/NominalRoll';
import NewPENs from './components/admin/NewPENs';
import GMPStatsLanding from '@/components/admin/stats/GMPStatsLanding';
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
      path: '/compare',
      name: 'compare',
      component: CompareStudents,
      meta: {
        pageTitle: PAGE_TITLES.COMPARE_STUDENTS,
        requiresAuth: true,
        role: 'PROCESS_STUDENT_ROLE'
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
            role: 'VIEW_GMP_REQUESTS_ROLE'
          },
        },
        {
          path: ':requestId',
          name: 'GMP detail',
          component: PenRequestDetail,
          props: true,
          meta: {
            pageTitle: PAGE_TITLES.GMP_DETAILS,
            requiresAuth: true,
            role: 'VIEW_GMP_REQUESTS_ROLE'
          }
        },
      ],
      beforeEnter(to, from, next) {
        store.commit('app/setRequestType',REQUEST_TYPES.penRequest.name);
        next();
      }
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
            role: 'VIEW_UMP_REQUESTS_ROLE'
          },
        },
        {
          path: ':requestId',
          name: 'UMP detail',
          component: StudentRequestDetail,
          props: true,
          meta: {
            pageTitle: PAGE_TITLES.UMP_DETAILS,
            requiresAuth: true,
            role: 'VIEW_UMP_REQUESTS_ROLE'
          }
        }
      ],
      beforeEnter(to, from, next) {
        store.commit('app/setRequestType',REQUEST_TYPES.studentRequest.name);
        next();
      }
    },
    {
      path: '/studentSearch/basic',
      name: 'basicSearch',
      component: StudentSearchDisplay,
      props: (route) => ({ searchType: REQUEST_TYPES.studentSearch.type.advanced, searchParams: {...route.query} }),
      meta: {
        pageTitle: PAGE_TITLES.STUDENT_SEARCH,
        requiresAuth: true,
        role: 'ADVANCED_SEARCH_ROLE',
        saveSearch: true
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
        role: 'ADVANCED_SEARCH_ROLE',
        saveSearch: true
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
        role: 'VIEW_EDIT_PEN_REQUEST_BATCH_FILES_ROLE'
      },
      beforeEnter(to, from, next) {
        if(!from.path.includes('/prb')) {
          store.commit('penRequestBatch/clearPenRequestBatchState');
        }
        next();
      }
    },
    {
      path: '/prbStudentList',
      name: 'prbStudentList',
      component: PrbStudentListDisplay,
      props: (route) => ({ batchIDs: route.query.batchIDs,  statusFilters: route.query.statusFilters}),
      meta: {
        pageTitle: PAGE_TITLES.PEN_REQ_BATCH_STUDENT_LIST,
        requiresAuth: true,
        role: 'VIEW_EDIT_PEN_REQUEST_BATCH_FILES_ROLE'
      },
    },
    {
      path: '/prbStudentDetails/:prbStudentID',
      name: 'prbStudentDetails',
      component: PrbStudentDetailsDisplay,
      props: (route) => ({
        prbStudentID: route.params.prbStudentID,
        archived: String(route.query.archived).toLowerCase() === 'true'
      }),
      meta: {
        pageTitle: PAGE_TITLES.PEN_REQ_BATCH_STUDENT_DETAILS,
        requiresAuth: true,
        role: 'VIEW_EDIT_PEN_REQUEST_BATCH_FILES_ROLE'
      },
    },
    {
      path: '/archivedRequestBatch',
      name: 'archivedRequestBatch',
      component: ArchivedRequestBatchDisplay,
      props: (route) => ({ mincode: route.query.mincode, loadDate: route.query.loadDate }),
      meta: {
        pageTitle: PAGE_TITLES.ARCHIVED_REQ_FILES,
        requiresAuth: true,
        role: 'VIEW_EDIT_PEN_REQUEST_BATCH_FILES_ROLE'
      },
      beforeEnter(to, from, next) {
        if(!from.path.includes('/archivedPrb')) {
          store.commit('archivedRequestBatch/clearPenRequestBatchState');
        }
        next();
      }
    },
    {
      path: '/archivedPrbStudentList',
      name: 'archivedPrbStudentList',
      component: PrbStudentListDisplay,
      props: (route) => ({ batchIDs: route.query.batchIDs, archived: true}),
      meta: {
        pageTitle: PAGE_TITLES.ARCHIVED_REQ_BATCH_STUDENT_LIST,
        requiresAuth: true,
        role: 'VIEW_EDIT_PEN_REQUEST_BATCH_FILES_ROLE'
      },
    },
    {
      path: '/failedRequestBatch',
      name: 'failedRequestBatch',
      component: LoadFailedBatchList,
      meta: {
        pageTitle: PAGE_TITLES.FAILED_REQ_FILES,
        requiresAuth: true,
        role: 'VIEW_EDIT_PEN_REQUEST_BATCH_FILES_ROLE'
      },
    },
    {
      path: '/heldRequestBatch',
      name: 'heldRequestBatch',
      component: HeldRequestBatchDisplay,
      meta: {
        pageTitle: PAGE_TITLES.HELD_REQ_FILES,
        requiresAuth: true,
        role: 'VIEW_EDIT_PEN_REQUEST_BATCH_FILES_ROLE'
      },
    },
    {
      path: '/createNewPEN',
      name: 'createNewPEN',
      component: CreateNewPEN,
      meta: {
        pageTitle: PAGE_TITLES.CREATE_NEW_PEN,
        requiresAuth: true,
        role: 'CREATE_NEW_PEN_ROLE'
      }
    },
    {
      path: '/penCoordinators',
      name: 'penCoordinators',
      component: PenCoordinatorsDisplay,
      meta: {
        pageTitle: PAGE_TITLES.PEN_COORDINATORS,
        requiresAuth: true,
        role: 'VIEW_PEN_COORDINATOR_INFO_ROLE'
      },
    },
    {
      path: '/macros',
      name: 'macros',
      component: MacrosDisplay,
      meta: {
        pageTitle: PAGE_TITLES.MACRO_MANAGEMENT,
        requiresAuth: true,
        role: 'EDIT_MACROS_ROLE'
      },
    },
    {
      path: '/nominalRoll',
      name: 'nominalRoll',
      component: NominalRoll,
      meta: {
        pageTitle: PAGE_TITLES.NOMINAL_ROLL,
        requiresAuth: true,
        role: 'NOMINAL_ROLL_ROLE'
      },
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
    },
    {
      path: '/analytics',
      component: RouterView,
      children: [
        {
          path: 'gmp-stats',
          name: 'analytics-gmp-stats',
          component: GMPStatsLanding,
          meta: {
            pageTitle: PAGE_TITLES.GMP_STATS,
            requiresAuth: true,
            role: 'STAFF_ADMINISTRATION_ADMIN'
          }
        },
        {
          path: 'new-pens',
          name: 'new-pens',
          component: NewPENs,
          meta: {
            pageTitle: PAGE_TITLES.NEW_PENS,
            requiresAuth: true,
            role: 'STAFF_ADMINISTRATION_ADMIN'
          },
        },
      ],
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
          } else if (to.meta.role && !authStore.getters[`${to.meta.role}`]) {
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

  // This section is to clear the search results when users are not on a search page
  if (!to.meta.saveSearch){
    store.commit('studentSearch/clearStudentSearchParams');
    store.commit('studentSearch/clearStudentSearchResults');
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
