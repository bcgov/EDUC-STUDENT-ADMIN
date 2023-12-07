import axios from 'axios';
import {Routes} from '@/utils/constants';
import AuthService from '@/common/authService';

// Buffer concurrent requests while refresh token is being acquired
let failedQueue = [];

function processQueue(error, token = null) {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
}

// Create new non-global axios instance and intercept strategy
const apiAxios = axios.create();
const intercept = apiAxios.interceptors.response.use(config => config, error => {
  const originalRequest = error.config;
  if (error.response.status !== 401) {
    return Promise.reject(error);
  }
  axios.interceptors.response.eject(intercept);
  return new Promise((resolve, reject) => {
    AuthService.refreshAuthToken(localStorage.getItem('jwtToken'))
      .then(response => {
        if (response.jwtFrontend) {
          localStorage.setItem('jwtToken', response.jwtFrontend);
          apiAxios.defaults.headers.common['Authorization'] = `Bearer ${response.jwtFrontend}`;
          originalRequest.headers['Authorization'] = `Bearer ${response.jwtFrontend}`;
        }
        processQueue(null, response.jwtFrontend);
        resolve(axios(originalRequest));
      })
      .catch(e => {
        processQueue(e, null);
        localStorage.removeItem('jwtToken');
        window.location = '/token-expired';
        reject(e);
      });
  });
});

function getCodes(url) {
  return async function getCodesHandler(query) {
    try {
      return await apiAxios.get(url, query);
    } catch (e) {
      console.log(`Failed to get from Nodejs API - ${e}`);
      throw e;
    }
  };
}

export default {
  apiAxios: apiAxios,
  intercept: intercept,
  processQueue,
  failedQueue,

  //Adds required headers to the Auth request
  setAuthHeader(token) {
    if (token) {
      apiAxios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete apiAxios.defaults.headers.common['Authorization'];
    }
  },
  getGenderCodes: getCodes(Routes.student.GENDER_CODE_URL),
  getDemogCodes: getCodes(Routes.student.DEMOG_CODE_URL),
  getStatusCodes: getCodes(Routes.student.STATUS_CODE_URL),
  getGradeCodes: getCodes(Routes.student.GRADE_CODE_URL),
  getDocumentTypeCodesFromStudentApi: getCodes(Routes.student.DOC_TYPE_CODES_URL),
  getPossibleMatchReasonCodes: getCodes(Routes.penMatch.POSSIBLE_MATCH_REASON_CODES),
  getHistoryActivityCodes: getCodes(Routes.student.HISTORY_ACTIVITY_CODE_URL),
  getPenRequestBatchStudentStatusCodes: getCodes(Routes.penRequestBatch.STUDENT_STATUS_CODE_URL),
  getPenRequestBatchStudentInfoMacroCodes: getCodes(Routes.penRequestBatch.STUDENT_INFO_MACROS_URL),
  getPrbValidationFieldCodes: getCodes(Routes.penRequestBatch.PRB_VALIDATION_FIELD_CODE_URL),
  getPrbValidationIssueSeverityCodes: getCodes(Routes.penRequestBatch.PRB_VALIDATION_ISSUE_SEVERITY_CODE_URL),
  getPrbValidationIssueTypeCodes: getCodes(Routes.penRequestBatch.PRB_VALIDATION_ISSUE_TYPE_CODE_URL),
  getAllSchools: getCodes(Routes.cache.SCHOOL_DATA_URL),
  getActiveSchools: getCodes(`${Routes.cache.SCHOOL_DATA_URL}?active=true`),
  getActiveDistricts: getCodes(`${Routes.cache.DISTRICT_DATA_URL}?active=true`),
  getSchools:getCodes(Routes.cache.SCHOOL_DATA_URL),
  getDistricts:getCodes(Routes.cache.DISTRICT_DATA_URL),
  getAuthorities:getCodes(Routes.cache.AUTHORITY_DATA_URL),
  getActiveAuthorities:getCodes(`${Routes.cache.AUTHORITY_DATA_URL}?active=true`),
  getFedProvSchoolCodes: getCodes(`${Routes.SCHOOL_DATA_URL}/fedProvSchoolCodes`),
  getExchangeStatuses: getCodes(`${Routes.edx.STATUSES_URL}`),
  getMinistryTeams: getCodes(`${Routes.edx.USERS_URL}/ministryTeams`),
  getValidSchoolIDsForMessaging: getCodes(Routes.edx.VALID_USERS_FOR_MESSAGING),
  getValidDistrictIDsForMessaging: getCodes(Routes.edx.VALID_DISTRICT_USERS_FOR_MESSAGING),
  getEdxRoles: getCodes(`${Routes.edx.USERS_URL}/roles`),
  getFileRequirements: getCodes(Routes.edx.EXCHANGE_FILE_REQUIREMENTS_URL),
  getFacilityTypeCodes: getCodes(Routes.cache.FACILITY_TYPES_URL),
  getSchoolCategoryTypeCodes: getCodes(Routes.cache.SCHOOL_CATEGORY_TYPES_URL),
  getSchoolOrganizationTypeCodes: getCodes(Routes.cache.SCHOOL_ORGANIZATION_TYPES_URL),
  getSchoolReportingRequirementTypeCodes: getCodes(
    Routes.cache.SCHOOL_REPORTING_REQUIREMENT_TYPES_URL
  ),
  getSchoolNeighborhoodLearningCodes: getCodes(Routes.cache.SCHOOL_NEIGHBORHOOD_LEARNING_TYPES_URL),
  getAuthorityTypeCodes: getCodes(Routes.cache.AUTHORITY_TYPES_URL),
  getInstituteGradeCodes: getCodes(Routes.cache.GRADE_TYPES_URL),
  getInstituteProvinceCodes: getCodes(Routes.cache.PROVINCES_URL),
  getInstituteCountryCodes: getCodes(Routes.cache.COUNTRIES_URL),
  getSchoolCategoryFacilityTypes: getCodes(Routes.cache.SCHOOL_CATEGORY_FACILITY_TYPE_URL),
  getAllActiveFacilityTypeCodes: getCodes(`${Routes.cache.FACILITY_TYPES_URL}?active=true`),
  getAllActiveSchoolCategoryTypeCodes: getCodes(`${Routes.cache.SCHOOL_CATEGORY_TYPES_URL}?active=true`),
  getAllActiveSchoolOrganizationTypeCodes: getCodes(`${Routes.cache.SCHOOL_ORGANIZATION_TYPES_URL}?active=true`),
  getAllActiveSchoolNeighborhoodLearningCodes: getCodes(`${Routes.cache.SCHOOL_NEIGHBORHOOD_LEARNING_TYPES_URL}?active=true`),
  getAllActiveAuthorityTypeCodes: getCodes(`${Routes.cache.AUTHORITY_TYPES_URL}?active=true`),
  getAllActiveInstituteGradeCodes: getCodes(`${Routes.cache.GRADE_TYPES_URL}?active=true`),
  getAllActiveInstituteProvinceCodes: getCodes(`${Routes.cache.PROVINCES_URL}?active=true`),
  getAllActiveInstituteCountryCodes: getCodes(`${Routes.cache.COUNTRIES_URL}?active=true`),
  getAllFundingGroups: getCodes(`${Routes.sdc.FUNDING_DATA_URL}`),
  getAllCollectionTypeCodes: getCodes(`${Routes.sdc.COLLECTION_TYPE_CODES_URL}`),
  async getConfig() {
    try {
      const response = await apiAxios.get(Routes.CONFIG);
      return response;
    } catch (e) {
      console.log(`Failed to do get from Nodejs getConfig API - ${e}`);
      throw e;
    }
  },
};
