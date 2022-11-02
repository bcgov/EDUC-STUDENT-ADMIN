<template>
  <v-container class="containerSetup" fluid>
    <v-row v-if="loading">
      <v-col class="d-flex justify-center">
        <v-progress-circular
            class="mt-16"
            :size="70"
            :width="7"
            color="primary"
            indeterminate
            :active="loading"
        ></v-progress-circular>
      </v-col>
    </v-row>
    <template v-if="!loading">
      <v-row>
        <v-col class="mt-1 d-flex justify-start">
          <v-icon class="mt-1" small color="#1976d2">mdi-arrow-left</v-icon>
          <a class="ml-1 mt-1" @click="backButtonClick">Return to Authority List</a>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" class="d-flex justify-start">
          <v-row no-gutters>
            <v-col cols="12">
              <h2 id="authorityNameAndNumber" class="subjectHeading">{{authority.authorityNumber}} - {{authority.displayName}}</h2>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
      <v-row cols="2">
        <v-col class="d-flex justify-start">
          <v-chip class="mr-3" color="#A9D18E">Active</v-chip>
          <v-chip class="mr-3" color="#9DC3E6">Pending Start Date</v-chip>
          <v-chip color="#F4B183">Pending End Date</v-chip>
        </v-col>
        <v-col class="d-flex justify-end">
          <PrimaryButton icon-left width="11em" icon="mdi-plus-thick" text="New Contact"></PrimaryButton>
        </v-col>
      </v-row>
      <div v-for="authorityContactType in authorityContactTypes" :key="authorityContactType.code">
        <v-row>
          <v-col>
            <h2 id="authorityTypeLabel" style="color:#1A5A96">{{authorityContactType.label}}</h2>
          </v-col>
        </v-row>
        <v-row cols="2" v-if="authorityContacts.has(authorityContactType.authorityContactTypeCode)">
          <v-col cols="5" lg="4" v-for="contact in authorityContacts.get(authorityContactType.authorityContactTypeCode)" :key="contact.independentAuthorityId">
            <v-card v-show="!expandEdit">
              <v-card-title class="pb-0">
                <v-row no-gutters>
                  <v-col>
                    <v-row no-gutters>
                      <v-col cols="8">
                        <v-icon class="pb-1" :color="getStatusColor(contact)" left dark>
                          mdi-circle-medium
                        </v-icon>
                        <strong style="word-break: break-word;" id="authorityContactName">{{ `${contact.firstName} ${contact.lastName}` }}</strong>
                      </v-col>
                      <v-col cols="4" class="d-flex justify-end">
                        <PrimaryButton icon-left width="6em" secondary icon="mdi-pencil" text="Edit" id="editContactButton" @click.native="openContactEditForm(contact)"></PrimaryButton>
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
                <v-form
                  ref="editContactForm"
                  v-model="ecFormValid">
                  <v-row no-gutters class="justify-end mt-n2 pr-2 pt-2">
                    <v-col cols="12" class="d-flex justify-end">
                      <PrimaryButton class="mr-3" id="cancelEditButton" :secondary="true" @click.native="cancelContactEdit"
                                     text="Cancel"></PrimaryButton>
                      <PrimaryButton @click.native="saveAuthorityContact(contactEdit)" id="saveEditButton" :disabled="!ecFormValid" text="Save"></PrimaryButton>
                    </v-col>
                  </v-row>
                  <v-col>
                    <v-row>
                      <v-col>
                        <v-text-field id="contactEditFirstName"
                                      v-model="contactEdit.firstName"
                                      :rules="[rules.required()]"
                                      label="First Name"
                                      type="text"
                                      maxlength="255"
                                      required></v-text-field>
                      </v-col>
                      <v-col>
                        <v-text-field id="contactEditLastName"
                                      v-model="contactEdit.lastName"
                                      :rules="[rules.required()]"
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
                                      :rules="[rules.required(), rules.email()]"
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
                                      :rules="[rules.required(), rules.phoneNumber()]"
                                      label="Phone"
                                      type="text"
                                      maxlength="10"
                                      @keypress="isNumber($event)"
                                      required></v-text-field>
                      </v-col>
                      <v-col>
                        <v-text-field id="contactEditPhoneExt"
                                      v-model="contactEdit.phoneExtension"
                                      :rules="[rules.number()]"
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
                                      :rules="[rules.phoneNumber()]"
                                      label="Alternative Phone"
                                      type="text"
                                      maxlength="10"
                                      @keypress="isNumber($event)"></v-text-field>
                      </v-col>
                      <v-col>
                        <v-text-field id="contactEditAltPhoneExt"
                                      v-model="contactEdit.alternatePhoneExtension"
                                      :rules="[rules.number()]"
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
                              id="contactEditStartDate"
                              v-model="contactEdit.effectiveDate"
                              label="Start Date"
                              hint="YYYY/MM/DD format"
                              :rules="[rules.required()]"
                              class="pt-0 mt-0"
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
                  </v-col>
                </v-form>
              </v-card>
            </v-expand-transition>
          </v-col>
        </v-row>
        <v-row cols="2" v-else>
          <v-col>
            <p>No contacts of this type have been listed.</p>
          </v-col>
        </v-row>
      </div>
    </template>
  </v-container>
</template>

<script>

import ApiService from '../../common/apiService';
import {Routes} from '@/utils/constants';
import PrimaryButton from '../util/PrimaryButton';
import alertMixin from '@/mixins/alertMixin';
import {formatPhoneNumber, formatDate} from '@/utils/format';
import {getStatusColor, isExpired} from '@/utils/institute/status';
import {mapGetters} from 'vuex';
import * as Rules from '@/utils/institute/formRules';

export default {
  name: 'AuthorityContactPage',
  mixins: [alertMixin],
  components: {
    PrimaryButton,
  },
  data() {
    return {
      loadingCount: 0,
      authorityContactTypes: [],
      authorityContacts: new Map(),
      authority: {},
      expandEdit: false,
      saveEnabled: true,
      ecFormValid: false,
      effDateMenu: false,
      expDateMenu: false,
      editContactExpiryDatePicker: null,
      editContactEffectiveDatePicker: null,
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
      contactOG: '',
    };
  },
  created() {
    this.getThisAuthorityContacts();
    this.getAuthorityContactTypeCodes();
  },
  computed: {
    ...mapGetters('auth', ['isAuthenticated','userInfo']),
    loading() {
      return this.loadingCount !== 0;
    },
    computedEffDateFormatted () {
      return this.formatEffectiveDisplayDate(this.contactEdit.effectiveDate?.substring(0,10));
    },
    computedExpDateFormatted () {
      return this.formatEffectiveDisplayDate(this.contactEdit.expiryDate?.substring(0,10));
    }
  },
  methods: {
    getThisAuthorityContacts() {
      this.loadingCount += 1;

      ApiService.apiAxios.get(`${Routes.institute.AUTHORITY_DATA_URL}/${this.$route.params.authorityID}`)
        .then(response => {
          this.authorityContacts = new Map();
          this.authority = response.data;
          response.data.contacts.forEach(contact => {
            if (!isExpired(contact.expiryDate)) {
              if (!this.authorityContacts.has(contact.authorityContactTypeCode)) {
                this.authorityContacts.set(contact.authorityContactTypeCode, [contact]);
                return;
              }
              this.schoolContacts.get(contact.authorityContactTypeCode).push(contact);
            }
          });
        })
        .catch(error => {
          console.log(error);
          this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while trying to get Authority by ID. Please try again later.');
        })
        .finally(() => {
          this.loadingCount -= 1;
        });
    },
    saveAuthorityContact(contact) {
      this.loading = true;
      this.validateEditContactForm();

      contact.independentAuthorityId = this.$route.params.authorityID;
      contact.createDate = null;
      contact.updateDate = null;
      contact.updateUser = this.userInfo.userName;
      if(contact.effectiveDate.length <= 10) {
        contact.effectiveDate = contact.effectiveDate + 'T00:00:00';
      }
      if (contact.expiryDate !== null && contact.expiryDate !== '') {
        contact.expiryDate = contact.expiryDate + 'T00:00:00';
      }

      const payload = contact;
      ApiService.apiAxios.put(`${Routes.institute.AUTHORITY_DATA_URL}/${this.$route.params.authorityID}/contact/${payload.authorityContactId}`, payload)
        .then(() => {
          this.setSuccessAlert('Success! The authority contact has been updated.');
        })
        .catch(error => {
          console.error(error);
          this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while saving the authority contact information. Please try again later.');
        })
        .finally(() => {
          this.getThisAuthorityContacts();
          this.cancelContactEdit();
          this.contactEdit = '';
        });
    },
    cancelContactEdit(){
      this.expandEdit = !this.expandEdit;
    },
    validateEditContactForm(){
      this.$refs.editContactForm[0].validate();
    },
    openContactEditForm(contact){
      this.expandEdit = !this.expandEdit;
      this.populateContactEditForm(contact);
    },
    populateContactEditForm(contact){
      this.contactEdit = _.cloneDeep(contact);
      this.contactOG = _.cloneDeep(contact);

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
    saveEditContactEffectiveDate(date) {
      this.$refs.editContactEffectiveDateFilter.save(date);
    },
    saveEditContactExpiryDate(date) {
      this.$refs.editContactExpiryDateFilter.save(date);
    },
    getAuthorityContactTypeCodes() {
      this.loadingCount += 1;

      ApiService.apiAxios.get(Routes.cache.AUTHORITY_CONTACT_TYPES_URL)
        .then(response => {
          this.authorityContactTypes = response.data;
        })
        .catch(error => {
          console.error(error);
          this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while trying to get the details of available Authority Contact Type Codes. Please try again later.');
        }).finally(() => {
          this.loadingCount -= 1;
        });
    },
    backButtonClick() {
      this.$router.push({name: 'instituteAuthoritiesList'});
    },
    formatDate,
    formatPhoneNumber,
    getStatusColor
  }
};

</script>
<style scoped>
@media screen and (max-width: 950px){
  .v-dialog__content /deep/ .v-bottom-sheet {
    width: 60% !important;
  }
}
.containerSetup{
  padding-right: 32em !important;
  padding-left: 32em !important;
}
@media screen and (max-width: 1950px) {
  .containerSetup{
    padding-right: 20em !important;
    padding-left: 20em !important;
  }
}
@media screen and (max-width: 1200px) {
  .containerSetup{
    padding-right: 4em !important;
    padding-left: 4em !important;
  }
}
</style>
