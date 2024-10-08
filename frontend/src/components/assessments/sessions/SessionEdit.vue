<template>
  <v-card id="editSessionVCard">
    <v-card-title class="sheetHeader pt-1 pb-1">
      Edit Assessment Session
    </v-card-title>
    <v-divider />
    <v-card-text>
        <v-row class="pt-3 px-8">
          <v-text-field
            id="sessionId"
            v-model="session.courseSession"
            label="Session Id"
            variant="underlined"
            disabled
            hide-details="auto"
          />
        </v-row>      
        <v-form ref="editSessionForm" v-model="isFormValid">  
        <v-row class="pt-5 px-8">
          <DatePicker
            id="editSessionOpenDateTextField"
            v-model="editSession.activeFromDate"
            label="Open Date"
            model-type="yyyy-MM-dd'T'00:00:00"
            :rules="[rules.required()]"
            :allow-teleport="true"
            @update:model-value="validateForm"
            @clear-date="clearOpenDate"
          />
        </v-row>
        <v-row class="pt-4 px-8">
          <DatePicker
            id="editSessionCloseDateTextField"
            v-model="editSession.activeUntilDate"
            label="Close Date"
            model-type="yyyy-MM-dd'T'00:00:00"
            :rules="[rules.endDateRule(editSession.activeFromDate, editSession.activeUntilDate)]"
            :allow-teleport="true"
            @update:model-value="validateForm"
            @clear-date="clearCloseDate"
          />
        </v-row>        
      </v-form>
    </v-card-text>
    <v-card-actions class="justify-end">
      <PrimaryButton
        id="cancelChangesToSessionButton"
        secondary
        text="Cancel"
        @click-action="cancelEditSessionPage"
      />
      <PrimaryButton
        id="saveChangesToSessionButton"
        text="Save"
        width="7rem"
        :disabled="!isFormValid"
        :loading="processing"
        @click-action="saveAssessmentSession"
      />
    </v-card-actions>
  </v-card>
</template>

<script>
import alertMixin from '../../../mixins/alertMixin';
import { cloneDeep } from 'lodash';
import PrimaryButton from '../../util/PrimaryButton.vue';
import ApiService from '../../../common/apiService';
import { Routes } from '../../../utils/constants';
import * as Rules from '@/utils/institute/formRules';

import DatePicker from '../../util/DatePicker.vue';

export default {
  name: 'EditSession',
  components: {
    DatePicker,
    PrimaryButton,
  },
  mixins: [alertMixin],
  props: {
    session: {
      type: Object,
      required: true,
    },
    onSuccessHandler: {
      type: Function,
      required: true,
    },
    closeHandler: {
      type: Function,
      required: true,
    },
  },
  data() {
    return {
      processing: false,
      isFormValid: false,
      editSession: '',
      rules: Rules
    };    
  },
  mounted() {
    this.editSession = cloneDeep(this.session);
    this.validateForm();
  },
  methods: {
    cancelEditSessionPage() {
      this.resetForm();
      this.closeHandler();
    },
    async saveAssessmentSession() {
      this.processing = true;
      await this.validateForm();
      ApiService.apiAxios
        .put(`${Routes.eas.GET_ASSESSMENT_SESSIONS}`+'/'+this.editSession.assessmentSessionID, this.editSession)
        .then(() => {
          this.setSuccessAlert(
            'Success! The assessment session has been updated.'
          );
          this.resetForm();
          this.closeHandler();
          this.onSuccessHandler();
        })
        .catch((error) => {
          console.error(error);
          let fallback =
            'An error occurred while saving the assessment session information.' +
            ' Please try again later.';
          this.setFailureAlert(error?.response?.data?.message || fallback);
        })
        .finally(() => {
          this.processing = false;
        });
    },
    clearOpenDate() {
      this.editSession.effectiveDate = null;
      this.validateForm();
    },
    clearCloseDate() {
      this.editSession.expiryDate = null;
      this.validateForm();
    },
    resetForm() {
      this.$refs.editSessionForm.reset();
    },
    async validateForm() {
      const valid = await this.$refs.editSessionForm.validate();
      this.isFormValid = valid.valid;
    },
  },
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
