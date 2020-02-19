<template>

  <v-app id="app">
    <Header/>
    <router-view/>
    <Footer/>
  </v-app>
</template>

<script>
import { mapGetters } from 'vuex';
import Header from './components/Header';
import Footer from './components/Footer';
import ApiService from './common/apiService';
import {Routes} from './utils/constants';

export default {
  name: 'app',
  components: {
    Header,
    Footer
  },
  computed: {
    ...mapGetters('auth', ['getJwtToken']),
    ...mapGetters('auth', ['userInfo'])
  },
  async mounted() {
    /*ApiService.apiAxios
      .get(Routes.VALIDATE_ROLE)
      .then(response => {
        //this.request = response.data;
        //this.failedForm.failureReason = response.data.failureReason;
        console.log(response);
        console.log('DO HAVE ROLE');
      })
      .catch(error => {
        console.log('DONT HAVE ROLE');
        console.log(error);
      });*/
    this.$store.dispatch('auth/getJwtToken').then(() => {
      console.log('YEEEE');
      this.$store.dispatch('auth/getUserInfo');
    });
  }
};
</script>

<style>
.v-application {
  font-family: 'BCSans', Verdana, Arial, sans-serif !important;
}
</style>
