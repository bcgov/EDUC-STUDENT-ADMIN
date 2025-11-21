<template>
  <v-card
    id="studentHistoryDetailPanel"
    flat
  >
    <v-card-title class="pt-1 pb-1 px-2 detail-panel-header">
      <v-row
        no-gutters
        class="d-flex justify-space-between"
      >
        <v-col class="d-flex justify-start">
          <span>Student Details</span>
        </v-col>
        <v-col class="d-flex justify-end">
          <v-btn
            id="close-detail-panel"
            color="white"
            icon="mdi-close"
            size="x-small"
            variant="text"
            @click="$emit('close-panel')"
          />
        </v-col>
      </v-row>
    </v-card-title>
    <v-divider class="divider" />
    <v-card-text>
      <v-row
        v-if="studentHistory"
        class="d-flex justify-start py-2"
      >
        <v-col cols="12">
          <v-row class="pb-2">
            <v-col
              cols="4"
              class="pb-0 pt-0 field-label"
            >
              Status:
            </v-col>
            <v-col
              cols="8"
              class="pb-0 pt-0"
            >
              <v-chip
                :color="getStatusColor(studentHistory.sdcSchoolCollectionStudentStatusCode)"
                size="small"
              >
                {{ studentHistory.sdcSchoolCollectionStudentStatusCode }}
              </v-chip>
            </v-col>
          </v-row>

          <v-row class="pb-2">
            <v-col
              cols="4"
              class="pb-0 pt-0 field-label"
            >
              Legal Name:
            </v-col>
            <v-col
              cols="8"
              class="pb-0 pt-0"
            >
              {{ displayName(studentHistory.legalFirstName, studentHistory.legalMiddleNames, studentHistory.legalLastName) }}
            </v-col>
          </v-row>

          <v-row class="pb-2">
            <v-col
              cols="4"
              class="pb-0 pt-0 field-label"
            >
              PEN:
            </v-col>
            <v-col
              cols="8"
              class="pb-0 pt-0"
            >
              {{ studentHistory.studentPen || '-' }}
            </v-col>
          </v-row>

          <v-row class="pb-2">
            <v-col
              cols="4"
              class="pb-0 pt-0 field-label"
            >
              PEN Match Result:
            </v-col>
            <v-col
              cols="8"
              class="pb-0 pt-0"
            >
              {{ studentHistory.penMatchResult || '-' }}
            </v-col>
          </v-row>

          <v-row class="pb-2">
            <v-col
              cols="4"
              class="pb-0 pt-0 field-label"
            >
              Local ID:
            </v-col>
            <v-col
              cols="8"
              class="pb-0 pt-0"
            >
              {{ studentHistory.localID || '-' }}
            </v-col>
          </v-row>

          <v-row class="pb-2">
            <v-col
              cols="4"
              class="pb-0 pt-0 field-label"
            >
              Date of Birth:
            </v-col>
            <v-col
              cols="8"
              class="pb-0 pt-0"
            >
              {{ formatDob(studentHistory.dob, 'uuuuMMdd', 'uuuu-MM-dd') }}
            </v-col>
          </v-row>

          <v-row class="pb-2">
            <v-col
              cols="4"
              class="pb-0 pt-0 field-label"
            >
              Gender:
            </v-col>
            <v-col
              cols="8"
              class="pb-0 pt-0"
            >
              {{ studentHistory.gender || '-' }}
            </v-col>
          </v-row>

          <v-row class="pb-2">
            <v-col
              cols="4"
              class="pb-0 pt-0 field-label"
            >
              Grade:
            </v-col>
            <v-col
              cols="8"
              class="pb-0 pt-0"
            >
              {{ studentHistory.enrolledGradeCode || '-' }}
            </v-col>
          </v-row>

          <v-row class="pb-2">
            <v-col
              cols="4"
              class="pb-0 pt-0 field-label"
            >
              FTE:
            </v-col>
            <v-col
              cols="8"
              class="pb-0 pt-0"
            >
              {{ studentHistory.fte !== null ? studentHistory.fte : '-' }}
            </v-col>
          </v-row>

          <v-row class="pb-2">
            <v-col
              cols="4"
              class="pb-0 pt-0 field-label"
            >
              Number of Courses:
            </v-col>
            <v-col
              cols="8"
              class="pb-0 pt-0"
            >
              {{ studentHistory.numberOfCourses || '-' }}
            </v-col>
          </v-row>

          <v-row class="pb-2">
            <v-col
              cols="4"
              class="pb-0 pt-0 field-label"
            >
              Support Blocks:
            </v-col>
            <v-col
              cols="8"
              class="pb-0 pt-0"
            >
              {{ studentHistory.supportBlocks || '-' }}
            </v-col>
          </v-row>

          <v-row class="pb-2">
            <v-col
              cols="4"
              class="pb-0 pt-0 field-label"
            >
              Enrolled Programs:
            </v-col>
            <v-col
              cols="8"
              class="pb-0 pt-0"
            >
              {{ studentHistory.enrolledProgramCodes || '-' }}
            </v-col>
          </v-row>

          <v-row class="pb-2">
            <v-col
              cols="4"
              class="pb-0 pt-0 field-label"
            >
              Career Program:
            </v-col>
            <v-col
              cols="8"
              class="pb-0 pt-0"
            >
              {{ studentHistory.careerProgramCode || '-' }}
            </v-col>
          </v-row>

          <v-row class="pb-2">
            <v-col
              cols="4"
              class="pb-0 pt-0 field-label"
            >
              Special Education:
            </v-col>
            <v-col
              cols="8"
              class="pb-0 pt-0"
            >
              {{ studentHistory.specialEducationCategoryCode || '-' }}
            </v-col>
          </v-row>

          <v-row class="pb-2">
            <v-col
              cols="4"
              class="pb-0 pt-0 field-label"
            >
              School Funding:
            </v-col>
            <v-col
              cols="8"
              class="pb-0 pt-0"
            >
              {{ studentHistory.schoolFundingCode || '-' }}
            </v-col>
          </v-row>

          <v-row class="pb-2">
            <v-col
              cols="4"
              class="pb-0 pt-0 field-label"
            >
              Indigenous Ancestry:
            </v-col>
            <v-col
              cols="8"
              class="pb-0 pt-0"
            >
              {{ studentHistory.nativeAncestryInd === 'Y' ? 'Yes' : studentHistory.nativeAncestryInd === 'N' ? 'No' : '-' }}
            </v-col>
          </v-row>

          <v-row class="pb-2">
            <v-col
              cols="4"
              class="pb-0 pt-0 field-label"
            >
              Home Language:
            </v-col>
            <v-col
              cols="8"
              class="pb-0 pt-0"
            >
              {{ studentHistory.homeLanguageSpokenCode || '-' }}
            </v-col>
          </v-row>

          <v-row class="pb-2">
            <v-col
              cols="4"
              class="pb-0 pt-0 field-label"
            >
              Band Code:
            </v-col>
            <v-col
              cols="8"
              class="pb-0 pt-0"
            >
              {{ studentHistory.bandCode || '-' }}
            </v-col>
          </v-row>

          <v-row class="pb-2">
            <v-col
              cols="4"
              class="pb-0 pt-0 field-label"
            >
              Years in ELL:
            </v-col>
            <v-col
              cols="8"
              class="pb-0 pt-0"
            >
              {{ studentHistory.yearsInEll || '-' }}
            </v-col>
          </v-row>

          <v-row class="pb-2">
            <v-col
              cols="4"
              class="pb-0 pt-0 field-label"
            >
              Is Adult:
            </v-col>
            <v-col
              cols="8"
              class="pb-0 pt-0"
            >
              {{ formatBoolean(studentHistory.isAdult) }}
            </v-col>
          </v-row>

          <v-row class="pb-2">
            <v-col
              cols="4"
              class="pb-0 pt-0 field-label"
            >
              Is School Aged:
            </v-col>
            <v-col
              cols="8"
              class="pb-0 pt-0"
            >
              {{ formatBoolean(studentHistory.isSchoolAged) }}
            </v-col>
          </v-row>

          <v-row class="pb-2">
            <v-col
              cols="4"
              class="pb-0 pt-0 field-label"
            >
              Is Graduated:
            </v-col>
            <v-col
              cols="8"
              class="pb-0 pt-0"
            >
              {{ formatBoolean(studentHistory.isGraduated) }}
            </v-col>
          </v-row>

          <v-row class="pb-2">
            <v-col
              cols="4"
              class="pb-0 pt-0 field-label"
            >
              FTE Zero Reason:
            </v-col>
            <v-col
              cols="8"
              class="pb-0 pt-0"
            >
              {{ studentHistory.fteZeroReasonCode || '-' }}
            </v-col>
          </v-row>

          <v-row class="pb-2">
            <v-col
              cols="4"
              class="pb-0 pt-0 field-label"
            >
              French Ineligibility:
            </v-col>
            <v-col
              cols="8"
              class="pb-0 pt-0"
            >
              {{ studentHistory.frenchProgramNonEligReasonCode || '-' }}
            </v-col>
          </v-row>

          <v-row class="pb-2">
            <v-col
              cols="4"
              class="pb-0 pt-0 field-label"
            >
              ELL Ineligibility:
            </v-col>
            <v-col
              cols="8"
              class="pb-0 pt-0"
            >
              {{ studentHistory.ellNonEligReasonCode || '-' }}
            </v-col>
          </v-row>

          <v-row class="pb-2">
            <v-col
              cols="4"
              class="pb-0 pt-0 field-label"
            >
              Indigenous Ineligibility:
            </v-col>
            <v-col
              cols="8"
              class="pb-0 pt-0"
            >
              {{ studentHistory.indigenousSupportProgramNonEligReasonCode || '-' }}
            </v-col>
          </v-row>

          <v-row class="pb-2">
            <v-col
              cols="4"
              class="pb-0 pt-0 field-label"
            >
              Career Ineligibility:
            </v-col>
            <v-col
              cols="8"
              class="pb-0 pt-0"
            >
              {{ studentHistory.careerProgramNonEligReasonCode || '-' }}
            </v-col>
          </v-row>

          <v-row class="pb-2">
            <v-col
              cols="4"
              class="pb-0 pt-0 field-label"
            >
              Special Ed Ineligibility:
            </v-col>
            <v-col
              cols="8"
              class="pb-0 pt-0"
            >
              {{ studentHistory.specialEducationNonEligReasonCode || '-' }}
            </v-col>
          </v-row>

          <v-row class="pb-2">
            <v-col
              cols="4"
              class="pb-0 pt-0 field-label"
            >
              Postal Code:
            </v-col>
            <v-col
              cols="8"
              class="pb-0 pt-0"
            >
              {{ studentHistory.postalCode || '-' }}
            </v-col>
          </v-row>

          <v-row class="pb-2">
            <v-col
              cols="4"
              class="pb-0 pt-0 field-label"
            >
              Updated By:
            </v-col>
            <v-col
              cols="8"
              class="pb-0 pt-0"
            >
              {{ studentHistory.updateUser || '-' }}
            </v-col>
          </v-row>

          <v-row class="pb-2">
            <v-col
              cols="4"
              class="pb-0 pt-0 field-label"
            >
              Updated Date:
            </v-col>
            <v-col
              cols="8"
              class="pb-0 pt-0"
            >
              {{ formatIsoDateTime(studentHistory.updateDate) }}
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
import { formatIsoDateTime, formatDob, displayName } from '@/utils/format';

export default {
  name: 'StudentHistoryDetailPanel',
  props: {
    studentHistory: {
      type: Object,
      required: true
    }
  },
  emits: ['close-panel'],
  methods: {
    getStatusColor(status) {
      const colors = {
        'LOADED': 'blue',
        'VERIFIED': 'green',
        'COMPLETED': 'success',
        'ERROR': 'error',
        'DELETED': 'grey',
        'FUNDWARN': 'orange',
        'INFOWARN': 'info'
      };
      return colors[status] || 'default';
    },
    formatBoolean(value) {
      if (value === 'true' || value === true) return 'Yes';
      if (value === 'false' || value === false) return 'No';
      return '-';
    },
    formatIsoDateTime,
    formatDob,
    displayName
  }
};
</script>

<style scoped>
#studentHistoryDetailPanel {
  background-color: rgba(0, 0, 0, 0.06);
  height: 100%;
  overflow-y: auto;
}

.detail-panel-header {
  background-color: #d3d3d3;
  font-weight: bold;
}

.field-label {
  font-weight: bold;
  color: rgba(0, 0, 0, 0.60);
}

.divider {
  border-color: rgba(0, 0, 0, 0.30);
}
</style>

