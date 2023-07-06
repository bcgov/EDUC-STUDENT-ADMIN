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
        ref="newInstituteNoteForm"
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
            @click-action="closeAddInstituteNote"
          />
          <PrimaryButton
            id="saveNote"
            text="Save"
            width="7rem"
            :disabled="!isFormValid"
            :loading="loading"
            @click-action="saveNewInstituteNote"
          />
        </v-row>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script>
import PrimaryButton from '../../util/PrimaryButton.vue';

export default {
  name: 'AddInstituteNote',
  components: {
    PrimaryButton
  },
  props: {
    loading: {
      type: Boolean,
      required: true
    },
  },
  emits: ['closeAddInstituteNote', 'saveNewInstituteNote'],
  data() {
    return {
      isFormValid: false,
      newNoteText: '',
      requiredRules: [v => !!v || 'Required'],
    };
  },
  mounted() {
    this.validateForm();
  },
  methods: {
    closeAddInstituteNote() {
      this.$emit('closeAddInstituteNote');
      this.resetForm();
    },
    saveNewInstituteNote() {
      this.$emit('saveNewInstituteNote', { content: this.newNoteText });
      this.resetForm();
    },
    resetForm() {
      this.$refs.newInstituteNoteForm.reset();
      this.validateForm();
    },
    validateForm() {
      const isValid = this.$refs.newInstituteNoteForm.validate();
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
