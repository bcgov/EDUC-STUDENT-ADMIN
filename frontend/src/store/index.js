import Vue from 'vue';
import Vuex from 'vuex';
import auth from './modules/auth';
import penRequest from './modules/penRequest';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    auth: auth,
    penRequest: penRequest
  }
});
