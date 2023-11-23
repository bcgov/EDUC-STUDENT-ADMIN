<template>
  <v-card id="newSchoolVCard">
    <v-card-title class="sheetHeader pt-1 pb-1">
      New School
    </v-card-title>
    <v-divider />
    <v-card-text>
      <v-form
        ref="newSchoolForm"
        v-model="isFormValid"
      >
        <v-row class="d-flex justify-center">
          <v-col>
            <v-row>
              <v-col cols="6">
                <v-text-field
                  id="newSchoolNameInput"
                  v-model="newSchool.displayName"
                  :rules="[rules.required()]"
                  class="pt-0"
                  variant="underlined"
                  :maxlength="255"
                  label="School Name"
                  @update:model-value="validateForm"
                />
              </v-col>
              <v-col cols="6">
                <v-text-field
                  id="legacySafeSchoolNameInput"
                  v-model="newSchool.displayNameNoSpecialChars"
                  :rules="[rules.noSpecialCharactersSchDisAuthName(), rules.specialCharactersInSchDisName(newSchool.displayName)]"
                  class="pt-0"
                  variant="underlined"
                  :maxlength="255"
                  label="Legacy Safe School Name"
                  @update:model-value="validateForm"
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="4">
                <v-autocomplete
                  id="district-text-field"
                  v-model="newSchool.districtID"
                  label="District"
                  :rules="[rules.required()]"
                  item-value="districtId"
                  item-title="districtNumberName"
                  variant="underlined"
                  :items="filteredDistrictNames"
                  :disabled="schoolDistrictDisabled"
                  clearable
                  @update:model-value="schoolDistrictChanged"
                />
              </v-col>
              <v-col cols="4">
                <v-autocomplete
                  id="authority-text-field"
                  v-model="newSchool.independentAuthorityId"
                  label="Authority"
                  item-value="authorityID"
                  item-title="authorityCodeName"
                  variant="underlined"
                  :items="authorityNames"
                  :disabled="authorityDisabled"
                  :rules="[authorityRule]"
                  clearable
                />
              </v-col>
              <v-col cols="4">
                <DatePicker
                  id="newSchoolOpenDateTextField"
                  v-model="newSchool.openedDate"
                  label="Open Date"
                  :rules="[rules.required()]"
                  model-type="yyyy-MM-dd'T'00:00:00"
                  @update:model-value="validateForm"
                />
              </v-col>
            </v-row>
            <!-- -->
            <v-row>
              <v-col cols="4">
                <v-select
                  id="newSchoolCategoryInput"
                  v-model="newSchool.schoolCategoryCode"
                  :rules="[rules.required()]"
                  :items="schoolCategoryTypeCodes"
                  item-value="schoolCategoryCode"
                  item-title="label"
                  variant="underlined"
                  class="pt-0"
                  label="School Category"
                  :disabled="schoolCategoryDisabled"
                  @update:model-value="schoolCategoryChanged"
                />
              </v-col>
              <v-col cols="4">
                <v-select
                  id="newSchoolFacilityTypeInput"
                  v-model="newSchool.facilityTypeCode"
                  :rules="[rules.required()]"
                  :items="allowedFacilityTypeCodesForSchoolCategoryCode"
                  item-value="facilityTypeCode"
                  item-title="label"
                  variant="underlined"
                  :disabled="isFacilityTypeDisabled"
                  class="pt-0"
                  label="Facility Type"
                />
              </v-col>
              <v-col cols="4">
                <v-select
                  id="newSchoolOrganizationCodeInput"
                  v-model="newSchool.schoolOrganizationCode"
                  :rules="[rules.required()]"
                  :items="schoolOrganizationTypeCodes"
                  item-value="schoolOrganizationCode"
                  item-title="label"
                  variant="underlined"
                  class="pt-0"
                  label="School Organization"
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="4">
                <v-select
                  id="newSchoolGradesOfferedInput"
                  v-model="newSchool.grades"
                  :items="filteredGradeOptions"
                  item-value="schoolGradeCode"
                  item-title="label"
                  :disabled="isGradeOfferedDisabled"
                  class="pt-0"
                  multiple
                  variant="underlined"
                  return-object
                  label="Grades Offered"
                  @input="sortGrades"
                />
              </v-col>
              <v-col cols="4">
                <v-select
                  id="newSchoolNLCActivityInput"
                  v-model="newSchool.neighborhoodLearning"
                  :items="schoolNeighborhoodLearningCodes"
                  item-value="neighborhoodLearningTypeCode"
                  item-title="label"
                  class="pt-0"
                  multiple
                  variant="underlined"
                  return-object
                  label="NLC Activity"
                  @input="sortNLC"
                />
              </v-col>
              <v-col cols="4">
                <v-select
                  id="newSchoolReportingRequirementInput"
                  v-model="newSchool.schoolReportingRequirementCode"
                  :rules="[rules.required()]"
                  :items="schoolReportingRequirementCodes"
                  item-value="schoolReportingRequirementCode"
                  item-title="label"
                  variant="underlined"
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
                  v-model="newSchool.phoneNumber"
                  :rules="[rules.phoneNumber()]"
                  class="pt-0"
                  :maxlength="10"
                  variant="underlined"
                  label="Phone"
                  @keypress="isNumber($event)"
                />
              </v-col>
              <v-col cols="4">
                <v-text-field
                  id="newSchoolFaxNumberInput"
                  v-model="newSchool.faxNumber"
                  :rules="[rules.phoneNumber()]"
                  class="pt-0"
                  :maxlength="10"
                  variant="underlined"
                  label="Fax"
                  @keypress="isNumber($event)"
                />
              </v-col>
              <v-col cols="4">
                <v-text-field
                  id="newContactEmailInput"
                  v-model="newSchool.email"
                  :rules="[rules.email()]"
                  :maxlength="255"
                  variant="underlined"
                  class="pt-0"
                  label="Email"
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col
                class="pt-0"
                cols="4"
              >
                <v-text-field
                  id="newContactAltPhoneNumberInput"
                  v-model="newSchool.website"
                  :rules="[rules.website()]"
                  :maxlength="255"
                  variant="underlined"
                  class="pt-0"
                  label="Website"
                />
              </v-col>
            </v-row>

            <v-row
              no-gutters
              class="mt-5"
            >
              <v-col class="mt-1 d-flex justify-start">
                <v-icon color="#1976d2">
                  {{
                    addressButton.icon
                  }}
                </v-icon>
                <a
                  class="ml-1 toggle"
                  @click="toggleAddressForm"
                >{{
                  addressButton.label
                }}</a>
              </v-col>
            </v-row>

            <v-row v-if="showAddress">
              <v-col>
                <v-row
                  no-gutters
                  class="mt-5"
                >
                  <v-col cols="4">
                    <h3>Mailing Address</h3>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="4">
                    <v-text-field
                      id="newSchoolMailingAddressLine1Input"
                      v-model="mailingAddress.addressLine1"
                      class="pt-0 pb-5"
                      :rules="[rules.required(), rules.noSpecialCharactersAddress()]"
                      :maxlength="255"
                      variant="underlined"
                      label="Line 1"
                      hide-details="auto"
                    />
                  </v-col>
                  <v-col cols="4">
                    <v-text-field
                      id="newSchoolMailingAddressLine2Input"
                      v-model="mailingAddress.addressLine2"
                      class="pt-0 pb-5"
                      :rules="[rules.noSpecialCharactersAddress()]"
                      :maxlength="255"
                      variant="underlined"
                      label="Line 2"
                      hide-details="auto"
                    />
                  </v-col>
                  <v-col cols="4">
                    <v-text-field
                      id="newContactMailingAddressCityInput"
                      v-model="mailingAddress.city"
                      class="pt-0 pb-5"
                      label="City"
                      :rules="[rules.required(), rules.noSpecialCharactersAddress()]"
                      :maxlength="255"
                      variant="underlined"
                      hide-details="auto"
                    />
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="4">
                    <v-select
                      id="newSchoolMailingAddressProvinceInput"
                      v-model="mailingAddress.provinceCode"
                      :rules="[rules.required()]"
                      class="pt-0"
                      label="Province"
                      :items="provincialCodes"
                      variant="underlined"
                      item-title="label"
                      item-value="provinceCode"
                    />
                  </v-col>
                  <v-col cols="4">
                    <v-select
                      id="newSchoolMailingAddressCountryInput"
                      v-model="mailingAddress.countryCode"
                      :rules="[rules.required()]"
                      class="pt-0"
                      label="Country"
                      :items="countryCodes"
                      item-title="label"
                      variant="underlined"
                      item-value="countryCode"
                    />
                  </v-col>
                  <v-col cols="4">
                    <v-text-field
                      id="newContactMailingAddressPostalCodeInput"
                      v-model="mailingAddress.postal"
                      :rules="[rules.required(), rules.postalCode()]"
                      variant="underlined"
                      class="pt-0"
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
                        dense
                        label="Same as Mailing Address"
                        class="mt-n3 pt-0"
                        @update:model-value="combobulatePhysicalAddress"
                      />
                    </v-row>
                    <div v-else>
                      <v-row>
                        <v-col cols="4">
                          <v-text-field
                            id="newSchoolPhysicalAddressLine1Input"
                            v-model="physicalAddress.addressLine1"
                            :rules="[rules.required(), rules.noSpecialCharactersAddress()]"
                            class="pt-0 pb-5"
                            :maxlength="255"
                            variant="underlined"
                            label="Line 1"
                            hide-details="auto"
                          />
                        </v-col>
                        <v-col cols="4">
                          <v-text-field
                            id="newSchoolPhysicalAddressLine2Input"
                            v-model="physicalAddress.addressLine2"
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
                            id="newContactPhysicalAddressCityInput"
                            v-model="physicalAddress.city"
                            :rules="[rules.required(), rules.noSpecialCharactersAddress()]"
                            class="pt-0 pb-5"
                            :maxlength="255"
                            label="City"
                            variant="underlined"
                            hide-details="auto"
                          />
                        </v-col>
                      </v-row>
                      <v-row>
                        <v-col cols="4">
                          <v-select
                            id="newSchoolPhysicalAddressProvinceInput"
                            v-model="physicalAddress.provinceCode"
                            :rules="[rules.required()]"
                            class="pt-0"
                            label="Province"
                            :items="provincialCodes"
                            variant="underlined"
                            item-title="label"
                            item-value="provinceCode"
                          />
                        </v-col>
                        <v-col cols="4">
                          <v-select
                            id="newSchoolPhysicalAddressCountryInput"
                            v-model="physicalAddress.countryCode"
                            :rules="[rules.required()]"
                            class="pt-0"
                            label="Country"
                            :items="countryCodes"
                            variant="underlined"
                            item-title="label"
                            item-value="countryCode"
                          />
                        </v-col>
                        <v-col cols="4">
                          <v-text-field
                            id="newContactPhysicalAddressPostalCodeInput"
                            v-model="physicalAddress.postal"
                            :rules="[rules.required(), rules.postalCode()]"
                            variant="underlined"
                            class="pt-0"
                            :maxlength="6"
                            label="Postal Code"
                          />
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
                            dense
                            label="Same as Mailing Address"
                            class="mt-n3 pt-0"
                            @update:model-value="combobulatePhysicalAddress"
                          />
                        </v-col>
                      </v-row>
                    </div>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <h3 class="mb-2">
                  Initial EDX School Account Manager
                </h3>
                <p>
                  This user will be set up as an account manager for the school. They will be sent the primary
                  activation code for the new school and an activation email to set up their own account.
                </p>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-text-field
                  v-model="initialUser.firstName"
                  class="pt-0 pb-5"
                  variant="underlined"
                  :maxlength="255"
                  label="First name"
                  hide-details="auto"
                  @update:model-value="validateForm"
                />
              </v-col>
              <v-col>
                <v-text-field
                  v-model="initialUser.lastName"
                  class="pt-0 pb-5"
                  :rules="[userFieldRules().lastName, requiredForOffshoreOrIndependentSchool]"
                  variant="underlined"
                  :maxlength="255"
                  label="Last Name"
                  hide-details="auto"
                  @update:model-value="validateForm"
                />
              </v-col>
              <v-col>
                <v-text-field
                  v-model="initialUser.email"
                  class="pt-0 pb-5"
                  :rules="[userFieldRules().email, requiredForOffshoreOrIndependentSchool]"
                  variant="underlined"
                  :maxlength="255"
                  label="Email"
                  hide-details="auto"
                  @update:model-value="validateForm"
                />
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
        @click-action="closeNewSchoolPage"
      />
      <PrimaryButton
        id="newSchoolPostBtn"
        text="Save"
        width="7rem"
        :disabled="!isFormValid"
        :loading="processing"
        @click-action="addNewSchool"
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
import {isNumber} from '@/utils/institute/formInput';
import {findUpcomingDate} from '@/utils/dateHelpers';
import {sortBy, cloneDeep} from 'lodash';
import {authStore} from '@/store/modules/auth';
import {instituteStore} from '@/store/modules/institute';
import DatePicker from '@/components/util/DatePicker.vue';
import { PERMISSION, hasRequiredPermission } from '@/utils/constants/Permission';

export default {
  name: 'NewSchoolPage',
  components: {
    DatePicker,
    PrimaryButton
  },
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
  emits: ['newSchool:closeNewSchoolPage'],
  data() {
    return {
      isFormValid: false,
      processing: false,
      isFacilityTypeDisabled: false,
      isGradeOfferedDisabled: false,
      authorityDisabled: true,
      independentArray: ['INDEPEND', 'INDP_FNS'],
      offshoreArray: ['OFFSHORE'],
      requiredAuthoritySchoolCategories: ['INDEPEND', 'INDP_FNS', 'OFFSHORE'],
      noGradeSchoolCategory: ['POST_SEC', 'EAR_LEARN'],
      districtSchoolCategoryConstraints: [
        {districtRegionCode: 'OFFSHORE', schoolCategory: 'OFFSHORE'},
        {districtRegionCode: 'PSI', schoolCategory: 'POST_SEC'},
        {districtRegionCode: 'YUKON', schoolCategory: 'YUKON'}
      ],
      schoolDistrictDisabled: false,
      schoolCategoryDisabled: false,
      newSchool: {
        districtID: null,
        independentAuthorityId: null,
        displayName: null,
        displayNameNoSpecialChars: null,
        openedDate: this.calculateDefaultOpenDate(),
        schoolCategoryCode: null,
        facilityTypeCode: null,
        schoolOrganizationCode: null,
        schoolReportingRequirementCode: null,
        grades: [],
        neighborhoodLearning: [],
        phoneNumber: null,
        faxNumber: null,
        email: null,
        website: null,
      },
      addresses: [
        {
          addressLine1: null,
          addressLine2: null,
          city: null,
          postal: null,
          addressTypeCode: 'MAILING',
          provinceCode: null,
          countryCode: null
        },
        {
          addressLine1: null,
          addressLine2: null,
          city: null,
          postal: null,
          addressTypeCode: 'PHYSICAL',
          provinceCode: null,
          countryCode: null
        }
      ],
      initialUser: {
        firstName: '',
        lastName: '',
        email: ''
      },
      rules: Rules,
      sameAsMailingCheckbox: true,
      showAddress: false,
      addressButton: {
        label: '',
        icon: ''
      }
    };
  },
  computed: {
    ...mapState(authStore, ['isAuthenticated', 'userInfo']),
    ...mapState(instituteStore, ['activeFacilityTypeCodes', 'activeSchoolCategoryTypeCodes', 'activeSchoolOrganizationTypeCodes', 'schoolReportingRequirementTypeCodes', 'activeSchoolNeighborhoodLearningCodes', 'gradeOptions', 'activeProvinceCodes', 'activeCountryCodes', 'schoolCategoryFacilityTypesMap', 'schoolReportingRequirementTypeCodes']),

    physicalAddress() { return this.addresses.find(a => a.addressTypeCode === 'PHYSICAL'); },
    mailingAddress() { return this.addresses.find(a => a.addressTypeCode === 'MAILING'); },
    allowedFacilityTypeCodesForSchoolCategoryCode() {
      if (!this.activeFacilityTypeCodes || !this.newSchool?.schoolCategoryCode) {
        return [];
      }
      let facilityTypes = this.schoolCategoryFacilityTypesMap[this.newSchool?.schoolCategoryCode]?.map(schoolCatFacilityTypeCode => this.activeFacilityTypeCodes.find(facTypCode => facTypCode.facilityTypeCode === schoolCatFacilityTypeCode));
      return sortBy(facilityTypes, ['displayOrder']);
    },
    filteredDistrictNames() {
      let returnedDistrictNames = this.districtNames ? this.districtNames : [];
      if(this.canAddOtherSchoolTypes) {
        returnedDistrictNames = returnedDistrictNames.filter(district => district?.districtRegionCode !== 'OFFSHORE');
      }

      if (this.canAddOffshoreSchools) {
        returnedDistrictNames = returnedDistrictNames.concat(this.districtNames.filter(district => district?.districtRegionCode === 'OFFSHORE'));
      }
      return sortBy(returnedDistrictNames, ['districtNumberName']);
    },
    schoolCategoryTypeCodes() {
      let returnedCodes = [];
      let publicOnlyTypes = this.activeSchoolCategoryTypeCodes ? this.activeSchoolCategoryTypeCodes.filter(cat => !this.independentArray.includes(cat.schoolCategoryCode) && !this.offshoreArray.includes(cat.schoolCategoryCode)) : [];
      if(this.canAddOtherSchoolTypes) {
        returnedCodes = publicOnlyTypes;
      }
      if (this.canAddIndependentSchools) {
        returnedCodes = returnedCodes.concat(this.activeSchoolCategoryTypeCodes.filter(cat => this.independentArray.includes(cat.schoolCategoryCode)));
      }
      if(this.canAddOffshoreSchools) {
        returnedCodes = returnedCodes.concat(this.activeSchoolCategoryTypeCodes?.filter(cat => this.offshoreArray.includes(cat.schoolCategoryCode)));
      }
      return sortBy(returnedCodes, ['displayOrder']);
    },
    schoolOrganizationTypeCodes() {
      return this.activeSchoolOrganizationTypeCodes ? this.activeSchoolOrganizationTypeCodes : [];
    },
    schoolNeighborhoodLearningCodes() {
      return this.activeSchoolNeighborhoodLearningCodes ? sortBy(this.activeSchoolNeighborhoodLearningCodes, ['neighborhoodLearningTypeCode']) : [];
    },
    displayPhysicalAddress() {
      return this.newSchool?.schoolCategoryCode !== 'OFFSHORE';
    },
    filteredGradeOptions() {
      if (!this.gradeOptions) {
        return [];
      }
      if (!this.independentArray.includes(this.newSchool.schoolCategoryCode)) {
        return this.gradeOptions.filter(gradeObj => gradeObj.schoolGradeCode !== 'KINDHALF');
      }
      return this.gradeOptions;
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
    },
    schoolReportingRequirementCodes() {
      return this.schoolReportingRequirementTypeCodes ? this.schoolReportingRequirementTypeCodes : [];
    },
    canAddIndependentSchools() {
      return this.hasRequiredPermission(this.userInfo, PERMISSION.EDIT_INDEPENDENT_SCHOOL_PERMISSION);
    },
    canAddOffshoreSchools() {
      return this.hasRequiredPermission(this.userInfo, PERMISSION.EDIT_OFFSHORE_SCHOOL_PERMISSION);
    },
    canAddOtherSchoolTypes() {
      return this.hasRequiredPermission(this.userInfo, PERMISSION.EDIT_SCHOOL_PERMISSION);
    },
  },
  mounted() {
    this.validateForm();
    this.addressButton = {
      icon: 'mdi-plus-thick',
      label: 'Add Address'
    };
  },
  created() {
    const instStore = instituteStore();
    instStore.getAllActiveFacilityTypeCodes();
    instStore.getAllActiveSchoolCategoryTypeCodes();
    instStore.getAllActiveSchoolOrganizationTypeCodes();
    instStore.getAllGradeCodes();
    instStore.getAllActiveSchoolNeighborhoodLearningCodes();
    instStore.getAllActiveProvinceCodes();
    instStore.getAllActiveCountryCodes();
    instStore.getSchoolCategoryFacilityTypesMap();
    instStore.getSchoolReportingRequirementTypeCodes();
    this.preselectSchoolDistrict();
  },
  methods: {
    hasRequiredPermission,
    userFieldRules() {
      const message = 'Required';
      return {
        lastName: this.rules
          .requiredWithOtherFieldValues([this.initialUser?.firstName, this.initialUser?.email], message),
        email: v => {
          const requiredFieldsValid = this.rules
            .requiredWithOtherFieldValues([this.initialUser?.firstName, this.initialUser?.lastName], message)(v);

          if (requiredFieldsValid !== true) {
            return requiredFieldsValid;
          }
          return this.rules.email()(v);
        }
      };
    },
    requiredForOffshoreOrIndependentSchool(formValue) {
      const categories = [...this.offshoreArray, ...this.independentArray];
      return this.rules.requiredIf(categories.includes(this.newSchool.schoolCategoryCode))(formValue);
    },
    preselectSchoolDistrict() {
      if (this.filteredDistrictNames?.length !== 1) {
        return;
      }
      this.newSchool.districtID = this.filteredDistrictNames[0].districtId;
      this.schoolDistrictDisabled = true;
      this.schoolDistrictChanged();
    },
    constrainSchoolCategoryByDistrict(districtRegionCode) {
      const schoolCategory = this.districtSchoolCategoryConstraints.find(c => c.districtRegionCode === districtRegionCode)?.schoolCategory;
      this.schoolCategoryDisabled = schoolCategory !== undefined;
      if (schoolCategory && this.newSchool.schoolCategoryCode !== schoolCategory) {
        this.newSchool.schoolCategoryCode = schoolCategory;
        this.schoolCategoryChanged();
      }
    },
    authorityRule(value) {
      if (this.newSchool.schoolCategoryCode && this.requiredAuthoritySchoolCategories.includes(this.newSchool.schoolCategoryCode) && !value) {
        return 'Required';
      } else {
        return true;
      }
    },
    calculateDefaultOpenDate() {
      return findUpcomingDate(7, 1).toString();
    },
    closeNewSchoolPage() {
      this.resetForm();
      this.$emit('newSchool:closeNewSchoolPage');
    },
    prepareAddressPayload() {
      if (!this.showAddress) return [];

      const addresses = cloneDeep(this.addresses);
      if (this.sameAsMailingCheckbox) {
        addresses[1] = {...addresses[0], addressTypeCode: 'PHYSICAL'};
      }
      return addresses;
    },
    addNewSchool() {
      this.processing = true;


      ApiService.apiAxios.post(`${Routes.edx.CREATE_SCHOOL}`, {
        school: {
          ...this.newSchool,
          addresses: this.prepareAddressPayload()
        },
        user: this.initialUser
      })
        .then(() => {
          this.setSuccessAlert('Success! The school is being created.');
          this.resetForm();
        })
        .catch(error => {
          this.setFailureAlert(error.response?.data?.message || error.message);
          console.log(error);
        })
        .finally(() => {
          this.processing = false;
          this.closeNewSchoolPage();
        });
    },
    schoolDistrictChanged() {
      this.schoolCategoryDisabled = false;

      const districtRegionCode = this.districtNames
        .find(d => d.districtId === this.newSchool.districtID)?.districtRegionCode;

      if (districtRegionCode) {
        this.constrainSchoolCategoryByDistrict(districtRegionCode);
      }
    },
    async schoolCategoryChanged() {
      if (this.allowedFacilityTypeCodesForSchoolCategoryCode.length <= 1) {
        this.isFacilityTypeDisabled = true;
        this.newSchool.facilityTypeCode = this.allowedFacilityTypeCodesForSchoolCategoryCode[0]?.facilityTypeCode ?? null;
      } else {
        this.isFacilityTypeDisabled = false;
        this.newSchool.facilityTypeCode = null;
      }
      if (this.newSchool.schoolCategoryCode && this.requiredAuthoritySchoolCategories.includes(this.newSchool.schoolCategoryCode)) {
        this.authorityDisabled = false;
      } else {
        this.authorityDisabled = true;
        this.newSchool.authorityName = null;
        this.newSchool.independentAuthorityId = null;
      }
      if (this.newSchool.schoolCategoryCode && this.noGradeSchoolCategory.includes(this.newSchool.schoolCategoryCode)) {
        this.isGradeOfferedDisabled = true;
        this.newSchool.grades = null;
      } else {
        this.isGradeOfferedDisabled = false;
      }
      await this.validateForm();
    },
    resetForm() {
      this.$refs.newSchoolForm.reset();
    },
    sortGrades() {
      this.newSchool.grades = sortBy(this.newSchool.grades, ['displayOrder']);
    },
    sortNLC() {
      this.newSchool.neighborhoodLearning = sortBy(this.newSchool.neighborhoodLearning, ['neighborhoodLearningTypeCode']);
    },
    async validateForm() {
      if (this.$refs.newSchoolForm) {
        const valid = await this.$refs.newSchoolForm.validate();
        this.isFormValid = valid.valid;
      }
    },
    toggleAddressForm() {
      this.showAddress = !this.showAddress;
      this.addressButton = {
        icon: !this.showAddress ? 'mdi-plus-thick ' : 'mdi-minus',
        label: !this.showAddress ? 'Add Address' : 'Remove Address'
      };
      this.resetAddressForms();
      this.$nextTick(() => {
        this.validateForm();
      });
    },
    combobulatePhysicalAddress() {
      const addressTypeCode = 'PHYSICAL';
      if (this.sameAsMailingCheckbox) {
        this.addresses[1] = {...this.addresses[1], addressTypeCode};
      } else {
        this.addresses[1] = {
          addressTypeCode,
          addressLine1: null,
          addressLine2: null,
          city: null,
          postal: null,
          provinceCode: null,
          countryCode: null,
        };
      }
      this.$nextTick(() => {
        this.validateForm();
      });
    },
    resetAddressForms() {
      this.addresses = ['MAILING', 'PHYSICAL'].map(addressTypeCode => ({
        addressTypeCode,
        addressLine1: null,
        addressLine2: null,
        city: null,
        postal: null,
        provinceCode: null,
        countryCode: null
      }));
    },
    isNumber,
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

#newSchoolVCard {
    border-radius: 5px;
}

:deep(.dp__input) {
    display: none;
}

:deep(.dp__icon) {
    display: none;
}

.toggle {
    font-size: 15px;
}
</style>
