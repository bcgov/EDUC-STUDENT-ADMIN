<template>
  <component
    :is="currentComponent"
    v-model:selectedRecords="studentRecords"
    v-bind="$props"
    v-on="$attrs"
  >
    <template #actions="slotProps">
      <slot
        name="actions"
        v-bind="slotProps"
      />
    </template>
  </component>
</template>
  >
<script>

import {mapState} from 'pinia';
import {appStore} from '@/store/modules/app';
import CompareDemographicsCommonV1 from '@/components/common/CompareDemographicsCommonV1.vue';
import CompareDemographicsCommonV2 from '@/components/common/CompareDemographicsCommonV2.vue';

export default {
  name: 'CompareDemographicsCommon',
  props: {
    selectedRecords: {
      type: Array,
      required: true
    },
    title: {
      type: String,
      default: ''
    },
    closeCompareModal: {
      type: Function,
      default: null
    }
  },
  emits: ['update:selectedRecords'],
  computed:{
    ...mapState(appStore, ['config']),
    currentComponent() {
      return this.config.DISABLE_SDC_FUNCTIONALITY ? CompareDemographicsCommonV1 : CompareDemographicsCommonV2;
    },
    studentRecords: {
      get() {
        return this.selectedRecords;
      },
      set(value) {
        this.$emit('update:selectedRecords', value);
      }
    }
  }
};
</script>
