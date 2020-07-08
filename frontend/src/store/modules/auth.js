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
    isValidUMPUser: localStorage.getItem('isValidUMPUser') !== null,
    isValidStudentSearchUser: localStorage.getItem('isValidStudentSearchUser') !== null,
  },
  getters: {
    acronyms: state => state.acronyms,
    isAuthenticated: state => state.isAuthenticated,
    jwtToken: () => localStorage.getItem('jwtToken'),
    userInfo: state => state.userInfo,
    isAuthorizedUser: state => state.isAuthorizedUser,
    isValidGMPUser: state => state.isValidGMPUser,
    isValidUMPUser: state => state.isValidUMPUser,
    isValidStudentSearchUser: state => state.isValidStudentSearchUser,
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
    setUMPUser: (state, isValidUMPUser) => {
      if (isValidUMPUser) {
        state.isValidUMPUser = true;
        localStorage.setItem('isValidUMPUser', 'true');
      } else {
        state.isValidUMPUser = false;
        localStorage.removeItem(('isValidUMPUser'));
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
        ApiService.apiAxios
          .get(Routes.USER)
          .then(response => {
            context.commit('setUserInfo', response.data);
          })
          .catch(error => {
            console.log(error);
          });
      }
    },

    //retrieves the json web token from local storage. If not in local storage, retrieves it from API
    async getJwtToken(context) {
      try {
        if (context.getters.isAuthenticated && !!context.getters.jwtToken) {
          const now = Date.now().valueOf() / 1000;
          const jwtPayload = context.getters.jwtToken.split('.')[1];
          const payload = JSON.parse(window.atob(jwtPayload));

          if (payload.exp > now) {
            const response = await AuthService.refreshAuthToken(context.getters.jwtToken);

            if (response.jwtFrontend) {
              context.commit('setJwtToken', response.jwtFrontend);
            }
            context.commit('setAuthorizedUser', response.isAuthorizedUser);
            context.commit('setGMPUser', response.isValidGMPUser);
            context.commit('setUMPUser', response.isValidUMPUser);
            context.commit('setStudentSearchUser', response.isValidStudentSearchUser);
            ApiService.setAuthHeader(response.jwtFrontend);
          }
          else {
            context.commit('logoutState');
          }
        } else {
          const response = await AuthService.getAuthToken();

          if (response.jwtFrontend) {
            context.commit('setJwtToken', response.jwtFrontend);
          }
          context.commit('setAuthorizedUser', response.isAuthorizedUser);
          context.commit('setGMPUser', response.isValidGMPUser);
          context.commit('setUMPUser', response.isValidUMPUser);
          context.commit('setStudentSearchUser', response.isValidStudentSearchUser);
          ApiService.setAuthHeader(response.jwtFrontend);
        }
      } catch (e) {
        // Remove tokens from localStorage and update state
        context.commit('setJwtToken');
      }
    },
  }
};
