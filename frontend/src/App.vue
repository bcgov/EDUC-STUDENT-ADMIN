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
  async created() {
    this.$store.dispatch('auth/getJwtToken').then(() => {
      this.$store.dispatch('auth/getUserInfo');
    });
  }
};
</script>

<style>
.v-application {
  font-family: 'BCSans', Verdana, Arial, sans-serif !important;
}
.v-card--flat {
  background-color: transparent !important;
}
.theme--light.application{
  background: #f1f1f1;
}
</style>
