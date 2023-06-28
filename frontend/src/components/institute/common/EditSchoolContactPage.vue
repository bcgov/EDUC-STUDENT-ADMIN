<template>
  <v-card
    id="editSchoolContactCard"
  >
    <v-card-title class="sheetHeader pt-1 pb-1">
      Edit School Contact
    </v-card-title>
    <v-divider/>
    <v-card-text>
      <v-form
        ref="editSchoolContactForm"
        v-model="isFormValid"
      >
        <v-row class="d-flex justify-center">
          <v-col>
            <v-select
              id="editSchoolContactTypeDropdown"
              v-model="editContact.schoolContactTypeCode"
              :rules="[rules.required()]"
              :items="schoolContactTypes"
              item-title="label"
              variant="underlined"
              class="pt-0"
              item-value="schoolContactTypeCode"
              label="School Contact Type"
            />
            <v-text-field
              id="editSchoolContactFirstNameInput"
              v-model="editContact.firstName"
              class="pt-0"
              variant="underlined"
              :rules="[rules.noSpecialCharactersContactName()]"
              :maxlength="255"
              label="First Name"
            />
            <v-text-field
              id="editSchoolContactLastNameInput"
              v-model="editContact.lastName"
              :rules="[rules.required(), rules.noSpecialCharactersContactName()]"
              class="pt-0"
              variant="underlined"
              :maxlength="255"
              label="Last Name"
            />
            <v-text-field
              id="editSchoolContactJobTitle"
              v-model="editContact.jobTitle"
              label="Position Title"
              type="text"
              variant="underlined"
              :rules="[rules.noSpecialCharactersContactTitle()]"
              maxlength="255"
            />
            <v-text-field
              id="editSchoolContactEmailInput"
              v-model="editContact.email"
              :rules="[rules.required(), rules.email()]"
              class="pt-0"
              variant="underlined"
              :maxlength="255"
              label="Email"
            />
            <v-row>
              <v-col cols="6">
                <v-text-field
                  id="editSchoolContactPhoneNumberInput"
                  v-model="editContact.phoneNumber"
                  :rules="[rules.required(), rules.phoneNumber()]"
                  class="pt-0"
                  variant="underlined"
                  :maxlength="10"
                  label="Phone Number"
                  @keypress="isNumber($event)"
                />
              </v-col>
              <v-col cols="6">
                <v-text-field
                  id="editSchoolContactPhoneExtensionInput"
                  v-model="editContact.phoneExtension"
                  :rules="[rules.number()]"
                  :maxlength="10"
                  variant="underlined"
                  class="pt-0"
                  label="Ext."
                  @keypress="isNumber($event)"
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="6">
                <v-text-field
                  id="editSchoolContactAltPhoneNumberInput"
                  v-model="editContact.alternatePhoneNumber"
                  :rules="[rules.phoneNumber()]"
                  class="pt-0"
                  variant="underlined"
                  :maxlength="10"
                  label="Alt. Phone Number"
                  @keypress="isNumber($event)"
                />
              </v-col>
              <v-col cols="6">
                <v-text-field
                  id="editSchoolContactAltPhoneExtensionInput"
                  v-model="editContact.alternatePhoneExtension"
                  :rules="[rules.number()]"
                  class="pt-0"
                  variant="underlined"
                  :maxlength="10"
                  label="Alt. Phone Ext."
                  @keypress="isNumber($event)"
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="6">
                <v-text-field
                  id="editSchoolContactEffectiveDateTextField"
                  v-model="editContact.effectiveDate"
                  :rules="[rules.required()]"
                  label="Start Date"
                  clearable
                  type="date"
                  variant="underlined"
                  @update:model-value="validateForm"
                />
              </v-col>
              <v-col cols="6">
                <v-text-field
                  id="editSchoolContactExpiryDateTextField"
                  v-model="editContact.expiryDate"
                  :rules="[rules.endDateRule(editContact.effectiveDate, editContact.expiryDate)]"
                  class="pt-0 mt-0"
                  label="End Date"
                  type="date"
                  clearable
                  variant="underlined"
                  @update:model-value="validateForm"
                />
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
    <v-card-actions class="justify-end">
      <PrimaryButton
        id="cancelChangesToSchoolContactButton"
        secondary
        text="Cancel"
        :click-action="cancelEditSchoolContactPage"
      />
      <PrimaryButton
        id="saveChangesToSchoolContactButton"
        text="Save"
        width="7rem"
        :click-action="saveChangesToSchoolContact"
        :disabled="!isFormValid"
        :loading="processing"
      />
    </v-card-actions>
  </v-card>
</template>

<script>
import PrimaryButton from '../../util/PrimaryButton.vue';
import {mapState} from 'pinia';
import alertMixin from '@/mixins/alertMixin';
import ApiService from '@/common/apiService';
import {Routes} from '@/utils/constants';
import * as Rules from '@/utils/institute/formRules';
import {isNumber} from '@/utils/institute/formInput';
import {formatDate, formatDisplayDate} from '@/utils/format';
import {parseDate} from '@/utils/dateHelpers';
import {authStore} from '@/store/modules/auth';
import _ from 'lodash';

export default {
  name: 'EditSchoolContactPage',
  components: {
    PrimaryButton,
  },
  mixins: [alertMixin],
  props: {
    contact: {
      type: Object,
      required: true
    },
    schoolContactTypes: {
      type: Array,
      required: true
    },
    schoolID: {
      type: String,
      required: true
    }
  },
  data() {
    let clonedContact = _.cloneDeep(this.contact);
    clonedContact.effectiveDate = this.parseDate(formatDate(clonedContact.effectiveDate));
    clonedContact.expiryDate = this.parseDate(formatDate(clonedContact.expiryDate));
    return {
      isFormValid: false,
      processing: false,
      editContact: clonedContact,
      rules: Rules,
      editSchoolContactEffectiveDatePicker: null,
      editSchoolContactExpiryDatePicker: null
    };
  },
  mounted() {
    this.validateForm();
  },
  computed: {
    ...mapState(authStore, ['isAuthenticated', 'userInfo']),
    schoolContactEffectiveDateFormatted: {
      get() {
        return this.formatDisplayDate(this.editContact.effectiveDate);
      },
      set(newValue) {
        this.editContact.effectiveDate = this.parseDate(newValue);
      }
    },
    schoolContactExpiryDateFormatted: {
      get() {
        return this.formatDisplayDate(this.editContact.expiryDate);
      },
      set(newValue) {
        this.editContact.expiryDate = this.parseDate(newValue);
      }
    }
  },
  methods: {
    cancelEditSchoolContactPage() {
      this.resetForm();
      this.$emit('editSchoolContact:cancelEditSchoolContactPage');
    },
    saveChangesToSchoolContact() {
      this.processing = true;
      this.validateForm();

      this.editContact.schoolID = this.schoolID;

      ApiService.apiAxios.put(`${Routes.institute.SCHOOL_CONTACT_URL}/${this.editContact.schoolContactId}`, this.editContact)
        .then(() => {
          this.setSuccessAlert('Success! The school contact has been updated.');
          this.resetForm();
          this.$emit('editSchoolContact:editSchoolContactSuccess');
        })
        .catch(error => {
          console.error(error);
          this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while saving the school contact information. Please try again later.');
        })
        .finally(() => {
          this.processing = false;
        });
    },
    saveEditSchoolContactExpiryDate(date) {
      this.$refs.editSchoolContactExpiryDateFilter.save(date);
    },
    resetForm() {
      this.$refs.editSchoolContactForm.reset();
    },
    async validateForm() {
      if(this.$refs.editSchoolContactForm){
        const isValid = await this.$refs.editSchoolContactForm.validate();
        this.isFormValid = isValid.valid;
      }
    },
    isNumber,
    formatDate,
    formatDisplayDate,
    parseDate
  },
  watch: {
    //watching effective date to valid form because we need to cross validate expiry and effective date fields
    'editContact.effectiveDate': {
      handler() {
        this.validateForm();
      }
    }
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
