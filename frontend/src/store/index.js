import Vue from 'vue';
import Vuex from 'vuex';
import auth from './modules/auth';
import request from './modules/request';
import app from './modules/app';
import notifications from './modules/notifications';
import student from './modules/student';
import studentSearch from './modules/studentSearch';
import prbStudentSearch from './modules/prbStudentSearch';
import penRequestBatch from './modules/penRequestBatch';
import setNavigation from './modules/setNavigation';

Vue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    auth: auth,
    app,
    penRequest: request,
    studentRequest: request,
    notifications,
    student,
    studentSearch,
    prbStudentSearch,
    penRequestBatch,
    setNavigation
  }
});

export default store;
