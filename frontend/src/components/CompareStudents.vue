<template>
  <CompareDemographicsCommon :selectedRecords.sync="selectedRecords">
    <template v-slot:actions="{clearError, validateAction, disableMerge, disableDemerge, disableMoveSld, twin, merge, demerge, moveSldRecords}">
      <PrimaryButton id="compareClearBtn" text="Clear" secondary @click.native="[cancel(), clearError()]"></PrimaryButton>
      <PrimaryButton id="moveSldBtn" text="Move Sld Record" primary :disabled="disableMoveSld()" @click.native="moveSldRecords()"></PrimaryButton>
      <PrimaryButton id="twinBtn" text="Twin" primary :disabled="validateAction()" @click.native="twin()"></PrimaryButton>
      <PrimaryButton id="demergeBtn" text="Demerge" primary :disabled="disableDemerge()" @click.native="demerge()"></PrimaryButton>
      <PrimaryButton id="mergeBtn" text="Merge PENs" primary :disabled="disableMerge()" @click.native="merge()"></PrimaryButton>
    </template>
  </CompareDemographicsCommon>
</template>

<script>
import CompareDemographicsCommon from './common/CompareDemographicsCommon';
import PrimaryButton from './util/PrimaryButton.vue';

export default {
  name: 'Compare',
  components: {
    PrimaryButton,
    CompareDemographicsCommon
  },
  data (){
    return {
      selectedRecords: []
    };
  },
  methods: {
    cancel() {
      this.selectedRecords = [];
    }
  }
};
</script>
