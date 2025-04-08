<template>
  <div class="mt-4">
    <v-expansion-panels
      v-model="type"
      @update:model-value="togglePanel()"
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
          <SummaryTable
            :summary-data="summaryData"
            :header="schoolYearHeaders"
          />
        </v-expansion-panel-text>
      </v-expansion-panel>

      <v-expansion-panel
        class="border"
        value="Summer"
      >
        <v-expansion-panel-title disable-icon-rotate>
          <h4>Summer Reporting Period</h4>
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
          <SummaryTable 
            :summary-data="summaryData"
            :header="summerHeaders"
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
   
export default {
  name: 'CollectionInsights',
  components: {
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
        { title: 'Schools With Submissions', key: 'schoolsWithSubmissions', align: 'end'}
      ],
      summerHeaders: [
        { title: 'School Category and Facility Type', key: 'categoryOrFacilityType', align: 'start'},
        { title: 'Schools With Submissions', key: 'schoolsWithSubmissions', align: 'end'}
      ],
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
  },
  created() {
    
  },
  methods: {
    getStatusColorGdcSession,
    findReportingPeriodStatus,
    togglePanel() {
      this.summaryData = {};
      if(this.type) {
        this.getReportingSummary();
      }
    },
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
         
         
       
     
  
