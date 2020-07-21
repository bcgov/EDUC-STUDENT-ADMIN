<template>
  <div>
    <v-alert
      v-model="alert"
      dense
      text
      dismissible
      outlined
      transition="scale-transition"
      :class="alertType"
    >
      {{ alertMessage }}
    </v-alert>
    <v-alert
      v-model="notAPenError"
      dense
      text
      dismissible
      outlined
      transition="scale-transition"
      class="bootstrap-error"
    >
      The provided PEN is not valid.
    </v-alert>

    <v-card flat :disabled="!isProvidePenEnabledForUser">
      <v-row class="mx-0"> 
        <v-col cols="12" xl="6" lg="6" class="py-0">
          <v-row class="mx-0" justify="space-between">
            <v-col class="my-0 pl-0 py-0">
              <v-text-field
                      id="pen-search-text-field"
                      v-model="penSearchId"
                      label="PEN:"
                      disabled
                      clearable
                      class="pt-0"
              ></v-text-field>
            </v-col>
            <v-col class="my-0 mr-0 pr-0 py-0">
              <v-row justify="end" class="ma-0 pt-3">
                <v-btn id="refresh-student-info" :disabled="isRefreshStudInfoDisabled" color="#38598a" :dark="isRefreshStudInfoDark" @click="refreshStudentInfo">Refresh Student Info</v-btn>
              </v-row>
            </v-col>
          </v-row>
          <v-row class="pr-3">
            <v-card class="ml-3" width="100%">
            <v-row no-gutters class="pt-2 px-2">
              <v-col cols="12" xl="3" lg="3" md="3" sm="3">
                <p class="mb-2">First:</p>
              </v-col>
              <v-col cols="12" xl="9" lg="9" md="9" sm="9">
                <p class="mb-2"><strong>{{ this.demographics.legalFirst || ''}}</strong></p>
              </v-col>
            </v-row>
            <v-row no-gutters class="pt-2 px-2">
              <v-col cols="12" xl="3" lg="3" md="3" sm="3">
                <p class="mb-2">Middle:</p>
              </v-col>
              <v-col cols="12" xl="9" lg="9" md="9" sm="9">
                <p class="mb-2"><strong>{{ this.demographics.legalMiddle || ''}}</strong></p>
              </v-col>
            </v-row>
            <v-row no-gutters class="pt-2 px-2">
              <v-col cols="12" xl="3" lg="3" md="3" sm="3">
                <p class="mb-2">Last:</p>
              </v-col>
              <v-col cols="12" xl="9" lg="9" md="9" sm="9">
                <p class="mb-2"><strong>{{ this.demographics.legalLast || ''}}</strong></p>
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
          </v-row>
        </v-col>
        <v-col cols="12" xl="6" lg="6" class="py-0 pl-0">
          <v-row justify="end" class="pr-3 pt-3">
            <v-btn :disabled="isCompleteDisabled" color="#38598a" :dark="isCompleteDark" @click="sendChanges">Send Changes to Student</v-btn>
          </v-row>
          <v-form ref="completeForm">
            <v-textarea
                    id="complete-comment-textarea"
                    name="description"
                    label="Enter comment"
                    v-model="request.completeComment"
                    filled
                    clearable
                    @input="replaceCompleteMacro"
                    class="pt-5"
                    rows="6"
            ></v-textarea>
          </v-form>
        </v-col>
      </v-row>
    </v-card>
    <v-dialog
      v-model="dialog"
      max-width="400"
    >
      <v-card>
        <div class="px-4 pt-4">
          <p>Changes to student demographics do not match request.</p>
        </div>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="#38598a"
            dark
            @click="confirmChanges"
          >
            Confirm
          </v-btn>
          <v-btn
            color="#38598a"
            dark
            @click="dialog = false"
          >
            Cancel
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import ApiService from '../../common/apiService';
import { Routes, Statuses } from '../../utils/constants';
import { replaceMacro } from '../../utils/macro';
import { mapGetters, mapMutations } from 'vuex';
import {AccessEnabledForUser} from '../../common/role-based-access';
export default {
  name: 'studentRequestComplete',
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
      notAPenError: false,
      penSearchId: null,
      autoPenResults: null,
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
      alert: false,
      alertMessage: null,
      alertType: null,
      completeSagaInProgress: false,
      dialog: false,
    };
  },
  computed: {
    ...mapGetters('auth', ['userInfo']),
    ...mapGetters('app', ['selectedRequest', 'requestType', 'requestTypeLabel']),
    ...mapGetters('notifications', ['notification']),
    //...mapGetters(this.requestType, ['completeMacros']),
    actionName() {
      return 'SEND_UPDATE';
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
    isCompleteDisabled() {
      return !this.enableCompleteButton || !this.enableActions || this.request.studentRequestStatusCode === 'DRAFT' || this.request.studentRequestStatusCode === 'ABANDONED';
    },
    isCompleteDark(){
      return this.enableCompleteButton && this.enableActions && this.request.penRequestStatusCode!=='DRAFT' && this.request.penRequestStatusCode!=='ABANDONED';
    },
    isRefreshStudInfoDisabled(){
      return !this.enableActions || this.request.studentRequestStatusCode === 'DRAFT' || this.request.studentRequestStatusCode === 'ABANDONED';
    },
    isRefreshStudInfoDark(){
      return this.enableActions && this.request.penRequestStatusCode!=='DRAFT' && this.request.penRequestStatusCode!=='ABANDONED';
    }
  },
  mounted() {
    this.isProvidePenEnabledForUser = AccessEnabledForUser(this.requestType, this.actionName, this.userInfo);
  },
  watch: {
    'request.completeComment': 'validateCompleteAction',
    'request.recordedPen': function(val) {
      this.penSearchId = val;
    },
    notification(val) {
      if (val) {
        const notificationData = JSON.parse(val);
        if (notificationData && notificationData.studentRequestID && notificationData.studentRequestID === this.requestId && notificationData.sagaStatus === 'COMPLETED') {
          if (notificationData.sagaName === 'STUDENT_PROFILE_COMPLETE_SAGA') {
            this.setSuccessAlert(`${this.requestTypeLabel} completed and email sent to student.`);
            this.completeSagaInProgress = false;
          }
        }
      }
    },
  },
  methods: {
    ...mapMutations('app', ['setRequest']),
    ...mapMutations('app', ['pushMessage']),
    setSuccessAlert(message) {
      this.alertMessage = message;
      this.alertType = 'bootstrap-success';
      this.alert = true;
    },
    setFailureAlert(message) {
      this.alertMessage = message;
      this.alertType = 'bootstrap-error';
      this.alert = true;
    },
    validateCompleteAction() {
      this.$refs.completeForm.validate();
    },
    replaceCompleteMacro() {
      this.request.completeComment = replaceMacro(this.request.completeComment, this.completeMacros);
    },
    sendChanges() {
      if(this.$refs.completeForm.validate()) {
        this.request.pen = this.penSearchId;

        if(this.differentDemographicsData(this.request, this.demographics)) {
          this.dialog = true;
        } else {
          this.completeRequest();
        }
      }
    },
    confirmChanges() {
      this.dialog = false;
      this.completeRequest();
    },
    completeRequest() {
      this.beforeSubmit();
      this.alert = false;
      this.request.reviewer = this.myself.name;
      ApiService.apiAxios
        .post(Routes[this.requestType].COMPLETE_URL, this.prepPut(this.requestId, this.request))
        .then(() => {
          this.setSuccessAlert('Your request to complete is accepted.');
          this.completeSagaInProgress = true;
        })
        .catch(error => {
          console.log(error);
          if (error.response.data && error.response.data.message && error.response.data.message.includes('saga in progress')) {
            this.setFailureAlert('Another saga is in progress for this request, please try again later.');
          } else {
            this.setFailureAlert(`${this.requestTypeLabel} failed to update. Please navigate to the list and select this ${this.requestTypeLabel} again.`);
          }
          this.submitted();
        });
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
    refreshStudentInfo() {
      this.notAPenError = false;
      if(this.penSearchId && this.penSearchId.length === 9) {
        this.searchByPen();
      } else {
        this.notAPenError = true;
      }
    },
    differentDemographicsData(request, demographics) {
      return request.legalFirstName !== demographics.legalFirst ||
        (request.legalMiddleNames && demographics.legalMiddle && request.legalMiddleNames !== demographics.legalMiddle) ||
        request.legalLastName !== demographics.legalLast ||
        request.dob !== demographics.dob ||
        request.genderCode !== demographics.gender;
    },
  }
};
</script>
