<template>
  <v-card
      id="newContactVCard">
    <v-card-title class="sheetHeader pt-1 pb-1">New District Contact</v-card-title>
    <v-divider></v-divider>
    <v-card-text>
      <v-form ref="newContactForm" v-model="isFormValid">
        <v-row class="d-flex justify-center">
          <v-col>
            <v-select
                id='newContactDropdown'
                :rules="[rules.required()]"
                v-model="newContact.districtContactTypeCode"
                :items="districtContactTypes"
                item-text="label"
                class="pt-0"
                item-value="districtContactTypeCode"
                label="District Contact Type"
            />
            <v-text-field
                id='newContactFirstNameInput'
                :rules="[rules.required(), rules.noSpecialCharacters()]"
                v-model="newContact.firstName"
                class="pt-0"
                :maxlength="255"
                label="First Name"
            />
            <v-text-field
                id='newContactLastNameInput'
                :rules="[rules.required(), rules.noSpecialCharacters()]"
                v-model="newContact.lastName"
                class="pt-0"
                :maxlength="255"
                label="Last Name"
            />
            <v-text-field
              id='newContactJobTitleInput'
              :rules="[rules.noSpecialCharacters()]"
              v-model="newContact.jobTitle"
              class="pt-0"
              :maxlength="255"
              label="Position Title"
            />
            <v-text-field
                id='newContactEmailInput'
                :rules="[rules.required(), rules.email()]"
                v-model="newContact.email"
                class="pt-0"
                :maxlength="255"
                label="Email"
            />
            <v-row>
              <v-col cols="6">
                <v-text-field
                    id='newContactPhoneNumberInput'
                    :rules="[rules.required(), rules.phoneNumber()]"
                    v-model="newContact.phoneNumber"
                    class="pt-0"
                    :maxlength="10"
                    label="Phone Number"
                    @keypress="isNumber($event)"
                />
              </v-col>
              <v-col cols="6">
                <v-text-field
                    id='newContactPhoneExtensionInput'
                    :rules="[rules.number()]"
                    v-model="newContact.phoneExtension"
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
                    id='newContactAltPhoneNumberInput'
                    :rules="[rules.phoneNumber()]"
                    v-model="newContact.alternatePhoneNumber"
                    class="pt-0"
                    :maxlength="10"
                    label="Alt. Phone Number"
                    @keypress="isNumber($event)"
                />
              </v-col>
              <v-col cols="6">
                <v-text-field
                    id='newContactAltPhoneExtensionInput'
                    :rules="[rules.number()]"
                    v-model="newContact.alternatePhoneExtension"
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
                    id="newContactEffectiveDatePicker"
                    ref="newContactEffectiveDateFilter"
                    :close-on-content-click="false"
                    transition="scale-transition"
                    offset-y
                    min-width="auto"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                        id="newContactEffectiveDateTextField"
                        :rules="[rules.required()]"
                        class="pt-0 mt-0"
                        v-model="newContact.effectiveDate"
                        label="Start Date"
                        prepend-inner-icon="mdi-calendar"
                        clearable
                        readonly
                        v-bind="attrs"
                        v-on="on"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                      v-model="newContact.effectiveDate"
                      :active-picker.sync="newContactEffectiveDatePicker"
                      @change="saveNewContactEffectiveDate"
                  ></v-date-picker>
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
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                        id="newContactExpiryDateTextField"
                        :rules="[rules.endDateRule(newContact.effectiveDate, newContact.expiryDate)]"
                        class="pt-0 mt-0"
                        v-model="newContact.expiryDate"
                        label="End Date"
                        prepend-inner-icon="mdi-calendar"
                        clearable
                        readonly
                        v-bind="attrs"
                        v-on="on"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                      v-model="newContact.expiryDate"
                      :active-picker.sync="newContactExpiryDatePicker"
                      @change="saveNewContactExpiryDate"
                  ></v-date-picker>
                </v-menu>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
    <v-card-actions class="justify-end">
      <PrimaryButton id="cancelNewContactBtn" secondary text="Cancel" @click.native="closeNewContactPage"></PrimaryButton>
      <PrimaryButton id="newContactPostBtn" text="Save" width="7rem" @click.native="addNewDistrictContact" :disabled="!isFormValid" :loading="processing"></PrimaryButton>
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
import {LocalDate} from '@js-joda/core';

export default {
  name: 'NewDistrictContactPage',
  mixins: [alertMixin],
  props: {
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
    return {
      isFormValid: false,
      processing: false,
      newContact: {
        districtContactTypeCode: this.districtContactTypes.length === 1 ? this.districtContactTypes[0].districtContactTypeCode : null,
        firstName: null,
        lastName: null,
        email: null,
        jobTitle: null,
        phoneNumber: null,
        phoneExtension: null,
        alternatePhoneNumber: null,
        alternatePhoneExtension: null,
        effectiveDate: LocalDate.now().toString(),
        expiryDate: null
      },
      rules: Rules,
      newContactEffectiveDatePicker: null,
      newContactExpiryDatePicker: null
    };
  },
  computed: {
    ...mapGetters('auth', ['isAuthenticated','userInfo']),
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
      this.$emit('newDistrictContact:closeNewDistrictContactPage');
    },
    addNewDistrictContact() {
      this.processing = true;
      this.newContact.districtID = this.districtID;

      ApiService.apiAxios.post(Routes.institute.DISTRICT_CONTACT_URL, this.newContact)
        .then(() => {
          this.setSuccessAlert('Success! The district contact has been created.');
          this.resetForm();
          this.$emit('newDistrictContact:addNewDistrictContact');
        })
        .catch(error => {
          this.setFailureAlert('An error occurred while adding the new district contact. Please try again later.');
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
      this.isFormValid = this.$refs.newContactForm.validate();
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
