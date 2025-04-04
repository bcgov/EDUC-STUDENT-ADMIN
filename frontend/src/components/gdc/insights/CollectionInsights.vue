<template>
  <div class="mt-4">
    <v-expansion-panels v-model="type" @update:model-value="getReportingSummary()">

      <v-expansion-panel class="border" value="SchoolYear">
      <v-expansion-panel-title disable-icon-rotate>
        <h4>School Year Reporting Period</h4>
        <template v-slot:actions>
          <v-chip :color="getChipColor(panel1Status)" variant="flat">
            {{ panel1Status }}
          </v-chip>
        </template>
      </v-expansion-panel-title>
      <v-expansion-panel-text>
          <SummaryTable
           :summaryData="summaryData"
           :header="schoolYearHeaders"
           >
          </SummaryTable>
      </v-expansion-panel-text>
      </v-expansion-panel>

      <v-expansion-panel class="border" value="Summer">
      <v-expansion-panel-title disable-icon-rotate>
        <h4>Summer Reporting Period</h4>
        <template v-slot:actions>
          <v-chip :color="getChipColor(panel2Status)" variant="flat">
            {{ panel2Status }}
          </v-chip>
        </template>
      </v-expansion-panel-title>
      <v-expansion-panel-text>
        <SummaryTable 
          :summaryData="summaryData"
          :header="summerHeaders"
          >
        </SummaryTable>
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
  import {formatDateTime} from "@/utils/format"
  import {DateTimeFormatter, LocalDate, LocalDateTime} from '@js-joda/core';
   
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
  created() {
    
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
  computed: {

  },
  methods: {
      getChipColor(status) {
        if(status === 'Pending Start') {
          return 'grey';
        } else if(status === 'Complete') {
          return 'green';
        } else if(status === 'Ongoing') {
          return 'blue';
        }
      },
      async getReportingSummary() {
        this.loading = true;
        this.summaryData = {};
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
      findReportingPeriodStatus() {
        var currentDate = LocalDateTime.now();
        var schoolYearStart = LocalDateTime.parse(this.collectionObject.schYrStart, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
        var schoolYearEnd = LocalDateTime.parse(this.collectionObject.schYrEnd, DateTimeFormatter.ISO_LOCAL_DATE_TIME)

        var summerStart = LocalDateTime.parse(this.collectionObject.summerStart, DateTimeFormatter.ISO_LOCAL_DATE_TIME)
        var summerEnd = LocalDateTime.parse(this.collectionObject.summerEnd, DateTimeFormatter.ISO_LOCAL_DATE_TIME)
        if((currentDate.isEqual(schoolYearStart) || currentDate.isAfter(schoolYearStart)) 
        && (currentDate.isEqual(schoolYearEnd) || currentDate.isBefore(schoolYearEnd))) {
          this.panel1Status = 'Ongoing';
          this.panel2Status = 'Pending Start';
          this.type = 'SchoolYear';
        } else if((currentDate.isEqual(summerStart) || currentDate.isAfter(summerStart)) 
        && (currentDate.isEqual(summerEnd) || currentDate.isBefore(summerEnd))) {
          this.panel1Status = 'Completed';
          this.panel2Status = 'Ongoing';
          this.type = 'Summer';
        } else {
          this.panel1Status = 'Completed';
          this.panel2Status = 'Completed';
          this.type = '';
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

</style>
         
         
       
     
  