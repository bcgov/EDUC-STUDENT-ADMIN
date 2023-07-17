<template>
  <v-card id="moveSchoolCard">
    <v-card-title class="sheetHeader pt-1 pb-1">
      Move School
    </v-card-title>
    <v-divider />
    <v-card-text>
      <v-row class="move-description">
        <v-col>
          <p>
            Moving the school will close the school in the current district and open it in a new district and/or
            authority. If it is available, the school code will remain the same in the new district
          </p>
          <p>Any users associated with the closing school will be moved to the new school.</p>
        </v-col>
      </v-row>

      <v-form
        ref="moveSchoolForm"
        v-model="isMoveFormValid"
      >
        <v-row class="d-flex justify-center">
          <v-col>
            <v-row>
              <v-col cols="6">
                <v-text-field
                  id="newSchoolNameInput"
                  v-model="moveSchoolObject.displayName"
                  :rules="[rules.required(), rules.noSpecialCharactersSchDisAuthName()]"
                  class="pt-0"
                  variant="underlined"
                  :maxlength="255"
                  label="School Name"
                />
              </v-col>
              <v-col cols="6">
                <v-text-field
                  id="newSchoolSafeNameInput"
                  v-model="moveSchoolObject.displayNameNoSpecialChars"
                  :rules="[rules.noSpecialCharactersSchDisAuthName()]"
                  variant="underlined"
                  class="pt-0"
                  :maxlength="255"
                  label="Legacy Safe School Name"
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="4">
                <v-text-field
                  id="moveDateTextField"
                  v-model="moveSchoolObject.moveDate"
                  :rules="[rules.required(), rules.dateIsAfterOrEqualTo(moveSchoolObject.moveDate, school.openedDate, true, `The move date must occur on or after ${schoolOpenDateFormatted}.`)]"
                  class="pt-0"
                  label="Move Date"
                  variant="underlined"
                  type="date"
                />
              </v-col>
              <v-col cols="4">
                <v-autocomplete
                  id="district-text-field"
                  v-model="moveSchoolObject.districtId"
                  label="District"
                  :rules="[rules.required()]"
                  item-value="districtId"
                  item-title="districtNumberName"
                  :items="activeDistricts"
                  variant="underlined"
                  class="pt-0"
                  clearable
                  @update:model-value="schoolDistrictChanged"
                />
              </v-col>
              <v-col cols="4">
                <v-select
                  id="newSchoolCategoryInput"
                  v-model="moveSchoolObject.schoolCategoryCode"
                  :rules="[rules.required()]"
                  :items="schoolCategoryTypeCodes"
                  item-value="schoolCategoryCode"
                  variant="underlined"
                  item-title="label"
                  class="pt-0"
                  label="School Category"
                  :disabled="schoolCategoryDisabled"
                  @update:model-value="schoolCategoryChanged"
                />
              </v-col>
            </v-row>
            <!-- -->
            <v-row>
              <v-col cols="4">
                <v-select
                  id="newSchoolFacilityTypeInput"
                  v-model="moveSchoolObject.facilityTypeCode"
                  :rules="[rules.required()]"
                  :items="allowedFacilityTypeCodesForSchoolCategoryCode"
                  item-value="facilityTypeCode"
                  variant="underlined"
                  item-title="label"
                  :disabled="isFacilityTypeDisabled"
                  class="pt-0"
                  label="Facility Type"
                />
              </v-col>

              <v-col cols="4">
                <v-autocomplete
                  id="authority-text-field"
                  v-model="moveSchoolObject.independentAuthorityId"
                  label="Authority"
                  item-value="authorityID"
                  item-title="authorityCodeName"
                  :items="activeAuthorities"
                  variant="underlined"
                  :disabled="authorityDisabled"
                  :rules="[authorityRule]"
                  class="pt-0"
                  clearable
                />
              </v-col>

              <v-col cols="4">
                <v-select
                  id="newSchoolOrganizationCodeInput"
                  v-model="moveSchoolObject.schoolOrganizationCode"
                  :rules="[rules.required()]"
                  :items="schoolOrganizationTypeCodes"
                  variant="underlined"
                  item-value="schoolOrganizationCode"
                  item-title="label"
                  class="pt-0"
                  label="School Organization"
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="4">
                <v-select
                  id="newSchoolGradesOfferedInput"
                  v-model="moveSchoolObject.grades"
                  :items="gradeCodes"
                  item-value="schoolGradeCode"
                  item-title="label"
                  variant="underlined"
                  :disabled="isGradeOfferedDisabled"
                  class="pt-0"
                  multiple
                  return-object
                  label="Grades Offered"
                  @input="sortGrades"
                />
              </v-col>
              <v-col cols="4">
                <v-select
                  id="newSchoolNLCActivityInput"
                  v-model="moveSchoolObject.neighborhoodLearning"
                  :items="schoolNeighborhoodLearningCodes"
                  item-value="neighborhoodLearningTypeCode"
                  item-title="label"
                  class="pt-0"
                  variant="underlined"
                  multiple
                  return-object
                  label="NLC Activity"
                  @input="sortNLC"
                />
              </v-col>
              <v-col cols="4">
                <v-select
                  id="newSchoolReportingCode"
                  v-model="moveSchoolObject.schoolReportingRequirementCode"
                  :rules="[rules.required()]"
                  :items="schoolReportingRequirementTypeCodes"
                  item-value="schoolReportingRequirementCode"
                  variant="underlined"
                  item-title="label"
                  class="pt-0"
                  label="Reporting Requirement"
                />
              </v-col>
            </v-row>
            <v-row
              no-gutters
              class="mt-5"
            >
              <v-col cols="4">
                <h3>Contact Information</h3>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="4">
                <v-text-field
                  id="newSchoolPhoneNumberInput"
                  v-model="moveSchoolObject.phoneNumber"
                  :rules="[rules.phoneNumber()]"
                  class="pt-0"
                  variant="underlined"
                  :maxlength="10"
                  label="Phone"
                  @keypress="isNumber($event)"
                />
              </v-col>
              <v-col cols="4">
                <v-text-field
                  id="newSchoolFaxNumberInput"
                  v-model="moveSchoolObject.faxNumber"
                  :rules="[rules.phoneNumber()]"
                  class="pt-0"
                  variant="underlined"
                  :maxlength="10"
                  label="Fax"
                  @keypress="isNumber($event)"
                />
              </v-col>
              <v-col cols="4">
                <v-text-field
                  id="newContactAltPhoneNumberInput"
                  v-model="moveSchoolObject.email"
                  :rules="[rules.email()]"
                  :maxlength="255"
                  variant="underlined"
                  class="pt-0"
                  label="Email"
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="4">
                <v-text-field
                  id="newContactWebsiteInput"
                  v-model="moveSchoolObject.website"
                  :rules="[rules.website()]"
                  :maxlength="255"
                  variant="underlined"
                  class="pt-0"
                  label="Website"
                />
              </v-col>
            </v-row>

            <v-row>
              <v-col>
                <v-row
                  no-gutters
                  class="mt-5"
                >
                  <v-col cols="4">
                    <h3>Mailing Address</h3>
                  </v-col>
                </v-row>
                <v-row class="mt-0">
                  <v-col cols="4">
                    <v-text-field
                      id="newSchoolMailingAddressLine1Input"
                      v-model="moveSchoolObject.mailingAddrLine1"
                      :rules="[rules.required(), rules.noSpecialCharactersAddress()]"
                      class="pt-0 pb-5"
                      variant="underlined"
                      :maxlength="255"
                      label="Line 1"
                      hide-details="auto"
                    />
                  </v-col>
                  <v-col cols="4">
                    <v-text-field
                      id="newSchoolMailingAddressLine2Input"
                      v-model="moveSchoolObject.mailingAddrLine2"
                      :rules="[rules.noSpecialCharactersAddress()]"
                      class="pt-0 pb-5"
                      variant="underlined"
                      :maxlength="255"
                      label="Line 2"
                      hide-details="auto"
                    />
                  </v-col>
                  <v-col cols="4">
                    <v-text-field
                      id="newContactMailingAddressCityInput"
                      v-model="moveSchoolObject.mailingAddrCity"
                      :rules="[rules.required(), rules.noSpecialCharactersAddress()]"
                      class="pt-0 pb-5"
                      variant="underlined"
                      :maxlength="255"
                      label="City"
                      hide-details="auto"
                    />
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="4">
                    <v-select
                      id="newSchoolMailingAddressProvinceInput"
                      v-model="moveSchoolObject.mailingAddrProvince"
                      :rules="[rules.required()]"
                      class="pt-0"
                      variant="underlined"
                      label="Province"
                      :items="provincialCodes"
                      item-title="label"
                      item-value="provinceCode"
                    />
                  </v-col>
                  <v-col cols="4">
                    <v-select
                      id="newSchoolMailingAddressCountryInput"
                      v-model="moveSchoolObject.mailingAddrCountry"
                      :rules="[rules.required()]"
                      class="pt-0"
                      variant="underlined"
                      label="Country"
                      :items="countryCodes"
                      item-title="label"
                      item-value="countryCode"
                    />
                  </v-col>
                  <v-col cols="4">
                    <v-text-field
                      id="newContactMailingAddressPostalCodeInput"
                      v-model="moveSchoolObject.mailingAddrPostal"
                      :rules="[rules.required(), rules.postalCode()]"
                      class="pt-0"
                      variant="underlined"
                      :maxlength="6"
                      label="Postal Code"
                    />
                  </v-col>
                </v-row>

                <v-row
                  v-if="displayPhysicalAddress"
                  no-gutters
                >
                  <v-col>
                    <v-row
                      no-gutters
                      class="mt-5"
                    >
                      <v-col cols="4">
                        <h3>Physical Address</h3>
                      </v-col>
                    </v-row>
                    <v-row
                      v-if="sameAsMailingCheckbox"
                      no-gutters
                      class="pt-4"
                    >
                      <v-checkbox
                        id="sameAsMailingCheckbox"
                        v-model="sameAsMailingCheckbox"
                        density="compact"
                        label="Same as Mailing Address"
                        class="mt-n3 pt-0"
                        @update:model-value="fireFormValidate"
                      />
                    </v-row>
                    <v-row
                      v-else
                      no-gutters
                    >
                      <v-col>
                        <v-row>
                          <v-col cols="4">
                            <v-text-field
                              id="newSchoolPhysicalAddressLine1Input"
                              v-model="moveSchoolObject.physicalAddrLine1"
                              :rules="[rules.required(), rules.noSpecialCharactersAddress()]"
                              class="pt-0 pb-5"
                              variant="underlined"
                              :maxlength="255"
                              label="Line 1"
                              hide-details="auto"
                            />
                          </v-col>
                          <v-col cols="4">
                            <v-text-field
                              id="newSchoolPhysicalAddressLine2Input"
                              v-model="moveSchoolObject.physicalAddrLine2"
                              :rules="[rules.required(), rules.noSpecialCharactersAddress()]"
                              class="pt-0 pb-5"
                              variant="underlined"
                              :maxlength="255"
                              label="Line 2"
                              hide-details="auto"
                            />
                          </v-col>
                          <v-col cols="4">
                            <v-text-field
                              id="newContactPhysicalAddressCityInput"
                              v-model="moveSchoolObject.physicalAddrCity"
                              :rules="[rules.required(), rules.noSpecialCharactersAddress()]"
                              class="pt-0 pb-5"
                              variant="underlined"
                              :maxlength="255"
                              label="City"
                              hide-details="auto"
                            />
                          </v-col>
                        </v-row>
                        <v-row>
                          <v-col cols="4">
                            <v-select
                              id="newSchoolPhysicalAddressProvinceInput"
                              v-model="moveSchoolObject.physicalAddrProvince"
                              :rules="[rules.required()]"
                              class="pt-0"
                              variant="underlined"
                              label="Province"
                              :items="provincialCodes"
                              item-title="label"
                              item-value="provinceCode"
                            />
                          </v-col>
                          <v-col cols="4">
                            <v-select
                              id="newSchoolPhysicalAddressCountryInput"
                              v-model="moveSchoolObject.physicalAddrCountry"
                              :rules="[rules.required()]"
                              class="pt-0"
                              variant="underlined"
                              label="Country"
                              :items="countryCodes"
                              item-title="label"
                              item-value="countryCode"
                            />
                          </v-col>
                          <v-col cols="4">
                            <v-text-field
                              id="newContactPhysicalAddressPostalCodeInput"
                              v-model="moveSchoolObject.physicalAddrPostal"
                              :rules="[rules.required(), rules.postalCode()]"
                              class="pt-0"
                              variant="underlined"
                              :maxlength="6"
                              label="Postal Code"
                            />
                          </v-col>
                        </v-row>
                      </v-col>
                    </v-row>
                    <v-row
                      v-if="!sameAsMailingCheckbox"
                      no-gutters
                      class="pt-4"
                    >
                      <v-col>
                        <v-checkbox
                          id="sameAsMailingCheckbox"
                          v-model="sameAsMailingCheckbox"
                          density="compact"
                          label="Same as Mailing Address"
                          class="mt-n3 pt-0"
                          @update:model-value="fireFormValidate"
                        />
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
      <PrimaryButton
        id="cancelNewSchoolBtn"
        secondary
        text="Cancel"
        @click-action="closeMoveSchoolPage"
      />
      <PrimaryButton
        id="newSchoolPostBtn"
        text="Move"
        width="7rem"
        @click-action="moveSchool"
        :disabled="!isMoveFormValid"
        :loading="processing"
      />
    </v-card-actions>
  </v-card>
</template>

<script>
import PrimaryButton from '../util/PrimaryButton.vue';
import {mapState} from 'pinia';
import alertMixin from '@/mixins/alertMixin';
import ApiService from '@/common/apiService';
import {Routes} from '@/utils/constants';
import * as Rules from '@/utils/institute/formRules';
import {sortByNameValue, formatDate} from '@/utils/format';
import {isNumber} from '@/utils/institute/formInput';
import {sortBy} from 'lodash';
import {LocalDate} from '@js-joda/core';
import {isOpenNotClosingAuthority} from '@/utils/common';
import {authStore} from '@/store/modules/auth';
import {instituteStore} from '@/store/modules/institute';

export default {
  name: 'MoveSchoolPage',
  components: {
    PrimaryButton,
  },
  mixins: [alertMixin],
  props: {
    school: {
      type: Object,
      required: true,
    }
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
      notAllowedDistrictCodes: ['PSI', 'OFFSHORE'],
      districtSchoolCategoryConstraints: [
        {districtRegionCode: 'YUKON', schoolCategory: 'YUKON'}
      ],
      schoolCategoryDisabled: false,
      resetFacilitiesForSchoolCat: [''],
      activeDistricts: [],
      activeAuthorities: [],
      schoolGradeTypes: [],
      moveSchoolObject: {
        districtId: null,
        independentAuthorityId: null,
        displayName: this.school.displayName,
        displayNameNoSpecialChars: this.school.displayNameNoSpecialChars,
        schoolCategoryCode: this.school.schoolCategoryCode,
        schoolOrganizationCode: this.school.schoolOrganizationCode,
        grades: [],
        neighborhoodLearning: [],
        phoneNumber: this.school.phoneNumber,
        faxNumber: this.school.faxNumber,
        facilityTypeCode: this.school.facilityTypeCode,
        schoolReportingRequirementCode: this.school.schoolReportingRequirementCode,
        email: this.school.email,
        website: this.school.website,
        schoolId: null,
        openedDate: null,
        mincode: null,
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
        moveDate: this.calculateDefaultMoveDate(),
      },
      rules: Rules,
      moveDatePicker: null,
      sameAsMailingCheckbox: true,
      showAddress: false,
    };
  },
  mounted() {
    this.validateForm();
    this.addressButton = {
      icon: 'mdi-plus-thick',
      label: 'Add Address'
    };
  },
  computed: {
    ...mapState(authStore, ['isAuthenticated', 'userInfo', 'SCHOOL_INDEPENDENT_ADMIN_ROLE']),
    ...mapState(instituteStore, ['activeFacilityTypeCodes', 'activeSchoolCategoryTypeCodes', 'schoolReportingRequirementTypeCodes', 'activeSchoolOrganizationTypeCodes', 'activeSchoolNeighborhoodLearningCodes', 'activeGradeCodes', 'activeProvinceCodes', 'activeCountryCodes', 'schoolCategoryFacilityTypesMap']),

    allowedFacilityTypeCodesForSchoolCategoryCode() {
      if (!this.activeFacilityTypeCodes || !this.moveSchoolObject?.schoolCategoryCode) {
        return [];
      }

      let facilityTypes = this.schoolCategoryFacilityTypesMap[this.moveSchoolObject?.schoolCategoryCode]?.map(schoolCatFacilityTypeCode => this.activeFacilityTypeCodes.find(facTypCode => facTypCode.facilityTypeCode === schoolCatFacilityTypeCode));
      this.enableOrDisableFacilityType(facilityTypes);
      return sortBy(facilityTypes, ['displayOrder']);
    },
    schoolOpenDateFormatted() {
      if (!this.school.openedDate) {
        return '';
      }
      return this.formatDate(this.school.openedDate);
    },
    schoolCategoryTypeCodes() {
      if (this.isIndependentOnlyUser()) {
        return this.activeSchoolCategoryTypeCodes?.filter(cat => this.independentArray.includes(cat.schoolCategoryCode));
      }
      return this.activeSchoolCategoryTypeCodes ? sortBy(this.activeSchoolCategoryTypeCodes, ['displayOrder']) : [];
    },
    schoolOrganizationTypeCodes() {
      return this.activeSchoolOrganizationTypeCodes ? this.activeSchoolOrganizationTypeCodes : [];
    },
    schoolNeighborhoodLearningCodes() {
      return this.activeSchoolNeighborhoodLearningCodes ? sortBy(this.activeSchoolNeighborhoodLearningCodes, ['neighborhoodLearningTypeCode']) : [];
    },
    displayPhysicalAddress() {
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
    const instStore = instituteStore();
    instStore.getAllActiveFacilityTypeCodes();
    instStore.getAllActiveSchoolCategoryTypeCodes();
    instStore.getSchoolReportingRequirementTypeCodes();
    instStore.getAllActiveSchoolOrganizationTypeCodes();
    instStore.getAllActiveGradeCodes();
    instStore.getAllActiveSchoolNeighborhoodLearningCodes();
    instStore.getAllActiveProvinceCodes();
    instStore.getAllActiveCountryCodes();
    instStore.getSchoolCategoryFacilityTypesMap();
    instStore.getAllGradeCodes().then(() => {
      this.schoolGradeTypes = sortBy(this.activeGradeCodes, ['displayOrder']);
      this.sortGrades();
      this.copyNLCandGradesFromSchool();
    });
    this.sortNLC();
    this.getActiveDistrictDropDownItems();
    this.getActiveAuthorityDropDownItems();
    this.schoolCategoryChanged();
  },
  methods: {
    copyNLCandGradesFromSchool() {
      //copies over the NLC and grades list from school without schoolId information.
      this.moveSchoolObject.neighborhoodLearning = this.school.neighborhoodLearning.map(nlc => this.activeSchoolNeighborhoodLearningCodes?.find(activeNLC => nlc.neighborhoodLearningTypeCode === activeNLC.neighborhoodLearningTypeCode));
      this.moveSchoolObject.grades = this.school.grades.map(grade => this.activeGradeCodes.find(activeGrade => grade.schoolGradeCode === activeGrade.schoolGradeCode));
    },
    constrainSchoolCategoryByDistrict(districtRegionCode) {
      const schoolCategory = this.districtSchoolCategoryConstraints
        .find(c => c.districtRegionCode === districtRegionCode)?.schoolCategory;

      this.schoolCategoryDisabled = schoolCategory !== undefined;

      if (schoolCategory && this.moveSchoolObject.schoolCategoryCode !== schoolCategory) {
        this.moveSchoolObject.schoolCategoryCode = schoolCategory;
        this.schoolCategoryChanged();
      }
    },
    getActiveDistrictDropDownItems() {
      ApiService.getActiveDistricts().then((response) => {
        if (response.data) {
          let districts = response.data.filter(val => !this.notAllowedDistrictCodes.includes(val.districtRegionCode));
          for (const district of districts) {
            let districtItem = {
              districtNumberName: `${district.districtNumber} - ${district.name}`,
              districtId: district.districtId,
              districtRegionCode: district.districtRegionCode
            };
            this.activeDistricts.push(districtItem);
          }
        }
        this.activeDistricts = this.sortByNameValue(this.activeDistricts, 'districtNumberName');
      }).catch(error => {
        console.error(error);
        this.setFailureAlert('An error occurred while getting active districts. Please try again later.');
      });
    },
    formatDate,
    getActiveAuthorityDropDownItems() {
      ApiService.getActiveAuthorities().then((response) => {
        for (const authority of response.data) {
          if (this.isOpenNotClosingAuthority(authority)) {
            let authorityItem = {
              authorityNumber: +authority.authorityNumber,
              authorityCodeName: `${authority.authorityNumber} - ${authority.name}`,
              authorityID: authority.authorityID,
            };
            this.activeAuthorities.push(authorityItem);
          }
        }
        this.activeAuthorities = this.activeAuthorities.sort(function (a, b) {
          return a.authorityNumber - b.authorityNumber;
        });
      }).catch(error => {
        console.error(error);
        this.setFailureAlert('An error occurred while getting active authorities. Please try again later.');
      });
    },
    isOpenNotClosingAuthority,
    enableOrDisableFacilityType(facilityTypes) {
      this.isFacilityTypeDisabled = facilityTypes && facilityTypes.length === 1;
      if (this.isFacilityTypeDisabled) {
        this.moveSchoolObject.facilityTypeCode = facilityTypes[0].facilityTypeCode;
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
      return true;
    },
    saveMoveSchoolDate(date) {
      this.$refs.moveDateFilter.save(date);
    },
    closeMoveSchoolPage() {
      this.$emit('moveSchool:closeMoveSchoolPage');
    },
    moveSchool() {
      this.processing = true;
      ApiService.apiAxios.post(`${Routes.institute.SCHOOL_MOVE_URL}`, {
        toSchool: this.moveSchoolObject,
        fromSchoolId: this.school.schoolId,
        moveDate: this.moveSchoolObject.moveDate
      })
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
    calculateDefaultMoveDate() {
      return (LocalDate.now()).toString();
    },
    schoolDistrictChanged() {
      this.schoolCategoryDisabled = false;

      const districtRegionCode = this.activeDistricts
        .find(d => d.districtId === this.moveSchoolObject.districtId)?.districtRegionCode;

      if (districtRegionCode) {
        this.constrainSchoolCategoryByDistrict(districtRegionCode);
      }
    },
    async schoolCategoryChanged() {
      if (this.moveSchoolObject.schoolCategoryCode && this.requiredAuthoritySchoolCategories.includes(this.moveSchoolObject.schoolCategoryCode)) {
        this.authorityDisabled = false;
      } else {
        this.authorityDisabled = true;
        this.moveSchoolObject.authorityName = null;
        this.moveSchoolObject.independentAuthorityId = null;
      }
      if (this.moveSchoolObject.schoolCategoryCode && this.noGradeSchoolCategory.includes(this.moveSchoolObject.schoolCategoryCode)) {
        this.isGradeOfferedDisabled = true;
        this.moveSchoolObject.grades = [];
      } else {
        this.isGradeOfferedDisabled = false;
      }

      await this.fireFormValidate();
    },
    async fireFormValidate() {
      await this.$nextTick();
      this.validateForm();
    },
    resetForm() {
      this.$refs.moveSchoolForm.reset();
    },
    sortGrades() {
      const gradeList = [];
      for (const grade of this.schoolGradeTypes) {
        let schoolGradeType = this.moveSchoolObject.grades.find((rawGrade) => rawGrade.schoolGradeCode === grade.schoolGradeCode);
        if (schoolGradeType) {
          gradeList.push(grade);
        }
      }
      this.moveSchoolObject.grades = gradeList;
    },
    sortNLC() {
      this.moveSchoolObject.neighborhoodLearning = sortBy(this.moveSchoolObject.neighborhoodLearning, ['neighborhoodLearningTypeCode']);
    },
    validateForm() {
      const isValid = this.$refs.moveSchoolForm.validate();
      this.isMoveFormValid = isValid.valid;
    },
    resetAddressForms() {
      this.moveSchoolObject.mailingAddrLine1 = null;
      this.moveSchoolObject.mailingAddrLine2 = null;
      this.moveSchoolObject.mailingAddrCity = null;
      this.moveSchoolObject.mailingAddrProvince = null;
      this.moveSchoolObject.mailingAddrCountry = null;
      this.moveSchoolObject.mailingAddrPostal = null;
      this.moveSchoolObject.physicalAddrLine1 = null;
      this.moveSchoolObject.physicalAddrLine2 = null;
      this.moveSchoolObject.physicalAddrCity = null;
      this.moveSchoolObject.physicalAddrProvince = null;
      this.moveSchoolObject.physicalAddrCountry = null;
      this.moveSchoolObject.physicalAddrPostal = null;
    },
    isNumber,
    sortByNameValue
  },
};
</script>

<style scoped>
.sheetHeader {
    background-color: #003366;
    color: white;
    font-size: medium !important;
    font-weight: bolder !important;
}

.move-description {
    color: black !important;
    font-size: medium !important;
}
</style>
