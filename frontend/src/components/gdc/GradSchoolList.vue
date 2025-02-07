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
          <v-col
            cols="8"
            class="d-flex justify-end"
          >
            <v-btn
              id="filters"
              color="#003366"
              text="Filter"
              class="mr-1 mb-1"
              prepend-icon="mdi-filter-multiple-outline"
              variant="outlined"
              @click="toggleFilters"
            >
              <template #append>
                <v-badge
                  color="error"
                  :content="filterCount"
                  floating
                  offset-y="-10"
                />
              </template>
            </v-btn>
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
          <v-navigation-drawer
            v-model="showFilters"
            location="right"
            :temporary="true"
            width="700"
            :persistent="true"
            scrim="transparent"
            :border="true"
            style="top:0; height: 100%;"
            rounded="true"
          >
            <SchoolSearchFilters
              :school-reporting-requirement-code-filter="schoolReportingRequirementCodeFilter"
              :school-facility-type-filter="schoolFacilityTypeFilter"
              :school-category-type-filter="schoolCategoryTypeFilter"
              :issue-transcripts-filter="issueTranscriptsFilter"
              :issue-certificates-filter="issueCertificatesFilter"
              :school-code-name-filter="schoolCodeNameFilter"
              :district-code-name-filter="districtCodeNameFilter"
              :authority-code-name-filter="authorityCodeNameFilter"
              :grade-filter="gradeFilter"
              :school-status-filter="schoolStatusFilter"
              @apply-authority-code-name-filter="applyAuthorityCodeNameFilter"
              @apply-district-code-name-filter="applyDistrictCodeNameFilter"
              @apply-school-code-name-filter="applySchoolCodeNameFilter"
              @apply-grade-filter="applyGradeFilter"
              @apply-school-status-filter="applySchoolStatusFilter"
              @apply-issue-certificates-filter="applyIssueCertificatesFilter"
              @apply-issue-transcripts-filter="applyIssueTranscriptsFilter"
              @apply-school-category-type-filter="applySchoolCategoryTypeFilter"
              @apply-school-facility-type-filter="applySchoolFacilityTypeFilter"
              @apply-school-reporting-requirement-code-filter="applySchoolReportingRequirementCodeFilter"
              @clear-filters="clearFilters"
              @close="showFilters= !showFilters"
            />
          </v-navigation-drawer>
        </v-row>
      </div>
    </v-form>
  </v-container>
</template>

<script>

import ApiService from '../../common/apiService';
import {Routes} from '@/utils/constants';
import {mapState} from 'pinia';
import {isEmpty, omitBy, sortBy} from 'lodash';
import alertMixin from '@/mixins/alertMixin';
import {formatPhoneNumber, formatContactName} from '@/utils/format';
import {getStatusColorAuthorityOrSchool, getStatusAuthorityOrSchool, isContactCurrent} from '@/utils/institute/status';
import router from '@/router';
import Spinner from '@/components/common/Spinner.vue';
import * as Rules from '@/utils/institute/formRules';
import {authStore} from '@/store/modules/auth';
import {appStore} from '@/store/modules/app';
import {edxStore} from '@/store/modules/edx';
import {instituteStore} from '@/store/modules/institute';
import {notificationsStore} from '@/store/modules/notifications';
import { hasRequiredPermission } from '@/utils/constants/Permission';
import {DateTimeFormatter, LocalDate} from '@js-joda/core';
import {GRAD_SCHOOL_SEARCH} from '@/utils/grad/tableConfiguration';
import SchoolSearchFilters from '@/components/common/SchoolSearchFilters.vue';

export default {
  name: 'GradSchoolList',
  components: {
    SchoolSearchFilters,
    Spinner
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
      filterSearchParams: {
        tabFilter: GRAD_SCHOOL_SEARCH.defaultFilter,
        moreFilters: {}
      },
      allowedFilters: GRAD_SCHOOL_SEARCH.allowedFilters,
      showFilters: null,
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
      schoolStatusFilter: 'Open',
      schoolCategoryTypes: [],
      schoolCategoryTypeFilter: null,
      schoolGradeTypes: [],
      issueTranscriptsFilter: true,
      issueCertificatesFilter: null,
      gradeFilter: null,
      schoolFacilityTypeFilter: null,
      loadingSchools: true,
      newSchoolSheet: false,
      isFormValid: false,
      rules: Rules,
      edxURL: null,
      facilityTypeCode: null,
      schoolCategoryCode: null,
      independentArray: ['INDEPEND', 'INDP_FNS'],
    };
  },
  computed: {
    ...mapState(authStore, ['userInfo']),
    ...mapState(appStore, ['config','schoolsMap']),
    ...mapState(notificationsStore, ['notification']),
    ...mapState(instituteStore, ['facilityTypeCodes', 'activeFacilityTypeCodes', 'schoolCategoryFacilityTypesMap', 'activeSchoolCategoryTypeCodes', 'schoolCategoryTypeCodes', 'schoolReportingRequirementTypeCodes', 'gradeCodes']),
    schoolFacilityTypes() {
      if (!this.activeFacilityTypeCodes || !this.schoolCategoryTypeFilter) {
        return [];
      }
      let facilityTypes = this.schoolCategoryFacilityTypesMap[this.schoolCategoryTypeFilter]?.map(schoolCatFacilityTypeCode => this.activeFacilityTypeCodes.find(facTypCode => facTypCode.facilityTypeCode === schoolCatFacilityTypeCode));
      return sortBy(facilityTypes, ['displayOrder']);
    },
    filterCount() {
      let totals = Object.values(this.headerSearchParams).filter(filter => !!filter).reduce((total, filter) => total.concat(filter), []).length;
      if(this.issueTranscriptsFilter !== null){
        totals+=1;
      }
      if(this.issueCertificatesFilter !== null){
        totals+=1;
      }
      return totals;
    }
  },
  watch: {
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
    appStore().getConfig().then(() => {
      this.edxURL = this.config.EDX_URL;
    });
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
    instStore.getAllGradeCodes().then(() => {
      this.schoolGradeTypes = sortBy(this.gradeCodes, ['displayOrder']);
    });
    this.setSchoolStatuses();
    this.getSchoolList();
  },
  methods: {
    hasRequiredPermission,
    applySchoolCodeNameFilter($event) {
      this.schoolCodeNameFilter = $event;
      this.pageNumber = 1;
      this.getSchoolList();
    },
    applyDistrictCodeNameFilter($event) {
      this.districtCodeNameFilter = $event;
      this.pageNumber = 1;
      this.getSchoolList();
    },
    applyAuthorityCodeNameFilter($event) {
      this.authorityCodeNameFilter = $event;
      this.pageNumber = 1;
      this.getSchoolList();
    },
    applySchoolReportingRequirementCodeFilter($event) {
      this.schoolReportingRequirementCodeFilter = $event;
      this.pageNumber = 1;
      this.getSchoolList();
    },
    applySchoolStatusFilter($event) {
      this.schoolStatusFilter = $event;
      this.pageNumber = 1;
      this.getSchoolList();
    },
    applyGradeFilter($event) {
      this.gradeFilter = $event;
      this.pageNumber = 1;
      this.getSchoolList();
    },
    applyIssueTranscriptsFilter($event) {
      this.issueTranscriptsFilter = $event;
      this.pageNumber = 1;
      this.getSchoolList();
    },
    applyIssueCertificatesFilter($event) {
      this.issueCertificatesFilter = $event;
      this.pageNumber = 1;
      this.getSchoolList();
    },
    applySchoolFacilityTypeFilter($event) {
      this.schoolFacilityTypeFilter = $event;
      this.pageNumber = 1;
      this.getSchoolList();
    },
    applySchoolCategoryTypeFilter($event) {
      this.schoolCategoryTypeFilter = $event;
      this.pageNumber = 1;
      this.getSchoolList();
    },
    clearFilters() {
      this.schoolCodeNameFilter = null;
      this.districtCodeNameFilter = null;
      this.authorityCodeNameFilter = null;
      this.schoolReportingRequirementCodeFilter = null;
      this.schoolStatusFilter = null;
      this.gradeFilter = null;
      this.issueTranscriptsFilter = null;
      this.issueCertificatesFilter = null;
      this.schoolFacilityTypeFilter = null;
      this.schoolCategoryTypeFilter = null;
      this.pageNumber = 1;
      this.getSchoolList();
    },
    setSchoolStatuses() {
      this.schoolStatus = [{name: 'Open', code: 'Open'}, {name: 'Opening', code: 'Opening'}, {
        name: 'Closing',
        code: 'Closing'
      }, {name: 'Closed', code: 'Closed'}, {name: 'Never Opened', code: 'NeverOpened'}];
    },
    toggleFilters() {
      this.showFilters= !this.showFilters;
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
      }).catch(error => {
        //to do add the alert framework for error or success
        console.error(error);
      }).finally(() => {
        this.loadingTable = false;
        this.loadingSchools = false;
      });

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
    formatPhoneNumber,
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
      window.open(`${this.edxURL}/api/auth/silent_sdc_idir_login?schoolID=${schoolId}&idir_guid=${this.userInfo.userGuid.toLowerCase()}&gradDashboard=true`, '_blank');
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
    async fireFormValidate() {
      await this.$nextTick();
      await this.validateForm();
    },
    async validateForm() {
      const validate = this.$refs.schoolForm.validate();
      this.isFormValid = validate.valid;
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
