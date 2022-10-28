<template>
  <v-form ref="authorityForm" v-model="authorityFormValid">
    <v-container class="containerSetup" fluid>
      <v-row>
        <v-col class="mt-1 d-flex justify-start">
          <v-icon small color="#1976d2">mdi-arrow-left</v-icon>
          <a class="ml-1" @click="backButtonClick">Return to Authority List</a>
        </v-col>
      </v-row>
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
      <v-row v-else no-gutters>
          <v-col>
            <v-row  class="d-flex justify-start">
              <v-col v-if="!editing" cols="6" class="d-flex justify-start">
                <h2 id="authorityName">{{ authority.authorityNumber }} - {{ authority.displayName }}</h2>
              </v-col>
              <v-col class="d-flex" v-else>
                <h2 id="authorityName">{{ authority.authorityNumber }} - </h2>
                <v-text-field class="mt-n5 ml-3" style="font-size: x-large" :maxlength="255" :rules="authNameRules" required v-model="authorityCopy.displayName">
                </v-text-field>
              </v-col>
              <v-col v-if="!editing" cols="6" class="d-flex justify-end">
                <PrimaryButton id="editButton" icon-left width="6em" icon="mdi-pencil" text="Edit" :disabled="!canEditAuthorities()" @click.native="toggleEdit"></PrimaryButton>
              </v-col>
              <v-col v-else cols="6" class="d-flex justify-end">
                <PrimaryButton class="mr-2" secondary id="cancelButton" icon-left width="6em" text="Cancel" @click.native="editing = !editing"></PrimaryButton>
                <PrimaryButton id="saveButton" icon-left width="6em" text="Save" :disabled="!authorityFormValid" @click.native="saveAuthority"></PrimaryButton>
              </v-col>
            </v-row>
            <v-row class="d-flex justify-start">
              <v-col class="d-flex">
                <v-icon class="pb-1" :color="getStatusColorAuthorityOrSchool(this.authority.status)" right dark>
                  mdi-circle-medium
                </v-icon>
                <span v-if="!editing">{{this.authority.status}}</span>
                <span v-else class="mt-5">{{this.authority.status}}</span>
              </v-col>
              <v-col class="d-flex">
                <v-icon class="mb-1 mr-1" aria-hidden="false">
                  mdi-phone-outline
                </v-icon>
                <span v-if="!editing">{{ formatPhoneNumber(authority.phoneNumber) }}</span>
                <v-text-field v-else class="shrink py-0" @keypress="isNumber($event)" required :maxlength="10" :rules="phNumRules" v-model="authorityCopy.phoneNumber">
                </v-text-field>
              </v-col>
              <v-col class="d-flex">
                <v-icon class="mb-1 mr-1" aria-hidden="false">
                  mdi-at
                </v-icon>
                <span v-if="!editing">{{ authority.email }}</span>
                <v-text-field v-else class="py-0" required :rules="emailRules" :maxlength="255" v-model="authorityCopy.email">
                </v-text-field>
              </v-col>
              <v-col class="d-flex">
                <v-icon class="mb-1 mr-1" aria-hidden="false">
                  mdi-fax
                </v-icon>
                <span v-if="!editing">{{ formatPhoneNumber(authority.faxNumber) }}</span>
                <v-text-field v-else class="shrink py-0" @keypress="isNumber($event)" :rules="faxNumRules" :maxlength="10" v-model="authorityCopy.faxNumber">
                </v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-divider class="divider"></v-divider>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <h2 class="subjectHeading pt-4">Authority Details</h2>
              </v-col>
            </v-row>
            <v-row class="pl-3">
              <v-col cols="4" lg="3" class="pb-0 pt-0">
                <v-row no-gutters>
                  <v-col cols="10" class="pt-2 pr-0">
                    <span style="color: grey">Open Date</span>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="10" class="pb-1 pr-0">
                    <span class="ministryLine" style="color: black">{{ formatDate(authority.openedDate) || '-' }}</span>
                  </v-col>
                </v-row>
              </v-col>
              <v-col cols="4" lg="3" class="pb-0 pt-0">
                <v-row no-gutters>
                  <v-col cols="10" class=" pt-2 pr-0">
                    <span style="color: grey">Close Date</span>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="10" class="pb-1 pr-0">
                    <span class="ministryLine" style="color: black">{{ formatDate(authority.closedDate) || '-'}}</span>
                  </v-col>
                </v-row>
              </v-col>
              <v-col cols="4" lg="3" class="pb-0 pt-0">
                <v-row no-gutters>
                  <v-col cols="10" class="pt-2 pr-0">
                    <span style="color: grey">Authority Type</span>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="10" class="pb-1 pr-0">
                    <span v-if="!editing" class="ministryLine" style="color: black">{{ this.authority.type }}</span>
                    <v-select
                      v-else
                      id="authoritySelect"
                      :items="this.authorityTypes"
                      item-text="label"
                      item-value="authorityTypeCode"
                      v-model="authorityCopy.authorityTypeCode"
                      dense
                      outlined
                      class="ministryLine mt-n1"
                      style="color: black">
                    </v-select>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
            <v-row class="mt-6 d-flex justify-start">
              <v-col cols="12" class="d-flex justify-start">
                <h2>Addresses</h2>
              </v-col>
            </v-row>
            <v-row no-gutters class="d-flex justify-start">
              <v-col v-if="hasMailingAddress()" cols="3">
                <v-row>
                  <v-col>
                    <v-icon class="pb-1 mr-1" right >
                      mdi-email-outline
                    </v-icon>
                    <span>Mailing Address</span>
                  </v-col>
                </v-row>
                <v-row v-if="!editing" no-gutters>
                  <v-col>
                    <v-row class="ml-9" no-gutters>
                      <v-col>
                        <span>{{ getMailingAddressItem('addressLine1') }}</span>
                      </v-col>
                    </v-row>
                    <v-row no-gutters>
                      <v-col class="ml-9">
                        <span>{{ getMailingAddressItem('addressLine2') }}</span>
                      </v-col>
                    </v-row>
                    <v-row no-gutters>
                      <v-col class="ml-9">
                        <span>{{ getMailingAddressItem('city') + ', ' + getMailingAddressItem('provinceCode')  + ', ' + getMailingAddressItem('countryCode') }}</span>
                      </v-col>
                    </v-row>
                    <v-row no-gutters>
                      <v-col class="ml-9">
                        <span>{{ getMailingAddressItem('postal') }}</span>
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
                <v-row v-else no-gutters>
                  <v-col>
                    <v-row class="ml-9" no-gutters>
                      <v-col style="color: grey">
                        Line 1
                      </v-col>
                    </v-row>
                    <v-row class="ml-9" no-gutters>
                      <v-col cols="8">
                        <v-text-field id="mailAddressLine1" required :rules="addressLine1Rules" :maxlength="255" class="shrink mt-n5 mb-3" v-model="getMailingAddressCopy()[0].addressLine1">
                        </v-text-field>
                      </v-col>
                    </v-row>
                    <v-row class="ml-9" no-gutters>
                      <v-col style="color: grey">
                        Line 2
                      </v-col>
                    </v-row>
                    <v-row class="ml-9" no-gutters>
                      <v-col cols="8">
                        <v-text-field id="mailAddressLine2" class="shrink mt-n5 mb-3" :maxlength="255" v-model="getMailingAddressCopy()[0].addressLine2">
                        </v-text-field>
                      </v-col>
                    </v-row>
                    <v-row class="ml-9" no-gutters>
                      <v-col style="color: grey">
                        City
                      </v-col>
                    </v-row>
                    <v-row class="ml-9" no-gutters>
                      <v-col cols="8">
                        <v-text-field id="mailAddressCity" required :rules="cityRules" class="shrink mt-n5 mb-3" :maxlength="255" v-model="getMailingAddressCopy()[0].city">
                        </v-text-field>
                      </v-col>
                    </v-row>
                    <v-row class="ml-9" no-gutters>
                      <v-col style="color: grey">
                        Province
                      </v-col>
                    </v-row>
                    <v-row class="ml-9" no-gutters>
                      <v-col cols="8" class="d-flex">
                        <v-select
                          id="mailAddressProvince"
                          :items="this.provinceCodeValues"
                          item-text="label"
                          item-value="provinceCode"
                          v-model="getMailingAddressCopy()[0].provinceCode"
                          dense
                          outlined
                          :rules="provinceRules"
                          required
                          class="mt-2"
                          style="color: black">
                        </v-select>
                      </v-col>
                    </v-row>
                    <v-row class="ml-9" no-gutters>
                      <v-col style="color: grey">
                        Country
                      </v-col>
                    </v-row>
                    <v-row class="ml-9" no-gutters>
                      <v-col cols="8" class="d-flex">
                        <v-select
                          id="mailAddressCountry"
                          :items="this.countryCodeValues"
                          item-text="label"
                          item-value="countryCode"
                          :rules="countryRules"
                          v-model="getMailingAddressCopy()[0].countryCode"
                          dense
                          outlined
                          class="mt-2 mb-2"
                          style="color: black">
                        </v-select>
                      </v-col>
                    </v-row>
                    <v-row class="ml-9" no-gutters>
                      <v-col style="color: grey">
                        Postal Code
                      </v-col>
                    </v-row>
                    <v-row class="ml-9" no-gutters>
                      <v-col cols="8">
                        <v-text-field :maxlength="6" required :rules="postalRules"  id="mailAddressPostal" class="shrink mt-n5 mb-3" v-model="getMailingAddressCopy()[0].postal">
                        </v-text-field>
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
              </v-col>
              <v-col cols="3" v-if="showPhysicalAddress">
                <v-row>
                  <v-col>
                    <v-icon class="pb-1 mr-1" right >
                      mdi-home-outline
                    </v-icon>
                    <span>Physical Address</span>
                  </v-col>
                </v-row>
                <v-row v-if="!hasSamePhysicalAddress && !editing" no-gutters>
                  <v-col>
                    <v-row no-gutters>
                      <v-col class="ml-9">
                        <span>{{ getPhysicalAddressItem('addressLine1') }}</span>
                      </v-col>
                    </v-row>
                    <v-row no-gutters>
                      <v-col class="ml-9">
                        <span>{{ getPhysicalAddressItem('addressLine2') }}</span>
                      </v-col>
                    </v-row>
                    <v-row no-gutters>
                      <v-col class="ml-9">
                        <span>{{ getPhysicalAddressItem('city') + ', ' + getPhysicalAddressItem('provinceCode')  + ', ' + getPhysicalAddressItem('countryCode') }}</span>
                      </v-col>
                    </v-row>
                    <v-row no-gutters>
                      <v-col class="ml-9">
                        <span>{{ getPhysicalAddressItem('postal') }}</span>
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
                <v-row v-else no-gutters>
                  <v-col>
                    <v-row class="ml-9" no-gutters>
                      <v-col v-if="sameAsMailingCheckbox && !editing" class="fontItalic">
                        <span>Same as Mailing Address</span>
                      </v-col>
                      <v-col v-else>
                        <v-row no-gutters>
                          <v-col>
                            <v-row no-gutters>
                              <v-col>
                                <v-row v-if="!sameAsMailingCheckbox" no-gutters>
                                  <v-col>
                                    <v-row no-gutters>
                                      <v-col style="color: grey">
                                        Line 1
                                      </v-col>
                                    </v-row>
                                    <v-row no-gutters>
                                      <v-col cols="8">
                                        <v-text-field id="physicalAddressLine1" required :rules="addressLine1Rules" :maxlength="255" class="shrink mt-n5 mb-3" v-model="getPhysicalAddressCopy()[0].addressLine1">
                                        </v-text-field>
                                      </v-col>
                                    </v-row>
                                    <v-row no-gutters>
                                      <v-col style="color: grey">
                                        Line 2
                                      </v-col>
                                    </v-row>
                                    <v-row no-gutters>
                                      <v-col cols="8">
                                        <v-text-field id="physicalAddressLine2" :maxlength="255" class="shrink mt-n5 mb-3" v-model="getPhysicalAddressCopy()[0].addressLine2">
                                        </v-text-field>
                                      </v-col>
                                    </v-row>
                                    <v-row no-gutters>
                                      <v-col style="color: grey">
                                        City
                                      </v-col>
                                    </v-row>
                                    <v-row no-gutters>
                                      <v-col cols="8">
                                        <v-text-field id="physicalAddressCity" required :rules="cityRules" :maxlength="255" class="shrink mt-n5 mb-3" v-model="getPhysicalAddressCopy()[0].city">
                                        </v-text-field>
                                      </v-col>
                                    </v-row>
                                    <v-row no-gutters>
                                      <v-col style="color: grey">
                                        Province
                                      </v-col>
                                    </v-row>
                                    <v-row no-gutters>
                                      <v-col cols="8">
                                        <v-select
                                          id="physicalAddressProvince"
                                          :items="this.provinceCodeValues"
                                          item-text="label"
                                          item-value="provinceCode"
                                          v-model="getPhysicalAddressCopy()[0].provinceCode"
                                          dense
                                          required
                                          :rules="provinceRules"
                                          outlined
                                          class="mt-2"
                                          style="color: black">
                                        </v-select>
                                      </v-col>
                                    </v-row>
                                    <v-row no-gutters>
                                      <v-col style="color: grey">
                                        Country
                                      </v-col>
                                    </v-row>
                                    <v-row no-gutters>
                                      <v-col cols="8">
                                        <v-select
                                          id="physicalAddressCountry"
                                          :items="this.countryCodeValues"
                                          item-text="label"
                                          item-value="countryCode"
                                          v-model="getPhysicalAddressCopy()[0].countryCode"
                                          dense
                                          :rules="countryRules"
                                          required
                                          outlined
                                          class="mt-2 mb-2"
                                          style="color: black">
                                        </v-select>
                                      </v-col>
                                    </v-row>
                                    <v-row no-gutters>
                                      <v-col style="color: grey">
                                        Postal Code
                                      </v-col>
                                    </v-row>
                                    <v-row no-gutters>
                                      <v-col cols="8">
                                        <v-text-field id="physicalAddressPostal" required :rules="postalRules" :maxlength="6" class="shrink mt-n5 mb-3" v-model="getPhysicalAddressCopy()[0].postal">
                                        </v-text-field>
                                      </v-col>
                                    </v-row>
                                  </v-col>
                                </v-row>
                                <v-row no-gutters>
                                  <v-col>
                                    <v-checkbox
                                      dense
                                      id="sameAsMailingCheckbox"
                                      @click.native="clickSameAsAddressButton"
                                      v-model="sameAsMailingCheckbox"
                                      label="Same as mailing address"
                                      class="mt-n3 pt-0"
                                    ></v-checkbox>
                                  </v-col>
                                </v-row>
                              </v-col>
                            </v-row>
                          </v-col>
                        </v-row>
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-col>
      </v-row>
    </v-container>
  </v-form>
</template>

<script>

import ApiService from '../../common/apiService';
import {Routes} from '@/utils/constants';
import alertMixin from '@/mixins/alertMixin';
import PrimaryButton from '@/components/util/PrimaryButton';
import {formatPhoneNumber, formatDate} from '@/utils/format';
import {getStatusColorAuthorityOrSchool,getStatusAuthorityOrSchool} from '@/utils/institute/status';
import {mapGetters, mapState} from 'vuex';
import router from '@/router';
import {deepCloneObject} from '@/utils/common';

export default {
  name: 'AuthorityDetailsPage',
  mixins: [alertMixin],
  components: {PrimaryButton},
  props: {
    authorityID: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      sameAsMailingCheckbox: true,
      editing: false,
      authority: null,
      authorityFormValid: false,
      authorityCopy: null,
      loading: false,
      authorityTypes: [],
      provinceCodeValues: [],
      countryCodeValues: [],
      excludeShowingPhysicalAddressesForAuthoritiesOfType: [
        'OFFSHORE',
      ],
      authNameRules: [
        v => !!v || 'Authority name is required'
      ],
      addressLine1Rules: [
        v => !!v || 'Address Line 1 is required'
      ],
      cityRules: [
        v => !!v || 'City is required'
      ],
      provinceRules: [
        v => !!v || 'Province is required'
      ],
      countryRules: [
        v => !!v || 'Country is required'
      ],
      postalRules: [
        v => !!v || 'Postal code is required',
        v => /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z][ -]?\d[ABCEGHJ-NPRSTV-Z]\d$/i.test(v) || 'Postal code must be valid',
      ],
      phNumRules: [
        v => !!v || 'Phone Number is required',
        v => (v && v.length <= 10) || 'Phone Number must be 10 digits',
        v => /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/.test(v) || 'Phone Number must be valid',
      ],
      faxNumRules: [
        v => !v || /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/.test(v) || 'Fax Number must be valid',
      ],
      emailRules: [
        v => !!v || 'E-mail is required',
        v => /^[\w!#$%&’*+/=?`{|}~^-]+(?:\.[\w!#$%&’*+/=?`{|}~^-]+)*@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,6}$/.test(v) || 'E-mail must be valid',
      ],
    };
  },
  computed:{
    ...mapState('institute', ['authorityTypeCodes', 'provinceCodes', 'countryCodes']),
    ...mapGetters('auth', ['INDEPENDENT_AUTHORITY_ADMIN_ROLE']),
    hasSamePhysicalAddress() {
      return !this.authority.addresses.filter(address => address.addressTypeCode === 'PHYSICAL').length > 0;
    },
    showPhysicalAddress() {
      if (this.editing) {
        return !this.excludeShowingPhysicalAddressesForAuthoritiesOfType.includes(this.authorityCopy.authorityTypeCode);
      }
      return !this.excludeShowingPhysicalAddressesForAuthoritiesOfType.includes(this.authority.authorityTypeCode);
    }
  },
  created() {
    this.$store.dispatch('institute/getProvinceCodes').then(() => {
      this.provinceCodeValues = this.provinceCodes.filter(province =>  province.provinceCode === 'BC' || province.provinceCode === 'YT');
    });
    this.$store.dispatch('institute/getCountryCodes').then(() => {
      this.countryCodeValues = this.countryCodes;
    });
    this.$store.dispatch('institute/getAuthorityTypeCodes').then(() => {
      this.authorityTypes = this.authorityTypeCodes;
    });
    this.getAuthority();
  },
  methods: {
    formatPhoneNumber,
    formatDate,
    getStatusColorAuthorityOrSchool,
    populateExtraAuthorityFields(authority) {
      authority.status = getStatusAuthorityOrSchool(authority);
      authority.type = this.getAuthorityType(authority);
    },
    isNumber: function(evt) {
      let charCode = (evt.which) ? evt.which : evt.keyCode;
      if ((charCode > 31 && (charCode < 48 || charCode > 57)) && charCode !== 46) {
        evt.preventDefault();
      } else {
        return true;
      }
    },
    getAuthority() {
      this.loading = true;

      ApiService.apiAxios.get(Routes.institute.AUTHORITY_DATA_URL + '/' + this.authorityID, {
      }).then(response => {
        this.authority = response.data;
        this.populateExtraAuthorityFields(this.authority);
      }).catch(error => {
        console.error(error);
      }).finally(() => {
        this.setHasSamePhysicalFlag();
        this.loading = false;
      });
    },
    backButtonClick() {
      router.push({name: 'instituteAuthoritiesList'});
    },
    deepCloneObject,
    addAddressesIfRequired(authority){
      let addresses = authority.addresses;
      if(!this.hasMailingAddress()){
        addresses.push({
          'createUser': null,
          'updateUser': null,
          'createDate': null,
          'updateDate': null,
          'addressId': null,
          'schoolId': null,
          'districtId': null,
          'independentAuthorityId': null,
          'phoneNumber': null,
          'email': null,
          'addressLine1': null,
          'addressLine2': null,
          'city': null,
          'postal': null,
          'addressTypeCode': 'MAILING',
          'provinceCode': null,
          'countryCode': null
        });
      }
      if(!this.hasPhysicalAddress()){
        addresses.push({
          'createUser': null,
          'updateUser': null,
          'createDate': null,
          'updateDate': null,
          'addressId': null,
          'schoolId': null,
          'districtId': null,
          'independentAuthorityId': null,
          'phoneNumber': null,
          'email': null,
          'addressLine1': null,
          'addressLine2': null,
          'city': null,
          'postal': null,
          'addressTypeCode': 'PHYSICAL',
          'provinceCode': null,
          'countryCode': null
        });
      }
    },
    canEditAuthorities(){
      return this.INDEPENDENT_AUTHORITY_ADMIN_ROLE;
    },
    setHasSamePhysicalFlag(){
      this.sameAsMailingCheckbox = this.hasSamePhysicalAddress;
    },
    async clickSameAsAddressButton(){
      await this.$nextTick();
      this.$refs.authorityForm.validate();
    },
    saveAuthority() {
      this.loading = true;

      if(this.sameAsMailingCheckbox){
        this.authorityCopy.addresses = this.authorityCopy.addresses.filter(address => address.addressTypeCode === 'MAILING');
      }

      const payload = this.authorityCopy;
      ApiService.apiAxios.post(`${Routes.institute.AUTHORITY_DATA_URL}` + '/' + this.authorityCopy.independentAuthorityId, payload)
        .then(() => {
          this.setSuccessAlert('Success! The authority details have been updated.');
        })
        .catch(error => {
          console.error(error);
          this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while saving the authority information. Please try again later.');
        })
        .finally(() => {
          this.toggleEdit();
          this.getAuthority();
        });
    },
    async toggleEdit(){
      this.authorityCopy = this.deepCloneObject(this.authority);
      this.addAddressesIfRequired(this.authorityCopy);
      this.editing = !this.editing;
      await this.$nextTick();
      this.$refs.authorityForm.validate();
    },
    getAuthorityType(authority){
      return this.authorityTypes.find((autorityType) => autorityType.authorityTypeCode === authority.authorityTypeCode).label;
    },
    hasMailingAddress(){
      return this.authority.addresses.filter(address => address.addressTypeCode === 'MAILING').length > 0;
    },
    hasPhysicalAddress(){
      return this.authority.addresses.filter(address => address.addressTypeCode === 'PHYSICAL').length > 0;
    },
    getMailingAddress(){
      return this.authority.addresses.filter(address => address.addressTypeCode === 'MAILING');
    },
    getPhysicalAddress(){
      return this.authority.addresses.filter(address => address.addressTypeCode === 'PHYSICAL');
    },
    getMailingAddressCopy(){
      return this.authorityCopy.addresses.filter(address => address.addressTypeCode === 'MAILING');
    },
    getPhysicalAddressCopy(){
      return this.authorityCopy.addresses.filter(address => address.addressTypeCode === 'PHYSICAL');
    },
    getMailingAddressItem(item){
      let mailingAddress = this.authority.addresses.filter(address => address.addressTypeCode === 'MAILING');
      for (const x in mailingAddress[0]) {
        if(x === item){
          return mailingAddress[0][item];
        }
      }
    },
    getPhysicalAddressItem(item){
      let physicalAddress = this.authority.addresses.filter(address => address.addressTypeCode === 'PHYSICAL');
      for (const x in physicalAddress[0]) {
        if(x === item){
          return physicalAddress[0][item];
        }
      }
    }
  }
};
</script>

<style scoped>
.divider {
  border-color: #FCBA19;
  border-width: medium;
}

.fontBolder{
  font-weight: bolder;
}

.fontItalic{
  font-style: italic;
}

.containerSetup{
  padding-right: 24em !important;
  padding-left: 24em !important;
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
