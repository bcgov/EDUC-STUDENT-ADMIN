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
                    class="pt-0"
                    label="Facility Type"
                />
              </v-col>
              <v-col cols="4">
                <v-select
                    id='newSchoolOrganizationCodeInput'
                    :rules="[rules.required()]"
                    v-model="newSchool.organizationCode"
                    :items="schoolOrganizationTypes"
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
                    :rules="[rules.required()]"
                    v-model="newSchool.gradesOffered"
                    :items="schoolGradeTypes"
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
                    :rules="[rules.required()]"
                    v-model="newSchool.NLCActivity"
                    :items="schoolNeighborhoodLearningTypes"
                    item-value="neighborhoodLearningTypeCode"
                    item-text="label"
                    class="pt-0"
                    label="NLC Activity"
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="4">
                <h3>Contact Information</h3>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="4">
                <v-text-field
                    id='newSchoolPhoneNumberInput'
                    :rules="[rules.required(), rules.phoneNumber()]"
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
                    :rules="[rules.required(), rules.phoneNumber()]"
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
                    class="pt-0"
                    :maxlength="10"
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
                    class="pt-0"
                    :maxlength="10"
                    label="Website"
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="4">
                <h3>Mailing Address</h3>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="4">
                <v-text-field
                    id='newSchoolMailingAddressLine1Input'
                    :rules="[rules.required()]"
                    v-model="newSchool.mailingAddrLine1"
                    class="pt-0"
                    :maxlength="255"
                    label="Line 1"
                />
              </v-col>
              <v-col cols="4">
                <v-text-field
                    id='newSchoolMailingAddressLine2Input'
                    v-model="newSchool.mailingAddrLine2"
                    class="pt-0"
                    :maxlength="255"
                    label="Line 2"
                />
              </v-col>
              <v-col cols="4">
                <v-text-field
                    id='newContactMailingAddressCityInput'
                    :rules="[rules.required()]"
                    v-model="newSchool.mailingAddrCity"
                    class="pt-0"
                    :maxlength="255"
                    label="City"
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="4">
                <v-autocomplete
                    id='newSchoolMailingAddressProvinceInput'
                    :rules="[rules.required()]"
                    v-model="newSchool.mailingAddrProvince"
                    class="pt-0"
                    label="Province"
                    :items="this.provinceCodeValues"
                    item-text="label"
                    item-value="provinceCode"
                />
              </v-col>
              <v-col cols="4">
                <v-autocomplete
                    id='newSchoolMailingAddressCountryInput'
                    :rules="[rules.required()]"
                    v-model="newSchool.mailingAddrCountry"
                    class="pt-0"
                    label="Country"
                    :items="this.countryCodeValues"
                    item-text="label"
                    item-value="countryCode"
                />
              </v-col>
              <v-col cols="4">
                <v-text-field
                    id='newContactMailingAddressPostalCodeInput'
                    :rules="[rules.email()]"
                    v-model="newSchool.mailingAddrPostal"
                    class="pt-0"
                    :maxlength="7"
                    label="Postal Code"
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="4">
                <v-row>
                  <h3>Physical Address</h3>
                </v-row>
                <v-row class="pt-4">
                  <v-checkbox
                      dense
                      id="sameAsMailingCheckbox"
                      @click.native="clickSameAsAddressButton"
                      v-model="sameAsMailingCheckbox"
                      label="Same as mailing address"
                      class="mt-n3 pt-0"
                  ></v-checkbox>
                </v-row>
              </v-col>
            </v-row>
            <v-row v-if="!sameAsMailingCheckbox">
              <v-row>
                <v-col cols="4">
                  <v-text-field
                      id='newSchoolPhysicalAddressLine1Input'
                      :rules="[rules.required()]"
                      v-model="newSchool.physicalAddrLine1"
                      class="pt-0"
                      :maxlength="255"
                      label="Line 1"
                  />
                </v-col>
                <v-col cols="4">
                  <v-text-field
                      id='newSchoolPhysicalAddressLine2Input'
                      v-model="newSchool.physicalAddrLine2"
                      class="pt-0"
                      :maxlength="255"
                      label="Line 2"
                  />
                </v-col>
                <v-col cols="4">
                  <v-text-field
                      id='newContactPhysicalAddressCityInput'
                      :rules="[rules.required()]"
                      v-model="newSchool.physicalAddrCity"
                      class="pt-0"
                      :maxlength="255"
                      label="City"
                  />
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="4">
                  <v-autocomplete
                      id='newSchoolPhysicalAddressProvinceInput'
                      :rules="[rules.required()]"
                      v-model="newSchool.physicalAddrProvince"
                      class="pt-0"
                      label="Province"
                      :items="this.provinceCodeValues"
                      item-text="label"
                      item-value="provinceCode"
                  />
                </v-col>
                <v-col cols="4">
                  <v-autocomplete
                      id='newSchoolPhysicalAddressCountryInput'
                      :rules="[rules.required()]"
                      v-model="newSchool.physicalAddrCountry"
                      class="pt-0"
                      label="Country"
                      :items="this.countryCodeValues"
                      item-text="label"
                      item-value="countryCode"
                  />
                </v-col>
                <v-col cols="4">
                  <v-text-field
                      id='newContactPhysicalAddressPostalCodeInput'
                      :rules="[rules.email()]"
                      v-model="newSchool.physicalAddrPostal"
                      class="pt-0"
                      :maxlength="7"
                      label="Postal Code"
                  />
                </v-col>
              </v-row>


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
  },
  data() {
    return {
      isFormValid: false,
      processing: false,
      newSchool: {
        districtName: null,
        authorityName: null,
        openDate: null,
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
      schoolFacilityTypes: [],
      schoolCategoryTypes: [],
      schoolOrganizationTypes: [],
      schoolNeighborhoodLearningTypes: [],
      schoolGradeTypes: [],
      sameAsMailingCheckbox: true,
      provinceCodeValues: [],
      countryCodeValues: [],

    };
  },
  computed: {
    ...mapGetters('auth', ['isAuthenticated','userInfo']),
    ...mapState('institute', ['facilityTypeCodes']),
    ...mapState('institute', ['schoolCategoryTypeCodes']),
    ...mapState('institute', ['schoolOrganizationTypeCodes']),
    ...mapState('institute', ['schoolNeighborhoodLearningCodes']),
    ...mapState('institute', ['gradeCodes']),
    ...mapState('institute', ['provinceCodes']),
    ...mapState('institute', ['countryCodes']),
    ...mapState('institute', ['schoolCategoryFacilityTypesMap']),

    allowedFacilityTypeCodesForSchoolCategoryCode(){
      if(this.newSchool?.categoryCode){
        return this.schoolCategoryFacilityTypesMap[this.newSchool?.categoryCode]?.map(schoolCatFacilityTypeCode =>  this.facilityTypeCodes.find(facTypCode=> facTypCode.facilityTypeCode === schoolCatFacilityTypeCode));
      }else {
        return [];
      }
    },
  },
  created() {
    this.$store.dispatch('institute/getFacilityTypeCodes').then(() => {
      this.schoolFacilityTypes = this.facilityTypeCodes;
    });
    this.$store.dispatch('institute/getSchoolCategoryTypeCodes').then(() => {
      this.schoolCategoryTypes = this.schoolCategoryTypeCodes;
    });
    this.$store.dispatch('institute/getSchoolOrganizationTypeCodes').then(() => {
      this.schoolOrganizationTypes = this.schoolOrganizationTypeCodes;
    });
    this.$store.dispatch('institute/getSchoolNeighborhoodLearningCodes').then(() => {
      this.schoolNeighborhoodLearningTypes = this.schoolNeighborhoodLearningCodes;
    });
    this.$store.dispatch('institute/getGradeCodes').then(() => {
      this.schoolGradeTypes = this.gradeCodes;
    });
    this.$store.dispatch('institute/getProvinceCodes').then(() => {
      this.provinceCodeValues = this.provinceCodes.filter(province =>  province.provinceCode === 'BC' || province.provinceCode === 'YT');
    });
    this.$store.dispatch('institute/getCountryCodes').then(() => {
      this.countryCodeValues = this.countryCodes;
    });
    this.$store.dispatch('institute/getSchoolCategoryFacilityTypesMap');
  },
  methods: {
    saveNewSchoolOpenDate(date) {
      this.$refs.newSchoolOpenDateFilter.save(date);
    },
    closeNewSchoolPage() {
      this.resetForm();
      this.$emit('newSchool:closeNewSchoolPage');
    },
    addNewSchool() {
      this.processing = true;

      ApiService.apiAxios.post(`${Routes.institute.ROOT_ENDPOINT}/????`, this.newSchool)
        .then(() => {
          this.setSuccessAlert('Success! The school has been created.');
          this.resetForm();
          this.$emit('newSchool:addNewSchool');
        })
        .catch(error => {
          this.setFailureAlert('An error occurred while sending message. Please try again later.');
          console.log(error);
        })
        .finally(() => {
          this.processing = false;
        });
    },
    async clickSameAsAddressButton(){
      await this.$nextTick();
      this.validateForm();
    },
    resetForm() {
      this.$refs.newSchoolForm.reset();
    },
    validateForm() {
      this.isFormValid = this.$refs.newSchoolForm.validate();
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
</style>