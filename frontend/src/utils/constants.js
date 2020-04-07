let baseRoot = '/api';
const authRoot = baseRoot + '/auth';
const penRequestRoot = baseRoot + '/penRequest';
const demographicRoot = baseRoot + '/studentDemographics';
const studentRoot = baseRoot + '/students';
let object = {
  LOGIN: authRoot + '/login',
  LOGOUT: authRoot + '/logout',
  SESSION_EXPIRED: authRoot + '/logout?sessionExpired=true',
  REFRESH: authRoot + '/refresh',
  TOKEN: authRoot + '/token',
  USER: authRoot + '/user',
  PEN_REQUEST_ENDPOINT: penRequestRoot,
  PEN_REQUEST_SEARCH_URL: penRequestRoot + '/',
  DUPLICATE_PEN_REQUESTS_URL:penRequestRoot + '/duplicatePenRequests',
  PEN_REQUEST_STATUSES_URL: baseRoot + '/penrequeststatuses',
  PEN_REQUEST_COMPLETE_URL: penRequestRoot + '/complete',
  PEN_REQUEST_REJECT_URL: penRequestRoot + '/reject',
  PEN_REQUEST_RETURN_URL: penRequestRoot + '/return',
  PEN_REQUEST_MACRO_URL: penRequestRoot + '/macros',
  STUDENT_DATA_URL: studentRoot,
  SEARCH_BY_PEN: demographicRoot
};

//endpoints
export const Routes = Object.freeze(object);

export const Statuses = Object.freeze(
  {
    PEN_STATUS_CODES: {
      DRAFT: 'DRAFT',
      FIRST_REVIEW: 'INITREV',
      RETURNED: 'RETURNED',
      SECOND_REVIEW: 'SUBSREV',
      AUTO_MATCH: 'AUTO',
      MANUAL_MATCH: 'MANUAL',
      REJECTED: 'REJECTED',
      UNMATCHED: 'UNMATCHED'
    },
    AUTO_MATCH_RESULT_CODES: {
      ONE_MATCH: 'ONEMATCH',
      MANY_MATCHES: 'MANYMATCHES',
      ZERO_MATCHES: 'ZEROMATCHES',
      RIGHT_PEN: 'RIGHTPEN',
      WRONG_PEN: 'WRONGPEN'
    }
  }
);
