<template>
  <v-row no-gutters>
    <v-col :cols="showRecordDetail ? 6 : 12">
      <v-data-table
        id="schoolHistoryTable"
        v-model:items-per-page="schoolHistory.pageable.pageSize"
        v-model:items="schoolHistory.content"
        v-model="selectedSchoolHistory"
        :headers="getHeaders()"
        :loading="loading"
        class="batch-file-table"
        mobile-breakpoint="0"
      >
        <template #no-data>
          <v-row no-gutters>
            <v-col class="d-flex justify-center">
              There is no history.
            </v-col>
          </v-row>
        </template>
        <template #item="{ item, index }">
          <tr
            no-gutters
            class="hoverTable"
            :class="tableRowClass(item.raw)"
            @click="selectHistoryItem(item.raw)"
          >
            <td
              v-for="header in getHeaders()"
              :key="header"
              :class="header"
            >
              <span :class="{ 'diff-value': item.raw[`${header}_diff`] }">{{
                formatTableColumn(header.format, item.columns[header.key])
              }}</span>
            </td>
          </tr>
        </template>
      </v-data-table>
      <v-row
        class="pt-2"
        justify="end"
      >
        <v-col cols="4">
          <v-pagination
            v-model="pageNumber"
            color="#38598A"
            :length="schoolHistory.totalPages"
            @update:model-value="getGradSchoolHistory"
          />
        </v-col>
        <v-col
          id="currentItemsDisplay"
          cols="4"
        >
          Showing {{
            showingFirstNumber
          }} to {{
            showingEndNumber
          }} of {{
            schoolHistory.totalElements || 0
          }}
        </v-col>
      </v-row>
    </v-col>
    <v-col
      v-if="showRecordDetail"
      cols="6"
    >
      <GraduationHistoryDetailPanel
        :next-school-history="nextSchoolHistory"
        :school-history="schoolHistory"
        :gradSchoolHistoryID="selectedSchoolHistoryId"
        @close-panel="setShowRecordDetailFalse"
        @update-panel="setSelectedSchoolHistoryId"
      />
    </v-col>
  </v-row>
</template>

<script>
import {Routes} from '@/utils/constants';
import ApiService from '@/common/apiService';
import alertMixin from '@/mixins/alertMixin';
import router from '@/router';
import {formatDob} from '@/utils/format';
import {mapState} from 'pinia';
import GraduationHistoryDetailPanel from './GraduationHistoryDetailPanel.vue';
import {instituteStore} from '@/store/modules/institute';
import {appStore} from '@/store/modules/app';

export default {
  name: 'GraduationHistory',
  components: {
    GraduationHistoryDetailPanel
  },
  mixins: [alertMixin],
  props: {
    schoolID: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      schoolHistory: {
        numberOfElements: 0,
        totalElements: 0,
        pageable: {
          pageSize: 0
        }
      },
      showRecordDetail: false,
      loading: true,
      pageNumber: 1,
      pageSize: 15,
      itemsPerPageOptions: [15],
      nextSchoolHistory: [],
      selectedSchoolHistory: [],
      allAuthority: [],
      selectedSchoolHistoryId: null,
      searchParams: {
        schoolID: '',
      },
      headers: [
        {title: 'Date', sortable: false, key: 'updateDate', format: this.formatDate, tooltip: 'Activity Date'},
        {title: 'Changed by', sortable: false, key: 'updateUser', tooltip: 'Changed By'},
        {title: 'Submission Mode', sortable: false, key: 'submissionModeCode', tooltip: 'Submission Mode'},
        {title: 'Issue Certificates', sortable: false, key: 'canIssueCertificatesValue', tooltip: 'Issue Certificates'},
        {title: 'Issue Transcripts', sortable: false, key: 'canIssueTranscriptsValue', tooltip: 'Issue Transcripts'}
      ],
      shortHeaders: [
        {title: 'Date', sortable: false, key: 'updateDate', format: this.formatDate, tooltip: 'Activity Date'},
        {title: 'Changed by', sortable: false, key: 'updateUser', tooltip: 'Changed By'},
        {title: 'Submission Mode', sortable: false, key: 'submissionModeCode', tooltip: 'Submission Mode'},
        {title: 'Issue Certificates', sortable: false, key: 'canIssueCertificatesValue', tooltip: 'Issue Certificates'},
      ],
    };
  },
  computed: {
    showingFirstNumber() {
      return ((this.pageNumber - 1) * (this.schoolHistory.pageable.pageSize || 0) + ((this.schoolHistory.numberOfElements || 0) > 0 ? 1 : 0));
    },
    showingEndNumber() {
      return ((this.pageNumber - 1) * (this.schoolHistory.pageable.pageSize || 0) + (this.schoolHistory.numberOfElements || 0));
    },
  },
  mounted() {
    this.getGradSchoolHistory();
    this.showRecordDetail = false;
  },
  methods: {
    getPageHeading() {
      let school = this.schoolMap?.get(this.schoolID);
      if (school) {
        return school?.mincode + ' - ' + school?.schoolName;
      }
    },
    formatTableColumn(format, column) {
      return (format && column) ? format(column) : (column || ' ');
    },
    tableRowClass(item) {
      let rowClass = [];
      item.isSelected && rowClass.push('selected-record');
      return rowClass;
    },
    selectHistoryItem(props) {
      this.setSelectedSchoolHistoryId(props.gradSchoolHistoryID);
      this.showRecordDetail = true;
    },
    getHeaders() {
      if (this.showRecordDetail) {
        return this.shortHeaders;
      }
      return this.headers;
    },
    setSelectedSchoolHistoryId(gradSchoolHistoryID) {
      this.schoolHistory.content.forEach(hist => {
        hist.expanded = false;
        hist.hidden = false;
        hist.isSelected = hist.gradSchoolHistoryID === gradSchoolHistoryID;
      });
      this.selectedSchoolHistoryId = gradSchoolHistoryID;
    },
    async getGradSchoolHistory() {
      this.loading = true;
      this.searchParams.schoolID = this.schoolID;
      const currentPageParams = {
        params: {
          pageSize: 15,
          pageNumber: this.pageNumber - 1,
          sort: {
            createDate: 'DESC'
          },
          searchParams: this.searchParams,
        }
      };

      const nextPageParams = {
        params: {
          pageSize: 1,
          pageNumber: this.pageNumber * currentPageParams.params.pageSize,
          sort: {
            createDate: 'DESC'
          },
          searchParams: this.searchParams,
        }
      };

      return Promise.all([currentPageParams, nextPageParams].map(params => ApiService.apiAxios
        .get(Routes.gradSchool.GRAD_SCHOOL_HISTORY_PAGINATED_DATA_URL, params)))
        .then(([currentPageResp, nextPageResp]) => {
          this.initializeSchoolHistory(currentPageResp.data, nextPageResp.data);
        })
        .catch(error => {
          this.setFailureAlert('An error occurred while loading the grad school history. Please try again later.');
          console.log(error);
        })
        .finally(() => this.loading = false);
    },
    setShowRecordDetailFalse(){
      this.showRecordDetail = false;
    },
    checkForDifferences(preHistory, history, key) {
      if (history[key] !== preHistory[key] && !['createDate', 'createUser'].includes(key)) {
        history[`${key}_diff`] = true;
        return history;
      } else {
        history[`${key}_diff`] = false;
        return history;
      }
    },
    markDifferences(currentPageContent, nextPageContent) {
      const historyContent = [...currentPageContent, ...nextPageContent];
      historyContent.forEach((history, index) => {
        if (index < historyContent.length - 1) {
          const preHistory = historyContent[index + 1];
          Object.keys(history).forEach(key => {
            return this.checkForDifferences(preHistory, history, key);
          });
        }
      });
    },
    back() {
      router.push(`/institute/school/${this.schoolID}/details`);
    },
    formatDate(datetime) {
      return formatDob(datetime.substring(0, 10), 'uuuu-MM-dd');
    },
    initializeSchoolHistory(currentPageData, nextPageData) {
      [...currentPageData.content, ...nextPageData.content].forEach(history => {
        if (history) {
          this.formatSchoolHistory(history);
        }
      });
      this.markDifferences(currentPageData.content, nextPageData.content);
      this.schoolHistory = {
        ...currentPageData,
        content: currentPageData.content,
      };
      this.nextSchoolHistory = nextPageData.content;
      console.log(this.schoolHistory)
    },
    formatSchoolHistory(history) {
      history.canIssueCertificatesValue = history.canIssueCertificates === 'Y' ? 'Yes' : 'No'
      history.canIssueTranscriptsValue = history.canIssueTranscripts === 'Y' ? 'Yes' : 'No'
      return history;
    }
  },
};
</script>

<style scoped>
#auditHistory /deep/ .v-pagination__navigation > i {
    padding-left: 0;
}

#schoolHistoryTable /deep/ table {
    border-spacing: 0 0.25rem;
    border-bottom: thin solid #d7d7d7;
}

#schoolHistoryTable /deep/ table th {
    font-size: 0.875rem;
}

#schoolHistoryTable /deep/ table td {
    border-bottom: none !important;
}

#schoolHistoryTable /deep/ table tr.selected-record,
#schoolHistoryTable /deep/ table tbody tr:hover {
    background-color: #E1F5FE !important;
}

.diff-value {
    font-weight: bold;
}


.hoverTable {
    border-bottom-style: groove;
    border-left-style: groove;
    border-right-style: groove;
    border-color: rgb(255 255 255 / 45%);
}

.hoverTable:nth-child(1) {
    border-top-style: groove;
}

.hoverTable:hover {
    background-color: #e8e8e8;
    cursor: pointer;
}

.hoverTable:hover td {
    background-color: transparent; /* or #000 */
}

.selected-record{
   background-color: #E1F5FE !important;
}

.selected-record td{
   background-color:  #E1F5FE !important;
}

:deep(.v-data-table-footer) {
  display: none;
}

.divider {
    border-color: #FCBA19;
    border-width: unset;
}
</style>
  
