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
                  Approver Role
                </th>
                <th scope="col">
                  Approver
                </th>
                <th scope="col">
                  Approval Date
                </th>
                <th scope="col" />
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Director, Student Certification and Data Management, SIDENS</td>
                <td>{{ session.approvalStudentCertUserID }}</td>
                <td>{{ formatDate(session.approvalStudentCertSignDate) }}</td>
                <td class="text-right">
                  <v-btn
                    :id="`approve1-${index}`"
                    prepend-icon="mdi-file-upload"
                    variant="elevated"
                    color="#003366"
                    text="Approve Results"
                    :disabled="!!session.approvalStudentCertSignDate || !hasStudentCertificationApproverPermission || session.sessionID !== mostCurrentSession.sessionID"
                    @click="handleApprovalConfirmation(session, 'cert_user')"
                  />
                </td>
              </tr>
              <tr>
                <td>Director, Provincial Assessment Design, SLB</td>
                <td>{{ session.approvalAssessmentDesignUserID }}</td>
                <td>{{ formatDate(session.approvalAssessmentDesignSignDate) }}</td>
                <td class="text-right">
                  <v-btn
                    :id="`approve2-${index}`"
                    prepend-icon="mdi-file-upload"
                    variant="elevated"
                    color="#003366"
                    text="Approve Results"
                    :disabled="!!session.approvalAssessmentDesignSignDate || !hasProvincialAssessmentApproverPermission || session.sessionID !== mostCurrentSession.sessionID"
                    @click="handleApprovalConfirmation(session, 'design_user')"
                  />
                </td>
              </tr>
              <tr>
                <td>Director, Assessment Admin, Analysis and Reporting, SLB</td>
                <td>{{ session.approvalAssessmentAnalysisUserID }}</td>
                <td>{{ formatDate(session.approvalAssessmentAnalysisSignDate) }}</td>
                <td class="text-right">
                  <v-btn
                    :id="`approve3-${index}`"
                    prepend-icon="mdi-file-upload"
                    variant="elevated"
                    color="#003366"
                    text="Approve Results"
                    :disabled="!!session.approvalAssessmentAnalysisSignDate || !hasAnalysisAndReportingApproverPermission || session.sessionID !== mostCurrentSession.sessionID"
                    @click="handleApprovalConfirmation(session, 'analysis_user')"
                  />
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
    <ConfirmationDialog ref="confirmApproval">
      <template #message>
        <div>
          <p>Please confirm that you would like to approve the assessment results.</p>
          <br>
          <p>Once completed this cannot be undone.</p>
        </div>
      </template>
    </ConfirmationDialog>
  </v-container>
</template>
<script>
import Spinner from '@/components/common/Spinner.vue';
import {formatDateTime} from '@/utils/format';
import ConfirmationDialog from '@/components/util/ConfirmationDialog.vue';
import {Routes} from '@/utils/constants';
import ApiService from '@/common/apiService';
import alertMixin from '@/mixins/alertMixin';
import {mapState} from 'pinia';
import {authStore} from '@/store/modules/auth';
import {hasRequiredPermission, PERMISSION} from '@/utils/constants/Permission';

export default {
  name: 'ApproveResults',
  components: {ConfirmationDialog, Spinner},
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
      previouslySelectedSessionID: null,
      user: null
    };
  },
  computed: {
    ...mapState(authStore, ['userInfo']),
    mostCurrentSession() {
      return this.schoolYearSessions.reduce((latest, current) => {
        const latestDate = new Date(`${latest.courseYear}-${latest.courseMonth.padStart(2, '0')}-01`);
        const currentDate = new Date(`${current.courseYear}-${current.courseMonth.padStart(2, '0')}-01`);
        return currentDate > latestDate ? current : latest;
      });
    },
    hasStudentCertificationApproverPermission() {
      return this.hasRequiredPermission(this.user, PERMISSION.ASSESSMENT_APPROVER_STUDENT_CERTIFICATION_AND_DATA_MANAGEMENT_PERMISSION);
    },
    hasProvincialAssessmentApproverPermission() {
      return this.hasRequiredPermission(this.user, PERMISSION.ASSESSMENT_APPROVER_PROVINCIAL_ASSESSMENT_DESIGN_PERMISSION);
    },
    hasAnalysisAndReportingApproverPermission() {
      return this.hasRequiredPermission(this.user, PERMISSION.ASSESSMENT_APPROVER_ASSESSMENT_ANALYSIS_AND_REPORTING_PERMISSION);
    }
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
  created() {
    authStore().getUserInfo().then(()=> {
      this.user = this.userInfo;
    });
  },
  methods: {
    hasRequiredPermission,
    async handleApprovalConfirmation(session, type) {
      this.selectedSession = session;
      const confirmation = await this.$refs.confirmApproval.open('Confirm Approval', null, {color: '#fff', width: 580, closeIcon: false, subtitle: false, dark: false, resolveText: 'Confirm Approval', rejectText: 'Cancel'});
      if (confirmation) {
        this.handleApprovalPost(session, type);
      }
    },
    async handleApprovalPost(session, approvalType) {
      this.isLoading = true;
      try {
        const payload = {
          session: session,
          approvalType: approvalType
        };

        const url = `${Routes.assessments.BASE_URL}/${session.sessionID}/approve`;
        await ApiService.apiAxios.post(url, payload);

        this.$emit('refresh-sessions');
      } catch (error) {
        console.error(error);
        this.setFailureAlert(
          error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while trying to approve results.'
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
      if (session.approval_student_cert_sign_date &&
          session.approval_assessment_design_sign_date &&
          session.approval_assessment_analysis_sign_date) {
        const approvalDates = [
          session.approval_student_cert_sign_date,
          session.approval_assessment_design_sign_date,
          session.approval_assessment_analysis_sign_date
        ].filter(date => date);

        const latestApprovalDate = approvalDates.reduce((latest, current) => {
          return new Date(current) > new Date(latest) ? current : latest;
        });

        const formattedDateTime = this.formatDate(latestApprovalDate);
        const formattedDate = formattedDateTime.split(' ')[0];

        return {
          color: 'success',
          text: `Approved - ${formattedDate}`
        };
      }

      const isCurrentSession = session.sessionID === this.mostCurrentSession.sessionID;

      const hasAnyApproval = session.approval_student_cert_sign_date ||
                           session.approval_assessment_design_sign_date ||
                           session.approval_assessment_analysis_sign_date;

      if (isCurrentSession && hasAnyApproval) {
        return {
          color: 'info',
          text: 'Approval Ongoing'
        };
      } else {
        return {
          color: 'grey',
          text: 'Pending Results'
        };
      }
    },
  }
};
</script>
