<template>
  <div
    id="searchResults"
    class="px-3"
    style="width: 100%"
    :overlay="false"
  >
    <v-row
      v-if="showCompare"
      no-gutters
    >
      <v-col>
        <span
          id="numberResults"
          class="px-4 pb-2"
        >{{ studentSearchResponse.totalElements }} Results</span>
      </v-col>
      <v-col />
      <v-col>
        <CompareDemographicModal
          v-model:selected-records="selectedRecords"
          :disabled="selectedRecords.length<2 || selectedRecords.length>3 || !EDIT_STUDENT_RECORDS_ROLE"
        />
      </v-col>
    </v-row>
    <v-data-table
      id="dataTable"
      v-model="selectedRecords"
      v-model:page="pageNumber"
      :headers="headers"
      :items="studentSearchResponse.content"
      :items-per-page="studentSearchResponse.pageable.pageSize"
      hide-default-footer
      :header-props="{ sortIcon: null }"
      item-key="studentID"
      :loading="searchLoading || loading"
      @page-count="studentSearchResponse.pageable.pageNumber = $event"
    >
      <template
        v-for="h in headers"
        :key="h.id"
        #[`header.${h.value}`]="{ header }"
      >
        <span
          class="top-column-item"
          :title="header.topTooltip"
          @click="updateSortParams(header.topValue)"
        >
          {{ header.topText }}
        </span>
        <span
          @click="updateSortParams(header.topValue)"
        >
          <em
            v-if="header.sortable && headerSortParams.currentSort === header.topValue"
            :class="['sort-header mt-1 pl-2 v-icon fas active', headerSortParams.currentSortAsc ? 'fa-sort-up' : 'fa-sort-down']"
          />
        </span>
        <span
          class="double-column-item"
          :title="header.doubleTooltip"
          @click="updateSortParams(header.topValue)"
        >{{ header.doubleText }}</span>
        <br>
        <span
          class="bottom-column-item"
          :title="header.bottomTooltip"
          @click="updateSortParams(header.topValue)"
        >{{ header.bottomText }}</span>
      </template>
      <template #item="props">
        <tr>
          <td
            v-for="header in props.headers"
            :key="header.id"
            :class="{'table-checkbox' :header.id, 'row-hightlight': isMergedOrDeceased(props.item) }"
          >
            <v-checkbox
              v-if="header.type"
              :input-value="props.isSelected"
              color="#606060"
              @update:model-value="props.select($event)"
            />
            <div
              v-else
              class="tableCell"
              @click="viewStudentDetails(props.item.studentID)"
            >
              <span
                v-if="header.topValue === 'dob'"
                class="top-column-item"
              >{{
                formatDob(props.item[header.topValue], 'uuuu-MM-dd', 'uuuu/MM/dd')
              }}</span>
              <span
                v-else-if="header.topValue === 'pen'"
                class="top-column-item"
              >
                {{ props.item[header.topValue] }}
                <ClipboardButton
                  v-if="props.item[header.topValue]"
                  :copy-text="props.item[header.topValue]"
                  icon="$copy"
                />
              </span>
              <span
                v-else
                class="top-column-item"
              >{{ props.item[header.topValue] }}</span>
              <span class="double-column-item">{{ props.item[header.doubleValue] }}</span>
              <br>
              <!-- if top and bottom value are the same, do not display the bottom value -->
              <v-tooltip
                v-if="header.bottomValue === 'memo'"
                bottom
              >
                <template #activator="{ on }">
                  <span class="bottom-column-item">{{
                    firstMemoChars(props.item[header.bottomValue])
                  }}</span>
                </template>
                <span>{{ props.item[header.bottomValue] }}</span>
              </v-tooltip>
              <span
                v-else-if="['usualLastName','usualFirstName','usualMiddleNames'].includes(header.bottomValue)"
                class="bottom-column-item"
              >{{ getUsualName(props.item[header.bottomValue], props.item[header.topValue] ) }}</span>
              <span
                v-else
                class="bottom-column-item"
              >{{ props.item[header.bottomValue] }}</span>
            </div>
          </td>
        </tr>
      </template>
    </v-data-table>
    <v-row
      class="pt-2"
      justify="end"
    >
      <v-col
        v-if="!showCompare"
        cols="4"
      >
        <span id="numberResultsSecond">{{ studentSearchResponse.totalElements }} Results</span>
      </v-col>
      <v-col cols="4">
        <v-pagination
          v-model="pageNumber"
          color="#38598A"
          :length="studentSearchResponse.totalPages"
        />
      </v-col>
      <v-col
        id="currentItemsDisplay"
        cols="4"
      >
        Showing {{ showingFirstNumber }} to {{ showingEndNumber }} of {{ studentSearchResponse.totalElements || 0 }}
      </v-col>
    </v-row>
  </div>
</template>

<script>
import {formatDob} from '@/utils/format';
import {mapActions, mapState} from 'pinia';
import ApiService from '@/common/apiService';
import {REQUEST_TYPES, Routes, STUDENT_CODES} from '@/utils/constants';
import router from '@/router';
import CompareDemographicModal from '../../common/CompareDemographicModal.vue';
import ClipboardButton from '../../util/ClipboardButton.vue';
import alertMixin from '@/mixins/alertMixin';
import staleStudentRecordMixin from '@/mixins/staleStudentRecordMixin';
import {authStore} from '@/store/modules/auth';
import {notificationsStore} from '@/store/modules/notifications';
import {studentSearchStore} from '@/store/modules/studentSearch';

export default {
  name: 'SearchResults',
  components: {CompareDemographicModal, ClipboardButton},
  mixins: [alertMixin, staleStudentRecordMixin],
  props: {
    searchCriteria: {
      type: Object,
      required: true
    },
    prepPut: {
      type: Function,
      required: true
    },
    showCompare: {
      type: Boolean,
      required: false,
      default: true
    },
    searchLoading: {
      type: Boolean,
      required: true
    }
  },
  data () {
    return {
      pageCount: 0,
      itemsPerPage: 10,
      loading: false,
      headers: [
        {id: 'table-checkbox', type: 'select', sortable: false},
        {topText: 'PEN', align: 'start', sortable: true, topValue: 'pen', topTooltip: 'Personal Education Number'},
        {
          topText: 'Legal Surname',
          bottomText: 'Usual Surname',
          topValue: 'legalLastName',
          bottomValue: 'usualLastName',
          sortable: true,
          topTooltip: 'Legal Surname',
          bottomTooltip: 'Usual Surname'
        },
        {
          topText: 'Legal Given',
          bottomText: 'Usual Given',
          topValue: 'legalFirstName',
          bottomValue: 'usualFirstName',
          sortable: true,
          topTooltip: 'Legal Given',
          bottomTooltip: 'Usual Given'
        },
        {
          topText: 'Legal Middle',
          bottomText: 'Usual Middle',
          topValue: 'legalMiddleNames',
          bottomValue: 'usualMiddleNames',
          sortable: true,
          topTooltip: 'Legal Middle',
          bottomTooltip: 'Usual Middle'
        },
        {topText: 'Postal Code', bottomText: 'Memo', topValue: 'postalCode', bottomValue: 'memo', sortable: false, topTooltip: 'Postal Code', bottomTooltip: 'Memo'},
        {
          topText: 'DC',
          doubleText: 'Gen',
          bottomText: 'Local ID',
          topValue: 'demogCode',
          doubleValue: 'genderCode',
          bottomValue: 'localID',
          sortable: false,
          topTooltip: 'Demographic Code',
          doubleTooltip: 'Gender',
          bottomTooltip: 'Local ID'
        },
        {
          topText: 'Birth Date',
          bottomText: 'Grade',
          topValue: 'dob',
          bottomValue: 'gradeCode',
          sortable: true,
          topTooltip: 'Birth Date',
          bottomTooltip: 'Grade'
        },
        {
          topText: 'Mincode',
          topValue: 'mincode',
          sortable: true,
          topTooltip: 'Mincode'
        },
      ],
    };
  },
  watch: {
    pageNumber: {
      handler() {
        if(!this.searchLoading) {
          this.pagination();
        }
      }
    },
    headerSortParams: {
      handler() {
        this.pagination();
      },
      deep: true
    },
    studentSearchResponse: {
      async handler() {
        await this.$nextTick();
        this.isStudentDataUpdated = false;
        this.clearStaleData();
      }
    },
    notification(val) {
      let notificationData = val;
      if (notificationData.eventType === 'UPDATE_STUDENT' && notificationData.eventOutcome === 'STUDENT_UPDATED' && notificationData.eventPayload) {
        const student = JSON.parse(notificationData.eventPayload);
        const isUpdatedStudentPresent = this.studentSearchResponse.content.some(el => el.studentID === student?.studentID);
        if (isUpdatedStudentPresent) {
          const warningMessage = `Student details for ${student.pen}, is updated by ${student.updateUser}. Please do a search again`;
          this.setWarningAlert(warningMessage);
          const studentID = student.studentID;
          this.addStaleDataToMap({studentID, warningMessage});
        }
      }
    },
  },
  mounted() {
    this.clearStaleData();
    if(!this.showCompare){
      this.headers.splice(0,1);
    }
  },
  computed: {
    ...mapState(studentSearchStore, ['headerSortParams', 'studentSearchResponse', 'useNameVariants', 'isAuditHistorySearch', 'statusCode']),
    ...mapState(notificationsStore, ['notification']),
    ...mapState(authStore, ['EDIT_STUDENT_RECORDS_ROLE']),
    pageNumber: {
      get() {
        return studentSearchStore().pageNumber;
      },
      set(newPage) {
        return studentSearchStore().setPageNumber(newPage);
      }
    },
    selectedRecords: {
      get() {
        return studentSearchStore().selectedRecords;
      },
      set(newRecord){
        return studentSearchStore().setSelectedRecords(newRecord);
      }
    },
    showingFirstNumber() {
      return ((this.pageNumber-1) * (this.studentSearchResponse.pageable.pageSize || 0) + ((this.studentSearchResponse.numberOfElements || 0) > 0 ? 1 : 0));
    },
    showingEndNumber() {
      return ((this.pageNumber-1) * (this.studentSearchResponse.pageable.pageSize || 0) + (this.studentSearchResponse.numberOfElements || 0));
    }
  },
  methods: {
    ...mapActions(studentSearchStore, ['updateSortParams', 'setStudentSearchResponse']),
    viewStudentDetails(studentID) {
      const route = router.resolve({ name: REQUEST_TYPES.student.label, params: {studentID: studentID}});
      window.open(route.href, '_blank');
    },
    formatDob,
    firstMemoChars(memo) {
      if(memo){
        return memo.substring(0,25);
      }
    },
    getUsualName(usual, legal) {
      if(usual === legal){
        return '';
      }
      return usual;
    },
    pagination() {
      this.loading = true;
      ApiService.apiAxios
        .get(Routes.student.SEARCH_URL,this.prepPut(this.searchCriteria))
        .then(response => {
          this.setStudentSearchResponse(response.data);
          this.isStudentDataUpdated = false;
        })
        .catch(error => {
          this.setFailureAlert('An error occurred while loading the search results. Please try again later.');
          console.log(error);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    isMergedOrDeceased(student) {
      return [STUDENT_CODES.MERGED, STUDENT_CODES.DECEASED].some(status => status === student.statusCode);
    },
  }
};
</script>

<style scoped>
  #currentItemsDisplay {
    text-align: right;
    font-size: 0.875rem;
  }
  .sort-header {
    opacity: 1;
    position: absolute;
    cursor: pointer;
    color: #1A5A96;
  }
  .double-column-item {
    float: right;
  }
  .top-column-item {
    float: left;
  }
  .bottom-column-item {
    float: left;
    min-height: 1.5em;
  }
  .table-checkbox {
    margin-top: 0;
    padding-top: 0;
  }
  .table-checkbox /deep/ .v-input__slot {
    padding-top: 0;
  }
  .tableCell {
    cursor: pointer;
  }

  #searchResults /deep/ .v-pagination__navigation > i {
    padding-left: 0;
  }

  .row-hightlight {
    background-color: rgba(0, 0, 0, 0.06);
    color: #1A5A96;
    font-weight: bold;
  }
</style>
