<template>
  <v-card
      id="editAuthorityContactCard">
    <v-card-title class="sheetHeader pt-1 pb-1">Edit Authority Contact</v-card-title>
    <v-divider></v-divider>
    <v-card-text>
      <v-form ref="editAuthorityContactForm" v-model="isFormValid">
        <v-row class="d-flex justify-center">
          <v-col>
            <v-select
                id='editAuthorityContactTypeDropdown'
                :rules="[rules.required()]"
                v-model="editContact.authorityContactTypeCode"
                :items="authorityContactTypes"
                item-text="label"
                class="pt-0"
                item-value="authorityContactTypeCode"
                label="Authority Contact Type"
            />
            <v-text-field
                id='editAuthorityContactFirstNameInput'
                v-model="editContact.firstName"
                class="pt-0"
                :rules="[rules.noSpecialCharactersContactName()]"
                :maxlength="255"
                label="First Name"
            />
            <v-text-field
                id='editAuthorityContactLastNameInput'
                :rules="[rules.required(), rules.noSpecialCharactersContactName()]"
                v-model="editContact.lastName"
                class="pt-0"
                :maxlength="255"
                label="Last Name"
            />
            <v-text-field
                id='editAuthorityContactEmailInput'
                :rules="[rules.required(), rules.email()]"
                v-model="editContact.email"
                class="pt-0"
                :maxlength="255"
                label="Email"
            />
            <v-row>
              <v-col cols="6">
                <v-text-field
                    id='editAuthorityContactPhoneNumberInput'
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
                    id='editAuthorityContactPhoneExtensionInput'
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
                    id='editAuthorityContactAltPhoneNumberInput'
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
                    id='editAuthorityContactAltPhoneExtensionInput'
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
                    id="editAuthorityContactEffectiveDatePicker"
                    ref="editAuthorityContactEffectiveDateFilter"
                    :close-on-content-click="false"
                    transition="scale-transition"
                    offset-y
                    min-width="auto"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                        id="editAuthorityContactEffectiveDateTextField"
                        :rules="[rules.required()]"
                        class="pt-0 mt-0"
                        v-model="authorityContactEffectiveDateFormatted"
                        label="Start Date"
                        prepend-inner-icon="mdi-calendar"
                        clearable
                        readonly
                        v-bind="attrs"
                        v-on="on"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                      v-model="editContact.effectiveDate"
                      :active-picker.sync="editAuthorityContactEffectiveDatePicker"
                      @change="saveEditAuthorityContactEffectiveDate"
                  ></v-date-picker>
                </v-menu>
              </v-col>
              <v-col cols="6">
                <v-menu
                    id="editAuthorityContactExpiryDatePicker"
                    ref="editAuthorityContactExpiryDateFilter"
                    :close-on-content-click="false"
                    transition="scale-transition"
                    offset-y
                    min-width="auto"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                        id="editAuthorityContactExpiryDateTextField"
                        :rules="[rules.endDateRule(editContact.effectiveDate, editContact.expiryDate)]"
                        class="pt-0 mt-0"
                        v-model="authorityContactExpiryDateFormatted"
                        label="End Date"
                        prepend-inner-icon="mdi-calendar"
                        clearable
                        readonly
                        v-bind="attrs"
                        v-on="on"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                      v-model="editContact.expiryDate"
                      :active-picker.sync="editAuthorityContactExpiryDatePicker"
                      @change="saveEditAuthorityContactExpiryDate"
                  ></v-date-picker>
                </v-menu>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
    <v-card-actions class="justify-end">
      <PrimaryButton id="cancelChangesToAuthorityContactButton" secondary text="Cancel" @click.native="cancelEditAuthorityContactPage"></PrimaryButton>
      <PrimaryButton id="saveChangesToAuthorityContactButton" text="Save" width="7rem" @click.native="saveChangesToAuthorityContact" :disabled="!isFormValid" :loading="processing"></PrimaryButton>
    </v-card-actions>
  </v-card>
</template>

<script>
import PrimaryButton from '../util/PrimaryButton.vue';
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
  name: 'EditAuthorityContactPage',
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
      editAuthorityContactEffectiveDatePicker: null,
      editAuthorityContactExpiryDatePicker: null
    };
  },
  computed: {
    ...mapState(authStore, ['isAuthenticated','userInfo']),
    authorityContactEffectiveDateFormatted: {
      get() {
        return this.formatDisplayDate(this.editContact.effectiveDate);
      },
      set(newValue) {
        this.editContact.effectiveDate = this.parseDate(newValue);
      }
    },
    authorityContactExpiryDateFormatted: {
      get() {
        return this.formatDisplayDate(this.editContact.expiryDate);
      },
      set(newValue) {
        this.editContact.expiryDate = this.parseDate(newValue);
      }
    }
  },
  methods: {
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
    saveEditAuthorityContactEffectiveDate(date) {
      this.$refs.editAuthorityContactEffectiveDateFilter.save(date);
    },
    saveEditAuthorityContactExpiryDate(date) {
      this.$refs.editAuthorityContactExpiryDateFilter.save(date);
    },
    resetForm() {
      this.$refs.editAuthorityContactForm.reset();
    },
    validateForm() {
      this.isFormValid = this.$refs.editAuthorityContactForm.validate();
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
