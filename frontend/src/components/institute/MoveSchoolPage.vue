<template>
    <v-card id="moveSchoolCard">
      <v-card-title class="sheetHeader pt-1 pb-1">Move School</v-card-title>
      <v-divider></v-divider>
      <v-card-text>
        <v-row class="move-description">
            <v-col>
                <p>Moving the school will close the school in the current district and open it in a new district and/or authority. If it is available, the school code will remain the same in the new district</p>
                <p>Any users associated with the closing school will be moved to the new school.</p>
            </v-col>
        </v-row>
        
        <v-form ref="moveSchoolForm" v-model="isMoveFormValid">
              <v-row class="d-flex justify-center">
                <v-col>
                <v-row>
                    <v-col cols="8">
                        <v-text-field
                      id='newSchoolNameInput'
                      :rules="[rules.required()]"
                      v-model="moveSchoolObject.displayName"
                      class="pt-0"
                      :maxlength="255"
                      label="School Name"
                  />
                    </v-col>

                    <v-col cols="4">
                      <v-menu
                          id="moveDatePicker"
                          ref="moveDateFilter"
                          :close-on-content-click="false"
                          transition="scale-transition"
                          offset-y
                          min-width="auto"
                      >
                        <template v-slot:activator="{ on, attrs }">
                          <v-text-field
                              id="moveDateTextField"
                              :rules="[rules.required()]"
                              class="pt-0"
                              v-model="moveSchoolObject.moveDate"
                              label="Move Date"
                              prepend-inner-icon="mdi-calendar"
                              clearable
                              readonly
                              v-bind="attrs"
                              v-on="on"
                          ></v-text-field>
                        </template>
                        <v-date-picker
                            v-model="moveSchoolObject.moveDate"
                            :active-picker.sync="moveDatePicker"
                            @change="saveMoveSchoolDate"
                        ></v-date-picker>
                      </v-menu>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="4">
                      <v-autocomplete
                          id="district-text-field"
                          label="District"
                          :rules="[rules.required()]"
                          item-value="districtId"
                          item-text="districtNumberName"
                          :items="activeDistricts"
                          v-model="moveSchoolObject.districtId"
                          class="pt-0"
                          clearable>
                      </v-autocomplete>
                    </v-col>
                    <v-col cols="4">
                      <v-select
                          id='newSchoolCategoryInput'
                          :rules="[rules.required()]"
                          v-model="moveSchoolObject.schoolCategoryCode"
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
                          v-model="moveSchoolObject.facilityTypeCode"
                          :items="allowedFacilityTypeCodesForSchoolCategoryCode"
                          item-value="facilityTypeCode"
                          item-text="label"
                          :disabled="isFacilityTypeDisabled"
                          class="pt-0"
                          label="Facility Type"
                      />
                    </v-col>
                  </v-row>
                  <!-- -->
                  <v-row>
                    
                    <v-col cols="4">
                      <v-autocomplete
                          id="authority-text-field"
                          label="Authority"
                          item-value="authorityID"
                          item-text="authorityCodeName"
                          :items="activeAuthorities"
                          :disabled="authorityDisabled"
                          :rules="[authorityRule]"
                          v-model="moveSchoolObject.independentAuthorityId"
                          class="pt-0"
                          clearable>
                      </v-autocomplete>
                    </v-col>
                    
                    <v-col cols="4">
                      <v-select
                          id='newSchoolOrganizationCodeInput'
                          :rules="[rules.required()]"
                          v-model="moveSchoolObject.schoolOrganizationCode"
                          :items="schoolOrganizationTypeCodes"
                          item-value="schoolOrganizationCode"
                          item-text="label"
                          class="pt-0"
                          label="School Organization"
                      />
                    </v-col>

                    <v-col cols="4">
                      <v-select
                          id='newSchoolGradesOfferedInput'
                          v-model="moveSchoolObject.grades"
                          :items="gradeCodes"
                          item-value="schoolGradeCode"
                          item-text="label"
                          @input="sortGrades"
                          :disabled="isGradeOfferedDisabled"
                          class="pt-0"
                          multiple
                          return-object
                          label="Grades Offered"
                      />
                    </v-col>
                  </v-row>
                  <v-row>          
                    <v-col cols="4">
                      <v-select
                          id='newSchoolNLCActivityInput'
                          v-model="moveSchoolObject.neighborhoodLearning"
                          :items="schoolNeighborhoodLearningCodes"
                          item-value="neighborhoodLearningTypeCode"
                          item-text="label"
                          class="pt-0"
                          multiple
                          @input="sortNLC"
                          return-object
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
                          v-model="moveSchoolObject.phoneNumber"
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
                          v-model="moveSchoolObject.faxNumber"
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
                          v-model="moveSchoolObject.email"
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
                          v-model="moveSchoolObject.website"
                          :maxlength="255"
                          class="pt-0"
                          label="Website"
                      />
                    </v-col>
                  </v-row>
              
                  <v-row >
                    <v-col>
                      <v-row no-gutters class="mt-5">
                        <v-col cols="4">
                          <h3>Mailing Address</h3>
                        </v-col>
                      </v-row>
                      <v-row>
                        <v-col cols="4">
                          <v-text-field id='newSchoolMailingAddressLine1Input' :rules="[rules.required()]"
                            v-model="moveSchoolObject.mailingAddrLine1" class="pt-0" :maxlength="255" label="Line 1" />
                        </v-col>
                        <v-col cols="4">
                          <v-text-field id='newSchoolMailingAddressLine2Input' v-model="moveSchoolObject.mailingAddrLine2" class="pt-0"
                            :maxlength="255" label="Line 2" />
                        </v-col>
                        <v-col cols="4">
                          <v-text-field id='newContactMailingAddressCityInput' :rules="[rules.required()]"
                            v-model="moveSchoolObject.mailingAddrCity" class="pt-0" :maxlength="255" label="City" />
                        </v-col>
                      </v-row>
                      <v-row>
                        <v-col cols="4">
                          <v-autocomplete id='newSchoolMailingAddressProvinceInput' :rules="[rules.required()]"
                            v-model="moveSchoolObject.mailingAddrProvince" class="pt-0" label="Province" :items="provincialCodes"
                            item-text="label" item-value="provinceCode" />
                        </v-col>
                        <v-col cols="4">
                          <v-autocomplete id='newSchoolMailingAddressCountryInput' :rules="[rules.required()]"
                            v-model="moveSchoolObject.mailingAddrCountry" class="pt-0" label="Country" :items="countryCodes" item-text="label"
                            item-value="countryCode" />
                        </v-col>
                        <v-col cols="4">
                          <v-text-field id='newContactMailingAddressPostalCodeInput' :rules="[rules.required(), rules.postalCode()]"
                            v-model="moveSchoolObject.mailingAddrPostal" class="pt-0" :maxlength="6" label="Postal Code" />
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
                            <v-checkbox dense id="sameAsMailingCheckbox" @click="fireFormValidate" v-model="sameAsMailingCheckbox"
                              label="Same as Mailing Address" class="mt-n3 pt-0"></v-checkbox>
                          </v-row>
                          <v-row no-gutters v-else>
                            <v-row>
                              <v-col cols="4">
                                <v-text-field id='newSchoolPhysicalAddressLine1Input' :rules="[rules.required()]"
                                  v-model="moveSchoolObject.physicalAddrLine1" class="pt-0" :maxlength="255" label="Line 1" />
                              </v-col>
                              <v-col cols="4">
                                <v-text-field id='newSchoolPhysicalAddressLine2Input' v-model="moveSchoolObject.physicalAddrLine2" class="pt-0"
                                  :maxlength="255" label="Line 2" />
                              </v-col>
                              <v-col cols="4">
                                <v-text-field id='newContactPhysicalAddressCityInput' :rules="[rules.required()]"
                                  v-model="moveSchoolObject.physicalAddrCity" class="pt-0" :maxlength="255" label="City" />
                              </v-col>
                            </v-row>
                            <v-row>
                              <v-col cols="4">
                                <v-autocomplete id='newSchoolPhysicalAddressProvinceInput' :rules="[rules.required()]"
                                  v-model="moveSchoolObject.physicalAddrProvince" class="pt-0" label="Province" :items="provincialCodes"
                                  item-text="label" item-value="provinceCode" />
                              </v-col>
                              <v-col cols="4">
                                <v-autocomplete id='newSchoolPhysicalAddressCountryInput' :rules="[rules.required()]"
                                  v-model="moveSchoolObject.physicalAddrCountry" class="pt-0" label="Country" :items="countryCodes"
                                  item-text="label" item-value="countryCode" />
                              </v-col>
                              <v-col cols="4">
                                <v-text-field id='newContactPhysicalAddressPostalCodeInput'
                                  :rules="[rules.required(), rules.postalCode()]" v-model="moveSchoolObject.physicalAddrPostal" class="pt-0"
                                  :maxlength="6" label="Postal Code" />
                              </v-col>
                            </v-row>
                          </v-row>
                          <v-row no-gutters v-if="!sameAsMailingCheckbox" class="pt-4">
                            <v-col>
                              <v-checkbox dense id="sameAsMailingCheckbox" @click="fireFormValidate"
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
        <PrimaryButton id="cancelNewSchoolBtn" secondary text="Cancel" @click.native="closeMoveSchoolPage"></PrimaryButton>
        <PrimaryButton id="newSchoolPostBtn" text="Move" width="7rem" @click.native="moveSchool" :disabled="!isMoveFormValid" :loading="processing"></PrimaryButton>
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
import {sortByNameValue} from '@/utils/format';
import {isNumber} from '@/utils/institute/formInput';
import {sortBy} from 'lodash';
  
export default {
  name: 'MoveSchoolPage',
  mixins: [alertMixin],
  props: {
    school: {
      type: Object,
      required: true,
    }
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
      isMoveFormValid: false,
      processing: false,
      isFacilityTypeDisabled: false,
      isGradeOfferedDisabled: false,
      authorityDisabled: true,
      independentArray: ['INDEPEND', 'INDP_FNS'],
      requiredAuthoritySchoolCategories: ['INDEPEND', 'INDP_FNS', 'OFFSHORE'],
      noGradeSchoolCategory: ['POST_SEC', 'EAR_LEARN'],
      activeDistricts:[],
      activeAuthorities: [],
      moveSchoolObject: {
        districtId: null,
        independentAuthorityId: null,
        displayName: this.school.displayName,
        schoolCategoryCode: this.school.schoolCategoryCode,
        facilityTypeCode: this.school.facilityTypeCode,
        schoolOrganizationCode: this.school.schoolOrganizationCode,
        grades: this.school.grades,
        neighborhoodLearning: this.school.neighborhoodLearning,
        phoneNumber: this.school.phoneNumber,
        faxNumber: this.school.faxNumber,
        email: this.school.email,
        website: this.school.website,
        schoolId: this.school.schoolId,
        openedDate: this.school.openedDate,
        mincode: this.school.mincode,
        schoolNumber: this.school.schoolNumber,
        contacts: this.school.contacts,
        notes: this.school.notes,
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
        moveDate:null,  
      },
      rules: Rules,
      moveDatePicker: null,
      sameAsMailingCheckbox: true,
      showAddress: false,
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
      if (!this.activeFacilityTypeCodes || !this.moveSchoolObject?.schoolCategoryCode) {
        return [];
      }
  
      let facilityTypes = this.schoolCategoryFacilityTypesMap[this.moveSchoolObject?.schoolCategoryCode]?.map(schoolCatFacilityTypeCode =>  this.activeFacilityTypeCodes.find(facTypCode=> facTypCode.facilityTypeCode === schoolCatFacilityTypeCode));
      this.enableOrDisableFacilityType(facilityTypes);
      return sortBy(  facilityTypes,['displayOrder']);
    },
    schoolCategoryTypeCodes() {
      if(this.isIndependentOnlyUser()){
        return this.activeSchoolCategoryTypeCodes?.filter(cat => this.independentArray.includes(cat.schoolCategoryCode));
      }
      return this.activeSchoolCategoryTypeCodes ? sortBy( this.activeSchoolCategoryTypeCodes,['displayOrder']) : [];
    },
    schoolOrganizationTypeCodes() {
      return this.activeSchoolOrganizationTypeCodes ? this.activeSchoolOrganizationTypeCodes : [];
    },
    schoolNeighborhoodLearningCodes() {
      return this.activeSchoolNeighborhoodLearningCodes ?  sortBy(this.activeSchoolNeighborhoodLearningCodes,['neighborhoodLearningTypeCode']) : [];
    },
    displayPhysicalAddress(){
      return this.moveSchoolObject?.schoolCategoryCode !== 'OFFSHORE';
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
    this.$store.dispatch('institute/getAllActiveGradeCodes');
    this.$store.dispatch('institute/getAllActiveSchoolNeighborhoodLearningCodes');
    this.$store.dispatch('institute/getAllActiveProvinceCodes');
    this.$store.dispatch('institute/getAllActiveCountryCodes');
    this.$store.dispatch('institute/getSchoolCategoryFacilityTypesMap');
    this.getActiveDistrictDropDownItems();
    this.getActiveAuthorityDropDownItems(); 
  },
  methods: {
    getActiveDistrictDropDownItems() {
      ApiService.getActiveDistricts().then((response) => {
        for(const district of response.data){
          let districtItem = {
            districtNumberName: `${district.districtNumber} - ${district.name}`,
            districtId: district.districtId,
          };
          this.activeDistricts.push(districtItem);
        }
        this.activeDistricts = this.sortByNameValue(this.activeDistricts, 'districtNumberName');
      }).catch(error => {
        console.error(error);
        this.setFailureAlert('An error occurred while getting active districts. Please try again later.');
      });
    },
    getActiveAuthorityDropDownItems(){
      ApiService.getActiveAuthorities().then((response) => {
        for(const authority of response.data){
          let authorityItem = {
            authorityNumber: +authority.authorityNumber,
            authorityCodeName: `${authority.authorityNumber} - ${authority.name}`,
            authorityID: authority.authorityID,
          };
          this.activeAuthorities.push(authorityItem);
        }
        this.activeAuthorities = this.activeAuthorities.sort(function(a, b){return a.authorityNumber-b.authorityNumber;});
      }).catch(error => {
        console.error(error);
        this.setFailureAlert('An error occurred while getting active authorities. Please try again later.');
      });
    },
    enableOrDisableFacilityType(facilityTypes){
      this.isFacilityTypeDisabled = facilityTypes && facilityTypes.length === 1;
      if(this.isFacilityTypeDisabled){
        this.moveSchoolObject.facilityTypeCode = facilityTypes[0].facilityTypeCode;
      }else{
        this.moveSchoolObject.facilityTypeCode = null;
      }
  
      this.fireFormValidate();
    },
    isIndependentOnlyUser() {
      return this.SCHOOL_INDEPENDENT_ADMIN_ROLE;
    },
    authorityRule(value) {
      if (this.moveSchoolObject.schoolCategoryCode && this.requiredAuthoritySchoolCategories.includes(this.moveSchoolObject.schoolCategoryCode) && !value) {
        return 'Required';
      }
    },
    saveMoveSchoolDate(date) {
      this.$refs.moveDateFilter.save(date);
    },
    closeMoveSchoolPage() {
      this.resetForm();
      this.$emit('moveSchool:closeMoveSchoolPage');
    },
    moveSchool() {
      this.processing = true;
      ApiService.apiAxios.post(`${Routes.institute.SCHOOL_MOVE_URL}`, this.moveSchoolObject)
        .then(() => {
          this.setSuccessAlert('Success! Your request to move this school has been accepted.');
          this.closeMoveSchoolPage();
        })
        .catch(error => {
          this.setFailureAlert(error.message);
          console.log(error);
        })
        .finally(() => {
          this.processing = false;
        });
    },
    async schoolCategoryChanged(){
      if(this.moveSchoolObject.schoolCategoryCode && this.requiredAuthoritySchoolCategories.includes(this.moveSchoolObject.schoolCategoryCode)){
        this.authorityDisabled = false;
      } else{
        this.authorityDisabled = true;
        this.moveSchoolObject.authorityName = null;
        this.moveSchoolObject.independentAuthorityId = null;
      }
      if(this.moveSchoolObject.schoolCategoryCode && this.noGradeSchoolCategory.includes(this.moveSchoolObject.schoolCategoryCode)) {
        this.isGradeOfferedDisabled = true;
        this.moveSchoolObject.grades = null;
      } else{
        this.isGradeOfferedDisabled = false;
      }
      await this.fireFormValidate();
    },
    async fireFormValidate(){
      await this.$nextTick();
      this.validateForm();
    },
    resetForm() {
      this.$refs.moveSchoolForm.reset();
    },
    sortGrades() {
      this.moveSchoolObject.grades = sortBy(this.moveSchoolObject.grades,['displayOrder']);
    },
    sortNLC() {
      this.moveSchoolObject.neighborhoodLearning = sortBy(this.moveSchoolObject.neighborhoodLearning,['neighborhoodLearningTypeCode']);
    },
    validateForm() {
      this.isMoveFormValid = this.$refs.moveSchoolForm.validate();
    },
    resetAddressForms() {
      this.moveSchoolObject.mailingAddrLine1= null;
      this.moveSchoolObject.mailingAddrLine2= null;
      this.moveSchoolObject.mailingAddrCity= null;
      this.moveSchoolObject.mailingAddrProvince= null;
      this.moveSchoolObject.mailingAddrCountry= null;
      this.moveSchoolObject.mailingAddrPostal= null;
      this.moveSchoolObject.physicalAddrLine1= null;
      this.moveSchoolObject.physicalAddrLine2= null;
      this.moveSchoolObject.physicalAddrCity= null;
      this.moveSchoolObject.physicalAddrProvince= null;
      this.moveSchoolObject.physicalAddrCountry= null;
      this.moveSchoolObject.physicalAddrPostal= null;
    },
    isNumber,
    sortByNameValue
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

  .move-description {
    color: black !important;
    font-size: medium !important;
  }
  
  .toggle {
    font-size: 15px;
  }
  </style>
  
