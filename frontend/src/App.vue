<template>
  <v-app id="app">
    <Header/>
    <SnackBar/>
    <NavBar v-if="pageTitle && authStore().isAuthenticated" :title="pageTitle"></NavBar>
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
      <ModalIdle class="align-start px-8 mb-0" v-if="authStore().isAuthenticated"/>
      <router-view class="align-start px-8 mb-0"/>
    </v-main>
    <Footer/>
  </v-app>
</template>

<script>
import { mapState } from 'pinia';
import Header from '@/components/Header.vue';
import Footer from '@/components/Footer.vue';
import ModalIdle from '@/components/ModalIdle.vue';
import NavBar from '@/components/util/NavBar.vue';
import SnackBar from '@/components/util/SnackBar.vue';
import {activateMultipleDraggableDialog} from '@/utils/draggable';
import {appStore} from '@/store/modules/app';
import {authStore} from '@/store/modules/auth';

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
      deactivateMultipleDraggableDialog: null,
    };
  },
  computed: {
    ...mapState(authStore, ['jwtToken', 'isAuthenticated', 'userInfo', 'isValidGMPUser', 'isValidUMPUser', 'isValidPenRequestBatchUser']),
    ...mapState(appStore, ['pageTitle']),
  },
  watch: {
    isAuthenticated()  {
      this.handleWebSocket();
    }
  },
  beforeUnmount() {
    this.deactivateMultipleDraggableDialog && this.deactivateMultipleDraggableDialog();
  },
  mounted() {
    this.deactivateMultipleDraggableDialog = activateMultipleDraggableDialog();
    this.handleWebSocket();
  },
  methods:{
    authStore,
    handleWebSocket() {
      if(this.isAuthenticated && (this.isValidPenRequestBatchUser || this.isValidGMPUser || this.isValidUMPUser)) {
        //this.$webSocketsConnect();
      } else {
        //this.$webSocketsDisconnect();
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
