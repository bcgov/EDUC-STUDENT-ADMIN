import ApiService from '@/common/apiService';
import AuthService from '@/common/authService';

export default {
  namespaced: true,
  state: {
    acronyms: [],
    isAuthenticated: localStorage.getItem('jwtToken') !== null,
    userInfo: false,
  },
  getters: {
    acronyms: state => state.acronyms,
    isAuthenticated: state => state.isAuthenticated,
    jwtToken: () => localStorage.getItem('jwtToken'),
    userInfo: state => state.userInfo,
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
    setUserInfo: (state, userInf) => {
      if(userInf){
        state.userInfo = userInf;
      } else {
        state.userInfo = null;
      }
    },

    //sets the token required for refresing expired json web tokens
    logoutState: (state) => {
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
            displayName: 'Nathan Denny',
            firstName: 'Nathan',
            lastName: 'Denny',
            email: 'fake-email@not.real',
            accountType: 'BCEID',
            pen: null
          });
        } else {
          var token = await AuthService.getAuthToken();
          console.log(token);
          var tokenJson = token._json;
          console.log(tokenJson);
          context.commit('setUserInfo', tokenJson);
        }
      } catch(e) {
        throw e;
      }
    },

    //retrieves the json web token from local storage. If not in local storage, retrieves it from API
    async getJwtToken(context) {
      try {
        if (context.getters.isAuthenticated && !!context.getters.jwtToken) {
          if(process.env.NODE_ENV === 'development'){
            context.commit('setJwtToken', 'testToken');
          } else{
            const now = Date.now().valueOf() / 1000;
            const jwtPayload = context.getters.jwtToken.split('.')[1];
            const payload = JSON.parse(window.atob(jwtPayload));

            if (payload.exp > now) {
              const response = await AuthService.refreshAuthToken(context.getters.jwtToken);

              if (response.jwtFrontend) {
                context.commit('setJwtToken', response.jwtFrontend);
              }
              ApiService.setAuthHeader(response.jwtFrontend);
            }
          }
        } else {
          if(process.env.NODE_ENV === 'development'){
            context.commit('setJwtToken', 'testToken');
          } else {
            const response = await AuthService.getAuthToken();

            if (response.jwtFrontend) {
              context.commit('setJwtToken', response.jwtFrontend);
            }
            ApiService.setAuthHeader(response.jwtFrontend);
          }
        }
      } catch (e) {
        // Remove tokens from localStorage and update state
        context.commit('setJwtToken');
      }
    },
  }
};
