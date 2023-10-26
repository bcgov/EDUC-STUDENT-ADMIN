<template>
  <v-form
    ref="authorityForm"
    v-model="authorityFormValid"
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
                v-if="canEditAuthorities()"
                id="editButton"
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
                @click-action="cancelEdit"
              />
              <PrimaryButton
                id="saveButton"
                icon-left
                width="6em"
                text="Save"
                :disabled="!authorityFormValid"
                @click-action="saveAuthority"
              />
            </v-col>
          </v-row>

          <v-row
            v-if="editing"
            class="d-flex justify-start"
          >
            <v-col
              lg="4"
              class="pb-0 pt-0"
            >
              <v-text-field
                v-model="authorityCopy.displayName"
                class="mt-n4 ml-3"
                required
                variant="underlined"
                :rules="[rules.required(), rules.noSpecialCharactersSchDisAuthName()]"
                :maxlength="255"
                style="font-size: x-large"
              />
            </v-col>
          </v-row>

          <v-row class="pl-3">
            <v-col
              cols="4"
              lg="3"
              class="pb-0 pt-0"
            >
              <v-row
                no-gutters
                class="d-flex justify-start"
              >
                <v-col
                  cols="10"
                  class="d-flex justify-start"
                >
                  <span style="color: grey">Status</span>
                </v-col>
              </v-row>

              <v-row no-gutters>
                <v-col class="d-flex justify-start">
                  <span v-if="!editing">
                    <v-icon
                      class="pb-1"
                      :color="getStatusColorAuthorityOrSchool(authority?.status)"
                      right
                      dark
                    >
                      mdi-circle-medium
                    </v-icon>
                    <span>{{
                      authority?.status
                    }}</span>
                  </span>

                  <v-col
                    v-else
                    class="mt-n4 pl-0"
                  >
                    <v-btn
                      id="editAuthorityStatusButton"
                      density="compact"
                      variant="outlined"
                      class="mt-1 mb-1"
                      :secondary="true"
                      @click="openAuthorityStatusEdit"
                    >
                      <v-icon
                        class="ml-n1 pr-3"
                        :color="getStatusColorAuthorityOrSchool(authorityCopy.status)"
                        dark
                      >
                        mdi-circle-medium
                      </v-icon>
                      <span>{{
                        authorityCopy.status
                      }}</span>
                    </v-btn>
                  </v-col>
                </v-col>
              </v-row>
            </v-col>





            <v-col
              cols="4"
              lg="3"
              class="pb-0 pt-0"
            >
              <v-row no-gutters>
                <v-col
                  cols="10"
                  class="pt-2 pr-0"
                >
                  <span style="color: grey">Open Date</span>
                </v-col>
              </v-row>
              <v-row no-gutters>
                <v-col
                  cols="10"
                  class="pb-1 pr-0"
                >
                  <span
                    v-if="!editing"
                    class="ministryLine"
                    style="color: black"
                  >{{
                    formatDate(authority?.openedDate) || '-'
                  }}</span>
                  <span
                    v-else
                    class="ministryLine"
                    style="color: black"
                  >{{
                    formatDate(authorityCopy.openedDate) || '-'
                  }}</span>
                </v-col>
              </v-row>
            </v-col>
            <v-col
              cols="4"
              lg="3"
              class="pb-0 pt-0"
            >
              <v-row no-gutters>
                <v-col
                  cols="10"
                  class=" pt-2 pr-0"
                >
                  <span style="color: grey">Close Date</span>
                </v-col>
              </v-row>
              <v-row no-gutters>
                <v-col
                  cols="10"
                  class="pb-1 pr-0"
                >
                  <span
                    v-if="!editing"
                    class="ministryLine"
                    style="color: black"
                  >{{
                    formatDate(authority?.closedDate) || '-'
                  }}</span>
                  <span
                    v-else
                    class="ministryLine"
                    style="color: black"
                  >{{
                    formatDate(authorityCopy.closedDate) || '-'
                  }}</span>
                </v-col>
              </v-row>
            </v-col>
            <v-col
              cols="4"
              lg="3"
              class="pb-0 pt-0"
            >
              <v-row
                v-if="!editing"
                no-gutters
              >
                <v-col
                  cols="10"
                  class="pt-2 pr-0"
                >
                  <span style="color: grey">Authority Type</span>
                </v-col>
              </v-row>
              <v-row no-gutters>
                <v-col
                  cols="10"
                  class="pb-1 pr-0"
                >
                  <span
                    v-if="!editing"
                    class="ministryLine"
                    style="color: black"
                  >{{
                    authority?.type
                  }}</span>
                  <v-select
                    v-else
                    id="authorityTypeSelect"
                    v-model="authorityCopy.authorityTypeCode"
                    label="Authority Type"
                    :items="authorityTypes"
                    item-title="label"
                    item-value="authorityTypeCode"
                    variant="underlined"
                    dense
                    class="ministryLine mt-2"
                    style="color: black"
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
                Contact Information
              </h3>
            </v-col>
          </v-row>

          <v-row class="d-flex justify-start">
            <v-col
              cols="3"
              lg="3"
              class="pb=0 pt-0"
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
                    <span v-if="authority?.phoneNumber">{{
                      formatPhoneNumber(authority?.phoneNumber)
                    }}</span>

                    <a
                      v-if="showEditLinks(authority?.phoneNumber)"
                      class="editField"
                      @click="toggleEdit"
                    >+Phone</a>
                  </div>
                  <v-text-field
                    v-else
                    id="phoneNumberField"
                    v-model="authorityCopy.phoneNumber"
                    label="Phone"
                    variant="underlined"
                    class="shrink py-0"
                    required
                    :maxlength="10"
                    :rules="[rules.required(), rules.phoneNumber()]"
                    @keypress="isNumber($event)"
                  />
                </v-col>
              </v-row>
            </v-col>



            <v-col
              cols="3"
              lg="3"
              class="pb-0 pt-0"
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
                    <span
                      v-if="authority?.faxNumber"
                      class="ml-n1"
                    >{{
                      formatPhoneNumber(authority?.faxNumber)
                    }}</span>
                    <a
                      v-if="showEditLinks(authority?.faxNumber)"
                      class="editField mt-n1"
                      @click="toggleEdit"
                    >+Fax</a>
                  </div>

                  <v-text-field
                    v-else
                    id="faxNumberField"
                    v-model="authorityCopy.faxNumber"
                    label="Fax"
                    variant="underlined"
                    class="shrink py-0"
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
              class="pb-0 pt-0"
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
                      v-if="authority?.email"
                      style="word-break: break-all;"
                      class="ml-n1"
                    >{{
                      authority?.email
                    }}</span>

                    <a
                      v-if="showEditLinks(authority?.email)"
                      class="editField mt-n1"
                      @click="toggleEdit"
                    >+Email</a>
                  </div>
                  <v-text-field
                    v-else
                    id="emailField"
                    v-model="authorityCopy.email"
                    label="Email"
                    variant="underlined"
                    class="py-0"
                    required
                    :rules="[rules.email(), rules.required()]"
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
              v-if="canEditAuthorities() && !hasMailingAddress() && !editing"
              no-gutters
              class="d-flex justify-start"
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
              class="d-flex justify-start"
            >
              <v-col cols="3">
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
                  <v-col v-if="hasMailingAddress()">
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
                            + ', ' + getMailingAddressItem('countryCode')
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
              <v-col
                v-if="showPhysicalAddress"
                cols="3"
              >
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
                            getPhysicalAddressItem('provinceCode') + ', ' +
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
                      variant="underlined"
                      :rules="[rules.required(), rules.noSpecialCharactersAddress()]"
                      :maxlength="255"
                      class="pb-5"
                      hide-details="auto"
                    />
                  </v-col>

                  <v-col cols="4">
                    <v-text-field
                      id="mailAddressLine2"
                      v-model="getMailingAddressCopy()[0].addressLine2"
                      variant="underlined"
                      label="Line 2"
                      :rules="[rules.noSpecialCharactersAddress()]"
                      :maxlength="255"
                      class="pb-5"
                      hide-details="auto"
                    />
                  </v-col>

                  <v-col cols="4">
                    <v-text-field
                      id="mailAddressCity"
                      v-model="getMailingAddressCopy()[0].city"
                      required
                      label="City"
                      variant="underlined"
                      :rules="[rules.required(), rules.noSpecialCharactersAddress()]"
                      :maxlength="255"
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
                      dense
                      label="Province"
                      variant="underlined"
                      :rules="[rules.required()]"
                      required
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
                      :rules="[rules.required()]"
                      label="Country"
                      dense
                      variant="underlined"
                      style="color: black"
                    />
                  </v-col>

                  <v-col cols="4">
                    <v-text-field
                      id="mailAddressPostal"
                      v-model="getMailingAddressCopy()[0].postal"
                      :maxlength="6"
                      label="Postal Code"
                      required
                      :rules="[rules.required(), rules.postalCode()]"
                      variant="underlined"
                    />
                  </v-col>
                </v-row>
              </v-col>
            </v-row>

            <v-row v-if="showPhysicalAddress">
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
                          label="Line 1"
                          variant="underlined"
                          :rules="[rules.required(), rules.noSpecialCharactersAddress()]"
                          :maxlength="255"
                          class="pb-5"
                          hide-details="auto"
                        />
                      </v-col>

                      <v-col cols="4">
                        <v-text-field
                          id="physicalAddressLine2"
                          v-model="getPhysicalAddressCopy()[0].addressLine2"
                          :maxlength="255"
                          label="Line 2"
                          variant="underlined"
                          :rules="[rules.noSpecialCharactersAddress()]"
                          class="pb-5"
                          hide-details="auto"
                        />
                      </v-col>

                      <v-col cols="4">
                        <v-text-field
                          id="physicalAddressCity"
                          v-model="getPhysicalAddressCopy()[0].city"
                          required
                          label="City"
                          variant="underlined"
                          :rules="[rules.required(), rules.noSpecialCharactersAddress()]"
                          :maxlength="255"
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
                          label="Province"
                          :items="provinceCodeValues"
                          item-title="label"
                          item-value="provinceCode"
                          dense
                          variant="underlined"
                          required
                          :rules="[rules.required()]"
                          style="color: black"
                        />
                      </v-col>

                      <v-col cols="4">
                        <v-select
                          id="physicalAddressCountry"
                          v-model="getPhysicalAddressCopy()[0].countryCode"
                          label="Country"
                          :items="countryCodeValues"
                          item-title="label"
                          item-value="countryCode"
                          dense
                          variant="underlined"
                          :rules="[rules.required()]"
                          required
                          style="color: black"
                        />
                      </v-col>

                      <v-col cols="4">
                        <v-text-field
                          id="physicalAddressPostal"
                          v-model="getPhysicalAddressCopy()[0].postal"
                          required
                          label="Postal Code"
                          :rules="[rules.required(), rules.postalCode()]"
                          :maxlength="6"
                          variant="underlined"
                        />
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>

            <v-row v-if="showPhysicalAddress" no-gutters>
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
    <v-dialog
      v-model="openAuthorityStatusEditCard"
      inset
      no-click-animation
      scrollable
      persistent
      width="50%"
    >
      <AuthorityStatus
        v-if="openAuthorityStatusEditCard"
        :authority-open-date="authorityCopy.openedDate"
        :authority-close-date="authorityCopy.closedDate"
        :authority-status="authorityCopy.status"
        :authority-has-open-schools="authorityHasOpenSchools"
        :date-of-last-school-closure="closedDateOfLastClosingSchool"
        :list-of-open-schools="listOfOpenSchools"
        :list-of-closing-schools="listOfClosingSchools"
        @update-authority-dates="handleUpdatesToAuthorityStatus"
        @authority-status:close-edit-authority-status-page="openAuthorityStatusEditCard = !openAuthorityStatusEditCard"
      />
    </v-dialog>
  </v-form>
</template>
  
<script>

import ApiService from '../../../common/apiService';
import { Routes } from '@/utils/constants';
import alertMixin from '@/mixins/alertMixin';
import PrimaryButton from '@/components/util/PrimaryButton.vue';
import { formatPhoneNumber, formatDate } from '@/utils/format';
import { getStatusColorAuthorityOrSchool, getStatusAuthorityOrSchool } from '@/utils/institute/status';
import { mapState } from 'pinia';
import router from '@/router';
import { deepCloneObject } from '@/utils/common';
import * as Rules from '@/utils/institute/formRules';
import AuthorityStatus from '@/components/institute/AuthorityStatus.vue';
import { isEmpty, omitBy } from 'lodash';
import { authStore } from '@/store/modules/auth';
import { instituteStore } from '@/store/modules/institute';

export default {
  name: 'Details',
  components: {
    AuthorityStatus,
    PrimaryButton
  },
  mixins: [alertMixin],
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
      noteRequestCount: 0,
      openAuthorityStatusEditCard: false,
      authorityHasOpenSchools: false,
      closedDateOfLastClosingSchool: null,
      rules: Rules,
      authorityTypes: [],
      provinceCodeValues: [],
      countryCodeValues: [],
      listOfOpenSchools: [],
      listOfClosingSchools: [],
      excludeShowingPhysicalAddressesForAuthoritiesOfType: [
        'OFFSHORE',
      ],

    };
  },
  computed: {
    ...mapState(instituteStore, ['authorityTypeCodes', 'provinceCodes', 'countryCodes']),
    ...mapState(authStore, ['INDEPENDENT_AUTHORITY_ADMIN_ROLE','INDEPENDENT_SCHOOLS_ADMIN_ROLE', 'OFFSHORE_SCHOOLS_ADMIN_ROLE']),
    notesLoading() {
      return this.noteRequestCount > 0;
    },
    hasSamePhysicalAddress() {
      return !this.authority?.addresses.filter(address => address.addressTypeCode === 'PHYSICAL').length > 0;
    },
    showPhysicalAddress() {
      if (this.editing) {
        return !this.excludeShowingPhysicalAddressesForAuthoritiesOfType.includes(this.authorityCopy?.authorityTypeCode);
      }
      return !this.excludeShowingPhysicalAddressesForAuthoritiesOfType.includes(this.authority?.authorityTypeCode);
    }
  },
  created() {
    const instStore = instituteStore();
    instStore.getAllProvinceCodes().then(() => {
      this.provinceCodeValues = this.provinceCodes.filter(province => province.provinceCode === 'BC' || province.provinceCode === 'YT');
    });
    instStore.getAllCountryCodes().then(() => {
      this.countryCodeValues = this.countryCodes;
    });
    instStore.getAllAuthorityTypeCodes().then(() => {
      this.authorityTypes = this.authorityTypeCodes;
    });
    this.getAuthority();
    this.determineIfAuthorityHasAnyOpenSchools();
    this.findClosedDateOfLastClosingSchool();
  },
  methods: {
    formatPhoneNumber,
    formatDate,
    getStatusColorAuthorityOrSchool,
    populateExtraAuthorityFields(authority) {
      authority.status = getStatusAuthorityOrSchool(authority);
      authority.type = this.getAuthorityType(authority);
    },
    isNumber: function (evt) {
      let charCode = (evt.which) ? evt.which : evt.keyCode;
      if ((charCode > 31 && (charCode < 48 || charCode > 57)) && charCode !== 46) {
        evt.preventDefault();
      } else {
        return true;
      }
    },
    getAuthority() {
      this.loading = true;

      ApiService.apiAxios.get(Routes.institute.AUTHORITY_DATA_URL + '/' + this.authorityID, {}).then(response => {
        this.authority = response.data;
        this.populateExtraAuthorityFields(this.authority);
      }).catch(error => {
        console.error(error);
      }).finally(() => {
        this.setHasSamePhysicalFlag();
        this.loading = false;
      });
    },
    determineIfAuthorityHasAnyOpenSchools() {
      this.loading = true;
      ApiService.apiAxios.get(Routes.institute.SCHOOL_PAGINATED_DATA_URL, {
        params: {
          pageNumber: 0,
          pageSize: 100,
          searchParams: omitBy({
            status: 'isOpenOrOpening',
            authorityID: this.authorityID,
          }, isEmpty),
        }
      }).then(response => {
        this.listOfOpenSchools = response.data.content;
        this.authorityHasOpenSchools = response.data.content.length > 0;
      }).catch(error => {
        console.error(error);
        this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while trying to determine if the authority has any open schools. Please try again later.');
      }).finally(() => {
        this.loading = false;
      });
    },
    cancelEdit() {
      this.editing = !this.editing;
      this.setHasSamePhysicalFlag();
    },
    findClosedDateOfLastClosingSchool() {
      this.loading = true;
      ApiService.apiAxios.get(Routes.institute.SCHOOL_PAGINATED_DATA_URL, {
        params: {
          pageNumber: 0,
          pageSize: 100,
          sort: {
            closedDate: 'DESC'
          },
          searchParams: omitBy({
            authorityID: this.authorityID,
            status: 'Closing'
          }, isEmpty),
        }
      }).then(response => {
        this.listOfClosingSchools = response.data.content;
        this.closedDateOfLastClosingSchool = response.data.content[0] ? response.data.content[0].closedDate : null;
      }).catch(error => {
        console.error(error);
        this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while trying to find the closed date of the last closing school. Please try again later.');
      }).finally(() => {
        this.loading = false;
      });
    },
    backButtonClick() {
      router.push({ name: 'instituteAuthoritiesList' });
    },
    deepCloneObject,
    addAddressesIfRequired(authority) {
      let addresses = authority?.addresses;
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
    canEditAuthorities() {
      if (this.authority?.authorityTypeCode === 'INDEPENDNT') {
        return this.INDEPENDENT_AUTHORITY_ADMIN_ROLE || this.INDEPENDENT_SCHOOLS_ADMIN_ROLE;
      } else if (this.authority?.authorityTypeCode === 'OFFSHORE') {
        return this.INDEPENDENT_AUTHORITY_ADMIN_ROLE || this.OFFSHORE_SCHOOLS_ADMIN_ROLE;
      }
      return this.INDEPENDENT_AUTHORITY_ADMIN_ROLE;
    },
    setHasSamePhysicalFlag() {
      this.sameAsMailingCheckbox = this.hasSamePhysicalAddress;
    },
    async clickSameAsAddressButton() {
      await this.$nextTick();
      this.$refs.authorityForm.validate();
    },
    showEditLinks(fieldValue) {
      return this.canEditAuthorities() && !fieldValue;
    },
    saveAuthority() {
      if (this.sameAsMailingCheckbox) {
        this.authorityCopy.addresses = this.authorityCopy.addresses.filter(address => address.addressTypeCode === 'MAILING');
      }
      this.$emit('updateAuthority', this.authorityCopy);
    },
    async toggleEdit() {
      this.authorityCopy = this.deepCloneObject(this.authority);
      this.addAddressesIfRequired(this.authorityCopy);
      this.editing = !this.editing;
      await this.$nextTick();
      await this.$refs.authorityForm.validate();
    },
    getAuthorityType(authority) {
      return this.authorityTypes.find((autorityType) => autorityType.authorityTypeCode === authority?.authorityTypeCode).label;
    },
    hasMailingAddress() {
      return this.authority?.addresses.filter(address => address.addressTypeCode === 'MAILING').length > 0;
    },
    hasPhysicalAddress() {
      return this.authority?.addresses.filter(address => address.addressTypeCode === 'PHYSICAL').length > 0;
    },
    getMailingAddress() {
      return this.authority?.addresses.filter(address => address.addressTypeCode === 'MAILING');
    },
    getPhysicalAddress() {
      return this.authority?.addresses.filter(address => address.addressTypeCode === 'PHYSICAL');
    },
    getMailingAddressCopy() {
      return this.authorityCopy.addresses.filter(address => address.addressTypeCode === 'MAILING');
    },
    getPhysicalAddressCopy() {
      return this.authorityCopy.addresses.filter(address => address.addressTypeCode === 'PHYSICAL');
    },
    getMailingAddressItem(item) {
      let mailingAddress = this.authority?.addresses.filter(address => address.addressTypeCode === 'MAILING');
      for (const x in mailingAddress[0]) {
        if (x === item) {
          return mailingAddress[0][item];
        }
      }
    },
    getPhysicalAddressItem(item) {
      let physicalAddress = this.authority?.addresses.filter(address => address.addressTypeCode === 'PHYSICAL');
      for (const x in physicalAddress[0]) {
        if (x === item) {
          return physicalAddress[0][item];
        }
      }
    },
    openAuthorityStatusEdit() {
      this.openAuthorityStatusEditCard = true;
    },
    async handleUpdatesToAuthorityStatus(updatedDatesForAuthority) {
      await this.$nextTick();
      if (updatedDatesForAuthority.openedDate) {
        this.authorityCopy.openedDate = updatedDatesForAuthority.openedDate;
      } else {
        this.authorityCopy.openedDate = null;
      }
      if (updatedDatesForAuthority.closedDate) {
        this.authorityCopy.closedDate = updatedDatesForAuthority.closedDate;
      } else {
        this.authorityCopy.closedDate = null;
      }
      this.authorityCopy.status = getStatusAuthorityOrSchool(this.authorityCopy);
      this.$refs.authorityForm.validate();
    },       
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
  
