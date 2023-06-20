<template>
    <v-system-bar app absolute color="rgb(0, 51, 102)" height="56rem" class="sysBar pl-10 pr-10">
      <!-- Navbar content -->
      <a tabindex="-1" href="/">
        <img
          tabindex="-1"
          src="@/assets/images/bc-gov-logo.svg"
          width="155"
          class="logo"
          alt="B.C. Government Logo"
        >
      </a>
      <a tabindex="-1" v-if="isAuthenticated" href="/">
        <v-toolbar-title><h3 style="color:white">{{ secureAppTitle }}</h3></v-toolbar-title>
      </a>
      <a tabindex="-1" v-else href="/">
        <v-toolbar-title><h3 style="color:white">{{ appTitle }}</h3></v-toolbar-title>
      </a>

      <v-spacer></v-spacer>

      <div v-if="isAuthenticated && dataReady">
        <v-menu name="user_options" offset-y>
          <template v-slot:activator="{ on }">
            <v-chip tabindex="-1" v-on="on" pill color="#003366" dark class="pr-0">
              <v-avatar left color="info">
                {{ userInfo.userName[0] }}
              </v-avatar>
              {{ userInfo.userName }}
            </v-chip>
          </template>
          <v-list dark color="#003366">
            <v-list-item id="logout_button" :href='routes.LOGOUT'><v-list-item-title>Logout</v-list-item-title></v-list-item>
          </v-list>
        </v-menu>

      </div>
      <div v-else-if="isAuthenticated && !dataReady">
        <v-skeleton-loader type="chip">
        </v-skeleton-loader>
      </div>
    </v-system-bar>
</template>

<script>
import { mapState } from 'pinia';
import { Routes } from '@/utils/constants';
import {authStore} from '@/store/modules/auth';
export default {
  data(){
    return {
      appTitle: process.env.VUE_APP_TITLE,
      secureAppTitle: process.env.VUE_APP_SECURED_TITLE,
      routes: Routes
    };
  },
  computed: {
    ...mapState(authStore, ['userInfo', 'isAuthenticated']),
    dataReady: function() {
      return this.userInfo;
    }
  },
  methods: {
  }
};
</script>

<style>
.gov-header .v-icon{
  padding-left: 10px;
}
a {
  text-decoration: none;
}
.logo{
  padding-right: 15px;
}
.gov-header .title {
  color: #fff;
  text-decoration: none;
}
.sysBar {
  border-bottom: 2px solid rgb(252, 186, 25) !important;
  z-index: 8;
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
