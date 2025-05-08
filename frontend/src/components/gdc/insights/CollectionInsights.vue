<template>
  <div class="mt-4">
    <v-expansion-panels
      v-model="type"
    >
      <v-expansion-panel
        class="border"
        value="SchoolYear"
      >
        <v-expansion-panel-title disable-icon-rotate>
          <h4>School Year Reporting Period</h4>
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
          <v-row class="sub-heading mt-n10 mb-1">
            <v-col>
              The Schools Expected to Submit are transcript eligible schools that are open or have been closed for less than 3 months.
            </v-col>
          </v-row>
          <template v-if="!showSchoolCategoryTable">
            <SummaryTable
              :summary-data="summaryData"
              :header="schoolYearHeaders"
              @category-clicked="handleCategoryClicked"
            />
          </template>
          <template v-else>
            <SchoolCategoryTable
              :reporting-period-i-d="collectionObject.reportingPeriodID"
              :pre-selected-category="selectedCategoryForDetail"
              :available-categories="availableCategoriesForDetail"
              @close-detail="showSchoolCategoryTable = false"
            />
          </template>
        </v-expansion-panel-text>
      </v-expansion-panel>

      <v-expansion-panel
        class="border"
        value="Summer"
      >
        <v-expansion-panel-text>
          <template v-if="!showSchoolCategoryTable">
            <SummaryTable
                :summary-data="summaryData"
                :header="summerHeaders"
                @category-clicked="handleCategoryClicked"
            />
          </template>
          <template v-else>
            <SchoolCategoryTable
                :reporting-period-i-d="collectionObject.reportingPeriodID"
                :pre-selected-category="selectedCategoryForDetail"
                :available-categories="availableCategoriesForDetail"
                @close-detail="showSchoolCategoryTable = false"
            />
          </template>
        </v-expansion-panel-text>
        <v-expansion-panel-text>
          <SummaryTable 
            :summary-data="summaryData"
            :header="summerHeaders"
            @category-clicked="handleCategoryClicked"
          />
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>
  
<script>
import alertMixin from '@/mixins/alertMixin';
import SummaryTable from './SummaryTable.vue';
import ApiService from '@/common/apiService';
import {Routes} from '@/utils/constants';
import {findReportingPeriodStatus, getStatusColorGdcSession} from '@/utils/institute/status';
import SchoolCategoryTable from '@/components/gdc/insights/SchoolCategoryTable.vue';
   
export default {
  name: 'CollectionInsights',
  components: {
    SchoolCategoryTable,
    SummaryTable
  },
  mixins: [alertMixin],
  props: {
    collectionObject: {
      type: Object,
      required: false,
      default: null
    },
  },
  data() {
    return {
      type: '',
      panel1Status: '',
      panel2Status: '',
      reportingPeriodID: '',
      loading: false,
      summaryData: {},
      schoolYearHeaders: [
        { title: 'School Category and Facility Type', key: 'categoryOrFacilityType', align: 'start'},
        { title: 'Schools Expected', key: 'schoolsExpected', align: 'end'},
        { title: 'Schools With Submission in the Last 30 Days', key: 'schoolsWithSubmissions', align: 'end'}
      ],
      summerHeaders: [
        { title: 'School Category and Facility Type', key: 'categoryOrFacilityType', align: 'start'},
        { title: 'Schools With Submissions', key: 'schoolsWithSubmissions', align: 'end'}
      ],
      showSchoolCategoryTable: false,
      selectedCategoryForDetail: null,
      availableCategoriesForDetail: []
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
            .filter(row => row.isSection === 'true' && row?.categoryOrFacilityType)
            .map(row => row.categoryOrFacilityType);
        } else {
          this.availableCategoriesForDetail = [];
        }
      },
      deep: true
    },
    type(newValue, oldValue) {
      if (newValue !== oldValue) {
        this.showSchoolCategoryTable = false;
        this.selectedCategoryForDetail = null;
        this.getReportingSummary();
      }
    }
  },
  created() {

  },
  methods: {
    getStatusColorGdcSession,
    findReportingPeriodStatus,
    async getReportingSummary() {
      this.loading = true;
      ApiService.apiAxios.get(`${Routes.gdc.REPORTING_SUMMARY}/${this.collectionObject.reportingPeriodID}`, {
        params: {
          type: this.type
        }
      }).then((response) => {
        this.loading = false;
        this.summaryData = response.data;
      })
        .catch(error => {
          console.error(error);
          this.setFailureAlert(error.response?.data?.message || error.message);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    handleCategoryClicked(clickedRow) {
      if (clickedRow && clickedRow.categoryOrFacilityType) {
        this.selectedCategoryForDetail = clickedRow.categoryOrFacilityType;

        //TODO - if statement below necessary?
        if (this.availableCategoriesForDetail && this.availableCategoriesForDetail.length > 0) {
          this.showSchoolCategoryTable = true;
        }
      }
    }
  }
};
</script>
         
<style scoped>
h4 {
  color: #38598a;
}

.border {
  border: 2px solid grey;
  border-radius: 5px;
}

:deep(.v-expansion-panel-title--active > .v-expansion-panel-title__overlay) {
  background-color: white !important;
  opacity: 0 !important;
}

.sub-heading {
  color: grey;
  font-style: italic;
}

</style>
         
         
       
     
  
