<template>
  <v-card id="newSchoolVCard">
    <v-card-title class="sheetHeader pt-1 pb-1">New School</v-card-title>
    <v-divider></v-divider>
    <v-card-text>
      <v-form ref="newSchoolForm" v-model="isFormValid">
        <v-row class="d-flex justify-center">
          <v-col>
            <v-text-field
                id='newSchoolNameInput'
                :rules="[rules.required()]"
                v-model="newSchool.schoolName"
                class="pt-0"
                :maxlength="255"
                label="School Name"
            />
            <v-row>
              <v-col cols="4">
                <v-autocomplete
                    id="district-text-field"
                    label="District"
                    :rules="[rules.required()]"
                    item-value="districtId"
                    item-text="districtNumberName"
                    :items="districtNames"
                    v-model="newSchool.districtName"
                    clearable>
                </v-autocomplete>
              </v-col>
              <v-col cols="4">
                <v-autocomplete
                    id="authority-text-field"
                    label="Authority"
                    item-value="authorityID"
                    item-text="authorityCodeName"
                    :items="authorityNames"
                    :disabled="authorityDisabled"
                    :rules="[authorityRule]"
                    v-model="newSchool.authorityName"
                    clearable>
                </v-autocomplete>
              </v-col>
              <v-col cols="4">
                <v-menu
                    id="newSchoolOpenDatePicker"
                    ref="newSchoolOpenDateFilter"
                    :close-on-content-click="false"
                    transition="scale-transition"
                    offset-y
                    min-width="auto"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                        id="newSchoolOpenDateTextField"
                        :rules="[rules.required()]"
                        class="pt-4 mt-0"
                        v-model="newSchool.openDate"
                        label="Open Date"
                        prepend-inner-icon="mdi-calendar"
                        clearable
                        readonly
                        v-bind="attrs"
                        v-on="on"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                      v-model="newSchool.openDate"
                      :active-picker.sync="newSchoolOpenDatePicker"
                      @change="saveNewSchoolOpenDate"
                  ></v-date-picker>
                </v-menu>
              </v-col>
            </v-row>
            <!-- -->
            <v-row>
              <v-col cols="4">
                <v-select
                    id='newSchoolCategoryInput'
                    :rules="[rules.required()]"
                    v-model="newSchool.categoryCode"
                    :items="schoolCategoryTypeCodes"
                    item-value="schoolCategoryCode"
                    item-text="label"
                    class="pt-0"
                    @change="schoolCategoryChanged"
                    label="School Category"
                />
              </v-col>
              <v-col cols="4">
                <v-select
                    id='newSchoolFacilityTypeInput'
                    :rules="[rules.required()]"
                    v-model="newSchool.facilityTypeCode"
                    :items="allowedFacilityTypeCodesForSchoolCategoryCode"
                    item-value="facilityTypeCode"
                    item-text="label"
                    :disabled="isFacilityTypeDisabled"
                    class="pt-0"
                    label="Facility Type"
                />
              </v-col>
              <v-col cols="4">
                <v-select
                    id='newSchoolOrganizationCodeInput'
                    :rules="[rules.required()]"
                    v-model="newSchool.organizationCode"
                    :items="schoolOrganizationTypeCodes"
                    item-value="schoolOrganizationCode"
                    item-text="label"
                    class="pt-0"
                    label="School Organization"
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="4">
                <v-select
                    id='newSchoolGradesOfferedInput'
                    v-model="newSchool.gradesOffered"
                    :items="gradeCodes"
                    item-value="schoolGradeCode"
                    item-text="label"
                    class="pt-0"
                    multiple
                    label="Grades Offered"
                />
              </v-col>
              <v-col cols="4">
                <v-select
                    id='newSchoolNLCActivityInput'
                    v-model="newSchool.NLCActivity"
                    :items="schoolNeighborhoodLearningCodes"
                    item-value="neighborhoodLearningTypeCode"
                    item-text="label"
                    class="pt-0"
                    multiple
                    label="NLC Activity"
                />
              </v-col>
            </v-row>
            <v-row no-gutters class="mt-5">
              <v-col cols="4">
                <h3>Contact Information</h3>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="4">
                <v-text-field
                    id='newSchoolPhoneNumberInput'
                    :rules="[rules.phoneNumber()]"
                    v-model="newSchool.phoneNumber"
                    class="pt-0"
                    :maxlength="10"
                    label="Phone"
                    @keypress="isNumber($event)"
                />
              </v-col>
              <v-col cols="4">
                <v-text-field
                    id='newSchoolFaxNumberInput'
                    :rules="[rules.phoneNumber()]"
                    v-model="newSchool.faxNumber"
                    class="pt-0"
                    :maxlength="10"
                    label="Fax"
                    @keypress="isNumber($event)"
                />
              </v-col>
              <v-col cols="4">
                <v-text-field
                    id='newContactAltPhoneNumberInput'
                    :rules="[rules.email()]"
                    v-model="newSchool.email"
                    :maxlength="255"
                    class="pt-0"
                    label="Email"
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="4">
                <v-text-field
                    id='newContactAltPhoneNumberInput'
                    :rules="[rules.website()]"
                    v-model="newSchool.website"
                    :maxlength="255"
                    class="pt-0"
                    label="Website"
                />
              </v-col>
            </v-row>

            <v-row no-gutters class="mt-5">
              <v-col class="mt-1 d-flex justify-start">
                <v-icon color="#1976d2">{{this.addressButton?.icon}}</v-icon>
                <a class="ml-1 toggle" @click="toggleAddressForm">{{this.addressButton?.label}}</a>
              </v-col>
            </v-row>
            
            <v-row v-if="showAddress">
              <v-col>
                <v-row no-gutters class="mt-5">
                  <v-col cols="4">
                    <h3>Mailing Address</h3>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="4">
                    <v-text-field id='newSchoolMailingAddressLine1Input' :rules="[rules.required()]"
                      v-model="newSchool.mailingAddrLine1" class="pt-0" :maxlength="255" label="Line 1" />
                  </v-col>
                  <v-col cols="4">
                    <v-text-field id='newSchoolMailingAddressLine2Input' v-model="newSchool.mailingAddrLine2" class="pt-0"
                      :maxlength="255" label="Line 2" />
                  </v-col>
                  <v-col cols="4">
                    <v-text-field id='newContactMailingAddressCityInput' :rules="[rules.required()]"
                      v-model="newSchool.mailingAddrCity" class="pt-0" :maxlength="255" label="City" />
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="4">
                    <v-autocomplete id='newSchoolMailingAddressProvinceInput' :rules="[rules.required()]"
                      v-model="newSchool.mailingAddrProvince" class="pt-0" label="Province" :items="provincialCodes"
                      item-text="label" item-value="provinceCode" />
                  </v-col>
                  <v-col cols="4">
                    <v-autocomplete id='newSchoolMailingAddressCountryInput' :rules="[rules.required()]"
                      v-model="newSchool.mailingAddrCountry" class="pt-0" label="Country" :items="countryCodes" item-text="label"
                      item-value="countryCode" />
                  </v-col>
                  <v-col cols="4">
                    <v-text-field id='newContactMailingAddressPostalCodeInput' :rules="[rules.required(), rules.postalCode()]"
                      v-model="newSchool.mailingAddrPostal" class="pt-0" :maxlength="6" label="Postal Code" />
                  </v-col>
                </v-row>
            
                <v-row v-if="displayPhysicalAddress" no-gutters>
                  <v-col>
                    <v-row no-gutters class="mt-5">
                      <v-col cols="4">
                        <h3>Physical Address</h3>
                      </v-col>
                    </v-row>
                    <v-row no-gutters v-if="sameAsMailingCheckbox" class="pt-4">
                      <v-checkbox dense id="sameAsMailingCheckbox" @click.native="fireFormValidate" v-model="sameAsMailingCheckbox"
                        label="Same as Mailing Address" class="mt-n3 pt-0"></v-checkbox>
                    </v-row>
                    <v-row no-gutters v-else>
                      <v-row>
                        <v-col cols="4">
                          <v-text-field id='newSchoolPhysicalAddressLine1Input' :rules="[rules.required()]"
                            v-model="newSchool.physicalAddrLine1" class="pt-0" :maxlength="255" label="Line 1" />
                        </v-col>
                        <v-col cols="4">
                          <v-text-field id='newSchoolPhysicalAddressLine2Input' v-model="newSchool.physicalAddrLine2" class="pt-0"
                            :maxlength="255" label="Line 2" />
                        </v-col>
                        <v-col cols="4">
                          <v-text-field id='newContactPhysicalAddressCityInput' :rules="[rules.required()]"
                            v-model="newSchool.physicalAddrCity" class="pt-0" :maxlength="255" label="City" />
                        </v-col>
                      </v-row>
                      <v-row>
                        <v-col cols="4">
                          <v-autocomplete id='newSchoolPhysicalAddressProvinceInput' :rules="[rules.required()]"
                            v-model="newSchool.physicalAddrProvince" class="pt-0" label="Province" :items="provincialCodes"
                            item-text="label" item-value="provinceCode" />
                        </v-col>
                        <v-col cols="4">
                          <v-autocomplete id='newSchoolPhysicalAddressCountryInput' :rules="[rules.required()]"
                            v-model="newSchool.physicalAddrCountry" class="pt-0" label="Country" :items="countryCodes"
                            item-text="label" item-value="countryCode" />
                        </v-col>
                        <v-col cols="4">
                          <v-text-field id='newContactPhysicalAddressPostalCodeInput'
                            :rules="[rules.required(), rules.postalCode()]" v-model="newSchool.physicalAddrPostal" class="pt-0"
                            :maxlength="6" label="Postal Code" />
                        </v-col>
                      </v-row>
                    </v-row>
                    <v-row no-gutters v-if="!sameAsMailingCheckbox" class="pt-4">
                      <v-col>
                        <v-checkbox dense id="sameAsMailingCheckbox" @click.native="fireFormValidate"
                          v-model="sameAsMailingCheckbox" label="Same as Mailing Address" class="mt-n3 pt-0"></v-checkbox>
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
            
            
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
    <v-card-actions class="justify-end">
      <PrimaryButton id="cancelNewSchoolBtn" secondary text="Cancel" @click.native="closeNewSchoolPage"></PrimaryButton>
      <PrimaryButton id="newSchoolPostBtn" text="Save" width="7rem" @click.native="addNewSchool" :disabled="!isFormValid" :loading="processing"></PrimaryButton>
    </v-card-actions>
  </v-card>
</template>

<script>
import PrimaryButton from '../util/PrimaryButton';
import {mapGetters, mapState} from 'vuex';
import alertMixin from '@/mixins/alertMixin';
import ApiService from '@/common/apiService';
import {Routes} from '@/utils/constants';
import * as Rules from '@/utils/institute/formRules';
import {isNumber} from '@/utils/institute/formInput';
import {findUpcomingDate} from '@/utils/dateHelpers';

export default {
  name: 'NewSchoolPage',
  mixins: [alertMixin],
  props: {
    districtNames: {
      type: Array,
      required: true
    },
    authorityNames: {
      type: Array,
      required: true
    },
  },
  components: {
    PrimaryButton,
  },
  mounted() {
    this.validateForm();
    this.addressButton = {
      icon: 'mdi-plus-thick',
      label: 'Add Address'
    };
  },
  data() {
    return {
      isFormValid: false,
      processing: false,
      isFacilityTypeDisabled: false,
      authorityDisabled: true,
      independentArray: ['INDEPEND', 'INDP_FNS'],
      requiredAuthoritySchoolCategories: ['INDEPEND', 'INDP_FNS', 'OFFSHORE'],
      newSchool: {
        districtName: null,
        authorityName: null,
        openDate: this.calculateDefaultOpenDate(),
        categoryCode: null,
        facilityTypeCode: null,
        organizationCode: null,
        gradesOffered: null,
        NLCActivity: null,
        phoneNumber: null,
        faxNumber: null,
        email: null,
        website: null,
        mailingAddrLine1: null,
        mailingAddrLine2: null,
        mailingAddrCity: null,
        mailingAddrProvince: null,
        mailingAddrCountry: null,
        mailingAddrPostal: null,
        physicalAddrLine1: null,
        physicalAddrLine2: null,
        physicalAddrCity: null,
        physicalAddrProvince: null,
        physicalAddrCountry: null,
        physicalAddrPostal: null,
      },
      rules: Rules,
      newSchoolOpenDatePicker: null,
      sameAsMailingCheckbox: true,
      showAddress: false,
      addressButton: {
        label: '',
        icon: ''
      }
    };
  },
  computed: {
    ...mapGetters('auth', ['isAuthenticated','userInfo','SCHOOL_INDEPENDENT_ADMIN_ROLE']),
    ...mapState('institute', ['activeFacilityTypeCodes']),
    ...mapState('institute', ['activeSchoolCategoryTypeCodes']),
    ...mapState('institute', ['activeSchoolOrganizationTypeCodes']),
    ...mapState('institute', ['activeSchoolNeighborhoodLearningCodes']),
    ...mapState('institute', ['activeGradeCodes']),
    ...mapState('institute', ['activeProvinceCodes']),
    ...mapState('institute', ['activeCountryCodes']),
    ...mapState('institute', ['schoolCategoryFacilityTypesMap']),

    allowedFacilityTypeCodesForSchoolCategoryCode(){
      if (!this.activeFacilityTypeCodes || !this.newSchool?.categoryCode) {
        return [];
      }

      let facilityTypes = this.schoolCategoryFacilityTypesMap[this.newSchool?.categoryCode]?.map(schoolCatFacilityTypeCode =>  this.activeFacilityTypeCodes.find(facTypCode=> facTypCode.facilityTypeCode === schoolCatFacilityTypeCode));
      this.enableOrDisableFacilityType(facilityTypes);
      return facilityTypes;
    },
    schoolCategoryTypeCodes() {
      if(this.isIndependentOnlyUser()){
        return this.activeSchoolCategoryTypeCodes?.filter(cat => this.independentArray.includes(cat.schoolCategoryCode));
      }
      return this.activeSchoolCategoryTypeCodes ? this.activeSchoolCategoryTypeCodes : [];
    },
    schoolOrganizationTypeCodes() {
      return this.activeSchoolOrganizationTypeCodes ? this.activeSchoolOrganizationTypeCodes : [];
    },
    schoolNeighborhoodLearningCodes() {
      return this.activeSchoolNeighborhoodLearningCodes ? this.activeSchoolNeighborhoodLearningCodes : [];
    },
    displayPhysicalAddress(){
      return this.newSchool?.categoryCode !== 'OFFSHORE';
    },
    gradeCodes() {
      return this.activeGradeCodes ? this.activeGradeCodes : [];
    },
    provincialCodes() {
      if (!this.activeProvinceCodes) {
        return [];
      }
      const allowedProvincialCodes = ['BC', 'YT'];
      return this.activeProvinceCodes.filter(province => allowedProvincialCodes.includes(province.provinceCode));
    },
    countryCodes() {
      return this.activeCountryCodes ? this.activeCountryCodes : [];
    }
  },
  created() {
    this.$store.dispatch('institute/getAllActiveFacilityTypeCodes');
    this.$store.dispatch('institute/getAllActiveSchoolCategoryTypeCodes');
    this.$store.dispatch('institute/getAllActiveSchoolOrganizationTypeCodes');
    this.$store.dispatch('institute/getAllActiveSchoolNeighborhoodLearningCodes');
    this.$store.dispatch('institute/getAllActiveGradeCodes');
    this.$store.dispatch('institute/getAllActiveProvinceCodes');
    this.$store.dispatch('institute/getAllActiveCountryCodes');
    this.$store.dispatch('institute/getSchoolCategoryFacilityTypesMap');
  },
  methods: {
    enableOrDisableFacilityType(facilityTypes){
      this.isFacilityTypeDisabled = facilityTypes && facilityTypes.length === 1;
      if(this.isFacilityTypeDisabled){
        this.newSchool.facilityTypeCode = facilityTypes[0].facilityTypeCode;
      }else{
        this.newSchool.facilityTypeCode = null;
      }

      this.fireFormValidate();
    },
    isIndependentOnlyUser() {
      return this.SCHOOL_INDEPENDENT_ADMIN_ROLE;
    },
    authorityRule(value) {
      if (this.newSchool.categoryCode && this.requiredAuthoritySchoolCategories.includes(this.newSchool.categoryCode) && !value) {
        return 'Required';
      } else {
        return true;
      }
    },
    calculateDefaultOpenDate() {
      return findUpcomingDate(7, 1).toString();
    },
    saveNewSchoolOpenDate(date) {
      this.$refs.newSchoolOpenDateFilter.save(date);
    },
    closeNewSchoolPage() {
      this.resetForm();
      this.$emit('newSchool:closeNewSchoolPage');
    },
    addNewSchool() {
      this.processing = true;

      ApiService.apiAxios.post(`${Routes.institute.SCHOOL_DATA_URL}`, this.newSchool)
        .then(() => {
          this.setSuccessAlert('Success! The school has been created.');
          this.resetForm();
          this.$emit('newSchool:addNewSchool');
        })
        .catch(error => {
          this.setFailureAlert('An error occurred while saving a school. Please try again later.');
          console.log(error);
        })
        .finally(() => {
          this.processing = false;
        });
    },
    async schoolCategoryChanged(){
      if(this.newSchool.categoryCode && this.requiredAuthoritySchoolCategories.includes(this.newSchool.categoryCode)){
        this.authorityDisabled = false;
      }else{
        this.authorityDisabled = true;
        this.newSchool.authorityName = null;
      }
      await this.fireFormValidate();
    },
    async fireFormValidate(){
      await this.$nextTick();
      this.validateForm();
    },
    resetForm() {
      this.$refs.newSchoolForm.reset();
    },
    validateForm() {
      this.isFormValid = this.$refs.newSchoolForm.validate();
    },
    async toggleAddressForm() {
      this.showAddress = !this.showAddress;
      this.addressButton = {
        icon: !this.showAddress? 'mdi-plus-thick ' : 'mdi-minus',
        label: !this.showAddress? 'Add Address' : 'Remove Address'
      };
      this.resetAddressForms();
      await this.fireFormValidate();
    },
    resetAddressForms() {
      this.newSchool.mailingAddrLine1= null;
      this.newSchool.mailingAddrLine2= null;
      this.newSchool.mailingAddrCity= null;
      this.newSchool.mailingAddrProvince= null;
      this.newSchool.mailingAddrCountry= null;
      this.newSchool.mailingAddrPostal= null;
      this.newSchool.physicalAddrLine1= null;
      this.newSchool.physicalAddrLine2= null;
      this.newSchool.physicalAddrCity= null;
      this.newSchool.physicalAddrProvince= null;
      this.newSchool.physicalAddrCountry= null;
      this.newSchool.physicalAddrPostal= null;
    },
    isNumber,
  },
};
</script>

<style scoped>
.sheetHeader{
  background-color: #003366;
  color: white;
  font-size: medium !important;
  font-weight: bolder !important;
}

.toggle {
  font-size: 15px;
}
</style>
