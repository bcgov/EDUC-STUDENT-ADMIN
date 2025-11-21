<template>
  <v-card id="studentHistoryCard">
    <v-card-title
      id="studentHistoryCardTitle"
      class="sheetHeader pt-1 pb-1"
    >
      <v-row no-gutters>
        <v-col class="d-flex justify-start">
          Student History - PEN: {{ studentPen }} ({{ studentName }})
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
    <v-card-text class="pa-0">
      <v-progress-linear
        v-if="loading"
        indeterminate
        color="primary"
      />
      <v-row
        v-else-if="historyData.length === 0"
        no-gutters
        class="pa-4"
      >
        <v-col>
          <v-alert
            type="info"
            variant="tonal"
          >
            No history records found for this student.
          </v-alert>
        </v-col>
      </v-row>
      <v-row
        v-else
        no-gutters
      >
        <v-col :cols="showRecordDetail ? 6 : 12">
          <v-data-table
            v-model="selectedHistory"
            :headers="getHeaders()"
            :items="historyData"
            :items-per-page="25"
            :items-per-page-options="[{ value: 25, title: '25' }]"
            :sort-by="[{ key: 'updateDate', order: 'desc' }]"
            class="history-table"
            density="compact"
            fixed-header
          >
            <template #no-data>
              <v-row no-gutters>
                <v-col class="d-flex justify-center">
                  There is no history.
                </v-col>
              </v-row>
            </template>
            <template #item="{ item }">
              <tr
                class="hoverTable"
                :class="tableRowClass(item.raw)"
                @click="selectHistoryItem(item.raw)"
              >
                <td>{{ formatIsoDateTime(item.raw.updateDate) }}</td>
                <td>{{ item.raw.updateUser }}</td>
                <td
                  v-if="!showRecordDetail"
                >
                  {{ displayName(item.raw.legalFirstName, item.raw.legalMiddleNames, item.raw.legalLastName) }}
                </td>
                <td>
                  <v-chip
                    :color="getStatusColor(item.raw.sdcSchoolCollectionStudentStatusCode)"
                    size="small"
                  >
                    {{ item.raw.sdcSchoolCollectionStudentStatusCode }}
                  </v-chip>
                </td>
              </tr>
            </template>
          </v-data-table>
        </v-col>
        <v-col
          v-if="showRecordDetail"
          cols="6"
        >
          <StudentHistoryDetailPanel
            :student-history="selectedStudentHistory"
            @close-panel="closeDetailPanel"
          />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
import ApiService from '@/common/apiService';
import { Routes } from '@/utils/constants';
import alertMixin from '@/mixins/alertMixin';
import { formatIsoDateTime, formatDob, displayName } from '@/utils/format';
import StudentHistoryDetailPanel from './StudentHistoryDetailPanel.vue';

export default {
  name: 'StudentHistoryDialog',
  components: {
    StudentHistoryDetailPanel
  },
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
      selectedHistory: [],
      showRecordDetail: false,
      selectedStudentHistory: null,
      studentPen: '',
      studentName: '',
      fullHeaders: [
        { title: 'Updated Date', key: 'updateDate', value: 'updateDate' },
        { title: 'Updated By', key: 'updateUser', value: 'updateUser' },
        { title: 'Legal Name', key: 'legalName', value: 'legalName' },
        { title: 'Status', key: 'sdcSchoolCollectionStudentStatusCode', value: 'sdcSchoolCollectionStudentStatusCode' }
      ],
      shortHeaders: [
        { title: 'Updated Date', key: 'updateDate', value: 'updateDate' },
        { title: 'Updated By', key: 'updateUser', value: 'updateUser' },
        { title: 'Status', key: 'sdcSchoolCollectionStudentStatusCode', value: 'sdcSchoolCollectionStudentStatusCode' }
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
            sort: { updateDate: 'DESC' },
            sdcSchoolCollectionStudentID: this.sdcSchoolCollectionStudentID
          }
        };

        const response = await ApiService.apiAxios.get(
          Routes.sdc.SDC_SCHOOL_COLLECTION_STUDENT_HISTORY_PAGINATED,
          params
        );

        this.historyData = response.data.content || [];

        if (this.historyData.length > 0) {
          this.studentPen = this.historyData[0].studentPen || 'Unknown';
          this.studentName = displayName(
            this.historyData[0].legalFirstName,
            this.historyData[0].legalMiddleNames,
            this.historyData[0].legalLastName
          ) || 'Unknown';
          this.selectHistoryItem(this.historyData[0]);
        }

      } catch (error) {
        console.error('Error fetching student history:', error);
        this.setFailureAlert('An error occurred while loading student history. Please try again later.');
        this.historyData = [];
      } finally {
        this.loading = false;
      }
    },
    getHeaders() {
      return this.showRecordDetail ? this.shortHeaders : this.fullHeaders;
    },
    tableRowClass(item) {
      return item.isSelected ? 'selected-record' : '';
    },
    selectHistoryItem(historyRecord) {
      this.historyData.forEach(hist => {
        hist.isSelected = hist.sdcSchoolCollectionStudentHistoryID === historyRecord.sdcSchoolCollectionStudentHistoryID;
      });
      this.selectedStudentHistory = historyRecord;
      this.showRecordDetail = true;
    },
    closeDetailPanel() {
      this.showRecordDetail = false;
      this.historyData.forEach(hist => {
        hist.isSelected = false;
      });
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
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

#studentHistoryCard :deep(.v-card-text > .v-row) {
  flex: 1;
  min-height: 0;
}

.hoverTable:hover {
  cursor: pointer;
}

.selected-record td {
  background-color: #e3f2fd !important;
}

.history-table {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.history-table :deep(.v-table) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.history-table :deep(.v-table__wrapper) {
  flex: 1;
  overflow-y: auto;
}
</style>

