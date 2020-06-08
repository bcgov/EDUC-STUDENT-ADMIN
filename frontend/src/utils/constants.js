let baseRoot = '/api';
const authRoot = baseRoot + '/auth';
const penRequestRoot = baseRoot + '/penRequest';
const studentRequestRoot = baseRoot + '/studentRequest';
const demographicRoot = baseRoot + '/studentDemographics';
const studentRoot = baseRoot + '/students';
let object = {
  LOGIN: authRoot + '/login',
  LOGOUT: authRoot + '/logout',
  SESSION_EXPIRED: authRoot + '/logout?sessionExpired=true',
  REFRESH: authRoot + '/refresh',
  TOKEN: authRoot + '/token',
  USER: authRoot + '/user',

  penRequest: {
    ROOT_ENDPOINT: penRequestRoot,
    SEARCH_URL: penRequestRoot + '/',
    DUPLICATE_REQUESTS_URL:penRequestRoot + '/duplicatePenRequests',
    STATUSES_URL: penRequestRoot + '/codes/requeststatuses',
    DOCUMENT_TYPES_URL: penRequestRoot + '/codes/documentTypes',
    COMPLETE_URL: penRequestRoot + '/complete',
    REJECT_URL: penRequestRoot + '/reject',
    RETURN_URL: penRequestRoot + '/return',
    MACRO_URL: penRequestRoot + '/macros',
  },

  studentRequest: {
    ROOT_ENDPOINT: studentRequestRoot,
    SEARCH_URL: studentRequestRoot + '/',
    DUPLICATE_REQUESTS_URL:studentRequestRoot + '/duplicatePenRequests',
    STATUSES_URL: studentRequestRoot + '/codes/requeststatuses',
    DOCUMENT_TYPES_URL: studentRequestRoot + '/codes/documentTypes',
    COMPLETE_URL: studentRequestRoot + '/complete',
    REJECT_URL: studentRequestRoot + '/reject',
    RETURN_URL: studentRequestRoot + '/return',
    MACRO_URL: studentRequestRoot + '/macros',
  },

  STUDENT_DATA_URL: studentRoot,
  SEARCH_BY_PEN: demographicRoot
};

//endpoints
export const Routes = Object.freeze(object);

export const Statuses = Object.freeze(
  {
    AUTO_MATCH_RESULT_CODES: {
      ONE_MATCH: 'ONEMATCH',
      MANY_MATCHES: 'MANYMATCHES',
      ZERO_MATCHES: 'ZEROMATCHES',
      RIGHT_PEN: 'RIGHTPEN',
      WRONG_PEN: 'WRONGPEN'
    },
    penRequest: {
      DRAFT: 'DRAFT',
      FIRST_REVIEW: 'INITREV',
      RETURNED: 'RETURNED',
      SECOND_REVIEW: 'SUBSREV',
      AUTO_MATCH: 'AUTO',
      MANUAL_MATCH: 'MANUAL',
      REJECTED: 'REJECTED',
      UNMATCHED: 'UNMATCHED'
    },
    studentRequest: {
      DRAFT: 'DRAFT',
      FIRST_REVIEW: 'INITREV',
      RETURNED: 'RETURNED',
      SECOND_REVIEW: 'SUBSREV',
      COMPLETED: 'COMPLETED',
      REJECTED: 'REJECTED',
    }
  }
);

export const REQUEST_TYPES = Object.freeze(
  {
    penRequest: {
      name: 'penRequest',
      label: 'PEN Request'
    },
    studentRequest: {
      name: 'studentRequest',
      label: 'UMPI Request'
    }
  }
);
