<template>
  <div class="mb-1">
    <v-navigation-drawer
      v-model="drawer"
      clipped
      app
      color="#E9EBEF"
      width="15%"
      temporary
    >
      <v-list>
        <div
          v-for="(item) in items.filter(obj => obj.authorized)"
          :key="item.title"
        >
          <v-list-item
            v-if="!item.items"
            :id="stripWhitespace(item.title + `MenuBtn`)"
            :key="item.title+`1`"
            class="menuRow"
          >
            <router-link
              :to="{ name: item.link }"
              :target="item.newTab ? '_blank' : '_self'"
              class="router"
            >
              <v-list-item>
                <v-list-item-title
                  v-if="item.link === $route.name"
                  class="menuItem"
                >
                  <strong>{{ item.title }}</strong>
                </v-list-item-title>
                <v-list-item-title
                  v-else
                  class="menuItem"
                >
                  {{ item.title }}
                </v-list-item-title>
              </v-list-item>
            </router-link>
          </v-list-item>
          <v-list-group
            v-else
            :id="stripWhitespace(item.title) + `MenuBtn`"
            :key="item.title"
            no-action
            active-class="active"
            class="groupMenu"
            append-icon=""
            @click="setActive(item)"
          >
            <template #activator="{props}">
              <v-list-item
                v-bind="props"
              >
                <v-list-item-title
                  class="menuItem ml-4"
                  v-text="item.title"
                />
              </v-list-item>
            </template>

            <v-list-item
              v-for="subItem in item.items.filter(obj => obj.authorized)"
              :id="stripWhitespace(subItem.title) + `MenuBtn`"
              :key="subItem.title"
              class="subMenuRow pl-9"
            >
              <router-link
                :to="{ name: subItem.link }"
                :target="subItem.newTab ? '_blank' : '_self'"
                class="router"
              >
                <v-list-item>
                  <v-list-item-title
                    v-if="subItem.link === $route.name"
                    class="menuItem"
                  >
                    <strong>{{ subItem.title }}</strong>
                  </v-list-item-title>
                  <v-list-item-title
                    v-else
                    class="menuItem"
                    v-text="subItem.title"
                  />
                </v-list-item>
              </router-link>
            </v-list-item>
          </v-list-group>
        </div>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar
      id="navBar"
      absolute
      elevation="0"
      color="#38598A"
      style="z-index: 1001;"
      :dark="true"
      class="pl-12 pr-8"
    >
      <v-app-bar-nav-icon
        id="menuBtn"
        style="color: white"
        @click="drawer=true"
      >
        <v-icon v-if="!drawer">
          $menu
        </v-icon>
        <v-icon v-else>
          $close
        </v-icon>
        <p class="ma-0 pl-3 pr-2">
          Menu
        </p>
      </v-app-bar-nav-icon>
      <v-toolbar-title class="ml-4 nav-title pl-4">
        {{ title }}
      </v-toolbar-title>
      <v-spacer />
      <SetNavigation />
    </v-app-bar>
    <v-app-bar
      v-if="bannerColor"
      style="color: white; z-index: 1000;"
      :color="bannerColor"
      absolute
      density="compact"
    >
      <div>
        <h3 class="envBanner pl-5">
          {{ bannerEnvironment }} Environment
        </h3>
      </div>
    </v-app-bar>
  </div>
</template>

<script>
import {PAGE_TITLES, REQUEST_TYPES} from '../../utils/constants';
import {mapState} from 'pinia';
import SetNavigation from './SetNavigation.vue';
import {authStore} from '@/store/modules/auth';
import {appStore} from '@/store/modules/app';
import { PERMISSION, hasRequiredPermission } from '@/utils/constants/Permission';

export default {
  name: 'NavBar',
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
      bannerEnvironment: null,
      bannerColor: null
    };
  },
  async created() {
    appStore().getConfig().then(() => {
      this.bannerEnvironment = this.config.BANNER_ENVIRONMENT;
      this.bannerColor = this.config.BANNER_COLOR;
    });
  },
  computed: {
    ...mapState(appStore, ['config']),
    ...mapState(authStore, ['userInfo','isAuthorizedUser', 'ADVANCED_SEARCH_ROLE', 'VIEW_EDIT_PEN_REQUEST_BATCH_FILES_ROLE', 'EDIT_MACROS_ROLE', 'VIEW_GMP_REQUESTS_ROLE', 'VIEW_UMP_REQUESTS_ROLE', 'PROCESS_STUDENT_ROLE', 'VIEW_PEN_COORDINATOR_INFO_ROLE', 'NOMINAL_ROLL_ROLE', 'STAFF_ADMINISTRATION_ADMIN', 'HAS_STATS_ROLE', 'STUDENT_ANALYTICS_STUDENT_PROFILE', 'STUDENT_ANALYTICS_BATCH']),
    items() {
      return [
        {
          title: PAGE_TITLES.DASHBOARD,
          link: 'home',
          authorized: this.isAuthorizedUser
        },
        {
          title: PAGE_TITLES.STUDENT_REQUESTS,
          authorized: (this.VIEW_GMP_REQUESTS_ROLE || this.VIEW_UMP_REQUESTS_ROLE),
          items: [
            {
              title: PAGE_TITLES.GMP,
              link: REQUEST_TYPES.penRequest.label,
              authorized: this.VIEW_GMP_REQUESTS_ROLE
            },
            {
              title: PAGE_TITLES.UMP,
              link: REQUEST_TYPES.studentRequest.label,
              authorized: this.VIEW_UMP_REQUESTS_ROLE
            }
          ],
        },
        {
          title: PAGE_TITLES.STUDENT_SEARCH,
          link: 'basicSearch',
          authorized: this.ADVANCED_SEARCH_ROLE
        },
        {
          title: PAGE_TITLES.COMPARE_PENS,
          link: 'compare',
          authorized: this.PROCESS_STUDENT_ROLE
        },
        {
          title: PAGE_TITLES.PEN_REQ_FILES,
          link: 'penRequestBatch',
          authorized: this.VIEW_EDIT_PEN_REQUEST_BATCH_FILES_ROLE
        },
        {
          title: PAGE_TITLES.ARCHIVED_REQ_FILES,
          link: 'archivedRequestBatch',
          authorized: this.VIEW_EDIT_PEN_REQUEST_BATCH_FILES_ROLE
        },
        {
          title: PAGE_TITLES.PEN_COORDINATORS,
          link: 'studentRegistrationContacts',
          newTab: true,
          authorized: this.hasRequiredPermission(this.userInfo, PERMISSION.VIEW_REGISTRATION_CONTACTS_PERMISSION)
        },
        {
          title: PAGE_TITLES.EXCHANGE,
          authorized: this.hasRequiredPermission(this.userInfo, PERMISSION.MANAGE_EXCHANGE_INBOX_PERMISSION),
          items: [
            {
              title: 'PEN Team Inbox',
              link: 'exchange_inbox_MANAGE_EXCHANGE_PEN_INBOX_PERMISSION',
              authorized: this.hasRequiredPermission(this.userInfo, PERMISSION.MANAGE_EXCHANGE_PEN_INBOX_PERMISSION)
            }
          ]
        },
        {
          title: PAGE_TITLES.ADMINISTRATION,
          authorized: this.STAFF_ADMINISTRATION_ADMIN || this.hasRequiredPermission(this.userInfo, PERMISSION.MANAGE_EDX_DISTRICT_USERS_PERMISSION) || this.hasRequiredPermission(this.userInfo, PERMISSION.MANAGE_EDX_SCHOOL_USERS_PERMISSION),
          items: [
            {
              title: 'Macro Management',
              link: 'macros',
              authorized: this.EDIT_MACROS_ROLE
            },
            {
              title: 'EDX School Access',
              link: 'exchangeAccess',
              authorized: this.hasRequiredPermission(this.userInfo, PERMISSION.MANAGE_EDX_SCHOOL_USERS_PERMISSION)
            },
            {
              title: 'EDX District Access',
              link: 'exchangeDistrictAccess',
              authorized: this.hasRequiredPermission(this.userInfo, PERMISSION.MANAGE_EDX_DISTRICT_USERS_PERMISSION)
            }
          ],
        },
        {
          title: 'Institutions',
          authorized: this.hasRequiredPermission(this.userInfo, PERMISSION.VIEW_SCHOOL_PERMISSION) || this.hasRequiredPermission(this.userInfo, PERMISSION.VIEW_DISTRICT_PERMISSION) || this.hasRequiredPermission(this.userInfo, PERMISSION.VIEW_AUTHORITY_PERMISSION),
          items: [
            {
              title: 'Schools',
              link: 'instituteSchoolList',
              authorized: this.hasRequiredPermission(this.userInfo, PERMISSION.VIEW_SCHOOL_PERMISSION)
            },
            {
              title: 'Districts',
              link: 'instituteDistrict',
              authorized: this.hasRequiredPermission(this.userInfo, PERMISSION.VIEW_DISTRICT_PERMISSION)
            },
            {
              title: 'Authorities',
              link: 'instituteAuthoritiesList',
              authorized: this.hasRequiredPermission(this.userInfo, PERMISSION.VIEW_AUTHORITY_PERMISSION)
            }
          ],
        },
        {
          title: 'Nominal Roll',
          link: 'nominal-roll',
          authorized: this.NOMINAL_ROLL_ROLE
        },
        {
          title: PAGE_TITLES.ANALYTICS,
          authorized: this.HAS_STATS_ROLE,
          items: [
            {
              title: 'Dashboard',
              link: 'stats-dashboard',
              authorized: this.HAS_STATS_ROLE
            },
            {
              title: 'Get My PEN',
              link: 'analytics-gmp-stats',
              authorized: this.STUDENT_ANALYTICS_STUDENT_PROFILE
            },
            {
              title: 'Update My PEN',
              link: 'analytics-ump-stats',
              authorized: this.STUDENT_ANALYTICS_STUDENT_PROFILE
            },
            {
              title: 'New PENs',
              link: 'new-pens',
              authorized: this.STUDENT_ANALYTICS_BATCH
            },
            {
              title: 'Merges',
              link: 'merges',
              authorized: this.STUDENT_ANALYTICS_BATCH
            }
          ],
        },
        {
          title: PAGE_TITLES.DATA_COLLECTIONS,
          authorized: this.hasRequiredPermission(this.userInfo, PERMISSION.STUDENT_DATA_COLLECTION)
        }
      ];
    }
  },
  methods: {
    hasRequiredPermission,
    setActive(item) {
      let index = this.items.findIndex(obj => obj.title === item.title);
      if (item.active) {
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

.router:hover .v-list-item__content, /deep/ .v-list-group__header:hover .v-list-item__content, .router-link-exact-active {
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

:deep(.subMenuRow > div.v-list-item__append > i) {
    display: none;
}

:deep(.subMenuRow > div.v-list-item__content > a > div > div.v-list-item__append > i) {
    display: none;
}

.nav-title {
    font-size: 1.4rem;
    color: white;
}
</style>
