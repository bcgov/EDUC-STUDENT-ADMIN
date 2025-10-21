<template>
  <v-container
    class="mb-6"
    fluid
  >
    <v-row v-if="hasEditPermission" class="mb-1">
      <v-col class="d-flex justify-end">
        <a class="report-item mr-2" @click="openResultCorrectDialog = !openResultCorrectDialog">Upload a Correction to Results</a>
        <v-menu
                location="bottom"
              >
                <template #activator="{ props }">
                  <a
                    class="mt-n1 mr-1"
                    style="font-weight: bold"
                    v-bind="props"
                    @click="toggleMoreInfoTooltip"
                  ><v-icon
                        color="#003366"
                        icon="mdi-information"
                      />
                    </a>
                </template>
                <v-card
                  style="max-width: 30em;"
                  border="sm"
                  class="pa-2"
                >
                  <div>Uploaded results will be <span style="font-weight: bold">added to existing data</span> for the session — 
                    they <span style="font-weight: bold">won’t overwrite all results</span> for all students.</div>
                  <div class="mt-4">
                   If a student already has results for the same assessment and session, those results will be <span style="font-weight: bold">replaced</span> with the new ones from your file.
                  </div>
                  <div class="mt-4">
                    Results <span style="font-weight: bold">can not</span> be added for a <span style="font-weight: bold">future session</span>.
                  </div>
                  <div class="mt-4">
                    If uploading to:
                  </div>
                  <div class="mt-4">
                    <span style="font-weight: bold">An in-progress session (not yet approved):</span> Results will be added to staged results and go through the standard approval process.
                  </div>
                  <div
                    class="mt-4"
                  >
                    <span style="font-weight: bold">A past session (already approved):</span> Results will be added directly to the approved results and considered immediately approved.
                  </div>
                </v-card>
              </v-menu>
      </v-col>
    </v-row>
    <v-expansion-panels 
      v-model="type"
      @update:modelValue="getResultSummary()"
    >
      <v-expansion-panel
        v-for="(session, index) in schoolYearSessions"
        :key="index"
        class="border"
        :value="session.sessionID"
      >
        <v-expansion-panel-title
          disable-icon-rotate
          prepend-icon="mdi-account"
        >
          <h4>{{ session.courseYear }}/{{ session.courseMonth }} Session</h4>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <v-data-table
            :headers="headers"
            :items="resultsSummary"
          >
            <template #item.resultsUploaded="{ item }">
              <v-icon
                v-if="item.raw.uploadedBy === null"
                style="color: red;"
              >
                mdi-close
              </v-icon>
              <v-icon
                v-else
                style="color: green;"
              >
                mdi-check
              </v-icon>
            </template>
            <template #item.uploadDate="{ item }">
              {{ formatUploadDate(item) }}
            </template>
          </v-data-table>
          <v-row>
            <v-col class="d-flex justify-end">
              <v-menu>
                <template v-slot:activator="{ props }">
                  <v-btn
                    color="primary"
                    v-bind="props"
                    prepend-icon="mdi-tray-arrow-down"
                    variant="outlined"
                  >
                    Reports
                  </v-btn>
                </template>

                <v-list>
                  <v-list-item @click="downloadReport('summary-by-form-for-session')">
                    <v-list-item-title class="report-item">Result Summary by Form</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="downloadReport('summary-by-grade-for-session')">
                    <v-list-item-title class="report-item">Result Summary by Grade</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="downloadReport('all-detailed-students-in-session-csv')">
                    <v-list-item-title class="report-item">Detailed Results</v-list-item-title>
                  </v-list-item>
                  <v-list-item v-if="session.isOpen" @click="downloadReport('pen-issues-csv')">
                    <v-list-item-title class="report-item">PEN Issues for session</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
              <v-btn
                v-if="session.isOpen && hasEditPermission"
                id="uploadButton"
                class="ml-3"
                prepend-icon="mdi-file-upload"
                variant="elevated"
                color="#003366"
                text="Upload Assessment Results"
                :loading="isLoadingFiles"
                @click="handleFileImport(session)"
              />
            </v-col>
          </v-row>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

    <v-form
      ref="documentForm"
      v-model="validForm"
    >
      <v-file-input
        id="selectFileInput"
        ref="uploader"
        :key="inputKey"
        v-model="uploadFileValue"
        style="display: none"
        :accept="acceptableFileExtensions.join(',')"
        multiple
      />
    </v-form>
    <v-overlay
      v-model="isLoadingFiles"
      class="align-center justify-center"
      :persistent="true"
    >
      <v-card width="30em">
        <v-card-title>Uploading Files</v-card-title>
        <v-card-text>
          <v-row>
            <v-col>
              <v-alert
                density="compact"
                type="info"
                text="Please wait until all files have completed uploading before leaving the screen."
                variant="tonal"
              />
            </v-col>
          </v-row>
          <v-row style="overflow-y: auto; max-height: 30em">
            <v-col>
              <v-row
                v-for="(file, index) in fileUploadList"
                :key="index"
                height="20em"
                style="overflow: hidden; overflow-y: auto"
              >
                <v-col>
                  <v-row
                    v-if="file.status === fileUploadPending"
                    class="mt-1 mx-1 fileUploadWarning"
                  >
                    <v-col cols="1">
                      <v-progress-circular
                        color="#003366"
                        size="15"
                        indeterminate
                      />
                    </v-col>
                    <v-col cols="11">
                      <span>{{ file.name + " - " + fileUploadPending }}</span>
                    </v-col>
                  </v-row>
                  <v-row
                    v-else-if="file.status === fileUploadSuccess && file.warning === null && file.error === null"
                    class="mt-1 mx-1 fileUploadSuccess"
                  >
                    <v-col cols="1">
                      <v-icon icon="mdi-file-document" />
                    </v-col>
                    <v-col>
                      <span><b>{{ file.name }}</b> - {{ fileUploadSuccess }}</span>
                    </v-col>
                  </v-row>
                  <v-row
                    v-else-if="file.warning !== null"
                    class="mt-1 mx-1 fileUploadWarning"
                  >
                    <v-col cols="1">
                      <v-icon icon="mdi-file-document" />
                    </v-col>
                    <v-col cols="11">
                      <span><b>{{ file.name }}</b> - {{ file.warning }}</span>
                    </v-col>
                  </v-row>
                  <v-row
                    v-else-if="file.error !== null"
                    class="mt-1 mx-1 fileUploadError"
                  >
                    <v-col cols="1">
                      <v-icon icon="mdi-file-document" />
                    </v-col>
                    <v-col cols="11">
                      <span><b>{{ file.name }}</b> - {{ file.error }}</span>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="d-flex justify-end">
          <v-row>
            <v-col class="d-flex justify-end">
              <span class="mr-2 mt-1">{{ inputKey }} of {{ fileUploadList?.length }} Complete</span>
              <v-btn
                id="closeOverlayBtn"
                color="#003366"
                variant="elevated"
                text="Close"
                :disabled="uploadFileValue !== null"
                @click="closeOverlay"
              />
            </v-col>
          </v-row>
        </v-card-actions>
      </v-card>
    </v-overlay>
    <ConfirmationDialog ref="confirmReplacementFile">
      <template #message>
        <p>
          Results have already been uploaded for {{ assessmentTypeCode }} If you continue with this upload the previously loaded results will be replaced. 
          Please confirm that you would like to replace the existing results for {{ assessmentTypeCode }}.
        </p>
      </template>
    </ConfirmationDialog>
    <v-dialog
      v-model="openResultCorrectDialog"
      persistent
      max-width="675px"
    >
      <v-card style="overflow: visible">
        <v-card-title class="header">
          <v-row>
            <v-col class="d-flex justify-start">
              Upload a Correction to Results
            </v-col>
            <v-col class="d-flex justify-end">
              <v-btn
                id="cancel"
                color="white"
                text="Close"
                size="30"
                icon="mdi-close"
                variant="tonal"
                @click="openResultCorrectDialog= !openResultCorrectDialog"
              />
            </v-col>
          </v-row>
        </v-card-title>
        <v-card-text>
          <v-container>
            <p>Select a session for the results:</p>
            <v-row>
              <v-col cols="6">
                <v-select
                  id="session"
                  v-model="selectedSession"
                  :items="allowedforUpload"
                  item-value="sessionID"
                  item-title="desc"
                  label="Session"
                  variant="underlined"
                />
              </v-col>
              <v-col cols="6">
                <v-btn
                  :disabled="!selectedSession"
                  id="uploadButton"
                  class="mt-4"
                  prepend-icon="mdi-file-upload"
                  variant="elevated"
                  color="#003366"
                  text="Upload Assessment Results"
                  :loading="isLoadingFiles"
                  @click="handleSingleResultFileImport(selectedSession)"
                />
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import alertMixin from '@/mixins/alertMixin';
import { capitalize } from 'lodash';
import ConfirmationDialog from '@/components/util/ConfirmationDialog.vue';
import { Routes, FILE_UPLOAD_STATUS } from '@/utils/constants';
import { getFileNameWithMaxNameLength } from '../../../utils/file';
import ApiService from '@/common/apiService';
import {formatDateTime} from '@/utils/format';
import { LocalDate, DateTimeFormatter, Month } from '@js-joda/core';
import {mapState} from 'pinia';
import {authStore} from '@/store/modules/auth';
import { PERMISSION, hasRequiredPermission } from '@/utils/constants/Permission';

export default {
  name: 'TransferResults',
  components: {
    ConfirmationDialog
  },
  mixins: [alertMixin],
  props: {
    schoolYearSessions: {
      type: Array,
      required: true,
    },
    sessions: {
      type: Array,
      required: true,
    }
  },
  emits: [],
  data() {
    return {
      openResultCorrectDialog: false,
      selectedSession: null,
      type:'',
      headers: [
        { title: 'Assessment Keys', key: 'assessmentType', align: 'start', sortable: true },
        { title: 'Results Uploaded', key: 'resultsUploaded', align: 'start', sortable: true },
        { title: 'Upload Date', key: 'uploadDate', align: 'start', sortable: true },
        { title: 'Uploaded by', key: 'uploadedBy', align: 'start', sortable: true }
      ],
      isLoading: false,
      selectedSessionID: null,
      selectedSessionDesc: null,
      acceptableFileExtensions: ['.txt'],
      requiredRules: [(v) => !!v || 'Required'],      
      uploadFileValue: null,
      hasFileAttached: false,
      fileLoaded: false,
      progress: 0,
      initialLoad: true,
      inputKey: 0,
      validForm: false,
      isLoadingFiles: false,      
      populatedSuccessMessage: null,
      successfulUploadCount: 0,      
      fileUploadList: [],
      progressCounts: [],
      filesetList: [],           
      pageNumber: 1,
      pageSize: 15,
      totalElements: 0,
      fileUploadPending: FILE_UPLOAD_STATUS.PENDING,
      fileUploadSuccess: FILE_UPLOAD_STATUS.UPLOADED,
      fileUploadError: FILE_UPLOAD_STATUS.ERROR,
      assessmentTypeCode: '',
      resultsSummary: [],
      singleResult: false,
      allowedforUpload: []
    };
  },
  computed: {
    ...mapState(authStore, ['userInfo']),
    hasEditPermission() {
      return hasRequiredPermission(this.userInfo, PERMISSION.MANAGE_ASSESSMENT_RESULTS_PERMISSION);
    }
  },
  watch: {
    uploadFileValue() {
      if (this.uploadFileValue) {
        this.importFile();
      }
    },
    schoolYearSessions: {
      handler(value) {
        if(value.length > 0) {
          let openSession = value.filter(sch => sch.isOpen);
          if (openSession.length > 0) {
            this.type = openSession[0].sessionID;
            this.selectedSessionID = openSession[0].sessionID;
            this.selectedSessionDesc = openSession[0].courseYear + '' + openSession[0].courseMonth;
          } else {
            // Fallback to first session if no open sessions are found
            this.type = value[0].sessionID;
            this.selectedSessionID = value[0].sessionID;
            this.selectedSessionDesc = value[0].courseYear + '' + value[0].courseMonth;
          }
        }
      },
      immediate: true
    },
    sessions: {
      handler(value) {
         if(value.length > 0) {
          this.allowedforUpload = value.filter(session => session.isOpen || (session.activeFromDate !== null && session.activeUntilDate!== null && LocalDate.now().isAfter(LocalDate.parse(session.activeFromDate, DateTimeFormatter.ISO_LOCAL_DATE_TIME)) && LocalDate.now().isAfter(LocalDate.parse(session.activeUntilDate, DateTimeFormatter.ISO_LOCAL_DATE_TIME))));
          this.allowedforUpload.forEach(item => {
            item.desc = item.courseYear + '/' + item.courseMonth;
          });
        }
      },
      immediate: true
    },
    type: {
      handler(value) {
        if(value) {
          let selectedSession = this.schoolYearSessions.filter(sess => sess.sessionID === value);
          this.selectedSessionID = selectedSession[0]?.sessionID;
          this.selectedSessionDesc = selectedSession[0]?.courseYear + '' + selectedSession[0]?.courseMonth;
        }
      }
    }
  },
  async created() {
    await this.getResultSummary();
  },
  methods: {
    formatUploadDate(item) {
      if(item.raw.uploadDate) {
        return formatDateTime(item.raw.uploadDate.substring(0, 19), 'uuuu-MM-dd\'T\'HH:mm:ss', 'uuuu/MM/dd HH:mm:ss', true);
      }
    },
    closeOverlay() {
      this.isLoadingFiles = !this.isLoadingFiles;
      this.fileUploadList = [];
      this.uploadFileValue = null;
      this.inputKey = 0;
    },
    validateFileExtension(fileJSON) {
      const extension = `.${fileJSON.name.split('.').slice(-1)}`;
      const failMessage =
        'File extension is invalid. Extension must be ".txt".';
      if (
        extension &&
        this.acceptableFileExtensions.find(
          (ext) => ext.toUpperCase() === extension.toUpperCase()
        ) !== undefined
      ) {
        return true;
      }
      fileJSON.status = this.fileUploadError;
      fileJSON.error = failMessage;
    },
    async validateForm() {
      await this.$nextTick();
      await this.$refs.documentForm.validate();
    },
    async importFile() {
      if (this.uploadFileValue.length > 0) {
        this.isLoadingFiles = true;

        await this.validateForm();
        if (!this.uploadFileValue[0] || !this.validForm) {
          this.inputKey++;
          this.isLoadingFiles = false;
        } else {
          let fileIndex = 0;
          this.filePromises = this.uploadFileValue.map((fileValue) => {
            return new Promise((resolve, reject) => {
              let reader = new FileReader();
              reader.readAsText(fileValue);
              reader.onload = () => {
                let statusJson = {
                  name: fileValue.name,
                  index: fileIndex++,
                  fileContents: reader.result,
                  status: FILE_UPLOAD_STATUS.PENDING,
                  error: null,
                  warning: null,
                };
                this.validateFileExtension(statusJson);
                this.fileUploadList.push(statusJson);
                resolve(statusJson);
              };
              reader.onerror = (error) => {
                let statusJson = {
                  name: fileValue.name,
                  index: fileIndex++,
                  fileContents: null,
                  status: FILE_UPLOAD_STATUS.ERROR,
                  error: error,
                  warning: null,
                };
                this.fileUploadList.push(statusJson);
                reject(statusJson);
              };
            });
          });

          await Promise.all(this.filePromises);

          for await (const fileJSON of this.fileUploadList) {
            if (fileJSON.error === null) {
              await new Promise((resolve) => setTimeout(resolve, 3000));
              if(this.singleResult) {
                await this.uploadResultCorrectionFile(fileJSON, fileJSON.index);
              } else {
                await this.uploadFile(fileJSON, fileJSON.index);
              }
              this.inputKey++;
            }
          }
          this.uploadFileValue = null;
          this.singleResult = false;
          this.openResultCorrectDialog = false;
          await this.getResultSummary();
        }
      }
    },
    async uploadResultCorrectionFile(fileJSON, index) {
      let document;
      try {
        document = {
          fileName: getFileNameWithMaxNameLength(
            this.uploadFileValue[index].name
          ),
          fileContents: btoa(
            unescape(encodeURIComponent(fileJSON.fileContents))
          ),
          fileType: this.uploadFileValue[index].name.split('.')[1],
        };
        await ApiService.apiAxios
          .post(
            Routes.assessments.ASSESSMENT_RESULTS + '/session/' + this.selectedSessionID + '/upload-file?isSingleUpload=true', document
          )
          .then(() => {});
        this.successfulUploadCount += 1;
        fileJSON.status = this.fileUploadSuccess;
      } catch (e) {
          console.error(e);
          fileJSON.error = e.response.data;
          fileJSON.status = this.fileUploadError;
      }
    },
    async uploadFile(fileJSON, index) {
      let document;
      try {
        document = {
          fileName: getFileNameWithMaxNameLength(
            this.uploadFileValue[index].name
          ),
          fileContents: btoa(
            unescape(encodeURIComponent(fileJSON.fileContents))
          ),
          fileType: this.uploadFileValue[index].name.split('.')[1],
        };
        await ApiService.apiAxios
          .post(
            Routes.assessments.ASSESSMENT_RESULTS + '/session/' + this.selectedSessionID + '/upload-file', document
          )
          .then(() => {});
        this.successfulUploadCount += 1;
        fileJSON.status = this.fileUploadSuccess;
      } catch (e) {
        if(e?.message.includes('428')){
          this.assessmentTypeCode = e.response.data;
          const confirmation = await this.$refs.confirmReplacementFile.open('Confirm Results Replacement', null, {color: '#fff', width: 580, closeIcon: false, subtitle: false, dark: false, resolveText: 'Replace Results', rejectText: 'Cancel'});
          if (!confirmation) {
            fileJSON.error = 'Abandoned';
            fileJSON.status = this.fileUploadError;
            return;
          }
          try {
            await ApiService.apiAxios.post(Routes.assessments.ASSESSMENT_RESULTS + '/session/' + this.selectedSessionID + '/upload-file?replaceResultsFlag=true', document)
              .then(() => {});
            this.successfulUploadCount += 1;
            fileJSON.status = this.fileUploadSuccess;
          }catch (e2) {
            console.error(e);
            fileJSON.error = 'Error occurred during upload, please try again later.';
            fileJSON.status = this.fileUploadError;
          }
        }else{
          console.error(e);
          fileJSON.error = e.response.data;
          fileJSON.status = this.fileUploadError;
        }
      }
    },
    async getResultSummary() {
      this.isLoading= true;
      this.resultsSummary=[];
      if(this.type) {
        ApiService.apiAxios.get(Routes.assessments.ASSESSMENT_RESULTS + '/session/' + this.type + '/summary').then((response) => {
          this.resultsSummary = response.data;
        }).catch(error => {
          console.error(error);
          this.setFailureAlert('An error occurred while trying to get result summary. Please try again later.');
        }).finally(() => {
          this.isLoading = false;
        });
      }
    },
    handleFileImport(session) {
      this.selectedSessionID = session.sessionID;
      this.populatedSuccessMessage = null;
      this.successfulUploadCount = 0;
      this.$refs.uploader.click();
    },
    handleSingleResultFileImport(sessionID) {
      this.selectedSessionID = sessionID;
      this.populatedSuccessMessage = null;
      this.successfulUploadCount = 0;
      this.$refs.uploader.click();
      this.singleResult=true;
    },
    formatMonth(month) {
      return capitalize(Month.of(month).toString());
    },
    downloadReport(type) {
      try {
        const url = `${Routes.assessments.BASE_URL}/${this.selectedSessionID}/report/${type}/download?sessionCode=${this.selectedSessionDesc}`;
        window.open(url);
      } catch (error) {
        console.error(error);
        this.setFailureAlert(
          error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while trying to retrieve report.'
        );
      }
    }
  },
};
</script>

<style scoped>
.border {
  border: 2px solid grey;
  border-radius: 5px;
  margin-bottom: 10px;
}

h4, .v-icon {
  color: #38598a;
}

.schools-in-progress-header {
  margin-top: 12px;
  margin-bottom: 1em;
  font-weight: bold;
  text-align: start;
  line-height: 1.5;
  font-size: 1rem;
}

:deep(.v-btn__content) {
  white-space: break-spaces;
}

:deep(.v-data-table__thead) {
  color: #7f7f7f;
}

.fileUploadError {
  background-color: #d5304a;
  color: white;
  border-radius: 5px;
}

.fileUploadSuccess {
  background-color: rgba(58, 161, 22, 0.88);
  color: white;
  border-radius: 5px;
}

.fileUploadWarning {
  background-color: #f1e786;
  border-radius: 5px;
}

.centered {
  display: block;
  justify-content: center;
  align-content: center;
  margin-bottom: 2em;
}

::v-deep
  .v-theme--myCustomLightTheme.v-btn.v-btn--disabled:not(.v-btn--flat):not(
    .v-btn--text
  ):not(.v-btn--outlined)
  span {
  color: white !important;
}

:deep(.v-data-table-footer__items-per-page) {
  display: none;
}
:deep(.v-data-table-footer) {
       display: none;
 }

 .report-item {
  color: #1976d2
 }

 .header {
  background-color: #003366;
  color: white;
  font-size: medium !important;
  font-weight: bolder !important;
 }
</style>
