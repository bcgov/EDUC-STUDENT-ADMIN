<template>
  <v-container
    class="mb-6"
    fluid
  >
    <v-expansion-panels v-model="type">
      <v-expansion-panel
        v-for="(session, index) in schoolYearSessions"
        :key="index"
        class="border"
        :value="session.sessionID"
      >
        <v-expansion-panel-title
          disable-icon-rotate
          prepend-icon="mdi-account"
        >
          <h4>{{ session.courseYear }}/{{ session.courseMonth }} Session</h4>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <v-table>
            <thead>
              <tr>
                <th>Registration File</th>
                <th>Last Exported</th>
                <th>Exported By</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Assessment Registrations</td>
                <td>{{ session.assessmentRegistrationsExportDate }}</td>
                <td>{{ session.assessmentRegistrationsExportUserID }}</td>
                <td>button</td>
              </tr>
              <tr>
                <td>Session Writing Attempts</td>
                <td>{{ session.sessionWritingAttemptsExportDate }}</td>
                <td>{{ session.sessionWritingAttemptsExportUserID }}</td>
                <td>button</td>
              </tr>
              <tr>
                <td>PEN Merges</td>
                <td>{{ session.penMergesExportDate }}</td>
                <td>{{ session.penMergesExportUserID }}</td>
                <td>button</td>
              </tr>
              <tr>
                <td>
                  <a>View Registrations</a>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-container>
</template>
<script>

import {Routes} from '@/utils/constants';
import ApiService from '@/common/apiService';

export default {
  name: 'TransferRegistrations',
  props: {
    schoolYearSessions: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      type: '',
      selectedSession: null
    };
  },
  watch: {
    schoolYearSessions: {
      handler(value) {
        if(value.length > 0) {
          let openSession = value.filter(sch => sch.isOpen);
          this.type = openSession[0].sessionID;
        }
      },
      immediate: true
    }
  },
  methods: {
    getDownloadableReport(reportType) {
      this.isLoading = true;
      ApiService.apiAxios.get(`${Routes.assessments.BASE_URL}/${this.selectedSession.sessionID}/report/${reportType}/${this.selectedSession.courseMonth}/${this.selectedSession.courseYear}/download`).then(response => {
        console.log(response);
      }).catch(error => {
        console.error(error);
        this.setFailureAlert('An error occurred while trying to retrieve summary. Please try again later.');
      }).finally(() => {
        this.isLoading = false;
      });
    }
  }
};
</script>
