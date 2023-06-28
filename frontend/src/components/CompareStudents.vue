<template>
  <CompareDemographicsCommon v-model:selected-records="selectedRecords">
    <template #actions="{clearError, validateAction, disableMerge, disableDemerge, disableMoveSld, twin, merge, demerge, moveSldRecords}">
      <PrimaryButton
        id="compareClearBtn"
        text="Clear"
        secondary
        :click-action="[cancel(), clearError()]"
      />
      <PrimaryButton
        id="moveSldBtn"
        text="Move Sld Record"
        primary
        :disabled="disableMoveSld()"
        :click-action="moveSldRecords()"
      />
      <PrimaryButton
        id="twinBtn"
        text="Twin"
        primary
        :disabled="validateAction()"
        :click-action="twin()"
      />
      <PrimaryButton
        id="demergeBtn"
        text="Demerge"
        primary
        :disabled="disableDemerge()"
        :click-action="demerge()"
      />
      <PrimaryButton
        id="mergeBtn"
        text="Merge PENs"
        primary
        :disabled="disableMerge()"
        :click-action="merge()"
      />
    </template>
  </CompareDemographicsCommon>
</template>

<script>
import CompareDemographicsCommon from './common/CompareDemographicsCommon.vue';
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
