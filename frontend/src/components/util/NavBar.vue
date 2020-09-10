<template>
<div class="mb-1">

  <v-navigation-drawer
          v-model="drawer"
          clipped
          app
          color="#E9EBEF"
          :style="`margin-top: ${$vuetify.application.top + $vuetify.application.bar}px`"
          width="30%"
          temporary>
    <v-list>
      <v-list-item
            v-for="item in items.filter(obj => !obj.items && obj.authorized)"
            :key="item.title+`1`"
            class="menuRow pl-10">
          <router-link v-if="!['todo'].includes(item.link)" :to="{ name: item.link }" class="router">
            <v-list-item-content>
              <v-list-item-title v-if="item.link === $route.name" class="menuItem"><strong>{{item.title}}</strong></v-list-item-title>
              <v-list-item-title v-else class="menuItem">{{item.title}}</v-list-item-title>
            </v-list-item-content>
          </router-link>
        <v-list-item-content v-else><!--REMOVE ONCE ALL LINKS ARE FINALIZED-->
          <v-list-item-title v-if="item.link === $route.name" class="menuItem"><strong>{{item.title}}</strong></v-list-item-title>
          <v-list-item-title v-else class="menuItem">{{item.title}}</v-list-item-title>
        </v-list-item-content>

      </v-list-item>
      <v-list-group
              v-for="(item) in items.filter(obj => obj.items)"
              :key="item.title"
              no-action
              active-class="active"
              class="groupMenu"
              append-icon=""
              @click="setActive(item)"
      >
        <template v-slot:activator>
          <v-list-item-content class="pl-6">
            <v-list-item-title v-text="item.title" class="menuItem"></v-list-item-title>
          </v-list-item-content>
          <v-icon color="#003366" v-if="!item.active">$plus</v-icon>
          <v-icon color="#003366" v-else>$minus</v-icon>
        </template>

        <v-list-item
                v-for="subItem in item.items.filter(obj => obj.authorized)"
                :key="subItem.title"
                class="subMenuRow pl-9"
        >
          <router-link v-if="!['todo'].includes(subItem.link)" :to="{ name: subItem.link }" class="router">
            <v-list-item-content>
              <v-list-item-title v-if="subItem.link === $route.name" class="menuItem"><strong>{{ subItem.title }}</strong></v-list-item-title>
              <v-list-item-title v-else v-text="subItem.title" class="menuItem"></v-list-item-title>
            </v-list-item-content>
          </router-link>
          <v-list-item-content v-else> <!--REMOVE ONCE ALL LINKS ARE FINALIZED-->
            <v-list-item-title v-if="subItem.link === $route.name" class="menuItem"><strong>{{ subItem.title }}</strong></v-list-item-title>
            <v-list-item-title v-else v-text="subItem.title" class="menuItem"></v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list-group>
    </v-list>
  </v-navigation-drawer>
  <v-app-bar app absolute elevation="0" color="#38598A" :dark="true" id="navBar" class="pl-10">
      <v-app-bar-nav-icon @click="drawer=true">
        <v-icon v-if="!drawer">$menu</v-icon>
        <v-icon v-else>$close</v-icon>
      </v-app-bar-nav-icon>Menu
    <v-toolbar-title class="ml-4">{{ title }}</v-toolbar-title>
  </v-app-bar>
</div>
</template>

<script>
import {PAGE_TITLES} from '../../utils/constants';
import { mapState } from 'vuex';
export default {
  name: 'navBar',
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
        title: PAGE_TITLES.STUDENT_SEARCH,
        link: 'basicSearch',
        authorized: this.isValidStudentSearchUser
      },
      {
        title: PAGE_TITLES.PEN_REQ_FILES,
        link: 'penRequestBatch',
        authorized: this.isValidPenRequestBatchUser
      },
      {
        title: 'Search Archived PEN Requests',
        link: 'todo',
        authorized: true //TODO fix when ready
      },
      {
        title: 'Compare PENs',
        link: 'todo',
        authorized: true //TODO fix when ready
      },
      {
        title: 'Infrequent Processes',
        active: false,
        items: [
          {
            title: 'Nominal Role',
            link: 'todo',
            authorized: true //TODO fix when ready
          },
          {
            title: 'Create New PEN',
            link: 'todo',
            authorized: true //TODO fix when ready
          }
        ],
      },
      {
        title: 'System Admin',
        active: false,
        items: [
          {
            title: 'TODO',
            link: 'todo',
            authorized: true //TODO fix when ready
          },
        ],
      },
    ];
  },
  computed: {
    ...mapState('auth', ['isAuthorizedUser', 'isValidStudentSearchUser', 'isValidPenRequestBatchUser'])
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
</style>
