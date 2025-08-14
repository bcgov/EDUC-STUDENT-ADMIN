<template>
  <v-row v-if="isLoading">
    <v-col>
      <Spinner />
    </v-col>
  </v-row>
  <v-container
    v-else
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
          <div class="d-flex justify-space-between align-center w-100">
            <h4>{{ session.courseYear }}/{{ session.courseMonth }} Session</h4>
            <v-chip
              :color="getRegistrationStatus(session).color"
              variant="flat"
              size="small"
              class="text-white font-weight-bold"
            >
              {{ getRegistrationStatus(session).text }}
            </v-chip>
          </div>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <v-table>
            <thead>
              <tr>
                <th scope="col">
                  Registration File
                </th>
                <th scope="col">
                  Last Exported
                </th>
                <th scope="col">
                  Exported By
                </th>
                <th scope="col" />
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Assessment Registrations</td>
                <td>{{ formatDate(session.assessmentRegistrationsExportDate) }}</td>
                <td>{{ session.assessmentRegistrationsExportUserID }}</td>
                <td class="text-right">
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
                <td>{{ formatDate(session.sessionWritingAttemptsExportDate) }}</td>
                <td>{{ session.sessionWritingAttemptsExportUserID }}</td>
                <td class="text-right">
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
                <td>{{ formatDate(session.penMergesExportDate) }}</td>
                <td>{{ session.penMergesExportUserID }}</td>
                <td class="text-right">
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
                  <a
                    href="#"
                    style="color: #1976d2; text-decoration: underline; cursor: pointer;"
                    @click.prevent="viewRegistrations(session)"
                  >
                    View Registrations
                  </a>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
    <ConfirmationDialog ref="confirmExport">
      <template #message>
        <div v-if="confirmationDate">
          <p>
            The <strong>{{ confirmationReportType }}</strong> file was already exported on <strong>{{ confirmationDate }}</strong>.
          </p>
          <br>
          <p>Please confirm that you would like to re-export the data for transfer.</p>
        </div>
      </template>
    </ConfirmationDialog>
  </v-container>
</template>
<script>

import {Routes} from '@/utils/constants';
import ApiService from '@/common/apiService';
import ConfirmationDialog from '@/components/util/ConfirmationDialog.vue';
import alertMixin from '@/mixins/alertMixin';
import Spinner from '@/components/common/Spinner.vue';
import {formatDateTime} from '@/utils/format';


export default {
  name: 'TransferRegistrations',
  components: {Spinner, ConfirmationDialog},
  mixins: [alertMixin],
  props: {
    schoolYearSessions: {
      type: Array,
      required: true,
    },
  },
  emits: ['refresh-sessions', 'view-registrations'],
  data() {
    return {
      type: '',
      isLoading: false,
      selectedSession: null,
      confirmationReportType: '',
      confirmationDate: '',
      previouslySelectedSessionID: null
    };
  },
  watch: {
    schoolYearSessions: {
      handler(value) {
        if(value.length > 0) {
          if (this.previouslySelectedSessionID) {
            const previousSession = value.find(session => session.sessionID === this.previouslySelectedSessionID);
            if (previousSession) {
              this.type = this.previouslySelectedSessionID;
              this.previouslySelectedSessionID = null;
              return;
            }
          }
          let openSession = value.filter(sch => sch.isOpen);
          if (openSession.length > 0) {
            this.type = openSession[0].sessionID;
          } else {
            // Fallback to first session if no open sessions are found
            this.type = value[0].sessionID;
          }
        }
      },
      immediate: true
    },
    type: {
      handler(newValue) {
        if (newValue) {
          this.previouslySelectedSessionID = newValue;
        }
      }
    }
  },
  methods: {
    async handleConfirmation(session, type) {
      this.selectedSession = session;
      let reportType;
      let date;
      switch (type) {
      case 'ALL_SESSION_REGISTRATIONS':
        reportType = 'Assessment Registrations';
        date = this.formatDate(session.assessmentRegistrationsExportDate);
        break;
      case 'ATTEMPTS':
        reportType = 'Session Writing Attempts';
        date = this.formatDate(session.sessionWritingAttemptsExportDate);
        break;
      case 'PEN_MERGES':
        reportType = 'PEN Merges';
        date = this.formatDate(session.penMergesExportDate);
        break;
      }

      this.confirmationReportType = reportType;
      this.confirmationDate = date;

      if (date) {
        const confirmation = await this.$refs.confirmExport.open('Confirm Re-Export', null, {color: '#fff', width: 580, closeIcon: false, subtitle: false, dark: false, resolveText: 'Re-Export File', rejectText: 'Cancel'});
        if (confirmation) {
          this.handleDownloadReport(type, reportType);
        }
      } else {
        this.handleDownloadReport(type, reportType);
      }
    },
    async handleDownloadReport(reportType) {
      this.isLoading = true;
      try {
        let selection = this.schoolYearSessions.filter(session => session.sessionID === this.selectedSession.sessionID);
        const url = `${Routes.assessments.BASE_URL}/${this.selectedSession.sessionID}/report/${reportType}/download?sessionCode=${selection[0].courseMonth}${selection[0].courseYear}`;

        const response = await ApiService.apiAxios.get(url, { responseType: 'blob' });

        const contentDisposition = response.headers['content-disposition'];
        let filename = `${reportType}.csv`; // fallback filename
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename=(.+)/);
          if (filenameMatch) {
            filename = filenameMatch[1];
          }
        }

        const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);

        this.$emit('refresh-sessions');
      } catch (error) {
        console.error(error);
        this.setFailureAlert(
          error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while trying to retrieve report.'
        );
      } finally {
        this.isLoading = false;
      }
    },
    formatDate(date) {
      if (!date) return '';

      let dateString = date;
      if (typeof date === 'string' && date.includes('.')) {
        const parts = date.split('.');
        if (parts.length === 2) {
          const milliseconds = parts[1].substring(0, 3);
          dateString = `${parts[0]}.${milliseconds}`;
        }
      }

      return formatDateTime(dateString, 'uuuu-MM-dd\'T\'HH:mm:ss.SSS', 'uuuu/MM/dd HH:mm:ss', true);
    },
    getRegistrationStatus(session) {
      if (session.assessmentRegistrationsExportDate) {
        const exportDate = this.formatDate(session.assessmentRegistrationsExportDate);
        return {
          color: 'success',
          text: `Registrations Exported - ${exportDate}`
        };
      } else {
        return {
          color: 'info',
          text: 'Registrations Ongoing'
        };
      }
    },
    viewRegistrations(session) {
      this.$emit('view-registrations', session);
    }
  }
};
</script>
