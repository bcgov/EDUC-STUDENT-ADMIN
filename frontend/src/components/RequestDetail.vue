<template>
  <v-content>
    <v-container class="fill-height">
      <v-col cols="12" class="fill-height pb-5">
        <v-row class="flex-grow-0 pb-5">
          <v-card height="100%" width="100%" elevation=0>
            <v-card-title class="pb-0 px-0">{{title}}</v-card-title>
            <v-divider/>
            <v-progress-linear
                    indeterminate
                    color="blue"
                    :active="loadingPen || loadingClaimAction"
            ></v-progress-linear>
            <v-alert
                    :value="claimError"
                    dense
                    text
                    dismissible
                    outlined
                    transition="scale-transition"
                    class="bootstrap-error"
            >
              {{ claimErrorMessage }}
            </v-alert>
          </v-card>
        </v-row>
        <v-row>
          <v-col cols="12" xl="6" lg="6" md="6" sm="6" class="py-0 pl-0">
            <v-card height="100%" width="100%" elevation=0>
              <v-row no-gutters>
                <v-col cols="12" xl="3" lg="3" md="3" sm="3">
                  <p class="mb-2">Status:</p>
                </v-col>
                <v-col v-if="this.request[requestStatusCodeName] === this.statusCodes.FIRST_REVIEW || this.request[requestStatusCodeName] === this.statusCodes.SECOND_REVIEW" cols="12" xl="9" lg="9" md="9" sm="9">
                  <p class="mb-2 green--text"><strong>{{this.request[requestStatusCodeLabelName]}}</strong></p>
                </v-col>
                <v-col v-else-if="this.request[requestStatusCodeName] === this.statusCodes.RETURNED" cols="12" xl="9" lg="9" md="9" sm="9">
                  <p class="mb-2 orange--text"><strong>{{this.request[requestStatusCodeLabelName]}}</strong></p>
                </v-col>
                <v-col v-else cols="12" xl="9" lg="9" md="9" sm="9">
                  <p class="mb-2 grey--text text--darken-1"><strong>{{this.request[requestStatusCodeLabelName]}}</strong></p>
                </v-col>
              </v-row>
              <v-row no-gutters>
                <v-col cols="12" xl="3" lg="3" md="3" sm="3">
                  <p class="mb-2">As of:</p>
                </v-col>
                <v-col cols="12" xl="9" lg="9" md="9" sm="9">
                  <p v-if="this.request['statusUpdateDate'] == null" class="mb-2"></p>
                  <p v-else class="mb-2"><strong>{{ this.request['statusUpdateDate'] ? moment(this.request['statusUpdateDate']).fromNow():'' }}</strong>, at {{ this.request['statusUpdateDate'] ? moment(this.request['statusUpdateDate']).format('YYYY-MM-DD LT'):'' }}</p>
                </v-col>
              </v-row>
              <v-row no-gutters>
                <v-col cols="12" xl="3" lg="3" md="3" sm="3">
                  <p>Submitted:</p>
                </v-col>
                <v-col cols="12" xl="9" lg="9" md="9" sm="9">
                  <p v-if="this.request.initialSubmitDate == null" class="mb-2"></p>
                  <p v-else><strong>{{ this.request.initialSubmitDate ? moment(this.request.initialSubmitDate).fromNow():'' }}</strong>, at {{ this.request.initialSubmitDate ? moment(this.request.initialSubmitDate).format('YYYY-MM-DD LT'):'' }}</p>
                </v-col>
              </v-row>
            </v-card>
          </v-col>
          <v-col cols="12" xl="6" lg="6" md="6" sm="6" class="pa-0">
            <v-card height="100%" width="100%" elevation=0>
              <v-row v-if="this.request.reviewer === this.myself.name" no-gutters justify-xl="end" justify-lg="end" justify-md="end" justify-sm="end">
                <p v-if="this.isRequestCompleted" class="grey--text text--darken-1"><strong>{{ this.request.reviewer }} completed this request</strong></p>
                <p v-if="!this.isRequestCompleted" class="green--text"><strong>You are working on this request</strong></p>
                <v-btn id="release-pen-request" :disabled="isReleaseDisabled" small color="#38598a" :dark="isDarkForRelease" class="ml-2" @click="claimRequest">Release</v-btn>
              </v-row>
              <v-row v-else no-gutters justify-xl="end" justify-lg="end" justify-md="end" justify-sm="end">
                <p v-if="!this.request.reviewer && this.isRequestCompleted" class="grey--text text--darken-1"><strong>This request has been completed</strong></p>
                <p v-if="this.request.reviewer && this.isRequestCompleted" class="grey--text text--darken-1"><strong>{{ this.request.reviewer }} completed this request</strong></p>
                <p v-if="!this.request.reviewer && !this.isRequestCompleted" class="blue--text"><strong>No one is working on this request</strong></p>
                <p v-if="this.request.reviewer && !this.isRequestCompleted" class="orange--text"><strong>{{ this.request.reviewer }} is working on this request</strong></p>
                <v-btn id="claim-pen-request" :disabled="isClaimDisabled" small color="#38598a" :dark="isDarkForClaim" class="ml-2" @click="claimRequest">Claim</v-btn>
              </v-row>
              <v-row no-gutters justify="end" class="pb-5">
                <v-btn  small color="#38598a" :dark="true" class="ml-2" @click="backToList">Back to List</v-btn>
              </v-row>
            </v-card>
          </v-col>
        </v-row>
        <v-row>
          <slot 
            name="demographics"
            :request="request"
          ></slot>
        </v-row>
        <v-row>
          <v-col cols="12" xl="6" lg="6" md="6" class="pa-0">
            <v-card height="100%" width="99%">
              <v-toolbar flat color="#036" class="white--text">
                <v-toolbar-title><h2>{{requestTypeLabel}} Data</h2></v-toolbar-title>
              </v-toolbar>
              <v-progress-linear
                      indeterminate
                      color="blue"
                      :active="loadingPen"
              ></v-progress-linear>
              <slot 
                name="request"
                :request="request"
              ></slot>
            </v-card>
          </v-col>
          <v-col cols="12" xl="6" lg="6" md="6" class="pa-0">
            <Chat></Chat>
          </v-col>
        </v-row>
        <v-row>
          <v-col col="12" class="px-0">
            <v-card>
              <v-toolbar flat color="#036" class="white--text">
                <v-toolbar-title><h2>Documents</h2></v-toolbar-title>
              </v-toolbar>
              <v-progress-linear
                      indeterminate
                      color="blue"
                      :active="loadingPen"
              ></v-progress-linear>
              <v-alert
                :value="documentError"
                dense
                text
                dismissible
                outlined
                transition="scale-transition"
                class="bootstrap-error"
              >
                {{ documentErrorMessage }}
              </v-alert>
              <v-data-table
                      :headers="headers"
                      :items="filteredResults"
                      :sort-by="['createDate']"
                      :items-per-page="15"
                      class="fill-height">
                <template v-slot:item.createDate="{ item }">
                  <span>{{item.createDate.toString().replace(/T/, ', ').replace(/\..+/, '') }}</span>
                </template>
                <template v-slot:item.fileName="{item: document}">
                  <router-link :to="{ path: documentUrl(requestId, document) }" target="_blank">{{document.fileName}}</router-link>
                </template>

                <template v-if="isDocumentTypeChangeEnabledForUser"  v-slot:item.documentTypeLabel="{item: document}" >
                  <v-edit-dialog
                    :return-value.sync="document.documentTypeCode"
                    large
                    persistent
                    @open="oldDocumentTypeCode=document.documentTypeCode"
                    @save="saveDocumentType(document)"
                  >
                    <div>{{ document.documentTypeLabel }}</div>
                    <template v-slot:input>
                      <v-select
                        v-model="document.documentTypeCode"
                        style="max-width: 20em;"
                        :items="documentTypes"
                      ></v-select>
                    </template>
                  </v-edit-dialog>
                </template>
              </v-data-table>
            </v-card>
          </v-col>
        </v-row>
        <v-row>
          <v-card width="100%" >
            <v-toolbar flat color="#036" dark class="tester">
              <v-toolbar-title class="pa-0"><h2>Actions</h2></v-toolbar-title>
            </v-toolbar>
            <v-progress-linear
                    indeterminate
                    color="blue"
                    :active="loadingActionResults"
            ></v-progress-linear>
            <slot 
              name="actions"
              :active-tab="activeTab"
              :request="request"
              :enable-actions="enableActions"
              :before-submit="beforeSubmit"
              :submitted="submitted"
              :switch-loading="switchLoading"
            ></slot>
          </v-card>
        </v-row>
      </v-col>
    </v-container>
  </v-content>
</template>
<script>
import Chat from './Chat';
import ApiService from '../common/apiService';
import { Routes, Statuses } from '../utils/constants';
import { mapGetters, mapMutations } from 'vuex';
import { humanFileSize } from '../utils/file';
import {AccessEnabledForUser} from '../common/role-based-access';
export default {
  name: 'requestDetail',
  props: {
    title: {
      type: String,
      required: true
    },
    prepPut: {
      type: Function,
      required: true
    },
    requestCompleted: {
      type: Function,
      required: true
    }
  },
  components: {
    Chat
  },
  data () {
    return {
      headers: [
        { text: 'Type', value: 'documentTypeLabel',  },
        { text: 'File Name', value: 'fileName' },
        { text: 'Upload Date/time', value: 'createDate' },
        { text: 'Size', value: 'fileSize' },
        { text: '', value: 'action', sortable: false }
      ],
      validForm: false,
      requiredRules: [v => !!v || 'Required'],
      myself: {
        name: null,
        id: null,
      },
      fileSizeConverter:humanFileSize,
      requestId: null,
      enableActions: true,
      loadingPen: true,
      loadingComments: true,
      loadingActionResults: false,
      loadingClaimAction: false,
      filteredResults:[],
      activeTab: 0,
      documentTypes: [],
      oldDocumentTypeCode: '',
      documentError: false,
      documentErrorMessage: '',
      claimError: false,
      claimErrorMessage: '',
      isClaimActionEnabledForUser: false,
      isDocumentTypeChangeEnabledForUser:false,
      isReleaseActionEnabledForUser:false,
      sagaInProgress: false
    };
  },
  computed: {
    ...mapGetters('auth', ['userInfo']),
    ...mapGetters('app', ['selectedRequest', 'requestType', 'requestTypeLabel']),
    ...mapGetters('app', ['request']),
    ...mapGetters('notifications', ['notification']),
    isRequestCompleted() {
      return this.requestCompleted(this.request, this.statusCodes);
    },
    requestStatusCodeName() {
      return `${this.requestType}StatusCode`;
    },
    requestStatusCodeLabelName() {
      return `${this.requestType}StatusCodeLabel`;
    },
    statusCodes() {
      return Statuses[this.requestType];
    },
    returnMacros() {
      return this.$store.getters[`${this.requestType}/returnMacros`];
    },
    rejectMacros() {
      return this.$store.getters[`${this.requestType}/rejectMacros`];
    },
    completeMacros() {
      return this.$store.getters[`${this.requestType}/completeMacros`];
    },
    isClaimDisabled() {
      return !this.enableActions || !this.isClaimActionEnabledForUser || this.request[this.requestStatusCodeName] === 'DRAFT' || this.request[this.requestStatusCodeName] === 'ABANDONED';
    },
    isDarkForClaim() {
      return this.enableActions && this.isClaimActionEnabledForUser && this.request[this.requestStatusCodeName] !== 'DRAFT' && this.request[this.requestStatusCodeName] !== 'ABANDONED';
    },
    isReleaseDisabled() {
      return !this.enableActions || this.isRequestCompleted || !this.isReleaseActionEnabledForUser;
    },
    isDarkForRelease() {
      return this.enableActions && !this.isRequestCompleted && this.isReleaseActionEnabledForUser;
    },

  },
  mounted() {
    this.enableActions = false;
    this.loadingPen = true;
    this.loadingComments = true;
    this.myself.name = this.userInfo.userName;
    this.myself.id = this.userInfo.userGuid;
    this.requestId = this.selectedRequest;
    this.isClaimActionEnabledForUser = AccessEnabledForUser(this.requestType, 'CLAIM_REQUEST', this.userInfo);
    this.isDocumentTypeChangeEnabledForUser =AccessEnabledForUser(this.requestType, 'CHANGE_DOCUMENT_TYPE', this.userInfo);
    this.isReleaseActionEnabledForUser = AccessEnabledForUser(this.requestType, 'RELEASE_REQUEST', this.userInfo);
    if(!this.returnMacros || ! this.rejectMacros) {
      this.$store.dispatch(`${this.requestType}/getMacros`, this.requestType);
    }
    this.documentTypes = this.$store.state[this.requestType].documentTypes
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map(code => ({text: code.label, value: code.documentTypeCode}));

    ApiService.apiAxios
      .get(Routes[this.requestType].ROOT_ENDPOINT + '/' + this.requestId)
      .then(response => {
        this.setRequest(response.data);
        if(this.request[this.requestStatusCodeName] === this.statusCodes.REJECTED) {
          this.activeTab = 2;
        }
        if(response.data && response.data.sagaInProgress){
          this.sagaInProgress = true;
        }
      })
      .catch(error => {
        console.log(error);
      })
      .finally(() => {
        if(!this.sagaInProgress) {
          this.enableActions = true;
        }
        this.loadingPen = false;
      });
    ApiService.apiAxios
      .get(Routes[this.requestType].ROOT_ENDPOINT + '/' + this.requestId + '/documents')
      .then(response => {
        this.filteredResults = response.data.map((document) => this.setDocumentTypeLabel(document));
      })
      .catch(error => {
        this.setDocumentError('An error occurred while loading the document list. Please try again later.');
        console.log(error);
      });
  },
  methods: {
    ...mapMutations('app', ['setSelectedRequest']),
    ...mapMutations('app', ['setRequest']),
    ...mapMutations('app', ['setMessages']),
    ...mapMutations('app', ['setParticipants']),
    documentUrl(requestId, document) {
      return `${Routes[this.requestType].ROOT_ENDPOINT}/${requestId}/documents/${document.documentID}`;
    },
    claimRequest() {
      this.loadingClaimAction = true;
      this.claimError = false;
      this.claimErrorMessage='';
      this.disableActionButtons();
      let body = this.prepPut(this.requestId, this.request);
      if(this.request.reviewer !== this.myself.name) {
        body.reviewer = this.myself.name;
      }
      else {
        body.reviewer = null;
      }
      ApiService.apiAxios
        .put(Routes[this.requestType].ROOT_ENDPOINT, body)
        .then(response => {
          this.request.reviewer = response.data.reviewer;
        })
        .catch(error => {
          this.claimError = true;
          this.claimErrorMessage=`There was an error trying to claim the ${this.requestTypeLabel} Request, please navigate to the list and select this ${this.requestTypeLabel} Request again.`;
          console.log(error);
        })
        .finally(() => {
          this.loadingClaimAction = false;
          this.enableActionButtons();
        });
    },
    disableActionButtons() {
      this.enableActions = false;
    },
    enableActionButtons() {
      this.enableActions = true;
    },
    backToList() {
      this.requestId = '';
      this.setSelectedRequest(null);
    },
    setDocumentError(message) {
      this.documentError = true;
      this.documentErrorMessage = message;
    },
    setDocumentTypeLabel(document) {
      const documentTypeInfo = this.$store.state[this.requestType].documentTypes.find(typeInfo =>
        typeInfo.documentTypeCode === document.documentTypeCode
      );
      document.documentTypeLabel = documentTypeInfo ? documentTypeInfo.label : document.documentTypeCode;
      return document;
    },
    saveDocumentType(document) {
      ApiService.apiAxios
        .put(this.documentUrl(this.requestId, document), document)
        .catch(error => {
          document.documentTypeCode = this.oldDocumentTypeCode;
          this.setDocumentError('An error occurred while attempting to update the document type. Please try again later.');
          console.log(error);
        })
        .finally(() => {
          this.setDocumentTypeLabel(document);
        });
    },
    switchLoading(loading) {
      this.loadingActionResults = loading;
    },
    beforeSubmit() {
      this.disableActionButtons();
      this.switchLoading(true);
    },
    submitted() {
      this.switchLoading(false);
      this.enableActionButtons();
    },
    refreshRequestDetailsAndComments(){
      ApiService.apiAxios
        .get(Routes[this.requestType].ROOT_ENDPOINT + '/' + this.requestId)
        .then(response => {
          this.setRequest(response.data);
          if(this.request[this.requestStatusCodeName] === this.statusCodes.REJECTED) {
            this.activeTab = 2;
          }
          if(response.data && response.data.sagaInProgress){
            this.sagaInProgress = true;
          }
        })
        .catch(error => {
          console.log(error);
        });
      ApiService.apiAxios
        .get(Routes[this.requestType].ROOT_ENDPOINT + '/' + this.requestId + '/comments')
        .then(response => {
          this.setParticipants(response.data.participants);
          this.setMessages(response.data.messages);
        })
        .catch(error => {
          console.log(error);
        });
    }
  },
  watch: {
    notification(val) {
      if(val) {
        let notificationData = JSON.parse(val);
        if (notificationData[`${this.requestType}ID`] && notificationData[`${this.requestType}ID`] === this.requestId && notificationData.sagaStatus === 'INITIATED') {
          this.beforeSubmit();
        } else if (notificationData[`${this.requestType}ID`] && notificationData[`${this.requestType}ID`] === this.requestId && (notificationData.sagaStatus === 'COMPLETED' || notificationData.sagaStatus === 'FORCE_STOPPED')) {
          this.refreshRequestDetailsAndComments();
          this.submitted();
        }
      }
    }
  }
};
</script>
<style scoped>
  .v-toolbar /deep/ .v-toolbar__content {
    padding-left: 20px !important;
  }
  .v-textarea /deep/ .v-text-field__details {
    margin-bottom: 0 !important;
  }
  .v-textarea /deep/ .v-input__slot {
    margin-bottom: 0 !important;
  }
  .v-input--checkbox /deep/ .v-input__slot {
    padding: 0 !important;
    justify-content: flex-end !important;
  }
  .v-card /deep/ .v-window__container {
    height:100% !important;
    background-color:#fafafa !important;
  }
  .v-card /deep/ .v-window-item--active {
    height:100% !important;
    background-color:#fafafa !important;
  }
  .v-tab--active {
    background-color: aliceblue;
    font-weight: bold;
  }
  .v-card {
    background-color:#fafafa;
  }
  h2 {
    font-size: 1.25rem
  }
</style>

