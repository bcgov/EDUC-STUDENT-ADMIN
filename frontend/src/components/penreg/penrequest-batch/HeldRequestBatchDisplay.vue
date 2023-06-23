<template>
  <v-container fluid class="fill-height px-0 mb-4">
    <v-row no-gutters class="list-actions pt-4 pb-4 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3"
           style="background-color:white;">
      <v-col cols="1">
        <v-text-field
          class="readonly-text-field"
          outlined
          value="PSI"
          readonly
          dense
        ></v-text-field>
      </v-col>
      <v-sheet
          v-if="filters && filters.length > 0"
          class="mx-4 px-2 py-1 d-flex flex-row flex-grow-1 align-center align-self-start"
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
      <PrimaryButton id="review-action" class="mr-2" :disabled="!filesSelected || isActioned" text="Review" :click-action="clickReview"></PrimaryButton>
      <PrimaryButton id="process-action" class="mx-2" :disabled="!filesSelected || isActioned" text="Process" :loading="isProcessing"
                     :click-action="markRecordForProcessing"></PrimaryButton>
      <PrimaryButton id="delete-action" class="mx-2" :disabled="!filesSelected || isActioned" text="Delete" :loading="isDeleting"
                     :click-action="deleteFile"></PrimaryButton>
    </v-row>
    <v-row no-gutters class="py-2" style="background-color:white;">
      <HeldRequestBatchList
          :key="heldRequestBatchListKey"
          :schoolGroup="schoolGroup"
          :filters.sync="filters"
          :loadingFiles="loadingFiles"
          :selectedFile.sync="selectedFile"
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
      <template #message>
        <v-col class="mt-n6">
          <v-row class="mt-n2 mb-3">
            <span>Are you sure you want
            to <strong>{{ operation }}</strong> submission <strong>{{ submissionNumber }}</strong>?</span>
          </v-row>
        </v-col>
      </template>
    </ConfirmationDialog>
  </v-container>
</template>

<script>
import HeldRequestBatchList from './HeldRequestBatchList.vue';
import FilterTag from '../../util/FilterTag.vue';
import PrimaryButton from '../../util/PrimaryButton.vue';
import alertMixin from '../../../mixins/alertMixin';
import ConfirmationDialog from '../../util/ConfirmationDialog.vue';
import ApiService from '@/common/apiService';
import {Routes} from '@/utils/constants';
import PrbFileModal from '@/components/penreg/penrequest-batch/PrbFileModal.vue';

export default {
  name: 'HeldRequestBatchDisplay',
  components: {
    FilterTag,
    PrimaryButton,
    HeldRequestBatchList,
    ConfirmationDialog,
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
      isActioned: false,
      heldRequestBatchListKey: 0
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
      if (userConfirmed) {
        const penRequestBatchIDs = [];
        penRequestBatchIDs.push(this.selectedFile.penRequestBatchID);
        const payload = {
          penRequestBatchIDs
        };
        this.isDeleting = true;
        this.isActioned = true;
        ApiService.apiAxios.post(`${Routes['penRequestBatch'].FILES_URL}/deleteFiles`, payload)
          .then(() => {
            const deletedMessage = `${this.submissionNumber} been deleted.`;
            this.setSuccessAlert(`Success! ${deletedMessage}`);
            this.heldRequestBatchListKey = this.heldRequestBatchListKey + 1;
          })
          .catch(error => {
            this.setFailureAlert('An error occurred while deleting PEN Request Files! Please try again later.');
            console.error(error);
          })
          .finally(() => {
            this.isDeleting = false;
            this.isActioned = false;
          });
      }
    },
    async markRecordForProcessing(){
      const userConfirmed = await this.isConfirmedByUser('Process');
      if (userConfirmed) {
        const penRequestBatchIDs = [];
        penRequestBatchIDs.push(this.selectedFile.penRequestBatchID);
        const payload = {
          penRequestBatchIDs
        };
        this.isProcessing = true;
        this.isActioned = true;
        ApiService.apiAxios.post(`${Routes['penRequestBatch'].FILES_URL}/release-batch-files`, payload)
          .then(() => {
            const message = `${this.submissionNumber} is put into processing.`;
            this.setSuccessAlert(`Success! ${message}`);
            this.heldRequestBatchListKey = this.heldRequestBatchListKey + 1;
          })
          .catch(error => {
            this.setFailureAlert('An error occurred while putting the PEN Request to processing! Please try again later.');
            console.error(error);
          })
          .finally(() => {
            this.isProcessing = false;
            this.isActioned = false;
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

<style scoped>
  .readonly-text-field.v-text-field /deep/ .v-text-field__details {
    display: none;
  }
</style>
