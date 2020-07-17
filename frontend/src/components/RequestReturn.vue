<template>
  <div>
    <v-alert
      :value="returnAlertSuccess"
      dense
      text
      dismissible
      outlined
      transition="scale-transition"
      class="bootstrap-success"
    >
      {{`${requestTypeLabel} status updated and email sent to student.`}}
    </v-alert>
    <v-alert
      :value="returnAlertFailure"
      dense
      text
      dismissible
      outlined
      transition="scale-transition"
      class="bootstrap-error"
    >
      {{`${requestTypeLabel} failed to update status. Please navigate to the list and select this ${requestTypeLabel} again.`}}
    </v-alert>
    <v-alert
      :value="returnAlertWarning"
      dense
      text
      dismissible
      outlined
      transition="scale-transition"
      class="bootstrap-warning"
    >
      {{`${requestTypeLabel} status and comment updated, but email to student failed. Please contact support.`}}
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
      {{notification}}
    </v-alert>
    <v-alert
      :value="returnOperationSuccessful"
      dense
      text
      dismissible
      outlined
      transition="scale-transition"
      class="bootstrap-success" >
      {{returnMessage}}
    </v-alert>
    <v-alert
      :value="returnOperationSuccessful === false"
      dense
      text
      dismissible
      outlined
      transition="scale-transition"
      class="bootstrap-error">
      {{returnMessage}}
    </v-alert>
    <v-card flat class="pa-3" :disabled="!isRequestMoreInfoEnabledForUser">
      <v-form ref="returnForm">
        <v-card-text class="pa-0">
          <v-row class="ma-0">
            <v-textarea
              id="return-comment-textarea"
              name="description"
              label="Enter return reason"
              v-model="returnComment"
              :rules="requiredRules"
              filled
              clearable
              auto-grow
              @input="replaceReturnMacro"
              class="pa-0 ma-0"
            ></v-textarea>
          </v-row>
          <v-row justify="end" align-content="end">
            <v-col cols="12" xl="3" lg="5" md="5" class="py-0" justify="end" align-content="end">
              <v-btn :disabled="isReturnToStudentDisabled" color="#38598a" :dark="isReturnToStudentDark" justify="center" width="100%" @click="returnToStudent">Return to Student</v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-form>
    </v-card>
  </div>
</template>

<script>
import ApiService from '../common/apiService';
import { Routes } from '../utils/constants';
import { replaceMacro } from '../utils/macro';
import { mapGetters, mapMutations } from 'vuex';
import {AccessEnabledForUser} from '../common/role-based-access';
export default {
  name: 'requestReturn',
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
      returnAlertSuccess: false,
      returnAlertFailure: false,
      returnAlertWarning: false,
      returnComment: null,
      isRequestMoreInfoEnabledForUser:false,
      returnOperationSuccessful: null,
      returnMessage : null,
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
    returnMacros() {
      return this.$store.getters[`${this.requestType}/returnMacros`];
    },
    myself() {
      return {
        name: this.userInfo.userName,
        id: this.userInfo.userGuid
      };
    },
    isReturnToStudentDisabled() {
      return !this.enableActions || this.request[this.requestStatusCodeName] === 'DRAFT' || this.request[this.requestStatusCodeName] === 'ABANDONED';
    },
    isReturnToStudentDark() {
      return this.enableActions && this.request[this.requestStatusCodeName] !== 'DRAFT' && this.request[this.requestStatusCodeName] !== 'ABANDONED';
    },

  },
  watch: {
    notification(val) {
      if (val) {
        let notificationData = JSON.parse(val);
        if (notificationData[`${this.requestType}ID`] && notificationData[`${this.requestType}ID`] === this.requestId && notificationData.sagaStatus === 'COMPLETED'
          && (notificationData.sagaName === 'PEN_REQUEST_RETURN_SAGA' || notificationData.sagaName === 'STUDENT_PROFILE_RETURN_SAGA') ) {
          this.returnMessage = 'Your request to return for more info is now completed.';
        }
      }
    }
  },
  mounted() {
    this.isRequestMoreInfoEnabledForUser = AccessEnabledForUser(this.requestType, 'REQUEST_MORE_INFO', this.userInfo);
  },
  methods: {
    ...mapMutations('app', ['setRequest']),
    ...mapMutations('app', ['pushMessage','setMessages','setParticipants']),
    replaceReturnMacro() {
      this.returnComment = replaceMacro(this.returnComment, this.returnMacros);
    },
    returnToStudent() {
      this.returnOperationSuccessful = null;
      this.returnAlertWarning = false;
      this.returnAlertSuccess = false;
      this.returnAlertFailure = false;
      if (this.$refs.returnForm.validate()) {
        this.beforeSubmit();
        this.request.reviewer = this.myself.name;
        let body = this.prepPut(this.requestId, this.request);
        body.content = this.returnComment;
        ApiService.apiAxios
          .post(Routes[this.requestType].ROOT_ENDPOINT + '/' + this.requestId + '/return', body)
          .then(() => {
            this.returnOperationSuccessful = true;
            this.returnMessage = 'Your request to return for more info is accepted.';
            this.$refs.returnForm.resetValidation();
          })
          .catch(error => {
            console.log(error);
            if (error.response.data && error.response.data.message && error.response.data.message.includes('saga in progress')) {
              this.returnOperationSuccessful = false;
              this.returnMessage = 'Another saga is in progress for this request, please try again later.';
            } else {
              this.returnOperationSuccessful = false;
              this.returnMessage = 'Your request to return for more info could not be accepted, please try again later.';
            }
            this.submitted();
          });
      }
    },
  }
};
</script>
