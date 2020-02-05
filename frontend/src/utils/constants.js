let baseRoot = '/api';
const authRoot = baseRoot + '/auth';
const penRequestRoot = baseRoot + '/penRequest';
const emailsRoot = baseRoot + '/emails';
let object = {
  LOGIN: authRoot + '/login',
  LOGOUT: authRoot + '/logout',
  REFRESH: authRoot + '/refresh',
  TOKEN: authRoot + '/token',
  USER: authRoot + '/user',
  PEN_REQUEST_ENDPOINT: penRequestRoot,
  PEN_REQUEST_SEARCH_URL: penRequestRoot + '/',
  PEN_REQUEST_STATUSES_URL: penRequestRoot + '/statuses',
  EMAILS_REJECT_URL: emailsRoot + '/reject',
  EMAILS_RETURN_URL: emailsRoot + '/info',
  EMAILS_COMPLETED_URL: emailsRoot + '/complete'
};

//endpoints
export const Routes = Object.freeze(object);
