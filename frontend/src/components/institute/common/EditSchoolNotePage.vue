<template>
  <v-card
      id="editNoteSheet"
      class="information-window-v-card">
    <v-card-title class="sheetHeader pt-1 pb-1">Edit Note</v-card-title>
    <v-divider></v-divider>
    <v-card-text>
      <v-form ref="editSchoolNoteForm" v-model="isFormValid">
        <v-row>
          <v-col>
            <v-textarea
                id="editNoteTextArea"
                v-model="editSchoolNote.content"
                rows="8"
                label="Note"
                autofocus
                no-resize
                maxlength="4000"
                class="pt-0"
                ref="editNoteTextArea"
                hide-details="auto">
            </v-textarea>
          </v-col>
        </v-row>
        <v-row class="py-4 pr-2 justify-end">
          <PrimaryButton id="cancelNote" secondary text="Cancel" @click.native="closeEditSchoolNotePage"></PrimaryButton>
          <PrimaryButton id="saveNote" text="Save" width="7rem" @click.native="saveChangesToSchoolNote" :disabled="!isFormValid" :loading="processing"></PrimaryButton>
        </v-row>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script>
import PrimaryButton from '../../util/PrimaryButton';
import alertMixin from '@/mixins/alertMixin';
import ApiService from '@/common/apiService';
import {Routes} from '@/utils/constants';

export default {
  name: 'EditSchoolNotePage',
  mixins: [alertMixin],
  components: {
    PrimaryButton
  },
  props: {
    schoolId: {
      type: String,
      required: true
    },
    schoolNote: {
      type: Object,
      required: true
    },
  },
  data() {
    return {
      isFormValid: false,
      processing: false,
      editSchoolNote: _.cloneDeep(this.schoolNote),
    };
  },
  methods: {
    closeEditSchoolNotePage() {
      this.resetForm();
      this.$emit('editSchoolNote:closeEditSchoolNotePage');
    },
    saveChangesToSchoolNote() {
      this.processing = true;
      console.log(this.schoolNote);
      let payload = {
        noteId: this.schoolNote.noteId,
        schoolId: this.schoolNote.schoolId,
        content: this.editSchoolNote.content
      };
      ApiService.apiAxios.put(`${Routes.institute.SCHOOL_NOTE_URL}/${this.schoolNote.noteId}`, payload)
        .then(() => {
          this.setSuccessAlert('Success! The note has been saved.');
          this.resetForm();
          this.$emit('editSchoolNote:schoolNoteSaved');
        })
        .catch(error => {
          console.error(error);
          this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while saving the changes to the school note. Please try again later.');
        })
        .finally(() => {
          this.processing = false;
        });
    },
    resetForm() {
      this.$refs.editSchoolNoteForm.reset();
    },
    validateForm() {
      this.isFormValid = this.$refs.editSchoolNoteForm.validate();
    },
  }
};
</script>

<style scoped>
.sheetHeader {
  background-color: #003366;
  color: white;
  font-size: medium !important;
  font-weight: bolder !important;
}
</style>
