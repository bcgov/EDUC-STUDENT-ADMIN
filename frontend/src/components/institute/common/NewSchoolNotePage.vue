<template>
  <v-card
    id="newNoteSheet"
    class="information-window-v-card"
  >
    <v-card-title class="sheetHeader pt-1 pb-1">
      New Note
    </v-card-title>
    <v-divider />
    <v-card-text>
      <v-form
        ref="newSchoolNoteForm"
        v-model="isFormValid"
      >
        <v-row>
          <v-col>
            <v-textarea
              id="newNoteTextArea"
              ref="newNoteTextArea"
              v-model="newNoteText"
              rows="8"
              label="Note"
              autofocus
              variant="underlined"
              no-resize
              maxlength="4000"
              class="pt-0"
              hide-details="auto"
            />
          </v-col>
        </v-row>
        <v-row class="py-4 pr-2 justify-end">
          <PrimaryButton
            id="cancelNote"
            secondary
            text="Cancel"
            class="mr-2"
            :click-action="closeNewSchoolNotePage"
          />
          <PrimaryButton
            id="saveNote"
            text="Save"
            width="7rem"
            :click-action="addNewSchoolNote"
            :disabled="!isFormValid"
            :loading="processing"
          />
        </v-row>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script>
import PrimaryButton from '../../util/PrimaryButton.vue';
import ApiService from '@/common/apiService';
import {Routes} from '@/utils/constants';
import alertMixin from '@/mixins/alertMixin';

export default {
  name: 'NewSchoolNotePage',
  components: {
    PrimaryButton
  },
  mixins: [alertMixin],
  props: {
    schoolID: {
      type: String,
      required: true
    },
  },
  data() {
    return {
      isFormValid: false,
      processing: false,
      newNoteText: ''
    };
  },
  methods: {
    closeNewSchoolNotePage() {
      this.resetForm();
      this.$emit('newSchoolNote:closeNewSchoolNotePage');
    },
    addNewSchoolNote() {
      this.processing = true;
      const payload = {
        schoolID: this.schoolID,
        noteContent: this.newNoteText
      };
      ApiService.apiAxios.post(Routes.institute.SCHOOL_NOTE_URL, payload)
        .then(() => {
          this.setSuccessAlert('Success! The note has been added to the school.');
          this.resetForm();
          this.$emit('newSchoolNote:addNewSchoolNote');
        })
        .catch(error => {
          console.error(error);
          this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while adding the school note. Please try again later.');
        })
        .finally(() => {
          this.processing = false;
        });
    },
    resetForm() {
      this.$refs.newSchoolNoteForm.reset();
    },
    validateForm() {
      const isValid = this.$refs.newSchoolNoteForm.validate();
      this.isFormValid = isValid.valid;
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
