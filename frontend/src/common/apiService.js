import axios from 'axios';
import { Routes } from '../utils/constants';
import AuthService from '@/common/authService';

// Buffer concurrent requests while refresh token is being acquired
let isRefreshing = false;
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
  if (error.response.status === 401 && !originalRequest._retry) {
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        try {
          const token = failedQueue.push({ resolve, reject });
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return axios(originalRequest);
        } catch (e) {
          return e;
        }
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

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
          reject(e);
        })
        .finally(() => isRefreshing = false);
    });
  }

  return Promise.reject(error);
});

function getCodes(url) {
  return async function getCodesHandler() {
    try {
      return await apiAxios.get(url);
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
  getTwinReasonCodes: getCodes(Routes.student.TWIN_REASON_CODE_URL),
  getPenRequestBatchStudentStatusCodes: getCodes(Routes.penRequestBatch.STUDENT_STATUS_CODE_URL),
};
