<template>
  <v-dialog
          id="mergeStudentsModal"
          v-model="dialog"
          max-width="43%"
  >
    <v-card id="mergeStudentsDialogCard">
      <MergeStudentsCommon
          :mergeStudentsModalOpen=dialog
          :mergedToStudentID=mergedToStudentID
          :mergedFromStudentID=mergedFromStudentID
          :title=PAGE_TITLES.MERGE_STUDENTS
          @mergeStudentsModalOpenEmit=mergeStudentsModalOpenEmit
      />
    </v-card>
  </v-dialog>
</template>

<script>

import MergeStudentsCommon from '@/components/common/MergeStudentsCommon.vue';
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
      PAGE_TITLES,
      dialog: false,
    };
  },
  created() {
    this.dialog = this.mergeStudentsModalOpen;
  },
  watch: {
    mergeStudentsModalOpen(newValue) {
      this.dialog = newValue;
    },
    dialog(newValue) {
      if(!newValue && this.mergeStudentsModalOpen) {
        this.$emit('mergeStudentsModalOpenEmit', newValue);
      }
    },
  },
  methods: {
    mergeStudentsModalOpenEmit(value){
      this.$emit('mergeStudentsModalOpenEmit', value);
    }
  }
};
</script>
