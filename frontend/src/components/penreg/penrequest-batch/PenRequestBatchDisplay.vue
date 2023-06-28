<template>
  <v-container
    fluid
    class="fill-height px-0 mb-4"
  >
    <v-row
      no-gutters
      class="list-actions pt-4 pb-0 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3"
      style="background-color:white;"
    >
      <v-col
        cols="1"
        class="mt-1"
      >
        <v-select
          id="select-school-group"
          v-model="selectedSchoolGroup"
          :items="schoolGroups"
          variant="outlined"
          dense
          color="#38598a"
          append-icon="mdi-chevron-down"
        />
      </v-col>
      <v-col>
        <v-form v-model="isValidSearchForm">
          <v-sheet
            class="mx-4 px-2 py-0 mb-2 d-flex flex-row flex-grow-1 align-center align-self-start"
            color="rgba(0, 0, 0, 0.06)"
            outlined
            rounded
          >
            <v-col class="pa-0">
              <v-row
                no-gutters
                class="pa-0"
              >
                <v-col
                  cols="3"
                  class="py-0 px-1 px-sm-1 px-md-2 px-lg-2 px-xl-3"
                >
                  <v-text-field
                    id="submissionNumber"
                    v-model="searchInputParams.submissionNumber"
                    tabindex="1"
                    color="#003366"
                    label="Submission #"
                    maxlength="8"
                    dense
                    autofocus
                    @keyup.enter="enterPushed()"
                    @input="searchHasValues"
                  />
                </v-col>
                <v-col
                  cols="3"
                  class="py-0 px-1 px-sm-1 px-md-2 px-lg-2 px-xl-3"
                >
                  <v-text-field
                    id="minCode"
                    v-model="searchInputParams.mincode"
                    tabindex="2"
                    color="#003366"
                    label="Mincode"
                    maxlength="8"
                    :rules="validateField(searchInputParams.minCode, isValidMincode, minCodeHint)"
                    dense
                    autofocus
                    @keyup.enter="enterPushed()"
                    @input="searchHasValues"
                  />
                </v-col>
                <v-col
                  cols="3"
                  class="py-0 px-1 px-sm-1 px-md-2 px-lg-2 px-xl-3"
                >
                  <v-text-field
                    id="schoolName"
                    v-model="searchInputParams.schoolName"
                    tabindex="3"
                    color="#003366"
                    label="School Name"
                    dense
                    @keyup.enter="enterPushed()"
                    @input="searchHasValues"
                  />
                </v-col>
              </v-row>
            </v-col>
  
            <PrimaryButton
              id="refine-action"
              class="mr-2 mb-3"
              secondary
              text="Clear"
              :click-action="clearSearchParams"
            />
            <PrimaryButton
              id="search-action"
              :disabled="!isValidSearchForm || !searchEnabled"
              :loading="searchLoading && searchEnabled"
              class="mr-0 mb-3"
              text="Search"
              :click-action="search"
            />
          </v-sheet> 
        </v-form>
      </v-col>
          
      <PrimaryButton
        id="view-list-action"
        class="mr-2 mt-1"
        :disabled="!filesSelected"
        :click-action="clickViewList"
        text="View List"
      />
      <PrimaryButton
        id="view-details-action"
        class="mx-2 mt-1"
        :disabled="!filesSelected"
        :loading="loadingRequestIDs"
        :click-action="clickViewDetails"
        text="View Details"
      />
      <v-menu offset-y>
        <template #activator="{ on }">
          <PrimaryButton
            id="archive-action"
            class="mt-1"
            :disabled="!filesSelected || loadingFiles"
            :on="on"
            text="Finish Submission"
            icon="mdi-chevron-down"
            large-icon
          />
        </template>
        <v-list>
          <v-list-item @click="archiveAndReturnFixedOnly">
            <v-list-item-title>Return Except Fix</v-list-item-title>
          </v-list-item>
          <v-list-item @click="archiveAndReturnAll">
            <v-list-item-title>Return With Fix</v-list-item-title>
          </v-list-item>
          <v-list-item @click="archiveOnly">
            <v-list-item-title>Archive Only</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-row>
    <v-row
      no-gutters
      class="py-2"
      style="background-color:white;"
    >
      <PenRequestBatchList
        v-model:filters="filters"
        :school-group="selectedSchoolGroup"
        :search-params="searchParams"
        :loading-files="loadingFiles"
        :in-progress-saga-i-ds="inProgressSagaIDs"
        @table-load="searchLoading=false"
      />
    </v-row>
    <ConfirmationDialog ref="fixableConfirmationDialog">
      <template #title="{cancel}">
        <v-row
          justify="space-between"
          no-gutters
        >
          <v-col class="pl-4 pt-4">
            {{ archiveAndReturnMessage }}<br><br>
            {{ archiveAndReturnSubtext }}
          </v-col>
          <v-btn
            id="closeBtn"
            text
            icon
            :click-action="cancel"
          >
            <v-icon color="#38598A">
              mdi-close
            </v-icon>
          </v-btn>
        </v-row>
      </template>
    </ConfirmationDialog>
    <ConfirmationDialog ref="confirmationDialog" />
  </v-container>
</template>

<script>
import { PEN_REQ_BATCH_STUDENT_REQUEST_CODES, Routes } from '@/utils/constants';
import { mapState, mapActions } from 'pinia';
import PenRequestBatchList from './PenRequestBatchList.vue';
import PrimaryButton from '../../util/PrimaryButton.vue';
import router from '../../../router';
import alertMixin from '../../../mixins/alertMixin';
import ConfirmationDialog from '../../util/ConfirmationDialog.vue';
import pluralize from 'pluralize';
import ApiService from '@/common/apiService';
import Mousetrap from 'mousetrap';
import {deepCloneObject} from '@/utils/common';
import searchMixin from '@/mixins/searchMixin';
import {penRequestBatchStore} from '@/store/modules/penRequestBatch';
import {appStore} from '@/store/modules/app';
import {penRequestBatchStudentSearchStore} from '@/store/modules/prbStudentSearch';
import {navigationStore} from '@/store/modules/setNavigation';

export default {
  name: 'PenRequestBatchDisplay',
  components: {
    PrimaryButton,
    PenRequestBatchList,
    ConfirmationDialog
  },
  mixins: [alertMixin, searchMixin],
  props: {
    schoolGroup: {
      type: String,
      default: 'K12'
    },
  },
  data() {
    return {
      schoolGroups: [{value: 'K12', text: 'K-12'}, {value: 'PSI', text: 'PSI'}],
      filters:['Fixable'],
      loadingFiles: false,
      archiveAndReturnMessage: '',
      archiveAndReturnSubtext: '',
      inProgressSagaIDs: [],
      loadingRequestIDs: false
    };
  },
  computed: {
    ...mapState(penRequestBatchStore, ['selectedFiles', 'prbStudentStatusFilters', 'currentBatchFileSearchParams']),
    ...mapState(appStore, ['schoolApiMincodeSchoolNames']),
    selectedSchoolGroup: {
      get(){
        return penRequestBatchStore().selectedSchoolGroup;
      },
      set(newSchoolGroup){
        return penRequestBatchStore().setSelectedSchoolGroup(newSchoolGroup);
      }
    },
    filesSelected() {
      return this.selectedFiles?.length > 0;
    },
    selectedFileBatchIDs() {
      return this.selectedFiles.map(file => file.penRequestBatchID).join(',');
    },
    selectedFilterNames() {
      const filterNames = {
        matchedCount: [PEN_REQ_BATCH_STUDENT_REQUEST_CODES.MATCHEDSYS, PEN_REQ_BATCH_STUDENT_REQUEST_CODES.MATCHEDUSR],
        newPenCount: [PEN_REQ_BATCH_STUDENT_REQUEST_CODES.NEWPENSYS, PEN_REQ_BATCH_STUDENT_REQUEST_CODES.NEWPENUSR],
        errorCount: [PEN_REQ_BATCH_STUDENT_REQUEST_CODES.ERROR, PEN_REQ_BATCH_STUDENT_REQUEST_CODES.INFOREQ],
        repeatCount: [PEN_REQ_BATCH_STUDENT_REQUEST_CODES.REPEAT],
        fixableCount: [PEN_REQ_BATCH_STUDENT_REQUEST_CODES.FIXABLE],
        duplicateCount: [PEN_REQ_BATCH_STUDENT_REQUEST_CODES.DUPLICATE],
      };

      return this.prbStudentStatusFilters.map(filter => filterNames[filter]).join(',');
    }
  },
  created() {
    this.selectedSchoolGroup || (this.selectedSchoolGroup = this.schoolGroup);
    this.searchInputParams = deepCloneObject(this.currentBatchFileSearchParams);
    this.searchHasValues();
    this.search();
  },
  mounted() {
    Mousetrap.reset();
  },
  methods: {
    ...mapActions(penRequestBatchStudentSearchStore, ['clearPrbStudentSearchState']),
    ...mapActions(penRequestBatchStore, ['setSelectedFiles']),
    ...mapActions(navigationStore, ['setSelectedIDs', 'setCurrentRequest']),
    removeFilter(index) {
      this.filters.splice(index, 1);
    },
    clickViewList() {
      const batchIDs = this.selectedFileBatchIDs;
      const statusFilters = this.selectedFilterNames;
      this.clearPrbStudentSearchState();
      router.push({name: 'prbStudentList', query: { batchIDs, statusFilters }});
    },
    async clickViewDetails() {
      this.loadingRequestIDs = true;
      const query = {
        params: {
          penRequestBatchIDs: this.selectedFileBatchIDs,
          penRequestBatchStudentStatusCodes: this.selectedFilterNames.length > 0 ? this.selectedFilterNames : Object.values(PEN_REQ_BATCH_STUDENT_REQUEST_CODES).join(',')
        }
      };

      ApiService.apiAxios.get(`${Routes['penRequestBatch'].FILES_URL}/penRequestBatchStudentIDs`, query)
        .then(response => {
          this.setSelectedIDs(response.data);
          router.push({name: 'prbStudentDetails', params: {prbStudentID: response.data[0].penRequestBatchStudentID}});
        })
        .finally(() => {
          this.loadingRequestIDs = false;
        })
        .catch(error => {
          this.setFailureAlert('An error occurred while fetching PEN Request Files! Please try again later.');
          console.log(error);
        });
    },
    async archiveOnly() {
      const fileNumber = this.selectedFiles.length;
      const result = await this.$refs.confirmationDialog.open(
        `Please confirm that you would like to Archive ${fileNumber} ${pluralize('file', fileNumber)}`,
        'Note this action will not return any files to the submitting school.',
        { width: '520px', messagePadding: 'px-4 pt-4', color: '', dark: false, closeIcon: true, divider: true, subtitle: true, resolveText: 'Confirm' }
      );
      if(result) {
        const payload = {
          penRequestBatchIDs: this.selectedFiles.map(file => file.penRequestBatchID)
        };
        this.loadingFiles = true;
        ApiService.apiAxios.post(`${Routes['penRequestBatch'].FILES_URL}/archiveFiles`, payload)
          .then(response => {
            const archivedNumber = response.data.length;
            const archivedMessage = `${archivedNumber} PEN Request ${pluralize('File', archivedNumber)} ${pluralize('has', archivedNumber)} been archived.`;
            if(archivedNumber === fileNumber) {
              this.setSuccessAlert(`Success! ${archivedMessage}`);
            } else {
              this.setFailureAlert(`An error occurred while archiving PEN Request Files! ${archivedMessage} Please try again later.`);
            }
          })
          .catch(error => {
            console.log(error);
            if(error?.response?.data?.code === 400) {
              this.setFailureAlert(`Unable to archive all the selected files due to the following reason. ${error?.response?.data?.message}`);
            }else {
              this.setFailureAlert('An error occurred while archiving PEN Request Files! Please try again later.');
            }
          })
          .finally(() => {
            this.loadingFiles = false;
          });
      }
    },
    async archiveAndReturnFixedOnly() {
      const fileNumber = this.selectedFiles.length;
      this.archiveAndReturnMessage = `Please confirm that you would like to return the response files to ${fileNumber} PEN request ${pluralize('file', fileNumber)}.`;
      this.archiveAndReturnSubtext = 'Note this action will not return any files to the submitting school if FIXABLE requests exist.';
      const result = await this.$refs.fixableConfirmationDialog.open(null,null,
        { width: '520px', messagePadding: 'px-4 pt-4', color: '', dark: false, closeIcon: true, divider: true, subtitle: true, resolveText: 'Confirm' }
      );
      if(result) {
        const filesIDsWithFixableNumber = this.selectedFiles.filter(prb => prb?.fixableCount > 0).map(file => file.penRequestBatchID).length;
        const filesIDsWithoutFixable = this.selectedFiles.filter(prb => prb?.fixableCount === 0).map(file => this.formatArchivePayload(file));

        this.loadingFiles = true;
        ApiService.apiAxios.post(`${Routes['penRequestBatch'].FILES_URL}/archiveAndReturnFiles`, { penRequestBatchIDs: filesIDsWithoutFixable})
          .then((archiveAndReturnResponse) => {
            const archivedAndReturnedNumber = archiveAndReturnResponse?.data?.length;
            let archivedMessage = `Archive requests for ${archivedAndReturnedNumber} PEN Request ${pluralize('File', archivedAndReturnedNumber)} ${pluralize('has', archivedAndReturnedNumber)} been initiated.`;
            if (filesIDsWithFixableNumber > 0) {
              archivedMessage += `\n${filesIDsWithFixableNumber} PEN Request ${pluralize('File', filesIDsWithFixableNumber)} with FIXABLE records ${pluralize('has', filesIDsWithFixableNumber)} been withheld.`;
            }

            if(archiveAndReturnResponse?.data) {
              archiveAndReturnResponse?.data?.forEach(response => {
                this.inProgressSagaIDs.push({sagaID: response.sagaId, penRequestBatchID: response.penRequestBatchID});
              });
            }
            if(archivedAndReturnedNumber + filesIDsWithFixableNumber === fileNumber) {
              this.setSuccessAlert(`Success! ${archivedMessage}`);
            } else {
              this.setFailureAlert('An error occurred while archiving PEN Request Files! Please try again later.');
            }
            this.setSelectedFiles([]);
          })
          .catch(error => this.setSagaErrorMessage(error))
          .finally(() => {
            this.loadingFiles = false;
          });
      }
    },
    async archiveAndReturnAll() {
      const fileNumber = this.selectedFiles.length;
      this.archiveAndReturnMessage = `Please confirm that you would like to return the response files to ${fileNumber} PEN request ${pluralize('file', fileNumber)}.`;
      this.archiveAndReturnSubtext = 'Note this action will return all files to the submitting school.';
      const result = await this.$refs.fixableConfirmationDialog.open(null,null,
        { width: '520px', messagePadding: 'px-4 pt-4', color: '', dark: false, closeIcon: true, divider: true, subtitle: true, resolveText: 'Confirm' }
      );
      if(result) {
        const files = this.selectedFiles.map(file => this.formatArchivePayload(file));

        this.loadingFiles = true;
        ApiService.apiAxios.post(`${Routes['penRequestBatch'].FILES_URL}/archiveAndReturnFiles`, { penRequestBatchIDs: files})
          .then((archiveAndReturnResponse) => {
            const archivedAndReturnedNumber = archiveAndReturnResponse?.data?.length;
            let archivedMessage = `Archive requests for ${archivedAndReturnedNumber} PEN Request ${pluralize('File', archivedAndReturnedNumber)} ${pluralize('has', archivedAndReturnedNumber)} been initiated.`;

            if(archiveAndReturnResponse?.data) {
              archiveAndReturnResponse?.data?.forEach(response => {
                this.inProgressSagaIDs.push({sagaID: response.sagaId, penRequestBatchID: response.penRequestBatchID});
              });
            }
            if(archivedAndReturnedNumber === fileNumber) {
              this.setSuccessAlert(`Success! ${archivedMessage}`);
            } else {
              this.setFailureAlert('An error occurred while archiving PEN Request Files! Please try again later.');
            }
            this.setSelectedFiles([]);
          })
          .catch(error => this.setSagaErrorMessage(error))
          .finally(() => {
            this.loadingFiles = false;
          });
      }
    },
    formatArchivePayload(file) {
      return {
        penRequestBatchID: file.penRequestBatchID,
        schoolName: this.schoolApiMincodeSchoolNames.get(file?.mincode?.replace(' ', ''))
      };
    },
    setSagaErrorMessage(error) {
      if(error?.response?.data?.code === 409) {
        this.setFailureAlert('Another saga is in progress for this file, please try again later.');
      }else if(error?.response?.data?.code === 400) {
        this.setFailureAlert(`Unable to archive all the selected files due to the following reason. ${error?.response?.data?.message}`);
      } else {
        this.setFailureAlert('An error occurred while archiving PEN Request Files! Please try again later.');
      }
      console.log(error);
    }
  }
};
</script>

<style scoped>
  .v-btn {
    text-transform: none !important;
  }

</style>
