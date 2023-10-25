<template>
  <div
    id="auditHistory"
    class="px-0 pt-3 ma-0"
    style="width: 100%;"
  >
    <v-progress-linear
      indeterminate
      color="blue"
      :active="hasSagaInProgress && !loading"
    />
    <v-row no-gutters>
      <div
        id="studentInfo"
        class="px-1 pt-2 pb-5"
      >
        <strong class="pr-3">{{ formatPen(student.pen) }}</strong>
        {{ getStudentName(student) }}
      </div>
    </v-row>
    <v-row>
      <v-col :cols="listDetailMode? 6 : 12">
        <v-data-table
          id="dataTable"
          :key="selectedStudentHistoryId"
          v-model="selectedRecords"
          v-model:page="pageNumber"
          class="batch-file-table"
          :headers="getHeaders()"
          :items="studentHistoryResp.content"
          :items-per-page="studentHistoryResp.pageable.pageSize"
          :loading="loading"
          item-key="studentHistoryID"
          @page-count="studentHistoryResp.pageable.pageNumber = $event"
        >
          <template
            v-for="h in headers"
            :key="h.id"
            #[`column.${h.key}`]="{ column }"
          >
            <span
              :title="column.tooltip"
              style="font-weight: bold"
              :class="{'file-column' : !column.countable}"
            >
              {{ column.text }}
            </span>
          </template>
          <template #item="item">
            <tr
              class="hoverTable"
              :class="tableRowClass(item.item)"
              @click="selectItem(item.item)"
            >
              <td
                v-for="header in item.columns"
                :key="header.id"
                :class="header.id"
              >
                <div class="table-cell">
                  <span :class="{'diff-value': item.item[`${header.value}_diff`]}">{{
                    formatTableColumn(header.format, item.item[header.value])
                  }}</span>
                  <v-btn
                    v-if="header.value === 'createDate' && item.item.expandable"
                    class="ml-1"
                    color="#9cbceb42"
                    variant="flat"
                    size="x-small"
                    @click.stop.prevent="expandRow(item.item)"
                    :icon="item.item.expanded ? 'mdi-chevron-up' : 'mdi-chevron-down'"
                  >
                  </v-btn>
                </div>
              </td>
            </tr>
          </template>
        </v-data-table>
      </v-col>
      <v-col v-if="listDetailMode">
        <StudentAuditHistoryDetail
          :key="studentAuditHistoryDetailKey"
          :student="student"
          :next-student-history-content="nextStudentHistoryContent"
          :student-history="studentHistoryResp"
          :student-history-id="selectedStudentHistoryId"
          :is-reverting-student="isRevertingStudent"
          :is-student-updated="isStudentUpdated"
          @close="listDetailMode=false"
          @revert="revertStudentToSelectedHistoryRecord"
          @update="updateSelectedStudentHistoryId"
          @split="split"
        />
      </v-col>
    </v-row>
  </div>
</template>

<script>
import {mapActions, mapState} from 'pinia';
import {REQUEST_TYPES, Routes} from '@/utils/constants';
import StudentAuditHistoryDetail from '../student/StudentAuditHistoryDetailPanel.vue';
import ApiService from '../../../common/apiService';
import alertMixin from '../../../mixins/alertMixin';
import {formatDob, formatPen} from '@/utils/format';
import _,{groupBy, mapValues} from 'lodash';
import router from '@/router';
import staleStudentRecordMixin from '@/mixins/staleStudentRecordMixin';
import {studentStore} from '@/store/modules/student';
import {notificationsStore} from '@/store/modules/notifications';

export default {
  name: 'StudentAuditHistory',
  components: {
    StudentAuditHistoryDetail,
  },
  mixins: [alertMixin, staleStudentRecordMixin],
  props: {
    student: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      itemsPerPage: 10,
      headers: [
        {text: 'Date', sortable: false, value: 'createDate', format: this.formatDate, tooltip: 'Activity Date', key: 'date'},
        {text: 'Changed by', sortable: false, value: 'createUser', tooltip: 'Changed By', key: 'createUser'},
        {text: 'Activity', sortable: false, value: 'historyActivityLabel', key: 'historyActivityLabel', tooltip: 'Activity'},
        {text: 'Mincode', sortable: false, value: 'mincode', key: 'mincode', tooltip: 'Mincode'},
        {text: 'Local ID', sortable: false, value: 'localID', key: 'localID', tooltip: 'Local ID'},
        {text: 'Birth Date', sortable: false, value: 'dob', key: 'dob', format: _.partialRight(formatDob,'uuuu-MM-dd'), tooltip: 'Birth Date'},
        {text: 'Gen', sortable: false, value: 'genderCode', key: 'genderCode', tooltip: 'Gender'},
        {text: 'Legal Name', sortable: false, value: 'legalName', key: 'legalName', tooltip: 'Legal Name'},
        {text: 'Postal', sortable: false, value: 'postalCode', key: 'postalCode', tooltip: 'Postal Code'},
        {text: 'DC', sortable: false, value: 'demogCode', key: 'demogCode', tooltip: 'Demographic Code'},
      ],
      shortHeaders: [
        {text: 'Date', sortable: false, value: 'createDate', key: 'date', tooltip: 'Activity Date'},
        {text: 'Changed by', sortable: false, value: 'createUser', key: 'createUser', tooltip: 'Changed By'},
        {text: 'Activity', sortable: false, value: 'historyActivityLabel', key: 'historyActivityLabel', tooltip: 'Activity'},
        {text: 'Mincode', sortable: false, value: 'mincode', key: 'mincode', tooltip: 'Mincode'},
        {text: 'Local ID', sortable: false, value: 'localID', key: 'localID', tooltip: 'Local ID'},
      ],
      loading: true,
      selectedRecords: [],
      pageNumber: 1,
      studentHistoryResp: {
        numberOfElements: 0,
        totalElements: 0,
        pageable: {
          pageSize: 0
        }
      },
      userEditHistoryGroups: null,
      listDetailMode: false,  // true: both list and detail panels are rendered,  false: list panel only
      selectedStudentHistoryId: null, // pointing the current history record,
      isRevertingStudent: false,
      nextStudentHistoryContent: [],
      isActionedInDifferentTab: true,
      isStudentUpdated: false,
      studentAuditHistoryDetailKey: 0,
      sagaId: undefined,
    };
  },
  computed: {
    ...mapState(studentStore, ['historyActivityCodes', 'studentsInProcess']),
    ...mapState(notificationsStore, ['notification']),
    showingFirstNumber() {
      return ((this.pageNumber - 1) * (this.studentHistoryResp.pageable.pageSize || 0) + ((this.studentHistoryResp.numberOfElements || 0) > 0 ? 1 : 0));
    },
    showingEndNumber() {
      return ((this.pageNumber - 1) * (this.studentHistoryResp.pageable.pageSize || 0) + (this.studentHistoryResp.numberOfElements || 0));
    },
    hasSagaInProgress() {
      return this.student && (this.student.sagaInProgress || this.studentsInProcess.has(this.student.studentID));
    },
  },
  watch: {
    pageNumber: {
      handler() {
        this.retrieveStudentHistory();
      }
    },
    notification(notificationData) {
      if (notificationData) {
        if (notificationData.studentID && notificationData.studentID === this.student.studentID && notificationData.sagaStatus === 'COMPLETED' && this.sagaId && this.sagaId === notificationData.sagaId) {
          if (notificationData.sagaName === 'PEN_SERVICES_SPLIT_PEN_SAGA') {
            this.student.sagaInProgress = false;
            this.setSuccessAlert('Success! Your request to split pen is completed.');
            setTimeout(() => {
              this.$emit('refresh'); // the refresh call refreshes the students, so wait 500 ms for the user to see success banner.
            }, 500);
            // Open students in new tabs
            setTimeout(() => {
              this.openStudentDetails(notificationData.eventPayload);
            }, 500);
          } else if(notificationData.sagaName.startsWith('PEN_SERVICES_')) {
            this.$emit('refresh');
          }
        } else if (notificationData.eventType === 'UPDATE_STUDENT' && notificationData.eventOutcome === 'STUDENT_UPDATED' && notificationData.eventPayload) {
          this.showWarningAndDisableActionIfUpdatedStudentMatched(notificationData);
        }
      }
    },
  },
  mounted() {
    if (!this.historyActivityCodes) {
      this.getHistoryActivityCodes();
    }
    this.retrieveStudentHistory();
    this.listDetailMode = false;
  },
  methods: {
    ...mapActions(studentStore, ['getHistoryActivityCodes']),
    formatPen,
    selectItem(item) {
      this.updateSelectedStudentHistoryId(item.studentHistoryID);
      this.listDetailMode = true;
    },
    tableRowClass(item) {
      let rowClass = [];
      item.hideable && rowClass.push('hideable');
      item.hidden && rowClass.push('hide-item');
      item.isSelected && rowClass.push('selected-record');
      return rowClass;
    },
    updateSelectedStudentHistoryId(historyId) {
      this.studentHistoryResp.content.forEach(hist => {
        hist.expanded = false;
        hist.hidden = false;
        hist.isSelected = hist.studentHistoryID === historyId;
      });
      this.selectedStudentHistoryId = historyId;
    },
    expandRow(item) {
      this.userEditHistoryGroups[item.createDate].forEach(history => {
        if (history.studentHistoryID !== item.studentHistoryID) {
          history.hidden = !history.hidden;
        }
      });
      item.expanded = !item.expanded;
    },
    getHeaders() {
      if (this.listDetailMode) {
        return this.shortHeaders;
      }
      return this.headers;
    },
    getStudentName(student) {
      return `${student.legalLastName ? student.legalLastName + ',' : ''} ${student.legalFirstName ? student.legalFirstName : ''} ${student.legalMiddleNames ? student.legalMiddleNames : ''}`;
    },
    formatStudentHistory(history) {
      history.createTime = history.createDate;
      history.legalName = this.getStudentName(history);
      history.historyActivityLabel = this.historyActivityCodes.find(activity => activity.historyActivityCode === history.historyActivityCode)?.label || history.historyActivityCode;
      history.expandable = false;
      history.expanded = false;
      history.hideable = false;
      history.hidden = false;
      history.createDate = history.createDate.length > 10 ? history.createDate.substr(0, 10) : history.createDate;
      return history;
    },
    markDifferences(currentPageContent, nextPageContent) {
      const historyContent = [...currentPageContent, ...nextPageContent];
      historyContent.forEach((history, index) => {
        if (index < historyContent.length - 1) {
          const preHistory = history.expandable ? (historyContent[index + history.setCount] || historyContent[index + 1]) : historyContent[index + 1];
          Object.keys(history).forEach(key => {
            if (history[key] !== preHistory[key] && !['createDate', 'createUser', 'historyActivityLabel'].includes(key)) {
              history[`${key}_diff`] = true;
            }
          });
        }
      });
    },
    initializeStudentHistory(currentPageData, nextPageData) {
      [...currentPageData.content, ...nextPageData.content].forEach(history => {
        if (history) {
          this.formatStudentHistory(history);
        }
      });

      const historyGroups = groupBy(currentPageData.content, 'createDate');
      this.userEditHistoryGroups = mapValues(historyGroups, group => group.filter(history => history.historyActivityCode === 'USEREDIT'));

      const currentPageContent = currentPageData.content.reduce((acc, history) => {
        if (history.historyActivityCode !== 'USEREDIT') {
          acc.push(history);
        } else {
          const group = this.userEditHistoryGroups[history.createDate];
          if (group?.length > 1 && group[0].studentHistoryID === history.studentHistoryID) {
            history.expandable = true;
            history.setCount = group.length;
            group.slice(1).forEach(editHistory => {
              editHistory.hideable = true;
              editHistory.hidden = true;
            });
            acc.push(...group);
          } else if (group?.length === 1) {
            acc.push(history);
          }
        }
        return acc;
      }, []);

      this.markDifferences(currentPageContent, nextPageData.content);

      this.studentHistoryResp = {
        ...currentPageData,
        content: currentPageContent,
      };
      this.nextStudentHistoryContent = nextPageData.content;
    },
    retrieveStudentHistory() {
      this.loading = true;
      const currentPageParams = {
        params: {
          pageSize: 15,
          pageNumber: this.pageNumber - 1,
          sort: {
            createDate: 'DESC'
          }
        }
      };

      const nextPageParams = {
        params: {
          pageSize: 1,
          pageNumber: this.pageNumber * currentPageParams.params.pageSize,
          sort: {
            createDate: 'DESC'
          }
        }
      };

      return Promise.all([currentPageParams, nextPageParams].map(params => ApiService.apiAxios
        .get(`${Routes['student'].ROOT_ENDPOINT}/${this.student.studentID}/history`, params)))
        .then(([currentPageResp, nextPageResp]) => {
          this.initializeStudentHistory(currentPageResp.data, nextPageResp.data);
        })
        .catch(error => {
          this.setFailureAlert('An error occurred while loading the audit history. Please try again later.');
          console.log(error);
        })
        .finally(() => this.loading = false);
    },
    async revertStudentToSelectedHistoryRecord(selectedHistoryRecord) {
      this.isRevertingStudent = true;
      const payload = this.convertFromHistoryToStudent(selectedHistoryRecord);
      const params = {
        penNumbersInOps: payload.student.pen
      };
      this.isActionedInDifferentTab = false;
      try {
        // update the payload with current status and true student ID of the student
        const studentData = await ApiService.apiAxios.get(Routes['student'].ROOT_ENDPOINT + '/demographics/' + selectedHistoryRecord.studentID);
        payload.statusCode = studentData.data.statusCode;
        payload.trueStudentID = studentData.data.trueStudentID;
        ApiService.apiAxios
          .put(Routes['student'].ROOT_ENDPOINT + '/' + selectedHistoryRecord.studentID, payload, {params})
          .then(() => {
            this.setSuccessAlert('Success! The student details have been reverted.');
            setTimeout(() => {
              this.$emit('refresh'); // the refresh call refreshes the students, so wait 500 ms for the user to see success banner.
            }, 500);
          })
          .catch(error => {
            console.error(error);
            if (error?.response?.data?.code === 409) {
              this.setFailureAlert(error?.response?.data?.message);
            } else {
              this.setFailureAlert('Error! The student details could not be reverted, Please try again later.');
            }
            this.isActionedInDifferentTab = true;
          })
          .finally(() => {
            this.isRevertingStudent = false;
            window.scroll({
              top: 0,
              left: 0,
              behavior: 'smooth',
            });
          });
      } catch (e) {
        console.error(e);
        this.setFailureAlert('Error! The student details could not be reverted, Please try again later.');
      }

    },
    convertFromHistoryToStudent(studentHistory) {
      return {
        student: {
          deceasedDate: studentHistory.deceasedDate,
          demogCode: studentHistory.demogCode,
          dob: formatDob(studentHistory.dob, 'uuuu/MM/dd', 'uuuu-MM-dd'),
          email: studentHistory.email,
          emailVerified: studentHistory.emailVerified,
          genderCode: studentHistory.genderCode,
          gradeCode: studentHistory.gradeCode,
          gradeYear: studentHistory.gradeYear,
          historyActivityCode: 'USEREDIT',
          legalFirstName: studentHistory.legalFirstName,
          legalLastName: studentHistory.legalLastName,
          legalMiddleNames: studentHistory.legalMiddleNames,
          localID: studentHistory.localID,
          memo: studentHistory.memo,
          mincode: studentHistory.mincode?.replace(/ /g, ''),
          pen: studentHistory.pen?.replace(/ /g, ''),
          postalCode: studentHistory.postalCode?.replace(/ /g, ''),
          sexCode: studentHistory.sexCode,
          statusCode: studentHistory.statusCode,
          studentID: studentHistory.studentID,
          trueStudentID: studentHistory.trueStudentID,
          usualFirstName: studentHistory.usualFirstName,
          usualLastName: studentHistory.usualLastName,
          usualMiddleNames: studentHistory.usualMiddleNames
        }
      };
    },
    formatTableColumn(format, column) {
      return (format && column) ? format(column) : (column || ' ');
    },
    formatDate(datetime) {
      return formatDob(datetime.substring(0, 10), 'uuuu-MM-dd');
    },
    openStudentDetails(studentID) {
      const route = router.resolve({ name: REQUEST_TYPES.student.label, params: {studentID: studentID}});
      window.open(route.href, '_blank');
    },
    showWarningAndDisableActionIfUpdatedStudentMatched(notificationData){
      try {
        const student = JSON.parse(notificationData.eventPayload);
        if (student?.pen && student?.pen === this.studentHistoryResp?.content[0]?.pen && this.isActionedInDifferentTab && !this.hasSagaInProgress) { // show only when it is in a diff tab or diff user or not part of the saga.
          this.isStudentUpdated = true;
          this.studentAuditHistoryDetailKey += 1;
          this.$emit('isStudentUpdated', true);
          const warningMessage = `Student details for ${student.pen} is updated by ${student.updateUser}, Please refresh the page.`;
          this.setWarningAlert(warningMessage);
          const studentID = student.studentID;
          this.addStaleDataToMap({studentID, warningMessage});
        } else if (student?.pen && student?.pen === this.studentHistoryResp?.content[0]?.pen && !this.isActionedInDifferentTab) {
          this.isActionedInDifferentTab = true; // make it true for future messages.
        }
      } catch (e) {
        console.error(e);
      }
    },
    split(sagaId) {
      this.sagaId = sagaId;
      this.setSuccessAlert('Your request to split pen is accepted.');
    },
  }
};
</script>

<style scoped>
#currentItemsDisplay {
  text-align: right;
  font-size: 0.875rem;
}

.table-cell {
  cursor: pointer;
}

.selected-record{
   background-color: #E1F5FE !important;
}

.selected-record td{
   background-color:  #E1F5FE !important;
}

#auditHistory /deep/ .v-pagination__navigation > i {
  padding-left: 0;
}

#dataTable /deep/ table {
  border-spacing: 0 0.25rem;
  border-bottom: thin solid #d7d7d7;
}

#dataTable /deep/ table th {
  font-size: 0.875rem;
}

#dataTable /deep/ table tr.selected-record,
#dataTable /deep/ table tbody tr:hover {
  background-color: #E1F5FE !important;
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

#dataTable /deep/ table td {
  border-bottom: none !important;
}

#dataTable /deep/ table tr.hide-item {
  display: none;
}

#dataTable /deep/ table tr.hideable {
  background-color: rgba(0, 0, 0, 0.06);
}

#studentInfo {
  font-size: 1.25rem;
}

.diff-value {
  font-weight: bold;
}

:deep(.v-data-table-footer__items-per-page){
    display: none;
}
</style>
