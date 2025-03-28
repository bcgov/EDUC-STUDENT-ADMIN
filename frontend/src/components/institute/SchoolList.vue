<template>
  <v-container
    class="containerSetup"
    fluid
  >
    <v-form
      ref="schoolForm"
      v-model="isFormValid"
    >
      <Spinner
        v-if="loadingSchools"
        flat
      />
      <div v-else>
        <v-row>
          <v-col class="mt-1 d-flex justify-start">
            <v-icon
              small
              color="#1976d2"
            >
              mdi-arrow-left
            </v-icon>
            <a
              class="ml-1"
              @click="backButtonClick"
            >Return to Dashboard</a>
          </v-col>
          <v-col class="d-flex justify-end">
            <PrimaryButton
              v-if="canAddSchools"
              id="addSchoolBtn"
              icon-left
              width="11em"
              icon="mdi-plus-thick"
              text="New School"
              @click-action="openNewSchoolSheet"
            />
          </v-col>
        </v-row>
        <v-row
          style="background: rgb(235, 237, 239);border-radius: 8px;"
          class="pt-3 px-3 elevation-2"
        >
          <v-col class="pt-0">
            <v-row>
              <v-col
                cols="12"
                md="4"
                class="d-flex justify-start"
              >
                <v-autocomplete
                  id="name-text-field"
                  v-model="schoolCodeNameFilter"
                  label="School Code & Name"
                  item-value="schoolID"
                  item-title="schoolCodeName"
                  variant="underlined"
                  :items="schoolSearchNames"
                  :menu-props="{closeOnContentClick:true}"
                  :clearable="true"
                  @update:model-value="searchButtonClick"
                >
                  <template #prepend-inner>
                    <v-icon
                      v-if="schoolCodeNameFilter"
                      class="pt-1"
                      :color="getStatusColorAuthorityOrSchool(schoolSearchNames.find(x=>x.schoolID===schoolCodeNameFilter)?.status)"
                    >
                      mdi-circle-medium
                    </v-icon>
                  </template>
                  <template #item="{ props, item }">
                    <v-list-item
                      v-bind="props"
                      prepend-icon="mdi-circle-medium"
                      :base-color="getStatusColorAuthorityOrSchool(item.raw.status)"
                      title=""
                    >
                      <v-list-item-title style="color: black !important;">
                        {{
                          item.raw.schoolCodeName
                        }}
                      </v-list-item-title>
                    </v-list-item>
                  </template>
                </v-autocomplete>
              </v-col>
              <v-col
                cols="12"
                md="2"
                class="d-flex justify-start"
              >
                <v-select
                  id="status-select-field"
                  v-model="schoolStatusFilter"
                  :clearable="true"
                  :items="schoolStatus"
                  item-title="name"
                  variant="underlined"
                  item-value="code"
                  :menu-props="{closeOnContentClick:true}"
                  label="Status"
                >
                  <template #prepend-inner>
                    <v-icon
                      v-if="schoolStatusFilter"
                      class="pt-1"
                      :color="getStatusColorAuthorityOrSchool(schoolStatusFilter)"
                    >
                      mdi-circle-medium
                    </v-icon>
                  </template>
                  <template #item="{ props, item }">
                    <v-list-item
                      v-bind="props"
                      prepend-icon="mdi-circle-medium"
                      :base-color="getStatusColorAuthorityOrSchool(item.raw.code)"
                      title=""
                    >
                      <v-list-item-title style="color: black !important;">
                        {{
                          item.raw.name
                        }}
                      </v-list-item-title>
                    </v-list-item>
                  </template>
                </v-select>
              </v-col>
              <v-col
                cols="12"
                md="3"
                class="d-flex justify-start"
              >
                <v-select
                  id="category-select-field"
                  v-model="schoolCategoryTypeFilter"
                  :clearable="true"
                  :items="activeSchoolCategoryTypes"
                  variant="underlined"
                  item-title="label"
                  item-value="schoolCategoryCode"
                  label="School Category"
                  @update:model-value="schoolCategoryChanged"
                />
              </v-col>
              <v-col
                cols="12"
                md="3"
                class="d-flex justify-start"
              >
                <v-select
                  id="facility-select-field"
                  v-model="schoolFacilityTypeFilter"
                  :clearable="true"
                  :items="schoolFacilityTypes"
                  variant="underlined"
                  :disabled="!activeFacilityTypeCodes || !schoolCategoryTypeFilter"
                  item-title="label"
                  item-value="facilityTypeCode"
                  label="Facility Type"
                />
              </v-col>
            </v-row>
            <v-row class="mt-n6">
              <v-col
                cols="12"
                md="4"
                class="d-flex justify-start"
              >
                <v-autocomplete
                  id="district-text-field"
                  v-model="districtCodeNameFilter"
                  :clearable="true"
                  :items="districtSearchNames"
                  item-title="districtNumberName"
                  variant="underlined"
                  item-value="districtId"
                  :menu-props="{closeOnContentClick:true}"
                  label="District Number & Name"
                  @update:model-value="searchButtonClick"
                >
                  <template #prepend-inner>
                    <v-icon
                      v-if="districtCodeNameFilter"
                      class="pt-1"
                      :color="getDistrictStatusColor(districtSearchNames.find(x=>x.districtId===districtCodeNameFilter)?.status)"
                    >
                      mdi-circle-medium
                    </v-icon>
                  </template>
                  <template #item="{ props, item }">
                    <v-list-item
                      v-bind="props"
                      prepend-icon="mdi-circle-medium"
                      :base-color="getDistrictStatusColor(item.raw.status)"
                      title=""
                    >
                      <v-list-item-title style="color: black !important;">
                        {{
                          item.raw.districtNumberName
                        }}
                      </v-list-item-title>
                    </v-list-item>
                  </template>
                </v-autocomplete>
              </v-col>
              <v-col
                cols="12"
                md="4"
                class="d-flex justify-start"
              >
                <v-autocomplete
                  id="authority-text-field"
                  v-model="authorityCodeNameFilter"
                  label="Authority Code & Name"
                  item-value="authorityID"
                  item-title="authorityCodeName"
                  variant="underlined"
                  :items="authoritySearchNames"
                  :menu-props="{closeOnContentClick:true}"
                  :clearable="true"
                  @update:model-value="searchButtonClick"
                >
                  <template #prepend-inner>
                    <v-icon
                      v-if="authorityCodeNameFilter"
                      class="pt-1"
                      :color="getStatusColorAuthorityOrSchool(authoritySearchNames.find(x=>x.authorityID===authorityCodeNameFilter)?.status)"
                    >
                      mdi-circle-medium
                    </v-icon>
                  </template>
                  <template #item="{ props, item }">
                    <v-list-item
                      v-bind="props"
                      prepend-icon="mdi-circle-medium"
                      :base-color="getStatusColorAuthorityOrSchool(item.raw.status)"
                      title=""
                    >
                      <v-list-item-title style="color: black !important;">
                        {{
                          item.raw.authorityCodeName
                        }}
                      </v-list-item-title>
                    </v-list-item>
                  </template>
                </v-autocomplete>
              </v-col>
              <v-col
                cols="12"
                md="4"
                class="d-flex justify-start"
              >
                <v-autocomplete
                  id="reporting-requirement-text-field"
                  v-model="schoolReportingRequirementCodeFilter"
                  label="Reporting Requirement"
                  item-value="schoolReportingRequirementCode"
                  variant="underlined"
                  item-title="label"
                  :items="schoolReportingRequirementTypeCodes"
                  :clearable="true"
                  @update:model-value="searchButtonClick"
                />
              </v-col>
            </v-row>
            <v-row class="mt-n6">
              <v-col
                cols="12"
                md="2"
                class="d-flex justify-start"
              >
                <v-select
                  id="issue-transcripts-select-field"
                  v-model="issueTranscriptsFilter"
                  :clearable="true"
                  :items="issueCertAndTranscriptTypes"
                  variant="underlined"
                  item-title="title"
                  item-value="value"
                  label="Issue Transcripts?"
                />
              </v-col>
              <v-col
                cols="12"
                md="2"
                class="d-flex justify-start"
              >
                <v-select
                  id="issue-certificates-select-field"
                  v-model="issueCertificatesFilter"
                  :clearable="true"
                  :items="issueCertAndTranscriptTypes"
                  variant="underlined"
                  item-title="title"
                  item-value="value"
                  label="Issue Certificates?"
                />
              </v-col>
              <v-col
                cols="12"
                md="3"
                class="d-flex justify-start"
              >
                <v-select
                  id="grade-select-field"
                  v-model="gradeFilter"
                  :clearable="true"
                  :items="schoolGradeTypes"
                  variant="underlined"
                  item-title="label"
                  item-value="schoolGradeCode"
                  label="Grade Offered"
                />
              </v-col>
              <v-col class="d-flex justify-end mt-5">
                <PrimaryButton
                  id="user-search-button"
                  text="Clear"
                  secondary
                  @click-action="clearButtonClick"
                />
                <PrimaryButton
                  id="user-clear-button"
                  class="ml-3"
                  width="8em"
                  text="Search"
                  :disabled="!searchEnabled()"
                  @click-action="searchButtonClick"
                />
              </v-col>
            </v-row>
          </v-col>
        </v-row>
        <v-row>
          <v-col class="px-0">
            <v-data-table-server
              id="schoolListTable"
              v-model:items-per-page="pageSize"
              v-model:page="pageNumber"
              v-model:items="schools"
              v-model:items-length="totalSchools"
              :loading="loadingTable"
              class="elevation-1 rounded"
              hide-default-header
              mobile-breakpoint="0"
            >
              <template #no-data>
                <v-row no-gutters>
                  <v-col class="d-flex justify-center">
                    There are no schools.
                  </v-col>
                </v-row>
              </template>
              <template #item="{ item, index }">
                <v-row
                  no-gutters
                  class="hoverTable pt-1"
                  @click="openSchool(item.raw.schoolId)"
                >
                  <v-col class="pb-0 pt-0 ml-2 mt-1 mb-1">
                    <v-row
                      no-gutters
                      class="mb-n1"
                    >
                      <v-col cols="6">
                        <span class="subjectHeading">{{
                          item.raw.mincode
                        }} - {{
                          item.raw.displayName
                        }}</span>
                      </v-col>
                      <v-col
                        cols="2"
                      >
                        <v-icon
                          class="ml-0 mb-1"
                          :color="getStatusColorAuthorityOrSchool(item.raw.status)"
                          right
                          dark
                        >
                          mdi-circle-medium
                        </v-icon>
                        <span class="statusCodeLabel">{{
                          item.raw.status
                        }}</span>
                      </v-col>
                      <v-col class="d-flex">
                        <v-icon
                          class="mb-3 mr-1"
                          aria-hidden="false"
                        >
                          mdi-account-outline
                        </v-icon>
                        <span
                          class="principalName statusCodeLabel"
                          style="color: black"
                        >{{
                          item.raw.principalsName
                        }}</span>
                      </v-col>
                    </v-row>
                    <v-row no-gutters>
                      <v-col cols="6">
                        <span
                          class="ministryLine"
                          style="color: black"
                        >{{
                          item.raw.schoolCategory
                        }} | {{
                          item.raw.facilityType
                        }}</span>
                      </v-col>
                      <v-col
                        cols="2"
                      >
                        <v-icon
                          class="mb-1"
                          aria-hidden="false"
                        >
                          mdi-phone-outline
                        </v-icon>
                        <span class="statusCodeLabel">{{
                          formatPhoneNumber(item.raw.phoneNumber)
                        }}</span>
                      </v-col>
                      <v-col
                        cols="4"
                        class="d-flex pr-2"
                      >
                        <v-icon
                          class="ml-0 mr-1 mb-1"
                          aria-hidden="false"
                        >
                          mdi-at
                        </v-icon>
                        <span class="statusCodeLabel centerSpan">{{
                          item.raw.email
                        }}</span>
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
                <v-divider />
              </template>
            </v-data-table-server>
          </v-col>
        </v-row>
      </div>
    </v-form>
    <!--    new school sheet -->
    <v-bottom-sheet
      v-model="newSchoolSheet"
      inset
      no-click-animation
      scrollable
      persistent
    >
      <NewSchoolPage
        v-if="newSchoolSheet"
        :district-names="activeDistricts"
        :authority-names="activeAuthorities"
        @newSchool:closeNewSchoolPage="newSchoolSheet = !newSchoolSheet"
      />
    </v-bottom-sheet>
  </v-container>
</template>

<script>

import ApiService from '../../common/apiService';
import {Routes} from '@/utils/constants';
import PrimaryButton from '../util/PrimaryButton.vue';
import {mapActions, mapState} from 'pinia';
import {isEmpty, omitBy, sortBy} from 'lodash';
import alertMixin from '@/mixins/alertMixin';
import {formatPhoneNumber, sortByNameValue, formatContactName} from '@/utils/format';
import {getStatusColorAuthorityOrSchool, getStatusAuthorityOrSchool, isContactCurrent} from '@/utils/institute/status';
import router from '@/router';
import Spinner from '@/components/common/Spinner.vue';
import NewSchoolPage from './NewSchoolPage.vue';
import {isOpenNotClosingAuthority} from '@/utils/common';
import * as Rules from '@/utils/institute/formRules';
import {authStore} from '@/store/modules/auth';
import {appStore} from '@/store/modules/app';
import {edxStore} from '@/store/modules/edx';
import {instituteStore} from '@/store/modules/institute';
import {notificationsStore} from '@/store/modules/notifications';
import { PERMISSION, hasRequiredPermission } from '@/utils/constants/Permission';
import {DateTimeFormatter, LocalDate} from '@js-joda/core';

export default {
  name: 'SchoolListPage',
  components: {
    PrimaryButton,
    Spinner,
    NewSchoolPage
  },
  mixins: [alertMixin],
  data() {
    return {
      statusRadioGroup: 'statusFilterActive',
      statusRadioGroupEnabled: true,
      headers: [
        {
          text: 'Status',
          align: 'start',
          sortable: false,
          value: 'secureExchangeStatusCode',
        }
      ],
      selectedItem: 0,
      pageNumber: 1,
      pageSize: 15,
      totalSchools: 0,
      loadingTable: false,
      dateMenu: false,
      headerSearchParams: {
        schoolNumber: '',
        status: '',
        category: '',
        type: ''
      },
      requests: [],
      isActiveMessagesTabEnabled: true,
      schools: [],
      schoolSearchNames: [],
      districtSearchNames: [],
      activeDistricts: [],
      authoritySearchNames: [],
      activeSchoolCategoryTypes: [],
      activeAuthorities: [],
      schoolStatus: [],
      schoolCodeNameFilter: null,
      districtCodeNameFilter: null,
      authorityCodeNameFilter: null,
      schoolReportingRequirementCodeFilter: null,
      reportingRequirementTypes: [],
      schoolStatusFilter: null,
      schoolCategoryTypes: [],
      schoolCategoryTypeFilter: null,
      schoolGradeTypes: [],
      issueTranscriptsFilter: null,
      issueCertificatesFilter: null,
      gradeFilter: null,
      schoolFacilityTypeFilter: null,
      loadingSchools: true,
      newSchoolSheet: false,
      isFormValid: false,
      rules: Rules,
      facilityTypeCode: null,
      schoolCategoryCode: null,
      independentArray: ['INDEPEND', 'INDP_FNS'],
    };
  },
  computed: {
    ...mapState(authStore, ['userInfo']),
    ...mapState(appStore, ['schoolsMap']),
    ...mapState(edxStore, ['schoolSearchParams']),
    ...mapState(notificationsStore, ['notification']),
    ...mapState(instituteStore, ['facilityTypeCodes', 'activeFacilityTypeCodes', 'schoolCategoryFacilityTypesMap', 'activeSchoolCategoryTypeCodes', 'schoolCategoryTypeCodes', 'schoolReportingRequirementTypeCodes', 'gradeCodes']),
    schoolFacilityTypes() {
      if (!this.activeFacilityTypeCodes || !this.schoolCategoryTypeFilter) {
        return [];
      }
      let facilityTypes = this.schoolCategoryFacilityTypesMap[this.schoolCategoryTypeFilter]?.map(schoolCatFacilityTypeCode => this.activeFacilityTypeCodes.find(facTypCode => facTypCode.facilityTypeCode === schoolCatFacilityTypeCode));
      return sortBy(facilityTypes, ['displayOrder']);
    },
    issueCertAndTranscriptTypes() {
      return [
        {title: 'Yes', value: true, align: 'start'},
        {title: 'No', value: false, align: 'start'}
      ];
    },
    getSheetWidth() {
      return 30;
    },
    canAddSchools() {
      return this.hasRequiredPermission(this.userInfo, PERMISSION.EDIT_SCHOOL_PERMISSION) || this.hasRequiredPermission(this.userInfo, PERMISSION.EDIT_INDEPENDENT_SCHOOL_PERMISSION) || this.hasRequiredPermission(this.userInfo, PERMISSION.EDIT_OFFSHORE_SCHOOL_PERMISSION);
    }
  },
  watch: {
    notification(notificationData) {
      if (notificationData) {
        if (notificationData.eventType === 'CREATE_SCHOOL' && notificationData.eventOutcome === 'SCHOOL_CREATED' && notificationData.eventPayload) {
          try {
            const schoolData = JSON.parse(notificationData.eventPayload);
            if (schoolData.schoolId) {
              const message = `School created successfully. <a style="font-weight: bold" target="_blank" href="/institute/school/${schoolData.schoolId}/details">Click here to go to new school</a>.`;
              this.setSuccessAlert(message);
            }
          } catch (e) {
            console.error(e);
          }
        }
      }
    },
    pageSize() {
      this.getSchoolList();
    },
    pageNumber() {
      this.getSchoolList();
    }
  },
  created() {
    const instStore = instituteStore();
    edxStore().getMinistryTeams();
    instStore.getAllFacilityTypeCodes().then(() => {
      this.allSchoolFacilityTypes = sortBy(this.facilityTypeCodes, ['displayOrder']);
    });
    instStore.getAllSchoolCategoryTypeCodes().then(() => {
      this.schoolCategoryTypes = sortBy(this.schoolCategoryTypeCodes, ['displayOrder']);
    });
    instStore.getSchoolReportingRequirementTypeCodes().then(() => {
      this.reportingRequirementTypes = this.schoolReportingRequirementTypeCodes;
    });
    instStore.getAllActiveFacilityTypeCodes();
    instStore.getAllActiveSchoolCategoryTypeCodes().then(() => {
      this.activeSchoolCategoryTypes = sortBy(this.activeSchoolCategoryTypeCodes, ['displayOrder']);
    });
    instStore.getSchoolCategoryFacilityTypesMap();

    this.setSchoolStatuses();
    this.getSchoolDropDownItems();
    this.getDistrictDropDownItems();
    this.getActiveDistrictDropDownItems();
    this.getAuthorityDropDownItems();
    this.getActiveAuthorityDropDownItems();
    this.setSearchValues();
    if (this.hasSearchValue()) {
      this.getSchoolList();
    }
    instStore.getAllGradeCodes().then(() => {
      this.schoolGradeTypes = sortBy(this.gradeCodes, ['displayOrder']);
    });
  },
  methods: {
    hasRequiredPermission,
    ...mapActions(edxStore, ['setSchoolSearchParams']),
    setSearchValues() {
      this.schoolCodeNameFilter = this.schoolSearchParams.schoolID;
      this.districtCodeNameFilter = this.schoolSearchParams.districtID;
      this.authorityCodeNameFilter = this.schoolSearchParams.authorityID;
      this.schoolStatusFilter = this.schoolSearchParams.status;
      this.schoolFacilityTypeFilter = this.schoolSearchParams.facilityType;
      this.schoolCategoryTypeFilter = this.schoolSearchParams.schoolCategory;
      this.issueTranscriptsFilter = this.schoolSearchParams.issueTranscripts;
      this.issueCertificatesFilter = this.schoolSearchParams.issueCertificates;
      this.gradeFilter = this.schoolSearchParams.grade;
      this.schoolReportingRequirementCodeFilter = this.schoolSearchParams.schoolReportingRequirementCode;
      this.pageNumber = this.schoolSearchParams.pageNumber;
    },

    isOpenNotClosingAuthority,
    setSchoolStatuses() {
      this.schoolStatus = [{name: 'Open', code: 'Open'}, {name: 'Opening', code: 'Opening'}, {
        name: 'Closing',
        code: 'Closing'
      }, {name: 'Closed', code: 'Closed'}, {name: 'Never Opened', code: 'NeverOpened'}];
    },
    getDistrictDropDownItems() {
      ApiService.getDistricts().then((response) => {
        for (const district of response.data) {
          let districtItem = {
            districtNumberName: `${district.districtNumber} - ${district.name}`,
            districtId: district.districtId,
            status: district.districtStatusCode
          };
          this.districtSearchNames.push(districtItem);
        }
        this.districtSearchNames = this.sortByNameValue(this.districtSearchNames, 'districtNumberName');
      }).catch(error => {
        console.error(error);
        this.setFailureAlert('An error occurred while getting districts. Please try again later.');
      });
    },
    getActiveDistrictDropDownItems() {
      ApiService.getActiveDistricts().then((response) => {
        for (const district of response.data) {
          let districtItem = {
            districtNumberName: `${district.districtNumber} - ${district.name}`,
            districtId: district.districtId,
            districtRegionCode: district.districtRegionCode
          };
          this.activeDistricts.push(districtItem);
        }
        this.activeDistricts = this.sortByNameValue(this.activeDistricts, 'districtNumberName');
      }).catch(error => {
        console.error(error);
        this.setFailureAlert('An error occurred while getting active districts. Please try again later.');
      });
    },
    getSchoolDropDownItems() {
      this.loadingSchools = true;
      ApiService.getSchools().then((response) => {
        let schoolList = response.data;
        for (const school of schoolList) {
          let schoolItem = {
            schoolCodeName: school.mincode + ' - ' + school.schoolName,
            schoolID: school.schoolID,
            status: getStatusAuthorityOrSchool(school)
          };
          this.schoolSearchNames.push(schoolItem);
        }
        this.schoolSearchNames = this.sortByNameValue(this.schoolSearchNames, 'schoolCodeName');
      }).catch(error => {
        //to do add the alert framework for error or success
        console.error(error);
      }).finally(() => {
        this.loadingSchools = false;
      });
    },
    getAuthorityDropDownItems() {
      ApiService.getAuthorities().then((response) => {
        for (const authority of response.data) {
          let authorityItem = {
            authorityNumber: +authority.authorityNumber,
            authorityCodeName: `${authority.authorityNumber} - ${authority.name}`,
            authorityID: authority.authorityID,
            status: getStatusAuthorityOrSchool(authority)
          };
          this.authoritySearchNames.push(authorityItem);
        }
        this.authoritySearchNames = this.authoritySearchNames.sort(function (a, b) {
          return a.authorityNumber - b.authorityNumber;
        });
      }).catch(error => {
        console.error(error);
        this.setFailureAlert('An error occurred while getting authorities. Please try again later.');
      });
    },
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
    clearSchoolList() {
      this.schools = [];
      this.totalSchools = 0;
      this.schoolSearchParams.schoolID = null;
      this.schoolSearchParams.districtID = null;
      this.schoolSearchParams.authorityID = null;
      this.schoolSearchParams.status = null;
      this.schoolSearchParams.facilityType = null;
      this.schoolSearchParams.schoolCategory = null;
      this.schoolSearchParams.schoolReportingRequirementCode = null;
      this.schoolSearchParams.issueTranscripts = null;
      this.schoolSearchParams.issueCertificates = null;
      this.schoolSearchParams.pageNumber = 1;
      this.setSchoolSearchParams(this.schoolSearchParams);
    },
    hasSearchValue() {
      return this.schoolSearchParams.schoolID
        || this.schoolSearchParams.districtID
        || this.schoolSearchParams.authorityID
        || this.schoolSearchParams.status
        || this.schoolSearchParams.facilityType
        || this.schoolSearchParams.schoolCategory
        || this.schoolSearchParams.grade
        || (this.schoolSearchParams.issueTranscripts || this.schoolSearchParams.issueTranscripts === false)
        || (this.schoolSearchParams.issueCertificates || this.schoolSearchParams.issueCertificates === false)
        || this.schoolSearchParams.schoolReportingRequirementCode;
    },
    getSchoolList() {
      this.loadingTable = true;
      this.requests = [];
      this.schools = [];

      if (this.schoolCodeNameFilter !== null && this.schoolCodeNameFilter !== '') {
        this.headerSearchParams.schoolID = this.schoolCodeNameFilter;
      } else {
        this.headerSearchParams.schoolID = '';
      }

      if (this.districtCodeNameFilter !== null && this.districtCodeNameFilter !== '') {
        this.headerSearchParams.districtID = this.districtCodeNameFilter;
      } else {
        this.headerSearchParams.districtID = '';
      }

      if (this.authorityCodeNameFilter !== null && this.authorityCodeNameFilter !== '') {
        this.headerSearchParams.authorityID = this.authorityCodeNameFilter;
      } else {
        this.headerSearchParams.authorityID = '';
      }

      this.headerSearchParams.status = this.schoolStatusFilter;
      this.headerSearchParams.category = this.schoolCategoryTypeFilter;
      this.headerSearchParams.type = this.schoolFacilityTypeFilter;
      this.headerSearchParams.gradeCode = this.gradeFilter;
      this.headerSearchParams.schoolReportingRequirementCode = this.schoolReportingRequirementCodeFilter;

      let cleanSearch = omitBy(this.headerSearchParams, isEmpty);

      cleanSearch.issueTranscripts = this.issueTranscriptsFilter;
      cleanSearch.issueCertificates = this.issueCertificatesFilter;

      ApiService.apiAxios.get(Routes.institute.SCHOOL_PAGINATED_DATA_URL, {
        params: {
          pageNumber: this.pageNumber - 1,
          pageSize: this.pageSize,
          sort: {
            schoolNumber: 'ASC'
          },
          searchParams: cleanSearch
        }
      }).then(response => {
        this.schools = [];
        let schoolList = response.data.content;
        for (const school of schoolList) {
          this.populateExtraSchoolFields(school);
          this.schools.push(school);
        }
        this.totalSchools = response.data.totalElements;
        this.setSavedSearchParams();
      }).catch(error => {
        //to do add the alert framework for error or success
        console.error(error);
      }).finally(() => {
        this.loadingTable = false;
      });

    },
    setSavedSearchParams() {
      this.schoolSearchParams.schoolID = this.schoolCodeNameFilter;
      this.schoolSearchParams.districtID = this.districtCodeNameFilter;
      this.schoolSearchParams.authorityID = this.authorityCodeNameFilter;
      this.schoolSearchParams.status = this.schoolStatusFilter;
      this.schoolSearchParams.facilityType = this.schoolFacilityTypeFilter;
      this.schoolSearchParams.schoolCategory = this.schoolCategoryTypeFilter;
      this.schoolSearchParams.issueTranscripts = this.issueTranscriptsFilter;
      this.schoolSearchParams.issueCertificates = this.issueCertificatesFilter;
      this.schoolSearchParams.grade = this.gradeFilter;
      this.schoolSearchParams.schoolReportingRequirementCode = this.schoolReportingRequirementCodeFilter;
      this.schoolSearchParams.pageNumber = this.pageNumber;
      this.setSchoolSearchParams(this.schoolSearchParams);
    },
    populateExtraSchoolFields(school) {
      school.status = getStatusAuthorityOrSchool(school);
      school.facilityType = this.getFacilityType(school);
      school.schoolCategory = this.getSchoolCategory(school);
      //Populate school principal from contacts list
      school.principalsName = this.getPrincipalsName(school.contacts);

    },
    getFacilityType(school) {
      return this.allSchoolFacilityTypes.find((facility) => facility.facilityTypeCode === school.facilityTypeCode).label;
    },
    getSchoolCategory(school) {
      return this.schoolCategoryTypes.find((category) => category.schoolCategoryCode === school.schoolCategoryCode).label;
    },
    openNewSchoolSheet() {
      this.newSchoolSheet = !this.newSchoolSheet;
    },
    formatPhoneNumber,
    sortByNameValue,
    getPrincipalsName(contacts) {
      let oldestPrincipal = null;
      const formatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

      for (const contact of contacts) {
        if (contact.schoolContactTypeCode !== 'PRINCIPAL') {
          continue;
        }
        if (!isContactCurrent(contact)) {
          continue;
        }
        if ((oldestPrincipal !== null) &&
            (LocalDate.parse(oldestPrincipal.effectiveDate, formatter).isBefore(LocalDate.parse(contact.effectiveDate, formatter)))) {
          continue;
        }
        oldestPrincipal = contact;
      }
      if (oldestPrincipal == null) {
        return '';
      }
      return formatContactName(oldestPrincipal);
    },
    openSchool(schoolId) {
      this.$router.push({name: 'schoolDetails', params: {schoolID: schoolId}});
    },
    resetPageNumber() {
      this.pageNumber = 1;
    },
    getDistrictStatusColor(districtStatusCode) {
      if (districtStatusCode === 'ACTIVE') {
        return 'green';
      } else if (districtStatusCode === 'INACTIVE') {
        return 'red';
      }
    },
    searchEnabled() {
      return (this.schoolCodeNameFilter !== '' && this.schoolCodeNameFilter !== null) || (this.schoolStatusFilter !== '' && this.schoolStatusFilter !== null)
        || (this.schoolFacilityTypeFilter !== '' && this.schoolFacilityTypeFilter !== null) || (this.districtCodeNameFilter !== '' && this.districtCodeNameFilter !== null)
        || (this.schoolCategoryTypeFilter !== '' && this.schoolCategoryTypeFilter !== null) || (this.authorityCodeNameFilter !== '' && this.authorityCodeNameFilter !== null)
        || (this.issueTranscriptsFilter !== '' && this.issueTranscriptsFilter !== null) || (this.issueCertificatesFilter !== '' && this.issueCertificatesFilter !== null)
        || (this.gradeFilter !== '' && this.gradeFilter !== null);
    },
    backButtonClick() {
      router.push({name: 'home'});
    },
    clearButtonClick() {
      this.schoolCodeNameFilter = null;
      this.districtCodeNameFilter = null;
      this.authorityCodeNameFilter = null;

      this.schoolStatusFilter = null;
      this.schoolFacilityTypeFilter = null;
      this.schoolCategoryTypeFilter = null;
      this.issueTranscriptsFilter = null;
      this.issueCertificatesFilter = null;
      this.gradeFilter = null;
      this.schoolReportingRequirementCodeFilter = null;

      this.headerSearchParams.schoolNumber = null;
      this.headerSearchParams.status = null;
      this.headerSearchParams.type = null;

      this.clearSchoolList();
    },
    async schoolCategoryChanged() {
      this.schoolFacilityTypeFilter = null;
      await this.fireFormValidate();
    },
    async fireFormValidate() {
      await this.$nextTick();
      await this.validateForm();
    },
    async validateForm() {
      const validate = this.$refs.schoolForm.validate();
      this.isFormValid = validate.valid;
    },
    searchButtonClick() {
      this.resetPageNumber();
      this.getSchoolList();
    },
    getStatusColorAuthorityOrSchool
  }
};
</script>

<style scoped>

.subjectHeading {
    font-size: large;
    cursor: pointer;
    font-weight: bold;
}

.ministryLine {
    color: black;
    font-size: medium;
}

.statusCodeLabel {
    word-break: break-word;
    font-size: medium;
}

.containerSetup {
    padding-right: 12em !important;
    padding-left: 12em !important;
}

.hoverTable:hover {
    background-color: #e8e8e8;
    cursor: pointer;
}

:deep(.v-list-item__prepend){
    margin-right: -2em;
}

:deep(.v-data-table-footer__items-per-page) {
  display: none;
}

</style>
