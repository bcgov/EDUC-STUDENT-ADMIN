<template>
  <v-card
    id="editAuthorityContactCard"
  >
    <v-card-title class="sheetHeader pt-1 pb-1">
      Edit Authority Contact
    </v-card-title>
    <v-divider />
    <v-card-text>
      <v-form
        ref="editAuthorityContactForm"
        v-model="isFormValid"
      >
        <v-row class="d-flex justify-center">
          <v-col>
            <v-select
              id="editAuthorityContactTypeDropdown"
              v-model="editContact.authorityContactTypeCode"
              :rules="[rules.required()]"
              :items="authorityContactTypes"
              item-title="label"
              variant="underlined"
              class="pt-0"
              item-value="authorityContactTypeCode"
              label="Authority Contact Type"
            />
            <v-text-field
              id="editAuthorityContactFirstNameInput"
              v-model="editContact.firstName"
              class="pt-0"
              variant="underlined"
              :rules="[rules.noSpecialCharactersContactName()]"
              :maxlength="255"
              label="First Name"
            />
            <v-text-field
              id="editAuthorityContactLastNameInput"
              v-model="editContact.lastName"
              :rules="[rules.required(), rules.noSpecialCharactersContactName()]"
              class="pt-0"
              variant="underlined"
              :maxlength="255"
              label="Last Name"
            />
            <v-text-field
              id="editAuthorityContactEmailInput"
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
                  id="editAuthorityContactPhoneNumberInput"
                  v-model="editContact.phoneNumber"
                  :rules="[rules.required(), rules.phoneNumber()]"
                  class="pt-0"
                  :maxlength="10"
                  variant="underlined"
                  label="Phone Number"
                  @keypress="isNumber($event)"
                />
              </v-col>
              <v-col cols="6">
                <v-text-field
                  id="editAuthorityContactPhoneExtensionInput"
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
                  id="editAuthorityContactAltPhoneNumberInput"
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
                  id="editAuthorityContactAltPhoneExtensionInput"
                  v-model="editContact.alternatePhoneExtension"
                  :rules="[rules.number()]"
                  class="pt-0"
                  :maxlength="10"
                  variant="underlined"
                  label="Alt. Phone Ext."
                  @keypress="isNumber($event)"
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="6">
                <DatePicker
                  id="editAuthorityContactEffectiveDateTextField"
                  v-model="editContact.effectiveDate"
                  label="Start Date"
                  :rules="[rules.required()]"
                  model-type="yyyy-MM-dd'T'00:00:00"
                  @update:model-value="validateForm"
                  @clear-date="clearEffectiveDate"
                />
              </v-col>
              <v-col cols="6">
                <DatePicker
                  id="editAuthorityContactExpiryDateTextField"
                  v-model="editContact.expiryDate"
                  label="End Date"
                  :rules="[rules.endDateRule(editContact.effectiveDate, editContact.expiryDate)]"
                  model-type="yyyy-MM-dd'T'00:00:00"
                  @update:model-value="validateForm"
                  @clear-date="clearExpiryDate"
                />
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
    <v-card-actions class="justify-end">
      <PrimaryButton
        id="cancelChangesToAuthorityContactButton"
        secondary
        text="Cancel"
        @click-action="cancelEditAuthorityContactPage"
      />
      <PrimaryButton
        id="saveChangesToAuthorityContactButton"
        text="Save"
        width="7rem"
        :disabled="!isFormValid"
        :loading="processing"
        @click-action="saveChangesToAuthorityContact"
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
import {authStore} from '@/store/modules/auth';
import _ from 'lodash';
import DatePicker from '@/components/util/DatePicker.vue';

export default {
  name: 'EditAuthorityContactPage',
  components: {
    DatePicker,
    PrimaryButton,
  },
  mixins: [alertMixin],
  props: {
    contact: {
      type: Object,
      required: true
    },
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
    let clonedContact = _.cloneDeep(this.contact);
    return {
      isFormValid: false,
      processing: false,
      editContact: clonedContact,
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
    clearEffectiveDate() {
      this.editContact.effectiveDate = null;
      this.validateForm();
    },
    clearExpiryDate() {
      this.editContact.expiryDate = null;
      this.validateForm();
    },
    cancelEditAuthorityContactPage() {
      this.resetForm();
      this.$emit('editAuthorityContact:cancelEditAuthorityContactPage');
    },
    saveChangesToAuthorityContact() {
      this.processing = true;
      this.validateForm();

      this.editContact.independentAuthorityId = this.authorityID;

      ApiService.apiAxios.put(`${Routes.institute.AUTHORITY_CONTACT_URL}/${this.editContact.authorityContactId}`, this.editContact)
        .then(() => {
          this.setSuccessAlert('Success! The authority contact has been updated.');
          this.resetForm();
          this.$emit('editAuthorityContact:editAuthorityContactSuccess');
        })
        .catch(error => {
          console.error(error);
          this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while saving the authority contact information. Please try again later.');
        })
        .finally(() => {
          this.processing = false;
        });
    },
    resetForm() {
      this.$refs.editAuthorityContactForm.reset();
    },
    async validateForm() {
      const isValid = await this.$refs.editAuthorityContactForm.validate();
      this.isFormValid = isValid.valid;
    },
    isNumber
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
