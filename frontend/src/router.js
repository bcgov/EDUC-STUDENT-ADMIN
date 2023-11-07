import {createRouter, createWebHistory} from 'vue-router';
import Home from '@/components/Home.vue';
import Login from '@/components/Login.vue';
import Logout from '@/components/Logout.vue';
import SessionExpired from '@/components/SessionExpired.vue';
import RequestsDisplay from '@/components/RequestsDisplay.vue';
import StudentDetail from '@/components/penreg/student/StudentDetail.vue';
import StudentSearchDisplay from '@/components/penreg/student-search/StudentSearchDisplay.vue';
import PenRequestDetail from '@/components/gmp/PenRequestDetail.vue';
import StudentRequestDetail from '@/components/ump/StudentRequestDetail.vue';
import PenRequestBatchDisplay from '@/components/penreg/penrequest-batch/PenRequestBatchDisplay.vue';
import PrbStudentListDisplay from '@/components/penreg/penrequest-batch/PrbStudentListDisplay.vue';
import PrbStudentDetailsDisplay from '@/components/penreg/penrequest-batch/PrbStudentDetailsDisplay.vue';
import ArchivedRequestBatchDisplay from '@/components/penreg/penrequest-batch/ArchivedRequestBatchDisplay.vue';
import LoadFailedBatchList from '@/components/penreg/penrequest-batch/LoadFailedBatchList.vue';
import HeldRequestBatchDisplay from '@/components/penreg/penrequest-batch/HeldRequestBatchDisplay.vue';
import ExchangePage from '@/components/secure-message/ExchangePage.vue';
import UnAuthorized from '@/components/UnAuthorized.vue';
import { REQUEST_TYPES, PAGE_TITLES } from '@/utils/constants';
import {authStore} from './store/modules/auth';
import {studentSearchStore} from './store/modules/studentSearch';
import {appStore} from './store/modules/app';
import {penRequestBatchStore} from './store/modules/penRequestBatch';
import {archivedRequestBatchStore} from './store/modules/archivedRequestBatch';
import ErrorPage from '@/components/ErrorPage.vue';
import RouterView from '@/components/RouterView.vue';
import BackendSessionExpired from '@/components/BackendSessionExpired.vue';
import UnAuthorizedPage from '@/components/UnAuthorizedPage.vue';
import CompareStudents from '@/components/CompareStudents.vue';
import StudentRegistrationContactsDisplay from '@/components/penreg/student-registration/StudentRegistrationContactsDisplay.vue';
import MacrosDisplay from '@/components/admin/MacrosDisplay.vue';
import NominalRoll from '@/components/nominal-roll/NominalRoll.vue';
import NomRollStudentListDisplay from '@/components/nominal-roll/NomRollStudentListDisplay.vue';
import NomRollStudentDetailsDisplay from '@/components/nominal-roll/NomRollStudentDetailsDisplay.vue';
import StatsDashboard from '@/components/admin/stats/StatsDashboard.vue';
import NewPENs from '@/components/admin/stats/NewPENs.vue';
import GUMPStatsLanding from '@/components/admin/stats/GUMPStatsLanding.vue';
import Merges from '@/components/admin/stats/Merges.vue';
import NewMessagePage from '@/components/secure-message/NewMessagePage.vue';
import MessageDisplay from '@/components/secure-message/MessageDisplay.vue';
import AccessUsersPage from '@/components/secure-message/AccessSchoolUsersPage.vue';
import AccessDistrictUsersPage from '@/components/secure-message/AccessDistrictUsersPage.vue';
import InstituteAccessPage from '@/components/secure-message/InstituteAccessPage.vue';
import DistrictList from '@/components/institute/DistrictList.vue';
import DistrictDetailsPage from '@/components/institute/DistrictDetails.vue';
import SchoolListPage from '@/components/institute/SchoolList.vue';
import SchoolDetails from '@/components/institute/SchoolDetails.vue';
import AuthoritiesListPage from '@/components/institute/AuthoritiesList.vue';
import AuthorityDetailsPage from '@/components/institute/AuthorityDetails.vue';
import { PERMISSION, hasRequiredPermission } from '@/utils/constants/Permission';

const router = createRouter({
  history: createWebHistory(),
  base: import.meta.env.BASE_URL,
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
      beforeEnter(_to, _from, next) {
        const apStore = appStore();
        apStore.setRequestType(REQUEST_TYPES.penRequest.name);
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
      beforeEnter(_to, _from, next) {
        const apStore = appStore();
        apStore.setRequestType(REQUEST_TYPES.studentRequest.name);
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
      beforeEnter(_to, from, next) {
        if(!from.path.includes('/prb')) {
          const batchStore = penRequestBatchStore();
          batchStore.clearPenRequestBatchState();
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
      beforeEnter(_to, from, next) {
        if(!from.path.includes('/archivedPrb') && !from.path.includes('/prb')) {
          const batchStore = archivedRequestBatchStore();
          batchStore.clearPenRequestBatchState();
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
      path: '/studentRegistrationContacts',
      name: 'studentRegistrationContacts',
      component: StudentRegistrationContactsDisplay,
      meta: {
        pageTitle: PAGE_TITLES.PEN_COORDINATORS,
        requiresAuth: true,
        permission: PERMISSION.VIEW_REGISTRATION_CONTACTS_PERMISSION
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
      path: '/nominal-roll',
      component: RouterView,
      children: [
        {
          path: '',
          name: 'nominal-roll',
          component: NominalRoll,
          meta: {
            pageTitle: PAGE_TITLES.NOMINAL_ROLL,
            requiresAuth: true,
            role: 'NOMINAL_ROLL_ROLE'
          },
        },
        {
          path: 'list',
          name: 'nrStudentList',
          component: NomRollStudentListDisplay,
          props: (route) => ({ statusFilters: route.query.statusFilters }),
          meta: {
            pageTitle: PAGE_TITLES.NOMINAL_ROLL_STUDENT_LIST,
            requiresAuth: true,
            role: 'NOMINAL_ROLL_ROLE'
          },
        },
        {
          path: ':nrStudentID',
          name: 'nrStudentDetails',
          component: NomRollStudentDetailsDisplay,
          props: (route) => ({
            nomRollStudentID: route.params.nrStudentID,
          }),
          meta: {
            pageTitle: PAGE_TITLES.NOMINAL_ROLL_STUDENT_DETAILS,
            requiresAuth: true,
            role: 'NOMINAL_ROLL_ROLE'
          },
        }
      ]
    },
    {
      path: '/edx',
      component: RouterView,
      children: [
        {
          path: 'exchange',
          component: RouterView,
          meta: {
            requiresAuth: true
          },
          children: [
            {
              path: 'PEN_TEAM_INBOX',
              name: 'exchange_inbox_MANAGE_EXCHANGE_PEN_INBOX_PERMISSION',
              component: ExchangePage,
              props: {
                ministryOwnershipGroupRoleID: 'MANAGE_EXCHANGE_PEN_INBOX_PERMISSION'
              },
              meta: {
                pageTitle: PAGE_TITLES.EXCHANGE,
                requiresAuth: true,
                permission: PERMISSION.MANAGE_EXCHANGE_PEN_INBOX_PERMISSION
              }
            }
          ]
        },
        {
          path: 'exchange/:secureExchangeID/:ministryOwnershipGroupRoleID',
          name: 'viewExchange',
          component: MessageDisplay,
          props: true,
          meta: {
            pageTitle: PAGE_TITLES.VIEW_EXCHANGE,
            requiresAuth: true,
            permission: PERMISSION.MANAGE_EXCHANGE_INBOX_PERMISSION
          }
        },
        {
          path: 'newExchange',
          name: 'newExchange',
          component: NewMessagePage,
          meta: {
            pageTitle: PAGE_TITLES.NEW_EXCHANGE,
            requiresAuth: true,
            permission: PERMISSION.MANAGE_EXCHANGE_INBOX_PERMISSION
          }
        },
        {
          path: 'exchange/access',
          name: 'exchangeAccess',
          component: InstituteAccessPage,
          props: {
            instituteTypeCode : 'SCHOOL',
            instituteTypeLabel : 'School'
          },
          meta: {
            pageTitle: PAGE_TITLES.EXCHANGE_ACCESS,
            requiresAuth: true,
            permission: PERMISSION.MANAGE_EDX_SCHOOL_USERS_PERMISSION
          }
        },
        {
          path: 'exchange/access/school/:schoolID',
          name: 'exchangeAccessUsers',
          component: AccessUsersPage,
          props: true,
          meta: {
            pageTitle: PAGE_TITLES.EXCHANGE_USERS,
            requiresAuth: true,
            permission: PERMISSION.MANAGE_EDX_SCHOOL_USERS_PERMISSION
          }
        },
        {
          path: 'exchange/district/access',
          name: 'exchangeDistrictAccess',
          component: InstituteAccessPage,
          props: {
            instituteTypeLabel: 'District',
            instituteTypeCode: 'DISTRICT'
          },
          meta: {
            pageTitle: PAGE_TITLES.EDX_DISTRICT_ACCESS,
            requiresAuth: true,
            permission: PERMISSION.MANAGE_EDX_DISTRICT_USERS_PERMISSION
          }
        },
        {
          path: 'exchange/access/district/:districtId',
          name: 'exchangeAccessDistrictUsers',
          component: AccessDistrictUsersPage,
          props: true,
          meta: {
            pageTitle: PAGE_TITLES.EDX_DISTRICT_ACCESS,
            requiresAuth: true,
            permission: PERMISSION.MANAGE_EDX_DISTRICT_USERS_PERMISSION
          }
        }
      ]
    },
    {
      path: '/institute',
      component: RouterView,
      children: [
        {
          path: 'district',
          name: 'instituteDistrict',
          component: DistrictList,
          meta: {
            pageTitle: PAGE_TITLES.DISTRICT_LIST,
            requiresAuth: true,
            permission: PERMISSION.VIEW_DISTRICT_PERMISSION
          },
        },
        {
          path: '/district/:districtID',
          name: 'districtDetails',
          props: true,
          component: DistrictDetailsPage,
          meta: {
            pageTitle: PAGE_TITLES.DISTRICT_DETAILS,
            requiresAuth: true,
            permission: PERMISSION.VIEW_DISTRICT_PERMISSION
          }
        },
        {
          path: 'school',
          name: 'instituteSchoolList',
          component: SchoolListPage,
          meta: {
            pageTitle: PAGE_TITLES.SCHOOL_LIST,
            requiresAuth: true,
            permission: PERMISSION.VIEW_SCHOOL_PERMISSION
          },
        },
        {
          path: 'school/:schoolID/details',
          name: 'schoolDetails',
          props: true,
          component: SchoolDetails,
          meta: {
            pageTitle: PAGE_TITLES.SCHOOL_DETAILS,
            requiresAuth: true,
            permission: PERMISSION.VIEW_SCHOOL_PERMISSION
          },
        },
        {
          path: 'authority',
          name: 'instituteAuthoritiesList',
          component: AuthoritiesListPage,
          meta: {
            pageTitle: PAGE_TITLES.AUTHORITIES_LIST,
            requiresAuth: true,
            permission: PERMISSION.VIEW_AUTHORITY_PERMISSION
          },
        }
      ]
    },
    {
      path: '/authority/:authorityID',
      name: 'authorityDetails',
      props: true,
      component: AuthorityDetailsPage,
      meta: {
        pageTitle: PAGE_TITLES.AUTHORITY_DETAILS,
        requiresAuth: true,
        permission: PERMISSION.VIEW_AUTHORITY_PERMISSION
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
      path: '/:catchAll(.*)',
      name: 'notfound',
      redirect: '/',
      meta: {
        requiresAuth: true
      }
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
          path: '',
          name: 'stats-dashboard',
          component: StatsDashboard,
          meta: {
            pageTitle: PAGE_TITLES.STATS_DASHBOARD,
            requiresAuth: true,
            role: 'HAS_STATS_ROLE'
          }
        },
        {
          path: 'gmp-stats',
          name: 'analytics-gmp-stats',
          component: GUMPStatsLanding,
          props: {
            requestType: 'gmp',
          },
          meta: {
            pageTitle: PAGE_TITLES.GMP_STATS,
            requiresAuth: true,
            role: 'STUDENT_ANALYTICS_STUDENT_PROFILE'
          }
        },
        {
          path: 'ump-stats',
          name: 'analytics-ump-stats',
          component: GUMPStatsLanding,
          props: {
            requestType: 'ump',
          },
          meta: {
            pageTitle: PAGE_TITLES.UMP_STATS,
            requiresAuth: true,
            role: 'STUDENT_ANALYTICS_STUDENT_PROFILE'
          }
        },
        {
          path: 'new-pens',
          name: 'new-pens',
          component: NewPENs,
          meta: {
            pageTitle: PAGE_TITLES.NEW_PENS,
            requiresAuth: true,
            role: 'STUDENT_ANALYTICS_BATCH'
          },
        },
        {
          path: 'merges',
          name: 'merges',
          component: Merges,
          meta: {
            pageTitle: PAGE_TITLES.VIEW_MERGES,
            requiresAuth: true,
            role: 'STUDENT_ANALYTICS_BATCH'
          },
        },
      ],
    }
  ]
});

router.beforeEach((to, _from, next) => {
  // this section is to set page title in vue store
  if (to && to.meta) {
    const apStore = appStore();
    apStore.setPageTitle(to.meta.pageTitle);
  } else {
    const apStore = appStore();
    apStore.setPageTitle('');
  }

  // This section is to clear the search results when users are not on a search page
  if (!to.meta.saveSearch){
    const studSearchStore = studentSearchStore();
    studSearchStore.clearStudentSearchParams();
    studSearchStore.clearStudentSearchResults();
  }
  const aStore = authStore();
  // this section is to handle the backend session expiry, where frontend vue session is still valid.
  if (to.meta.requiresAuth && aStore.isAuthenticated) {
    validateAndExecute('/token-expired', to);
  }else if (to.meta.requiresAuth) {
    validateAndExecute('login', to);
  }
  else{
    next();
  }

  function validateAndExecute(nextRouteInError, to) {
    const aStore = authStore();
    aStore.getJwtToken().then(() => {
      if (!aStore.isAuthenticated) {
        next(nextRouteInError);
        return;
      }
      if (!to.meta.role && !to.meta.permission) {
        next();
        return;
      }
      aStore.getUserInfo().then(() => {
        if (!aStore.isAuthorizedUser) {
          next('/unauthorized');
          return;
        }
        const hasRole = Object.prototype.hasOwnProperty.call(aStore, to.meta.role) && aStore[to.meta.role];
        const hasPermission = hasRequiredPermission(aStore.userInfo, to.meta.permission);
        if (!hasRole && !hasPermission) {
          next('/unauthorized-page');
          return;
        }
        next();
      }).catch((e) => {
        console.log('Unable to get user info: ' + e);
        next('error');
      });
    }).catch(() => {
      console.log('Unable to get token');
      next(nextRouteInError);
    });
  }
});

export default router;
