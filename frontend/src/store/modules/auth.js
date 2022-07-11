import ApiService from '../../common/apiService';
import AuthService from '../../common/authService';
import { Routes } from '../../utils/constants';

export default {
  namespaced: true,
  state: {
    acronyms: [],
    isAuthenticated: localStorage.getItem('jwtToken') !== null,
    isAuthorizedUser: localStorage.getItem('isAuthorizedUser') !== null,
    userInfo: false,
    isValidGMPUser: localStorage.getItem('isValidGMPUser') !== null,
    isValidGMPAdmin: localStorage.getItem('isValidGMPAdmin') !== null,
    isValidUMPUser: localStorage.getItem('isValidUMPUser') !== null,
    isValidUMPAdmin: localStorage.getItem('isValidUMPAdmin') !== null,
    isValidStudentSearchUser: localStorage.getItem('isValidStudentSearchUser') !== null,
    isValidStudentSearchAdmin: localStorage.getItem('isValidStudentSearchAdmin') !== null,
    isValidPenRequestBatchUser: localStorage.getItem('isValidPenRequestBatchUser') !== null,
    isValidPenRequestBatchAdmin: localStorage.getItem('isValidPenRequestBatchAdmin') !== null,
    isValidStaffAdministrationUser: localStorage.getItem('isValidStaffAdministrationUser') !== null,
    isValidStaffAdministrationAdmin: localStorage.getItem('isValidStaffAdministrationAdmin') !== null,
    isValidNominalRollReadOnly: localStorage.getItem('isValidNominalRollReadOnly') !== null,
    isValidNominalRollAdmin: localStorage.getItem('isValidNominalRollAdmin') !== null,
    isValidNominalRollUser: localStorage.getItem('isValidNominalRollUser') !== null,
    isValidGUMPAnalyticsUser: localStorage.getItem('isValidGUMPAnalyticsUser') !== null,
    isValidPenRequestBatchAnalyticsUser: localStorage.getItem('isValidPenRequestBatchAnalyticsUser') !== null,
    isValidExchangeUser: localStorage.getItem('isValidExchangeUser') !== null,
    isValidEDXAdmin: localStorage.getItem('isValidEDXAdmin') !== null,
    isValidPenTeamRoleUser: localStorage.getItem('isValidPenTeamRoleUser') !== null
  },
  getters: {
    acronyms: state => state.acronyms,
    isAuthenticated: state => state.isAuthenticated,
    jwtToken: () => localStorage.getItem('jwtToken'),
    userInfo: state => state.userInfo,
    ADVANCED_SEARCH_ROLE: state => state.isValidStudentSearchUser,
    VIEW_SLD_HISTORY_ROLE: state => state.isValidStudentSearchUser,
    VIEW_AUDIT_HISTORY_ROLE: state => state.isValidStudentSearchAdmin,
    VIEW_TRANSCRIPT_ROLE: state => state.isValidStudentSearchAdmin,
    EDIT_STUDENT_RECORDS_ROLE: state => state.isValidStudentSearchAdmin,
    PROCESS_STUDENT_ROLE: state => state.isValidStudentSearchAdmin,
    VIEW_PEN_COORDINATOR_INFO_ROLE: state => state.isValidPenRequestBatchAdmin || state.isValidGMPUser || state.isValidUMPUser || state.isValidStudentSearchAdmin || state.isValidStaffAdministrationAdmin  || state.isValidNominalRollAdmin,
    EDIT_PEN_COORDINATOR_INFO_ROLE: state => state.isValidStaffAdministrationAdmin || state.isValidNominalRollAdmin,
    VIEW_GMP_REQUESTS_ROLE: state => state.isValidGMPUser,
    ACTION_GMP_REQUESTS_ROLE: state => state.isValidGMPAdmin,
    VIEW_UMP_REQUESTS_ROLE: state => state.isValidUMPUser,
    ACTION_UMP_REQUESTS_ROLE: state => state.isValidUMPAdmin,
    VIEW_EDIT_PEN_REQUEST_BATCH_FILES_ROLE: state => state.isValidPenRequestBatchAdmin,
    EDIT_MACROS_ROLE: state => state.isValidStaffAdministrationAdmin,
    CREATE_NEW_PEN_ROLE: state => state.isValidStaffAdministrationAdmin,
    NOMINAL_ROLL_READ_ONLY_ROLE: state => state.isValidNominalRollReadOnly,
    NOMINAL_ROLL_ROLE: state => state.isValidNominalRollReadOnly || state.isValidNominalRollUser,
    EDIT_NOMINAL_ROLL_ROLE: state => state.isValidNominalRollAdmin,
    STAFF_ADMINISTRATION_ADMIN: state => state.isValidNominalRollAdmin || state.isValidStaffAdministrationAdmin || state.isValidEDXAdmin, //gives access to admin section of navigation menu
    STUDENT_ANALYTICS_STUDENT_PROFILE: state => state.isValidGUMPAnalyticsUser,
    STUDENT_ANALYTICS_BATCH: state => state.isValidPenRequestBatchAnalyticsUser,
    HAS_STATS_ROLE: state => state.isValidGUMPAnalyticsUser || state.isValidPenRequestBatchAnalyticsUser,
    EXCHANGE_ROLE: state => state.isValidExchangeUser,
    EXCHANGE_ACCESS_ROLE: state => state.isValidEDXAdmin,
    PEN_TEAM_ROLE: state => state.isValidPenTeamRoleUser
  },
  mutations: {
    //sets Json web token and determines whether user is authenticated
    setJwtToken: (state, token = null) => {
      if (token) {
        state.isAuthenticated = true;
        localStorage.setItem('jwtToken', token);
      } else {
        state.isAuthenticated = false;
        localStorage.removeItem('jwtToken');
      }
    },
    setAuthorizedUser: (state, isAdminUser) => {
      if (isAdminUser) {
        state.isAuthorizedUser = true;
        localStorage.setItem('isAuthorizedUser', 'true');
      } else {
        state.isAuthorizedUser = false;
        localStorage.removeItem(('isAuthorizedUser'));
      }
    },
    setGMPUser: (state, isValidGMPUser) => {
      if (isValidGMPUser) {
        state.isValidGMPUser = true;
        localStorage.setItem('isValidGMPUser', 'true');
      } else {
        state.isValidGMPUser = false;
        localStorage.removeItem(('isValidGMPUser'));
      }
    },
    setGMPAdmin: (state, isValidGMPAdmin) => {
      if (isValidGMPAdmin) {
        state.isValidGMPAdmin = true;
        localStorage.setItem('isValidGMPAdmin', 'true');
      } else {
        state.isValidGMPAdmin = false;
        localStorage.removeItem(('isValidGMPAdmin'));
      }
    },
    setUMPUser: (state, isValidUMPUser) => {
      if (isValidUMPUser) {
        state.isValidUMPUser = true;
        localStorage.setItem('isValidUMPUser', 'true');
      } else {
        state.isValidUMPUser = false;
        localStorage.removeItem(('isValidUMPUser'));
      }
    },
    setUMPAdmin: (state, isValidUMPAdmin) => {
      if (isValidUMPAdmin) {
        state.isValidUMPAdmin = true;
        localStorage.setItem('isValidUMPAdmin', 'true');
      } else {
        state.isValidUMPAdmin = false;
        localStorage.removeItem(('isValidUMPAdmin'));
      }
    },
    setStudentSearchUser: (state, isValidStudentSearchUser) => {
      if (isValidStudentSearchUser) {
        state.isValidStudentSearchUser = true;
        localStorage.setItem('isValidStudentSearchUser', 'true');
      } else {
        state.isValidStudentSearchUser = false;
        localStorage.removeItem(('isValidStudentSearchUser'));
      }
    },
    setStudentSearchAdmin: (state, isValidStudentSearchAdmin) => {
      if (isValidStudentSearchAdmin) {
        state.isValidStudentSearchAdmin = true;
        localStorage.setItem('isValidStudentSearchAdmin', 'true');
      } else {
        state.isValidStudentSearchAdmin = false;
        localStorage.removeItem(('isValidStudentSearchAdmin'));
      }
    },
    setStaffAdministrationUser: (state, isValidStaffAdministrationUser) => {
      if (isValidStaffAdministrationUser) {
        state.isValidStaffAdministrationUser = true;
        localStorage.setItem('isValidStaffAdministrationUser', 'true');
      } else {
        state.isValidStaffAdministrationUser = false;
        localStorage.removeItem(('isValidStaffAdministrationUser'));
      }
    },
    setStaffAdministrationAdmin: (state, isValidStaffAdministrationAdmin) => {
      if (isValidStaffAdministrationAdmin) {
        state.isValidStaffAdministrationAdmin = true;
        localStorage.setItem('isValidStaffAdministrationAdmin', 'true');
      } else {
        state.isValidStaffAdministrationAdmin = false;
        localStorage.removeItem(('isValidStaffAdministrationAdmin'));
      }
    },
    penRequestBatchUser: (state, isValidPenRequestBatchUser) => {
      if (isValidPenRequestBatchUser) {
        state.isValidPenRequestBatchUser = true;
        localStorage.setItem('isValidPenRequestBatchUser', 'true');
      } else {
        state.isValidPenRequestBatchUser = false;
        localStorage.removeItem(('isValidPenRequestBatchUser'));
      }
    },
    penRequestBatchAdmin: (state, isValidPenRequestBatchAdmin) => {
      if (isValidPenRequestBatchAdmin) {
        state.isValidPenRequestBatchAdmin = true;
        localStorage.setItem('isValidPenRequestBatchAdmin', 'true');
      } else {
        state.isValidPenRequestBatchAdmin = false;
        localStorage.removeItem(('isValidPenRequestBatchAdmin'));
      }
    },
    setValidNominalRollReadOnly: (state, isValidNominalRollReadOnly) => {
      if (isValidNominalRollReadOnly) {
        state.isValidNominalRollReadOnly = true;
        localStorage.setItem('isValidNominalRollReadOnly', 'true');
      } else {
        state.isValidNominalRollReadOnly = false;
        localStorage.removeItem(('isValidNominalRollReadOnly'));
      }
    },
    setValidNominalRollAdmin: (state, isValidNominalRollAdmin) => {
      if (isValidNominalRollAdmin) {
        state.isValidNominalRollAdmin = true;
        localStorage.setItem('isValidNominalRollAdmin', 'true');
      } else {
        state.isValidNominalRollAdmin = false;
        localStorage.removeItem(('isValidNominalRollAdmin'));
      }
    },
    setValidNominalRollUser: (state, isValidNominalRollUser) => {
      if (isValidNominalRollUser) {
        state.isValidNominalRollUser = true;
        localStorage.setItem('isValidNominalRollUser', 'true');
      } else {
        state.isValidNominalRollUser = false;
        localStorage.removeItem(('isValidNominalRollUser'));
      }
    },
    setGUMPAnalytics: (state, isValidGUMPAnalyticsUser) => {
      if (isValidGUMPAnalyticsUser) {
        state.isValidGUMPAnalyticsUser = true;
        localStorage.setItem('isValidGUMPAnalyticsUser', 'true');
      } else {
        state.isValidGUMPAnalyticsUser = false;
        localStorage.removeItem(('isValidGUMPAnalyticsUser'));
      }
    },
    setPenRequestBatchAnalytics: (state, isValidPenRequestBatchAnalyticsUser) => {
      if (isValidPenRequestBatchAnalyticsUser) {
        state.isValidPenRequestBatchAnalyticsUser = true;
        localStorage.setItem('isValidPenRequestBatchAnalyticsUser', 'true');
      } else {
        state.isValidPenRequestBatchAnalyticsUser = false;
        localStorage.removeItem(('isValidPenRequestBatchAnalyticsUser'));
      }
    },
    setExchangeUser: (state, isValidExchangeUser) => {
      if (isValidExchangeUser) {
        state.isValidExchangeUser = true;
        localStorage.setItem('isValidExchangeUser', 'true');
      } else {
        state.isValidExchangeUser = false;
        localStorage.removeItem(('isValidExchangeUser'));
      }
    },
    setEDXAdmin: (state, isValidEDXAdmin) => {
      if (isValidEDXAdmin) {
        state.isValidEDXAdmin = true;
        localStorage.setItem('isValidEDXAdmin', 'true');
      } else {
        state.isValidEDXAdmin = false;
        localStorage.removeItem(('isValidEDXAdmin'));
      }
    },
    setIsValidPenTeamRoleUser: (state, isValidPenTeamRoleUser) => {
      if (isValidPenTeamRoleUser) {
        state.isValidPenTeamRoleUser = true;
        localStorage.setItem('isValidPenTeamRoleUser', 'true');
      } else {
        state.isValidPenTeamRoleUser = false;
        localStorage.removeItem('isValidPenTeamRoleUser');
      }
    },
    setUserInfo: (state, userInf) => {
      if (userInf) {
        state.userInfo = userInf;
      } else {
        state.userInfo = null;
      }
    },

    //sets the token required for refreshing expired json web tokens
    logoutState: (state) => {
      localStorage.removeItem('jwtToken');
      state.userInfo = false;
      state.isAuthenticated = false;
    }
  },
  actions: {

    async getUserInfo(context) {
      if(localStorage.getItem('jwtToken')) {
        await ApiService.apiAxios
          .get(Routes.USER)
          .then(response => {
            context.commit('setUserInfo', response.data);
          })
          .catch((e) => {
            throw e;
          });
      }
    },

    //retrieves the json web token from local storage. If not in local storage, retrieves it from API
    async getJwtToken(context) {
      try {
        if (context.getters.isAuthenticated && !!context.getters.jwtToken) {
          const response = await AuthService.refreshAuthToken(context.getters.jwtToken);
          setAuthorizations(context, response);
        } else {
          const response = await AuthService.getAuthToken();
          setAuthorizations(context, response);
        }
      } catch (e) {
        // Remove tokens from localStorage and update state
        context.commit('setJwtToken');
        throw e;
      }
    },
  }
};

function setAuthorizations(context, response) {
  if (response.jwtFrontend) {
    context.commit('setJwtToken', response.jwtFrontend);
  }
  context.commit('setAuthorizedUser', response.isAuthorizedUser);
  context.commit('setGMPUser', response.isValidGMPUser);
  context.commit('setGMPAdmin', response.isValidGMPAdmin);
  context.commit('setUMPUser', response.isValidUMPUser);
  context.commit('setUMPAdmin', response.isValidUMPAdmin);
  context.commit('setStudentSearchUser', response.isValidStudentSearchUser);
  context.commit('setStudentSearchAdmin', response.isValidStudentSearchAdmin);
  context.commit('penRequestBatchUser', response.isValidPenRequestBatchUser);
  context.commit('penRequestBatchAdmin', response.isValidPenRequestBatchAdmin);
  context.commit('setStaffAdministrationUser', response.isValidStaffAdministrationUser);
  context.commit('setStaffAdministrationAdmin', response.isValidStaffAdministrationAdmin);
  context.commit('setValidNominalRollReadOnly', response.isValidNominalRollReadOnlyUser);
  context.commit('setValidNominalRollUser', response.isValidNominalRollUser);
  context.commit('setValidNominalRollAdmin', response.isValidNominalRollAdmin);
  context.commit('setGUMPAnalytics', response.isValidGUMPAnalyticsUser);
  context.commit('setPenRequestBatchAnalytics', response.isValidPenRequestBatchAnalyticsUser);
  context.commit('setExchangeUser', response.isValidExchangeUser);
  context.commit('setEDXAdmin', response.isValidEDXAdmin);
  context.commit('setIsValidPenTeamRoleUser', response.isValidPenTeamRoleUser);
  ApiService.setAuthHeader(response.jwtFrontend);
}
