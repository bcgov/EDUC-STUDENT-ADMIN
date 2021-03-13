<template>
  <v-container fluid class="fill-height px-0 mb-4">
    <AlertMessage v-model="alert" :alertMessage="alertMessage" :alertType="alertType" :timeoutMs="3000"
                  class="mt-2"></AlertMessage>
    <v-row no-gutters class="list-actions pt-4 pb-4 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3"
           style="background-color:white;">
      <v-sheet
          v-if="filters && filters.length > 0"
          class="mr-4 px-2 py-1 d-flex flex-row flex-grow-1 align-center align-self-start"
          color="rgba(0, 0, 0, 0.06)"
          outlined
          rounded
      >
        <span class="mr-4"><strong>Filtered by</strong></span>
        <FilterTag
            v-for="(filter, index) in filters"
            :key="index"
            :id="index + 'tag'"
            :text="filter"
            class="mr-2"
            :close="removeFilter"
            :item="index"
        >
        </FilterTag>
      </v-sheet>
      <v-spacer v-else></v-spacer>
      <PrimaryButton id="review-action" class="mr-2" :disabled="!filesSelected" text="Review" @click.native="clickReview"></PrimaryButton>
      <PrimaryButton id="process-action" class="mx-2" :disabled="!filesSelected" text="Process" :loading="isProcessing"
                     @click.native="markRecordForProcessing"></PrimaryButton>
      <PrimaryButton id="delete-action" class="mx-2" :disabled="!filesSelected" text="Delete" :loading="isDeleting"
                     @click.native="deleteFile"></PrimaryButton>
    </v-row>
    <v-row no-gutters class="py-2" style="background-color:white;">
      <HeldRequestBatchList
          :schoolGroup="schoolGroup"
          :filters.sync="filters"
          :loadingFiles="loadingFiles"
          :selectedFile.sync="selectedFile"
          @failure-alert="setFailureAlert"
          @file-click="clickFile"
      ></HeldRequestBatchList>
    </v-row>
    <PrbFileModal
        v-if="openFileViewer"
        :open-dialog="openFileViewer"
        :submission-number="submissionNumber"
        @closeDialog="closeFileViewer"
    >
    </PrbFileModal>
    <ConfirmationDialog ref="confirmationDialog">
      <template v-slot:message>
        <v-col class="mt-n6">
          <v-row class="mt-n2 mb-3">
            Are you sure you want
            to&nbsp;<strong>{{ operation }}</strong>&nbsp;submission&nbsp;<strong>{{ submissionNumber }}</strong>?
          </v-row>
        </v-col>
      </template>
    </ConfirmationDialog>
  </v-container>
</template>

<script>
import HeldRequestBatchList from './HeldRequestBatchList';
import FilterTag from '../../util/FilterTag';
import PrimaryButton from '../../util/PrimaryButton';
import alertMixin from '../../../mixins/alertMixin';
import ConfirmationDialog from '../../util/ConfirmationDialog';
import AlertMessage from '../../util/AlertMessage';
import ApiService from '@/common/apiService';
import {Routes} from '@/utils/constants';
import PrbFileModal from '@/components/penreg/penrequest-batch/PrbFileModal';

export default {
  name: 'HeldRequestBatchDisplay',
  components: {
    FilterTag,
    PrimaryButton,
    HeldRequestBatchList,
    ConfirmationDialog,
    AlertMessage,
    PrbFileModal
  },
  mixins: [alertMixin],
  data() {
    return {
      schoolGroup: 'PSI',
      filters: [],
      loadingFiles: false,
      selectedFile: null,
      isDeleting: false,
      isProcessing: false,
      operation:undefined,
      openFileViewer: false,
      submissionNumber: '',
    };
  },
  computed: {
    filesSelected() {
      return !!this.selectedFile;
    },
    selectedFileBatchID() {
      return this.selectedFile?.penRequestBatchID;
    },
  },
  methods: {
    removeFilter(index) {
      this.filters.splice(index, 1);
    },
    async deleteFile() {
      const userConfirmed = await this.isConfirmedByUser('Delete');
      if (!!userConfirmed) {
        const penRequestBatchIDs = [];
        penRequestBatchIDs.push(this.selectedFile.penRequestBatchID);
        const payload = {
          penRequestBatchIDs
        };
        this.isDeleting = true;
        ApiService.apiAxios.post(`${Routes['penRequestBatch'].FILES_URL}/deleteFiles`, payload)
            .then(() => {
              const deletedMessage = `${this.submissionNumber} been deleted.`;
              this.setSuccessAlert(`Success! ${deletedMessage}`);
            })
            .catch(error => {
              this.setFailureAlert('An error occurred while deleting PEN Request Files! Please try again later.');
              console.error(error);
            })
            .finally(() => {
              this.isDeleting = false;
            });
      }
    },
    async markRecordForProcessing(){
      const userConfirmed = await this.isConfirmedByUser('Process');
      if (!!userConfirmed) {
        const penRequestBatchIDs = [];
        penRequestBatchIDs.push(this.selectedFile.penRequestBatchID);
        const payload = {
          penRequestBatchIDs
        };
        this.isProcessing = true;
        ApiService.apiAxios.post(`${Routes['penRequestBatch'].FILES_URL}/release-batch-files`, payload)
            .then(() => {
              const message = `${this.submissionNumber} is put into processing.`;
              this.setSuccessAlert(`Success! ${message}`);
            })
            .catch(error => {
              this.setFailureAlert('An error occurred while putting the PEN Request to processing! Please try again later.');
              console.error(error);
            })
            .finally(() => {
              this.isProcessing = false;
            });
      }
    },
    async isConfirmedByUser(operation){
      this.operation = operation;
      this.submissionNumber = this.selectedFile.submissionNumber;
      return this.$refs.confirmationDialog.open(null, null,
          {color: '#fff', width: 480, closeIcon: true, dark: false, rejectText: 'Cancel', resolveText: 'Confirm'});
    },
    clickFile(file) {
      this.submissionNumber = file.submissionNumber;
      this.openFileViewer = true;
    },
    clickReview() {
      this.submissionNumber = this.selectedFile.submissionNumber;
      this.openFileViewer = true;
    },
    closeFileViewer() {
      this.openFileViewer = false;
    },
  }
};
</script>
