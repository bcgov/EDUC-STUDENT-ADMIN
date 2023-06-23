<template>
  <v-container class="containerSetup" fluid>
    <v-form ref="schoolForm" v-model="isFormValid">
      <Spinner flat v-if="loadingSchools"/>
      <div v-else>
        <v-row>
          <v-col class="mt-1 d-flex justify-start">
            <v-icon small color="#1976d2">mdi-arrow-left</v-icon>
            <a class="ml-1" @click="backButtonClick">Return to Dashboard</a>
          </v-col>
          <v-col class="d-flex justify-end">
            <PrimaryButton v-if="canAddSchool()" id="addSchoolBtn" icon-left width="11em" icon="mdi-plus-thick"
                           text="New School" :click-action="openNewSchoolSheet"
            ></PrimaryButton>
          </v-col>
        </v-row>
        <v-row style="background: rgb(235, 237, 239);border-radius: 8px;" class="pt-3 px-3 elevation-2">
          <v-col class="pt-0">
            <v-row>
              <v-col cols="12" md="4" class="d-flex justify-start">
                <v-autocomplete
                  id="name-text-field"
                  label="School Code & Name"
                  item-value="schoolID"
                  item-title="schoolCodeName"
                  variant="underlined"
                  :items="schoolSearchNames"
                  return-object
                  v-model="schoolCodeNameFilter"
                  :menu-props="{closeOnContentClick:true}"
                  @update:model-value="searchButtonClick"
                  clearable
                >
                  <template #selection="{ item, index }">
                    {{ item.raw.schoolCodeName }}
                  </template>
                  <template #item="{ props, item }">
                    <v-list-item
                      v-bind="props"
                      prepend-icon="mdi-circle-medium"
                      :base-color="getStatusColorAuthorityOrSchool(item.raw.status)"
                      title=""
                      @click="selectSchoolFilter(item)">
                      <v-list-item-title style="color: black !important;">
                        {{ item.raw.schoolCodeName }}
                      </v-list-item-title>
                    </v-list-item>
                  </template>
                </v-autocomplete>
              </v-col>
              <v-col cols="12" md="2" class="d-flex justify-start">
                <v-select
                  id="status-select-field"
                  clearable
                  :items="schoolStatus"
                  v-model="schoolStatusFilter"
                  item-title="name"
                  variant="underlined"
                  item-value="code"
                  :menu-props="{closeOnContentClick:true}"
                  label="Status"
                >
                  <template #selection="{ item, index }">
                    {{ item.raw.name }}
                  </template>
                  <template #item="{ item }">
                    <v-list-item @click="selectStatusFilter(item)">
                      <v-icon :color="getStatusColorAuthorityOrSchool(item.raw.name)">
                        mdi-circle-medium
                      </v-icon>
                      <span class="body-2">{{ item.raw.name }}</span>
                    </v-list-item>
                  </template>
                </v-select>
              </v-col>
              <v-col cols="12" md="3" class="d-flex justify-start">
                <v-select
                  id="category-select-field"
                  clearable
                  :items="activeSchoolCategoryTypes"
                  v-model="schoolCategoryTypeFilter"
                  variant="underlined"
                  item-title="label"
                  item-value="schoolCategoryCode"
                  @update:model-value="schoolCategoryChanged"
                  label="School Category"
                >
                </v-select>
              </v-col>
              <v-col cols="12" md="3" class="d-flex justify-start">
                <v-select
                  id="facility-select-field"
                  clearable
                  :items="schoolFacilityTypes"
                  v-model="schoolFacilityTypeFilter"
                  variant="underlined"
                  item-title="label"
                  item-value="facilityTypeCode"
                  label="Facility Type"
                ></v-select>
              </v-col>
            </v-row>
            <v-row class="mt-n6">
              <v-col cols="12" md="4" class="d-flex justify-start">
                <v-autocomplete
                  id="district-text-field"
                  clearable
                  :items="districtSearchNames"
                  v-model="districtCodeNameFilter"
                  item-title="districtNumberName"
                  variant="underlined"
                  item-value="districtId"
                  return-object
                  :menu-props="{closeOnContentClick:true}"
                  @update:model-value="searchButtonClick"
                  label="District Number & Name"
                >
                  <template #selection="{ item, index }">
                    {{ item.raw.districtNumberName }}
                  </template>
                  <template #item="{ props, item }">
                    <v-list-item
                      v-bind="props"
                      prepend-icon="mdi-circle-medium"
                      :base-color="getDistrictStatusColor(item.raw.status)"
                      title=""
                      @click="selectDistrictFilter(item)">
                      <v-list-item-title style="color: black !important;">
                        {{ item.raw.districtNumberName }}
                      </v-list-item-title>
                    </v-list-item>
                  </template>
                </v-autocomplete>
              </v-col>
              <v-col cols="12" md="4" class="d-flex justify-start">
                <v-autocomplete
                  id="authority-text-field"
                  label="Authority Code & Name"
                  item-value="authorityID"
                  item-title="authorityCodeName"
                  variant="underlined"
                  return-object
                  :items="authoritySearchNames"
                  v-model="authorityCodeNameFilter"
                  :menu-props="{closeOnContentClick:true}"
                  @update:model-value="searchButtonClick"
                  clearable
                >
                  <template #selection="{ item, index }">
                    {{ item.raw.authorityCodeName }}
                  </template>
                  <template #item="{ props, item }">
                    <v-list-item
                      v-bind="props"
                      prepend-icon="mdi-circle-medium"
                      :base-color="getStatusColorAuthorityOrSchool(item.raw.status)"
                      title=""
                      @click="selectAuthorityFilter(item)">
                      <v-list-item-title style="color: black !important;">
                        {{ item.raw.authorityCodeName }}
                      </v-list-item-title>
                    </v-list-item>
                  </template>
                </v-autocomplete>
              </v-col>
              <v-col cols="12" md="4" class="d-flex justify-start">
                <v-autocomplete
                  id="reporting-requirement-text-field"
                  label="Reporting Requirement"
                  item-value="schoolReportingRequirementCode"
                  variant="underlined"
                  item-title="label"
                  :items="schoolReportingRequirementTypeCodes"
                  v-model="schoolReportingRequirementCodeFilter"
                  @update:model-value="searchButtonClick"
                  clearable
                >
                </v-autocomplete>
              </v-col>
              <v-col class="d-flex justify-end">
                <PrimaryButton id="user-search-button" text="Clear" secondary :click-action="clearButtonClick"/>
                <PrimaryButton class="ml-3" width="8em" id="user-clear-button" text="Search"
                               :click-action="searchButtonClick"
                               :disabled="!searchEnabled()"
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
              :footer-props="{
                'items-per-page-options': itemsPerPageOptions
              }"
              :loading="loadingTable"
              class="elevation-1"
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
                        <span class="subjectHeading">{{ item.raw.mincode }} - {{ item.raw.displayName }}</span>
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
                        <span class="statusCodeLabel">{{ item.raw.status }}</span>
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
                        >{{ item.raw.principalsName }}</span>
                      </v-col>
                    </v-row>
                    <v-row no-gutters>
                      <v-col cols="6">
                      <span
                        class="ministryLine"
                        style="color: black"
                      >{{
                          item.raw.schoolCategory
                        }} | {{ item.raw.facilityType }}</span>
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
                        <span class="statusCodeLabel">{{ formatPhoneNumber(item.raw.phoneNumber) }}</span>
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
                        <span class="statusCodeLabel centerSpan">{{ item.raw.email }}</span>
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
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
        :districtNames="this.activeDistricts"
        :authorityNames="this.activeAuthorities"
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

export default {
  name: 'SchoolListPage',
  mixins: [alertMixin],
  components: {
    PrimaryButton,
    Spinner,
    NewSchoolPage
  },
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
      itemsPerPageOptions: [15],
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
      schoolCodeNameFilter: '',
      districtCodeNameFilter: '',
      authorityCodeNameFilter: '',
      schoolReportingRequirementCodeFilter: '',
      schoolStatusFilter: '',
      schoolCategoryTypes: [],
      schoolCategoryTypeFilter: '',
      schoolFacilityTypeFilter: '',
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
    ...mapState(authStore, ['userInfo', 'SCHOOL_ADMIN_ROLE', 'SCHOOL_INDEPENDENT_ADMIN_ROLE']),
    ...mapState(appStore, ['schoolsMap']),
    ...mapState(edxStore, ['schoolSearchParams']),
    ...mapState(instituteStore, ['facilityTypeCodes', 'activeFacilityTypeCodes', 'schoolCategoryFacilityTypesMap', 'activeSchoolCategoryTypeCodes', 'schoolCategoryTypeCodes', 'schoolReportingRequirementTypeCodes']),
    schoolFacilityTypes() {
      if (!this.activeFacilityTypeCodes || !this.schoolCategoryTypeFilter) {
        return [];
      }
      let facilityTypes = this.schoolCategoryFacilityTypesMap[this.schoolCategoryTypeFilter]?.map(schoolCatFacilityTypeCode => this.activeFacilityTypeCodes.find(facTypCode => facTypCode.facilityTypeCode === schoolCatFacilityTypeCode));
      return sortBy(facilityTypes, ['displayOrder']);
    },
    getSheetWidth() {
      return 30;
    },
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
    instStore.getSchoolReportingRequirementTypeCodes();
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
  },
  methods: {
    ...mapActions(edxStore, ['setSchoolSearchParams']),
    setSearchValues() {
      this.schoolCodeNameFilter = this.schoolSearchParams.schoolID;
      this.districtCodeNameFilter = this.schoolSearchParams.districtID;
      this.authorityCodeNameFilter = this.schoolSearchParams.authorityID;
      this.schoolStatusFilter = this.schoolSearchParams.status;
      this.schoolFacilityTypeFilter = this.schoolSearchParams.facilityType;
      this.schoolCategoryTypeFilter = this.schoolSearchParams.schoolCategory;
      this.schoolReportingRequirementCodeFilter = this.schoolSearchParams.schoolReportingRequirementCode;
      this.pageNumber = this.schoolSearchParams.pageNumber;
    },
    selectSchoolFilter(item){
      this.schoolCodeNameFilter = [];
      this.schoolCodeNameFilter.push(item.raw);
    },
    selectDistrictFilter(item){
      this.districtCodeNameFilter = [];
      this.districtCodeNameFilter.push(item.raw);
    },
    selectAuthorityFilter(item){
      this.authorityCodeNameFilter = [];
      this.authorityCodeNameFilter.push(item.raw);
    },
    selectStatusFilter(item){
      this.schoolStatusFilter = [];
      this.schoolStatusFilter.push(item.raw);
    },
    canAddSchool() {
      return this.SCHOOL_ADMIN_ROLE || this.SCHOOL_INDEPENDENT_ADMIN_ROLE;
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
      this.headerSearchParams.schoolReportingRequirementCode = this.schoolReportingRequirementCodeFilter;

      ApiService.apiAxios.get(Routes.institute.SCHOOL_PAGINATED_DATA_URL, {
        params: {
          pageNumber: this.pageNumber - 1,
          pageSize: this.pageSize,
          sort: {
            schoolNumber: 'ASC'
          },
          searchParams: JSON.stringify(omitBy(this.headerSearchParams, isEmpty)),
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
      for (const contact of contacts) {
        if (contact.schoolContactTypeCode !== 'PRINCIPAL') {
          continue;
        }
        if (!isContactCurrent(contact)) {
          continue;
        }
        if ((oldestPrincipal !== null) && (new Date(oldestPrincipal.effectiveDate) < new Date(contact.effectiveDate))) {
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
        || (this.schoolCategoryTypeFilter !== '' && this.schoolCategoryTypeFilter !== null) || (this.authorityCodeNameFilter !== '' && this.authorityCodeNameFilter !== null);
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
      this.schoolReportingRequirementCodeFilter = null;

      this.headerSearchParams.schoolNumber = null;
      this.headerSearchParams.status = null;
      this.headerSearchParams.type = null;

      this.clearSchoolList();
    },
    async schoolCategoryChanged() {
      await this.fireFormValidate();
    },
    async fireFormValidate() {

      await this.$nextTick();
      this.validateForm();
    },
    validateForm() {
      this.isFormValid = this.$refs.schoolForm.validate();
    },
    searchButtonClick() {
      console.log('Here');
      this.resetPageNumber();
      this.getSchoolList();
    },
    getStatusColorAuthorityOrSchool
  },
  watch: {
    pageSize() {
      this.getSchoolList();
    },
    pageNumber() {
      this.getSchoolList();
    }
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
    padding-right: 24em !important;
    padding-left: 24em !important;
}

.hoverTable {
  border-bottom-style: groove;
  border-left-style: groove;
  border-right-style: groove;
  border-color: rgb(255 255 255 / 45%);
}

.hoverTable:nth-child(1) {
  border-top-style: groove;
}

.hoverTable:hover{
  background-color: #e8e8e8;
  cursor: pointer;
}

</style>
