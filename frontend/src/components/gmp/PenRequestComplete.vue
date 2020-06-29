<template>
  <div>
    <v-alert
      :value="unlinkOperationSuccessful"
      dense
      text
      dismissible
      outlined
      transition="scale-transition"
      class="bootstrap-success" >
      {{unlinkMessage}}
    </v-alert>
    <v-alert
      :value="unlinkOperationSuccessful === false"
      dense
      text
      dismissible
      outlined
      transition="scale-transition"
      class="bootstrap-error">
     Your request to unlink could not be accepted. Please try again.
    </v-alert>
    <!-- This alert component is used to refresh the page automatically when saga is completed.-->
    <v-alert
      :value="false"
      dense
      text
      dismissible
      outlined
      transition="scale-transition"
      class="bootstrap-success" >
      {{notifications}}
    </v-alert>
    <v-alert
      :value="completedUpdateSuccess"
      dense
      text
      dismissible
      outlined
      transition="scale-transition"
      class="bootstrap-success"
    >
      {{`${requestTypeLabel} completed and email sent to student.`}}
    </v-alert>
    <v-alert
      :value="notAPenError"
      dense
      text
      dismissible
      outlined
      transition="scale-transition"
      class="bootstrap-error"
    >
      The provided PEN is not valid.
    </v-alert>
    <v-alert
      :value="completedUpdateSuccess === false"
      dense
      text
      dismissible
      outlined
      transition="scale-transition"
      class="bootstrap-error"
    >
      {{`${requestTypeLabel} failed to update. Please navigate to the list and select this ${requestTypeLabel} again.`}}
    </v-alert>
    <v-card flat :disabled="!isProvidePenEnabledForUser">
      <v-row class="mx-0">
          <v-col cols="12" xl="2" lg="2" md="2" class="py-0">
              <v-text-field
                      id="pen-search-text-field"
                      v-model="penSearchId"
                      :disabled="isProvidePenDisabled"
                      label="PEN:"
                      clearable
                      class="pt-0"
                      @input="validatePen"
              ></v-text-field>
          </v-col>
          <v-col cols="12" xl="2" lg="2" md="2" class="py-0" align-self="center">
              <span class="pt-4 pr-1" id="prior-pen-count" v-if="this.numberOfDuplicatePenRequests > 0"><span
                      class="red--text font-weight-bold">{{this.numberOfDuplicatePenRequests}}</span><span
                      class="red--text"> prior PEN Requests</span></span>
          </v-col>
        <v-col cols="12" xl="8" lg="8" md="8" class="py-0">
          <v-row>
            <v-col v-if="this.request.bcscAutoMatchOutcome === this.autoMatchCodes.ONE_MATCH" cols="2">
              <v-btn color="success" dark class="mr-4" @click="populateAutoMatchedPen">
                <v-icon class="pa-0" large>mdi-arrow-left-bold</v-icon>
              </v-btn>
            </v-col>
            <v-col align-self="center">
              <p v-if="this.request.pen || this.request.penRequestStatusCode === this.statusCodes.AUTO_MATCH || this.request.penRequestStatusCode === this.statusCodes.MANUAL_MATCH"></p>
              <p v-else-if="!this.request.bcscAutoMatchOutcome" class="text--darken-1 grey--text pa-0 ma-0">No auto-match performed for Basic BCeID</p>
              <p v-else-if="this.request.bcscAutoMatchOutcome === this.autoMatchCodes.ONE_MATCH" class="green--text pa-0 ma-0"><strong>{{ this.autoPenResults }}</strong> {{ this.request.bcscAutoMatchDetails.split(' ').slice(1).join(' ') }}</p>
              <p v-else class="orange--text pa-0 ma-0"><strong>{{ this.autoPenResults }}</strong> {{ this.request.bcscAutoMatchDetails.split(' ').slice(1).join(' ') }}</p>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
      <v-row>
        <v-col class="pt-0" cols="6" height="100%">
          <v-card class="ml-3">
            <v-row no-gutters class="pt-2 px-2">
              <v-col cols="12" xl="3" lg="3" md="3" sm="3">
                <p class="mb-2">Legal:</p>
              </v-col>
              <v-col cols="12" xl="9" lg="9" md="9" sm="9">
                <p v-if="!this.demographics.legalLast && !this.demographics.legalFirst && !this.demographics.legalMiddle" class="mb-2"></p>
                <p v-else class="mb-2"><strong>{{ this.demographics.legalLast ? this.demographics.legalLast: '(none)'}}, {{ this.demographics.legalFirst ? this.demographics.legalFirst: '(none)'}}, {{ this.demographics.legalMiddle ? this.demographics.legalMiddle: '(none)'}}</strong></p>
              </v-col>
            </v-row>
            <v-row no-gutters class="pt-2 px-2">
              <v-col cols="12" xl="3" lg="3" md="3" sm="3">
                <p class="mb-2">Usual:</p>
              </v-col>
              <v-col cols="12" xl="9" lg="9" md="9" sm="9">
                <p v-if="!this.demographics.usualLast && !this.demographics.usualFirst && !this.demographics.usualMiddle" class="mb-2"></p>
                <p v-else class="mb-2"><strong>{{ this.demographics.usualLast ? this.demographics.usualLast: '(none)'}}, {{ this.demographics.usualFirst ? this.demographics.usualFirst: '(none)'}}, {{ this.demographics.usualMiddle ? this.demographics.usualMiddle: '(none)'}}</strong></p>
              </v-col>
            </v-row>
            <v-row no-gutters class="pt-2 px-2">
              <v-col cols="12" xl="3" lg="3" md="3" sm="3">
                <p class="mb-2">DOB:</p>
              </v-col>
              <v-col cols="12" xl="9" lg="9" md="9" sm="9">
                <p class="mb-2"><strong>{{ this.demographics.dob }}</strong></p>
              </v-col>
            </v-row>
            <v-row no-gutters class="pt-2 px-2">
              <v-col cols="12" xl="3" lg="3" md="3" sm="3">
                <p class="mb-2">Gender:</p>
              </v-col>
              <v-col cols="12" xl="9" lg="9" md="9" sm="9">
                <p class="mb-2"><strong>{{ this.demographics.gender }}</strong></p>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
        <v-col class="pa-0 pr-6" cols="6">
          <v-form ref="completeForm">
            <v-textarea
              id="complete-comment-textarea"
              name="description"
              label="Enter comment"
              v-model="request.completeComment"
              :rules="completedRules"
              :disabled="isCompleteCommentDisabled"
              filled
              clearable
              @input="replaceCompleteMacro"
              class="pa-0 ma-0"
            ></v-textarea>
          </v-form>
        </v-col>
      </v-row>
      <v-row justify="end" class="px-4">
          <v-checkbox v-model="request.demogChanged" true-value="Y" false-value="N" justify="flex-end" class="pa-0" cols="12" label="Student demographics changed"></v-checkbox>
          <v-col cols="2" xl="2" lg="2" md="2" class="pt-3">
              <v-btn :disabled="!enableActions || !(request.penRequestStatusCode === 'MANUAL' || request.penRequestStatusCode === 'AUTO')" color="#38598a" justify="center" width="100%" :dark="enableActions && (request.penRequestStatusCode === 'MANUAL' || request.penRequestStatusCode === 'AUTO')" @click="unlinkRequest">Unlink</v-btn>
          </v-col>
        <v-col cols="3" xl="3" lg="3" md="3" class="pt-3">
          <v-btn :disabled="isCompleteDisabled" color="#38598a" justify="center" width="100%" :dark="isCompleteDark" @click="completeRequest">Provide PEN to Student</v-btn>
        </v-col>
      </v-row>
    </v-card>

  </div>
</template>

<script>
import ApiService from '../../common/apiService';
import { Routes, Statuses } from '../../utils/constants';
import { replaceMacro } from '../../utils/macro';
import { mapGetters, mapMutations } from 'vuex';
import {AccessEnabledForUser} from '../../common/role-based-access';
export default {
  name: 'penRequestComplete',
  props: {
    request: {
      type: Object,
      required: true
    },
    enableActions: {
      type: Boolean,
      required: true
    },
    prepPut: {
      type: Function,
      required: true
    },
    beforeSubmit: {
      type: Function,
      required: true
    },
    submitted: {
      type: Function,
      required: true
    },
    switchLoading: {
      type: Function,
      required: true
    }
    
  },
  data () {
    return {
      validForm: false,
      requiredRules: [v => !!v || 'Required'],
      completedUpdateSuccess:null,
      unlinkOperationSuccessful: null,
      unlinkMessage : null,
      notAPenError: false,
      penSearchId: null,
      demographics: {
        legalFirst: null,
        legalMiddle: null,
        legalLast: null,
        usualFirst: null,
        usualMiddle: null,
        usualLast: null,
        dob: null,
        gender: null
      },
      enableCompleteButton: false,
      numberOfDuplicatePenRequests:0,
      isProvidePenEnabledForUser:false,
    };
  },
  computed: {
    ...mapGetters('auth', ['userInfo']),
    ...mapGetters('app', ['selectedRequest', 'requestType', 'requestTypeLabel']),
    //...mapGetters(this.requestType, ['completeMacros']),
    actionName() {
      return 'PROVIDE_PEN';
    },
    autoMatchCodes() { 
      return Statuses.AUTO_MATCH_RESULT_CODES;
    },
    completedRules() {
      const rules = [];
      if (this.request.demogChanged==='Y') {
        const rule = v => !!v || 'Required';
        rules.push(rule);
      }
      return rules;
    },
    requestStatusCodeName() {
      return `${this.requestType}StatusCode`;
    },
    requestId() {
      return this.selectedRequest;
    },
    completeMacros() {
      return this.$store.getters[`${this.requestType}/completeMacros`];
    },
    statusCodes() {
      return Statuses[this.requestType];
    },
    myself() {
      return {
        name: this.userInfo.userName,
        id: this.userInfo.userGuid
      };
    },
    autoPenResults() {
      if(this.request.bcscAutoMatchDetails) {
        return this.request.bcscAutoMatchDetails.split(' ')[0];
      } else {
        return null;
      }
    },
    notifications() {
      let outcome = null;
      let notifications = this.$store.getters['notifications/notifications'];
      if (Array.isArray(notifications)) {
        for (let notification of notifications) {
          notification = JSON.parse(notification);
          if (notification && notification.penRequestID === this.requestId && notification.eventOutcome === 'SAGA_COMPLETED') {
            this.loadPenRequest();
            outcome = 'SAGA_COMPLETED';
            // eslint-disable-next-line
            this.unlinkMessage ='Your request to unlink is completed.';
          } else if (notification && notification.penRequestID === this.requestId) {
            outcome = notification.eventOutcome;
          }
        }
      }
      return outcome;
    },
    isCompleteDisabled() {
      return !this.enableCompleteButton || !this.enableActions || this.request.penRequestStatusCode === 'DRAFT' || this.request.penRequestStatusCode === 'ABANDONED';
    },
    isCompleteDark(){
      return this.enableCompleteButton && this.enableActions && this.request.penRequestStatusCode!=='DRAFT' && this.request.penRequestStatusCode!=='ABANDONED';
    },
    isProvidePenDisabled(){
      return !this.enableActions || this.request.penRequestStatusCode === 'DRAFT' || this.request.penRequestStatusCode === 'ABANDONED';
    },
    isCompleteCommentDisabled(){
      return !this.enableCompleteButton || !this.enableActions || this.request.penRequestStatusCode === 'DRAFT' || this.request.penRequestStatusCode === 'ABANDONED';
    }
  },
  mounted() {
    this.isProvidePenEnabledForUser = AccessEnabledForUser(this.requestType, this.actionName, this.userInfo);
  },
  watch: {
    'request.completeComment': 'validateCompleteAction'
  },
  methods: {
    ...mapMutations('app', ['setRequest']),
    ...mapMutations('app', ['pushMessage']),
    validateCompleteAction() {
      this.$refs.completeForm.validate();
    },
    replaceCompleteMacro() {
      this.request.completeComment = replaceMacro(this.request.completeComment, this.completeMacros);
    },
    completeRequest() {
      if(this.$refs.completeForm.validate()) {
        this.beforeSubmit();
        this.completedUpdateSuccess = null;
        this.request.pen = this.penSearchId;
        if (this.request.bcscAutoMatchOutcome === Statuses.AUTO_MATCH_RESULT_CODES.ONE_MATCH && this.autoPenResults === this.penSearchId) {
          this.request.bcscAutoMatchOutcome = Statuses.AUTO_MATCH_RESULT_CODES.RIGHT_PEN;
          this.request.bcscAutoMatchDetails = 'CORRECT auto-match to: ' + this.request.bcscAutoMatchDetails;
        } else if (this.request.bcscAutoMatchOutcome === Statuses.AUTO_MATCH_RESULT_CODES.ONE_MATCH && this.autoPenResults !== this.penSearchId) {
          this.request.bcscAutoMatchOutcome = Statuses.AUTO_MATCH_RESULT_CODES.WRONG_PEN;
          this.request.bcscAutoMatchDetails = 'WRONG auto-match to: ' + this.request.bcscAutoMatchDetails;
        }
        this.request.reviewer = this.myself.name;
        ApiService.apiAxios
          .post(Routes[this.requestType].COMPLETE_URL, this.prepPut(this.requestId, this.request))
          .then(response => {
            this.setRequest(response.data);
            this.completedUpdateSuccess = true;
          })
          .catch(error => {
            console.log(error);
            this.completedUpdateSuccess = false;
          })
          .finally(() => {
            this.submitted();
          });
      }
    },
    unlinkRequest() {
      this.beforeSubmit();
      this.unlinkOperationSuccessful = null;
      this.request.reviewer = this.myself.name;
      ApiService.apiAxios
        .post(Routes[this.requestType].UNLINK_URL, this.prepPut(this.requestId, this.request))
        .then(() => {
          this.unlinkOperationSuccessful = true;
          this.unlinkMessage ='Your request to unlink is accepted.';
        })
        .catch(error => {
          console.log(error);
          this.unlinkOperationSuccessful = false;
        })
        .finally(() => {
          this.submitted();
        });
    },
    loadPenRequest(){
      ApiService.apiAxios
        .get(Routes[this.requestType].ROOT_ENDPOINT + '/' + this.requestId)
        .then(response => {
          this.setRequest(response.data);
          if(this.request[this.requestStatusCodeName] === this.statusCodes.REJECTED) {
            this.activeTab = 2;
          }
        })
        .catch(error => {
          console.log(error);
        })
        .finally(() => {
          this.submitted();
        });
    },
    validatePen() {
      this.notAPenError = false;
      this.demographics.legalFirst = null;
      this.demographics.legalMiddle = null;
      this.demographics.legalLast = null;
      this.demographics.usualFirst = null;
      this.demographics.usualMiddle = null;
      this.demographics.usualLast = null;
      this.demographics.dob = null;
      this.demographics.gender = null;
      this.enableCompleteButton = false;
      this.numberOfDuplicatePenRequests=0;
      if(this.penSearchId) {
        if (this.penSearchId.length === 9) {
          if (this.checkDigit()) {
            this.searchByPen();
            this.searchDuplicatePenRequestsByPen();
          } else {
            this.notAPenError = true;
          }
        }
      }
    },
    checkDigit() {
      const penDigits = [];
      for(let i = 0; i < this.penSearchId.length; i++) {
        penDigits[i] = parseInt(this.penSearchId.charAt(i), 10);
      }
      const S1 = penDigits.slice(0,-1).filter((element,index) => {return index % 2 === 0;}).reduce((a,b) => a+b,0);
      const A = parseInt(penDigits.slice(0,-1).filter((element,index) => {return index % 2 === 1;}).join(''), 10);
      const B = 2 * A;
      let S2 = B.toString().split('').map(Number).reduce(function (a, b) {return a + b;}, 0);
      const S3 = S1 + S2;
      if((S3 % 10) === 0) {
        return penDigits.pop() === 0;
      }
      return penDigits.pop() === (10 - (S3%10));
    },
    searchByPen() {
      this.switchLoading(true);
      ApiService.apiAxios
        .get(Routes.SEARCH_BY_PEN + '/' + this.penSearchId)
        .then(response => {
          this.demographics = response.data;
          this.enableCompleteButton = true;
        })
        .catch(error => {
          console.log(error);
        })
        .finally(() => {
          this.switchLoading(false);
        });
    },
    searchDuplicatePenRequestsByPen() {
      this.switchLoading(true);
      const params={
        pen :this.penSearchId
      };
      ApiService.apiAxios
        .get(`${Routes[this.requestType].DUPLICATE_REQUESTS_URL}`,{params})
        .then(response => {
          if(response && response.data > 0){
            this.numberOfDuplicatePenRequests=response.data;
          }
        }).catch(error => {
          console.log(error);
        }).finally(() => {
          this.switchLoading(false);
        });
    },
    populateAutoMatchedPen() {
      this.penSearchId = this.autoPenResults;
      this.validatePen();
    },
  }
};
</script>
