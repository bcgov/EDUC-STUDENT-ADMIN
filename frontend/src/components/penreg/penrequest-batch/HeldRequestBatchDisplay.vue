<template>
  <v-container fluid class="fill-height px-0 mb-4">
    <AlertMessage v-model="alert" :alertMessage="alertMessage" :alertType="alertType" :timeoutMs="3000" class="mt-2"></AlertMessage>
    <v-row no-gutters class="list-actions pt-4 pb-4 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3" style="background-color:white;">
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
      <PrimaryButton id="review-action" class="mr-2" :disabled="!filesSelected" text="Review"></PrimaryButton>
      <PrimaryButton id="process-action" class="mx-2" :disabled="!filesSelected" text="Process"></PrimaryButton>
      <PrimaryButton id="delete-action" class="mx-2" :disabled="!filesSelected" text="Delete"></PrimaryButton>
    </v-row>
    <v-row no-gutters class="py-2" style="background-color:white;">
      <HeldRequestBatchList
        :schoolGroup="schoolGroup"
        :filters.sync="filters"
        :loadingFiles="loadingFiles"
        :selectedFile.sync="selectedFile"
        @failure-alert="setFailureAlert"
      ></HeldRequestBatchList>
    </v-row>
    <ConfirmationDialog ref="confirmationDialog"></ConfirmationDialog>
  </v-container>
</template>

<script>
import HeldRequestBatchList from './HeldRequestBatchList';
import FilterTag from '../../util/FilterTag';
import PrimaryButton from '../../util/PrimaryButton';
import alertMixin from '../../../mixins/alertMixin';
import ConfirmationDialog from '../../util/ConfirmationDialog';
import AlertMessage from '../../util/AlertMessage';

export default {
  name: 'HeldRequestBatchDisplay',
  components: {
    FilterTag,
    PrimaryButton,
    HeldRequestBatchList,
    ConfirmationDialog,
    AlertMessage
  },
  mixins: [alertMixin],
  data() {
    return {
      schoolGroup: 'PSI',
      filters:[],
      loadingFiles: false,
      selectedFile: null,
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
  }
};
</script>
