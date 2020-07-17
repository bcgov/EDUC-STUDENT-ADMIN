<template>
  <div>
    <v-alert
      :value="rejectAlertSuccess"
      dense
      text
      dismissible
      outlined
      transition="scale-transition"
      class="bootstrap-success"
    >
      {{`${requestTypeLabel} updated and email sent to student.`}}
    </v-alert>
    <v-alert
      :value="rejectAlertFailure"
      dense
      text
      dismissible
      outlined
      transition="scale-transition"
      class="bootstrap-error"
    >
      {{`${requestTypeLabel} failed to update. Please navigate to the list and select this ${requestTypeLabel} again.`}}
    </v-alert>
    <v-alert
      :value="rejectAlertWarning"
      dense
      text
      dismissible
      outlined
      transition="scale-transition"
      class="bootstrap-warning"
    >
      {{`${requestTypeLabel} updated, but email to student failed. Please contact support.`}}
    </v-alert>
    <v-alert
      :value="rejectOperationSuccessful"
      dense
      text
      dismissible
      outlined
      transition="scale-transition"
      class="bootstrap-success" >
      {{rejectOperationOutcomeMessage}}
    </v-alert>
    <v-alert
      :value="rejectOperationSuccessful === false"
      dense
      text
      dismissible
      outlined
      transition="scale-transition"
      class="bootstrap-error">
      {{rejectOperationOutcomeMessage}}
    </v-alert>
    <v-card flat class="pa-3" :disabled="!isRejectEnabledForUser">
      <v-form ref="form" v-model="validForm">
        <v-card-text class="pa-0">
          <v-row class="ma-0">
            <v-textarea
              id="reject-comment-textarea"
              name="description"
              label="Enter reject reason"
              v-model="rejectComment"
              :rules="requiredRules"
              filled
              clearable
              auto-grow
              @input="replaceRejectMacro"
              class="pa-0 ma-0"
            ></v-textarea>
          </v-row>
          <v-row justify="end" align-content="end">
            <v-col cols="12" xl="3" lg="5" md="5" class="py-0" justify="end" align-content="end">
              <v-btn color="#38598a" :disabled="isRejectDisabled" :dark="isRejectDark" justify="center" width="100%" @click="submitReject">Reject</v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-form>
    </v-card>
  </div>
</template>

<script>
import ApiService from '../common/apiService';
import { Routes, Statuses } from '../utils/constants';
import { replaceMacro } from '../utils/macro';
import {mapGetters, mapMutations} from 'vuex';
import {AccessEnabledForUser} from '../common/role-based-access';
export default {
  name: 'requestReject',
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
  },
  data () {
    return {
      validForm: false,
      requiredRules: [v => !!v || 'Required'],
      rejectAlertSuccess: false,
      rejectAlertFailure: false,
      rejectAlertWarning: false,
      rejectComment: null,
      isRejectEnabledForUser:false,
      rejectOperationSuccessful: null,
      rejectOperationOutcomeMessage : null,
    };
  },
  computed: {
    ...mapGetters('auth', ['userInfo']),
    ...mapGetters('app', ['selectedRequest', 'requestType', 'requestTypeLabel']),
    ...mapGetters('notifications', ['notification']),
    requestStatusCodeName() {
      return `${this.requestType}StatusCode`;
    },
    requestId() {
      return this.selectedRequest;
    },
    rejectMacros() {
      return this.$store.getters[`${this.requestType}/rejectMacros`];
    },
    myself() {
      return {
        name: this.userInfo.userName,
        id: this.userInfo.userGuid
      };
    },
    isRejectDisabled() {
      return !this.enableActions || this.request[this.requestStatusCodeName] === 'ABANDONED';
    },
    isRejectDark() {
      return this.enableActions && this.request[this.requestStatusCodeName] !== 'ABANDONED';
    },

  },
  watch: {
    notification(val) {
      if (val) {
        let notificationData = JSON.parse(val);
        if (notificationData[`${this.requestType}ID`] && notificationData[`${this.requestType}ID`] === this.requestId && notificationData.sagaStatus === 'COMPLETED'
          && (notificationData.sagaName === 'PEN_REQUEST_REJECT_SAGA' || notificationData.sagaName === 'STUDENT_PROFILE_REJECT_SAGA') ) {
          this.rejectOperationSuccessful = true;
          this.rejectOperationOutcomeMessage = 'Your request to reject is now completed.';
        }
      }
    }
  },
  mounted() {
    this.isRejectEnabledForUser = AccessEnabledForUser(this.requestType, 'REJECT_REQUEST', this.userInfo);
    this.rejectComment = this.request.failureReason;
  },
  methods: {
    ...mapMutations('app', ['setRequest']),
    replaceRejectMacro() {
      this.rejectComment = replaceMacro(this.rejectComment, this.rejectMacros);
    },
    submitReject() {
      this.rejectOperationSuccessful = null;
      this.rejectOperationOutcomeMessage = null;
      if (this.$refs.form.validate()) {
        this.beforeSubmit();
        this.request.failureReason = this.rejectComment;
        this.request.reviewer = this.myself.name;
        ApiService.apiAxios
          .post(Routes[this.requestType].REJECT_URL, this.prepPut(this.requestId, this.request))
          .then(() => {
            this.rejectOperationSuccessful = true;
            this.rejectOperationOutcomeMessage = 'Your request to reject is accepted.';
          })
          .catch(error => {
            console.log(error);
            if (error.response.data && error.response.data.message && error.response.data.message.includes('saga in progress')) {
              this.rejectOperationSuccessful = false;
              this.rejectOperationOutcomeMessage = 'Another saga is in progress for this request, please try again later.';
            } else {
              this.rejectOperationSuccessful = false;
              this.rejectOperationOutcomeMessage = 'Your request to reject could not be accepted, please try again later.';
            }
            this.submitted();
          });
      }
    }
  }
};
</script>
