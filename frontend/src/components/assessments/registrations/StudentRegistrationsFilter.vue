<template>
  <v-card class="filter-card">
    <v-card-title class="sheetHeader pt-1 pb-1">
      <v-row no-gutters>
        <v-col class="d-flex justify-start"> Filters </v-col>
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
        <v-col class="d-flex justify-end">
          <PrimaryButton
            id="applyPenLocalIdNameFilter"
            large-icon
            icon="mdi-magnify"
            text="Search Name and ID"
            @click-action="setPenLocalIdNameFilter($event, 'click')"
          />
        </v-col>
      </v-row>
      <div >
        <v-row class="d-flex justify-space-around">
          <v-col id="searchFiltering" class="filter-heading pb-0">
            <span>Name and ID</span>
            <v-tooltip content-class="customTooltip">
              <template #activator="{ props: tooltipProps }">
                <v-icon
                  v-bind="tooltipProps"
                  size="25"
                  color="#003366"
                  style="align-self: center; margin-left: 0.2rem"
                >
                  mdi-help-circle
                </v-icon>
              </template>
              <span id="penLocalIdNameFilterTooltip">
                The search button must be used to apply changes to PEN or Local
                ID or Name searches. All other filters will apply on change
                without use of the search button.
              </span>
            </v-tooltip>
          </v-col>
        </v-row>
        <v-row>
          <v-col class="py-0" cols="12">
            <v-text-field
              id="searchInput"
              v-model="surName"
              label="Sur Name"
              color="primary"
              variant="underlined"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col class="py-0" cols="6">
            <v-text-field
              id="searchInput"
              v-model="pen"
              label="PEN"
              color="primary"
              variant="underlined"
            />
          </v-col>
          <v-col class="py-0" cols="6">
            <v-text-field
              id="searchInput"
              v-model="localID"
              label="Local ID"
              color="primary"
              variant="underlined"
            />
          </v-col>
        </v-row>
      </div>
      <div >
        <v-row>
          <v-col id="schoolDistrictFilters" class="filter-heading pb-0">
            District, School and Assessment Center
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" class="pt-0">
            <v-row v-if="false">
              <v-text-field
                id="searchInput"
                v-model="penLocalIdNameFilter"
                label="PEN or Local ID or Name"
                color="primary"
                variant="underlined"
              />
            </v-row>            
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" class="pt-0">
            <slot name="text-search">   
              <v-autocomplete
                id="selectDistrict"
                v-model="districtNameNumberFilter"
                variant="underlined"
                :items="districtSearchNames"
                color="#003366"
                label="District Name or Number"
                single-line
                :clearable="true"
                item-title="districtCodeName"
                item-value="districtCodeValue"
                autocomplete="off"
                @update:model-value="setDistrictNameNumberFilter('districtNameNumber', $event)"
              />
            </slot>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" class="pt-0">
            <slot name="text-search">              
              <v-autocomplete
                id="selectSchool"
                v-model="schoolNameNumberFilter"
                variant="underlined"
                :items="schoolSearchNames"
                color="#003366"
                label="School Name or Number"
                single-line
                :clearable="true"
                item-title="schoolCodeName"
                item-value="schoolCodeValue"
                autocomplete="off"
                @update:model-value="
                  setSchoolNameNumberFilter('schoolNameNumber', $event)
                "
              />
            </slot>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" class="pt-0">
            <slot name="text-search">              
              <v-autocomplete
                id="selectSchool"
                v-model="assessmentCenterNameNumberFilter"
                variant="underlined"
                :items="assessmentCenterSearchNames"
                color="#003366"
                label="Assessment Center Name or Number"
                single-line
                :clearable="true"
                item-title="schoolCodeName"
                item-value="schoolCodeValue"
                autocomplete="off"
                @update:model-value="
                  setAssessmentCenterNameNumberFilter('assessmentCenterNameNumber', $event)
                "
              />
            </slot>
          </v-col>
        </v-row>
      </div>
      <div v-for="(filter, key) in filters" :key="key">
        <v-row v-if="filter?.heading">
          <v-col :id="filter.id" class="filter-heading">
            {{ filter?.heading }}
          </v-col>
        </v-row>
        <v-row v-else class="filter-heading"/>
        <v-row>
          <v-btn-toggle
            v-model="selected[key]"
            color="#003366"
            rounded="0"
            :multiple="filter?.multiple"
            class="filter-toggle"
            @update:model-value="setFilter(selected[key], key)"            
          >
            <div v-if="filter?.id === 'sessionTypeCode'">
              <span 
                v-for="(option, i) in sessionSearchNames" 
                :key="option.value"
              >
                <v-btn
                  :id="option?.id"
                  :value="option"
                  class="filter-button"
                  rounded="lg"
                >
                  {{ option?.title }}
                </v-btn>
              </span>
            </div>
            <div v-else-if="filter?.id === 'assessmentTypeCode'">
              <span 
                v-for="(option, i) in assessmentTypeSearchNames"
                :key="option.value"
              >
                <v-btn
                  :id="option?.id"
                  :value="option"
                  class="filter-button"
                  rounded="lg"
                >
                  {{ option?.title }}
                </v-btn>
              </span>
            </div>            
            <div v-else>
              <span 
                v-for="(option, i) in filter?.filterOptions" 
                :key="option.value"
              >
                <v-btn
                  :id="option?.id"
                  :value="option"
                  class="filter-button"
                  rounded="lg"
                >
                  {{ option?.title }}
                </v-btn>
              </span>
            </div>   
          </v-btn-toggle>
        </v-row>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
import alertMixin from '../../../mixins/alertMixin';
import PrimaryButton from '../../util/PrimaryButton.vue';
import { isEmpty, sortBy, cloneDeep } from 'lodash';
import { appStore } from '@/store/modules/app';
import { authStore } from '@/store/modules/auth';
import { mapState } from 'pinia';
import moment from 'moment';

export default {
  name: 'StudentRegistrationsFilter',
  components: {
    PrimaryButton,
  },
  mixins: [alertMixin],
  props: {
    filters: {
      type: Object,
      required: true,
      default: null,
    },
    schoolYearSessions: {
      type: Object,
      required: true,
      default: null,
    },
    initialFilterSelection: {
      type: Object,
      required: true,
      default: null
    }
  },
  emits: ['clear-assessment-filters', 'apply-assessment-filters', 'close-assessment-filter'],
  data() {
    return {
      selected: {},
      scoreRangeDefault: [0, 4],
      scoreRange: [0, 4],
      surName: null,
      pen: null,
      localID: null,
      districtSearchNames: [],
      schoolSearchNames: [],
      assessmentCenterSearchNames: [],
      sessionSearchNames: [],
      assessmentTypeSearchNames: [],      
      specialCaseCodes: [],
      districtNameNumberFilter: null,    
      schoolNameNumberFilter: null,
      assessmentCenterNameNumberFilter: null,
    };
  },
  computed: {
    ...mapState(appStore, ['districtMap', 'schoolMap', 'config']),
    ...mapState(authStore, ['userInfo']),    
  },
  watch: {},
  async beforeMount() {
    this.selected = {...this.initialFilterSelection};
    if (this.schoolMap.size === 0) {
      await appStore().getInstituteCodes();
    }    
  },
  created() {
    authStore()
      .getUserInfo()
      .then(() => {
        appStore()
          .getInstituteCodes()
          .then(() => {
            this.setupSchoolList();
            this.setupDistrictList();
            this.loading = false;
          });
      });
    Object.keys(this.filters).forEach((key) => {
      this.selected[key] = [];
    });   
    this.setupAssessmentSessions(); 
  },
  methods: {
    close() {
      this.$emit('close-assessment-filter');
    },
    setupAssessmentSessions() {
      this.sessionSearchNames = [];
      this.assessmentTypeSearchNames = [];
      this.schoolYearSessions.forEach(session => {
        this.sessionSearchNames.push({title: this.formatMonth(session.courseMonth), id: session.sessionID, value: session.sessionID});
        session.assessments.forEach(assessment => {
          let existingItem = this.assessmentTypeSearchNames.find(item => item.id === assessment.assessmentTypeCode);
          if (!existingItem) {
            this.assessmentTypeSearchNames.push({title: assessment.assessmentTypeName, id: assessment.assessmentTypeCode, value: assessment.assessmentTypeCode});
          }
        });
      });
    },
    setupSchoolList() {
      this.schoolSearchNames = [];
      this.schoolMap?.forEach((school) => {
        this.schoolSearchNames.push({
          schoolCodeName: school.schoolName + ' - ' + school.mincode,
          schoolCodeValue: school.schoolID
        });
      });
      this.schoolSearchNames = sortBy(this.schoolSearchNames, ['schoolCodeName']);
      this.assessmentCenterSearchNames = cloneDeep(this.schoolSearchNames);
    },
    setupDistrictList(){
      this.districtSearchNames = [];
      this.districtMap?.forEach((district) => {
        this.districtSearchNames.push({
          districtCodeName: district.name + ' - ' + district.districtNumber,
          districtCodeValue: district.districtId,
        });
      });
      this.districtSearchNames = sortBy(this.districtSearchNames, ['districtCodeName']);
    }, 
    setupSchoolListByDistrict(districtID) {
      this.schoolSearchNames = [];
      this.schoolNameNumberFilter = null;
      this.schoolMap?.forEach((school) => {
        if(school.districtID === districtID) {
          this.schoolSearchNames.push({
            schoolCodeName: school.schoolName + ' - ' + school.mincode,
            schoolCodeValue: school.schoolID
          });
        }
      });
      this.schoolSearchNames = sortBy(this.schoolSearchNames, ['schoolCodeName']);
    }, 
    setPenLocalIdNameFilter($event, val) {
      const keys = ['surName', 'pen', 'localID'];
      keys.forEach((key) => {
        if (this[key] != null) {
          if (this[key].length > 0) {
            this.selected[key] = [{ title: key, value: this[key] }];
          } else {
            delete this.selected[key];
          }
        }
      });
      if ($event && val === 'click') {
        this.apply();
      }
    },
    setDistrictNameNumberFilter(key, $event) {
      this.setPenLocalIdNameFilter($event, null);
      this.setupSchoolListByDistrict($event);
      if ($event) {
        this.selected[key] = [{ title: 'DistrictNameOrNumber', value: $event }];
        this.apply();
      } else {
        delete this.selected[key];
        this.apply();
      }
    },
    setSchoolNameNumberFilter(key, $event) {
      this.setPenLocalIdNameFilter($event, null);
      if ($event) {
        this.selected[key] = [{ title: 'SchoolNameOrNumber', value: $event }];
        this.apply();
      } else {
        delete this.selected[key];
        this.apply();
      }
    },
    setAssessmentCenterNameNumberFilter(key, $event) {
      this.setPenLocalIdNameFilter($event, null);
      if ($event) {
        this.selected[key] = [{ title: 'AssessmentCenterNameOrNumber', value: $event }];
        this.apply();
      } else {
        delete this.selected[key];
        this.apply();
      }
    },
    setFilter(val, key) {
      this.setPenLocalIdNameFilter(null, null);
      if (val && !isEmpty(val)) {
        this.selected[key] = Array.isArray(val) ? val : [val];
        this.apply();
      } else {
        delete this.selected[key];
        this.apply();
      }
    },
    setScoreRangeFilter(key, $event){
      this.setPenLocalIdNameFilter($event, null);
      if($event) {
        let scoreFilterTitle;
        if($event[0] === this.scoreRangeDefault[0]){
          scoreFilterTitle = + $event[1] + ' courses or less';
        } else if ($event[1] === this.scoreRangeDefault[1]) {
          scoreFilterTitle = $event[0] + ' courses or more';
        } else {
          scoreFilterTitle = 'Between ' + $event[0] + ' and ' + $event[1] + ' courses';
        }
        this.selected[key] = [{title: scoreFilterTitle, value: $event}];
        this.apply();
      } else {
        delete this.selected[key];
        this.apply();
      }
    },
    clear() {
      this.selected = {};
      this.penLocalIdNameFilter = null;
      this.districtNameNumberFilter = null;
      this.schoolNameNumberFilter = null;
      this.assessmentCenterNameNumberFilter = null;
      this.surName = null;
      this.pen = null;
      this.localID = null;
      this.scoreRange = [...this.scoreRangeDefault];
      this.$emit('clear-assessment-filters');
    },
    apply() {
      this.$emit('apply-assessment-filters', this.selected);
    },
    formatMonth(month) {
      return moment(month, 'MM').format('MMMM');
    }
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

</style>
