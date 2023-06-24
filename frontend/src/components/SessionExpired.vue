<template>
  <v-container
    fluid
    class="full-height"
  >
    <!-- login article -->
    <article
      name="session-expired-banner"
      class="top-banner"
    >
      <v-row
        align="center"
        justify="center"
      >
        <v-col
          xs="10"
          sm="10"
          md="8"
          lg="4"
          xl="3"
        >
          <v-card class="session-expired-card">
            <v-card-title class="gov-header">
              <h4 id="session-expired-text">
                Session Expired
              </h4>
            </v-card-title>
            <v-card-text id="session-expired-descriptor">
              <v-row style="margin: .3rem">
                Your secure session has ended as a result of inactivity.
              </v-row>
              <a
                id="login-button"
                :href="routes.LOGIN"
                class="ma-1"
                dark
                color="#003366"
                @click="clearStorage"
              >Log In</a><span>again to continue.</span>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </article>
  </v-container>
</template>

<script>
import {Routes} from '../utils/constants';
import {authStore} from '@/store/modules/auth';

export default {
  name: 'SessionExpired',

  data() {
    return {
      routes: Routes
    };
  },
  mounted() {
    const auStore = authStore();
    auStore.setJwtToken();
  },
  methods: {
    clearStorage() {
      const auStore = authStore();
      auStore.setJwtToken();
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
    background: #F2E8D5;
  }
</style>
