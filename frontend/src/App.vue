<template>

  <v-app id="app">
    <Header/>
    <ModalIdle v-if="isAuthenticated && isIdle"/>
    <router-view/>
    <Footer/>
  </v-app>
</template>

<script>
import { mapGetters } from 'vuex';
import Header from './components/Header';
import Footer from './components/Footer';
import ModalIdle from './components/ModalIdle';

export default {
  name: 'app',
  components: {
    Header,
    Footer,
    ModalIdle
  },
  computed: {
    ...mapGetters('auth', ['getJwtToken','isAuthenticated']),
    ...mapGetters('auth', ['userInfo']),
    isIdle(){
      return this.$store.state.idleVue.isIdle;
    }
  },
  async created() {
    this.$store.dispatch('auth/getJwtToken').then(() => {
      this.$store.dispatch('auth/getUserInfo');
    });
  },
  mounted() {
    /* window.addEventListener('beforeunload', function(e){
      this.closeSessionOnBrowserClose(e);
    });*/
  },
  methods:{
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
.v-application {
  font-family: 'BCSans', Verdana, Arial, sans-serif !important;
}
</style>
