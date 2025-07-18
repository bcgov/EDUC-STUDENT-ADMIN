<template>
  <v-container class="mb-6" fluid>
    <v-expansion-panels 
      v-model="type"
      @update:modelValue="getResultSummary()"
      >
      <v-expansion-panel
        class="border"
        v-for="(session, index) in schoolYearSessions"
        :key="index"
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
            <template  v-slot:item.resultsUploaded="{ item }">
              <v-icon style="color: red;" v-if="item.raw.uploadedBy === null">mdi-close</v-icon>
              <v-icon style="color: green;" v-else>mdi-check</v-icon>
            </template>
            <template  v-slot:item.uploadDate="{ item }">
              {{ formatUploadDate(item) }}
            </template>
          </v-data-table>
          <v-row>
            <v-col>
              <v-btn
                id="summary"
                color="#1976d2"
                text="Summary Report"
                class="mb-1"
                prepend-icon="mdi-tray-arrow-down"
                variant="text"
              />
              <v-btn
                id="detailed"
                color="#1976d2"
                text="Detailed Results"
                class="mr-2 mb-1"
                prepend-icon="mdi-tray-arrow-down"
                variant="text"
              />
            </v-col>
            <v-col class="d-flex justify-end">
              <v-btn
                id="uploadButton"
                prepend-icon="mdi-file-upload"
                variant="elevated"
                color="#003366"
                text="Upload Assessment Results"
                :loading="isLoadingFiles"
                :disabled="!session.isOpen"
                @click="handleFileImport(session)"
              />
            </v-col>
          </v-row>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

    <v-form ref="documentForm" v-model="validForm">
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
  </v-container>
</template>

<script>
import alertMixin from '@/mixins/alertMixin';
import { capitalize } from 'lodash';
import ConfirmationDialog from '@/components/util/ConfirmationDialog.vue';
import { Routes, FILE_UPLOAD_STATUS } from '@/utils/constants';
import { getFileNameWithMaxNameLength } from '../../../utils/file';
import ApiService from '@/common/apiService';
import { Month } from '@js-joda/core';
import AssessmentKeyTable from './AssessmentKeyTable.vue';
import {formatDateTime} from '@/utils/format';

export default {
  name: 'TransferResults',
  components: {
    ConfirmationDialog,
    AssessmentKeyTable
  },
  mixins: [alertMixin],
  props: {
    schoolYearSessions: {
      type: Array,
      required: true,
    },
  },
  emits: [],
  data() {
    return {
      type:'',
      headers: [
        { title: 'Assessment Keys', key: 'assessmentType', align: 'start', sortable: true },
        { title: 'Results Uploaded', key: 'resultsUploaded', align: 'start', sortable: true },
        { title: 'Upload Date', key: 'uploadDate', align: 'start', sortable: true },
        { title: 'Uploaded by', key: 'uploadedBy', align: 'start', sortable: true }
      ],
      isLoading: false,
      selectedSessionID: null,
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
      assessmentTypeCode: ''
    };
  },
  computed: {},
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
          this.type = openSession[0].sessionID;
          this.selectedSessionID = openSession[0].sessionID;
        }
      },
      immediate: true
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
              await this.uploadFile(fileJSON, fileJSON.index);
              this.inputKey++;
            }
          }
          this.uploadFileValue = null;
          await this.getResultSummary();
        }
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
      ApiService.apiAxios.get(Routes.assessments.ASSESSMENT_RESULTS + '/session/' + this.selectedSessionID + '/summary').then((response) => {
        this.resultsSummary = response.data;
      }).catch(error => {
        console.error(error);
        this.setFailureAlert('An error occurred while trying to get result summary. Please try again later.');
      }).finally(() => {
        this.isLoading = false;
      })
    },
    handleFileImport(session) {
      this.selectedSessionID = session.sessionID;
      this.populatedSuccessMessage = null;
      this.successfulUploadCount = 0;
      this.$refs.uploader.click();
    },
    formatMonth(month) {
      return capitalize(Month.of(month).toString());;
    },
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
</style>
