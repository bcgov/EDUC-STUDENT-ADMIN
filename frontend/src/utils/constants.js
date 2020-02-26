let baseRoot = '/api';
const authRoot = baseRoot + '/auth';
const penRequestRoot = baseRoot + '/penRequest';
const demographicRoot = baseRoot + '/studentDemographics';
let object = {
  LOGIN: authRoot + '/login',
  LOGOUT: authRoot + '/logout',
  REFRESH: authRoot + '/refresh',
  TOKEN: authRoot + '/token',
  USER: authRoot + '/user',
  PEN_REQUEST_ENDPOINT: penRequestRoot,
  PEN_REQUEST_SEARCH_URL: penRequestRoot + '/',
  PEN_REQUEST_STATUSES_URL: baseRoot + '/penrequeststatuses',
  PEN_REQUEST_UPDATE_AND_EMAIL_URL: penRequestRoot + '/update-and-email',
  PEN_REQUEST_COMPLETE_REQUEST_URL: penRequestRoot + '/complete-pen-request',
  SEARCH_BY_PEN: demographicRoot
};

//endpoints
export const Routes = Object.freeze(object);
