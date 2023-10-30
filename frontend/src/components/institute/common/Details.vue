<template>
  <v-form
    ref="schoolDetailsForm"
    v-model="schoolDetailsFormValid"
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
                v-if="canEditSchoolDetails()"
                id="schoolDetailsEditButton"
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
                :disabled="!schoolDetailsFormValid"
                @click-action="updateSchoolDetails"
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
                v-model="schoolDetailsCopy.displayName"
                label="School Name"
                :maxlength="255"
                variant="underlined"
                class="pr-13"
                :rules="[rules.required()]"
                @update:model-value="validateForm"
                required
              />
            </v-col>
            <v-col
              cols="4"
              lg="3"
              class="pb-0 pt-0"
            >
              <v-text-field
                v-model="schoolDetailsCopy.displayNameNoSpecialChars"
                label="Legacy Safe School Name"
                variant="underlined"
                class="pr-13"
                :maxlength="255"
                :rules="[rules.noSpecialCharactersSchDisAuthName(), rules.specialCharactersInSchDisName(schoolDetailsCopy.displayName)]"
                @update:model-value="validateForm"
              />
            </v-col>
          </v-row>
          <v-row class="d-flex justify-start mb-2">
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
                <v-col
                  cols="10"
                  class="d-flex justify-start"
                >
                  <span
                    v-if="!editing"
                    class="ministryLine"
                  >
                    <v-icon
                      class="ml-n1 pr-1"
                      :color="getStatusColorAuthorityOrSchool(school.status)"
                      dark
                    >
                      mdi-circle-medium
                    </v-icon>
                    {{ school.status }}</span>
                  <v-col
                    v-else
                    class="ministryLine mt-n4 pl-0"
                  >
                    <v-btn
                      id="editSchoolStatusButton"
                      variant="outlined"
                      density="compact"
                      class="mt-1 mb-1"
                      :secondary="true"
                      @click="openSchoolStatusEdit"
                    >
                      <v-icon
                        class="ml-n1 pr-3"
                        :color="getStatusColorAuthorityOrSchool(schoolDetailsCopy.status)"
                        dark
                      >
                        mdi-circle-medium
                      </v-icon>
                      <span>{{
                        schoolDetailsCopy.status
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
              <v-row
                no-gutters
                class="d-flex justify-start"
              >
                <v-col
                  cols="10"
                  class="d-flex justify-start"
                >
                  <span style="color: grey">Open Date</span>
                </v-col>
              </v-row>
              <v-row no-gutters>
                <v-col
                  cols="10"
                  class="d-flex justify-start"
                >
                  <span
                    v-if="!editing"
                    class="ministryLine"
                    style="color: black"
                  >{{ formatDate(school.openedDate) || '-' }}</span>
                  <span
                    v-else
                    class="ministryLine"
                    style="color: black"
                  >{{ formatDate(schoolDetailsCopy.openedDate) || '-' }}</span>
                </v-col>
              </v-row>
            </v-col>
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
                  <span style="color: grey">Close Date</span>
                </v-col>
              </v-row>
              <v-row no-gutters>
                <v-col
                  cols="10"
                  class="d-flex justify-start"
                >
                  <span
                    v-if="!editing"
                    class="ministryLine"
                    style="color: black"
                  >{{
                    formatDate(school.closedDate) || '-'
                  }}</span>
                  <span
                    v-else
                    class="ministryLine"
                    style="color: black"
                  >{{
                    formatDate(schoolDetailsCopy.closedDate) || '-'
                  }}</span>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
          <v-row class="d-flex justify-start mb-3">
            <v-col
              cols="4"
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
                  <span style="color: grey">School Category</span>
                </v-col>
              </v-row>
              <v-row no-gutters>
                <v-col
                  cols="10"
                  class="d-flex justify-start"
                >
                  <span
                    v-if="!editing"
                    class="ministryLine"
                    style="color: black"
                  >{{
                    school.schoolCategory
                  }}</span>
                  <v-select
                    v-else
                    v-model="schoolDetailsCopy.schoolCategoryCode"
                    :items="schoolCategorySchoolEditOptions"
                    item-value="schoolCategoryCode"
                    item-title="label"
                    variant="underlined"
                    label="School Category"
                    class="mt-n5"
                    single
                    required
                  />
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
                class="d-flex justify-start"
              >
                <v-col
                  cols="10"
                  class="d-flex justify-start"
                >
                  <span style="color: grey">Facility Type</span>
                </v-col>
              </v-row>
              <v-row no-gutters>
                <v-col
                  cols="10"
                  class="d-flex justify-start"
                >
                  <span
                    v-if="!editing"
                    class="ministryLine"
                    style="color: black"
                  >{{
                    school.facilityType
                  }}</span>
                  <v-select
                    v-else
                    v-model="schoolDetailsCopy.facilityTypeCode"
                    :items="allowedFacilityTypeCodesForSchoolCategoryCode"
                    item-value="facilityTypeCode"
                    item-title="label"
                    variant="underlined"
                    label="Facility Type"
                    single
                    class="mt-n5"
                    required
                    :rules="[rules.required()]"
                  />
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
                class="d-flex justify-start"
              >
                <v-col
                  cols="10"
                  class="d-flex justify-start"
                >
                  <span style="color: grey">Grades Offered</span>
                </v-col>
              </v-row>
              <v-row no-gutters>
                <v-col
                  cols="10"
                  class="d-flex justify-start"
                >
                  <span
                    v-if="!editing"
                    class="ministryLine"
                    style="color: black"
                  >{{
                    getGradesOffered(school.grades)
                  }}</span>
                  <v-select
                    v-else
                    v-model="schoolDetailsCopy.grades"
                    :items="filteredGradeOptions"
                    item-value="schoolGradeCode"
                    item-title="label"
                    label="Grades Offered"
                    variant="underlined"
                    :disabled="isGradeOfferedUpdateAllowed"
                    class="mt-n5"
                    multiple
                    required
                    @input="sortGrades"
                  />
                </v-col>
              </v-row>
            </v-col>
          </v-row>
          <v-row class="d-flex justify-start mt-3">
            <v-col
              cols="4"
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
                  <span style="color: grey">School Organization</span>
                </v-col>
              </v-row>
              <v-row no-gutters>
                <v-col
                  cols="10"
                  class="d-flex justify-start"
                >
                  <span
                    v-if="!editing"
                    class="ministryLine"
                    style="color: black"
                  >{{
                    getSchoolOrganization(school)
                  }}</span>
                  <v-select
                    v-else
                    v-model="schoolDetailsCopy.schoolOrganizationCode"
                    :items="schoolOrganizationTypeCodes"
                    item-value="schoolOrganizationCode"
                    item-title="label"
                    class="mt-n5"
                    variant="underlined"
                    label="School Organization Code"
                    single
                    required
                  />
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
                class="d-flex justify-start"
              >
                <v-col
                  cols="10"
                  class="d-flex justify-start"
                >
                  <span style="color: grey">Reporting Requirement</span>
                </v-col>
              </v-row>
              <v-row no-gutters>
                <v-col
                  cols="10"
                  class="d-flex justify-start"
                >
                  <span
                    v-if="!editing"
                    class="ministryLine"
                    style="color: black"
                  >{{
                    schoolReportingRequirementType.label || ''
                  }}</span>
                  <v-select
                    v-else
                    v-model="schoolDetailsCopy.schoolReportingRequirementCode"
                    :items="schoolReportingRequirementTypes"
                    item-value="schoolReportingRequirementCode"
                    item-title="label"
                    class="mt-n5"
                    variant="underlined"
                    label="Reporting Requirement"
                    single
                    required
                  />
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
                class="d-flex justify-start"
              >
                <v-col
                  cols="10"
                  class="d-flex justify-start"
                >
                  <span style="color: grey">NLC Activity</span>
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
                    getNLCActivity(school)
                  }}</span>
                  <v-select
                    v-else
                    v-model="schoolDetailsCopy.neighborhoodLearning"
                    :items="schoolNeighborhoodLearningTypes"
                    item-value="neighborhoodLearningTypeCode"
                    item-title="label"
                    class="mt-n5"
                    variant="underlined"
                    label="NLC Activity"
                    multiple
                    @input="sortNLC"
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
              cols="2"
              lg="2"
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
                  <span style="color: grey">Phone</span>
                </v-col>
              </v-row>
              <v-row
                no-gutters
              >
                <v-col
                  cols="10"
                  class="d-flex justify-start"
                >
                  <div v-if="!editing">
                    <span
                      v-if="school.phoneNumber"
                      class="ministryLine"
                    >{{
                      formatPhoneNumber(school.phoneNumber)
                    }}</span>
                    <a
                      v-if="showEditLinks(school.phoneNumber)"
                      class="editField"
                      @click="toggleEdit"
                    >+Phone</a>
                  </div>
                  <v-text-field
                    v-else
                    id="schoolDetailsPhoneNumber"
                    v-model="schoolDetailsCopy.phoneNumber"
                    label="Phone"
                    class="ministryLine"
                    variant="underlined"
                    required
                    :maxlength="10"
                    :rules="[rules.phoneNumber()]"
                    @keypress="isNumber($event)"
                  />
                </v-col>
              </v-row>
            </v-col>
            <v-col
              cols="2"
              lg="2"
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
              <v-row
                no-gutters
              >
                <v-col
                  cols="10"
                  class="d-flex justify-start"
                >
                  <div v-if="!editing">
                    <span
                      v-if="school.faxNumber"
                      class="ministryLine"
                    >{{
                      formatPhoneNumber(school.faxNumber)
                    }}</span>
                    <a
                      v-if="showEditLinks(school.faxNumber)"
                      class="editField"
                      @click="toggleEdit"
                    >+Fax</a>
                  </div>
                  <v-text-field
                    v-else
                    id="schoolDetailsFaxNumber"
                    v-model="schoolDetailsCopy.faxNumber"
                    label="Fax Number"
                    class="ministryLine"
                    variant="underlined"
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
              <v-row
                no-gutters
              >
                <v-col
                  cols="10"
                  class="d-flex justify-start"
                >
                  <div v-if="!editing">
                    <span
                      v-if="school.email"
                      style="word-break: break-all;"
                      class="ministryLine"
                    >{{
                      school.email
                    }}</span>
                    <a
                      v-if="showEditLinks(school.email)"
                      class="editField"
                      @click="toggleEdit"
                    >+Email</a>
                  </div>
                  <v-text-field
                    v-else
                    id="schoolDetailsEmail"
                    v-model="schoolDetailsCopy.email"
                    label="Email"
                    class="ministryLine"
                    variant="underlined"
                    required
                    :rules="[rules.email()]"
                    :maxlength="255"
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
                  <span style="color: grey">Website</span>
                </v-col>
              </v-row>
              <v-row
                no-gutters
              >
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
                    v-model="schoolDetailsCopy.website"
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
              v-if="!hasMailingAddress() && !editing"
              no-gutters
              class="d-flex justify-start"
            >
              <v-col class="mt-2">
                <a
                  v-if="canEditSchoolDetails()"
                  class="editField"
                  @click="toggleEditWithAddress"
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
                <v-row no-gutters>
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
                          getMailingAddressItem('city') + ', ' + getMailingAddressItem('provinceCode') + ', ' + getMailingAddressItem('countryCode')
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
                v-if="displayPhysicalAddress()"
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
                          getPhysicalAddressItem('city') + ', ' + getPhysicalAddressItem('provinceCode') + ', ' + getPhysicalAddressItem('countryCode')
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
                      class="ml-9"
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
            <v-row
              v-if="!showAddress"
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
                  class="mt-3"
                >
                  <v-col cols="4">
                    <h3>Mailing Address</h3>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="4">
                    <v-text-field
                      id="newSchoolMailingAddressLine1Input"
                      v-model="getMailingAddressCopy()[0].addressLine1"
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
                      v-model="getMailingAddressCopy()[0].addressLine2"
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
                      v-model="getMailingAddressCopy()[0].city"
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
                      v-model="getMailingAddressCopy()[0].provinceCode"
                      :rules="[rules.required()]"
                      class="pt-0"
                      label="Province"
                      variant="underlined"
                      :items="provinceCodeValues"
                      item-title="label"
                      item-value="provinceCode"
                    />
                  </v-col>
                  <v-col cols="4">
                    <v-select
                      id="newSchoolMailingAddressCountryInput"
                      v-model="getMailingAddressCopy()[0].countryCode"
                      :rules="[rules.required()]"
                      class="pt-0"
                      label="Country"
                      variant="underlined"
                      :items="countryCodeValues"
                      item-title="label"
                      item-value="countryCode"
                    />
                  </v-col>
                  <v-col cols="4">
                    <v-text-field
                      id="newContactMailingAddressPostalCodeInput"
                      v-model="getMailingAddressCopy()[0].postal"
                      :rules="[rules.required(), rules.postalCode()]"
                      variant="underlined"
                      class="pt-0"
                      :maxlength="6"
                      label="Postal Code"
                    />
                  </v-col>
                </v-row>
                <v-row
                  v-if="displayPhysicalAddress()"
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
                        @update:model-value="clickSameAsAddressButton"
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
                              v-model="getPhysicalAddressCopy()[0].addressLine1"
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
                              v-model="getPhysicalAddressCopy()[0].addressLine2"
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
                              v-model="getPhysicalAddressCopy()[0].city"
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
                              v-model="getPhysicalAddressCopy()[0].provinceCode"
                              :rules="[rules.required()]"
                              class="pt-0"
                              label="Province"
                              variant="underlined"
                              :items="provinceCodeValues"
                              item-title="label"
                              item-value="provinceCode"
                            />
                          </v-col>
                          <v-col cols="4">
                            <v-select
                              id="newSchoolPhysicalAddressCountryInput"
                              v-model="getPhysicalAddressCopy()[0].countryCode"
                              :rules="[rules.required()]"
                              class="pt-0"
                              variant="underlined"
                              label="Country"
                              :items="countryCodeValues"
                              item-title="label"
                              item-value="countryCode"
                            />
                          </v-col>
                          <v-col cols="4">
                            <v-text-field
                              id="newContactPhysicalAddressPostalCodeInput"
                              v-model="getPhysicalAddressCopy()[0].postal"
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
                          dense
                          label="Same as Mailing Address"
                          class="mt-n3 pt-0"
                          @update:model-value="clickSameAsAddressButton"
                        />
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </div>
        </v-col>
      </v-row>
    </v-container>
    <!--    new contact sheet -->
    <v-dialog
      v-model="openSchoolStatusEditCard"
      inset
      no-click-animation
      scrollable
      persistent
      max-width="30%"
    >
      <SchoolStatus
        v-if="openSchoolStatusEditCard"
        :school-open-date="schoolDetailsCopy.openedDate"
        :school-close-date="schoolDetailsCopy.closedDate"
        :school-status="schoolDetailsCopy.status"
        :is-school-status-update-allowed="isSchoolStatusUpdateAllowed"
        @updateSchoolDates="handleUpdatesToSchoolStatus"
        @schoolStatus:closeEditSchoolStatusPage="openSchoolStatusEditCard = !openSchoolStatusEditCard"
      />
    </v-dialog>
  </v-form>
</template>

<script>

import PrimaryButton from '../../util/PrimaryButton.vue';
import {mapActions, mapState} from 'pinia';
import alertMixin from '@/mixins/alertMixin';
import ApiService from '@/common/apiService';
import {Routes} from '@/utils/constants';
import {formatPhoneNumber, formatDate} from '@/utils/format';
import {getStatusColorAuthorityOrSchool, getStatusAuthorityOrSchool} from '@/utils/institute/status';
import router from '@/router';
import {sanitizeUrl} from '@braintree/sanitize-url';
import {deepCloneObject} from '@/utils/common';
import * as Rules from '@/utils/institute/formRules';
import {isNumber} from '@/utils/institute/formInput';
import SchoolStatus from '@/components/institute/SchoolStatus.vue';
import {sortBy} from 'lodash';
import {getAllowedFacilityTypes} from '@/utils/institute/editFacilityTypeMatrix';
import {authStore} from '@/store/modules/auth';
import {instituteStore} from '@/store/modules/institute';
import {notificationsStore} from '@/store/modules/notifications';

export default {
  name: 'Details',
  components: {
    SchoolStatus,
    PrimaryButton
  },
  mixins: [alertMixin],
  props: {
    schoolID: {
      type: String,
      required: true
    },
  },
  data() {
    return {
      independentArray: ['INDEPEND', 'INDP_FNS'],
      offshoreArray: ['OFFSHORE'],
      newNoteSheet: false,
      newNoteText: '',
      school: '',
      district: '',
      authority: '',
      cleanWebsiteUrl: '',
      schoolFacilityTypes: [],
      activeSchoolCategoryTypes: [],
      schoolCategoryTypes: [],
      schoolOrganizationTypes: [],
      schoolReportingRequirementTypes: [],
      schoolNeighborhoodLearningTypes: [],
      schoolGradeTypes: [],
      loading: true,
      schoolDetailsFormValid: true,
      editing: false,
      schoolDetailsCopy: {},
      sameAsMailingCheckbox: true,
      provinceCodeValues: [],
      countryCodeValues: [],
      showAddress: false,
      rules: Rules,
      openSchoolStatusEditCard: false,
      isSchoolStatusUpdateAllowed: true,
      addressButton: {
        icon: 'mdi-plus-thick',
        label: 'Add Address'
      }
    };
  },
  computed: {
    ...mapState(authStore, ['isAuthenticated', 'userInfo', 'SCHOOL_ADMIN_ROLE', 'INDEPENDENT_SCHOOLS_ADMIN_ROLE', 'OFFSHORE_SCHOOLS_ADMIN_ROLE']),
    ...mapState(instituteStore, ['facilityTypeCodes', 'schoolCategoryTypeCodes', 'activeSchoolCategoryTypeCodes', 'schoolOrganizationTypeCodes', 'schoolReportingRequirementTypeCodes', 'schoolNeighborhoodLearningCodes', 'gradeCodes', 'provinceCodes', 'countryCodes', 'schoolCategoryFacilityTypesMap', 'gradeOptions']),
    ...mapState(notificationsStore, ['notification']),
    dataReady: function () {
      return this.userInfo;
    },
    hasSamePhysicalAddress() {
      return !this.school.addresses.filter(address => address.addressTypeCode === 'PHYSICAL').length > 0;
    },
    isOffshoreSchool() {
      return this.school.schoolCategoryCode === 'OFFSHORE';
    },
    allowedFacilityTypeCodesForSchoolCategoryCode() {
      if (this.schoolDetailsCopy?.schoolCategoryCode) {
        let resultingFacilityTypes = getAllowedFacilityTypes(this.schoolDetailsCopy?.schoolCategoryCode, this.schoolDetailsCopy?.facilityTypeCode)?.map(schoolCatFacilityTypeCode => this.facilityTypeCodes.find(facTypCode => facTypCode.facilityTypeCode === schoolCatFacilityTypeCode));

        if (resultingFacilityTypes !== undefined) {
          let result = resultingFacilityTypes.filter(facType => facType.facilityTypeCode === this.schoolDetailsCopy.facilityTypeCode);
          if (result.length === 0) {
            this.resetSchoolDetailsCopyFacilityType();
          }
        }
        return sortBy(resultingFacilityTypes, ['displayOrder']);
      } else {
        this.resetSchoolDetailsCopyFacilityType();
        return [];
      }
    },
    schoolCategorySchoolEditOptions() {
      if (['INDP_FNS', 'FED_BAND'].includes(this.school.schoolCategoryCode)) {
        return this.activeSchoolCategoryTypes.filter(category => ['INDP_FNS', 'FED_BAND'].includes(category.schoolCategoryCode));
      } else {
        return this.activeSchoolCategoryTypes.filter(category => category.schoolCategoryCode === this.school.schoolCategoryCode);
      }
    },
    isGradeOfferedUpdateAllowed() {
      return this.school.schoolCategoryCode === 'POST_SEC' || this.school.schoolCategoryCode === 'EAR_LEARN';
    },
    filteredGradeOptions(){
      if(!this.independentArray.includes(this.school.schoolCategoryCode)){
        return this.gradeOptions.filter(gradeObj => gradeObj.schoolGradeCode !== 'KINDHALF');
      }
      return this.gradeOptions;
    },
    schoolReportingRequirementType() {
      const code = this.school.schoolReportingRequirementCode;
      const type = this.schoolReportingRequirementTypes
        .find(rr => rr.schoolReportingRequirementCode === code);
      if (type === undefined) return {};
      return type;
    }
  },
  watch: {
    notification(notificationData) {
      if (notificationData) {
        if (notificationData.eventType === 'COPY_USERS_TO_NEW_SCHOOL' && notificationData.eventOutcome === 'USERS_TO_NEW_SCHOOL_COPIED' && notificationData.eventPayload) {
          try {
            const moveData = JSON.parse(notificationData.eventPayload);
            if (moveData.toSchool.schoolId) {
              const warningMessage = `School moved successfully. <a style="font-weight: bold" href="/institute/school/${moveData.toSchool.schoolId}/details">Click here to go to new school</a>.`;
              this.setSuccessAlert(warningMessage);
            }
          } catch (e) {
            console.error(e);
          }
        }
      }
    },
  },
  created() {
    const instStore = instituteStore();
    instStore.getAllFacilityTypeCodes().then(() => {
      this.schoolFacilityTypes = sortBy(this.facilityTypeCodes, ['displayOrder']);
    });
    instStore.getAllActiveSchoolCategoryTypeCodes().then(() => {
      this.activeSchoolCategoryTypes = sortBy(this.activeSchoolCategoryTypeCodes, ['displayOrder']);
    });
    instStore.getAllSchoolCategoryTypeCodes().then(() => {
      this.schoolCategoryTypes = sortBy(this.schoolCategoryTypeCodes, ['displayOrder']);
    });
    instStore.getAllSchoolOrganizationTypeCodes().then(() => {
      this.schoolOrganizationTypes = this.schoolOrganizationTypeCodes;
    });
    instStore.getSchoolReportingRequirementTypeCodes().then(() => {
      this.schoolReportingRequirementTypes = this.schoolReportingRequirementTypeCodes;
    });
    instStore.getAllSchoolNeighborhoodLearningCodes().then(() => {
      this.schoolNeighborhoodLearningTypes = sortBy(this.schoolNeighborhoodLearningCodes, ['neighborhoodLearningTypeCode']);
    });
    instStore.getAllGradeCodes().then(() => {
      this.schoolGradeTypes = sortBy(this.gradeCodes, ['displayOrder']);
    });
    instStore.getAllProvinceCodes().then(() => {
      this.provinceCodeValues = this.provinceCodes.filter(province => province.provinceCode === 'BC' || province.provinceCode === 'YT');
    });
    instStore.getAllCountryCodes().then(() => {
      this.countryCodeValues = this.countryCodes;
    });
    instStore.getSchoolCategoryFacilityTypesMap();
    this.getThisSchoolsDetails();
  },
  methods: {
    ...mapActions(instituteStore, ['schoolMovedNotification']),
    isOffshoreSchoolSelected() {
      return this.schoolDetailsCopy?.schoolCategoryCode === 'OFFSHORE';
    },
    async toggleAddressForm() {
      this.showAddress = !this.showAddress;
      this.addressButton = {
        icon: !this.showAddress ? 'mdi-plus-thick ' : 'mdi-minus',
        label: !this.showAddress ? 'Add Address' : 'Remove Address'
      };
      await this.clickSameAsAddressButton();
    },
    getThisSchoolsDetails() {
      this.loading = true;
      this.school = '';

      ApiService.apiAxios.get(`${Routes.institute.SCHOOL_DATA_URL}/${this.schoolID}`)
        .then(response => {
          this.school = response.data;
          this.cleanWebsiteUrl = this.school.website ? sanitizeUrl(this.school.website) : '';
          this.populateExtraSchoolFields(this.school);
          this.getDistrictDetails(this.school.districtId);
          if (this.school.independentAuthorityId) {
            this.getAuthorityDetails(this.school.independentAuthorityId);
          }
          this.setHasSamePhysicalFlag();
        }).catch(error => {
          console.error(error);
          this.setFailureAlert(error.response?.data?.message || error.message);
        }).finally(() => {
          this.loading = false;
        });
    },
    sortGrades() {
      const gradeList = [];
      for (const grade of this.schoolGradeTypes) {
        let schoolGradeType = this.schoolDetailsCopy.grades.find((rawGrade) => rawGrade.schoolGradeCode === grade.schoolGradeCode);
        if (schoolGradeType) {
          gradeList.push(schoolGradeType);
        }
      }
      this.schoolDetailsCopy.grades = gradeList;
    },
    sortNLC() {
      this.schoolDetailsCopy.neighborhoodLearning = sortBy(this.schoolDetailsCopy.neighborhoodLearning, ['neighborhoodLearningTypeCode']);
    },
    saveNewSchoolNote() {
      this.loading = true;
      const payload = {
        schoolID: this.schoolID,
        noteContent: this.newNoteText
      };
      ApiService.apiAxios.post(`${Routes.institute.SCHOOL_NOTE_URL}`, payload)
        .then(() => {
          this.setSuccessAlert('Success! The note has been added to the school.');
        })
        .catch(error => {
          console.error(error);
          this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while adding the saving the school note. Please try again later.');
        })
        .finally(() => {
          this.getThisSchoolsDetails();
          this.newNoteSheet = false;
          this.newNoteText = '';
        });
    },
    getDistrictDetails(districtId) {
      this.district = '';
      ApiService.apiAxios.get(`${Routes.cache.DISTRICT_DATA_URL}/${districtId}`)
        .then(response => {
          this.district = response.data;
        }).catch(error => {
          console.error(error);
          this.setFailureAlert(error.response?.data?.message || error.message);
        }).finally(() => {
          this.loading = false;
        });
    },
    getAuthorityDetails(authorityId) {
      this.authority = '';
      ApiService.apiAxios.get(`${Routes.institute.AUTHORITY_DATA_URL}/${authorityId}`)
        .then(response => {
          this.authority = response.data;
          this.populateExtraAuthorityFields(this.authority);
        }).catch(error => {
          console.error(error);
          this.setFailureAlert(error.response?.data?.message || error.message);
        }).finally(() => {
          this.loading = false;
        });
    },
    populateExtraAuthorityFields(authority) {
      authority.status = getStatusAuthorityOrSchool(authority);
      if (authority.status === 'Closed' || authority.status === 'Closing') {
        this.isSchoolStatusUpdateAllowed = false;
      }
    },
    populateExtraSchoolFields(school) {
      school.status = getStatusAuthorityOrSchool(school);
      school.facilityType = this.getFacilityType(school);
      school.schoolCategory = this.getSchoolCategory(school);
    },
    getMailingAddressItem(item) {
      let mailingAddress = this.school.addresses?.filter(address => address.addressTypeCode === 'MAILING');
      for (const x in mailingAddress[0]) {
        if (x === item) {
          return mailingAddress[0][item];
        }
      }
    },
    getPhysicalAddressItem(item) {
      let physicalAddress = this.school.addresses.filter(address => address.addressTypeCode === 'PHYSICAL');
      for (const x in physicalAddress[0]) {
        if (x === item) {
          return physicalAddress[0][item];
        }
      }
    },
    getGradesOffered(rawGrades) {
      let gradeList = [];

      for (const grade of this.schoolGradeTypes) {
        let schoolGradeType = rawGrades.find((rawGrade) => rawGrade.schoolGradeCode === grade.schoolGradeCode);
        if (schoolGradeType) {
          gradeList.push(grade.label.replaceAll('Grade ', ''));
        }
      }

      return gradeList.toString().replace(/,/g, ', ');
    },
    getSchoolOrganization(school) {
      return this.schoolOrganizationTypes.find((facility) => facility.schoolOrganizationCode === school.schoolOrganizationCode)?.label;
    },
    getNLCActivity(school) {
      let nLCActivityList = [];
      for (const nl of this.schoolNeighborhoodLearningTypes) {
        let schoolNeighborhoodLearningType = school.neighborhoodLearning.find((facility) => facility.neighborhoodLearningTypeCode === nl.neighborhoodLearningTypeCode);
        if (schoolNeighborhoodLearningType) {
          nLCActivityList.push(nl.label);
        }
      }
      nLCActivityList.sort((a, b) => a.localeCompare(b));
      return nLCActivityList.toString().replace(/,/g, ', ');
    },
    getFacilityType(school) {
      return this.schoolFacilityTypes.find((facility) => facility.facilityTypeCode === school.facilityTypeCode)?.label;
    },
    getSchoolCategory(school) {
      return this.schoolCategoryTypes.find((category) => category.schoolCategoryCode === school.schoolCategoryCode)?.label;
    },
    getStatusColorAuthorityOrSchool,
    formatDate,
    formatPhoneNumber,
    deepCloneObject,
    isNumber,
    backButtonClick() {
      router.push({name: 'instituteSchoolList'});
    },
    openHistory() {
      router.push({name: 'schoolHistory', params: {schoolID: this.schoolID}});
    },
    async toggleEdit() {
      this.schoolDetailsCopy = this.deepCloneObject(this.school);
      this.addAddressesIfRequired(this.schoolDetailsCopy);
      this.showAddress = this.hasMailingAddress();
      this.sortGrades();
      this.sortNLC();
      this.editing = !this.editing;
      await this.$nextTick();
      this.$refs.schoolDetailsForm.validate();
    },
    async toggleEditWithAddress() {
      this.schoolDetailsCopy = this.deepCloneObject(this.school);
      this.addAddressesIfRequired(this.schoolDetailsCopy);
      this.showAddress = true;
      this.sortGrades();
      this.sortNLC();
      this.editing = !this.editing;
      await this.$nextTick();
      this.$refs.schoolDetailsForm.validate();
    },
    showEditLinks(fieldValue) {
      return this.canEditSchoolDetails() && !fieldValue;
    },
    cancelClicked() {
      this.editing = false;
      this.setHasSamePhysicalFlag();
    },
    setHasSamePhysicalFlag() {
      this.sameAsMailingCheckbox = this.hasSamePhysicalAddress;
    },
    async updateSchoolDetails() {
      if (this.sameAsMailingCheckbox) {
        this.schoolDetailsCopy.addresses = this.schoolDetailsCopy.addresses.filter(address => address.addressTypeCode === 'MAILING');
      }

      let mailing = this.schoolDetailsCopy.addresses.filter(address => address.addressTypeCode === 'MAILING');
      if (!mailing[0]?.city) {
        this.schoolDetailsCopy.addresses = null;
      }

      this.$emit('updateSchool', this.schoolDetailsCopy);
    },
    hasMailingAddress() {
      return this.school.addresses?.filter(address => address.addressTypeCode === 'MAILING').length > 0;
    },
    hasPhysicalAddress() {
      return this.school.addresses?.filter(address => address.addressTypeCode === 'PHYSICAL').length > 0;
    },
    getMailingAddressCopy() {
      return this.schoolDetailsCopy.addresses?.filter(address => address.addressTypeCode === 'MAILING');
    },
    getPhysicalAddressCopy() {
      return this.schoolDetailsCopy.addresses?.filter(address => address.addressTypeCode === 'PHYSICAL');
    },
    addAddressesIfRequired(school) {
      let addresses = school.addresses;
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
    canEditSchoolDetails() {
      if (this.school.schoolCategoryCode && this.independentArray.includes(this.school.schoolCategoryCode)) {
        return this.INDEPENDENT_SCHOOLS_ADMIN_ROLE || this.SCHOOL_ADMIN_ROLE;
      } else if(this.school.schoolCategoryCode && this.offshoreArray.includes(this.school.schoolCategoryCode)) {
        return this.OFFSHORE_SCHOOLS_ADMIN_ROLE || this.SCHOOL_ADMIN_ROLE;
      }
      return this.SCHOOL_ADMIN_ROLE;
    },

    async clickSameAsAddressButton() {
      await this.$nextTick();
      await this.$refs.schoolDetailsForm.validate();
    },
    displayPhysicalAddress() {
      return (this.editing && !this.isOffshoreSchoolSelected()) || (!this.editing && !this.isOffshoreSchool);
    },
    async handleUpdatesToSchoolStatus(updatedDatesForSchool) {
      await this.$nextTick();
      if (updatedDatesForSchool.openedDate) {
        this.schoolDetailsCopy.openedDate = updatedDatesForSchool.openedDate;
      } else {
        this.schoolDetailsCopy.openedDate = null;
      }
      if (updatedDatesForSchool.closedDate) {
        this.schoolDetailsCopy.closedDate = updatedDatesForSchool.closedDate;
      } else {
        this.schoolDetailsCopy.closedDate = null;
      }

      this.schoolDetailsCopy.status = getStatusAuthorityOrSchool(this.schoolDetailsCopy);
      this.$refs.schoolDetailsForm.validate();
    },
    async validateForm() {
      if(this.$refs.schoolDetailsForm){
        const isValid = await this.$refs.schoolDetailsForm.validate();
        this.schoolDetailsFormValid = isValid.valid;
      }
    },
    openSchoolStatusEdit() {
      this.openSchoolStatusEditCard = true;
    },
    resetSchoolDetailsCopyFacilityType() {
      this.schoolDetailsCopy.facilityType = null;
      this.schoolDetailsCopy.facilityTypeCode = null;
    },
  },
};
</script>

<style scoped>

.fontItalic {
    font-style: italic;
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
