<template>
  <CompareDemographicsCommon :selectedRecords.sync="selectedRecords">
    <template v-slot:actions>
      <PrimaryButton id="compareCancelBtn" text="Cancel" secondary @click.native="cancel"></PrimaryButton>
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
