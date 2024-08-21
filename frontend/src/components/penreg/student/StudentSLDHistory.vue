<template>
  <component
    :is="currentComponent"
    v-bind="$props"
  />
</template>
  >
<script>

import StudentSLDHistoryV1 from '@/components/penreg/student/StudentSLDHistoryV1.vue';
import StudentSLDHistoryV2 from '@/components/penreg/student/StudentSLDHistoryV2.vue';
import {mapState} from 'pinia';
import {appStore} from '@/store/modules/app';

export default {
  name: 'StudentSLDHistory',
  props: {
    student: {
      type: Object,
      required: true
    }
  },
  computed:{
    ...mapState(appStore, ['config']),
    currentComponent() {
      return this.config.ENABLE_EDX_RELEASE ? StudentSLDHistoryV2 : StudentSLDHistoryV1;
    }
  }
};
</script>
