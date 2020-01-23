let baseRoot = '/api';
const authRoot = baseRoot + '/auth';
let object = {
  LOGIN: authRoot + '/login',
  LOGOUT: authRoot + '/logout',
  REFRESH: authRoot + '/refresh',
  TOKEN: authRoot + '/token',
  USER: authRoot + '/user',
  PEN_REQUEST_ENDPOINT: baseRoot + '/pen-request', 
};

//Authentication endpoints
export const AuthRoutes = Object.freeze(object);

const penRequestUrl = '/api/penRequest';
const penRequestSearchUrl = '/api/penRequest/search';
const codeTableUrl = '/api/penRequest/status';
const rejectEmailsUrl = '/api/emails/reject';
const user = authRoot + '/user';

export default {
  penRequestUrl: penRequestUrl,
  penRequestSearchUrl: penRequestSearchUrl,
  codeTableUrl: codeTableUrl,
  rejectEmailsUrl:rejectEmailsUrl,
  user:user
};
