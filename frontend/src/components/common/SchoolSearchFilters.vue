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
        class="px-3"
      >
        <v-col class="pt-0">
          <v-row no-gutters>
            <v-col
              cols="12"
              md="12"
            >
              <v-autocomplete
                id="name-text-field"
                v-model="schoolCodeNameFilterVal"
                label="School Code & Name"
                item-value="schoolID"
                item-title="schoolCodeName"
                variant="underlined"
                :items="schoolSearchNames"
                :menu-props="{closeOnContentClick:true}"
                :clearable="true"
                @update:model-value="schoolCodeNameFilter = $event; apply('schoolCodeNameFilter')"
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
                v-model="districtCodeNameFilterVal"
                :clearable="true"
                :items="districtSearchNames"
                item-title="districtNumberName"
                variant="underlined"
                item-value="districtId"
                :menu-props="{closeOnContentClick:true}"
                label="District Number & Name"
                @update:model-value="districtCodeNameFilter = $event; apply('districtCodeNameFilter')"
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
                v-model="authorityCodeNameFilterVal"
                label="Authority Code & Name"
                item-value="authorityID"
                item-title="authorityCodeName"
                variant="underlined"
                :items="authoritySearchNames"
                :menu-props="{closeOnContentClick:true}"
                :clearable="true"
                @update:model-value="authorityCodeNameFilter = $event; apply('authorityCodeNameFilter')"
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
                v-model="schoolStatusFilterVal"
                :clearable="true"
                :items="schoolStatus"
                item-title="name"
                variant="underlined"
                item-value="code"
                :menu-props="{closeOnContentClick:true}"
                label="School Status"
                @update:model-value="schoolStatusFilter = $event; apply('schoolStatusFilter')"
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
                v-model="schoolCategoryTypeFilterVal"
                :clearable="true"
                :items="activeSchoolCategoryTypes"
                variant="underlined"
                item-title="label"
                item-value="schoolCategoryCode"
                label="School Category"
                @update:model-value="schoolCategoryTypeFilter = $event; schoolCategoryChanged();"
              />
            </v-col>
            <v-col
              cols="12"
              md="4"
              class="pl-2"
            >
              <v-select
                id="facility-select-field"
                v-model="schoolFacilityTypeFilterVal"
                :clearable="true"
                :items="schoolFacilityTypes"
                variant="underlined"
                :disabled="!activeFacilityTypeCodes || !schoolCategoryTypeFilter"
                item-title="label"
                item-value="facilityTypeCode"
                label="Facility Type"
                @update:model-value="schoolFacilityTypeFilter = $event; apply('schoolFacilityTypeFilter')"
              />
            </v-col>
            <v-col
              cols="12"
              md="6"
              class="pr-2"
            >
              <v-autocomplete
                id="reporting-requirement-text-field"
                v-model="schoolReportingRequirementCodeFilterVal"
                label="Reporting Requirement"
                item-value="schoolReportingRequirementCode"
                variant="underlined"
                item-title="label"
                :items="reportingRequirementTypes"
                :clearable="true"
                @update:model-value="schoolReportingRequirementCodeFilter = $event; apply('schoolReportingRequirementCodeFilter')"
              />
            </v-col>
            <v-col
              cols="12"
              md="6"
              class="pl-2"
            >
              <v-select
                id="issue-transcripts-select-field"
                v-model="issueTranscriptsFilterVal"
                :clearable="true"
                :items="issueCertAndTranscriptTypes"
                variant="underlined"
                item-title="title"
                item-value="value"
                label="Issue Transcripts?"
                @update:model-value="issueTranscriptsFilter = $event; apply('issueTranscriptsFilter')"
              />
            </v-col>
            <v-col
              cols="12"
              md="6"
            >
              <v-select
                id="issue-certificates-select-field"
                v-model="issueCertificatesFilterVal"
                :clearable="true"
                :items="issueCertAndTranscriptTypes"
                variant="underlined"
                item-title="title"
                item-value="value"
                label="Issue Certificates?"
                @update:model-value="issueCertificatesFilter = $event; apply('issueCertificatesFilter')"
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
    schoolReportingRequirementCodeFilter: {
      type: String,
      required: false,
      default: null
    },
    schoolCodeNameFilter: {
      type: String,
      required: false,
      default: null
    },
    districtCodeNameFilter: {
      type: String,
      required: false,
      default: null
    },
    authorityCodeNameFilter: {
      type: String,
      required: false,
      default: null
    },
    issueTranscriptsFilter: {
      type: String,
      required: false,
      default: null
    },
    issueCertificatesFilter: {
      type: String,
      required: false,
      default: null
    },
    schoolStatusFilter: {
      type: String,
      required: false,
      default: null
    },
    schoolFacilityTypeFilter: {
      type: String,
      required: false,
      default: null
    },
    schoolCategoryTypeFilter: {
      type: String,
      required: false,
      default: null
    },
  },
  emits: ['clearFilters', 'close', 'apply-schoolReportingRequirementCodeFilter', 'apply-schoolCodeNameFilter', 'apply-districtCodeNameFilter', 'apply-authorityCodeNameFilter', 'apply-issueTranscriptsFilter', 'apply-schoolStatusFilter', 'apply-issueCertificatesFilter', 'apply-schoolFacilityTypeFilter', 'apply-schoolCategoryTypeFilter'],
  data() {
    return {
      schoolCategoryTypeFilterVal: this.schoolCategoryTypeFilter,
      schoolFacilityTypeFilterVal: this.schoolFacilityTypeFilter,
      schoolStatusFilterVal: this.schoolStatusFilter,
      issueCertificatesFilterVal: this.issueCertificatesFilter,
      issueTranscriptsFilterVal: this.issueTranscriptsFilter,
      authorityCodeNameFilterVal: this.authorityCodeNameFilter,
      districtCodeNameFilterVal: this.districtCodeNameFilter,
      schoolCodeNameFilterVal: this.schoolCodeNameFilter,
      schoolReportingRequirementCodeFilterVal: this.schoolReportingRequirementCodeFilter,
      selected: {},
      activeSchoolCategoryTypes: [],
      reportingRequirementTypes: [],
      schoolStatus: [],
      authoritySearchNames: [],
      schoolCategoryTypes: [],
      schoolGradeTypes: [],
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
        {title: 'Yes', value: 'Y', align: 'start'},
        {title: 'No', value: 'N', align: 'start'}
      ];
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
    schoolCategoryChanged() {
      this.schoolFacilityTypeFilterVal = null;
      this.$emit('apply-schoolFacilityTypeFilter', null);
      this.apply('schoolCategoryTypeFilter');
    },
    close() {
      this.$emit('close');
    },
    getStatusColorAuthorityOrSchool,
    clear() {
      this.schoolCodeNameFilterVal = null;
      this.districtCodeNameFilterVal = null;
      this.authorityCodeNameFilterVal = null;
      this.schoolStatusFilterVal = null;
      this.schoolFacilityTypeFilterVal = null;
      this.schoolCategoryTypeFilterVal = null;
      this.issueTranscriptsFilterVal = null;
      this.issueCertificatesFilterVal = null;
      this.schoolReportingRequirementCodeFilterVal = null;

      this.$emit('clearFilters');
    },
    apply(type) {
      if(type === 'schoolReportingRequirementCodeFilter'){
        this.$emit('apply-schoolReportingRequirementCodeFilter', this.schoolReportingRequirementCodeFilter);
      }else if(type === 'schoolCodeNameFilter'){
        this.$emit('apply-schoolCodeNameFilter', this.schoolCodeNameFilter);
      }else if(type === 'districtCodeNameFilter'){
        this.$emit('apply-districtCodeNameFilter', this.districtCodeNameFilter);
      }else if(type === 'authorityCodeNameFilter'){
        this.$emit('apply-authorityCodeNameFilter', this.authorityCodeNameFilter);
      }else if(type === 'issueTranscriptsFilter'){
        this.$emit('apply-issueTranscriptsFilter', this.issueTranscriptsFilter);
      }else if(type === 'issueCertificatesFilter'){
        this.$emit('apply-issueCertificatesFilter', this.issueCertificatesFilter);
      }else if(type === 'schoolFacilityTypeFilter'){
        this.$emit('apply-schoolFacilityTypeFilter', this.schoolFacilityTypeFilter);
      }else if(type === 'schoolCategoryTypeFilter'){
        this.$emit('apply-schoolCategoryTypeFilter', this.schoolCategoryTypeFilter);
      }else if(type === 'schoolStatusFilter'){
        this.$emit('apply-schoolStatusFilter', this.schoolStatusFilter);
      }
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
    
    
  
