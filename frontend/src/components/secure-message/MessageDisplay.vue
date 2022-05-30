<template>
  <v-container fluid>
    <div style="width: 100%;" :overlay=false>
      <v-row class="pt-0"
             :class="{'mr-0 ml-0': $vuetify.breakpoint.smAndDown, 'mr-3 ml-3': $vuetify.breakpoint.mdAndUp}">
        <v-col cols="12 pt-0">
          <v-progress-linear
              absolute
              top
              indeterminate
              color="blue"
              :active="loading"
          ></v-progress-linear>
          <div v-if="!loading && secureExchange" style="width: 100%;" :overlay=false>
            <v-row class="secureExchangeHeader" style="border-bottom: 5px solid rgb(252, 186, 25) !important">
              <v-col cols="7" md="10" class="pb-0 pt-0">
                <v-row class="mb-n4">
                  <v-col cols="12" class="pb-2 pt-2 pr-0">
                    <h3 class="subjectHeading">{{ secureExchange.subject }}</h3>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12" class="pb-1 pr-0">
                    <span class="ministryOwnershipTeamName" style="color: black">{{ secureExchange.ministryOwnershipTeamName }}</span>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12" class="pt-0 pb-1 pr-0">
                    <span class="createDate" style="color: black">{{ secureExchange.createDate }}</span>
                  </v-col>
                </v-row>
              </v-col>
              <v-col cols="5" md="2" style="text-align: end" class="pb-0 pt-0">
                <v-row class="mb-n4" no-gutters>
                  <v-col cols="12">
                      <v-icon>{{ secureExchange.reviewer ? 'mdi-account-outline' : 'mdi-account-off-outline' }}</v-icon>
                      <span class="ml-1">{{ secureExchange.reviewer ? secureExchange.reviewer : 'Unclaimed' }}</span>
                  </v-col>
                  <v-col cols="12">
                    <v-icon class="pb-1" :color="getStatusColor(secureExchange.secureExchangeStatusCode)" right dark>
                      mdi-circle-medium
                    </v-icon>
                    <span class="secureExchangeStatusCode">{{ secureExchange.secureExchangeStatusCode }}</span>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12">
                    <v-icon style="margin-bottom: 0.15em" color="grey darken-3" right size="medium" dark>
                      mdi-pound
                    </v-icon>
                    <span class="sequenceNumber">{{ secureExchange.sequenceNumber }}</span>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
            <v-row>
              <v-speed-dial id="editOptionsMenu" v-if="isEditable()" v-model="editOptionsOpen" top left direction="right">
                <template v-slot:activator>
                  <v-btn class="mx-2" fab dark large color="#003366">
                    <v-icon v-if="editOptionsOpen" dark large>mdi-close</v-icon>
                    <v-icon v-else dark large>mdi-plus</v-icon>
                  </v-btn>
                </template>
                <v-card>
                  <v-btn dark small color="green">
                    <v-icon>mdi-email-outline</v-icon>
                    <span class="ml-1">Message</span>
                  </v-btn>
                  <v-btn dark small color="indigo">
                    <v-icon>mdi-paperclip</v-icon>
                    <span class="ml-1">Document</span>
                  </v-btn>
                  <v-btn dark small color="rgb(252, 186, 25)">
                    <v-icon>mdi-emoticon-happy-outline</v-icon>
                    <span class="ml-1">Student</span>
                  </v-btn>
                </v-card>
              </v-speed-dial>
              <v-spacer></v-spacer>
              <v-btn id="markAsButton" class="my-4" v-on:click="toggleIsReadByMinistry" :loading="loadingReadStatus">
                <v-icon v-if="secureExchange.isReadByExchangeContact">mdi-email-outline</v-icon>
                <v-icon v-else>mdi-email-open-outline</v-icon>
                <span class="ml-1 markAsSpan">{{`Mark As ${secureExchange.isReadByMinistry ? 'Unread' : 'Read'}` }}</span>
              </v-btn>
              <v-btn id="claimAsButton" class="my-4">
                <v-icon>{{ secureExchange.reviewer ? 'mdi-account-off-outline' : 'mdi-account-check-outline' }}</v-icon>
                <span class="ml-1">{{ secureExchange.reviewer ? 'Unclaim' : 'Claim' }}</span>
              </v-btn>
              <v-btn id="changeStatusButton" class="my-4">
                <span class="ml-1">Complete</span>
              </v-btn>
            </v-row>
            <v-row>
              <v-col>
                <v-timeline v-if="secureExchange.activities.length > 0" dense>
                  <div v-for="activity in secureExchange.activities"
                       :key="activity.secureExchangeID">
                    <v-timeline-item large :color="getActivityColour(activity)" :icon="getActivityIcon(activity)">
                      <v-card>
                        <v-card-title>
                          <div class="activityTitle">{{ activity.title }}</div>
                          <v-spacer></v-spacer>
                          <div class="activityDisplayDate">{{ activity.displayDate }}</div>
                        </v-card-title>
                        <v-card-text class="activityContent">{{ activity.content }}</v-card-text>
                      </v-card>
                    </v-timeline-item>
                  </div>
                </v-timeline>
              </v-col>
            </v-row>
          </div>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script>

import ApiService from '../../common/apiService';
import {Routes} from '@/utils/constants';

export default {
  name: 'MessageDisplay',
  components: {},
  props: {
    secureExchangeID: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      secureExchange: null,
      loading: true,
      loadingReadStatus: false,
      editOptionsOpen: false,
    };
  },
  computed: {},
  created() {
    this.getExchange(true);
  },
  methods: {
    getExchange(initialLoad = false) {
      this.loading = true;
      ApiService.apiAxios.get(Routes.edx.EXCHANGE_URL + `/${this.secureExchangeID}`)
        .then(response => {
          //Always set secure exchange as read by ministry if this is the first load
          if (initialLoad && !response.data.isReadByMinistry) {
            this.toggleIsReadByMinistry();
          } else {
            this.secureExchange = response.data;
          }
        })
        .catch(error => {
          console.log(error);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    toggleIsReadByMinistry() {
      this.loadingReadStatus = true;
      ApiService.apiAxios.put(Routes.edx.EXCHANGE_URL + `/${this.secureExchangeID}/markAs`)
        .then((response) => {
          this.secureExchange = response.data;
        })
        .catch(error => {
          console.log(error);
        })
        .finally(() => {
          this.loadingReadStatus = false;
        });
    },
    isEditable() {
      return this.secureExchange.secureExchangeStatusCode !== 'Complete';
    },
    getStatusColor(status) {
      if (status === 'New') {
        return 'blue';
      }
      if (status === 'In Progress') {
        return 'yellow darken-2';
      }
      if (status === 'Complete') {
        return 'green';
      }
    },
    getActivityColour(activity) {
      return activity.actor === 'school' ? 'rgb(252, 186, 25)' : 'rgb(0, 51, 102)';
    },
    getActivityIcon(activity) {
      switch (activity.type) {
      case 'message':
        return 'mdi-email-outline';
      case 'document':
        return 'md-paperclip';
      case 'student':
        return 'mdi-emoticon-happy-outline';
      default:
        return '';
      }
    }
  }
};
</script>

<style>
.subjectHeading {
  overflow-wrap: break-word;
}

@media screen and (max-width: 801px) {
  .subjectHeading {
    font-size: medium;
  }
}
</style>
