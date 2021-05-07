<template>
  <v-dialog
          id="mergeStudentsModal"
          v-model="mergeStudentsModalOpen"
          persistent
          max-width="95%"
  >
    <v-card id="mergeStudentsDialogCard">
      <MergeStudentsCommon
          :mergeStudentsModalOpen=mergeStudentsModalOpen
          :mergedToStudentID=mergedToStudentID
          :mergedFromStudentID=mergedFromStudentID
          :title=PAGE_TITLES.MERGE_STUDENTS
          @mergeStudentsModalOpenEmit=mergeStudentsModalOpenEmit
      />
    </v-card>
  </v-dialog>
</template>

<script>

import MergeStudentsCommon from '@/components/common/MergeStudentsCommon';
import { PAGE_TITLES } from '../../utils/constants';

export default {
  name: 'MergeStudentModal',
  components: {
    MergeStudentsCommon
  },
  props: {
    mergeStudentsModalOpen: {
      type: Boolean,
      required: true
    },
    mergedToStudentID: {
      type: String,
      required: true
    },
    mergedFromStudentID: {
      type: String,
      required: true
    },
  },
  data() {
    return {
      PAGE_TITLES
    };
  },
  methods: {
    mergeStudentsModalOpenEmit(value){
      this.$emit('mergeStudentsModalOpenEmit', value);
    }
  }
};
</script>
