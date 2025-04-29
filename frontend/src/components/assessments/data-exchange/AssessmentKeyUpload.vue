<template>
  <v-container class="mb-6" fluid>
    <div class="borderless">
      <v-row>
        <v-col class="d-flex justify-center">
          <h1>Upload Assessment Keys</h1>
        </v-col>
      </v-row>

      <v-row no-gutters>
        <v-col align-self="start" />
        <v-col cols="2" offset="0" align-self="center">
          <v-sheet class="pa-1 ma-1">
            <v-autocomplete
              id="Session"
              v-model="selectedSessionID"
              variant="underlined"
              :items="sessionSearchNames"
              label="Please select the session"
              :clearable="true"
              color="#003366"
              item-title="title"
              item-value="value"
              autocomplete="off"
            />
          </v-sheet>
        </v-col>
        <v-col align-self="end" />
      </v-row>
      <v-row>
        <v-col class="d-flex justify-center">
          <span class="mr-1">
            Please choose the session and click the button below to select your
            Assessment Keys for upload and processing.</span>
        </v-col>
      </v-row>
      <v-row>
        <v-col class="d-flex justify-center">
          <span class="mr-1">Check the status of your files in the "Summary of Uploaded Data"
            table below.</span>
        </v-col>
      </v-row>
      <v-row>
        <v-col class="d-flex justify-space-evenly">
          <v-btn
            id="uploadButton"
            prepend-icon="mdi-file-upload"
            variant="elevated"
            color="#003366"
            text="Upload Assessment Key Data Files"
            :loading="isLoadingFiles"
            :disabled="!selectedSessionID"
            @click="handleFileImport"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12">
          <p class="schools-in-progress-header">Summary of Uploaded Data</p>
        </v-col>
      </v-row>
      <v-data-table-server
        v-model:page.sync="pageNumber"
        v-model:items-per-page.sync="pageSize"
        :items-length="totalElements"
        :items="filesetList"
        :headers="headers"
        mobile-breakpoint="0"
      >
        <template #item="props">
          <tr>
            <td v-for="column in headers" :key="column.key">
              <span v-if="column.key === 'errorLink'">
                <a
                  v-if="isFilesetComplete(props.item)"
                  class="ml-1"
                  @click="navigateToErrors(props.item)"
                >View Report</a>
              </span>
              <span
                v-else-if="column.key === 'demFileUploadDate' || column.key === 'xamFileUploadDate' || column.key === 'crsFileUploadDate'"
              >
                {{ props.item[column.key] ? props.item[column.key].substring(0, 19).replaceAll("-", "/").replaceAll("T", " ") : "-" }}
              </span>
              <div
                v-else-if="column.key === 'demFileStatusCode' || column.key === 'xamFileStatusCode' || column.key === 'crsFileStatusCode'"
              >
                <div v-if="props.item[column.key] === 'LOADED'">
                  <span v-if="isFilesetInProgress(props.item)">
                    <v-progress-circular
                      :size="20"
                      :width="4"
                      color="primary"
                      indeterminate
                    />
                    Processing
                  </span>
                  <span v-else>
                    <v-icon icon="mdi-clock-alert-outline" color="warning" />
                    Awaiting Other Files
                  </span>
                </div>
                <span v-if="props.item[column.key] === 'NOTLOADED'">
                  <v-icon icon="mdi-alert-circle-outline" color="error" />
                  Not Loaded
                </span>
                <span v-if="props.item[column.key] === 'COMPLETED'">
                  <v-icon icon="mdi-check-circle-outline" color="success" />
                  Processed
                </span>
              </div>
              <span v-else-if="props.item[column.key]">
                {{ props.item[column.key] }}
              </span>
              <span v-else>-</span>
            </td>
          </tr>
        </template>
      </v-data-table-server>
    </div>
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
          Uploading a replacement file will remove all data associated with the
          existing file you have uploaded.
        </p>
        &nbsp;
        <p>
          Once this action is completed <strong>it cannot be undone</strong> and
          <strong>any fixes to data issues or changes to student data will need to be
            completed again.</strong>
        </p>
      </template>
    </ConfirmationDialog>
  </v-container>
</template>

<script>
import moment from 'moment';
import { sortBy } from 'lodash';
import ConfirmationDialog from '@/components/util/ConfirmationDialog.vue';
import { Routes, FILE_UPLOAD_STATUS } from '@/utils/constants';
import { getFileNameWithMaxNameLength } from '../../../utils/file';
import ApiService from '@/common/apiService';

export default {
  name: 'AssessmentKeyUpload',
  components: {
    ConfirmationDialog,
  },
  mixins: [],
  props: {
    schoolYear: {
      type: String,
      required: true,
    },
    schoolYearSessions: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      isLoading: false,
      sessionSearchNames: [],
      selectedSessionID: null,
      acceptableFileExtensions: ['.tab'],
      requiredRules: [(v) => !!v || 'Required'],      
      uploadFileValue: null,
      hasFileAttached: false,
      fileLoaded: false,
      progress: 0,
      initialLoad: true,
      interval: null,
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
      headers: [
        { title: 'File Name', key: 'fileName' },
        { title: 'Upload Date', key: 'uploadDate' },
      ],
    };
  },
  computed: {},
  watch: {
    uploadFileValue() {
      if (this.uploadFileValue) {
        this.importFile();
      }
    },
  },
  async created() {
    this.setupAssessmentSessions();
  },
  methods: {
    closeOverlay() {
      this.isLoadingFiles = !this.isLoadingFiles;
      this.fileUploadList = [];
      this.uploadFileValue = null;
      this.inputKey = 0;
    },
    validateFileExtension(fileJSON) {
      const extension = `.${fileJSON.name.split('.').slice(-1)}`;
      const failMessage =
        'File extension is invalid. Extension must be ".tab".';

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
    validateFileNameFormat(fileJSON) {
      const filename = `${fileJSON.name.split('.')[0]}`;
      const failMessage =
        'File name format is invalid. Filename must be "TRAX_YYYYMM_{ASSESSMENT TYPE}".';
      if(filename) {
        let filename_parts = filename.split('_');
        if(filename_parts.length == 3) {
          const session = this.schoolYearSessions.find(filter => filter.sessionID === this.selectedSessionID);
          let assessmentTypes = session ? session.assessments.map(item => item.assessmentTypeCode) : [];
          if(filename_parts[0] === 'TRAX' && filename_parts[1] === session.courseYear.concat(session.courseMonth) && assessmentTypes.includes(filename_parts[2]) )  {
            return true;
          }            
        }         
      }             
      fileJSON.status = this.fileUploadError;
      fileJSON.error = failMessage;
    },
    async startPollingStatus() {
      this.interval = setInterval(this.getFileSummaryPaginated, 30000); // polling the api every 30 seconds
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
                this.validateFileNameFormat(statusJson);
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
          await this.getFileSummaryPaginated();
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
            Routes.assessments.ASSESSMENT_KEYS + '/session/' + this.selectedSessionID + '/upload-file', document
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
    async getFileSummaryPaginated() {
      //Implement logic to get file summary.
    },
    handleFileImport() {
      if (this.selectedSessionID) {
        this.populatedSuccessMessage = null;
        this.successfulUploadCount = 0;
        this.$refs.uploader.click();
      }
    },
    setupAssessmentSessions() {
      this.sessionSearchNames = [];
      this.schoolYearSessions.forEach((session) => {
        this.sessionSearchNames.push({
          id: session.sessionID,
          courseMonth: parseInt(session.courseMonth),
          courseYear: parseInt(session.courseYear),
          title: this.formatMonth(session.courseMonth),
          value: session.sessionID,
        });
      });
      this.sessionSearchNames = sortBy(this.sessionSearchNames, ['courseYear','courseMonth']);
    },
    formatMonth(month) {
      return moment(month, 'MM').format('MMMM');
    },
  },
};
</script>

<style scoped>
.borderless {
  border: 0px;
  margin: 2em;
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
</style>
