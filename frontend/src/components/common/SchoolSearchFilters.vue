<template>
  <v-card
    flat
    class="filter-card"
  >
    <v-card-title class="sheetHeader pt-1 pb-1">
      <v-row no-gutters>
        <v-col class="d-flex justify-start">
          Filters
        </v-col>
        <v-col class="d-flex justify-end">
          <v-btn
            id="cancel"
            color="white"
            text="Close"
            size="30"
            icon="mdi-close"
            variant="tonal"
            @click="close()"
          />
        </v-col>
      </v-row>
    </v-card-title>
    <v-divider />
    <v-card-text>
      <v-row>
        <v-col class="d-flex justify-start">
          <PrimaryButton
            id="clear-filter"
            secondary
            large-icon
            icon="mdi-filter-off-outline"
            text="Clear All"
            @click-action="clear"
          />
        </v-col>
      </v-row>
      <v-row
        class="pt-3 px-3"
      >
        <v-col class="pt-0">
          <v-row no-gutters>
            <v-col
              cols="12"
              md="12"
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
              md="12"
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
              md="12"
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
              class="pr-2"
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
                label="School Status"
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
              md="4"
              class="pl-2 pr-2"
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
              md="4"
              class="pl-2"
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
            <v-col
              cols="12"
              md="6"
              class="pr-2"
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
            <v-col
              cols="12"
              md="6"
              class="pl-2"
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
            <v-col
              cols="12"
              md="6"
              class="pr-2"
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
              md="6"
              class="pl-2"
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
          </v-row>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>
  
<script>
import alertMixin from '../../mixins/alertMixin';
import PrimaryButton from '../util/PrimaryButton.vue';
import ApiService from '@/common/apiService';
import {sortBy} from 'lodash';
import {appStore} from '@/store/modules/app';
import {edxStore} from '@/store/modules/edx';
import {authStore} from '@/store/modules/auth';
import {mapState} from 'pinia';
import {sdcCollectionStore} from '@/store/modules/sdcCollection';
import {instituteStore} from '@/store/modules/institute';
import {getStatusAuthorityOrSchool, getStatusColorAuthorityOrSchool} from '@/utils/institute/status';
import {sortByNameValue} from '@/utils/format';
  
export default {
  name: 'SchoolSearchFilters',
  components: {
    PrimaryButton,
  },
  mixins: [alertMixin],
  props: {
    school: {
      type: Object,
      required: false,
      default: null
    },
    district: {
      type: Object,
      required: false,
      default: null
    },
    indySchoolDistrictObject: {
      type: Object,
      required: false,
      default: null
    },
    isDistrict: {
      type: Boolean,
      required: false,
      default: false
    },
    schoolUiFilter : {
      type: Boolean,
      required: false,
      default: false
    }
  },
  emits: ['clearFilters', 'apply-filters', 'close'],
  data() {
    return {
      selected: {},
      bandCodeValue: null,
      courseRangeDefault: [0, 15],
      courseRange: [0, 15],
      schoolCodeNameFilter: null,
      activeSchoolCategoryTypes: [],
      districtCodeNameFilter: null,
      authorityCodeNameFilter: null,
      schoolReportingRequirementCodeFilter: null,
      reportingRequirementTypes: [],
      schoolStatusFilter: null,
      schoolStatus: [],
      authoritySearchNames: [],
      schoolCategoryTypes: [],
      schoolCategoryTypeFilter: null,
      schoolGradeTypes: [],
      issueTranscriptsFilter: null,
      issueCertificatesFilter: null,
      gradeFilter: null,
      schoolFacilityTypeFilter: null,
      penLocalIdNameFilter: null,
      schoolNameNumberFilter: null,
      schoolNameNumberFilterForDistrict: null,
      districtNameNumberFilter: null,
      legalFirstName: null,
      legalMiddleNames: null,
      legalLastName: null,
      usualFirstName: null,
      usualMiddleNames: null,
      usualLastName: null,
      studentPen: null,
      assignedPen: null,
      localID: null,
      schoolSearchNames: [],
      schoolSearchNamesForDistrict: [],
      districtSearchNames: [],
      sdcCollection: sdcCollectionStore(),
    };
  },
  computed: {
    ...mapState(appStore, ['districtMap', 'schoolMap', 'config']),
    ...mapState(edxStore, ['schoolRoles','schoolRolesCopy']),
    ...mapState(authStore, ['userInfo']),
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
    }
  },
  watch: {
    indySchoolDistrictObject: {
      immediate: true,
      handler(newVal) {
        if (this.isDistrict && newVal) {
          this.schoolNameNumberFilterForDistrict = null;
          this.setSchoolNameNumberFilterForDistrict('schoolNameNumber', null);
          this.setupSchoolListForDistrict(newVal.id);
        }
      }
    }
  },
  async beforeMount() {
    if (this.schoolRoles.length === 0) {
      await edxStore().getSchoolExchangeRoles();
    }
    if(this.schoolMap.size === 0) {
      await appStore().getInstituteCodes();
    }
  },
  created() {
    authStore().getUserInfo().then(() => {
      appStore().getInstituteCodes().then(() => {
        this.loading = false;
      });
    });
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
    instStore.getAllGradeCodes().then(() => {
      this.schoolGradeTypes = sortBy(this.gradeCodes, ['displayOrder']);
    });
    this.setSchoolStatuses();
    this.getSchoolDropDownItems();
    this.getDistrictDropDownItems();
    this.getAuthorityDropDownItems();
  },
  methods: {
    sortByNameValue,
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
    getDistrictStatusColor(districtStatusCode) {
      if (districtStatusCode === 'ACTIVE') {
        return 'green';
      } else if (districtStatusCode === 'INACTIVE') {
        return 'red';
      }
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
    setSchoolStatuses() {
      this.schoolStatus = [{name: 'Open', code: 'Open'}, {name: 'Opening', code: 'Opening'}, {
        name: 'Closing',
        code: 'Closing'
      }, {name: 'Closed', code: 'Closed'}, {name: 'Never Opened', code: 'NeverOpened'}];
    },
    async schoolCategoryChanged() {
      this.schoolFacilityTypeFilter = null;
      await this.fireFormValidate();
    },
    close() {
      this.$emit('close');
    },
    getStatusColorAuthorityOrSchool,
    searchButtonClick() {
      this.resetPageNumber();
      this.getSchoolList();
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
    clear() {
      this.selected = {};
      this.bandCodeValue = null;
      this.courseRange = [...this.courseRangeDefault];
      this.penLocalIdNameFilter = null;
      this.schoolNameNumberFilter = null;
      this.schoolNameNumberFilterForDistrict = null;
      this.districtNameNumberFilter = null;
      this.legalFirstName = null;
      this.legalMiddleNames = null;
      this.legalLastName = null;
      this.usualFirstName = null;
      this.usualMiddleNames = null;
      this.usualLastName = null;
      this.studentPen = null;
      this.assignedPen = null;
      this.localID = null;
      this.$emit('clearFilters');
    },
    apply() {
      this.$emit('apply-filters', this.selected);
    }
  }
};
</script>
    
  <style scoped>
  .sheetHeader {
    background-color: #003366;
    color: white;
    font-size: medium !important;
    font-weight: bolder !important;
  }

  .filter-heading {
    font-weight: bold;
    color: #003366;
    margin-top: 1em;
  }

  .filter-button {
    color: #003366;
    padding: 5px;
    margin: 0 8px 8px 8px;
    border: 1px solid #003366;
  }

  .filter-toggle {
    flex-wrap: wrap !important;
    overflow: visible !important;
    height: auto !important;
  }

  #courses-slider {
    margin: 0 8px 8px 8px;
  }

  .slider-text {
    width: 5em;
    font-size: 0.875rem;
    border-color: #003366;
  }
  </style>
    
    
  
