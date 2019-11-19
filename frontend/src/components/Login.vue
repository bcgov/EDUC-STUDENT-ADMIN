<template>
    <v-card class="login-card">
        <v-card-title class="gov-header">
          <h4 id="login_text">Log In</h4>
        </v-card-title>
        <v-card-text id="login_descriptor">
          To access the Student Administration Application, you must have a valid IDir.
        </v-card-text>
        <v-card-actions>
            <v-row align="center" justify="center">
                <v-btn id="login-button" @click="clearStorage" :href="authRoutes.LOGIN" class="ma-2" dark color='#003366'>Log In <v-icon>$sign_in</v-icon></v-btn>
            </v-row>
        </v-card-actions>
    </v-card>
</template>

<script>
import { mapGetters } from 'vuex';
import { AuthRoutes } from '@/utils/constants';
export default {
  name: 'Login',
  data() {
    return {
      authRoutes: AuthRoutes
    };
  },
  computed: {
    ...mapGetters('auth', ['isAuthenticated']),
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
</style>
