<template>
  <v-card
    id="newFundingSheet"
    class="information-window-v-card"
  >
    <v-card-title class="sheetHeader pt-1 pb-1">
      New Funding Configuration
    </v-card-title>
    <v-divider />
    <v-card-text>
      <v-form
        ref="newFundingForm"
        v-model="isFormValid"
      >
        <v-row>
          <v-col>
            <v-select
              v-model="selectedGradeCodeForFunding"
              :items="filteredgradeCodes"
              item-value="schoolGradeCode"
              item-title="label"
              label="Grades Offered"
              variant="underlined"
              required
              :rules="[rules.required()]"
            />
          </v-col>
          <v-col>
            <v-select
              v-model="selectedFundingGroup"
              :items="fundingGroups"
              item-value="schoolFundingGroupCode"
              item-title="label"
              label="Funding Group"
              variant="underlined"
              required
              :rules="[rules.required()]"
            />
          </v-col>
        </v-row>
        <v-row class="py-4 pr-2 justify-end">
          <PrimaryButton
            id="cancel"
            secondary
            text="Cancel"
            class="mr-2"
            @click-action="closeAddFunding"
          />
          <PrimaryButton
            id="save"
            text="Save"
            width="7rem"
            :disabled="!isFormValid"
            @click-action="saveNewFundingData"
          />
        </v-row>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script>
import PrimaryButton from '../../util/PrimaryButton.vue';
import * as Rules from '@/utils/institute/formRules';

export default {
  name: 'AddSchoolFunding',
  components: {
    PrimaryButton
  },
  props: {
    schoolID: {
      type: String,
      required: true
    },
    fundingGroups: {
      type: Array,
      required: true
    },
    filteredgradeCodes: {
      type: Array,
      required: true
    }
  },
  emits: ['close-add-funding', 'save-new-funding-data'],
  data() {
    return {
      isFormValid: false,
      selectedGradeCodeForFunding: '',
      selectedFundingGroup: '',
      rules: Rules,
    };
  },
  mounted() {
    this.validateForm();
  },
  methods: {
    closeAddFunding() {
      this.$emit('close-add-funding');
      this.resetForm();
    },
    saveNewFundingData() {
      this.$emit('save-new-funding-data', { schoolGradeCode: this.selectedGradeCodeForFunding, schoolFundingGroupCode: this.selectedFundingGroup });
      this.resetForm();
    },
    resetForm() {
      this.$refs.newFundingForm.reset();
      this.validateForm();
    },
    validateForm() {
      const isValid = this.$refs.newFundingForm.validate();
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
