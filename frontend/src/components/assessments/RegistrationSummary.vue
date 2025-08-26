<template>
  <v-container
    class="mb-6"
    fluid
  >
    <v-row>
      <v-col cols="2">
        <v-select
          id="session"
          v-model="selectedSession"
          :items="sessions"
          item-value="value"
          item-title="title"
          label="Session"
          variant="underlined"
          @update:model-value="getRegistrationSummary('registration-summary')"
        />
      </v-col>
    </v-row>
    <v-data-table
      id="dataTable"
      :headers="headers"
      :items="summaryData?.rows"
      class="elevation-1 rounded mb-4"
      mobile-breakpoint="0"
    >
      <template #item.TOTAL="{ item }">
        <span style="font-weight: bold;">{{ item.raw.TOTAL }}</span>
      </template>
    </v-data-table>

    <v-row v-if="selectedSession">
      <v-col>
        <v-btn
          id="summary"
          color="#1976d2"
          text="Assessment Registration Details"
          prepend-icon="mdi-tray-arrow-down"
          class="mb-n6"
          variant="text"
          @click="downloadReport('registration-detail-csv')"
        />
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import { Routes } from '@/utils/constants';
import ApiService from '@/common/apiService';
import alertMixin from '@/mixins/alertMixin';

export default {
  name: 'RegistrationSummary',
  components: {
  },
  mixins: [alertMixin],
  props: {
    schoolYearSessions: {
      type: Array,
      required: true,
    },
    selectedSessionId: {
      type: String,
      required: false,
      default: null
    }
  },
  data() {
    return {
      sessions: [],
      selectedSession: null,
      isLoading: false,
      summaryData: null,
      headers: []
    };
  },
  computed: {},
  watch: {
    schoolYearSessions: {
      handler(value) {
        if(value.length > 0) {
          this.setupAssessmentSessions();
        }
      },
      immediate: true
    },
    selectedSessionId: {
      handler(newSessionId) {
        if (newSessionId && this.sessions.length > 0) {
          this.selectedSession = newSessionId;
          this.getRegistrationSummary('registration-summary');
        }
      },
      immediate: true
    }
  },
  created() {
     
  },
  methods: {
    setupAssessmentSessions() {
      this.sessions = [];
      this.schoolYearSessions.forEach(session => {
        this.sessions.push({
          title: session.courseMonth + '/' + session.courseYear,
          value: session.sessionID,
        });
      });
    },
    getRegistrationSummary(reportType) {
      this.isLoading= true;
      ApiService.apiAxios.get(`${Routes.assessments.BASE_URL}/${this.selectedSession}/summary/${reportType}`).then(response => {
        this.headers = [];
        response?.data?.headers?.forEach(header => {
          let formattedHeader =
            {
              title: header,
              text: header,
              value: header,
              key: header,
              align: 'start'
            };
          this.headers.push(formattedHeader);
          this.summaryData = response.data;
        });
      }).catch(error => {
        console.error(error);
        this.setFailureAlert('An error occurred while trying to retrieve summary. Please try again later.');
      }).finally(() => {
        this.isLoading = false;
      });
    },
    downloadReport(type) {
      try {
        let selection = this.schoolYearSessions.filter(session => session.sessionID === this.selectedSession);
        const url = `${Routes.assessments.BASE_URL}/${this.selectedSession}/report/${type}/download?sessionCode=${selection[0].courseYear}${selection[0].courseMonth}`;
        window.open(url);
      } catch (error) {
        console.error(error);
        this.setFailureAlert(
          error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while trying to retrieve report.'
        );
      }
    }
  },
};
</script>
  <style scoped>
 :deep(.v-data-table-footer__items-per-page) {
  display: none;
}
:deep(.v-data-table-footer) {
       display: none;
 }

 :deep(#dataTable > div.v-table__wrapper > table > thead > tr > th > div > span){
  font-size: 0.80rem;
  font-weight: bold;
}

:deep(#dataTable > div.v-table__wrapper > table > thead > tr > th){
  background-color: #ebedef;
}

:deep(#dataTable > div.v-table__wrapper > table > tbody > tr > td){
  font-size: 0.85rem;
}
  </style>
  
