<template>
  <span>
    <v-card height="100%"  v-show="!expandEdit">
      <v-card-title class="pb-0">
        <v-row no-gutters>
          <v-col>
            <v-row no-gutters>
              <v-col cols="8" class="justify-start">
                <v-icon class="pb-1" small :color="getStatusColor(contact)" left dark>
                  mdi-circle
                </v-icon>
                <strong style="word-break: break-word;">{{ formatContactName(contact) }}</strong>
              </v-col>
              <v-col cols="4" class="d-flex justify-end">
                  <v-btn id="editContactButton"
                         title="Edit"
                         color="white"
                         width="0.5em"
                         min-width="0.5em"
                         depressed
                         v-if="canEditDistrictContact"
                         @click="openContactEditForm(contact)"
                         small
                         class="mr-2"
                  >
                    <v-icon size="x-large" color="#003366" dark>mdi-pencil</v-icon>
                  </v-btn>
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col cols="12" class="pt-1">
                <strong style="word-break: break-word;">{{ contact.jobTitle }}</strong>
              </v-col>
              <v-col v-if="!contact.email && !contact.phoneNumber" cols="12" class="pt-1">
                <p class="missing-highlight"><v-icon size="x-large" color="#ff5252" dark>mdi-alert</v-icon> Missing contact details</p>
                <a class="editField" @click="openContactEditForm(contact)">+ email or phone</a>
              </v-col>
              <v-col v-if="contact.email" cols="12" class="pt-1">
                <span id="contactEmail"> {{ contact.email }}</span>
              </v-col>
              <v-col v-if="contact.phoneNumber" cols="12" class="pt-1">
                <span id="contactPhoneNumber">{{ formatPhoneNumber(contact.phoneNumber) }}</span><span v-if="contact.phoneExtension"> ext. {{contact.phoneExtension}}</span>
              </v-col>
              <v-col cols="12" class="pt-1" v-if="contact.alternatePhoneNumber">
                <span id="contactAlternatePhoneNumber">{{ formatPhoneNumber(contact.alternatePhoneNumber) }} (alt.)</span> <span v-if="contact.alternatePhoneExtension"> ext. {{contact.alternatePhoneExtension}}</span>
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
            <span id="contactEffectiveAndExpiryDate"> {{ formatDate(contact.effectiveDate) }} - {{ formatDate(contact.expiryDate)}}</span>
          </v-col>
          <v-col cols="12" class="pt-1" v-else>
            <v-icon aria-hidden="false">
              mdi-calendar-today
            </v-icon>
            <span id="contactEffectiveDate"> {{ formatDate(contact.effectiveDate) }}</span>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    <v-expand-transition>
      <v-card v-show="expandEdit">
        <v-card-actions class="justify-end">
          <PrimaryButton id="cancelEditButton" :secondary="true" @click.native="closeDistrictContactEdit"
                         text="Cancel"></PrimaryButton>
          <PrimaryButton @click.native="saveDistrictContact(contactEdit)" id="saveEditButton" :disabled="!ecFormValid" :loading="processing" text="Save"></PrimaryButton>
        </v-card-actions>
        <v-card-text>
          <v-form
              ref="editContactForm"
              v-model="ecFormValid">
            <v-row>
              <v-col>
                <v-text-field id="contactEditFirstName"
                              v-model="contactEdit.firstName"
                              label="First Name"
                              type="text"
                              maxlength="255"
                              ></v-text-field>
              </v-col>
              <v-col>
                <v-text-field id="contactEditLastName"
                              v-model="contactEdit.lastName"
                              :rules="[rules.required()]"
                              label="Last Name"
                              type="text"
                              maxlength="255"
                              ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-text-field id="contactEditJobTitle"
                              v-model="contactEdit.jobTitle"
                              label="Title"
                              type="text"
                              maxlength="255"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-text-field id="contactEditEmail"
                              v-model="contactEdit.email"
                              :rules="[rules.required(), rules.email()]"
                              label="Email"
                              type="text"
                              maxlength="255"
                              ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-text-field id="contactEditPhoneNumber"
                              v-model="contactEdit.phoneNumber"
                              :rules="[rules.required(), rules.phoneNumber()]"
                              label="Phone"
                              type="text"
                              maxlength="10"
                              @keypress="isNumber($event)"
                              ></v-text-field>
              </v-col>
              <v-col>
                <v-text-field id="contactEditPhoneExt"
                              :rules="[rules.number()]"
                              v-model="contactEdit.phoneExtension"
                              label="Ext"
                              type="text"
                              maxlength="10"
                              @keypress="isNumber($event)"></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-text-field id="contactEditAltPhoneNumber"
                              :rules="[rules.phoneNumber()]"
                              v-model="contactEdit.alternatePhoneNumber"
                              label="Alternative Phone"
                              type="text"
                              maxlength="10"
                              @keypress="isNumber($event)"></v-text-field>
              </v-col>
              <v-col>
                <v-text-field id="contactEditAltPhoneExt"
                              :rules="[rules.number()]"
                              v-model="contactEdit.alternatePhoneExtension"
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
                        :rules="[rules.required()]"
                        class="pt-0 mt-0"
                        v-model="contactEdit.effectiveDate"
                        label="Start Date"
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
                        :rules="[rules.endDateRule(contactEdit.effectiveDate, contactEdit.expiryDate)]"
                        class="pt-0 mt-0"
                        v-model="contactEdit.expiryDate"
                        label="End Date"
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
  </span>
</template>

<script>
import ApiService from '../../common/apiService';
import {Routes} from '@/utils/constants';
import PrimaryButton from '../util/PrimaryButton';
import alertMixin from '@/mixins/alertMixin';
import {formatPhoneNumber, formatDate, formatContactName} from '@/utils/format';
import {getStatusColor} from '@/utils/institute/status';
import * as Rules from '@/utils/institute/formRules';
import {isNumber} from '@/utils/institute/formInput';

export default {
  name: 'DistrictContact',
  mixins: [alertMixin],
  components: {
    PrimaryButton,
  },
  props: {
    districtID: {
      type: String,
      required: true
    },
    contact: {
      type: Object,
      required: true
    },
    canEditDistrictContact: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      processing: false,
      district: {},
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
      rules: Rules,
      editContactExpiryDatePicker: null,
      editContactEffectiveDatePicker: null,
    };
  },
  methods: {
    saveDistrictContact(contact) {
      this.processing = true;
      this.validateEditContactForm();

      contact.districtId = this.districtID;

      ApiService.apiAxios.put(Routes.institute.DISTRICT_CONTACT_URL + '/' + contact.districtContactId, contact)
        .then(() => {
          this.setSuccessAlert('Success! The district contact has been updated.');
          this.closeDistrictContactEdit();
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
    closeDistrictContactEdit(){
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
    saveEditContactExpiryDate(date) {
      this.$refs.editContactExpiryDateFilter.save(date);
    },
    saveEditContactEffectiveDate(date) {
      this.$refs.editContactEffectiveDateFilter.save(date);
    },
    formatDate,
    formatPhoneNumber,
    getStatusColor,
    isNumber,
    formatContactName
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
<style scoped>
.editField {
  font-size: 16px;
  color: rgb(0, 51, 102);
  vertical-align: super;
}

.editField:hover {
  text-decoration: underline;
}

.missing-highlight {
  color: #ff5252;
  word-break: break-word;
  font-size: 16px;
}
</style>
