let baseRoot = '/api';
const authRoot = baseRoot + '/auth';
let object;

if(process.env.NODE_ENV === 'development'){
  object = {
    LOGIN: '/',
    LOGOUT: '/',
    REFRESH: authRoot + '/refresh',
    TOKEN: authRoot + '/token'
  };
} else {
  object = {
    LOGIN: authRoot + '/login',
    LOGOUT: authRoot + '/logout',
    REFRESH: authRoot + '/refresh',
    TOKEN: authRoot + '/token',
    PEN_REQUEST_ENDPOINT: baseRoot + '/pen-request', 
  };
}
//Authentication endpoints
export const AuthRoutes = Object.freeze(object);

let backendRoot = 'http://localhost:8080';//process.env.BACKEND_ROOT;
const penRequestUrl = backendRoot + '/api/penRequest/search';
const codeTableUrl = backendRoot + '/api/penRequest/status';

export default {
  penRequestUrl: penRequestUrl,
  codeTableUrl: codeTableUrl
};
