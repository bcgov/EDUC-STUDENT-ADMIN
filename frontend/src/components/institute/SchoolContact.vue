<template>
  <div>
    <v-card v-show="!expandEdit">
      <v-card-title class="pb-0">
        <v-row no-gutters>
          <v-col>
            <v-row no-gutters>
              <v-col cols="8" class="justify-start">
                <v-icon class="pb-1" :color="getStatusColor(contact)" left dark>
                  mdi-circle-medium
                </v-icon>
                <strong style="word-break: break-word;">{{ `${contact.firstName} ${contact.lastName}` }}</strong>
              </v-col>
              <v-col cols="4" class="d-flex justify-end">
                <PrimaryButton icon-left width="6em" secondary icon="mdi-pencil" text="Edit" id="editContactButton" :disabled="!canEditSchoolContact" @click.native="openContactEditForm(contact)"></PrimaryButton>
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col cols="12" class="pt-1">
                <span>{{ contact.email }}</span>
              </v-col>
              <v-col cols="12" class="pt-1">
                <span>{{ formatPhoneNumber(contact.phoneNumber) }}</span><span v-if="contact.phoneExtension"> ext. {{contact.phoneExtension}}</span>
              </v-col>
              <v-col cols="12" class="pt-1" v-if="contact.alternatePhoneNumber">
                <span>{{ formatPhoneNumber(contact.alternatePhoneNumber) }} (alt.)</span> <span v-if="contact.alternatePhoneExtension"> ext. {{contact.alternatePhoneExtension}}</span>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-card-title>
      <v-card-text class="pt-2">
        <v-row no-gutters>
          <v-col cols="12" class="pt-1" v-if="contact.expiryDate">
            <v-icon aria-hidden="false">
              mdi-calendar-today
            </v-icon>
            <span> {{ formatDate(contact.effectiveDate) }} - {{ formatDate(contact.expiryDate)}}</span>
          </v-col>
          <v-col cols="12" class="pt-1" v-else>
            <v-icon aria-hidden="false">
              mdi-calendar-today
            </v-icon>
            <span> {{ formatDate(contact.effectiveDate) }}</span>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    <v-expand-transition>
      <v-card v-show="expandEdit">
        <v-card-actions class="justify-end">
          <PrimaryButton id="cancelEditButton" :secondary="true" @click.native="closeSchoolContactEdit"
                         text="Cancel"></PrimaryButton>
          <PrimaryButton @click.native="saveSchoolContact(contactEdit)" id="saveEditButton" :disabled="!ecFormValid" :loading="processing" text="Save"></PrimaryButton>
        </v-card-actions>
        <v-card-text>
          <v-form
              ref="editContactForm"
              v-model="ecFormValid">
            <v-row>
              <v-col>
                <v-text-field id="contactEditFirstName"
                              v-model="contactEdit.firstName"
                              :rules="firstNameRules"
                              label="First Name"
                              type="text"
                              maxlength="255"
                              required></v-text-field>
              </v-col>
              <v-col>
                <v-text-field id="contactEditLastName"
                              v-model="contactEdit.lastName"
                              :rules="lastNameRules"
                              label="Last Name"
                              type="text"
                              maxlength="255"
                              required></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-text-field id="contactEditEmail"
                              v-model="contactEdit.email"
                              :rules="emailRules"
                              label="Email"
                              type="text"
                              maxlength="255"
                              required></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-text-field id="contactEditPhoneNumber"
                              v-model="contactEdit.phoneNumber"
                              :rules="phNumRules"
                              label="Phone"
                              type="text"
                              maxlength="10"
                              :counter="10"
                              @keypress="isNumber($event)"
                              required></v-text-field>
              </v-col>
              <v-col>
                <v-text-field id="contactEditPhoneExt"
                              v-model="contactEdit.phoneExtension"
                              :rules="phNumExtRules"
                              label="Ext"
                              type="text"
                              maxlength="10"
                              @keypress="isNumber($event)"></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-text-field id="contactEditAltPhoneNumber"
                              v-model="contactEdit.alternatePhoneNumber"
                              :rules="altPhNumRules"
                              label="Alternative Phone"
                              type="text"
                              maxlength="10"
                              :counter="10"
                              @keypress="isNumber($event)"></v-text-field>
              </v-col>
              <v-col>
                <v-text-field id="contactEditAltPhoneExt"
                              v-model="contactEdit.alternatePhoneExtension"
                              :rules="altPhNumExtRules"
                              label="Alternative Ext"
                              type="text"
                              maxlength="10"
                              @keypress="isNumber($event)"></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-menu
                    id="editContactEffectiveDatePicker"
                    ref="editContactEffectiveDateFilter"
                    :close-on-content-click="false"
                    transition="scale-transition"
                    offset-y
                    min-width="auto"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                        id="editContactEffectiveDateTextField"
                        :rules="startDateRules"
                        class="pt-0 mt-0"
                        v-model="contactEdit.effectiveDate"
                        label="Expiry Date"
                        prepend-inner-icon="mdi-calendar"
                        clearable
                        readonly
                        v-bind="attrs"
                        v-on="on"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                      v-model="contactEdit.effectiveDate"
                      :active-picker.sync="editContactEffectiveDatePicker"
                      @change="saveEditContactEffectiveDate"
                  ></v-date-picker>
                </v-menu>
              </v-col>
              <v-col>
                <v-menu
                    id="editContactExpiryDatePicker"
                    ref="editContactExpiryDateFilter"
                    :close-on-content-click="false"
                    transition="scale-transition"
                    offset-y
                    min-width="auto"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                        id="editContactExpiryDateTextField"
                        :rules="endDateRules"
                        class="pt-0 mt-0"
                        v-model="contactEdit.expiryDate"
                        label="Expiry Date"
                        prepend-inner-icon="mdi-calendar"
                        clearable
                        readonly
                        v-bind="attrs"
                        v-on="on"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                      v-model="contactEdit.expiryDate"
                      :active-picker.sync="editContactExpiryDatePicker"
                      @change="saveEditContactExpiryDate"
                  ></v-date-picker>
                </v-menu>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
      </v-card>
    </v-expand-transition>
  </div>
</template>

<script>
import ApiService from '../../common/apiService';
import {Routes} from '@/utils/constants';
import PrimaryButton from '../util/PrimaryButton';
import alertMixin from '@/mixins/alertMixin';
import {formatPhoneNumber, formatDate} from '@/utils/format';
import {getStatusColor} from '@/utils/institute/status';
import {LocalDate} from '@js-joda/core';

export default {
  name: 'SchoolContact',
  mixins: [alertMixin],
  components: {
    PrimaryButton,
  },
  props: {
    schoolID: {
      type: String,
      required: true
    },
    contact: {
      type: Object,
      required: true
    },
    canEditSchoolContact: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      processing: false,
      school: {},
      expandEdit: false,
      saveEnabled: true,
      ecFormValid: false,
      effDateMenu: false,
      expDateMenu: false,
      contactEdit: {
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber:'',
        phoneExtension:'',
        alternatePhoneNumber:'',
        alternatePhoneExtension:'',
        effectiveDate:'',
        expiryDate:''
      },
      firstNameRules: [
        v => !!v || 'First Name is required',
      ],
      lastNameRules: [
        v => !!v || 'Last Name is required',
      ],
      emailRules: [
        v => !!v || 'E-mail is required',
        v => /^[\w!#$%&’*+/=?`{|}~^-]+(?:\.[\w!#$%&’*+/=?`{|}~^-]+)*@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,6}$/.test(v) || 'E-mail must be valid',
      ],
      phNumRules: [
        v => !!v || 'Phone Number is required',
        v => !v || v.length >= 10 || 'Phone Number must be 10 digits',
      ],
      phNumExtRules: [
        v => !v || /^\d+$/.test(v) || 'Phone Extension must be valid',
      ],
      altPhNumRules: [
        v => !v || v.length >= 10 || 'Alt. Phone Number must be 10 digits',
      ],
      altPhNumExtRules: [
        v => !v || /^\d+$/.test(v) || 'Phone Extension must be valid',
      ],
      startDateRules: [
        v => !!v || 'Start Date is required',
      ],
      endDateRules: [
        this.endDateRuleValidator,
      ],
      editContactExpiryDatePicker: null,
      editContactEffectiveDatePicker: null,
    };
  },
  methods: {
    saveSchoolContact(contact) {
      this.processing = true;
      this.validateEditContactForm();

      contact.schoolID = this.schoolID;

      const payload = contact;
      ApiService.apiAxios.post(`${Routes.institute.SCHOOL_CONTACT_URL}`, payload)
        .then(() => {
          this.setSuccessAlert('Success! The school contact has been updated.');
          this.closeSchoolContactEdit();
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
    closeSchoolContactEdit(){
      this.expandEdit = !this.expandEdit;
      this.$refs.editContactForm.reset();
    },
    validateEditContactForm(){
      this.$refs.editContactForm.validate();
    },
    openContactEditForm(contact){
      this.expandEdit = !this.expandEdit;
      this.populateContactEditForm(contact);
    },
    populateContactEditForm(contact){
      this.contactEdit = _.cloneDeep(contact);

      //we need to substring date because date picker does not like timestamps
      this.contactEdit.effectiveDate = this.contactEdit?.effectiveDate?.substring(0, 10) || null;
      this.contactEdit.expiryDate = this.contactEdit?.expiryDate?.substring(0, 10) || null;
    },
    formatEffectiveDisplayDate (effectiveDate) {
      if (!effectiveDate) return null;
      const [year, month, day] = effectiveDate.split('-');
      return `${year}/${month}/${day}`;
    },
    isNumber: function(evt) {
      let charCode = (evt.which) ? evt.which : evt.keyCode;
      if ((charCode > 31 && (charCode < 48 || charCode > 57)) && charCode !== 46) {
        evt.preventDefault();
      } else {
        return true;
      }
    },
    endDateRuleValidator() {
      if (this.contactEdit.effectiveDate && this.contactEdit.expiryDate) {
        const effDate = LocalDate.parse(this.contactEdit.effectiveDate);
        const expDate = LocalDate.parse(this.contactEdit.expiryDate);
        return expDate.isAfter(effDate) || 'End date cannot be before start date';
      }

      return true;
    },
    saveEditContactExpiryDate(date) {
      this.$refs.editContactExpiryDateFilter.save(date);
    },
    saveEditContactEffectiveDate(date) {
      this.$refs.editContactEffectiveDateFilter.save(date);
    },
    formatDate,
    formatPhoneNumber,
    getStatusColor,
  },
  watch: {
    'contactEdit.effectiveDate': {
      handler() {
        this.validateEditContactForm();
      }
    }
  }
};
</script>
