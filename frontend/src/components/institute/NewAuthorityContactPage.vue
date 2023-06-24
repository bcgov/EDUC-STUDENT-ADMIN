<template>
  <v-card
    id="newContactVCard"
  >
    <v-card-title class="sheetHeader pt-1 pb-1">
      New Authority Contact
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
              v-model="newContact.authorityContactTypeCode"
              :rules="[rules.required()]"
              :items="authorityContactTypes"
              item-title="label"
              variant="underlined"
              class="pt-0"
              item-value="authorityContactTypeCode"
              label="Authority Contact Type"
            />
            <v-text-field
              id="newContactFirstNameInput"
              v-model="newContact.firstName"
              :rules="[rules.noSpecialCharactersContactName()]"
              variant="underlined"
              class="pt-0"
              :maxlength="255"
              label="First Name"
            />
            <v-text-field
              id="newContactLastNameInput"
              v-model="newContact.lastName"
              :rules="[rules.required(), rules.noSpecialCharactersContactName()]"
              variant="underlined"
              class="pt-0"
              :maxlength="255"
              label="Last Name"
            />
            <v-text-field
              id="newContactEmailInput"
              v-model="newContact.email"
              :rules="[rules.required(), rules.email()]"
              variant="underlined"
              class="pt-0"
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
                <v-menu
                  id="newContactEffectiveDatePicker"
                  ref="newContactEffectiveDateFilter"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  offset-y
                  min-width="auto"
                >
                  <template #activator="{ on, attrs }">
                    <v-text-field
                      id="newContactEffectiveDateTextField"
                      v-model="newContact.effectiveDate"
                      :rules="[rules.required()]"
                      class="pt-0 mt-0"
                      variant="underlined"
                      label="Start Date"
                      prepend-inner-icon="mdi-calendar"
                      clearable
                      readonly
                      v-bind="attrs"
                    />
                  </template>
                  <v-date-picker
                    v-model="newContact.effectiveDate"
                    v-model:active-picker="newContactEffectiveDatePicker"
                    @update:model-value="saveNewContactEffectiveDate"
                  />
                </v-menu>
              </v-col>
              <v-col cols="6">
                <v-menu
                  id="newContactExpiryDatePicker"
                  ref="newContactExpiryDateFilter"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  offset-y
                  min-width="auto"
                >
                  <template #activator="{ on, attrs }">
                    <v-text-field
                      id="newContactExpiryDateTextField"
                      v-model="newContact.expiryDate"
                      :rules="[rules.endDateRule(newContact.effectiveDate, newContact.expiryDate)]"
                      class="pt-0 mt-0"
                      variant="underlined"
                      label="End Date"
                      prepend-inner-icon="mdi-calendar"
                      clearable
                      readonly
                      v-bind="attrs"
                    />
                  </template>
                  <v-date-picker
                    v-model="newContact.expiryDate"
                    v-model:active-picker="newContactExpiryDatePicker"
                    @update:model-value="saveNewContactExpiryDate"
                  />
                </v-menu>
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
        :click-action="closeNewContactPage"
      />
      <PrimaryButton
        id="newContactPostBtn"
        text="Save"
        width="7rem"
        :click-action="addNewAuthorityContact"
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
import {LocalDate} from '@js-joda/core';
import {authStore} from '@/store/modules/auth';

export default {
  name: 'NewAuthorityContactPage',
  components: {
    PrimaryButton,
  },
  mixins: [alertMixin],
  props: {
    authorityContactTypes: {
      type: Array,
      required: true
    },
    authorityID: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      isFormValid: false,
      processing: false,
      newContact: {
        authorityContactTypeCode: this.authorityContactTypes.length === 1 ? this.authorityContactTypes[0].authorityContactTypeCode : null,
        firstName: null,
        lastName: null,
        email: null,
        phoneNumber: null,
        phoneExtension: null,
        alternatePhoneNumber: null,
        alternatePhoneExtension: null,
        effectiveDate: LocalDate.now().toString(),
        expiryDate: null
      },
      rules: Rules,
      effectiveDateFilter: false,
      newContactEffectiveDatePicker: null,
      expiryDateFilter: false,
      newContactExpiryDatePicker: null
    };
  },
  mounted() {
    this.validateForm();
  },
  computed: {
    ...mapState(authStore, ['isAuthenticated', 'userInfo']),
  },
  methods: {
    saveNewContactEffectiveDate(date) {
      this.$refs.newContactEffectiveDateFilter.save(date);
    },
    saveNewContactExpiryDate(date) {
      this.$refs.newContactExpiryDateFilter.save(date);
    },
    closeNewContactPage() {
      this.resetForm();
      this.$emit('newAuthorityContact:closeNewAuthorityContactPage');
    },
    addNewAuthorityContact() {
      this.processing = true;
      this.newContact.authorityID = this.authorityID;

      ApiService.apiAxios.post(Routes.institute.AUTHORITY_CONTACT_URL, this.newContact)
        .then(() => {
          this.setSuccessAlert('Success! The authority contact has been created.');
          this.resetForm();
          this.$emit('newAuthorityContact:addNewAuthorityContact');
        })
        .catch(error => {
          this.setFailureAlert('An error occurred while adding the new authority contact. Please try again later.');
          console.log(error);
        })
        .finally(() => {
          this.processing = false;
        });
    },
    resetForm() {
      this.$refs.newContactForm.reset();
    },
    validateForm() {
      const isValid = this.$refs.newContactForm.validate();
      this.isFormValid = isValid.valid;
    },
    isNumber,
  },
  watch: {
    //watching effective date to valid form because we need to cross validate expiry and effective date fields
    'newContact.effectiveDate': {
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
