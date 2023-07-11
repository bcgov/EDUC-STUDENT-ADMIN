<template>
  <v-container
    fluid
    class="fill-height mb-10 px-16"
  >
    <v-col
      cols="12"
      class="fill-height pb-0"
    >
      <ImageRenderer
        :request-type="requestType"
        :dialog="imageRendererDialog"
        :request-id="requestId"
        :image-id="imageId"
        @closeDialog="closeDialog"
      />
      <v-row class="flex-grow-0 pb-5">
        <v-card
          height="100%"
          width="100%"
          variant="flat"
          elevation="0"
        >
          <v-card-title class="pb-0 px-0 background-white">
            {{ title }}
          </v-card-title>
          <v-progress-linear
            indeterminate
            color="blue"
            :active="loadingPen || loadingClaimAction"
          />
        </v-card>
      </v-row>
      <v-row>
        <v-col
          cols="12"
          xl="6"
          lg="6"
          md="6"
          sm="6"
          class="py-0 pl-0"
        >
          <v-card
            height="100%"
            width="100%"
            class="background-white"
            elevation="0"
          >
            <v-row no-gutters>
              <v-col
                cols="12"
                xl="3"
                lg="3"
                md="3"
                sm="3"
              >
                <p class="mb-2">
                  Status:
                </p>
              </v-col>
              <v-col
                v-if="request[requestStatusCodeName] === statusCodes.FIRST_REVIEW || request[requestStatusCodeName] === statusCodes.SECOND_REVIEW"
                cols="12"
                xl="9"
                lg="9"
                md="9"
                sm="9"
              >
                <p
                  id="requestStatus"
                  class="mb-2 green--text"
                >
                  <strong>{{ request[requestStatusCodeLabelName] }}</strong>
                </p>
              </v-col>
              <v-col
                v-else-if="request[requestStatusCodeName] === statusCodes.RETURNED"
                cols="12"
                xl="9"
                lg="9"
                md="9"
                sm="9"
              >
                <p
                  id="requestStatus"
                  class="mb-2 orange--text"
                >
                  <strong>{{ request[requestStatusCodeLabelName] }}</strong>
                </p>
              </v-col>
              <v-col
                v-else
                cols="12"
                xl="9"
                lg="9"
                md="9"
                sm="9"
              >
                <p
                  id="requestStatus"
                  class="mb-2 grey--text text--darken-1"
                >
                  <strong>{{ request[requestStatusCodeLabelName] }}</strong>
                </p>
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col
                cols="12"
                xl="3"
                lg="3"
                md="3"
                sm="3"
              >
                <p class="mb-2">
                  As of:
                </p>
              </v-col>
              <v-col
                cols="12"
                xl="9"
                lg="9"
                md="9"
                sm="9"
              >
                <p
                  v-if="request['statusUpdateDate'] == null"
                  id="asOfDate"
                  class="mb-2"
                />
                <p
                  v-else
                  id="asOfDate"
                  class="mb-2"
                >
                  <strong>{{ getFromMomentDate(request['statusUpdateDate']) }}</strong>, at
                  {{ getMomentDate(request['statusUpdateDate']) }}
                </p>
              </v-col>
            </v-row>
            <v-row no-gutters
                   class="mb-5"
            >
              <v-col
                cols="12"
                xl="3"
                lg="3"
                md="3"
                sm="3"
              >
                <p>Submitted:</p>
              </v-col>
              <v-col
                cols="12"
                xl="9"
                lg="9"
                md="9"
                sm="9"
              >
                <p
                  v-if="request.initialSubmitDate == null"
                  id="submittedDate"
                  class="mb-2"
                />
                <p
                  v-else
                  id="submittedDate"
                >
                  <strong>{{ getFromMomentDate(request.initialSubmitDate) }}</strong>,
                  at {{ getMomentDate(request.initialSubmitDate) }}
                </p>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
        <v-col
          cols="12"
          xl="6"
          lg="6"
          md="6"
          sm="6"
          class="pa-0"
        >
          <v-card
            height="100%"
            width="100%"
            class="background-white"
            elevation="0"
          >
            <v-row
              v-if="request.reviewer === myself.name"
              no-gutters
              justify-xl="end"
              justify-lg="end"
              justify-md="end"
              justify-sm="end"
            >
              <p
                v-if="isRequestCompleted"
                class="grey--text text--darken-1"
              >
                <strong>{{ request.reviewer }} completed this request</strong>
              </p>
              <p
                v-if="!isRequestCompleted"
                class="green--text"
              >
                <strong>You are working on this request</strong>
              </p>
              <PrimaryButton
                id="release-request"
                class="ml-2"
                :disabled="isReleaseDisabled"
                :short="true"
                @click-action="claimRequest"
                text="Release"
              />
            </v-row>
            <v-row
              v-else
              no-gutters
              justify-xl="end"
              justify-lg="end"
              justify-md="end"
              justify-sm="end"
            >
              <p
                v-if="!request.reviewer && isRequestCompleted"
                class="grey--text text--darken-1"
              >
                <strong>This request has been completed</strong>
              </p>
              <p
                v-if="request.reviewer && isRequestCompleted"
                class="grey--text text--darken-1"
              >
                <strong>{{ request.reviewer }} completed this request</strong>
              </p>
              <p
                v-if="!request.reviewer && !isRequestCompleted"
                class="blue--text"
              >
                <strong>No one is working on this request</strong>
              </p>
              <p
                v-if="request.reviewer && !isRequestCompleted"
                class="orange--text"
              >
                <strong>{{ request.reviewer }} is working on this request</strong>
              </p>
              <PrimaryButton
                id="claim-pen-request"
                class="ml-2"
                :disabled="isClaimDisabled"
                :short="true"
                @click-action="claimRequest"
                text="Claim"
              />
            </v-row>
            <v-row
              no-gutters
              justify="end"
              class="pb-5"
            >
              <PrimaryButton
                id="back-to-list"
                class="mt-2"
                :short="true"
                @click-action="backToList"
                text="Back to List"
              />
            </v-row>
          </v-card>
        </v-col>
      </v-row>
      <v-row>
        <slot
          name="demographics"
          :request="request"
        />
      </v-row>
      <v-row>
        <v-col
          cols="12"
          xl="6"
          lg="6"
          md="6"
          class="pa-0"
        >
          <v-card
            height="100%"
            width="99%"
          >
            <v-toolbar
              flat
              color="#036"
              class="panel-header white--text"
            >
              <v-toolbar-title><h2>{{ requestTypeLabel }} Data</h2></v-toolbar-title>
            </v-toolbar>
            <v-progress-linear
              indeterminate
              color="blue"
              :active="loadingPen"
            />
            <slot
              name="request"
              :request="request"
            />
          </v-card>
        </v-col>
        <v-col
          cols="12"
          xl="6"
          lg="6"
          md="6"
          class="pa-0"
        >
          <Chat
            :request-id="requestId"
            :request-type="requestType"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col
          col="12"
          class="px-0"
        >
          <v-card>
            <v-toolbar
              flat
              color="#036"
              class="panel-header white--text"
            >
              <v-toolbar-title><h2>Documents</h2></v-toolbar-title>
            </v-toolbar>
            <v-progress-linear
              indeterminate
              color="blue"
              :active="loadingPen"
            />
            <v-data-table
              :headers="headers"
              :items="filteredResults"
              :items-per-page="15"
              :sort-by="['createDate']"
              class="fill-height"
            >
              <template #item.createDate="{ item }">
                <span>{{ item.raw.createDate.toString().replace(/T/, ', ').replace(/\..+/, '') }}</span>
              </template>
              <template #item.fileName="{item: document}">
                <router-link
                  v-if="document.raw.fileSize && actionsEnabled && isPdf(document.raw)"
                  :to="{ path: documentUrl(requestId, document.raw) }"
                  target="_blank"
                >
                  {{ document.raw.fileName }}
                </router-link>
                <a
                  v-else-if="document.raw.fileSize && actionsEnabled"
                  @click="showDocModal(requestId, document.raw)"
                >
                  {{ document.raw.fileName }}
                </a>
                <span v-else>{{ document.raw.fileName }}</span>
              </template>
              <template #item.fileSize="{ item }">
                <span v-if="item.raw.fileSize">{{ item.raw.fileSize }}</span>
              </template>
              <template
                v-if="actionsEnabled"
                #item.documentTypeLabel="{item: document}"
              >
                <span style="cursor: pointer"
                      @click="docChangeDialog = true"
                >{{ document.raw.documentTypeLabel }}</span>
                <v-dialog
                  v-model="docChangeDialog"
                  width="500px"
                  @open="oldDocumentTypeCode=document.raw.documentTypeCode"
                  @save="saveDocumentType(document.raw)"
                >
                  <v-card>
                    <v-row no-gutters>
                      <v-col class="pa-2 px-3">
                        <v-row no-gutters>
                          <v-col class="d-flex justify-center">
                            <v-select
                              v-model="document.raw.documentTypeCode"
                              item-title="text"
                              item-value="value"
                              variant="underlined"
                              :items="documentTypes"
                            />
                          </v-col>
                        </v-row>
                        <v-row no-gutters>
                          <v-col class="d-flex justify-end">
                            <PrimaryButton
                              id="cancelButton"
                              class="mr-2"
                              secondary
                              icon-left
                              width="6em"
                              text="Cancel"
                              @click-action="docChangeDialog = false"
                            />
                            <PrimaryButton
                              id="saveButton"
                              icon-left
                              width="6em"
                              text="Save"
                              @click-action="[saveDocumentType(document.raw),docChangeDialog = false]"
                            />
                          </v-col>
                        </v-row>
                      </v-col>
                    </v-row>
                  </v-card>
                </v-dialog>
              </template>
            </v-data-table>
          </v-card>
        </v-col>
      </v-row>
      <v-row>
        <v-card width="100%">
          <v-toolbar
            flat
            color="#036"
            dark
            class="panel-header white--text tester"
          >
            <v-toolbar-title class="pa-0">
              <h2>Actions</h2>
            </v-toolbar-title>
          </v-toolbar>
          <v-progress-linear
            indeterminate
            color="blue"
            :active="loadingActionResults"
          />
          <slot
            name="actions"
            :active-tab="activeTab"
            :request="request"
            :enable-actions="enableActions"
            :before-submit="beforeSubmit"
            :submitted="submitted"
            :switch-loading="switchLoading"
          />
        </v-card>
      </v-row>
    </v-col>
  </v-container>
</template>
<script>
import Chat from './Chat.vue';
import ApiService from '../common/apiService';
import {REQUEST_TYPES, Routes, Statuses} from '../utils/constants';
import {mapActions, mapState} from 'pinia';
import {humanFileSize, isPdf} from '../utils/file';
import router from '../router';
import PrimaryButton from './util/PrimaryButton.vue';
import alertMixin from '../mixins/alertMixin';
import Mousetrap from 'mousetrap';
import 'mousetrap/plugins/global-bind/mousetrap-global-bind';
import ImageRenderer from '@/components/common/ImageRenderer.vue';
import {notificationsStore} from '@/store/modules/notifications';
import {appStore} from '@/store/modules/app';
import {authStore} from '@/store/modules/auth';
import {getMomentDate, getFromMomentDate} from '@/utils/dateHelpers';
import {getRequestStore} from '@/utils/common';

export default {
  name: 'RequestDetail',
  components: {
    ImageRenderer,
    PrimaryButton,
    Chat
  },
  mixins: [alertMixin],
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
    },
    requestId: {
      type: String,
      required: true
    },
    requestType: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      headers: [
        {title: 'Type', text: 'Type', value: 'documentTypeLabel', key: 'documentTypeLabel'},
        {title: 'File Name', text: 'File Name', value: 'fileName', key: 'fileName'},
        {title: 'Upload Date/time', text: 'Upload Date/time', value: 'createDate', key: 'createDate'},
        {title: 'Size', text: 'Size', value: 'fileSize', key: 'fileSize'},
        {title: '', text: '', value: 'action', sortable: false, key: 'action'}
      ],
      validForm: false,
      requiredRules: [v => !!v || 'Required'],
      myself: {
        name: null,
        id: null,
      },
      docChangeDialog: false,
      fileSizeConverter: humanFileSize,
      enableActions: true,
      loadingPen: true,
      loadingComments: true,
      loadingActionResults: false,
      loadingClaimAction: false,
      filteredResults: [],
      activeTab: 0,
      documentTypes: [],
      oldDocumentTypeCode: '',
      documentErrorMessage: '',
      claimErrorMessage: '',
      sagaInProgress: false,
      imageRendererDialog: false,
      documentId: '',
      imageId: '',
    };
  },
  computed: {
    ...mapState(authStore, ['userInfo', 'ACTION_GMP_REQUESTS_ROLE', 'ACTION_UMP_REQUESTS_ROLE']),
    ...mapState(appStore, ['requestTypeLabel', 'request']),
    ...mapState(notificationsStore, ['notification']),
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
      return this.getRequestStore(this.requestType).returnMacros;
    },
    rejectMacros() {
      return this.getRequestStore(this.requestType).rejectMacros;
    },
    completeMacros() {
      return this.getRequestStore(this.requestType).completeMacros;
    },
    isClaimDisabled() {
      return !this.enableActions || !this.actionsEnabled || this.isRequestCompleted || this.request[this.requestStatusCodeName] === 'DRAFT' || this.request[this.requestStatusCodeName] === 'ABANDONED';
    },
    isDarkForClaim() {
      return this.enableActions && this.actionsEnabled && this.request[this.requestStatusCodeName] !== 'DRAFT' && this.request[this.requestStatusCodeName] !== 'ABANDONED';
    },
    isReleaseDisabled() {
      return !this.enableActions || this.isRequestCompleted || !this.actionsEnabled || this.request[this.requestStatusCodeName] === 'ABANDONED';
    },
    isDarkForRelease() {
      return this.enableActions && !this.isRequestCompleted && this.actionsEnabled;
    },
    actionsEnabled() {
      if (this.requestType === REQUEST_TYPES.penRequest.name) {
        return this.ACTION_GMP_REQUESTS_ROLE;
      } else {
        return this.ACTION_UMP_REQUESTS_ROLE;
      }
    }
  },
  beforeUnmount() {
    Mousetrap.reset();
  },
  mounted() {
    Mousetrap.bind('ctrl+b', () => {
      this.backToList();
      return false;
    });
    this.enableActions = false;
    this.loadingPen = true;
    this.loadingComments = true;
    this.myself.name = this.userInfo.userName;
    this.myself.id = this.userInfo.userGuid;
    if (!this.returnMacros || !this.rejectMacros) {
      this.getRequestStore(this.requestType).getMacros();
    }
    this.getDocumentTypes();

    ApiService.apiAxios
      .get(Routes[this.requestType].ROOT_ENDPOINT + '/' + this.requestId)
      .then(response => {
        this.setRequest(response.data);
        if (this.request[this.requestStatusCodeName] === this.statusCodes.REJECTED) {
          this.activeTab = 2;
        }
        if (response.data && response.data.sagaInProgress) {
          this.sagaInProgress = true;
        }
      })
      .catch(error => {
        console.log(error);
      })
      .finally(() => {
        if (!this.sagaInProgress) {
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
        console.error(error);
      });
  },
  methods: {
    ...mapActions(appStore, ['setRequest', 'setMessages', 'setParticipants']),
    getMomentDate,
    getFromMomentDate,
    documentUrl(requestId, document) {
      return `${Routes[this.requestType].ROOT_ENDPOINT}/${requestId}/documents/${document.documentID}`;
    },
    /**
     * two different props are created so that two different watch functions will execute api call accordingly.
     * @param requestId
     * @param document
     */
    showDocModal(requestId, document) {
      this.imageId = document.documentID;
      this.imageRendererDialog = true;
    },
    getDocumentTypes() {
      ApiService.apiAxios
        .get(Routes[this.requestType].DOCUMENT_TYPES_URL)
        .then(response => {
          if (response?.data) {
            this.getRequestStore(this.requestType).setDocumentTypes(response.data);
            this.documentTypes = this.getRequestStore(this.requestType).documentTypes
              .sort((a, b) => a.displayOrder - b.displayOrder)
              .map(code => ({text: code.label, value: code.documentTypeCode}));
          }
        })
        .catch(error => {
          console.log(error);
        });
    },
    async closeDialog() {
      this.documentId = '';
      this.imageId = '';
      this.imageRendererDialog = false;
      await this.$nextTick(); //need to wait so update can me made in parent and propagated back down to child component
    },
    claimRequest() {
      this.loadingClaimAction = true;
      this.claimErrorMessage = '';
      this.disableActionButtons();
      let body = this.prepPut(this.requestId, this.request);
      if (this.request.reviewer !== this.myself.name) {
        body.reviewer = this.myself.name;
      } else {
        body.reviewer = null;
      }
      ApiService.apiAxios
        .put(Routes[this.requestType].ROOT_ENDPOINT, body)
        .then(response => {
          this.request.reviewer = response.data.reviewer;
        })
        .catch(error => {
          this.claimErrorMessage = `There was an error trying to claim the ${this.requestTypeLabel} Request, please navigate to the list and select this ${this.requestTypeLabel} Request again.`;
          this.setFailureAlert(this.claimErrorMessage);
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
      router.push({name: REQUEST_TYPES[this.requestType].label});
    },
    setDocumentError(message) {
      this.documentErrorMessage = message;
      this.setFailureAlert(this.documentErrorMessage);
    },
    getRequestStore,
    setDocumentTypeLabel(document) {
      const documentTypeInfo = this.getRequestStore(this.requestType).documentTypes.find(typeInfo =>
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
    isPdf,
    submitted() {
      this.switchLoading(false);
      this.enableActionButtons();
    },
    refreshRequestDetailsAndComments() {
      ApiService.apiAxios
        .get(Routes[this.requestType].ROOT_ENDPOINT + '/' + this.requestId + '/comments')
        .then(response => {
          this.setParticipants(response.data.participants);
          this.setMessages(response.data.messages);
        })
        .catch(error => {
          console.log(error);
        });

      return ApiService.apiAxios
        .get(Routes[this.requestType].ROOT_ENDPOINT + '/' + this.requestId)
        .then(response => {
          this.setRequest(response.data);
          if (this.request[this.requestStatusCodeName] === this.statusCodes.REJECTED) {
            this.activeTab = 2;
          }
        })
        .catch(error => {
          console.log(error);
        });
    }
  },
  watch: {
    notification(val) {
      if (val) {
        let notificationData = val;
        if (notificationData[`${this.requestType}ID`] && notificationData[`${this.requestType}ID`] === this.requestId && notificationData.sagaStatus === 'INITIATED') {
          this.beforeSubmit();
        } else if (notificationData[`${this.requestType}ID`] && notificationData[`${this.requestType}ID`] === this.requestId && (notificationData.sagaStatus === 'COMPLETED' || notificationData.sagaStatus === 'FORCE_STOPPED')) {
          this.refreshRequestDetailsAndComments()
            .finally(() => {
              this.submitted();
            });
        }
      }
    }
  }
};
</script>
<style scoped>
.panel-header /deep/ .v-toolbar__content {
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
    height: 100% !important;
    background-color: #fafafa !important;
}

.v-card /deep/ .v-window-item--active {
    height: 100% !important;
    background-color: #fafafa !important;
}

.v-tab--active {
    background-color: aliceblue;
    font-weight: bold;
}

.white--text {
    color: white;
}

:deep(.v-data-table-header__content){
    font-size: 0.75em;
    font-weight: bold;
}

.background-white{
    background-color: #FFF !important;
}

.v-card {
    background-color: #fafafa;
}

h2 {
    font-size: 1.25rem
}
</style>

