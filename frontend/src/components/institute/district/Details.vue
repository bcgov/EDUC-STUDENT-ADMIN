<template>
  <v-form
    ref="districtDetailsForm"
    v-model="districtDetailsFormValid"
  >
    <v-container fluid>
      <v-row v-if="loading">
        <v-col class="d-flex justify-center">
          <v-progress-circular
            class="mt-16"
            :size="70"
            :width="7"
            color="primary"
            indeterminate
            :active="loading"
          />
        </v-col>
      </v-row>
      <v-row
        v-else
        no-gutters
      >
        <v-col>
          <v-row class="d-flex justify-start">
            <v-col
              v-if="!editing"
              class="d-flex justify-end"
            >
              <PrimaryButton
                v-if="canEditDistrictDetails()"
                id="districtDetailsEditButton"
                icon-left
                width="6em"
                icon="mdi-pencil"
                text="Edit"
                @click-action="toggleEdit"
              />
            </v-col>
            <v-col
              v-else
              class="d-flex justify-end"
            >
              <PrimaryButton
                id="cancelButton"
                class="mr-2"
                secondary
                icon-left
                width="6em"
                text="Cancel"
                @click-action="cancelClicked"
              />
              <PrimaryButton
                id="saveButton"
                icon-left
                width="6em"
                text="Save"
                :disabled="!districtDetailsFormValid"
                @click-action="updateDistrictDetails"
              />
            </v-col>
          </v-row>

          <v-row
            v-if="editing"
            class="d-flex justify-start"
          >
            <v-col
              cols="4"
              lg="3"
              class="pb-0 pt-0"
            >
              <v-text-field
                v-model="districtDetailsCopy.displayName"
                class="mt-n5"
                label="District Name"
                :maxlength="255"
                :rules="[rules.required(), rules.noSpecialCharactersSchDisAuthName()]"
                required
                variant="underlined"
              />
            </v-col>
          </v-row>

          <v-row
            no-gutters
            class="d-flex justify-start"
          >
            <v-col
              cols="12"
              class="d-flex justify-start"
            >
              <h3 class="subHeading pt-2">
                Contact Information
              </h3>
            </v-col>
          </v-row>

          <v-row class="d-flex justify-start">
            <v-col
              cols="2"
              lg="2"
              class="pt-0 pb-0"
            >
              <v-row
                v-if="!editing"
                no-gutters
                class="d-flex justify-start"
              >
                <v-col
                  cols="10"
                  class="d-flex justify-start"
                >
                  <span style="color: grey">Phone</span>
                </v-col>
              </v-row>
              <v-row no-gutters>
                <v-col
                  cols="10"
                  class="d-flex justify-start"
                >
                  <div v-if="!editing">
                    <span v-if="district.phoneNumber">{{
                      formatPhoneNumber(district.phoneNumber)
                    }}</span>
                    <a
                      v-if="showEditLinks(district.phoneNumber)"
                      class="editField"
                      @click="toggleEdit"
                    >+Phone</a>
                  </div>
                  <v-text-field
                    v-else
                    id="districtDetailsPhoneNumber"
                    v-model="districtDetailsCopy.phoneNumber"
                    label="Phone"
                    required
                    :maxlength="10"
                    variant="underlined"
                    :rules="[rules.required(), rules.phoneNumber()]"
                    @keypress="isNumber($event)"
                  />
                </v-col>
              </v-row>
            </v-col>

            <v-col
              cols="2"
              lg="2"
              class="pt-0 pb-0"
            >
              <v-row
                v-if="!editing"
                no-gutters
                class="d-flex justify-start"
              >
                <v-col
                  cols="10"
                  class="d-flex justify-start"
                >
                  <span style="color: grey">Fax</span>
                </v-col>
              </v-row>
              <v-row no-gutters>
                <v-col
                  cols="10"
                  class="d-flex justify-start"
                >
                  <div v-if="!editing">
                    <span v-if="district.faxNumber">{{
                      formatPhoneNumber(district.faxNumber)
                    }}</span>
                    <a
                      v-if="showEditLinks(district.faxNumber)"
                      class="editField"
                      @click="toggleEdit"
                    >+Fax</a>
                  </div>
                  <v-text-field
                    v-else
                    id="districtDetailsFaxNumber"
                    v-model="districtDetailsCopy.faxNumber"
                    variant="underlined"
                    label="Fax Number"
                    :rules="[rules.phoneNumber('Fax number must be valid')]"
                    :maxlength="10"
                    @keypress="isNumber($event)"
                  />
                </v-col>
              </v-row>
            </v-col>
            <v-col
              cols="4"
              lg="4"
              class="pt-0 pb-0"
            >
              <v-row
                v-if="!editing"
                no-gutters
                class="d-flex justify-start"
              >
                <v-col
                  cols="10"
                  class="d-flex justify-start"
                >
                  <span style="color: grey">Email</span>
                </v-col>
              </v-row>
              <v-row no-gutters>
                <v-col
                  cols="10"
                  class="d-flex justify-start"
                >
                  <div v-if="!editing">
                    <span
                      v-if="district.email"
                      style="word-break: break-all;"
                    >{{
                      district.email
                    }}</span>
                    <a
                      v-if="showEditLinks(district.email)"
                      class="editField"
                      @click="toggleEdit"
                    >+Email</a>
                  </div>
                  <v-text-field
                    v-else
                    id="districtDetailsEmail"
                    v-model="districtDetailsCopy.email"
                    label="Email"
                    required
                    variant="underlined"
                    :rules="[rules.email()]"
                    :maxlength="255"
                  />
                </v-col>
              </v-row>
            </v-col>
            <v-col
              cols="4"
              lg="4"
              class="pt-0 pb-0"
            >
              <v-row
                v-if="!editing"
                no-gutters
                class="d-flex justify-start"
              >
                <v-col
                  cols="10"
                  class="d-flex justify-start"
                >
                  <span style="color: grey">Website</span>
                </v-col>
              </v-row>
              <v-row no-gutters>
                <v-col
                  cols="10"
                  class="d-flex justify-start"
                >
                  <div v-if="!editing">
                    <a
                      v-if="cleanWebsiteUrl"
                      style="word-break: break-all;"
                      :href="cleanWebsiteUrl"
                      target="_blank"
                    >{{
                      cleanWebsiteUrl
                    }}</a>
                    <a
                      v-if="showEditLinks(cleanWebsiteUrl)"
                      class="editField"
                      @click="toggleEdit"
                    >+Website</a>
                  </div>
                  <v-text-field
                    v-if="editing"
                    v-model="districtDetailsCopy.website"
                    label="Website"
                    :rules="[rules.website()]"
                    variant="underlined"
                    :maxlength="255"
                  />
                </v-col>
              </v-row>
            </v-col>
          </v-row>

          <v-row
            no-gutters
            class="mt-6 d-flex justify-start"
          >
            <v-col
              cols="12"
              class="d-flex justify-start"
            >
              <h3 class="subHeading pt-4">
                Addresses
              </h3>
            </v-col>
          </v-row>
          <div v-if="!editing">
            <v-row
              v-if="canEditDistrictDetails() && !hasMailingAddress() && !editing"
              no-gutters
              class="mt-2 d-flex justify-start"
            >
              <v-col>
                <a
                  class="editField"
                  @click="toggleEdit"
                >+Address</a>
              </v-col>
            </v-row>
            <v-row
              v-else
              no-gutters
              class="d-flex justify-start mt-2"
            >
              <v-col
                v-if="editing || hasMailingAddress()"
                cols="3"
              >
                <v-row>
                  <v-col>
                    <v-icon
                      class="pb-1 mr-1"
                      right
                    >
                      mdi-email-outline
                    </v-icon>
                    <span style="color: grey">Mailing Address</span>
                  </v-col>
                </v-row>
                <v-row
                  v-if="!editing"
                  no-gutters
                >
                  <v-col>
                    <v-row
                      class="ml-6"
                      no-gutters
                    >
                      <v-col>
                        <span style="word-break: break-all;">{{
                          getMailingAddressItem('addressLine1')
                        }}</span>
                      </v-col>
                    </v-row>
                    <v-row no-gutters>
                      <v-col class="ml-6">
                        <span style="word-break: break-all;">{{
                          getMailingAddressItem('addressLine2')
                        }}</span>
                      </v-col>
                    </v-row>
                    <v-row no-gutters>
                      <v-col class="ml-6">
                        <span style="word-break: break-all;">{{
                          getMailingAddressItem('city') + ', ' +
                            getMailingAddressItem('provinceCode')
                            + ', '
                            + getMailingAddressItem('countryCode')
                        }}</span>
                      </v-col>
                    </v-row>
                    <v-row no-gutters>
                      <v-col class="ml-6">
                        <span style="word-break: break-all;">{{
                          getMailingAddressItem('postal')
                        }}</span>
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
              </v-col>
              <v-col cols="3">
                <v-row>
                  <v-col>
                    <v-icon
                      class="pb-1 mr-1"
                      right
                    >
                      mdi-home-outline
                    </v-icon>
                    <span style="color: grey">Physical Address</span>
                  </v-col>
                </v-row>
                <v-row
                  v-if="!hasSamePhysicalAddress && !editing"
                  no-gutters
                >
                  <v-col>
                    <v-row no-gutters>
                      <v-col class="ml-6">
                        <span style="word-break: break-all;">{{
                          getPhysicalAddressItem('addressLine1')
                        }}</span>
                      </v-col>
                    </v-row>
                    <v-row no-gutters>
                      <v-col class="ml-6">
                        <span style="word-break: break-all;">{{
                          getPhysicalAddressItem('addressLine2')
                        }}</span>
                      </v-col>
                    </v-row>
                    <v-row no-gutters>
                      <v-col class="ml-6">
                        <span style="word-break: break-all;">{{
                          getPhysicalAddressItem('city') + ', ' +
                            getPhysicalAddressItem('provinceCode') + ',' +
                            getPhysicalAddressItem('countryCode')
                        }}</span>
                      </v-col>
                    </v-row>
                    <v-row no-gutters>
                      <v-col class="ml-6">
                        <span style="word-break: break-all;">{{
                          getPhysicalAddressItem('postal')
                        }}</span>
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
                <v-row
                  v-else
                  no-gutters
                >
                  <v-col>
                    <v-row
                      class="ml-6"
                      no-gutters
                    >
                      <v-col
                        v-if="sameAsMailingCheckbox && !editing"
                        class="fontItalic"
                      >
                        <span>Same as Mailing Address</span>
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </div>
          <div v-else>
            <v-row no-gutters>
              <v-col>
                <v-row
                  no-gutters
                  class="mt-3"
                >
                  <v-col cols="4">
                    <h3>Mailing Address</h3>
                  </v-col>
                </v-row>

                <v-row>
                  <v-col cols="4">
                    <v-text-field
                      id="mailAddressLine1"
                      v-model="getMailingAddressCopy()[0].addressLine1"
                      required
                      label="Line 1"
                      :rules="[rules.required(), rules.noSpecialCharactersAddress()]"
                      :maxlength="255"
                      variant="underlined"
                      class="pb-5"
                      hide-details="auto"
                    />
                  </v-col>

                  <v-col cols="4">
                    <v-text-field
                      id="mailAddressLine2"
                      v-model="getMailingAddressCopy()[0].addressLine2"
                      label="Line 2"
                      :rules="[rules.noSpecialCharactersAddress()]"
                      :maxlength="255"
                      variant="underlined"
                      class="pb-5"
                      hide-details="auto"
                    />
                  </v-col>

                  <v-col cols="4">
                    <v-text-field
                      id="mailAddressCity"
                      v-model="getMailingAddressCopy()[0].city"
                      required
                      :rules="[rules.required(), rules.noSpecialCharactersAddress()]"
                      :maxlength="255"
                      variant="underlined"
                      label="City"
                      class="pb-5"
                      hide-details="auto"
                    />
                  </v-col>
                </v-row>



                <v-row>
                  <v-col cols="4">
                    <v-select
                      id="mailAddressProvince"
                      v-model="getMailingAddressCopy()[0].provinceCode"
                      :items="provinceCodeValues"
                      item-title="label"
                      item-value="provinceCode"
                      variant="underlined"
                      dense
                      :rules="[rules.required()]"
                      required
                      label="Province"
                      style="color: black"
                    />
                  </v-col>

                  <v-col cols="4">
                    <v-select
                      id="mailAddressCountry"
                      v-model="getMailingAddressCopy()[0].countryCode"
                      :items="countryCodeValues"
                      item-title="label"
                      item-value="countryCode"
                      variant="underlined"
                      :rules="[rules.required()]"
                      dense
                      label="Country"
                      style="color: black"
                    />
                  </v-col>

                  <v-col cols="4">
                    <v-text-field
                      id="mailAddressPostal"
                      v-model="getMailingAddressCopy()[0].postal"
                      :maxlength="6"
                      required
                      :rules="[rules.required(), rules.postalCode()]"
                      label="Postal Code"
                      variant="underlined"
                    />
                  </v-col>
                </v-row>


                <v-row />
              </v-col>
            </v-row>

            <v-row>
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
                  v-if="!sameAsMailingCheckbox"
                  no-gutters
                >
                  <v-col>
                    <v-row>
                      <v-col cols="4">
                        <v-text-field
                          id="physicalAddressLine1"
                          v-model="getPhysicalAddressCopy()[0].addressLine1"
                          required
                          :rules="[rules.required(), rules.noSpecialCharactersAddress()]"
                          :maxlength="255"
                          variant="underlined"
                          label="Line 1"
                          class="pb-5"
                          hide-details="auto"
                        />
                      </v-col>

                      <v-col cols="4">
                        <v-text-field
                          id="physicalAddressLine2"
                          v-model="getPhysicalAddressCopy()[0].addressLine2"
                          :rules="[rules.noSpecialCharactersAddress()]"
                          :maxlength="255"
                          variant="underlined"
                          label="Line 2"
                          class="pb-5"
                          hide-details="auto"
                        />
                      </v-col>

                      <v-col cols="4">
                        <v-text-field
                          id="physicalAddressCity"
                          v-model="getPhysicalAddressCopy()[0].city"
                          required
                          :rules="[rules.required(), rules.noSpecialCharactersAddress()]"
                          :maxlength="255"
                          variant="underlined"
                          label="City"
                          class="pb-5"
                          hide-details="auto"
                        />
                      </v-col>
                    </v-row>

                    <v-row>
                      <v-col cols="4">
                        <v-select
                          id="physicalAddressProvince"
                          v-model="getPhysicalAddressCopy()[0].provinceCode"
                          :items="provinceCodeValues"
                          item-title="label"
                          item-value="provinceCode"
                          dense
                          required
                          :rules="[rules.required()]"
                          variant="underlined"
                          label="Province"
                          style="color: black"
                        />
                      </v-col>

                      <v-col cols="4">
                        <v-select
                          id="physicalAddressCountry"
                          v-model="getPhysicalAddressCopy()[0].countryCode"
                          :items="countryCodeValues"
                          item-title="label"
                          item-value="countryCode"
                          dense
                          :rules="[rules.required()]"
                          required
                          variant="underlined"
                          label="Country"
                          style="color: black"
                        />
                      </v-col>

                      <v-col cols="4">
                        <v-text-field
                          id="physicalAddressPostal"
                          v-model="getPhysicalAddressCopy()[0].postal"
                          required
                          :rules="[rules.required(), rules.postalCode()]"
                          :maxlength="6"
                          label="Postal Code"
                          variant="underlined"
                        />
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>

            <v-row no-gutters>
              <v-col>
                <v-checkbox
                  id="sameAsMailingCheckbox"
                  v-model="sameAsMailingCheckbox"
                  dense
                  label="Same as Mailing Address"
                  class="mt-n3 pt-0"
                  @update:model-value="clickSameAsAddressButton"
                />
              </v-col>
            </v-row>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </v-form>
</template>
  
<script>

import ApiService from '../../../common/apiService';
import { Routes } from '@/utils/constants';
import alertMixin from '@/mixins/alertMixin';
import PrimaryButton from '@/components/util/PrimaryButton.vue';
import { formatPhoneNumber, formatDate } from '@/utils/format';
import { sanitizeUrl } from '@braintree/sanitize-url';
import { mapState, mapActions } from 'pinia';
import { deepCloneObject } from '@/utils/common';
import * as Rules from '@/utils/institute/formRules';
import { isNumber } from '@/utils/institute/formInput';
import { authStore } from '@/store/modules/auth';
import { instituteStore } from '@/store/modules/institute';
import { edxStore } from '@/store/modules/edx';

export default {
  name: 'Details',
  components: {
    PrimaryButton
  },
  mixins: [alertMixin],
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
      noteRequestCount: 0,
      cleanWebsiteUrl: '',
      editing: false,
      districtDetailsFormValid: true,
      districtDetailsCopy: {},
      provinceCodeValues: [],
      countryCodeValues: [],
      sameAsMailingCheckbox: true
    };
  },
  computed: {
    ...mapState(authStore, ['DISTRICT_ADMIN_ROLE', 'OFFSHORE_SCHOOLS_ADMIN_ROLE']),
    ...mapState(instituteStore, ['provinceCodes', 'countryCodes']),
    ...mapState(edxStore, ['schoolSearchParams']),
    notesLoading() {
      return this.noteRequestCount > 0;
    },
    hasSamePhysicalAddress() {
      return !this.district.addresses.filter(address => address.addressTypeCode === 'PHYSICAL').length > 0;
    }
  },
  created() {
    this.getDistrict();

    instituteStore().getAllProvinceCodes().then(() => {
      this.provinceCodeValues = this.provinceCodes.filter(province => province.provinceCode === 'BC' || province.provinceCode === 'YT');
    });
    instituteStore().getAllCountryCodes().then(() => {
      this.countryCodeValues = this.countryCodes;
    });
  },
  methods: {
    ...mapActions(edxStore, ['setSchoolSearchParams']),
    formatPhoneNumber,
    isOffshoreUser() {
      return this.OFFSHORE_SCHOOLS_ADMIN_ROLE;
    },
    getDistrict() {
      this.loading = true;
      ApiService.apiAxios.get(`${Routes.institute.DISTRICT_DATA_URL}/${this.districtID}`)
        .then(response => {
          this.district = response.data;
          this.cleanWebsiteUrl = this.district.website ? sanitizeUrl(this.district.website) : '';
          this.setHasSamePhysicalFlag();
        }).catch(error => {
          console.error(error);
          this.setFailureAlert(error.response?.data?.message || error.message);
        }).finally(() => {
          this.loading = false;
        });
    },
    async clickSameAsAddressButton() {
      await this.$nextTick();
      await this.$refs.districtDetailsForm.validate();
    },
    cancelClicked() {
      this.editing = false;
      this.setHasSamePhysicalFlag();
    },
    showEditLinks(fieldValue) {
      return this.canEditDistrictDetails() && !fieldValue;
    },
    setHasSamePhysicalFlag() {
      this.sameAsMailingCheckbox = this.hasSamePhysicalAddress;
    },
    viewSchools() {
      this.schoolSearchParams.schoolID = null;
      this.schoolSearchParams.districtID = this.districtID;
      this.schoolSearchParams.authorityID = null;
      this.schoolSearchParams.status = 'Open';
      this.schoolSearchParams.facilityType = null;
      this.schoolSearchParams.schoolCategory = null;
      this.schoolSearchParams.schoolReportingRequirementCode = null;
      this.schoolSearchParams.pageNumber = 1;
      this.setSchoolSearchParams(this.schoolSearchParams);
      this.$router.push({ name: 'instituteSchoolList' });
    },
    async toggleEdit() {
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
    canEditDistrictDetails() {
      return this.DISTRICT_ADMIN_ROLE;
    },
    addAddressesIfRequired(district) {
      let addresses = district.addresses;
      if (!this.hasMailingAddress()) {
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
      if (!this.hasPhysicalAddress()) {
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
      if (this.sameAsMailingCheckbox) {
        this.districtDetailsCopy.addresses = this.districtDetailsCopy.addresses.filter(address => address.addressTypeCode === 'MAILING');
      }
      this.$emit('updateDistrict', this.districtDetailsCopy);
    },
    deepCloneObject,
    isNumber,
    formatDate,
    getStatusText() {
      if (this.district.districtStatusCode === 'ACTIVE') {
        return 'Active';
      } else {
        return 'Inactive';
      }
    },
    hasMailingAddress() {
      return this.district.addresses.filter(address => address.addressTypeCode === 'MAILING').length > 0;
    },
    hasPhysicalAddress() {
      return this.district.addresses?.filter(address => address.addressTypeCode === 'PHYSICAL').length > 0;
    },
    getMailingAddressCopy() {
      return this.districtDetailsCopy.addresses?.filter(address => address.addressTypeCode === 'MAILING');
    },
    getPhysicalAddressCopy() {
      return this.districtDetailsCopy.addresses?.filter(address => address.addressTypeCode === 'PHYSICAL');
    },
    getMailingAddressItem(item) {
      let mailingAddress = this.district.addresses.filter(address => address.addressTypeCode === 'MAILING');
      for (const x in mailingAddress[0]) {
        if (x === item) {
          return mailingAddress[0][item];
        }
      }
    },
    getPhysicalAddressItem(item) {
      let physicalAddress = this.district.addresses.filter(address => address.addressTypeCode === 'PHYSICAL');
      for (const x in physicalAddress[0]) {
        if (x === item) {
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
    border-width: 3px;
    opacity: unset;
}

.sheetHeader {
    background-color: #003366;
    color: white;
    font-size: medium !important;
    font-weight: bolder !important;
}

.fontItalic {
    font-style: italic;
}

.containerSetup {
    padding-right: 24em !important;
    padding-left: 24em !important;
}

.editField {
    font-size: 14px;
    color: rgb(0, 51, 102);
}

.editField:hover {
    text-decoration: underline;
}

.subHeading {
    color: #38598a;
}
</style>
