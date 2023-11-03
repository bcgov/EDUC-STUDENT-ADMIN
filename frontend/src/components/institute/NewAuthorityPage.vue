<template>
  <v-card id="newAuthorityVCard">
    <v-card-title class="sheetHeader pt-1 pb-1">
      New Authority
    </v-card-title>
    <v-divider />
    <v-card-text>
      <v-form
        ref="newAuthorityForm"
        v-model="isFormValid"
      >
        <v-row class="d-flex justify-center">
          <v-col>
            <v-text-field
              id="newAuthorityNameInput"
              v-model="newAuthority.authorityName"
              class="pt-0"
              variant="underlined"
              :maxlength="255"
              :rules="[rules.required(), rules.noSpecialCharactersSchDisAuthName()]"
              label="Authority Name"
            />
            <v-row>
              <v-col cols="6">
                <v-select
                  id="authority-text-field"
                  v-model="newAuthority.authorityTypeCode"
                  label="Authority Type"
                  item-value="authorityTypeCode"
                  item-title="label"
                  variant="underlined"
                  :items="filteredAuthorityTypeCodes"
                  :rules="[rules.required()]"
                  :clearable="true"
                />
              </v-col>
              <v-col cols="6">
                <DatePicker
                  id="newAuthorityOpenDateTextField"
                  v-model="newAuthority.openDate"
                  label="Open Date"
                  :rules="[rules.required()]"
                  model-type="yyyy-MM-dd'T'00:00:00"
                  @update:model-value="validateForm"
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-text-field
                  id="newAuthorityEmailInput"
                  v-model="newAuthority.email"
                  :rules="[rules.required(), rules.email()]"
                  variant="underlined"
                  class="pt-0"
                  :maxlength="255"
                  label="Email"
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="6">
                <v-text-field
                  id="newAuthorityPhoneNumberInput"
                  v-model="newAuthority.phoneNumber"
                  :rules="[rules.required(), rules.phoneNumber()]"
                  class="pt-0"
                  variant="underlined"
                  :maxlength="10"
                  label="Phone"
                  @keypress="isNumber($event)"
                />
              </v-col>
              <v-col cols="6">
                <v-text-field
                  id="newAuthorityFaxNumberInput"
                  v-model="newAuthority.faxNumber"
                  :rules="[rules.phoneNumber('Fax number must be valid')]"
                  class="pt-0"
                  variant="underlined"
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
                  id="newAuthorityMailingAddressLine1Input"
                  v-model="newAuthority.mailingAddrLine1"
                  :rules="[rules.required(), rules.noSpecialCharactersAddress()]"
                  class="pt-0 pb-5"
                  variant="underlined"
                  :maxlength="255"
                  label="Line 1"
                  hide-details="auto"
                />
                <v-text-field
                  id="newAuthorityMailingAddressLine2Input"
                  v-model="newAuthority.mailingAddrLine2"
                  :rules="[rules.noSpecialCharactersAddress()]"
                  class="pt-0 pb-5"
                  variant="underlined"
                  :maxlength="255"
                  label="Line 2"
                  hide-details="auto"
                />
                <v-text-field
                  id="newContactMailingAddressCityInput"
                  v-model="newAuthority.mailingAddrCity"
                  :rules="[rules.required(), rules.noSpecialCharactersAddress()]"
                  class="pt-0 pb-5"
                  variant="underlined"
                  :maxlength="255"
                  label="City"
                  hide-details="auto"
                />
                <v-select
                  id="newAuthorityMailingAddressProvinceInput"
                  v-model="newAuthority.mailingAddrProvince"
                  :rules="[rules.required()]"
                  class="pt-0"
                  label="Province"
                  variant="underlined"
                  :items="provinceCodeValues"
                  item-title="label"
                  item-value="provinceCode"
                />
                <v-select
                  id="newAuthorityMailingAddressCountryInput"
                  v-model="newAuthority.mailingAddrCountry"
                  :rules="[rules.required()]"
                  class="pt-0"
                  label="Country"
                  variant="underlined"
                  :items="countryCodeValues"
                  item-title="label"
                  item-value="countryCode"
                />
                <v-text-field
                  id="newContactMailingAddressPostalCodeInput"
                  v-model="newAuthority.mailingAddrPostal"
                  :rules="[rules.required(), rules.postalCode()]"
                  class="pt-0"
                  variant="underlined"
                  :maxlength="7"
                  label="Postal Code"
                />
              </v-col>
              <v-col
                v-if="showPhysicalAddress"
                cols="6"
              >
                <v-row class="ml-lg-1">
                  <h3>Physical Address</h3>
                </v-row>
                <v-row
                  v-if="!sameAsMailingCheckbox"
                  class="ml-lg-1"
                >
                  <v-col>
                    <v-text-field
                      id="newAuthorityPhysicalAddressLine1Input"
                      v-model="newAuthority.physicalAddrLine1"
                      :rules="[rules.required(), rules.noSpecialCharactersAddress()]"
                      variant="underlined"
                      class="pt-0 pb-5"
                      :maxlength="255"
                      label="Line 1"
                      hide-details="auto"
                    />
                    <v-text-field
                      id="newAuthorityPhysicalAddressLine2Input"
                      v-model="newAuthority.physicalAddrLine2"
                      :rules="[rules.noSpecialCharactersAddress()]"
                      class="pt-0 pb-5"
                      variant="underlined"
                      :maxlength="255"
                      label="Line 2"
                      hide-details="auto"
                    />
                    <v-text-field
                      id="newContactPhysicalAddressCityInput"
                      v-model="newAuthority.physicalAddrCity"
                      :rules="[rules.required(), rules.noSpecialCharactersAddress()]"
                      class="pt-0 pb-5"
                      variant="underlined"
                      :maxlength="255"
                      label="City"
                      hide-details="auto"
                    />
                    <v-select
                      id="newAuthorityPhysicalAddressProvinceInput"
                      v-model="newAuthority.physicalAddrProvince"
                      :rules="[rules.required()]"
                      class="pt-0"
                      label="Province"
                      variant="underlined"
                      :items="provinceCodeValues"
                      item-title="label"
                      item-value="provinceCode"
                    />
                    <v-select
                      id="newAuthorityPhysicalAddressCountryInput"
                      v-model="newAuthority.physicalAddrCountry"
                      :rules="[rules.required()]"
                      class="pt-0"
                      label="Country"
                      variant="underlined"
                      :items="countryCodeValues"
                      item-title="label"
                      item-value="countryCode"
                    />
                    <v-text-field
                      id="newContactPhysicalAddressPostalCodeInput"
                      v-model="newAuthority.physicalAddrPostal"
                      :rules="[rules.required(), rules.postalCode()]"
                      class="pt-0"
                      variant="underlined"
                      :maxlength="7"
                      label="Postal Code"
                    />
                  </v-col>
                </v-row>
                <v-row class="ml-lg-1 pt-4">
                  <v-checkbox
                    id="sameAsMailingCheckbox"
                    v-model="sameAsMailingCheckbox"
                    dense
                    label="Same as Mailing Address"
                    class="mt-n3 pt-0"
                    @update:model-value="clickSameAsAddressButton"
                  />
                </v-row>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
    <v-card-actions class="justify-end">
      <PrimaryButton
        id="cancelNewAuthorityBtn"
        secondary
        text="Cancel"
        @click-action="closeNewAuthorityPage"
      />
      <PrimaryButton
        id="newAuthorityPostBtn"
        text="Save"
        width="7rem"
        :disabled="!isFormValid"
        :loading="processing"
        @click-action="addNewAuthority"
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
import {DateTimeFormatter, LocalDate} from '@js-joda/core';
import {authStore} from '@/store/modules/auth';
import {instituteStore} from '@/store/modules/institute';
import DatePicker from '@/components/util/DatePicker.vue';
import { PERMISSION, hasRequiredPermission } from '@/utils/constants/Permission';

export default {
  name: 'NewAuthorityPage',
  components: {
    DatePicker,
    PrimaryButton
  },
  mixins: [alertMixin],
  emits: ['newAuthority:closeNewAuthorityPage'],
  data() {
    return {
      isFormValid: false,
      processing: false,
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
      sameAsMailingCheckbox: true,
      provinceCodeValues: [],
      countryCodeValues: [],
      authorityTypes: [],
      excludeShowingPhysicalAddressesForAuthoritiesOfType: [
        'OFFSHORE',
      ],
      offshoreArray: ['OFFSHORE'],
      independentArray: ['INDEPENDNT']
    };
  },
  computed: {
    ...mapState(authStore, ['isAuthenticated', 'userInfo']),
    ...mapState(instituteStore, ['authorityTypeCodes', 'provinceCodes', 'countryCodes']),
    showPhysicalAddress() {
      return !this.excludeShowingPhysicalAddressesForAuthoritiesOfType.includes(this.newAuthority.authorityTypeCode);
    },
    filteredAuthorityTypeCodes() {
      if(this.canOnlyAddOffshoreAuthority && this.canOnlyAddIndependentAuthority) {
        return this.authorityTypeCodes;
      } else if(this.canOnlyAddOffshoreAuthority) {
        return this.authorityTypeCodes?.filter(type => this.offshoreArray.includes(type.authorityTypeCode));
      } else if(this.canOnlyAddIndependentAuthority) {
        return this.authorityTypeCodes?.filter(type => this.independentArray.includes(type.authorityTypeCode));
      }
    },
    canOnlyAddIndependentAuthority() {
      return this.hasRequiredPermission(this.userInfo, PERMISSION.EDIT_INDEPENDENT_AUTHORITY_PERMISSION) 
    },
    canOnlyAddOffshoreAuthority() {
      return this.hasRequiredPermission(this.userInfo, PERMISSION.EDIT_OFFSHORE_AUTHORITY_PERMISSION);
    },
  },
  mounted() {
    this.validateForm();
  },
  created() {
    const instStore = instituteStore();
    instStore.getAllAuthorityTypeCodes();
    instStore.getAllProvinceCodes().then(() => {
      this.provinceCodeValues = this.provinceCodes.filter(province => province.provinceCode === 'BC' || province.provinceCode === 'YT');
    });
    instStore.getAllCountryCodes().then(() => {
      this.countryCodeValues = this.countryCodes;
    });
  },
  methods: {
    hasRequiredPermission,
    calculateDefaultOpenDate() {
      return LocalDate.now().atStartOfDay().format(DateTimeFormatter.ofPattern('yyyy-MM-dd\'T\'HH:mm:ss')).toString();
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
    async clickSameAsAddressButton() {
      await this.$nextTick();
      await this.validateForm();
    },
    openAuthority(authorityId) {
      this.$router.push({name: 'authorityDetails', params: {authorityID: authorityId}});
    },
    resetForm() {
      this.$refs.newAuthorityForm.reset();
    },
    async validateForm() {
      if (this.$refs.newAuthorityForm) {
        const valid = await this.$refs.newAuthorityForm.validate();
        this.isFormValid = valid.valid;
      }
    },
    isNumber,
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
</style>
