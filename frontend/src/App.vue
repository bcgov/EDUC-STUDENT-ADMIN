<template>

  <v-app id="app">
    <Header/>
    <ModalIdle v-if="isAuthenticated && isIdle"/>
    <router-view/>
    <Footer/>
  </v-app>
</template>

<script>
import { mapGetters, mapActions, mapMutations } from 'vuex';
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
  created() {
    this.setLoading(true);
    this.$store.dispatch('auth/getJwtToken').then(() => {
      this.$store.dispatch('auth/getUserInfo');
      this.$store.dispatch('studentSearch/getCodes');
    });
    this.setLoading(false);
  },
  mounted() {
    /* window.addEventListener('beforeunload', function(e){
      this.closeSessionOnBrowserClose(e);
    });*/
  },
  methods:{
    ...mapMutations('auth', ['setLoading']),
    ...mapActions('studentSearch', ['getCodes']),
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
</style>
