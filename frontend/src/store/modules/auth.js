import ApiService from '@/common/apiService';
import AuthService from '@/common/authService';

export default {
  namespaced: true,
  state: {
    acronyms: [],
    isAuthenticated: localStorage.getItem('jwtToken') !== null,
    userInfo: false
  },
  getters: {
    acronyms: state => state.acronyms,
    isAuthenticated: state => state.isAuthenticated,
    jwtToken: () => localStorage.getItem('jwtToken'),
    refreshToken: () => localStorage.getItem('refreshToken'),
    userInfo: state => state.userInfo
  },
  mutations: {
    //sets Json web token and determines whether user is authenticated
    setJwtToken: (state, token = null) => {
      if (token) {
        //if we aren't in test mode, verify the token contains expected elements
        if(process.env.NODE_ENV !== 'development'){
          const payload = JSON.parse(atob(token.split('.')[1]));
          const roles = payload.realm_access.roles;

          if (typeof roles === 'object' && roles instanceof Array) {
            state.acronyms = roles.filter(role => !role.match(/offline_access|uma_authorization/));
          } else {
            state.acronyms = [];
          }
        }
        state.isAuthenticated = true;
        localStorage.setItem('jwtToken', token);
      } else {
        state.acronyms = [];
        state.isAuthenticated = false;
        localStorage.removeItem('jwtToken');
      }
    },
    setUserInfo: (state, userInf) => {
      if(userInf){
        state.userInfo = userInf;
      } else {
        state.userInfo = null;
      }
    },

    //sets the token required for refresing expired json web tokens
    setRefreshToken: (_state, token = null) => {
      if (token) {
        localStorage.setItem('refreshToken', token);
      } else {
        localStorage.removeItem('refreshToken');
      }
    },
    logoutState: (state) => {
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('jwtToken');
      state.userInfo = false;
      state.isAuthenticated = false;
    }
  },
  actions: {

    async getUserInfo(context){
      try{
        if(process.env.NODE_ENV === 'development'){
          context.commit('setUserInfo', {
            name: 'Nathan Denny',
            given_name: 'Nathan',
            family_name: 'Denny',
            email: 'fake-email@not.real',
            preferred_username: 'ndenny@bceid'
          });
        } else {
          var token = localStorage.getItem('jwtToken');
          var base64Url = token.split('.')[1];
          var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          const decoded = JSON.parse(jsonPayload);
          context.commit('setUserInfo', decoded);
        }
      } catch(e) {
        throw e;
      }
    },

    //retrieves the json web token from local storage. If not in local storage, retrieves it from API
    async getJwtToken(context) {
      try {
        if (context.getters.isAuthenticated && !!context.getters.refreshToken) {
          if(process.env.NODE_ENV === 'development'){
            context.commit('setJwtToken');
            context.commit('setRefreshToken');
          } else{
            const now = Date.now().valueOf() / 1000;
            const jwtPayload = context.getters.jwtToken.split('.')[1];
            const payload = JSON.parse(window.atob(jwtPayload));

            if (payload.exp > now) {
              const response = await AuthService.refreshAuthToken(context.getters.refreshToken);

              if (response.jwt) {
                context.commit('setJwtToken', response.jwt);
              }
              if (response.refreshToken) {
                context.commit('setRefreshToken', response.refreshToken);
              }
              ApiService.setAuthHeader(response.jwt);
            }
          }
        } else {
          if(process.env.NODE_ENV === 'development'){
            context.commit('setJwtToken', 'testToken');
            context.commit('setRefreshToken', 'fakeRefreshToken');
          } else {
            const response = await AuthService.getAuthToken();

            if (response.jwt) {
              context.commit('setJwtToken', response.jwt);
            }
            if (response.refreshToken) {
              context.commit('setRefreshToken', response.refreshToken);
            }
            ApiService.setAuthHeader(response.jwt);
          }
        }
      } catch (e) {
        // Remove tokens from localStorage and update state
        context.commit('setJwtToken');
        context.commit('setRefreshToken');
      }
    }
  }
};
