<template>
  <v-card
      id="editDistrictContactCard">
    <v-card-title class="sheetHeader pt-1 pb-1">Edit District Contact</v-card-title>
    <v-divider></v-divider>
    <v-card-text>
      <v-form ref="editDistrictContactForm" v-model="isFormValid">
        <v-row class="d-flex justify-center">
          <v-col>
            <v-select
                id='editDistrictContactTypeDropdown'
                :rules="[rules.required()]"
                v-model="editContact.districtContactTypeCode"
                :items="districtContactTypes"
                item-text="label"
                class="pt-0"
                item-value="districtContactTypeCode"
                label="District Contact Type"
            />
            <v-text-field
                id='editDistrictContactFirstNameInput'
                v-model="editContact.firstName"
                class="pt-0"
                :maxlength="255"
                label="First Name"
            />
            <v-text-field
                id='editDistrictContactLastNameInput'
                :rules="[rules.required()]"
                v-model="editContact.lastName"
                class="pt-0"
                :maxlength="255"
                label="Last Name"
            />
            <v-text-field id="editDistrictContactJobTitle"
                          v-model="editContact.jobTitle"
                          label="Title"
                          type="text"
                          maxlength="255"
            ></v-text-field>
            <v-text-field
                id='editDistrictContactEmailInput'
                :rules="[rules.required(), rules.email()]"
                v-model="editContact.email"
                class="pt-0"
                :maxlength="255"
                label="Email"
            />
            <v-row>
              <v-col cols="6">
                <v-text-field
                    id='editDistrictContactPhoneNumberInput'
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
                    id='editDistrictContactPhoneExtensionInput'
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
                    id='editDistrictContactAltPhoneNumberInput'
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
                    id='editDistrictContactAltPhoneExtensionInput'
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
                    id="editDistrictContactEffectiveDatePicker"
                    ref="editDistrictContactEffectiveDateFilter"
                    :close-on-content-click="false"
                    transition="scale-transition"
                    offset-y
                    min-width="auto"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                        id="editDistrictContactEffectiveDateTextField"
                        :rules="[rules.required()]"
                        class="pt-0 mt-0"
                        v-model="districtContactEffectiveDateFormatted"
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
                      :active-picker.sync="editDistrictContactEffectiveDatePicker"
                      @change="saveEditDistrictContactEffectiveDate"
                  ></v-date-picker>
                </v-menu>
              </v-col>
              <v-col cols="6">
                <v-menu
                    id="editDistrictContactExpiryDatePicker"
                    ref="editDistrictContactExpiryDateFilter"
                    :close-on-content-click="false"
                    transition="scale-transition"
                    offset-y
                    min-width="auto"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                        id="editDistrictContactExpiryDateTextField"
                        :rules="[rules.endDateRule(editContact.effectiveDate, editContact.expiryDate)]"
                        class="pt-0 mt-0"
                        v-model="districtContactExpiryDateFormatted"
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
                      :active-picker.sync="editDistrictContactExpiryDatePicker"
                      @change="saveEditDistrictContactExpiryDate"
                  ></v-date-picker>
                </v-menu>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
    <v-card-actions class="justify-end">
      <PrimaryButton id="cancelChangesToDistrictContactButton" secondary text="Cancel" @click.native="cancelEditDistrictContactPage"></PrimaryButton>
      <PrimaryButton id="saveChangesToDistrictContactButton" text="Save" width="7rem" @click.native="saveChangesToDistrictContact" :disabled="!isFormValid" :loading="processing"></PrimaryButton>
    </v-card-actions>
  </v-card>
</template>

<script>
import PrimaryButton from '../util/PrimaryButton';
import {mapGetters} from 'vuex';
import alertMixin from '@/mixins/alertMixin';
import ApiService from '@/common/apiService';
import {Routes} from '@/utils/constants';
import * as Rules from '@/utils/institute/formRules';
import {isNumber} from '@/utils/institute/formInput';
import {formatDate, formatDisplayDate} from '@/utils/format';
import {parseDate} from '@/utils/dateHelpers';

export default {
  name: 'EditDistrictContactPage',
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
      editDistrictContactEffectiveDatePicker: null,
      editDistrictContactExpiryDatePicker: null
    };
  },
  computed: {
    ...mapGetters('auth', ['isAuthenticated','userInfo']),
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
  methods: {
    cancelEditDistrictContactPage() {
      this.resetForm();
      this.$emit('editDistrictContact:cancelEditDistrictContactPage');
    },
    saveChangesToDistrictContact() {
      this.processing = true;
      this.validateForm();

      this.editContact.districtId = this.districtID;

      ApiService.apiAxios.put(`${Routes.institute.DISTRICT_CONTACT_URL}/${this.editContact.districtContactId}`, this.editContact)
        .then(() => {
          this.setSuccessAlert('Success! The district contact has been updated.');
          this.resetForm();
          this.$emit('editDistrictContact:editDistrictContactSuccess');
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
    validateForm() {
      this.isFormValid = this.$refs.editDistrictContactForm.validate();
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
