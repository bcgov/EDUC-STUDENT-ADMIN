<template>

  <v-app id="app">
    <Header/>
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
    <v-main fluid class="align-start px-8 mb-0">
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
  data() {
    return {
      showToTopBtn: false
    };
  },
  computed: {
    ...mapGetters('auth', ['getJwtToken','isAuthenticated','isValidGMPUser','isValidUMPUser', 'isValidPenRequestBatchUser']),
    ...mapGetters('auth', ['userInfo']),
    ...mapState('app', ['pageTitle']),
    isIdle(){
      return this.$store.state.idleVue.isIdle;
    }
  },
  watch: {
    isAuthenticated()  {
      this.handleWebSocket();
    }
  },
  mounted() {
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

  /** Batch File Data Table */
  #dataTable.batch-file-table .file-column {
    float: left;
  }
  #dataTable.batch-file-table .countable-column-div {
    max-width: 2rem;
    margin: auto;
  }
  #dataTable.batch-file-table .countable-column-data {
    float: right;
  }
  #dataTable.batch-file-table /deep/ .v-pagination__navigation > i {
    padding-left: 0;
  }
  #dataTable.batch-file-table /deep/ table th .countable-column-header .v-icon {
    padding: 0.5rem 0;
  }
  #dataTable.batch-file-table /deep/ table th{
    text-align: center !important;
    font-size: 0.875rem;
  }

  #dataTable.batch-file-table.filterable-table /deep/ table th{
    vertical-align: top;
    padding-top: 0.5rem;
  }

  #dataTable.batch-file-table /deep/ table td { 
    border-bottom: none !important;
  }
  #dataTable.batch-file-table /deep/ table td:nth-child(5),
  #dataTable.batch-file-table /deep/ table td:nth-child(8),
  #dataTable.batch-file-table /deep/ table td:nth-child(10),
  #dataTable.batch-file-table /deep/ table td:nth-child(11),
  #dataTable.batch-file-table /deep/ table th:nth-child(5),
  #dataTable.batch-file-table /deep/ table th:nth-child(8),
  #dataTable.batch-file-table /deep/ table th:nth-child(10),
  #dataTable.batch-file-table /deep/ table th:nth-child(11) { 
    border-left: thin solid #d7d7d7;
  }
  #dataTable.batch-file-table /deep/ table tr.first-active-file td{ 
    border-top: thin solid #d8d8d8;
  }
  #dataTable.batch-file-table /deep/ table { 
    border-top: thin solid #d7d7d7;
    border-bottom: thin solid #d7d7d7;
  }
  #dataTable.batch-file-table /deep/ table tr { 
    cursor: pointer;
  }
  #dataTable.batch-file-table /deep/ table tr.selected-file,
  #dataTable.batch-file-table /deep/ table tbody tr:hover { 
    background-color: #E1F5FE
  }
  #dataTable.batch-file-table /deep/ table td:nth-child(10),
  #dataTable.batch-file-table /deep/ table th:nth-child(10) { 
    background-color: rgba(0, 0, 0, 0.06);
  }

  #dataTable.batch-file-table /deep/ table .file-checkbox .v-icon.fa-minus-square {
    color: #039BE5 !important;
  }

  #dataTable.batch-file-table .file-checkbox {
    margin-top: 0;
  }
  #dataTable.batch-file-table .file-checkbox /deep/ .v-input__slot {
    margin-bottom: 0;
  }
  #dataTable.batch-file-table .file-checkbox /deep/ .v-input__slot .v-input--selection-controls__input {
    margin-right: 0;
  }

  #dataTable.batch-file-table .header-checkbox {
    padding-top: 0;
  }
  #dataTable.batch-file-table .header-checkbox /deep/ .v-input__slot {
    padding-top: 0;
  }

  #dataTable.batch-file-table .filter-checkbox /deep/ .v-input__slot {
    justify-content: center;
    padding-top: 0;
  }

  #dataTable.batch-file-table .select-column {
    vertical-align: bottom !important;
  }
  
</style>
