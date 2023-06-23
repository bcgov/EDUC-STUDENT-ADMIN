<template>
  <div>
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
              ref="rejectCommentTextarea"
            ></v-textarea>
          </v-row>
          <v-row class="d-flex justify-space-between">
            <MacroMenu
              :macros="rejectMacros"
              @select="insertMacroText"
            />
            <v-col cols="12" xl="3" lg="5" md="5" class="py-0" justify="end" align-content="end">
              <PrimaryButton id="reject-request" text="Reject" :disabled="isRejectDisabled || !isRejectEnabledForUser" width="100%" :click-action="submitReject"></PrimaryButton>
            </v-col>
          </v-row>
        </v-card-text>
      </v-form>
    </v-card>
  </div>
</template>

<script>
import ApiService from '../common/apiService';
import {REQUEST_TYPES, Routes, Statuses} from '../utils/constants';
import { replaceMacro, insertMacro } from '../utils/macro';
import {mapActions, mapState} from 'pinia';
import PrimaryButton from './util/PrimaryButton.vue';
import alertMixin from '../mixins/alertMixin';
import {isValidLength} from '../utils/validation';
import MacroMenu from './common/MacroMenu.vue';
import {notificationsStore} from '@/store/modules/notifications';
import {appStore} from '@/store/modules/app';
import {authStore} from '@/store/modules/auth';

export default {
  name: 'requestReject',
  components: {
    PrimaryButton,
    MacroMenu
  },
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
  mixins: [alertMixin],
  data () {
    return {
      validForm: false,
      requiredRules: isValidLength(4000),
      rejectComment: null,
      rejectOperationOutcomeMessage : null,
    };
  },
  computed: {
    ...mapState(authStore, ['userInfo', 'ACTION_GMP_REQUESTS_ROLE', 'ACTION_UMP_REQUESTS_ROLE']),
    ...mapState(appStore, ['selectedRequest', 'requestType', 'requestTypeLabel']),
    ...mapState(notificationsStore, ['notification']),
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
      return !this.enableActions || [Statuses[this.requestType].MANUAL_MATCH, Statuses[this.requestType].AUTO_MATCH, Statuses[this.requestType].COMPLETED, Statuses[this.requestType].ABANDONED].includes(this.request[this.requestStatusCodeName]);
    },
    isRejectDark() {
      return this.enableActions && this.request[this.requestStatusCodeName] !== 'ABANDONED';
    },
    isRejectEnabledForUser() {
      if(this.requestType === REQUEST_TYPES.penRequest.name) {
        return this.ACTION_GMP_REQUESTS_ROLE;
      } else {
        return this.ACTION_UMP_REQUESTS_ROLE;
      }
    }
  },
  watch: {
    notification(val) {
      if (val) {
        let notificationData = val;
        if (notificationData[`${this.requestType}ID`] && notificationData[`${this.requestType}ID`] === this.requestId && notificationData.sagaStatus === 'COMPLETED'
          && (notificationData.sagaName === 'PEN_REQUEST_REJECT_SAGA' || notificationData.sagaName === 'STUDENT_PROFILE_REJECT_SAGA') ) {
          this.rejectOperationOutcomeMessage = 'Your request to reject is now completed.';
          this.setSuccessAlert(this.rejectOperationOutcomeMessage);
        }
      }
    }
  },
  mounted() {
    this.rejectComment = this.request.failureReason;
  },
  methods: {
    ...mapActions(appStore, ['setRequest']),
    replaceRejectMacro() {
      this.rejectComment = replaceMacro(this.rejectComment, this.rejectMacros);
    },
    submitReject() {
      this.rejectOperationOutcomeMessage = null;
      if (this.$refs.form.validate()) {
        this.beforeSubmit();
        this.request.failureReason = this.rejectComment;
        this.request.reviewer = this.myself.name;
        ApiService.apiAxios
          .post(Routes[this.requestType].REJECT_URL, this.prepPut(this.requestId, this.request))
          .then(() => {
            this.rejectOperationOutcomeMessage = 'Your request to reject is accepted.';
            this.setSuccessAlert(this.rejectOperationOutcomeMessage);
          })
          .catch(error => {
            console.log(error);
            if (error.response.data && error.response.data.code && error.response.data.code === 409) {
              this.rejectOperationOutcomeMessage = 'Another saga is in progress for this request, please try again later.';
              this.setFailureAlert(this.rejectOperationOutcomeMessage);
            } else {
              this.rejectOperationOutcomeMessage = 'Your request to reject could not be accepted, please try again later.';
              this.setFailureAlert(this.rejectOperationOutcomeMessage);
            }
            this.submitted();
          });
      }
    },
    insertMacroText(macroText) {
      this.rejectComment = insertMacro(macroText, this.rejectComment, this.$refs.rejectCommentTextarea.$refs.input);
    },
  }
};
</script>
