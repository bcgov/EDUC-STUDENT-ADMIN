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
              <v-btn color="#38598a" :disabled="!enableActions" :dark="enableActions" justify="center" width="100%" @click="submitReject">Reject</v-btn>
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
import { mapGetters } from 'vuex';
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
    };
  },
  computed: {
    ...mapGetters('auth', ['userInfo']),
    ...mapGetters('app', ['selectedRequest', 'requestType', 'requestTypeLabel']),
    //...mapGetters(this.requestType, ['rejectMacros']),
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
    }
  },
  mounted() {
    this.isRejectEnabledForUser = AccessEnabledForUser(this.requestType, 'REJECT_REQUEST', this.userInfo);
    this.rejectComment = this.request.failureReason;
  },
  methods: {
    replaceRejectMacro() {
      this.rejectComment = replaceMacro(this.rejectComment, this.rejectMacros);
    },
    submitReject() {
      this.rejectAlertWarning = false;
      this.rejectAlertSuccess = false;
      this.rejectAlertFailure = false;
      if(this.$refs.form.validate()){
        this.beforeSubmit();
        this.request[this.requestStatusCodeName] = Statuses[this.requestType].REJECTED;
        this.request.failureReason = this.rejectComment;
        this.request.reviewer = this.myself.name;
        ApiService.apiAxios
          .post(Routes[this.requestType].REJECT_URL, this.prepPut(this.requestId, this.request))
          .then(response => {
            this.request = response.data;
            this.rejectAlertSuccess=true;
          })
          .catch(error => {
            console.log(error);
            if(error.response.data && error.response.data.message.includes('email service'))
              this.rejectAlertWarning=true;
            else
              this.rejectAlertFailure=true;
          })
          .finally(() => {
            this.submitted();
          });
      }
    },
  }
};
</script>
