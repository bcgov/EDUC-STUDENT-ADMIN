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
    <v-card-text class="pa-0 content-area">
      <v-progress-linear
        v-if="loading"
        indeterminate
        color="primary"
        class="loading-bar"
      />
      <v-row
        v-if="!loading && historyData.length === 0"
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
        v-show="historyData.length > 0"
        no-gutters
        class="history-container"
        :class="{ 'loading-overlay': loading }"
      >
        <v-col
          :cols="showRecordDetail ? 6 : 12"
          class="table-column"
        >
          <v-data-table-server
            v-model="selectedHistory"
            v-model:page="currentPage"
            v-model:items-per-page="pageSize"
            v-model:sort-by="sortBy"
            :headers="getHeaders()"
            :items="historyData"
            :items-length="totalElements"
            :items-per-page-options="[
              { value: 15, title: '15' },
              { value: 25, title: '25' },
              { value: 50, title: '50' },
              { value: 100, title: '100' }
            ]"
            :sort-by="[{ key: 'updateDate', order: 'desc' }]"
            class="history-table"
            density="compact"
            fixed-header
            height="100%"
            @update:options="handlePageChange"
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
          </v-data-table-server>
        </v-col>
        <v-col
          v-if="showRecordDetail"
          cols="6"
          class="detail-column"
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
import {Routes} from '@/utils/constants';
import alertMixin from '@/mixins/alertMixin';
import {displayName, formatDob, formatIsoDateTime} from '@/utils/format';
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
      currentPage: 1,
      pageNumber: 0,
      pageSize: 15,
      totalElements: 0,
      previousPage: 1,
      previousPageSize: 15,
      sortBy: [{ key: 'updateDate', order: 'desc' }],
      previousSortBy: [{ key: 'updateDate', order: 'desc' }],
      fullHeaders: [
        { title: 'Updated Date', key: 'updateDate', value: 'updateDate', sortable: true },
        { title: 'Updated By', key: 'updateUser', value: 'updateUser', sortable: true },
        { title: 'Legal Name', key: 'legalName', value: 'legalName', sortable: false },
        { title: 'Status', key: 'sdcSchoolCollectionStudentStatusCode', value: 'sdcSchoolCollectionStudentStatusCode', sortable: false }
      ],
      shortHeaders: [
        { title: 'Updated Date', key: 'updateDate', value: 'updateDate', sortable: true },
        { title: 'Updated By', key: 'updateUser', value: 'updateUser', sortable: true },
        { title: 'Status', key: 'sdcSchoolCollectionStudentStatusCode', value: 'sdcSchoolCollectionStudentStatusCode', sortable: false }
      ]
    };
  },
  mounted() {
    this.loadHistory(0, 15, this.sortBy);
  },
  methods: {
    async loadHistory(page = 0, itemsPerPage = 15, sortBy = null) {
      this.loading = true;
      try {
        const sortObj = sortBy && sortBy.length > 0
          ? { [sortBy[0].key]: sortBy[0].order.toUpperCase() }
          : { updateDate: 'DESC' };

        const params = {
          params: {
            pageNumber: page,
            pageSize: itemsPerPage,
            sort: sortObj,
            sdcSchoolCollectionStudentID: this.sdcSchoolCollectionStudentID,
            tableFormat: true
          }
        };

        const response = await ApiService.apiAxios.get(
          Routes.sdc.SDC_SCHOOL_COLLECTION_STUDENT_HISTORY_PAGINATED,
          params
        );

        this.historyData = (response.data.content || []).map(item => ({
          ...item,
          isSelected: false
        }));
        this.totalElements = response.data.totalElements || 0;
        this.pageNumber = response.data.number || 0;
        this.pageSize = response.data.size || 15;
        this.currentPage = (response.data.number || 0) + 1; // Convert to 1-based for UI

        // Update previous values to current loaded state
        this.previousPage = this.currentPage;
        this.previousPageSize = this.pageSize;
        this.previousSortBy = sortBy && sortBy.length > 0 ? [...sortBy] : [{ key: 'updateDate', order: 'desc' }];

        // Only set student info and select first item on initial load
        if (this.historyData.length > 0 && page === 0 && !this.studentPen) {
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
        this.totalElements = 0;
      } finally {
        this.loading = false;
      }
    },
    handlePageChange({ page, itemsPerPage, sortBy }) {
      // v-data-table uses 1-based page numbers, backend uses 0-based
      const backendPage = page - 1;

      // Use sortBy from event, fallback to current if empty
      const effectiveSortBy = (sortBy && sortBy.length > 0) ? sortBy : this.sortBy;

      // Check if anything changed from the last loaded state
      const pageChanged = page !== this.previousPage;
      const pageSizeChanged = itemsPerPage !== this.previousPageSize;

      // Compare actual sort values, not Proxy objects
      const currentSortKey = effectiveSortBy[0]?.key;
      const currentSortOrder = effectiveSortBy[0]?.order;
      const previousSortKey = this.previousSortBy[0]?.key;
      const previousSortOrder = this.previousSortBy[0]?.order;
      const sortChanged = currentSortKey !== previousSortKey || currentSortOrder !== previousSortOrder;

      if (pageChanged || pageSizeChanged || sortChanged) {
        // v-model:sort-by will update this.sortBy automatically
        this.loadHistory(backendPage, itemsPerPage, effectiveSortBy);
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
  height: 80vh;
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

.content-area {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.loading-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
}

.loading-overlay {
  opacity: 0.5;
  pointer-events: none;
}

.history-container {
  flex: 1;
  min-height: 0;
  max-height: 100%;
}

.table-column,
.detail-column {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.hoverTable:hover {
  cursor: pointer;
}

.selected-record td {
  background-color: #e3f2fd !important;
}

.history-table {
  height: 80vh;
}

.history-table :deep(.v-table__wrapper) {
  max-height: calc(80vh - 4vh);
  overflow-y: auto;
}
</style>

