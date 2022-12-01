<template>
  <v-form ref="districtDetailsForm" v-model="districtDetailsFormValid">
    <v-container class="containerSetup" fluid>
      <v-row>
        <v-col class="mt-1 d-flex justify-start">
          <v-icon small color="#1976d2">mdi-arrow-left</v-icon>
          <a class="ml-1" @click="backButtonClick">Return to District List</a>
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
              <h2 id="districtName">{{ district.districtNumber }} - {{ district.displayName }}</h2>
            </v-col>
            <v-col class="d-flex" v-else>
              <h2 id="districtNumber">{{ district.districtNumber }} - </h2>
              <v-text-field class="mt-n5 ml-3" style="font-size: x-large" :maxlength="255" :rules="[rules.required()]" required v-model="districtDetailsCopy.displayName">
              </v-text-field>
            </v-col>
            <v-col v-if="!editing" cols="6" class="d-flex justify-end">
              <PrimaryButton id="districtDetailsEditButton" icon-left width="6em" icon="mdi-pencil" text="Edit"
                             :disabled="!canEditDistrictDetails()" @click.native="toggleEdit"></PrimaryButton>
            </v-col>
            <v-col v-else cols="6" class="d-flex justify-end">
              <PrimaryButton class="mr-2" secondary id="cancelButton" icon-left width="6em" text="Cancel"
                             @click.native="cancelClicked"></PrimaryButton>
              <PrimaryButton id="saveButton" icon-left width="6em" text="Save" :disabled="!districtDetailsFormValid"
                             @click.native="updateDistrictDetails"></PrimaryButton>
            </v-col>
          </v-row>
          <v-row class="d-flex justify-start">
            <v-col  lg="2" sm="4">
              <v-icon class="pb-1" :color="getStatusColor()" right dark>
                mdi-circle-medium
              </v-icon>
              <span>{{getStatusText()}}</span>
            </v-col>
            <v-col class="d-flex">
              <v-icon aria-hidden="false" class="mb-1 mr-1">
                mdi-phone-outline
              </v-icon>
              <span v-if="!editing" class="ml-n1">{{ formatPhoneNumber(district.phoneNumber) }}</span>
              <v-text-field id="districtDetailsPhoneNumber" v-else class="shrink py-0" @keypress="isNumber($event)" required :maxlength="10" :rules="[rules.required(), rules.phoneNumber()]" v-model="districtDetailsCopy.phoneNumber"/>
            </v-col>
            <v-col class="d-flex">
              <v-icon aria-hidden="false" class="mb-1 mr-1">
                mdi-at
              </v-icon>
              <span v-if="!editing" class="ml-n1">{{ district.email }}</span>
              <v-text-field id="districtDetailsEmail" v-else class="py-0" required :rules="[rules.required(), rules.email()]" :maxlength="255" v-model="districtDetailsCopy.email"/>
            </v-col>
            <v-col class="d-flex">
              <v-icon aria-hidden="false" class="mb-1 mr-1">
                mdi-fax
              </v-icon>
              <span v-if="!editing" class="ml-n1">{{ formatPhoneNumber(district.faxNumber) }}</span>
              <v-text-field id="districtDetailsFaxNumber" v-else class="shrink py-0" @keypress="isNumber($event)" :rules="[rules.phoneNumber('Fax number must be valid')]" :maxlength="10" v-model="districtDetailsCopy.faxNumber"/>
            </v-col>
            <v-col class="d-flex">
              <v-icon class="mb-1 mr-1" aria-hidden="false">
                mdi-web
              </v-icon>
              <a v-if="cleanWebsiteUrl && !editing" :href="cleanWebsiteUrl" target="_blank">{{ cleanWebsiteUrl }}</a>
              <v-text-field v-if="editing" class="py-0" :rules="[rules.website()]" :maxlength="255" v-model="districtDetailsCopy.website"/>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-divider class="divider"></v-divider>
            </v-col>
          </v-row>
          <v-row class="d-flex justify-start">
            <v-col cols="12" class="d-flex justify-start">
              <h2>Addresses</h2>
            </v-col>
          </v-row>
          <v-row no-gutters class="d-flex justify-start">
            <v-col v-if="editing || hasMailingAddress()" cols="3">
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
                      <span style="word-break: break-all;">{{ getMailingAddressItem('addressLine1') }}</span>
                    </v-col>
                  </v-row>
                  <v-row no-gutters>
                    <v-col class="ml-9">
                      <span style="word-break: break-all;">{{ getMailingAddressItem('addressLine2') }}</span>
                    </v-col>
                  </v-row>
                  <v-row no-gutters>
                    <v-col class="ml-9">
                      <span style="word-break: break-all;">{{ getMailingAddressItem('city') + ', ' + getMailingAddressItem('provinceCode')  + ', ' + getMailingAddressItem('countryCode') }}</span>
                    </v-col>
                  </v-row>
                  <v-row no-gutters>
                    <v-col class="ml-9">
                      <span style="word-break: break-all;">{{ getMailingAddressItem('postal') }}</span>
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
                      <v-text-field id="mailAddressLine1" required :rules="[rules.required()]" :maxlength="255" class="shrink mt-n5 mb-3" v-model="getMailingAddressCopy()[0].addressLine1">
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
                      <v-text-field id="mailAddressCity" required :rules="[rules.required()]" class="shrink mt-n5 mb-3" :maxlength="255" v-model="getMailingAddressCopy()[0].city">
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
                        :rules="[rules.required()]"
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
                        :rules="[rules.required()]"
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
                      <v-text-field :maxlength="6" required :rules="[rules.required(), rules.postalCode()]"  id="mailAddressPostal" class="shrink mt-n5 mb-3" v-model="getMailingAddressCopy()[0].postal">
                      </v-text-field>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
            </v-col>
            <v-col v-else cols="3">
              <v-row no-gutters>
                <v-col class="d-flex justify-start">
                  <span>Not Provided</span>
                </v-col>
              </v-row>
            </v-col>
            <v-col cols="3">
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
                      <span style="word-break: break-all;">{{ getPhysicalAddressItem('addressLine1') }}</span>
                    </v-col>
                  </v-row>
                  <v-row no-gutters>
                    <v-col class="ml-9">
                      <span style="word-break: break-all;">{{ getPhysicalAddressItem('addressLine2') }}</span>
                    </v-col>
                  </v-row>
                  <v-row no-gutters>
                    <v-col class="ml-9">
                      <span style="word-break: break-all;">{{ getPhysicalAddressItem('city') + ', ' + getPhysicalAddressItem('provinceCode')  + ', ' + getPhysicalAddressItem('countryCode') }}</span>
                    </v-col>
                  </v-row>
                  <v-row no-gutters>
                    <v-col class="ml-9">
                      <span style="word-break: break-all;">{{ getPhysicalAddressItem('postal') }}</span>
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
                                      <v-text-field id="physicalAddressLine1" required :rules="[rules.required()]" :maxlength="255" class="shrink mt-n5 mb-3" v-model="getPhysicalAddressCopy()[0].addressLine1">
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
                                      <v-text-field id="physicalAddressCity" required :rules="[rules.required()]" :maxlength="255" class="shrink mt-n5 mb-3" v-model="getPhysicalAddressCopy()[0].city">
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
                                        :rules="[rules.required()]"
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
                                        :rules="[rules.required()]"
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
                                      <v-text-field id="physicalAddressPostal" required :rules="[rules.required(), rules.postalCode()]" :maxlength="6" class="shrink mt-n5 mb-3" v-model="getPhysicalAddressCopy()[0].postal">
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
import {formatPhoneNumber} from '@/utils/format';
import router from '@/router';
import { sanitizeUrl } from '@braintree/sanitize-url';
import {mapGetters, mapState} from 'vuex';
import {deepCloneObject} from '@/utils/common';
import * as Rules from '@/utils/institute/formRules';
import {isNumber} from '@/utils/institute/formInput';

export default {
  name: 'DistrictDetails',
  mixins: [alertMixin],
  components: {
    PrimaryButton
  },
  props: {
    districtID: {
      type: String,
      required: true,
    }
  },
  data() {
    return {
      district: null,
      rules: Rules,
      loading: false,
      cleanWebsiteUrl: '',
      editing: false,
      districtDetailsFormValid: true,
      districtDetailsCopy: {},
      provinceCodeValues: [],
      countryCodeValues: [],
      sameAsMailingCheckbox: true
    };
  },
  computed:{
    ...mapGetters('auth', ['DISTRICT_ADMIN_ROLE']),
    ...mapState('institute', ['provinceCodes']),
    ...mapState('institute', ['countryCodes']),
    hasSamePhysicalAddress(){
      return !this.district.addresses.filter(address => address.addressTypeCode === 'PHYSICAL').length > 0;
    },
  },
  created() {
    this.getDistrict();
    this.$store.dispatch('institute/getAllProvinceCodes').then(() => {
      this.provinceCodeValues = this.provinceCodes.filter(province =>  province.provinceCode === 'BC' || province.provinceCode === 'YT');
    });
    this.$store.dispatch('institute/getAllCountryCodes').then(() => {
      this.countryCodeValues = this.countryCodes;
    });
  },
  methods: {
    formatPhoneNumber,
    getDistrict() {
      this.loading = true;
      ApiService.apiAxios.get(`${Routes.institute.DISTRICT_DATA_URL}/${this.districtID}`)
        .then(response => {
          this.district = response.data;
          this.cleanWebsiteUrl = this.district.website ? sanitizeUrl(this.district.website) : '';
        }).catch(error => {
          console.error(error);
          this.setFailureAlert(error.response?.data?.message || error.message);
        }).finally(() => {
          this.loading = false;
        });
    },
    async clickSameAsAddressButton(){
      await this.$nextTick();
      this.$refs.districtDetailsForm.validate();
    },
    cancelClicked(){
      this.editing = false;
      this.setHasSamePhysicalFlag();
    },
    setHasSamePhysicalFlag(){
      this.sameAsMailingCheckbox = this.hasSamePhysicalAddress;
    },
    async toggleEdit(){
      this.districtDetailsCopy = this.deepCloneObject(this.district);
      this.addAddressesIfRequired(this.districtDetailsCopy);
      this.editing = !this.editing;
      await this.$nextTick();
      this.$refs.districtDetailsForm.validate();
    },
    getStatusColor() {
      if (this.district.districtStatusCode === 'ACTIVE') {
        return 'green';
      } else {
        return 'red';
      }
    },
    canEditDistrictDetails(){
      return this.DISTRICT_ADMIN_ROLE;
    },
    addAddressesIfRequired(district){
      let addresses = district.addresses;
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
    async updateDistrictDetails() {
      this.loading = true;

      if(this.sameAsMailingCheckbox){
        this.districtDetailsCopy.addresses = this.districtDetailsCopy.addresses.filter(address => address.addressTypeCode === 'MAILING');
      }
      ApiService.apiAxios.put(`${Routes.institute.DISTRICT_DATA_URL}` + '/' + this.districtDetailsCopy.districtId, this.districtDetailsCopy)
        .then(() => {
          this.setSuccessAlert('Success! The district details have been updated.');
        })
        .catch(error => {
          console.error(error);
          this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while saving the district information. Please try again later.');
        })
        .finally(() => {
          this.toggleEdit();
          this.getDistrict();
        });
    },
    deepCloneObject,
    isNumber,
    getStatusText() {
      if (this.district.districtStatusCode === 'ACTIVE') {
        return 'Active';
      } else {
        return 'Inactive';
      }
    },
    hasMailingAddress(){
      return this.district.addresses.filter(address => address.addressTypeCode === 'MAILING').length > 0;
    },
    hasPhysicalAddress(){
      return this.district.addresses?.filter(address => address.addressTypeCode === 'PHYSICAL').length > 0;
    },
    getMailingAddressCopy(){
      return this.districtDetailsCopy.addresses?.filter(address => address.addressTypeCode === 'MAILING');
    },
    getPhysicalAddressCopy(){
      return this.districtDetailsCopy.addresses?.filter(address => address.addressTypeCode === 'PHYSICAL');
    },
    getMailingAddressItem(item){
      let mailingAddress = this.district.addresses.filter(address => address.addressTypeCode === 'MAILING');
      for (const x in mailingAddress[0]) {
        if(x === item){
          return mailingAddress[0][item];
        }
      }
    },
    getPhysicalAddressItem(item){
      let physicalAddress = this.district.addresses.filter(address => address.addressTypeCode === 'PHYSICAL');
      for (const x in physicalAddress[0]) {
        if(x === item){
          return physicalAddress[0][item];
        }
      }
    },
    backButtonClick() {
      router.push({name: 'instituteDistrict'});
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
