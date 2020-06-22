<template>
  <div>
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
        <v-col cols="12" xl="6" lg="6" md="6">
          <v-row class="mx-0">
            <div class="d-flex align-baseline">
              <v-text-field
                      id="pen-search-text-field"
                      v-model="penSearchId"
                      label="PEN:"
                      :disabled="isPenSearchDisabled"
                      clearable
                      class="pt-0"
                      @input="validatePen"
              ></v-text-field>
              <v-btn id="refresh-student-info" :disabled="isRefreshStudInfoDisabled" color="#38598a" :dark="isRefreshStudInfoDark" class="ml-2" @click="refreshStudentInfo">Refresh Student Info</v-btn>
            </div>
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
        <v-col cols="12" xl="6" lg="6" md="6" class="pb-0">
          <v-form ref="completeForm">
            <v-textarea
              id="complete-comment-textarea"
              name="description"
              label="Enter comment"
              v-model="request.completeComment"
              :rules="completedRules"
              filled
              clearable
              @input="replaceCompleteMacro"
              class="pa-0 ma-0"
              rows="6"
            ></v-textarea>
          </v-form>
          <v-row justify="end" class="pr-3 pb-2">
            <v-btn :disabled="isCompleteDisabled" color="#38598a" :dark="isCompleteDark" @click="sendChanges">Send Changes to Student</v-btn>
          </v-row>
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
      dialog: false,
    };
  },
  computed: {
    ...mapGetters('auth', ['userInfo']),
    ...mapGetters('app', ['selectedRequest', 'requestType', 'requestTypeLabel']),
    //...mapGetters(this.requestType, ['completeMacros']),
    actionName() {
      return 'SEND_UPDATE';
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
      return !this.enableCompleteButton || !this.enableActions || this.request.studentRequestStatusCode === 'DRAFT' || this.request.studentRequestStatusCode === 'ABANDONED';
    },
    isRefreshStudInfoDark(){
      return this.enableCompleteButton && this.enableActions && this.request.penRequestStatusCode!=='DRAFT' && this.request.penRequestStatusCode!=='ABANDONED';
    },
    isPenSearchDisabled(){
      return !this.enableCompleteButton || !this.enableActions || this.request.studentRequestStatusCode === 'DRAFT' || this.request.studentRequestStatusCode === 'ABANDONED';
    }
  },
  mounted() {
    this.isProvidePenEnabledForUser = AccessEnabledForUser(this.requestType, this.actionName, this.userInfo);
  },
  watch: {
    'request.completeComment': 'validateCompleteAction',
    'request.recordedPen': function(val) {
      this.penSearchId = val;
    }
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
      this.completedUpdateSuccess = null;
      this.request.reviewer = this.myself.name;
      this.request.studentRequestStatusCode = Statuses.studentRequest.COMPLETED;
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
          } else {
            this.notAPenError = true;
          }
        } else if (this.penSearchId.length > 9) {
          this.notAPenError = true;
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
    refreshStudentInfo() {
      this.notAPenError = false;
      if(this.penSearchId && this.penSearchId.length === 9) {
        this.validatePen();
      } else {
        this.notAPenError = true;
      }
    },
    differentDemographicsData(request, demographics) {
      return request.legalFirstName !== demographics.legalFirst ||
        request.legalMiddleNames !== demographics.legalMiddle ||
        request.legalLastName !== demographics.legalLast ||
        request.dob !== demographics.dob ||
        request.gender !== demographics.gender;
    },
  }
};
</script>
