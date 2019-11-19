<template>
  <header class="gov-header">
    <v-toolbar class="toolbar_header">
      <!-- Navbar content -->
      <a href="/">
        <img
          src="@/assets/images/bc-gov-logo.svg"
          width="155"
          class="logo"
          alt="B.C. Government Logo"
        >
      </a>
      <a v-if="isAuthenticated" href="/">
        <v-toolbar-title><h3 style="color:white">{{ secureAppTitle }}</h3></v-toolbar-title>
      </a>
      <a v-else href="/">
        <v-toolbar-title><h3 style="color:white">{{ appTitle }}</h3></v-toolbar-title>
      </a>

      <v-spacer></v-spacer>

      <div v-if="isAuthenticated && dataReady">
        <v-menu name="user_options" offset-y>
          <template v-slot:activator="{ on }">
            <v-chip tabindex="0" v-on="on" pill color="#003366" dark>
              <v-avatar left color="info">
                {{ userInfo.name[0] }}
              </v-avatar>
              {{ userInfo.name }}
            </v-chip>
          </template>
          <v-list dark color="#003366">
            <v-list-item id="logout_button" @click="clearStorage" :href='authRoutes.LOGOUT'><v-list-title>Logout</v-list-title></v-list-item>
          </v-list>
        </v-menu>

      </div>
      <div v-else-if="isAuthenticated && !dataReady">
        <v-skeleton-loader type="chip">
        </v-skeleton-loader>
      </div>
    </v-toolbar>
  </header>
</template>

<script>
import { mapGetters } from 'vuex';
import { AuthRoutes } from '@/utils/constants';
export default {
  data(){
    return {
      appTitle: process.env.VUE_APP_TITLE,
      secureAppTitle: process.env.VUE_APP_SECURED_TITLE,
      authRoutes: AuthRoutes
    };
  },
  computed: {
    ...mapGetters('auth', ['isAuthenticated']),
    ...mapGetters('auth', ['userInfo']),
    dataReady: function() {
      if(!(this.userInfo)){
        return false;
      } else {
        return true;
      }
    }
  },
  methods: {
    clearStorage() {
      this.$store.commit('auth/setJwtToken');
      this.$store.commit('auth/setRefreshToken');
    }
  }
};
</script>

<style>
.v-icon{
  padding-left: 10px;
}
a {
  text-decoration: none;
}
.v-toolbar__content{
  padding: 4px 10px 4px 65px;
}
.logo{
  padding-right: 15px;
}
.gov-header .title {
  color: #fff;
  text-decoration: none;
}
.gov-header .v-toolbar {
  background-color: rgb(0, 51, 102) !important;
  border-bottom: 2px solid rgb(252, 186, 25) !important;
}
.gov-header .v-btn,
.v-btn--active.title:before,
.v-btn.title:focus:before,
.v-btn.title:hover:before {
  color: #fff;
  background: none;
}
.secondary_color {
  background-color: var(--v-secondary-base);
}
.v-input__slot{
  padding-top: 10px
}
.top-down{
  padding-top: 20px;
  height: 80%;
}
</style>
