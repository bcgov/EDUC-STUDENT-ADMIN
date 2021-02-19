<template>
  <CompareDemographicsCommon :selectedRecords.sync="selectedRecords">
    <template v-slot:actions="{clearError, validateAction, disableMerge, disableDemerge, twin, merge, demerge}">
      <PrimaryButton id="compareClearBtn" text="Clear" secondary @click.native="[cancel(), clearError()]"></PrimaryButton>
      <PrimaryButton id="twinBtn" text="Twin" primary :disabled="validateAction()" @click.native="twin()"></PrimaryButton>
      <PrimaryButton id="demergeBtn" text="Demerge" primary :disabled="disableDemerge()" @click.native="demerge()"></PrimaryButton>
      <PrimaryButton id="mergeBtn" text="Merge PENs" primary :disabled="disableMerge()" @click.native="merge()"></PrimaryButton>
    </template>
  </CompareDemographicsCommon>
</template>

<script>
import CompareDemographicsCommon from './common/CompareDemographicsCommon';
import PrimaryButton from './util/PrimaryButton';

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
