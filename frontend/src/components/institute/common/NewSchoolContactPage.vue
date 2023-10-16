<template>
  <v-card
    id="newContactVCard"
  >
    <v-card-title class="sheetHeader pt-1 pb-1">
      New School Contact
    </v-card-title>
    <v-divider />
    <v-card-text>
      <v-form
        ref="newContactForm"
        v-model="isFormValid"
      >
        <v-row class="d-flex justify-center">
          <v-col>
            <v-select
              id="newContactDropdown"
              v-model="newContact.schoolContactTypeCode"
              :rules="[rules.required()]"
              :items="schoolContactTypes"
              item-title="label"
              variant="underlined"
              class="pt-0"
              item-value="schoolContactTypeCode"
              label="School Contact Type"
            />
            <v-text-field
              id="newContactFirstNameInput"
              v-model="newContact.firstName"
              variant="underlined"
              class="pt-0"
              :rules="[rules.noSpecialCharactersContactName()]"
              :maxlength="255"
              label="First Name"
            />
            <v-text-field
              id="newContactLastNameInput"
              v-model="newContact.lastName"
              variant="underlined"
              :rules="[rules.required(), rules.noSpecialCharactersContactName()]"
              class="pt-0"
              :maxlength="255"
              label="Last Name"
            />
            <v-text-field
              id="newContactJobTitleInput"
              v-model="newContact.jobTitle"
              class="pt-0"
              variant="underlined"
              :rules="[rules.noSpecialCharactersContactTitle()]"
              :maxlength="255"
              label="Position Title"
            />
            <v-text-field
              id="newContactEmailInput"
              v-model="newContact.email"
              :rules="[rules.required(), rules.email()]"
              class="pt-0"
              variant="underlined"
              :maxlength="255"
              label="Email"
            />
            <v-row>
              <v-col cols="6">
                <v-text-field
                  id="newContactPhoneNumberInput"
                  v-model="newContact.phoneNumber"
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
                  id="newContactPhoneExtensionInput"
                  v-model="newContact.phoneExtension"
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
                  id="newContactAltPhoneNumberInput"
                  v-model="newContact.alternatePhoneNumber"
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
                  id="newContactAltPhoneExtensionInput"
                  v-model="newContact.alternatePhoneExtension"
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
                <DatePicker
                  id="newContactEffectiveDateTextField"
                  v-model="newContact.effectiveDate"
                  label="Start Date"
                  :rules="[rules.required()]"
                  model-type="yyyy-MM-dd'T'00:00:00"
                  @update:model-value="validateForm"
                />
              </v-col>
              <v-col cols="6">
                <DatePicker
                  id="newContactExpiryDateTextField"
                  v-model="newContact.expiryDate"
                  label="End Date"
                  :rules="[rules.endDateRule(newContact.effectiveDate, newContact.expiryDate)]"
                  model-type="yyyy-MM-dd'T'00:00:00"
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
        id="cancelNewContactBtn"
        secondary
        text="Cancel"
        @click-action="closeNewContactPage"
      />
      <PrimaryButton
        id="newContactPostBtn"
        text="Save"
        width="7rem"
        :disabled="!isFormValid"
        :loading="processing"
        @click-action="addNewSchoolContact"
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
import {DateTimeFormatter, LocalDate} from '@js-joda/core';
import {authStore} from '@/store/modules/auth';
import DatePicker from '@/components/util/DatePicker.vue';

export default {
  name: 'NewSchoolContactPage',
  components: {
    DatePicker,
    PrimaryButton,
  },
  mixins: [alertMixin],
  props: {
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
    return {
      isFormValid: false,
      processing: false,
      newContact: {
        schoolContactTypeCode: null,
        firstName: null,
        lastName: null,
        jobTitle: null,
        email: null,
        phoneNumber: null,
        phoneExtension: null,
        alternatePhoneNumber: null,
        alternatePhoneExtension: null,
        effectiveDate: LocalDate.now().atStartOfDay().format(DateTimeFormatter.ofPattern('yyyy-MM-dd\'T\'HH:mm:ss')).toString(),
        expiryDate: null
      },
      rules: Rules
    };
  },
  computed: {
    ...mapState(authStore, ['isAuthenticated', 'userInfo']),
  },
  mounted() {
    this.validateForm();
  },
  methods: {
    closeNewContactPage() {
      this.resetForm();
      this.$emit('newSchoolContact:closeNewSchoolContactPage');
    },
    addNewSchoolContact() {
      this.processing = true;
      this.newContact.schoolID = this.schoolID;

      ApiService.apiAxios.post(Routes.institute.SCHOOL_CONTACT_URL, this.newContact)
        .then(() => {
          this.setSuccessAlert('Success! The school contact has been created.');
          this.resetForm();
          this.$emit('newSchoolContact:addNewSchoolContact');
        })
        .catch(error => {
          this.setFailureAlert('An error occurred while adding the new school contact. Please try again later.');
          console.log(error);
        })
        .finally(() => {
          this.processing = false;
        });
    },
    resetForm() {
      this.$refs.newContactForm.reset();
    },
    async validateForm() {
      const isValid = await this.$refs.newContactForm.validate();
      this.isFormValid = isValid.valid;
    },
    isNumber,
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
