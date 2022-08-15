<template>

  <v-app id="app">
    <Header/>
    <SnackBar></SnackBar>
    <NavBar v-if="pageTitle && isAuthenticated" :title="pageTitle"></NavBar>
    <v-btn
            v-scroll="onScroll"
            id="toTopBtn"
            v-show="showToTopBtn"
            fab
            tile
            x-small
            dark
            fixed
            bottom
            right
            color="#606060"
            class="rounded"
            @click="toTop"
    >
      <v-icon>
        mdi-format-vertical-align-top
      </v-icon>
    </v-btn>
    <v-main fluid class="align-start">
      <v-app-bar v-if="bannerColor !== ''"
          style="color:white;"
          :color="bannerColor"
          sticky
          dense
      ><div><h3>{{ bannerEnvironment }} Environment</h3></div></v-app-bar>
      <ModalIdle class="align-start px-8 mb-0" v-if="isAuthenticated"/>
      <router-view class="align-start px-8 mb-0"/>
    </v-main>
    <Footer/>
  </v-app>
</template>

<script>
import {mapActions, mapGetters, mapState} from 'vuex';
import Header from './components/Header';
import Footer from './components/Footer';
import ModalIdle from './components/ModalIdle';
import NavBar from './components/util/NavBar';
import SnackBar from './components/util/SnackBar';
import StaticConfig from './common/staticConfig';
import {activateMultipleDraggableDialog} from '@/utils/draggable';

export default {
  name: 'app',
  components: {
    SnackBar,
    NavBar,
    Header,
    Footer,
    ModalIdle
  },
  data() {
    return {
      showToTopBtn: false,
      bannerEnvironment: StaticConfig.BANNER_ENVIRONMENT,
      bannerColor: StaticConfig.BANNER_COLOR,
      deactivateMultipleDraggableDialog: null,
    };
  },
  computed: {
    ...mapGetters('auth', ['jwtToken', 'isAuthenticated', 'userInfo']),
    ...mapState('auth', ['isValidGMPUser', 'isValidUMPUser', 'isValidPenRequestBatchUser']),
    ...mapState('app', ['pageTitle']),
  },
  watch: {
    isAuthenticated()  {
      this.handleWebSocket();
    }
  },
  beforeDestroy() {
    this.deactivateMultipleDraggableDialog && this.deactivateMultipleDraggableDialog();
  },
  mounted() {
    this.deactivateMultipleDraggableDialog = activateMultipleDraggableDialog();
    this.handleWebSocket();
  },
  methods:{
    ...mapActions('student', ['getCodes']),
    handleWebSocket() {
      if(this.isAuthenticated && (this.isValidPenRequestBatchUser || this.isValidGMPUser || this.isValidUMPUser)) {
        this.$webSocketsConnect();
      } else {
        this.$webSocketsDisconnect();
      }
    },
    onScroll(e) {
      if (typeof window === 'undefined') return;
      const top = window.pageYOffset ||   e.target.scrollTop || 0;
      this.showToTopBtn = top > 20;
    },
    toTop() {
      this.$vuetify.goTo(0);
    }
  }
};
</script>

<style>
  #toTopBtn {
    opacity: 0.5;
  }
  #toTopBtn:hover {
    opacity: 1;
  }

  .v-application {
    font-family: 'BCSans', Verdana, Arial, sans-serif !important;
  }

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

  .v-alert .v-icon {
    padding-left: 0;
  }
  .full-height {
    height: 100%;
  }

</style>
