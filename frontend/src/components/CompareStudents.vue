<template>
  <CompareDemographicsCommon :selectedRecords.sync="selectedRecords">
    <template v-slot:actions="{clearError, validateMerge, merge}">
      <PrimaryButton id="compareClearBtn" text="Clear" secondary @click.native="[cancel(), clearError()]"></PrimaryButton>
      <PrimaryButton id="mergeBtn" text="Merge PENs" primary :disabled="validateMerge()" @click.native="[merge(), clearError()]"></PrimaryButton>
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
