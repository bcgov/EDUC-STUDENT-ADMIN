<template>
  <div>
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
              <PrimaryButton id="return-to-student" text="Return to Student" :disabled="isReturnToStudentDisabled || !isRequestMoreInfoEnabledForUser" width="100%" @click.native="returnToStudent"></PrimaryButton>
            </v-col>
          </v-row>
        </v-card-text>
      </v-form>
    </v-card>
  </div>
</template>

<script>
import ApiService from '../common/apiService';
import {Routes, Statuses} from '../utils/constants';
import { replaceMacro } from '../utils/macro';
import { mapGetters, mapMutations } from 'vuex';
import {AccessEnabledForUser} from '../common/role-based-access';
import PrimaryButton from './util/PrimaryButton';
import alertMixin from '../mixins/alertMixin';
export default {
  name: 'requestReturn',
  components: {PrimaryButton},
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
      requiredRules: [v => !!v || 'Required',
        v => v && v.length <= 4000 || 'Max 4000 characters'
      ],
      returnComment: null,
      isRequestMoreInfoEnabledForUser:false,
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
      return !this.enableActions || [Statuses[this.requestType].DRAFT, Statuses[this.requestType].MANUAL_MATCH, Statuses[this.requestType].AUTO_MATCH, Statuses[this.requestType].COMPLETED, Statuses[this.requestType].ABANDONED].includes(this.request[this.requestStatusCodeName]);
    },
    isReturnToStudentDark() {
      return this.enableActions && this.request[this.requestStatusCodeName] !== 'DRAFT' && this.request[this.requestStatusCodeName] !== 'ABANDONED';
    },

  },
  watch: {
    notification(val) {
      if (val) {
        let notificationData = val;
        if (notificationData[`${this.requestType}ID`] && notificationData[`${this.requestType}ID`] === this.requestId && notificationData.sagaStatus === 'COMPLETED'
          && (notificationData.sagaName === 'PEN_REQUEST_RETURN_SAGA' || notificationData.sagaName === 'STUDENT_PROFILE_RETURN_SAGA') ) {
          this.returnMessage = 'Your request to return for more info is now completed.';
          this.setSuccessAlert(this.returnMessage);
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
      if (this.$refs.returnForm.validate()) {
        this.beforeSubmit();
        this.request.reviewer = this.myself.name;
        let body = this.prepPut(this.requestId, this.request);
        body.content = this.returnComment;
        ApiService.apiAxios
          .post(Routes[this.requestType].ROOT_ENDPOINT + '/' + this.requestId + '/return', body)
          .then(() => {
            this.returnMessage = 'Your request to return for more info is accepted.';
            this.setSuccessAlert(this.returnMessage);
            this.$refs.returnForm.resetValidation();
          })
          .catch(error => {
            console.log(error);
            if (error.response.data && error.response.data.code && error.response.data.code === 409) {
              this.returnMessage = 'Another saga is in progress for this request, please try again later.';
              this.setFailureAlert(this.returnMessage);
              
            } else {
              this.returnMessage = 'Your request to return for more info could not be accepted, please try again later.';
              this.setFailureAlert(this.returnMessage);
            }
            this.submitted();
          });
      }
    },
  }
};
</script>
