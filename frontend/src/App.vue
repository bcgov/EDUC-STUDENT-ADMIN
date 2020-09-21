<template>

  <v-app id="app">
    <Header/>
    <NavBar v-if="pageTitle && isAuthenticated" :title="pageTitle"></NavBar>
    <v-main fluid class="align-start px-10 mb-0">
      <ModalIdle v-if="isAuthenticated && isIdle"/>
      <router-view/>
    </v-main>
    <Footer/>
  </v-app>
</template>

<script>
import { mapGetters, mapActions, mapState } from 'vuex';
import Header from './components/Header';
import Footer from './components/Footer';
import ModalIdle from './components/ModalIdle';
import NavBar from './components/util/NavBar';

export default {
  name: 'app',
  components: {
    NavBar,
    Header,
    Footer,
    ModalIdle
  },
  computed: {
    ...mapGetters('auth', ['getJwtToken','isAuthenticated']),
    ...mapGetters('auth', ['userInfo']),
    ...mapState('app', ['pageTitle']),
    isIdle(){
      return this.$store.state.idleVue.isIdle;
    }
  },
  methods:{
    ...mapActions('student', ['getCodes']),
    /*closeSessionOnBrowserClose(event){
        event.
      if(this.$store.state.isAuthenticated){
        this.$store.commit('auth/setJwtToken');
        this.$store.commit('auth/setRefreshToken');
        this.$store.commit('auth/setAdminUser',false);
        window.location = document.getElementById('logout_href').href;
        return null;
      }
      return null;
    }*/
  }
};
</script>

<style>
  .v-alert.bootstrap-success {
    color: #234720 !important;
    background-color: #d9e7d8 !important;
    border-color: #accbaa !important;
  }

  .v-alert.bootstrap-info {
    color: #4e6478;
    background-color: #eaf2fa !important;
    border-color: #b8d4ee !important;
  }

  .v-alert.bootstrap-warning {
    color: #81692c;
    background-color: #fef4dd !important;
    border-color: #fbdb8b !important;
  }

  .v-alert.bootstrap-error {
    color: #712024;
    background-color: #f7d8da !important;
    border-color: #eeaaad !important;
  }

  .v-alert--text:before {
    background-color: transparent;
  }

  .v-application {
    font-family: 'BCSans', Verdana, Arial, sans-serif !important;
  }

  .v-menu__content .v-btn {
    background-color: #38598a !important;
    margin-left: 1rem;
  }

  .v-menu__content .v-btn .v-btn__content {
    color: #FFFFFF !important;
  }

  .v-alert .v-icon {
    padding-left: 0;
  }
  .full-height {
    height: 100%;
  }

  .v-input--checkbox .v-icon {
    padding-left: 10px;
  }
</style>
