<template>
  <v-dialog
          id="compareModal"
          v-model="compareModalOpen"
          max-width="80%"
          :disabled="disabled"
  >
    <template v-slot:activator="{ on, attrs }">
      <TertiaryButton
              id="studentSearchCompareButton"
              class="ma-0"
              text="Compare"
              icon="mdi-content-copy"
              :disabled="disabled"
              @click.native="compare"
              :bind="attrs"
              :on="on">
      </TertiaryButton>
    </template>
    <v-card id="requestInfoDialogCard">
      <CompareDemographicsCommon
        v-if="compareModalOpen"
        :selectedRecords.sync="studentRecords"
        title="Compare/View"
        :closeCompareModal="closeCompareModal">
        <template v-slot:actions="{clearError, validateAction, disableMerge, disableDemerge, disableMoveSld, twin, merge, demerge, moveSldRecords}">
          <PrimaryButton id="compareModalCancelBtn" text="Cancel" secondary @click.native="[closeCompareModal(), clearError()]"></PrimaryButton>
          <PrimaryButton id="moveSldBtn" text="Move Sld Record" primary :disabled="disableMoveSld()" @click.native="moveSldRecords()"></PrimaryButton>
          <PrimaryButton id="twinBtn" text="Twin" primary :disabled="validateAction()" @click.native="twin()"></PrimaryButton>
          <PrimaryButton id="demergeBtn" text="Demerge" primary :disabled="disableDemerge()" @click.native="demerge()"></PrimaryButton>
          <PrimaryButton id="mergeBtn" text="Merge PENs" primary :disabled="disableMerge()" @click.native="merge()"></PrimaryButton>
        </template>
      </CompareDemographicsCommon>
    </v-card>
  </v-dialog>
</template>

<script>
import PrimaryButton from '../util/PrimaryButton.vue';
import TertiaryButton from '../util/TertiaryButton';
import CompareDemographicsCommon from './CompareDemographicsCommon';
import {deepCloneObject} from '@/utils/common';
import alertMixin from '@/mixins/alertMixin';
import staleStudentRecordMixin from '@/mixins/staleStudentRecordMixin';

export default {
  name: 'CompareDemographicModal',
  mixins: [alertMixin, staleStudentRecordMixin],
  components: {
    CompareDemographicsCommon,
    PrimaryButton,
    TertiaryButton
  },
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
  created() {
    this.initialSelectedRecord = deepCloneObject(this.studentRecords);
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
  methods: {
    closeCompareModal() {
      this.compareModalOpen = false;
      if(!this.clearOnExit) {
        this.studentRecords = this.initialSelectedRecord;
      } else {
        this.studentRecords = [];
      }
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
</style>
