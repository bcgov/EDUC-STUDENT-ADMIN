<template>
  <v-card
      id="editSchoolContactCard">
    <v-card-title class="sheetHeader pt-1 pb-1">Edit School Contact</v-card-title>
    <v-divider></v-divider>
    <v-card-text>
      <v-form ref="editSchoolContactForm" v-model="isFormValid">
        <v-row class="d-flex justify-center">
          <v-col>
            <v-select
                id='editSchoolContactTypeDropdown'
                :rules="[rules.required()]"
                v-model="editContact.schoolContactTypeCode"
                :items="schoolContactTypes"
                item-text="label"
                variant="underlined"
                class="pt-0"
                item-value="schoolContactTypeCode"
                label="School Contact Type"
            />
            <v-text-field
                id='editSchoolContactFirstNameInput'
                v-model="editContact.firstName"
                class="pt-0"
                :rules="[rules.noSpecialCharactersContactName()]"
                :maxlength="255"
                label="First Name"
            />
            <v-text-field
                id='editSchoolContactLastNameInput'
                :rules="[rules.required(), rules.noSpecialCharactersContactName()]"
                v-model="editContact.lastName"
                class="pt-0"
                :maxlength="255"
                label="Last Name"
            />
            <v-text-field id="editSchoolContactJobTitle"
                          v-model="editContact.jobTitle"
                          label="Position Title"
                          type="text"
                          :rules="[rules.noSpecialCharactersContactTitle()]"
                          maxlength="255"
            ></v-text-field>
            <v-text-field
                id='editSchoolContactEmailInput'
                :rules="[rules.required(), rules.email()]"
                v-model="editContact.email"
                class="pt-0"
                :maxlength="255"
                label="Email"
            />
            <v-row>
              <v-col cols="6">
                <v-text-field
                    id='editSchoolContactPhoneNumberInput'
                    :rules="[rules.required(), rules.phoneNumber()]"
                    v-model="editContact.phoneNumber"
                    class="pt-0"
                    :maxlength="10"
                    label="Phone Number"
                    @keypress="isNumber($event)"
                />
              </v-col>
              <v-col cols="6">
                <v-text-field
                    id='editSchoolContactPhoneExtensionInput'
                    :rules="[rules.number()]"
                    v-model="editContact.phoneExtension"
                    :maxlength="10"
                    class="pt-0"
                    label="Ext."
                    @keypress="isNumber($event)"
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="6">
                <v-text-field
                    id='editSchoolContactAltPhoneNumberInput'
                    :rules="[rules.phoneNumber()]"
                    v-model="editContact.alternatePhoneNumber"
                    class="pt-0"
                    :maxlength="10"
                    label="Alt. Phone Number"
                    @keypress="isNumber($event)"
                />
              </v-col>
              <v-col cols="6">
                <v-text-field
                    id='editSchoolContactAltPhoneExtensionInput'
                    :rules="[rules.number()]"
                    v-model="editContact.alternatePhoneExtension"
                    class="pt-0"
                    :maxlength="10"
                    label="Alt. Phone Ext."
                    @keypress="isNumber($event)"
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="6">
                <v-menu
                    id="editSchoolContactEffectiveDatePicker"
                    ref="editSchoolContactEffectiveDateFilter"
                    :close-on-content-click="false"
                    transition="scale-transition"
                    offset-y
                    min-width="auto"
                >
                  <template #activator="{ on, attrs }">
                    <v-text-field
                        id="editSchoolContactEffectiveDateTextField"
                        :rules="[rules.required()]"
                        class="pt-0 mt-0"
                        v-model="schoolContactEffectiveDateFormatted"
                        label="Start Date"
                        prepend-inner-icon="mdi-calendar"
                        clearable
                        readonly
                        v-bind="attrs"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                      v-model="editContact.effectiveDate"
                      :active-picker.sync="editSchoolContactEffectiveDatePicker"
                      @update:model-value="saveEditSchoolContactEffectiveDate"
                  ></v-date-picker>
                </v-menu>
              </v-col>
              <v-col cols="6">
                <v-menu
                    id="editSchoolContactExpiryDatePicker"
                    ref="editSchoolContactExpiryDateFilter"
                    :close-on-content-click="false"
                    transition="scale-transition"
                    offset-y
                    min-width="auto"
                >
                  <template #activator="{ on, attrs }">
                    <v-text-field
                        id="editSchoolContactExpiryDateTextField"
                        :rules="[rules.endDateRule(editContact.effectiveDate, editContact.expiryDate)]"
                        class="pt-0 mt-0"
                        v-model="schoolContactExpiryDateFormatted"
                        label="End Date"
                        prepend-inner-icon="mdi-calendar"
                        clearable
                        readonly
                        v-bind="attrs"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                      v-model="editContact.expiryDate"
                      :active-picker.sync="editSchoolContactExpiryDatePicker"
                      @update:model-value="saveEditSchoolContactExpiryDate"
                  ></v-date-picker>
                </v-menu>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
    <v-card-actions class="justify-end">
      <PrimaryButton id="cancelChangesToSchoolContactButton" secondary text="Cancel" :click-action="cancelEditSchoolContactPage"></PrimaryButton>
      <PrimaryButton id="saveChangesToSchoolContactButton" text="Save" width="7rem" :click-action="saveChangesToSchoolContact" :disabled="!isFormValid" :loading="processing"></PrimaryButton>
    </v-card-actions>
  </v-card>
</template>

<script>
import PrimaryButton from '../../util/PrimaryButton.vue';
import { mapState } from 'pinia';
import alertMixin from '@/mixins/alertMixin';
import ApiService from '@/common/apiService';
import {Routes} from '@/utils/constants';
import * as Rules from '@/utils/institute/formRules';
import {isNumber} from '@/utils/institute/formInput';
import {formatDate, formatDisplayDate} from '@/utils/format';
import {parseDate} from '@/utils/dateHelpers';
import {authStore} from '@/store/modules/auth';

export default {
  name: 'EditSchoolContactPage',
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
  components: {
    PrimaryButton,
  },
  mounted() {
    this.validateForm();
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
  computed: {
    ...mapState(authStore, ['isAuthenticated','userInfo']),
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
    saveEditSchoolContactEffectiveDate(date) {
      this.$refs.editSchoolContactEffectiveDateFilter.save(date);
    },
    saveEditSchoolContactExpiryDate(date) {
      this.$refs.editSchoolContactExpiryDateFilter.save(date);
    },
    resetForm() {
      this.$refs.editSchoolContactForm.reset();
    },
    validateForm() {
      this.isFormValid = this.$refs.editSchoolContactForm.validate();
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
