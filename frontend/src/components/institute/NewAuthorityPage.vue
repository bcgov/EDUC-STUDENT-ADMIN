<template>
  <v-card id="newAuthorityVCard">
    <v-card-title class="sheetHeader pt-1 pb-1">New Authority</v-card-title>
    <v-divider></v-divider>
    <v-card-text>
      <v-form ref="newAuthorityForm" v-model="isFormValid">
        <v-row class="d-flex justify-center">
          <v-col>
            <v-text-field
                id='newAuthorityNameInput'
                v-model="newAuthority.authorityName"
                class="pt-0"
                :maxlength="255"
                :rules="[rules.required(), rules.noSpecialCharacters()]"
                label="Authority Name"
            />
            <v-row>
              <v-col cols="6">
                <v-select
                    id="authority-text-field"
                    label="Authority Type"
                    item-value="authorityTypeCode"
                    item-text="label"
                    :items="authorityTypes"
                    :rules="[rules.required()]"
                    v-model="newAuthority.authorityTypeCode"
                    clearable>
                </v-select>
              </v-col>
              <v-col cols="6">
                <v-menu
                    id="newAuthorityOpenDatePicker"
                    ref="newAuthorityOpenDateFilter"
                    :close-on-content-click="false"
                    transition="scale-transition"
                    offset-y
                    min-width="auto"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                        id="newAuthorityOpenDateTextField"
                        :rules="[rules.required()]"
                        class="pt-4 mt-0"
                        v-model="newAuthority.openDate"
                        label="Open Date"
                        prepend-inner-icon="mdi-calendar"
                        clearable
                        readonly
                        v-bind="attrs"
                        v-on="on"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                      v-model="newAuthority.openDate"
                      :active-picker.sync="newAuthorityOpenDatePicker"
                      @change="saveNewAuthorityOpenDate"
                      :max="new Date(this.localDate.now().toString()).toISOString().substr(0, 10)"
                  ></v-date-picker>
                </v-menu>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-text-field
                    id='newAuthorityEmailInput'
                    :rules="[rules.required(), rules.email()]"
                    v-model="newAuthority.email"
                    class="pt-0"
                    :maxlength="255"
                    label="Email"
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="6">
                <v-text-field
                    id='newAuthorityPhoneNumberInput'
                    :rules="[rules.required(), rules.phoneNumber()]"
                    v-model="newAuthority.phoneNumber"
                    class="pt-0"
                    :maxlength="10"
                    label="Phone"
                    @keypress="isNumber($event)"
                />
              </v-col>
              <v-col cols="6">
                <v-text-field
                    id='newAuthorityFaxNumberInput'
                    :rules="[rules.phoneNumber('Fax number must be valid')]"
                    v-model="newAuthority.faxNumber"
                    class="pt-0"
                    :maxlength="10"
                    label="Fax"
                    @keypress="isNumber($event)"
                />
              </v-col>
            </v-row>
            <v-row>
            <v-col cols="6">
                <h3>Mailing Address</h3>

                <v-text-field
                    id='newAuthorityMailingAddressLine1Input'
                    :rules="[rules.required(), rules.noSpecialCharacters()]"
                    v-model="newAuthority.mailingAddrLine1"
                    class="pt-0"
                    :maxlength="255"
                    label="Line 1"
                />
                <v-text-field
                    id='newAuthorityMailingAddressLine2Input'
                    :rules="[rules.noSpecialCharacters()]"
                    v-model="newAuthority.mailingAddrLine2"
                    class="pt-0"
                    :maxlength="255"
                    label="Line 2"
                />
                <v-text-field
                    id='newContactMailingAddressCityInput'
                    :rules="[rules.required(), rules.noSpecialCharacters()]"
                    v-model="newAuthority.mailingAddrCity"
                    class="pt-0"
                    :maxlength="255"
                    label="City"
                />
                <v-autocomplete
                    id='newAuthorityMailingAddressProvinceInput'
                    :rules="[rules.required()]"
                    v-model="newAuthority.mailingAddrProvince"
                    class="pt-0"
                    label="Province"
                    :items="this.provinceCodeValues"
                    item-text="label"
                    item-value="provinceCode"
                />
                <v-autocomplete
                    id='newAuthorityMailingAddressCountryInput'
                    :rules="[rules.required()]"
                    v-model="newAuthority.mailingAddrCountry"
                    class="pt-0"
                    label="Country"
                    :items="this.countryCodeValues"
                    item-text="label"
                    item-value="countryCode"
                />
                <v-text-field
                    id='newContactMailingAddressPostalCodeInput'
                    :rules="[rules.required(), rules.postalCode()]"
                    v-model="newAuthority.mailingAddrPostal"
                    class="pt-0"
                    :maxlength="7"
                    label="Postal Code"
                />
            </v-col>
            <v-col v-if="showPhysicalAddress" cols="6">
                <v-row class="ml-lg-1">
                  <h3>Physical Address</h3>
                </v-row>
              <v-row class="ml-lg-1" v-if="!sameAsMailingCheckbox">
                    <v-text-field
                        id='newAuthorityPhysicalAddressLine1Input'
                        :rules="[rules.required(), rules.noSpecialCharacters()]"
                        v-model="newAuthority.physicalAddrLine1"
                        class="pt-0"
                        :maxlength="255"
                        label="Line 1"
                    />
                    <v-text-field
                        id='newAuthorityPhysicalAddressLine2Input'
                        :rules="[rules.noSpecialCharacters()]"
                        v-model="newAuthority.physicalAddrLine2"
                        class="pt-0"
                        :maxlength="255"
                        label="Line 2"
                    />
                    <v-text-field
                        id='newContactPhysicalAddressCityInput'
                        :rules="[rules.required(), rules.noSpecialCharacters()]"
                        v-model="newAuthority.physicalAddrCity"
                        class="pt-0"
                        :maxlength="255"
                        label="City"
                    />
                    <v-autocomplete
                        id='newAuthorityPhysicalAddressProvinceInput'
                        :rules="[rules.required(), rules.noSpecialCharacters()]"
                        v-model="newAuthority.physicalAddrProvince"
                        class="pt-0"
                        label="Province"
                        :items="this.provinceCodeValues"
                        item-text="label"
                        item-value="provinceCode"
                    />
                    <v-autocomplete
                        id='newAuthorityPhysicalAddressCountryInput'
                        :rules="[rules.required()]"
                        v-model="newAuthority.physicalAddrCountry"
                        class="pt-0"
                        label="Country"
                        :items="this.countryCodeValues"
                        item-text="label"
                        item-value="countryCode"
                    />
                    <v-text-field
                        id='newContactPhysicalAddressPostalCodeInput'
                        :rules="[rules.required(), rules.postalCode()]"
                        v-model="newAuthority.physicalAddrPostal"
                        class="pt-0"
                        :maxlength="7"
                        label="Postal Code"
                    />
                </v-row>
                <v-row class="ml-lg-1 pt-4">
                  <v-checkbox
                      dense
                      id="sameAsMailingCheckbox"
                      @click.native="clickSameAsAddressButton"
                      v-model="sameAsMailingCheckbox"
                      label="Same as Mailing Address"
                      class="mt-n3 pt-0"
                  ></v-checkbox>
              </v-row>
          </v-col>
        </v-row>
          </v-col>
       </v-row>
      </v-form>
    </v-card-text>
    <v-card-actions class="justify-end">
      <PrimaryButton id="cancelNewAuthorityBtn" secondary text="Cancel" @click.native="closeNewAuthorityPage"></PrimaryButton>
      <PrimaryButton id="newAuthorityPostBtn" text="Save" width="7rem" @click.native="addNewAuthority" :disabled="!isFormValid" :loading="processing"></PrimaryButton>
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
import {LocalDate} from '@js-joda/core';

export default {
  name: 'NewAuthorityPage',
  mixins: [alertMixin],
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
      localDate: LocalDate,
      newAuthority: {
        authorityName: null,
        authorityTypeCode: null,
        openDate: this.calculateDefaultOpenDate(),
        email: null,
        phoneNumber: null,
        faxNumber: null,
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
      newAuthorityOpenDatePicker: null,
      schoolFacilityTypes: [],
      schoolCategoryTypes: [],
      schoolOrganizationTypes: [],
      schoolNeighborhoodLearningTypes: [],
      schoolGradeTypes: [],
      sameAsMailingCheckbox: true,
      provinceCodeValues: [],
      countryCodeValues: [],
      authorityTypes: [],
      excludeShowingPhysicalAddressesForAuthoritiesOfType: [
        'OFFSHORE',
      ],
    };
  },
  computed: {
    ...mapGetters('auth', ['isAuthenticated','userInfo']),
    ...mapState('institute', ['authorityTypeCodes', 'provinceCodes', 'countryCodes']),
    showPhysicalAddress() {
      return !this.excludeShowingPhysicalAddressesForAuthoritiesOfType.includes(this.newAuthority.authorityTypeCode);
    }
  },
  created() {
    this.$store.dispatch('institute/getAllAuthorityTypeCodes').then(() => {
      this.authorityTypes = this.authorityTypeCodes;
    });
    this.$store.dispatch('institute/getAllProvinceCodes').then(() => {
      this.provinceCodeValues = this.provinceCodes.filter(province =>  province.provinceCode === 'BC' || province.provinceCode === 'YT');
    });
    this.$store.dispatch('institute/getAllCountryCodes').then(() => {
      this.countryCodeValues = this.countryCodes;
    });
  },
  methods: {
    calculateDefaultOpenDate() {
      return LocalDate.now().toString();
    },
    saveNewAuthorityOpenDate(date) {
      this.$refs.newAuthorityOpenDateFilter.save(date);
    },
    closeNewAuthorityPage() {
      this.resetForm();
      this.$emit('newAuthority:closeNewAuthorityPage');
    },
    addNewAuthority() {
      this.processing = true;

      ApiService.apiAxios.post(`${Routes.institute.ROOT_ENDPOINT}/authority`, this.newAuthority)
        .then((response) => {
          this.setSuccessAlert('Success! The authority has been created.');
          this.resetForm();
          this.openAuthority(response.data.independentAuthorityId);
        })
        .catch(error => {
          this.setFailureAlert('An error occurred while creating the authority. Please try again later.');
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
    openAuthority(authorityId){
      this.$router.push({name: 'authorityDetails', params: {authorityID: authorityId}});
    },
    resetForm() {
      this.$refs.newAuthorityForm.reset();
    },
    validateForm() {
      this.isFormValid = this.$refs.newAuthorityForm.validate();
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
