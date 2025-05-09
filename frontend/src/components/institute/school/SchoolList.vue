<template>
  <v-container
    class="containerSetup"
    fluid
  >
    <v-form
      ref="schoolForm"
      v-model="isFormValid"
    >
      <div>
        <v-row>
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
            <v-btn
              id="filters"
              color="#003366"
              text="Filter"
              class="ml-2 mb-1"
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
            <v-data-table
              id="schoolListTable"
              v-model:items-per-page="pageSize"
              v-model:page="pageNumber"
              :items="filteredSchoolList"
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
                  @click="openSchool(item.raw.schoolID)"
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
                          item.raw.schoolName
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
                      <v-col
                        class="d-flex"
                      >
                        <v-icon
                          class="mb-3 mr-1"
                          aria-hidden="false"
                        >
                          mdi-phone-outline
                        </v-icon>
                        <span class="statusCodeLabel">{{
                          formatPhoneNumber(item.raw.phoneNumber)
                        }}</span>
                      </v-col>

                      <v-col v-if="canViewMenu(item.raw.canIssueTranscripts)" cols="1" class="d-flex">
                      <v-menu
                        transition="fab-transition"
                        location="end"
                      >
                        <template #activator="{ props }">
                          <v-btn
                            color="primary"
                            icon="mdi-dots-vertical"
                            variant="text"
                            v-bind="props"
                          />
                        </template>
                        <v-list>
                          <v-list-item
                            id="tvrButton"
                            @click="openSchoolInEdx(item.raw.schoolID)"
                          >
                            <v-icon
                              color="#003366"
                              class="pr-1 mb-1"
                            >
                              mdi-open-in-new
                            </v-icon>
                            <span class="ml-2">View EDX Dashboard</span>
                          </v-list-item>
                        </v-list>
                      </v-menu>
                    </v-col>
                    </v-row>
                    <v-row no-gutters>
                      <v-col cols="8">
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
            </v-data-table>
          </v-col>
        </v-row>

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
              :school-status-filter="schoolStatusFilter"
              @apply-authority-code-name-filter="applyAuthorityCodeNameFilter"
              @apply-district-code-name-filter="applyDistrictCodeNameFilter"
              @apply-school-code-name-filter="applySchoolCodeNameFilter"
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

import ApiService from '../../../common/apiService';
import {Routes} from '@/utils/constants';
import PrimaryButton from '../../util/PrimaryButton.vue';
import {mapActions, mapState} from 'pinia';
import {sortBy} from 'lodash';
import alertMixin from '@/mixins/alertMixin';
import {formatPhoneNumber, sortByNameValue} from '@/utils/format';
import {getStatusColorAuthorityOrSchool, getStatusAuthorityOrSchool} from '@/utils/institute/status';
import NewSchoolPage from './NewSchoolPage.vue';
import {isOpenNotClosingAuthority, deepCloneObject} from '@/utils/common';
import * as Rules from '@/utils/institute/formRules';
import {authStore} from '@/store/modules/auth';
import {appStore} from '@/store/modules/app';
import {edxStore} from '@/store/modules/edx';
import {instituteStore} from '@/store/modules/institute';
import {notificationsStore} from '@/store/modules/notifications';
import { PERMISSION, hasRequiredPermission } from '@/utils/constants/Permission';
import SchoolSearchFilters from '@/components/common/SchoolSearchFilters.vue';

export default {
  name: 'SchoolListPage',
  components: {
    PrimaryButton,
    NewSchoolPage,
    SchoolSearchFilters
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
      pageNumber: 1,
      pageSize: 15,
      totalSchools: 0,
      loadingTable: true,
      headerSearchParams: {
        schoolID: '',
        districtID: '',
        authorityID: '',
        status: '',
        category: '',
        type: '',
        schoolReportingRequirementCode: '',
        canIssueTranscripts: '',
        canIssueCertificates: '',
      },
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
      issueTranscriptsFilter: null,
      issueCertificatesFilter: null,
      schoolFacilityTypeFilter: null,
      loadingSchools: true,
      newSchoolSheet: false,
      isFormValid: false,
      rules: Rules,
      facilityTypeCode: null,
      schoolCategoryCode: null,
      independentArray: ['INDEPEND', 'INDP_FNS'],
      showFilters: null,
      filteredSchoolList: [],
      edxURL: null,
    };
  },
  computed: {
    ...mapState(authStore, ['userInfo']),
    ...mapState(appStore, ['schoolsMap', 'config']),
    ...mapState(edxStore, ['schoolSearchParams']),
    ...mapState(notificationsStore, ['notification']),
    ...mapState(instituteStore, ['facilityTypeCodes', 'activeFacilityTypeCodes', 'schoolCategoryFacilityTypesMap','schoolCategoryTypeCodes']),
    schoolFacilityTypes() {
      if (!this.activeFacilityTypeCodes || !this.schoolCategoryTypeFilter) {
        return [];
      }
      let facilityTypes = this.schoolCategoryFacilityTypesMap[this.schoolCategoryTypeFilter]?.map(schoolCatFacilityTypeCode => this.activeFacilityTypeCodes.find(facTypCode => facTypCode.facilityTypeCode === schoolCatFacilityTypeCode));
      return sortBy(facilityTypes, ['displayOrder']);
    },
    canAddSchools() {
      return this.hasRequiredPermission(this.userInfo, PERMISSION.EDIT_SCHOOL_PERMISSION) || this.hasRequiredPermission(this.userInfo, PERMISSION.EDIT_INDEPENDENT_SCHOOL_PERMISSION) || this.hasRequiredPermission(this.userInfo, PERMISSION.EDIT_OFFSHORE_SCHOOL_PERMISSION);
    },
    filterCount() {
      let totals = Object.values(this.headerSearchParams).filter(filter => !!filter).reduce((total, filter) => total.concat(filter), []).length;
      return totals;
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
    appStore().getConfig().then(() => {
      this.edxURL = this.config.EDX_URL;
    });
    this.setSearchValues();
    this.getSchoolList();
  },
  methods: {
    hasRequiredPermission,
    ...mapActions(edxStore, ['setSchoolSearchParams']),
    canViewMenu(canIssueTranscripts) {
      return canIssueTranscripts === 'Y' && !this.config.DISABLE_GDC_FUNCTIONALITY && this.hasRequiredPermission(this.userInfo, PERMISSION.VIEW_GRAD_DATA_COLLECTION_PERMISSION);
    },
    openSchoolInEdx(schoolID) {
      window.open(`${this.edxURL}/api/auth/silent_sdc_idir_login?schoolID=${schoolID}&idir_guid=${this.userInfo.userGuid.toLowerCase()}&gradDashboard=true`, '_blank');
    },
    toggleFilters() {
      this.showFilters= !this.showFilters;
    },
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
      this.issueTranscriptsFilter = null;
      this.issueCertificatesFilter = null;
      this.schoolFacilityTypeFilter = null;
      this.schoolCategoryTypeFilter = null;
      this.pageNumber = 1;
      this.getSchoolList();
    },
    setSearchValues() {
      this.schoolCodeNameFilter = this.schoolSearchParams.schoolID;
      this.districtCodeNameFilter = this.schoolSearchParams.districtID;
      this.authorityCodeNameFilter = this.schoolSearchParams.authorityID;
      this.schoolFacilityTypeFilter = this.schoolSearchParams.facilityType;
      this.schoolCategoryTypeFilter = this.schoolSearchParams.schoolCategory;
      this.issueTranscriptsFilter = this.schoolSearchParams.canIssueTranscripts;
      this.issueCertificatesFilter = this.schoolSearchParams.canIssueCertificates;
      this.schoolReportingRequirementCodeFilter = this.schoolSearchParams.schoolReportingRequirementCode;
      this.pageNumber = this.schoolSearchParams.pageNumber;
    },

    isOpenNotClosingAuthority,
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
      this.schoolSearchParams.canIssueTranscripts = null;
      this.schoolSearchParams.canIssueCertificates = null;
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
        || this.schoolSearchParams.canIssueTranscripts
        || this.schoolSearchParams.canIssueCertificates
        || this.schoolSearchParams.schoolReportingRequirementCode;
    },
    getSchoolList() {
      this.loadingTable = true;
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
      this.headerSearchParams.schoolReportingRequirementCode = this.schoolReportingRequirementCodeFilter;
      this.headerSearchParams.canIssueTranscripts = this.issueTranscriptsFilter;
      this.headerSearchParams.canIssueCertificates = this.issueCertificatesFilter;

      ApiService.apiAxios.get(Routes.institute.SCHOOL_PAGINATED_DATA_URL).then(response => {
        this.schools = [];
        for (const school of response.data) {
          this.populateExtraSchoolFields(school);
          this.schools.push(school);
        }
        this.totalSchools = response.data.totalElements;
        this.setSavedSearchParams();
        this.applyFilter();
      }).catch(error => {
        console.error(error);
      }).finally(() => {
        this.loadingTable = false;
      });
    },
    applyFilter() {
      this.filteredSchoolList = this.filterResultSet();
    },
    filterResultSet() {
      let tempData = deepCloneObject(this.schools);
      if(this.headerSearchParams.schoolID !== '') {
        tempData = tempData.filter(school => school.schoolID === this.headerSearchParams.schoolID);
      }
      if(this.headerSearchParams.districtID !== '') {
        tempData = tempData.filter(school => school.districtID === this.headerSearchParams.districtID);
      }
      if(this.headerSearchParams.authorityID !== '') {
        tempData = tempData.filter(school => school.authorityID === this.headerSearchParams.authorityID);
      }
      if(this.headerSearchParams.status) {
        tempData = tempData.filter(school => school.status === this.headerSearchParams.status);
      }
      if(this.headerSearchParams.category) {
        tempData = tempData.filter(school => school.schoolCategoryCode === this.headerSearchParams.category);
      }
      if(this.headerSearchParams.type) {
        tempData = tempData.filter(school => school.facilityTypeCode === this.headerSearchParams.type);
      }
      if(this.headerSearchParams.schoolReportingRequirementCode) {
        tempData = tempData.filter(school => school.schoolReportingRequirementCode === this.headerSearchParams.schoolReportingRequirementCode);
      }
      if(this.headerSearchParams.canIssueTranscripts) {
        tempData = tempData.filter(school => school.canIssueTranscripts === this.headerSearchParams.canIssueTranscripts);
      }
      if(this.headerSearchParams.canIssueCertificates) {
        tempData = tempData.filter(school => school.canIssueCertificates === this.headerSearchParams.canIssueCertificates);
      }
      return tempData;
    },
    setSavedSearchParams() {
      this.schoolSearchParams.schoolID = this.schoolCodeNameFilter;
      this.schoolSearchParams.districtID = this.districtCodeNameFilter;
      this.schoolSearchParams.authorityID = this.authorityCodeNameFilter;
      this.schoolSearchParams.status = this.schoolStatusFilter;
      this.schoolSearchParams.facilityType = this.schoolFacilityTypeFilter;
      this.schoolSearchParams.schoolCategory = this.schoolCategoryTypeFilter;
      this.schoolSearchParams.canIssueTranscripts = this.issueTranscriptsFilter;
      this.schoolSearchParams.canIssueCertificates = this.issueCertificatesFilter;
      this.schoolSearchParams.schoolReportingRequirementCode = this.schoolReportingRequirementCodeFilter;
      this.schoolSearchParams.pageNumber = this.pageNumber;
      this.setSchoolSearchParams(this.schoolSearchParams);
    },
    populateExtraSchoolFields(school) {
      school.status = getStatusAuthorityOrSchool(school);
      school.facilityType = this.getFacilityType(school);
      school.schoolCategory = this.getSchoolCategory(school);
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
        || (this.issueTranscriptsFilter !== '' && this.issueTranscriptsFilter !== null) || (this.issueCertificatesFilter !== '' && this.issueCertificatesFilter !== null);
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
      this.schoolReportingRequirementCodeFilter = null;

      this.headerSearchParams.schoolID = null;
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
