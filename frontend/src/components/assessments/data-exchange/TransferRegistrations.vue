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
                <td>
                  <v-btn
                    :id="`assessmentDownload-${index}`"
                    prepend-icon="mdi-file-upload"
                    variant="elevated"
                    color="#003366"
                    text="Export for Transfer"
                    @click="handleConfirmation(session, 'ALL_SESSION_REGISTRATIONS')"
                  />
                </td>
              </tr>
              <tr>
                <td>Session Writing Attempts</td>
                <td>{{ session.sessionWritingAttemptsExportDate }}</td>
                <td>{{ session.sessionWritingAttemptsExportUserID }}</td>
                <td>
                  <v-btn
                    :id="`sessionWritingDownload-${index}`"
                    prepend-icon="mdi-file-upload"
                    variant="elevated"
                    color="#003366"
                    text="Export for Transfer"
                    @click="handleConfirmation(session, 'ATTEMPTS')"
                  />
                </td>
              </tr>
              <tr>
                <td>PEN Merges</td>
                <td>{{ session.penMergesExportDate }}</td>
                <td>{{ session.penMergesExportUserID }}</td>
                <td>
                  <v-btn
                    :id="`penMergesDownload-${index}`"
                    prepend-icon="mdi-file-upload"
                    variant="elevated"
                    color="#003366"
                    text="Export for Transfer"
                    @click="handleConfirmation(session, 'PEN_MERGES')"
                  />
                </td>
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
    <ConfirmationDialog ref="confirmExport" />
  </v-container>
</template>
<script>

import {Routes} from '@/utils/constants';
import ConfirmationDialog from '@/components/util/ConfirmationDialog.vue';
import alertMixin from '@/mixins/alertMixin';

export default {
  name: 'TransferRegistrations',
  components: {ConfirmationDialog},
  mixins: [alertMixin],
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
    async handleConfirmation(session, type) {
      this.selectedSession = session;
      let confirmationReportType;
      let confirmationDate;
      switch (type) {
      case 'assessmentRegistrations':
        confirmationReportType = 'Assessment Registrations';
        confirmationDate = session.assessmentRegistrationsExportDate;
        break;
      case 'sessionWritingAttempts':
        confirmationReportType = 'Session Writing Attempts';
        confirmationDate = session.sessionWritingAttemptsExportDate;
        break;
      case 'penMerges':
        confirmationReportType = 'PEN Merges';
        confirmationDate = session.penMergesExportDate;
        break;
      }
      const confirmation = confirmationDate ? await this.$refs.confirmExport.open('Confirm Re-Export', `The ${confirmationReportType} file was already exported on ${confirmationDate}`, {color: '#fff', width: 580, closeIcon: false, subtitle: false, dark: false, resolveText: 'Re-Export File', rejectText: 'Cancel'})
        : true;
      console.log(confirmation);
      if (confirmation) {
        this.handleDownloadReport(type, confirmationReportType);
      }
    },
    handleDownloadReport(reportType) {
      this.isLoading = true;
      try {
        const url = `${Routes.assessments.BASE_URL}/${this.selectedSession.sessionID}/report/${reportType}/${this.selectedSession.courseMonth}/${this.selectedSession.courseYear}/download`;
        window.open(url);
      } catch (error) {
        console.error(error);
        this.setFailureAlert(
          error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while trying to retrieve report.'
        );
      }
    }
  }
};
</script>
