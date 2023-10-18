<template>
  <v-card
    id="editDistrictContactCard"
  >
    <v-card-title class="sheetHeader pt-1 pb-1">
      Edit District Contact
    </v-card-title>
    <v-divider />
    <v-card-text>
      <v-form
        ref="editDistrictContactForm"
        v-model="isFormValid"
      >
        <v-row class="d-flex justify-center">
          <v-col>
            <v-select
              id="editDistrictContactTypeDropdown"
              v-model="editContact.districtContactTypeCode"
              :rules="[rules.required()]"
              :items="districtContactTypes"
              variant="underlined"
              item-title="label"
              class="pt-0"
              item-value="districtContactTypeCode"
              label="District Contact Type"
            />
            <v-text-field
              id="editDistrictContactFirstNameInput"
              v-model="editContact.firstName"
              class="pt-0"
              variant="underlined"
              :maxlength="255"
              label="First Name"
            />
            <v-text-field
              id="editDistrictContactLastNameInput"
              v-model="editContact.lastName"
              :rules="[rules.required()]"
              class="pt-0"
              variant="underlined"
              :maxlength="255"
              label="Last Name"
            />
            <v-text-field
              id="editDistrictContactJobTitle"
              v-model="editContact.jobTitle"
              label="Position Title"
              variant="underlined"
              type="text"
              maxlength="255"
            />
            <v-text-field
              id="editDistrictContactEmailInput"
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
                  id="editDistrictContactPhoneNumberInput"
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
                  id="editDistrictContactPhoneExtensionInput"
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
                  id="editDistrictContactAltPhoneNumberInput"
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
                  id="editDistrictContactAltPhoneExtensionInput"
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
                  id="editDistrictContactEffectiveDateTextField"
                  v-model="editContact.effectiveDate"
                  :rules="[rules.required()]"
                  class="pt-0 mt-0"
                  label="Start Date"
                  variant="underlined"
                  type="date"
                  clearable
                  @update:model-value="validateForm"
                />
              </v-col>
              <v-col cols="6">
                <v-text-field
                  id="editDistrictContactExpiryDateTextField"
                  v-model="editContact.expiryDate"
                  :rules="[rules.endDateRule(editContact.effectiveDate, editContact.expiryDate)]"
                  class="pt-0 mt-0"
                  label="End Date"
                  variant="underlined"
                  clearable
                  type="date"
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
        id="cancelChangesToDistrictContactButton"
        secondary
        text="Cancel"
        @click-action="cancelEditDistrictContactPage"
      />
      <PrimaryButton
        id="saveChangesToDistrictContactButton"
        text="Save"
        width="7rem"
        @click-action="saveChangesToDistrictContact"
        :disabled="!isFormValid"
        :loading="processing"
      />
    </v-card-actions>
  </v-card>
</template>

<script>
import PrimaryButton from '../util/PrimaryButton.vue';
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
  name: 'EditDistrictContactPage',
  components: {
    PrimaryButton,
  },
  mixins: [alertMixin],
  props: {
    contact: {
      type: Object,
      required: true
    },
    districtContactTypes: {
      type: Array,
      required: true
    },
    districtID: {
      type: String,
      required: true
    }
  },
  emits: ['edit-district-contact:cancel-edit-district-contact-page', 'edit-district-contact:edit-district-contact-success'],
  data() {
    let clonedContact = _.cloneDeep(this.contact);
    clonedContact.effectiveDate = this.parseDate(formatDate(clonedContact.effectiveDate));
    clonedContact.expiryDate = this.parseDate(formatDate(clonedContact.expiryDate));
    return {
      isFormValid: false,
      processing: false,
      editContact: clonedContact,
      rules: Rules,
      editDistrictContactEffectiveDatePicker: null,
      editDistrictContactExpiryDatePicker: null
    };
  },
  computed: {
    ...mapState(authStore, ['isAuthenticated', 'userInfo']),
    districtContactEffectiveDateFormatted: {
      get() {
        return this.formatDisplayDate(this.editContact.effectiveDate);
      },
      set(newValue) {
        this.editContact.effectiveDate = this.parseDate(newValue);
      }
    },
    districtContactExpiryDateFormatted: {
      get() {
        return this.formatDisplayDate(this.editContact.expiryDate);
      },
      set(newValue) {
        this.editContact.expiryDate = this.parseDate(newValue);
      }
    }
  },
  watch: {
    //watching effective date to valid form because we need to cross validate expiry and effective date fields
    'editContact.effectiveDate': {
      handler() {
        this.validateForm();
      }
    }
  },
  mounted() {
    this.validateForm();
  },
  methods: {
    cancelEditDistrictContactPage() {
      this.resetForm();
      this.$emit('edit-district-contact:cancel-edit-district-contact-page');
    },
    saveChangesToDistrictContact() {
      this.processing = true;
      this.validateForm();

      this.editContact.districtId = this.districtID;

      ApiService.apiAxios.put(`${Routes.institute.DISTRICT_CONTACT_URL}/${this.editContact.districtContactId}`, this.editContact)
        .then(() => {
          this.setSuccessAlert('Success! The district contact has been updated.');
          this.resetForm();
          this.$emit('edit-district-contact:edit-district-contact-success');
        })
        .catch(error => {
          console.error(error);
          this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while saving the district contact information. Please try again later.');
        })
        .finally(() => {
          this.processing = false;
        });
    },
    saveEditDistrictContactEffectiveDate(date) {
      this.$refs.editDistrictContactEffectiveDateFilter.save(date);
    },
    saveEditDistrictContactExpiryDate(date) {
      this.$refs.editDistrictContactExpiryDateFilter.save(date);
    },
    resetForm() {
      this.$refs.editDistrictContactForm.reset();
    },
    async validateForm() {
      const isValid = await this.$refs.editDistrictContactForm.validate();
      this.isFormValid = isValid.valid;
    },
    isNumber,
    formatDate,
    formatDisplayDate,
    parseDate
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
