<template>
    <v-container fluid class="full-height">

        <!-- login article -->
        <article id="login-banner" class="top-banner">
            <v-row align="center" justify="center">
                <v-card class="login-card">
                    <v-card-title class="gov-header">
                      <h4 id="login_text">Log In</h4>
                    </v-card-title>
                    <v-card-text id="login_descriptor">
                      To access the Student Administration Application, you must have a valid IDIR.
                    </v-card-text>
                    <v-card-actions>
                        <v-row align="center" justify="center">
                            <v-btn id="login-button" @click="clearStorage" :href="routes.LOGIN" class="ma-2" dark color='#003366'>Log In <v-icon>mdi-login</v-icon></v-btn>
                        </v-row>
                    </v-card-actions>
                </v-card>
            </v-row>
        </article>
    </v-container>
</template>

<script>
import { mapState } from 'pinia';
import { Routes } from '@/utils/constants';
import {authStore} from '@/store/modules/auth';
export default {
  name: 'Login',
  data() {
    return {
      routes: Routes
    };
  },
  computed: {
    ...mapState(authStore, ['isAuthenticated']),
  },
  methods: {
    clearStorage() {
      this.$store.commit('auth/setJwtToken');
    }
  }
};
</script>

<style scoped>
  .v-icon{
    padding-left: 10px;
  }
  .login-card{
    max-width: 400px;
  }
  .gov-header{
    color: #003366;
  }
  .v-btn{
    text-transform: none
  }
  .top-banner{
      min-height: 500px;
      background-size: cover;
      align-items: center;
      display: flex;
  }
  .full-height{
      height: 100%;
  }
</style>
