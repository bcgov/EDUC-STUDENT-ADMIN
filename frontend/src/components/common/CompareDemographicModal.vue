<template>
  <v-dialog
    id="compareModal"
    v-model="compareModalOpen"
    max-width="80%"
    :disabled="disabled"
  >
    <template #activator="{ props }">
      <TertiaryButton
        id="studentSearchCompareButton"
        text="Compare"
        icon="mdi-content-copy"
        :disabled="disabled"
        @click-action="compare"
        :bind="props"
      />
    </template>
    <v-card id="requestInfoDialogCard">
      <CompareDemographicsCommon
        v-if="compareModalOpen"
        v-model:selected-records="studentRecords"
        title="Compare/View"
        :close-compare-modal="closeCompareModal"
      >
        <template #actions="{clearError, validateAction, disableMerge, disableDemerge, disableMoveSld, twin, merge, demerge, moveSldRecords}">
          <PrimaryButton
            id="compareModalCancelBtn"
            text="Cancel"
            secondary
            @click-action="[closeCompareModal(), clearError()]"
          />
          <PrimaryButton
            id="moveSldBtn"
            text="Move Sld Record"
            primary
            :disabled="disableMoveSld()"
            @click-action="moveSldRecords()"
          />
          <PrimaryButton
            id="twinBtn"
            text="Twin"
            primary
            :disabled="validateAction()"
            @click-action="twin()"
          />
          <PrimaryButton
            id="demergeBtn"
            text="Demerge"
            primary
            :disabled="disableDemerge()"
            @click-action="demerge()"
          />
          <PrimaryButton
            id="mergeBtn"
            text="Merge PENs"
            primary
            :disabled="disableMerge()"
            @click-action="merge()"
          />
        </template>
      </CompareDemographicsCommon>
    </v-card>
  </v-dialog>
</template>

<script>
import PrimaryButton from '../util/PrimaryButton.vue';
import TertiaryButton from '../util/TertiaryButton.vue';
import CompareDemographicsCommon from './CompareDemographicsCommon.vue';
import {deepCloneObject} from '@/utils/common';
import alertMixin from '@/mixins/alertMixin';
import staleStudentRecordMixin from '@/mixins/staleStudentRecordMixin';

export default {
  emits: ['update:selectedRecords','closeCompare'],
  name: 'CompareDemographicModal',
  components: {
    CompareDemographicsCommon,
    PrimaryButton,
    TertiaryButton
  },
  mixins: [alertMixin, staleStudentRecordMixin],
  props: {
    disabled: {
      type: Boolean,
      required: true
    },
    clearOnExit: {
      type: Boolean,
      default: true
    },
    selectedRecords: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      compareModalOpen: false,
      initialSelectedRecord: []
    };
  },
  computed: {
    studentRecords: {
      get: function() {
        return this.selectedRecords;
      },
      set: function(value) {
        this.$emit('update:selectedRecords', value);
      }
    }
  },
  created() {
    this.initialSelectedRecord = deepCloneObject(this.studentRecords);
  },
  methods: {
    closeCompareModal() {
      this.compareModalOpen = false;
      if(!this.clearOnExit) {
        this.studentRecords = this.initialSelectedRecord;
      } else {
        this.studentRecords = [];
      }
      this.$emit('closeCompare');
    },
    compare() {
      let warningMessage;
      for (const student of this.studentRecords) {
        warningMessage = this.getMessageForStudent(student.studentID);
        if (warningMessage) {
          break;
        }
      }
      if (warningMessage) {
        this.setWarningAlert(warningMessage);
      } else {
        this.compareModalOpen = true;
      }
    }
  }
};
</script>

<style scoped>
  #studentSearchCompareButton {
    float: right;
  }

  :deep(.v-data-table-footer){
      display: none;
  }
</style>
