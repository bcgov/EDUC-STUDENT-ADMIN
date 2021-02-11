<template>
  <div id="auditHistory" class="px-0 pt-3 ma-0" style="width: 100%;">
    <v-row>
      <AlertMessage v-model="alert" :alertMessage="alertMessage" :alertType="alertType"
                    :timeoutMs="2000"></AlertMessage>
    </v-row>
    <v-row no-gutters>
      <div id="studentInfo" class="px-1 pt-2 pb-5"><strong class="pr-3">{{ formatPen(student.pen) }}</strong>
        {{ getStudentName(student) }}
      </div>
    </v-row>
    <v-row>
      <v-col :cols="this.listDetailMode? 6 : 12">
        <v-data-table
            id="dataTable"
            :key="selectedStudentHistoryId"
            v-model="selectedRecords"
            :headers="getHeaders()"
            :items="studentHistoryResp.content"
            :items-per-page="studentHistoryResp.pageable.pageSize"
            :loading="loading"
            :page.sync="pageNumber"
            hide-default-footer
            item-key="studentHistoryID"
            @page-count="studentHistoryResp.pageable.pageNumber = $event"
        >
          <template v-slot:item="props">
            <tr :class="tableRowClass(props.item)" @click="selectItem(props)">
              <td v-for="header in props.headers" :key="header.id" :class="header.id">
                <div class="table-cell">
                  <span :class="{'diff-value': props.item[`${header.value}_diff`]}">{{
                      props.item[header.value] || ''
                    }}</span>
                  <v-btn v-if="header.value === 'createDate' && props.item.expandable" class="ml-1" color="#38598a"
                         icon>
                    <v-icon @click.stop="expandRow(props.item)">
                      {{ props.item.expanded ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
                    </v-icon>
                  </v-btn>
                </div>
              </td>
            </tr>
          </template>
        </v-data-table>
        <v-row class="pt-2" justify="end">
          <v-col cols="4">
            <v-pagination color="#38598A" v-model="pageNumber" :length="studentHistoryResp.totalPages"></v-pagination>
          </v-col>
          <v-col cols="4" id="currentItemsDisplay">
            Showing {{ showingFirstNumber }} to {{ showingEndNumber }} of {{ studentHistoryResp.totalElements || 0 }}
          </v-col>
        </v-row>
      </v-col>
      <v-col v-if="listDetailMode">
        <StudentAuditHistoryDetail
            :studentHistory="studentHistoryResp"
            :studentHistoryId="selectedStudentHistoryId"
            @close="listDetailMode=false"
            :is-reverting-student="isRevertingStudent"
            @revert="revertStudentToSelectedHistoryRecord"
            @update="updateSelectedStudentHistoryId">
        </StudentAuditHistoryDetail>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import {mapActions, mapGetters} from 'vuex';
import {Routes} from '@/utils/constants';
import AlertMessage from '../../util/AlertMessage';
import StudentAuditHistoryDetail from '../student/StudentAuditHistoryDetailPanel';
import ApiService from '../../../common/apiService';
import alertMixin from '../../../mixins/alertMixin';
import {formatDob, formatPen, formatPostalCode} from '@/utils/format';
import {groupBy, mapValues} from 'lodash';

export default {
  name: 'StudentAuditHistory',
  mixins: [alertMixin],
  props: {
    student: {
      type: Object,
      required: true
    }
  },
  components: {
    AlertMessage,
    StudentAuditHistoryDetail,
  },
  data() {
    return {
      itemsPerPage: 10,
      headers: [
        {text: 'Date', sortable: false, value: 'createDate'},
        {text: 'Changed by', sortable: false, value: 'createUser'},
        {text: 'Activity', sortable: false, value: 'historyActivityLabel'},
        {text: 'Mincode', sortable: false, value: 'mincode'},
        {text: 'Local ID', sortable: false, value: 'localID'},
        {text: 'Birth Date', sortable: false, value: 'dob'},
        {text: 'Gen', sortable: false, value: 'genderCode'},
        {text: 'Legal Name', sortable: false, value: 'legalName'},
        {text: 'Postal', sortable: false, value: 'postalCode'},
        {text: 'DC', sortable: false, value: 'demogCode'},
      ],
      shortHeaders: [
        {text: 'Date', sortable: false, value: 'createDate'},
        {text: 'Changed by', sortable: false, value: 'createUser'},
        {text: 'Activity', sortable: false, value: 'historyActivityLabel'},
        {text: 'Mincode', sortable: false, value: 'mincode'},
        {text: 'Local ID', sortable: false, value: 'localID'},
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
    };
  },
  computed: {
    ...mapGetters('student', ['historyActivityCodes']),
    showingFirstNumber() {
      return ((this.pageNumber - 1) * (this.studentHistoryResp.pageable.pageSize || 0) + ((this.studentHistoryResp.numberOfElements || 0) > 0 ? 1 : 0));
    },
    showingEndNumber() {
      return ((this.pageNumber - 1) * (this.studentHistoryResp.pageable.pageSize || 0) + (this.studentHistoryResp.numberOfElements || 0));
    },
  },
  mounted() {
    if (!this.historyActivityCodes) {
      this.getHistoryActivityCodes();
    }
    this.retrieveStudentHistory();
    this.listDetailMode = false;
  },
  watch: {
    pageNumber: {
      handler() {
        this.retrieveStudentHistory();
      }
    },
  },
  methods: {
    ...mapActions('student', ['getHistoryActivityCodes']),
    formatPen,
    selectItem(props) {
      this.updateSelectedStudentHistoryId(props.item.studentHistoryID);
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
      history.dob && (history.dob = formatDob(history.dob, 'uuuu-MM-dd'));
      history.createTime = history.createDate;
      history.createDate && (history.createDate = formatDob(history.createDate.substring(0, 10), 'uuuu-MM-dd'));
      history.postalCode && (history.postalCode = formatPostalCode(history.postalCode));
      history.legalName = this.getStudentName(history);
      history.historyActivityLabel = this.historyActivityCodes.find(activity => activity.historyActivityCode === history.historyActivityCode)?.label || history.historyActivityCode;
      history.expandable = false;
      history.expanded = false;
      history.hideable = false;
      history.hidden = false;
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
      ApiService.apiAxios
          .put(Routes['student'].ROOT_ENDPOINT + '/' + selectedHistoryRecord.studentID, this.convertFromHistoryToStudent(selectedHistoryRecord))
          .then(() => {
            this.setSuccessAlert('Success! The student details have been reverted.');
            this.listDetailMode = false;
            if (this.pageNumber === 1) {
              this.retrieveStudentHistory();
            } else {
              this.pageNumber = 1; // there is a watch so vue will reload the data table from server.
            }
            this.$emit('refresh');
          })
          .catch(error => {
            console.error(error);
            this.setFailureAlert('Error! The student details could not be reverted, Please try again later.');
          })
          .finally(() => {
            this.isRevertingStudent = false;
            window.scroll({
              top: 0,
              left: 0,
              behavior: 'smooth',
            });
          });


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
    }
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

#auditHistory /deep/ .v-pagination__navigation > i {
  padding-left: 0;
}

#dataTable /deep/ table {
  border-spacing: 0 0.25rem;
  border-top: thin solid #d7d7d7;
  border-bottom: thin solid #d7d7d7;
}

#dataTable /deep/ table th {
  font-size: 0.875rem;
}

#dataTable /deep/ table tr.selected-record,
#dataTable /deep/ table tbody tr:hover {
  background-color: #E1F5FE !important;
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
</style>
