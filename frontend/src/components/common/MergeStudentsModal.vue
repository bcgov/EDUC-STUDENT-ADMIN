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
          title="Merge PENs"
          @mergeStudentsModalOpenEmit=mergeStudentsModalOpenEmit
      />
    </v-card>
  </v-dialog>
</template>

<script>

import MergeStudentsCommon from '@/components/common/MergeStudentsCommon';

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
  methods: {
    mergeStudentsModalOpenEmit(value){
      console.log(value, 'mergeStudentsModalOpenEmit in modal');
      this.$emit('mergeStudentsModalOpenEmit', value);
    }
  }
};
</script>

<style scoped>

</style>
