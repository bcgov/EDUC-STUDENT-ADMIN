<template>
  <v-dialog
          id="mergeStudentsModal"
          v-model="mergeStudentsModalOpen"
          persistent
          max-width="95%"
  >
    <v-card id="mergeStudentsDialogCard">
      <MergeStudentsCommon
          :mergedToStudentID=mergedToStudentID
          :mergedFromStudentID=mergedFromStudentID
      />
    </v-card>
  </v-dialog>
</template>

<script>

import MergeStudentsCommon from '@/components/common/MergeStudentsCommon';

export default {
  name: 'MergeStudentModal',
  mixins: [],
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
};
</script>

<style scoped>

</style>
