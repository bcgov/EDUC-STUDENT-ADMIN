<template>
<div class="mb-1">

  <v-navigation-drawer
          v-model="drawer"
          clipped
          app
          color="#E9EBEF"
          :style="`margin-top: ${$vuetify.application.top + $vuetify.application.bar}px`"
          width="15%"
          temporary>
    <v-list>
      <div v-for="(item) in items" v-bind:key="item">
      <v-list-item v-if="!item.items"
            :key="item.title+`1`"
            class="menuRow"
            :id="stripWhitespace(item.title + `MenuBtn`)">
          <router-link :to="{ name: item.link }" class="router">
            <v-list-item-content>
              <v-list-item-title v-if="item.link === $route.name" class="menuItem"><strong>{{item.title}}</strong></v-list-item-title>
              <v-list-item-title v-else class="menuItem">{{item.title}}</v-list-item-title>
            </v-list-item-content>
          </router-link>
      </v-list-item>
      <v-list-group
              v-else
              :key="item.title"
              no-action
              active-class="active"
              class="groupMenu"
              :id="stripWhitespace(item.title) + `MenuBtn`"
              append-icon=""
              @click="setActive(item)"
      >
        <template v-slot:activator>
          <v-list-item-content>
            <v-list-item-title v-text="item.title" class="menuItem"></v-list-item-title>
          </v-list-item-content>
          <v-icon color="#003366" v-if="!item.active">$plus</v-icon>
          <v-icon color="#003366" v-else>$minus</v-icon>
        </template>

        <v-list-item
                v-for="subItem in item.items"
                :key="subItem.title"
                class="subMenuRow pl-9"
                :id="stripWhitespace(subItem.title) + `MenuBtn`"
        >
          <router-link :to="{ name: subItem.link }" class="router">
            <v-list-item-content>
              <v-list-item-title v-if="subItem.link === $route.name" class="menuItem"><strong>{{ subItem.title }}</strong></v-list-item-title>
              <v-list-item-title v-else v-text="subItem.title" class="menuItem"></v-list-item-title>
            </v-list-item-content>
          </router-link>
        </v-list-item>
      </v-list-group>
      </div>
    </v-list>
  </v-navigation-drawer>
  <v-app-bar app absolute elevation="0" color="#38598A" :dark="true" id="navBar" class="pl-16 pr-8">
    <v-app-bar-nav-icon id="menuBtn" @click="drawer=true">
      <v-icon v-if="!drawer">$menu</v-icon>
      <v-icon v-else>$close</v-icon>
      <p class="ma-0 pl-4 pr-2">Menu</p>
    </v-app-bar-nav-icon>
    <v-toolbar-title class="ml-4 nav-title">{{ title }}</v-toolbar-title>
    <v-spacer></v-spacer>
    <SetNavigation/>
  </v-app-bar>
</div>
</template>

<script>
import {PAGE_TITLES, REQUEST_TYPES} from '../../utils/constants';
import { mapState } from 'vuex';
import SetNavigation from './SetNavigation';
export default {
  name: 'navBar',
  components: {
    SetNavigation,
  },
  props: {
    title: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      drawer: null,
      items: []
    };
  },
  mounted() {
    this.items = [
      {
        title: PAGE_TITLES.DASHBOARD,
        link: 'home',
        authorized: this.isAuthorizedUser
      },
      {
        title: PAGE_TITLES.STUDENT_REQUESTS,
        authorized: this.isAuthorizedUser,
        items: [
          {
            title: PAGE_TITLES.GMP,
            link: REQUEST_TYPES.penRequest.label,
            authorized: this.isAuthorizedUser
          },
          {
            title: PAGE_TITLES.UMP,
            link: REQUEST_TYPES.studentRequest.label,
            authorized: this.isAuthorizedUser
          }
        ],
      },
      {
        title: PAGE_TITLES.STUDENT_SEARCH,
        link: 'basicSearch',
        authorized: this.isValidStudentSearchUser
      },
      {
        title: PAGE_TITLES.COMPARE_PENS,
        link: 'compare',
        authorized: this.isValidStudentSearchUser
      },
      {
        title: PAGE_TITLES.PEN_REQ_FILES,
        link: 'penRequestBatch',
        authorized: this.isValidPenRequestBatchUser
      },
      {
        title: PAGE_TITLES.ARCHIVED_REQ_FILES,
        link: 'archivedRequestBatch',
        authorized: this.isValidPenRequestBatchUser
      },
      {
        title: PAGE_TITLES.PEN_COORDINATORS,
        link: 'home',
        authorized: true
      },
      {
        title: PAGE_TITLES.ADMINISTRATION,
        authorized: this.isValidStaffAdministrationUser,
        items: [
          {
            title: 'Macro Management',
            link: 'home',
            authorized: this.isValidStaffAdministrationUser
          },
          {
            title: 'Role Management',
            link: 'home',
            authorized: this.isValidStaffAdministrationUser
          }
        ],
      }
    ];
  },
  computed: {
    ...mapState('auth', ['isAuthorizedUser', 'isValidStudentSearchUser', 'isValidPenRequestBatchUser', 'isValidStaffAdministrationUser'])
  },
  methods: {
    setActive(item) {
      let index = this.items.findIndex(obj => obj.title === item.title);
      if(item.active) {
        this.items[index].active = false;
      } else {
        this.items.filter(obj => obj.items && obj.active).forEach(obj => obj.active = !obj.active);
        this.items[index].active = true;
      }
    },
    stripWhitespace(title) {
      return title.replace(/\s+/g, '');
    }
  }
};
</script>
<style scoped>
  #navBar {
    z-index: 7;
  }
  .router {
    width: 100%;
  }
  .menuItem {
    color: #003366;
  }
  .menuRow, .groupMenu {
    border-bottom: 2px solid #d2d2d2;
  }
  .router:hover .v-list-item__content, /deep/.v-list-group__header:hover .v-list-item__content, .router-link-exact-active {
    text-decoration: underline #003366;
  }
  .subMenuRow {
    border-top: 2px solid #d2d2d2;
    border-left: 4px solid #FCBA19;
    background-color: white;
  }
  .menuRow /deep/ i {
    color: #003366;
  }
  /deep/ .active {
    border-left: 4px solid #FCBA19;
    background-color: white;
  }
  header /deep/ .v-toolbar__content {
    padding-left: 0 !important;
  }
  /deep/ .v-list-group__header:before {
    background-color: #E9EBEF;
  }

  .nav-title {
    font-size: 1.4rem;
  }
</style>
