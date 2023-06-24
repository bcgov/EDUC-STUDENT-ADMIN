<template>
  <v-app-bar
    absolute
    color="rgb(0, 51, 102)"
    class="sysBar pl-10 pr-10"
    style="z-index: 1002;"
  >
    <!-- Navbar content -->
    <a
      tabindex="-1"
      href="/"
    >
      <img
        tabindex="-1"
        src="@/assets/images/bc-gov-logo.svg"
        width="155"
        class="logo"
        alt="B.C. Government Logo"
      >
    </a>
    <a
      v-if="authStore().isAuthenticated"
      tabindex="-1"
      href="/"
    >
      <v-toolbar-title><h3 style="color:white">{{ secureAppTitle }}</h3></v-toolbar-title>
    </a>
    <a
      v-else
      tabindex="-1"
      href="/"
    >
      <v-toolbar-title><h3 style="color:white">{{ appTitle }}</h3></v-toolbar-title>
    </a>

    <v-spacer />

    <div v-if="authStore().isAuthenticated && dataReady">
      <v-menu
        name="user_options"
        offset-y
      >
        <template #activator="{ props }">
          <v-chip
            v-bind="props"
            tabindex="0"
            pill
            color="#003366"
            dark
          >
            <v-avatar
              left
              color="info"
            >
              {{ userInfo.userName[0] }}
            </v-avatar>
            <span class="display-name pl-1">{{ userInfo.userName }}</span>
          </v-chip>
        </template>
        <v-list
          dark
          style="background-color: #003366; color: white"
        >
          <v-list-item
            id="logout_button"
            style="min-height: 4vh"
            :href="routes.LOGOUT"
          >
            <v-list-item-title>Logout</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </div>
  </v-app-bar>
</template>

<script>
import {mapState} from 'pinia';
import {Routes} from '@/utils/constants';
import {authStore} from '@/store/modules/auth';

export default {
  data() {
    return {
      appTitle: import.meta.env.VITE_VUE_APP_TITLE,
      secureAppTitle: import.meta.env.VITE_VUE_APP_SECURED_TITLE,
      routes: Routes
    };
  },
  created() {
    authStore().getUserInfo();
  },
  computed: {
    ...mapState(authStore, ['userInfo', 'isAuthenticated']),
    dataReady: function () {
      return this.userInfo;
    }
  },
  methods: {
    authStore
  }
};
</script>

<style>
.gov-header .v-icon {
    padding-left: 10px;
}

a {
    text-decoration: none;
}

.logo {
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

.v-input__slot {
    padding-top: 10px
}

.display-name{
  color: white;
}

.top-down {
    padding-top: 20px;
    height: 80%;
}
</style>
