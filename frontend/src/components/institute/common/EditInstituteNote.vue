<template>
  <v-card
    id="editNoteSheet"
    class="information-window-v-card"
  >
    <v-card-title class="sheetHeader pt-1 pb-1">
      New Note
    </v-card-title>
    <v-divider />
    <v-card-text>
      <v-form
        ref="editInstituteNoteForm"
        v-model="isFormValid"
      >
        <v-row>
          <v-col>
            <v-textarea
              id="editNoteTextArea"
              ref="editNoteTextArea"
              v-model="editInstituteNote.content"
              rows="8"
              label="Note"
              autofocus
              :rules="requiredRules"
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
            @click-action="closeEditInstituteNote"
          />
          <PrimaryButton
            id="saveNote"
            text="Save"
            width="7rem"
            :disabled="!isFormValid"
            :loading="loading"
            @click-action="saveChangesToInstituteNote"
          />
        </v-row>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script>
import PrimaryButton from '../../util/PrimaryButton.vue';
import _ from 'lodash';

export default {
  name: 'EditInstituteNote',
  components: {
    PrimaryButton
  },
  props: {
    loading: {
      type: Boolean,
      required: true
    },
    instituteNote: {
      type: Object,
      required: true
    },
  },
  emits: ['closeEditInstituteNote', 'saveChangesToInstituteNote'],
  data() {
    return {
      isFormValid: false,
      editInstituteNote: _.cloneDeep(this.instituteNote),
      requiredRules: [v => !!v || 'Required'],
    };
  },
  mounted() {
    this.validateForm();
  },
  methods: {
    closeEditInstituteNote() {
      this.$emit('closeEditInstituteNote');
      this.resetForm();
    },
    saveChangesToInstituteNote() {
      this.$emit('saveChangesToInstituteNote', this.editInstituteNote);
      this.resetForm();
    },
    resetForm() {
      this.$refs.editInstituteNoteForm.reset();
      this.validateForm();
    },
    validateForm() {
      const isValid = this.$refs.editInstituteNoteForm.validate();
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
