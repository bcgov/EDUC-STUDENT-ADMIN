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
          <div v-if="!loading && secureExchange" :overlay=false>
            <v-row>
              <v-col class="pb-0 pt-0">
                <v-row class="mb-n4">
                  <v-col cols="12" class="pb-2 pt-2 pr-0">
                    <h3 class="subjectHeading">{{ secureExchange.subject }}</h3>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12" class="pb-1 pr-0">
                    <span class="ministryOwnershipTeamName" style="color: black">{{ secureExchange.contactName }}</span>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12" class="pt-0 pb-1 pr-0">
                    <span class="createDate" style="color: black">{{ secureExchange.createDate }}</span>
                  </v-col>
                </v-row>
              </v-col>
              <v-col class="pb-0 pt-0 d-flex justify-end">
                <v-row>
                  <v-col class="d-flex justify-end">
                    <v-card outlined color="transparent" class="mr-5">
                      <v-row>
                        <v-col>
                          <v-icon class="ml-n1" :color="getStatusColor(secureExchange.secureExchangeStatusCode)" dark>
                            mdi-circle-medium
                          </v-icon>
                          <span class="ml-n1">{{ secureExchange.secureExchangeStatusCode }}</span>
                        </v-col>
                      </v-row>
                      <v-row no-gutters>
                        <v-col>
                          <v-icon color="grey darken-3" size="medium" dark>
                            mdi-pound
                          </v-icon>
                          <span>{{ secureExchange.sequenceNumber }}</span>
                        </v-col>
                      </v-row>
                      </v-card>
                    <v-card outlined color="transparent">
                      <v-row>
                        <v-col>
                          <v-icon>{{ secureExchange.reviewer ? 'mdi-account-outline' : 'mdi-account-off-outline' }}</v-icon>
                          <span>{{ secureExchange.reviewer ? secureExchange.reviewer : 'Unclaimed' }}</span>
                        </v-col>
                      </v-row>
                      <v-row no-gutters>
                        <v-col>
                          <v-icon class="pr-1" color="grey darken-3" dark>mdi-clock-outline</v-icon>
                          <span class="mr-2">{{getNumberOfDays(secureExchange.createDate)}}</span>
                        </v-col>
                      </v-row>
                    </v-card>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
            <v-divider class="divider"></v-divider>
            <v-row>
                <v-speed-dial id="editOptionsMenu" v-if="isEditable()" v-model="editOptionsOpen" top left direction="right">
                  <template v-slot:activator>
                    <v-btn  id="editOptionsMenuBtn" class="mx-2" fab dark large color="#003366">
                      <v-icon v-if="editOptionsOpen" dark large>mdi-close</v-icon>
                      <v-icon v-else dark large>mdi-plus</v-icon>
                    </v-btn>
                  </template>
                  <v-card>
                    <v-btn id="newMessageToConvBtn" dark small color="green" @click="displayMessageField">
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
              <v-col class="d-flex justify-end">
                <v-btn :disabled="!isEditable()"   id="markAsButton" class="my-4" v-on:click="clickMarkAsButton" :loading="loadingReadStatus">
                  <v-icon v-if="secureExchange.isReadByExchangeContact">mdi-email-outline</v-icon>
                  <v-icon v-else>mdi-email-open-outline</v-icon>
                  <span class="ml-1 markAsSpan">{{`Mark As ${secureExchange.isReadByMinistry ? 'Unread' : 'Read'}` }}</span>
                </v-btn>
                <v-btn id="claimAsButton" class="my-4 mx-2">
                  <v-icon>{{ secureExchange.reviewer ? 'mdi-account-off-outline' : 'mdi-account-check-outline' }}</v-icon>
                  <span class="ml-1">{{ secureExchange.reviewer ? 'Unclaim' : 'Claim' }}</span>
                </v-btn>
                <v-btn id="changeStatusButton" class="my-4">
                  <span>Close</span>
                </v-btn>
              </v-col>
            </v-row>
            <v-row v-if="isNewMessageDisplayed">
              <v-card-text id="newMessageCardText" class="pb-0 pt-5">
                <v-textarea id="newMessageToConvTextArea"
                            outlined
                            solo
                            label="New Message..."
                            auto-grow
                            v-model="newMessage"
                            rows="8"
                            maxlength="4000"
                            class="pt-0"
                            ref="newMessageToConvTextArea"
                >
                </v-textarea>
              </v-card-text>
              <v-row class="py-4 justify-end pt-0 pr-8">
                <PrimaryButton id="cancelMessage" secondary text="Cancel" class="mr-2" @click.native="hideNewMessageField"></PrimaryButton>
                <PrimaryButton id="newMessagePostBtn" text="Send" width="8rem" :disabled="!newMessage" :loading="processing" @click.native="sendNewExchangeComment"></PrimaryButton>
              </v-row>
            </v-row>
            <v-row>
              <v-col>
                <v-timeline v-if="secureExchange.activities.length > 0" dense>
                  <div v-for="activity in secureExchange.activities"
                       :key="activity.secureExchangeCommentID">
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
import router from '@/router';
import PrimaryButton from '../util/PrimaryButton';
import {ChronoUnit, DateTimeFormatter, LocalDate} from '@js-joda/core';
import alertMixin from '@/mixins/alertMixin';


export default {
  name: 'MessageDisplay',
  mixins: [alertMixin],
  components: {PrimaryButton},
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
      isNewMessageDisplayed: false,
      processing: false,
      newMessage: ''
    };
  },
  computed: {},
  created() {
    this.getExchange(true);
  },
  methods: {
    displayMessageField() {
      this.isNewMessageDisplayed = true;
    },
    hideNewMessageField(){
      this.isNewMessageDisplayed = false;
      this.resetNewMessageForm();
    },
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
    clickMarkAsButton() {
      this.toggleIsReadByMinistry();
      router.push({name: 'exchange'});
    },
    isEditable() {
      return this.secureExchange.secureExchangeStatusCode !== 'Closed';
    },
    getStatusColor(status) {
      if (status === 'Open') {
        return 'green';
      }
      if (status === 'Closed') {
        return 'red';
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
    },
    getNumberOfDays(start) {
      const start_date = new LocalDate.parse(start, DateTimeFormatter.ofPattern('uuuu/MM/dd'));
      const end_date = LocalDate.now();

      return ChronoUnit.DAYS.between(start_date, end_date) + ' days';
    },
    resetNewMessageForm() {
      this.newMessage = '';
    },
    sendNewExchangeComment() {
      this.processing = true;
      const payload = {
        content: this.newMessage,
      };
      ApiService.apiAxios.post(Routes.edx.EXCHANGE_URL + `/${this.secureExchangeID}/comments`, payload)
        .then(() => {
          this.setSuccessAlert('Success! The message has been sent.');
          this.getExchange();
        })
        .catch(error => {
          console.error(error);
          this.setFailureAlert('An error occurred while sending message. Please try again later.');
        })
        .finally(() => {
          this.processing = false;
          this.isNewMessageDisplayed = false;
          this.resetNewMessageForm();
        });
    },
  }
};
</script>

<style scoped>
.subjectHeading {
  overflow-wrap: break-word;
}

@media screen and (max-width: 801px) {
  .subjectHeading {
    font-size: medium;
  }
}

.divider {
  border-color: #FCBA19;
  border-width: medium;
}
</style>
