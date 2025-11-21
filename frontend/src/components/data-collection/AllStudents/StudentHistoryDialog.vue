<template>
  <v-card id="studentHistoryCard">
    <v-card-title
      id="studentHistoryCardTitle"
      class="sheetHeader pt-1 pb-1"
    >
      <v-row no-gutters>
        <v-col class="d-flex justify-start">
          Student History
        </v-col>
        <v-col class="d-flex justify-end">
          <v-btn
            id="cancel"
            color="white"
            text="Close"
            size="30"
            icon="mdi-close"
            variant="tonal"
            @click="$emit('close')"
          />
        </v-col>
      </v-row>
    </v-card-title>
    <v-divider />
    <v-card-text class="fill-height pa-0">
      <v-progress-linear
        v-if="loading"
        indeterminate
        color="primary"
      />
      <div
        v-else-if="historyData.length === 0"
        class="pa-4"
      >
        <v-alert
          type="info"
          variant="tonal"
        >
          No history records found for this student.
        </v-alert>
      </div>
      <v-data-table
        v-else
        :headers="headers"
        :items="historyData"
        :items-per-page="15"
        :sort-by="[{ key: 'updateDate', order: 'desc' }]"
        class="history-table"
        density="compact"
        fixed-header
      >
        <template #[`item.legalName`]="{ item }">
          {{ displayName(item.raw.legalFirstName, item.raw.legalMiddleNames, item.raw.legalLastName) }}
        </template>
        <template #[`item.updateDate`]="{ item }">
          {{ formatIsoDateTime(item.raw.updateDate) }}
        </template>
        <template #[`item.sdcSchoolCollectionStudentStatusCode`]="{ item }">
          <v-chip
            :color="getStatusColor(item.raw.sdcSchoolCollectionStudentStatusCode)"
            size="small"
          >
            {{ item.raw.sdcSchoolCollectionStudentStatusCode }}
          </v-chip>
        </template>
        <template #[`item.dob`]="{ item }">
          {{ formatDob(item.raw.dob, 'uuuuMMdd', 'uuuu-MM-dd') }}
        </template>
        <template #[`item.isAdult`]="{ item }">
          {{ formatBoolean(item.raw.isAdult) }}
        </template>
        <template #[`item.isSchoolAged`]="{ item }">
          {{ formatBoolean(item.raw.isSchoolAged) }}
        </template>
        <template #[`item.isGraduated`]="{ item }">
          {{ formatBoolean(item.raw.isGraduated) }}
        </template>
        <template #[`item.nativeAncestryInd`]="{ item }">
          {{ item.raw.nativeAncestryInd === 'Y' ? 'Yes' : item.raw.nativeAncestryInd === 'N' ? 'No' : '-' }}
        </template>
      </v-data-table>
    </v-card-text>
  </v-card>
</template>

<script>
import ApiService from '@/common/apiService';
import { Routes } from '@/utils/constants';
import alertMixin from '@/mixins/alertMixin';
import { formatIsoDateTime, formatDob, displayName } from '@/utils/format';

export default {
  name: 'StudentHistoryDialog',
  mixins: [alertMixin],
  props: {
    sdcSchoolCollectionStudentID: {
      type: String,
      required: true
    }
  },
  emits: ['close'],
  data() {
    return {
      loading: false,
      historyData: [],
      headers: [
        { title: 'Updated Date', key: 'updateDate', value: 'updateDate', width: '160px' },
        { title: 'Updated By', key: 'updateUser', value: 'updateUser', width: '200px' },
        { title: 'Status', key: 'sdcSchoolCollectionStudentStatusCode', value: 'sdcSchoolCollectionStudentStatusCode', width: '120px' },
        { title: 'Legal Name', key: 'legalName', value: 'legalName', width: '180px' },
        { title: 'PEN', key: 'studentPen', value: 'studentPen', width: '120px' },
        { title: 'PEN Match Result', key: 'penMatchResult', value: 'penMatchResult', width: '140px' },
        { title: 'Local ID', key: 'localID', value: 'localID', width: '100px' },
        { title: 'DOB', key: 'dob', value: 'dob', width: '100px' },
        { title: 'Gender', key: 'gender', value: 'gender', width: '80px' },
        { title: 'Grade', key: 'enrolledGradeCode', value: 'enrolledGradeCode', width: '80px' },
        { title: 'FTE', key: 'fte', value: 'fte', width: '70px' },
        { title: 'Courses', key: 'numberOfCourses', value: 'numberOfCourses', width: '90px' },
        { title: 'Support Blocks', key: 'supportBlocks', value: 'supportBlocks', width: '120px' },
        { title: 'Enrolled Programs', key: 'enrolledProgramCodes', value: 'enrolledProgramCodes', width: '140px' },
        { title: 'Career Program', key: 'careerProgramCode', value: 'careerProgramCode', width: '120px' },
        { title: 'Special Ed', key: 'specialEducationCategoryCode', value: 'specialEducationCategoryCode', width: '100px' },
        { title: 'School Funding', key: 'schoolFundingCode', value: 'schoolFundingCode', width: '130px' },
        { title: 'Indigenous Ancestry', key: 'nativeAncestryInd', value: 'nativeAncestryInd', width: '150px' },
        { title: 'Home Language', key: 'homeLanguageSpokenCode', value: 'homeLanguageSpokenCode', width: '130px' },
        { title: 'Band Code', key: 'bandCode', value: 'bandCode', width: '100px' },
        { title: 'Years in ELL', key: 'yearsInEll', value: 'yearsInEll', width: '110px' },
        { title: 'Is Adult', key: 'isAdult', value: 'isAdult', width: '90px' },
        { title: 'Is School Aged', key: 'isSchoolAged', value: 'isSchoolAged', width: '130px' },
        { title: 'Is Graduated', key: 'isGraduated', value: 'isGraduated', width: '120px' },
        { title: 'FTE Zero Reason', key: 'fteZeroReasonCode', value: 'fteZeroReasonCode', width: '140px' },
        { title: 'French Inelig', key: 'frenchProgramNonEligReasonCode', value: 'frenchProgramNonEligReasonCode', width: '200px' },
        { title: 'ELL Inelig', key: 'ellNonEligReasonCode', value: 'ellNonEligReasonCode', width: '200px' },
        { title: 'Indigenous Inelig', key: 'indigenousSupportProgramNonEligReasonCode', value: 'indigenousSupportProgramNonEligReasonCode', width: '200px' },
        { title: 'Career Inelig', key: 'careerProgramNonEligReasonCode', value: 'careerProgramNonEligReasonCode', width: '200px' },
        { title: 'Special Ed Inelig', key: 'specialEducationNonEligReasonCode', value: 'specialEducationNonEligReasonCode', width: '200px' },
        { title: 'Postal Code', key: 'postalCode', value: 'postalCode', width: '110px' },
      ]
    };
  },
  mounted() {
    this.loadHistory();
  },
  methods: {
    async loadHistory() {
      this.loading = true;
      try {
        const params = {
          params: {
            pageNumber: 0,
            pageSize: 100,
            sdcSchoolCollectionStudentID: this.sdcSchoolCollectionStudentID
          }
        };

        const response = await ApiService.apiAxios.get(
          Routes.sdc.SDC_SCHOOL_COLLECTION_STUDENT_HISTORY_PAGINATED,
          params
        );

        this.historyData = response.data.content || [];
        console.log('Student History:', response.data);
      } catch (error) {
        console.error('Error fetching student history:', error);
        this.setFailureAlert('An error occurred while loading student history. Please try again later.');
        this.historyData = [];
      } finally {
        this.loading = false;
      }
    },
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
#studentHistoryCard {
  background-color: #f1f1f1;
  min-height: 70vh;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
}

.sheetHeader {
  background-color: #003366;
  color: white;
  font-size: medium !important;
  font-weight: bolder !important;
}

#studentHistoryCard :deep(.v-card-text) {
  flex: 1;
  position: relative;
  padding: 0;
  min-height: 0;
}

.history-table {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.history-table :deep(.v-table__wrapper) {
  height: calc(100% - 60px);
  overflow-y: auto;
}
</style>

