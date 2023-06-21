import ApiService from '@/common/apiService';
import AuthService from '@/common/authService';
import { Routes } from '@/utils/constants';
import {defineStore} from 'pinia';

export const authStore = defineStore('auth', {
  namespaced: true,
  state: () => ({
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
    isValidPenTeamRoleUser: localStorage.getItem('isValidPenTeamRoleUser') !== null,
    isValidDistrictAdmin: localStorage.getItem('isValidDistrictAdmin') !== null,
    isValidSchoolAdmin: localStorage.getItem('isValidSchoolAdmin') !== null,
    isValidIndependentAuthorityAdmin: localStorage.getItem('isValidIndependentAuthorityAdmin') !== null,
    isValidSchoolIndependentAdmin: localStorage.getItem('isValidSchoolIndependentAdmin') !== null
  }),
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
    PEN_TEAM_ROLE: state => state.isValidPenTeamRoleUser,
    DISTRICT_ADMIN_ROLE: state => state.isValidDistrictAdmin,
    SCHOOL_ADMIN_ROLE: state => state.isValidSchoolAdmin,
    SCHOOL_INDEPENDENT_ADMIN_ROLE: state => state.isValidSchoolIndependentAdmin,
    INDEPENDENT_AUTHORITY_ADMIN_ROLE: state => state.isValidIndependentAuthorityAdmin
  },
  actions: {
    //sets Json web token and determines whether user is authenticated
    async setJwtToken(token = null) {
      if (token) {
        this.isAuthenticated = true;
        localStorage.setItem('jwtToken', token);
      } else {
        this.isAuthenticated = false;
        localStorage.removeItem('jwtToken');
      }
    },
    async setAuthorizedUser(isAdminUser){
      if (isAdminUser) {
        this.isAuthorizedUser = true;
        localStorage.setItem('isAuthorizedUser', 'true');
      } else {
        this.isAuthorizedUser = false;
        localStorage.removeItem(('isAuthorizedUser'));
      }
    },
    async setGMPUser(isValidGMPUser) {
      if (isValidGMPUser) {
        this.isValidGMPUser = true;
        localStorage.setItem('isValidGMPUser', 'true');
      } else {
        this.isValidGMPUser = false;
        localStorage.removeItem(('isValidGMPUser'));
      }
    },
    async setGMPAdmin(isValidGMPAdmin) {
      if (isValidGMPAdmin) {
        this.isValidGMPAdmin = true;
        localStorage.setItem('isValidGMPAdmin', 'true');
      } else {
        this.isValidGMPAdmin = false;
        localStorage.removeItem(('isValidGMPAdmin'));
      }
    },
    async setUMPUser(isValidUMPUser) {
      if (isValidUMPUser) {
        this.isValidUMPUser = true;
        localStorage.setItem('isValidUMPUser', 'true');
      } else {
        this.isValidUMPUser = false;
        localStorage.removeItem(('isValidUMPUser'));
      }
    },
    async setUMPAdmin(isValidUMPAdmin) {
      if (isValidUMPAdmin) {
        this.isValidUMPAdmin = true;
        localStorage.setItem('isValidUMPAdmin', 'true');
      } else {
        this.isValidUMPAdmin = false;
        localStorage.removeItem(('isValidUMPAdmin'));
      }
    },
    async setStudentSearchUser(isValidStudentSearchUser) {
      if (isValidStudentSearchUser) {
        this.isValidStudentSearchUser = true;
        localStorage.setItem('isValidStudentSearchUser', 'true');
      } else {
        this.isValidStudentSearchUser = false;
        localStorage.removeItem(('isValidStudentSearchUser'));
      }
    },
    async setStudentSearchAdmin(isValidStudentSearchAdmin) {
      if (isValidStudentSearchAdmin) {
        this.isValidStudentSearchAdmin = true;
        localStorage.setItem('isValidStudentSearchAdmin', 'true');
      } else {
        this.isValidStudentSearchAdmin = false;
        localStorage.removeItem(('isValidStudentSearchAdmin'));
      }
    },
    async setStaffAdministrationUser(isValidStaffAdministrationUser) {
      if (isValidStaffAdministrationUser) {
        this.isValidStaffAdministrationUser = true;
        localStorage.setItem('isValidStaffAdministrationUser', 'true');
      } else {
        this.isValidStaffAdministrationUser = false;
        localStorage.removeItem(('isValidStaffAdministrationUser'));
      }
    },
    async setStaffAdministrationAdmin(isValidStaffAdministrationAdmin) {
      if (isValidStaffAdministrationAdmin) {
        this.isValidStaffAdministrationAdmin = true;
        localStorage.setItem('isValidStaffAdministrationAdmin', 'true');
      } else {
        this.isValidStaffAdministrationAdmin = false;
        localStorage.removeItem(('isValidStaffAdministrationAdmin'));
      }
    },
    async setPenRequestBatchUser(isValidPenRequestBatchUser) {
      if (isValidPenRequestBatchUser) {
        this.isValidPenRequestBatchUser = true;
        localStorage.setItem('isValidPenRequestBatchUser', 'true');
      } else {
        this.isValidPenRequestBatchUser = false;
        localStorage.removeItem(('isValidPenRequestBatchUser'));
      }
    },
    async setPenRequestBatchAdmin(isValidPenRequestBatchAdmin) {
      if (isValidPenRequestBatchAdmin) {
        this.isValidPenRequestBatchAdmin = true;
        localStorage.setItem('isValidPenRequestBatchAdmin', 'true');
      } else {
        this.isValidPenRequestBatchAdmin = false;
        localStorage.removeItem(('isValidPenRequestBatchAdmin'));
      }
    },
    async setValidNominalRollReadOnly(isValidNominalRollReadOnly) {
      if (isValidNominalRollReadOnly) {
        this.isValidNominalRollReadOnly = true;
        localStorage.setItem('isValidNominalRollReadOnly', 'true');
      } else {
        this.isValidNominalRollReadOnly = false;
        localStorage.removeItem(('isValidNominalRollReadOnly'));
      }
    },
    async setValidNominalRollAdmin(isValidNominalRollAdmin) {
      if (isValidNominalRollAdmin) {
        this.isValidNominalRollAdmin = true;
        localStorage.setItem('isValidNominalRollAdmin', 'true');
      } else {
        this.isValidNominalRollAdmin = false;
        localStorage.removeItem(('isValidNominalRollAdmin'));
      }
    },
    async setValidNominalRollUser(isValidNominalRollUser) {
      if (isValidNominalRollUser) {
        this.isValidNominalRollUser = true;
        localStorage.setItem('isValidNominalRollUser', 'true');
      } else {
        this.isValidNominalRollUser = false;
        localStorage.removeItem(('isValidNominalRollUser'));
      }
    },
    async setGUMPAnalytics(isValidGUMPAnalyticsUser) {
      if (isValidGUMPAnalyticsUser) {
        this.isValidGUMPAnalyticsUser = true;
        localStorage.setItem('isValidGUMPAnalyticsUser', 'true');
      } else {
        this.isValidGUMPAnalyticsUser = false;
        localStorage.removeItem(('isValidGUMPAnalyticsUser'));
      }
    },
    async setPenRequestBatchAnalytics(isValidPenRequestBatchAnalyticsUser) {
      if (isValidPenRequestBatchAnalyticsUser) {
        this.isValidPenRequestBatchAnalyticsUser = true;
        localStorage.setItem('isValidPenRequestBatchAnalyticsUser', 'true');
      } else {
        this.isValidPenRequestBatchAnalyticsUser = false;
        localStorage.removeItem(('isValidPenRequestBatchAnalyticsUser'));
      }
    },
    async setExchangeUser(isValidExchangeUser) {
      if (isValidExchangeUser) {
        this.isValidExchangeUser = true;
        localStorage.setItem('isValidExchangeUser', 'true');
      } else {
        this.isValidExchangeUser = false;
        localStorage.removeItem(('isValidExchangeUser'));
      }
    },
    async setEDXAdmin(isValidEDXAdmin) {
      if (isValidEDXAdmin) {
        this.isValidEDXAdmin = true;
        localStorage.setItem('isValidEDXAdmin', 'true');
      } else {
        this.isValidEDXAdmin = false;
        localStorage.removeItem(('isValidEDXAdmin'));
      }
    },
    async setIsValidPenTeamRoleUser(isValidPenTeamRoleUser) {
      if (isValidPenTeamRoleUser) {
        this.isValidPenTeamRoleUser = true;
        localStorage.setItem('isValidPenTeamRoleUser', 'true');
      } else {
        this.isValidPenTeamRoleUser = false;
        localStorage.removeItem('isValidPenTeamRoleUser');
      }
    },
    async setIsValidDistrictAdmin(isValidDistrictAdmin) {
      if (isValidDistrictAdmin) {
        this.isValidDistrictAdmin = true;
        localStorage.setItem('isValidDistrictAdmin', 'true');
      } else {
        this.isValidDistrictAdmin = false;
        localStorage.removeItem('isValidDistrictAdmin');
      }
    },
    async setIsValidSchoolAdmin(isValidSchoolAdmin) {
      if (isValidSchoolAdmin) {
        this.isValidSchoolAdmin = true;
        localStorage.setItem('isValidSchoolAdmin', 'true');
      } else {
        this.isValidSchoolAdmin = false;
        localStorage.removeItem('isValidSchoolAdmin');
      }
    },
    async setIsValidSchoolIndependentAdmin(isValidSchoolIndependentAdmin) {
      if (isValidSchoolIndependentAdmin) {
        this.isValidSchoolIndependentAdmin = true;
        localStorage.setItem('isValidSchoolIndependentAdmin', 'true');
      } else {
        this.isValidSchoolIndependentAdmin = false;
        localStorage.removeItem('isValidSchoolIndependentAdmin');
      }
    },
    async setIsValidIndependentAuthorityAdmin(isValidIndependentAuthorityAdmin) {
      if (isValidIndependentAuthorityAdmin) {
        this.isValidIndependentAuthorityAdmin = true;
        localStorage.setItem('isValidIndependentAuthorityAdmin', 'true');
      } else {
        this.isValidIndependentAuthorityAdmin = false;
        localStorage.removeItem('isValidIndependentAuthorityAdmin');
      }
    },
    async setUserInfo(userInf) {
      if (userInf) {
        this.userInfo = userInf;
      } else {
        this.userInfo = null;
      }
    },
    //sets the token required for refreshing expired json web tokens
    async logoutState() {
      localStorage.removeItem('jwtToken');
      this.userInfo = false;
      this.isAuthenticated = false;
    },
    async getUserInfo() {
      if(localStorage.getItem('jwtToken')) {
        const response = await ApiService.apiAxios.get(Routes.USER);
        await this.setUserInfo(response.data);
      }
    },
    //retrieves the json web token from local storage. If not in local storage, retrieves it from API
    async getJwtToken() {
      try {
        if (this.isAuthenticated && !!this.jwtToken) {
          const response = await AuthService.refreshAuthToken(this.jwtToken);
          await this.setAuthorizations(response);
        } else {
          const response = await AuthService.getAuthToken();
          await this.setAuthorizations(response);
        }
      } catch (e) {
        // Remove tokens from localStorage and update state
        await this.setJwtToken(null);
        throw e;
      }
    },
    async setAuthorizations(response) {
      if (response.jwtFrontend) {
        await this.setJwtToken(response.jwtFrontend);
      }
      await this.setAuthorizedUser(response.isAuthorizedUser);
      await this.setGMPUser(response.isValidGMPUser);
      await this.setGMPAdmin(response.isValidGMPAdmin);
      await this.setUMPUser(response.isValidUMPUser);
      await this.setUMPAdmin(response.isValidUMPAdmin);
      await this.setStudentSearchUser(response.isValidStudentSearchUser);
      await this.setStudentSearchAdmin(response.isValidStudentSearchAdmin);
      await this.setPenRequestBatchUser(response.isValidPenRequestBatchUser);
      await this.setPenRequestBatchAdmin(response.isValidPenRequestBatchAdmin);
      await this.setStaffAdministrationUser(response.isValidStaffAdministrationUser);
      await this.setStaffAdministrationAdmin(response.isValidStaffAdministrationAdmin);
      await this.setValidNominalRollReadOnly(response.isValidNominalRollReadOnly);
      await this.setValidNominalRollUser(response.isValidNominalRollUser);
      await this.setValidNominalRollAdmin(response.isValidNominalRollAdmin);
      await this.setGUMPAnalytics(response.isValidGUMPAnalyticsUser);
      await this.setPenRequestBatchAnalytics(response.isValidPenRequestBatchAnalyticsUser);
      await this.setExchangeUser(response.isValidExchangeUser);
      await this.setEDXAdmin(response.isValidEDXAdmin);
      await this.setIsValidPenTeamRoleUser(response.isValidPenTeamRoleUser);
      await this.setIsValidDistrictAdmin(response.isValidDistrictAdmin);
      await this.setIsValidSchoolAdmin(response.isValidSchoolAdmin);
      await this.setIsValidSchoolIndependentAdmin(response.isValidSchoolIndependentAdmin);
      await this.setIsValidIndependentAuthorityAdmin(response.isValidIndependentAuthorityAdmin);

      ApiService.setAuthHeader(response.jwtFrontend);
    }
  }
});


