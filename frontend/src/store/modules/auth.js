import ApiService from '../../common/apiService';
import AuthService from '../../common/authService';
import { Routes } from '../../utils/constants';

export default {
  namespaced: true,
  state: {
    acronyms: [],
    isAuthenticated: localStorage.getItem('jwtToken') !== null,
    isAdmin: localStorage.getItem('isAdmin'),
    userInfo: false,
  },
  getters: {
    acronyms: state => state.acronyms,
    isAuthenticated: state => state.isAuthenticated,
    jwtToken: () => localStorage.getItem('jwtToken'),
    userInfo: state => state.userInfo,
    isAdmin: state => state.isAdmin
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
    setAdminUser:(state, isAdminUser) =>{
      if(isAdminUser){
        state.isAdmin=true;
        localStorage.setItem('isAdmin','true');
      }
    },
    setUserInfo: (state, userInf) => {
      if(userInf){
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

    async getUserInfo(context){
      ApiService.apiAxios
        .get(Routes.USER)
        .then(response => {
          context.commit('setUserInfo', response.data);
        })
        .catch(error => {
          console.log(error);
        });
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
            if(response.isAdminUser){
              context.commit('setAdminUser', response.isAdminUser);
            }
            ApiService.setAuthHeader(response.jwtFrontend);
          }
        } else {
          const response = await AuthService.getAuthToken();

          if (response.jwtFrontend) {
            context.commit('setJwtToken', response.jwtFrontend);
          }
          if(response.isAdminUser){
            context.commit('setAdminUser', response.isAdminUser);
          }
          ApiService.setAuthHeader(response.jwtFrontend);
        }
      } catch (e) {
        // Remove tokens from localStorage and update state
        context.commit('setJwtToken');
      }
    },
  }
};
