<template>
  <CompareDemographicsCommon :selectedRecords.sync="selectedRecords">
    <template v-slot:actions="{clearError}">
      <PrimaryButton id="compareCancelBtn" text="Clear" secondary @click.native="[cancel(), clearError()]"></PrimaryButton>
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
