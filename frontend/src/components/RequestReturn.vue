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
              <v-btn :disabled="!enableActions||request[requestStatusCodeName]==='DRAFT'" color="#38598a" :dark="enableActions&&request[requestStatusCodeName]!=='DRAFT'" justify="center" width="100%" @click="returnToStudent">Return to Student</v-btn>
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
    };
  },
  computed: {
    ...mapGetters('auth', ['userInfo']),
    ...mapGetters('app', ['selectedRequest', 'requestType', 'requestTypeLabel']),
    //...mapGetters(this.requestType, ['returnMacros']),
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
    }
  },
  mounted() {
    this.isRequestMoreInfoEnabledForUser = AccessEnabledForUser(this.requestType, 'REQUEST_MORE_INFO', this.userInfo);
  },
  methods: {
    ...mapMutations('app', ['setRequest']),
    ...mapMutations('app', ['pushMessage']),
    replaceReturnMacro() {
      this.returnComment = replaceMacro(this.returnComment, this.returnMacros);
    },
    returnToStudent() {
      this.returnAlertWarning = false;
      this.returnAlertSuccess = false;
      this.returnAlertFailure = false;
      if(this.$refs.returnForm.validate()) {
        this.beforeSubmit();
        this.request[this.requestStatusCodeName] = Statuses[this.requestType].RETURNED;
        this.request.reviewer = this.myself.name;
        let body = this.prepPut(this.requestId, this.request);
        body.content = this.returnComment;
        ApiService.apiAxios
          .post(Routes[this.requestType].ROOT_ENDPOINT + '/' + this.requestId + '/return', body)
          .then(response => {
            this.setRequest(response.data.penResponse);
            this.pushMessage(response.data.commentResponse);
            this.returnAlertSuccess = true;
            this.returnComment = null;
            this.$refs.returnForm.resetValidation();
          })
          .catch(error => {
            console.log(error);
            if (error.response.data && error.response.data.message.includes('email service'))
              this.returnAlertWarning = true;
            else
              this.returnAlertFailure = true;
          })
          .finally(() => {
            this.submitted();
          });
      }
    },
  }
};
</script>
