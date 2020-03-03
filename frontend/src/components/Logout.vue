<template>
  <v-container fluid class="full-height">

    <!-- login article -->
    <article name="logout-banner">
      <v-row align="center" justify="center">
        <v-col xs="10" sm="10" md="8" lg="4" xl="3">
        <v-card class="session-expired-card">
          <v-card-title class="gov-header">
            <h4 id="logout_text">Logged Out</h4>
          </v-card-title>
          <v-card-text id="logout_descriptor">
            <v-row style="margin: .3rem">You have Logged out.</v-row>
            <a id="login-button" @click="clearStorage" :href="routes.LOGIN" class="ma-1" dark color='#003366'>Log In</a><span>again if you wish to continue.</span>
          </v-card-text>
        </v-card>
        </v-col>
      </v-row>
    </article>
  </v-container>
</template>

<script>
import { Routes } from '../utils/constants';
export default {
  name: 'Logout',

  data() {
    return {
      routes: Routes
    };
  },
  mounted() {
    this.$store.commit('auth/setJwtToken');
    this.$store.commit('auth/setRefreshToken');
  },
  methods: {
    clearStorage() {
      this.$store.commit('auth/setJwtToken');
      this.$store.commit('auth/setRefreshToken');
    }
  }
};
</script>

<style scoped>

  .full-height{
    height: 100%;
  }
  .session-expired-card{
    margin-top: 15rem;
    width: 100%;
    background: #D9E7D8;
  }

</style>
