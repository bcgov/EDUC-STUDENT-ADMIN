<template>
  <v-card class="filter-card">
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
        <v-col
          v-if="showStudentSearch"
          class="d-flex justify-end"
        >
          <PrimaryButton
            id="applyPenLocalIdNameFilter"
            large-icon
            icon="mdi-magnify"
            text="Search Name and ID"
            @click-action="setPenLocalIdNameFilter($event, 'click')"
          />
        </v-col>
      </v-row>
      <div v-if="showStudentSearch">
        <v-row class="d-flex justify-space-around">
          <v-col
            id="searchFiltering"
            class="filter-heading pb-0"
          >
            Name and ID Filtering
          </v-col>
          <v-tooltip content-class="customTooltip">
            <template #activator="{ props: tooltipProps }">
              <v-icon
                v-bind="tooltipProps"
                size="25"
                color="#003366"
                style="align-self: center;"
              >
                mdi-help-circle
              </v-icon>
            </template>
            <span id="penLocalIdNameFilterTooltip">
              The search button must be used to apply changes to PEN or Local ID or Name searches. All other filters will apply on change without use of the search button.
            </span>
          </v-tooltip>
        </v-row>
        <v-row>
          <v-col
            class="py-0"
            cols="4"
          >
            <v-text-field
              id="searchInput"
              v-model="legalFirstName"
              label="Legal First Name"
              color="primary"
              variant="underlined"
            />
          </v-col>
          <v-col
            class="py-0"
            cols="4"
          >
            <v-text-field
              id="searchInput"
              v-model="legalMiddleNames"
              label="Legal Middle Names"
              color="primary"
              variant="underlined"
            />
          </v-col>
          <v-col
            class="py-0"
            cols="4"
          >
            <v-text-field
              id="searchInput"
              v-model="legalLastName"
              label="Legal Last Name"
              color="primary"
              variant="underlined"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col
            class="py-0"
            cols="4"
          >
            <v-text-field
              id="searchInput"
              v-model="usualFirstName"
              label="Usual First Name"
              color="primary"
              variant="underlined"
            />
          </v-col>
          <v-col
            class="py-0"
            cols="4"
          >
            <v-text-field
              id="searchInput"
              v-model="usualMiddleNames"
              label="Usual Middle Names"
              color="primary"
              variant="underlined"
            />
          </v-col>
          <v-col
            class="py-0"
            cols="4"
          >
            <v-text-field
              id="searchInput"
              v-model="usualLastName"
              label="Usual Last Name"
              color="primary"
              variant="underlined"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col
            class="py-0"
            cols="4"
          >
            <v-text-field
              id="searchInput"
              v-model="studentPen"
              label="Student Pen"
              color="primary"
              variant="underlined"
            />
          </v-col>
          <v-col
            class="py-0"
            cols="4"
          >
            <v-text-field
              id="searchInput"
              v-model="assignedPen"
              label="Assigned Pen"
              color="primary"
              variant="underlined"
            />
          </v-col>
          <v-col
            class="py-0"
            cols="4"
          >
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
      <div v-if="indySchoolDistrictObject == null">
        <v-row>
          <v-col
            id="schoolDistrictFilters"
            class="filter-heading pb-0"
          >
            School and District Filtering
          </v-col>
        </v-row>
        <v-row
        >
          <v-col cols="6" class="pt-0">
            <v-row v-if="false">
              <v-text-field
                id="searchInput"
                v-model="penLocalIdNameFilter"
                label="PEN or Local ID or Name"
                color="primary"
                variant="underlined"
              />
            </v-row>
            <slot
              name="text-search"
            >
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
                item-value="sdcSchoolCollectionID"
                autocomplete="off"
                @update:model-value="setSchoolNameNumberFilter('schoolNameNumber', $event)"
              />
            </slot>
          </v-col>
          <v-col cols="6" class="pt-0">
            <slot
              name="text-search"
            >
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
                item-value="sdcDistrictCollectionID"
                autocomplete="off"
                @update:model-value="setDistrictNameNumberFilter('districtNameNumber', $event)"
              />
            </slot>
          </v-col>
        </v-row>
      </div>
      <div
        v-for="(filter, key) in filters"
        :key="key"
      >
        <v-row>
          <v-col
            :id="filter.id"
            class="filter-heading"
          >
            {{ filter?.heading }}
          </v-col>
        </v-row>
        <v-row>
          <v-btn-toggle
            v-model="selected[key]"
            color="#003366"
            rounded="0"
            :multiple="filter?.multiple"
            class="filter-toggle"
            @update:model-value="setFilter(selected[key], key)"
          >
            <div
              v-for="(option, i) in filter?.filterOptions"
              :key="i"
            >
              <v-btn
                :id="option?.id"
                :value="option"
                class="filter-button"
                rounded="lg"
              >
                {{ option?.title }}
              </v-btn>
            </div>
          </v-btn-toggle>
          <v-col v-if="key === 'courses'">
            <v-range-slider
              id="courses-slider"
              v-model="courseRange"
              :min="courseRangeDefault[0]"
              :max="courseRangeDefault[1]"
              :step="1"
              color="#003366"
              hide-details
              :strict="true"
              thumb-size="15"
              class="align-center"
              @end="setCourseRangeFilter('numberOfCoursesDec', $event)"
            >
              <template #prepend>
                <v-text-field
                  v-model="courseRange[0]"
                  hide-details
                  single-line
                  type="number"
                  :step="1"
                  :min="courseRangeDefault[0]"
                  :max="courseRange[1]"
                  variant="outlined"
                  density="compact"
                  class="slider-text"
                  :readonly="true"
                  @update:model-value="setCourseRangeFilter('numberOfCoursesDec', courseRange)"
                />
              </template>
              <template #append>
                <v-text-field
                  v-model="courseRange[1]"
                  hide-details
                  single-line
                  type="number"
                  :min="courseRange[0]"
                  :max="courseRangeDefault[1]"
                  variant="outlined"
                  density="compact"
                  class="slider-text"
                  :readonly="true"
                  @update:model-value="setCourseRangeFilter('numberOfCoursesDec', courseRange)"
                />
              </template>
            </v-range-slider>
          </v-col>
        </v-row>
      </div>
    </v-card-text>
  </v-card>
</template>
  
<script>
import alertMixin from '../../mixins/alertMixin';
import PrimaryButton from '../util/PrimaryButton.vue';
import ApiService from '@/common/apiService';
import {Routes} from '@/utils/constants';
import {isEmpty, sortBy} from 'lodash';
import {appStore} from '@/store/modules/app';
import {edxStore} from '@/store/modules/edx';
import {authStore} from '@/store/modules/auth';
import {mapState} from 'pinia';
  
export default {
  name: 'Filters',
  components: {
    PrimaryButton,
  },
  mixins: [alertMixin],
  props: {
    filters: {
      type: Object,
      required: true,
      default: null
    },
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
    showStudentSearch: {
      type: Boolean,
      required: false,
      default: true
    },
    indySchoolDistrictObject: {
      type: Object,
      required: false,
      default: null
    },
  },
  emits: ['clearFilters', 'apply-filters', 'close'],
  data() {
    return {
      selected: {},
      bandCodeValue: null,
      courseRangeDefault: [0, 15],
      courseRange: [0, 15],
      penLocalIdNameFilter: null,
      schoolNameNumberFilter: null,
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
      districtSearchNames: [],
    };
  },
  computed: {
    ...mapState(appStore, ['districtMap', 'schoolMap', 'notClosedSchools', 'notClosedSchoolsMap', 'config']),
    ...mapState(edxStore, ['schoolRoles','schoolRolesCopy']),
    ...mapState(authStore, ['userInfo']),
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
      this.isDistrictUser = true;
      appStore().getInstituteCodes().then(() => {
        this.setupSchoolList();
        this.setupDistrictList();
        this.loading = false;
      });
    });
    Object.keys(this.filters).forEach(key => {
      this.selected[key] = [];
    });
  },
  methods: {
    setupSchoolList(){
      this.schoolSearchNames = [];
      ApiService.apiAxios.get(`${Routes.sdc.BASE_URL}/collection/${this.$route.params.collectionID}/sdcSchoolCollections`)
        .then((res) => {
          res.data.forEach(schoolCollection => {
            const school = this.notClosedSchoolsMap.get(schoolCollection.schoolID);
            if (school) {
              let schoolItem = {
                schoolCodeName: school.schoolName + ' - ' + school.mincode,
                sdcSchoolCollectionID: schoolCollection.sdcSchoolCollectionID,
              };
              this.schoolSearchNames.push(schoolItem);
            }
          });
          this.schoolSearchNames = sortBy(this.schoolSearchNames, ['schoolCodeName']);
        })
        .catch(error => {
          console.error(error);
        });
    },
    setupDistrictList(){
      this.schoolSearchNames = [];
      ApiService.apiAxios.get(`${Routes.sdc.BASE_URL}/collection/${this.$route.params.collectionID}/sdcDistrictCollections`)
        .then((res) => {
          res.data.forEach(districtCollection => {
            const district = this.districtMap.get(districtCollection.districtID);
            if (district) {
              let districtItem = {
                districtCodeName: district.name + ' - ' + district.districtNumber,
                sdcDistrictCollectionID: districtCollection.sdcDistrictCollectionID,
              };
              this.districtSearchNames.push(districtItem);
            }
          });
          this.districtSearchNames = sortBy(this.districtSearchNames, ['districtCodeName']);
        })
        .catch(error => {
          console.error(error);
        });
    },
    close() {
      this.$emit('close');
    },
    setPenLocalIdNameFilter($event, val) {
      const keys = [
        'legalFirstName', 'legalMiddleNames', 'legalLastName',
        'usualFirstName', 'usualMiddleNames', 'usualLastName',
        'studentPen', 'assignedPen', 'localID'
      ];

      keys.forEach(key => {
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
    setSchoolNameNumberFilter(key, $event) {
      this.setPenLocalIdNameFilter($event, null);
      if($event) {
        this.selected[key] = [{title: 'SchoolNameOrNumber', value: $event}];
        this.apply();
      } else {
        delete this.selected[key];
        this.apply();
      }
    },
    setDistrictNameNumberFilter(key, $event) {
      this.setPenLocalIdNameFilter($event, null);
      if($event) {
        this.selected[key] = [{title: 'DistrictNameOrNumber', value: $event}];
        this.apply();
      } else {
        delete this.selected[key];
        this.apply();
      }
    },
    setFilter(val, key) {
      this.setPenLocalIdNameFilter(null, null);
      if(val && !isEmpty(val)) {
        this.selected[key] = (Array.isArray(val) ? val : [val]);
        this.apply();
      } else {
        delete this.selected[key];
        this.apply();
      }
    },
    setCourseRangeFilter(key, $event){
      this.setPenLocalIdNameFilter($event, null);
      if($event) {
        let courseFilterTitle;
        if($event[0] === this.courseRangeDefault[0]){
          courseFilterTitle = + $event[1] + ' courses or less';
        } else if ($event[1] === this.courseRangeDefault[1]) {
          courseFilterTitle = $event[0] + ' courses or more';
        } else {
          courseFilterTitle = 'Between ' + $event[0] + ' and ' + $event[1] + ' courses';
        }
        this.selected[key] = [{title: courseFilterTitle, value: $event}];
        this.apply();
      } else {
        delete this.selected[key];
        this.apply();
      }
    },
    clear() {
      this.selected = {};
      this.bandCodeValue = null;
      this.courseRange = [...this.courseRangeDefault];
      this.penLocalIdNameFilter = null;
      this.schoolNameNumberFilter = null;
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
    
    
  
