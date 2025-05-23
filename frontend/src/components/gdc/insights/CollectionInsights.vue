<template>
  <div class="mt-4">
    <v-expansion-panels
      v-model="type"
    >
      <v-expansion-panel
        v-if="!showSchoolCategoryTable || type === 'SchoolYear'"
        class="border"
        value="SchoolYear"
      >
        <v-expansion-panel-title
          disable-icon-rotate
          prepend-icon="mdi-account"
        >
          <template v-if="!(showSchoolCategoryTable && type === 'SchoolYear')">
            <h4>School Year Reporting Period</h4>
          </template>
          <template v-else>
            <v-icon
              icon="mdi-arrow-left"
              @click.stop="returnToSummary"
            />
            <h4
              class="clickable-title-component"
              @click.stop="returnToSummary"
            >
              Return to School Year Summary
            </h4>
          </template>
          <template #actions>
            <v-chip
              :color="getStatusColorGdcSession(panel1Status)"
              variant="flat"
            >
              {{ panel1Status }}
            </v-chip>
          </template>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <template v-if="!showSchoolCategoryTable">
            <v-row class="sub-heading mt-n10 mb-1">
              <v-col>
                The Schools Expected to Submit are transcript eligible schools that are open or have been closed for less than 3 months.
              </v-col>
            </v-row>
            <SummaryTable
              :summary-data="summaryData"
              :header="panel1Status === 'Complete' ? completeHeaders : ongoingHeaders"
              @category-clicked="handleCategoryClicked"
            />
          </template>
          <template v-else>
            <SchoolCategoryTable
              v-if="type === 'SchoolYear'"
              :collection-object="collectionObject"
              :pre-selected-category="selectedCategoryForDetail"
              :available-categories="availableCategoriesForDetail"
              :reporting-period-type="'SchoolYear'"
              @close-detail="handleCloseDetailView"
            />
          </template>
        </v-expansion-panel-text>
      </v-expansion-panel>

      <v-expansion-panel
        v-if="!showSchoolCategoryTable || type === 'Summer'"
        class="border"
        value="Summer"
      >
        <v-expansion-panel-title disable-icon-rotate>
          <template v-if="!(showSchoolCategoryTable && type === 'Summer')">
            <h4>Summer Reporting Period</h4>
          </template>
          <template v-else>
            <v-icon
              icon="mdi-arrow-left"
              class="pr-2"
              @click.stop="returnToSummary"
            />
            <h4
              class="clickable-title-component"
              @click.stop="returnToSummary"
            >
              Return to Summer Summary
            </h4>
          </template>
          <template #actions>
            <v-chip
              :color="getStatusColorGdcSession(panel2Status)"
              variant="flat"
            >
              {{ panel2Status }}
            </v-chip>
          </template>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <template v-if="!showSchoolCategoryTable">
            <SummaryTable
              :summary-data="summaryData"
              :header="panel2Status === 'Complete' ? completeHeaders : ongoingHeaders"
              @category-clicked="handleCategoryClicked"
            />
          </template>
          <template v-else>
            <SchoolCategoryTable
              v-if="type === 'Summer'"
              :collection-object="collectionObject"
              :pre-selected-category="selectedCategoryForDetail"
              :available-categories="availableCategoriesForDetail"
              :reporting-period-type="'Summer'"
              @close-detail="handleCloseDetailView"
            />
          </template>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>


<script>
import alertMixin from '@/mixins/alertMixin';
import SummaryTable from './SummaryTable.vue';
import ApiService from '@/common/apiService';
import { Routes } from '@/utils/constants';
import {
  findReportingPeriodStatus,
  getStatusColorGdcSession,
} from '@/utils/institute/status';
import SchoolCategoryTable from '@/components/gdc/insights/SchoolCategoryTable.vue';

export default {
  name: 'CollectionInsights',
  components: {
    SchoolCategoryTable,
    SummaryTable,
  },
  mixins: [alertMixin],
  props: {
    collectionObject: {
      type: Object,
      required: false,
      default: null,
    },
  },
  data() {
    return {
      type: '', // 'SchoolYear' or 'Summer'
      panel1Status: '',
      panel2Status: '',
      loading: false,
      summaryData: {},
      ongoingHeaders: [
        { title: 'School Category and Facility Type', key: 'categoryOrFacilityType', align: 'start'},
        { title: 'Schools Expected to Submit', key: 'schoolsExpected', align: 'end'},
        { title: 'Schools with One or More Submission', key: 'schoolsWithSubmissions', align: 'end'},
        { title: 'Schools without a Submission in the Last 30 Days', key: 'schoolsWitSubmissionsInLast30DaysCount', align: 'end'}
      ],
      completeHeaders: [
        { title: 'School Category and Facility Type', key: 'categoryOrFacilityType', align: 'start'},
        { title: 'Schools Expected to Submit', key: 'schoolsExpected', align: 'end'},
        { title: 'Schools with One or More Submission', key: 'schoolsWithSubmissions', align: 'end'},
      ],
      showSchoolCategoryTable: false,
      selectedCategoryForDetail: null,
      availableCategoriesForDetail: [],
    };
  },
  computed: {

  },
  watch: {
    collectionObject: {
      handler(value) {
        if(value) {
          this.findReportingPeriodStatus();
          this.getReportingSummary();
        }
      },
      immediate: true
    },
    summaryData: {
      handler(value) {
        if (value && value.rows) {
          this.availableCategoriesForDetail = value.rows
            .filter((row) => row.isSection === 'true' && row?.categoryOrFacilityType)
            .map((row) => row.categoryOrFacilityType);
        } else {
          this.availableCategoriesForDetail = [];
        }
      },
      deep: true,
    },
    type(newValue, oldValue) {
      if (newValue !== oldValue) {
        this.showSchoolCategoryTable = false;
        this.selectedCategoryForDetail = null;
        if (newValue) {
          this.getReportingSummary();
        } else {
          this.summaryData = {};
        }
      }
    }
  },
  created() {},
  methods: {
    getStatusColorGdcSession,
    findReportingPeriodStatus,
    async getReportingSummary() {
      if (!this.type && this.collectionObject) {
        this.summaryData = {};
        return;
      }
      this.loading = true;
      ApiService.apiAxios.get(`${Routes.gdc.REPORTING_SUMMARY}/${this.collectionObject.reportingPeriodID}`, {
        params: {
          type: this.type
        }
      }).then((response) => {
        this.summaryData = response.data;
      })
        .catch(error => {
          console.error(error);
          this.setFailureAlert(error.response?.data?.message || error.message);
          this.summaryData = {};
        })
        .finally(() => {
          this.loading = false;
        });
    },
    handleCategoryClicked(clickedRow) {
      if (clickedRow && clickedRow.categoryOrFacilityType) {
        this.selectedCategoryForDetail = clickedRow.categoryOrFacilityType;
        this.showSchoolCategoryTable = true;
      }
    },
    returnToSummary() {
      this.showSchoolCategoryTable = false;
      this.selectedCategoryForDetail = null;
    },
    handleCloseDetailView() {
      this.showSchoolCategoryTable = false;
      this.selectedCategoryForDetail = null;
    },
  },
};
</script>

<style scoped>
h4, .v-icon {
  color: #38598a;
}

.border {
  border: 2px solid grey;
  border-radius: 5px;
  margin-bottom: 10px;
}

:deep(.v-expansion-panel-title--active > .v-expansion-panel-title__overlay) {
  background-color: white !important;
  opacity: 0 !important;
}

.sub-heading {
  color: grey;
  font-style: italic;
}

.clickable-title-component {
  cursor: pointer;
  margin-bottom: 0;
}

</style>
