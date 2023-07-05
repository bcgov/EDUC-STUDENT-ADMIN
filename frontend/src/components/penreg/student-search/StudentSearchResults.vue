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
      <v-col/>
      <v-col class="d-flex justify-end">
        <CompareDemographicModal
          v-model:selected-records="selectedRecords"
          :disabled="selectedRecords.length<2 || selectedRecords.length>3 || !EDIT_STUDENT_RECORDS_ROLE"
        />
      </v-col>
    </v-row>
    <v-data-table-server
      id="dataTable"
      :items-per-page="itemsPerPage"
      :page="pageNumber"
      :items="studentSearchResponse.content"
      :items-length="studentSearchResponse.totalElements"
      :headers="headers"
      hide-default-footer
      :header-props="{ sortIcon: null }"
      item-key="studentID"
      :loading="searchLoading || loading"
      @update:options="loadItems"
    >
      <template
        v-for="h in headers"
        :key="h.id"
        #[`column.${h.key}`]="{ column }"
      >
        <v-row
          no-gutters
        >
          <v-col>
            <span
              class="header-font"
              :title="column.topTooltip"
              @click="updateSortParams(column.topValue)"
            >
              {{ column.topText }}
            </span>
            <span
              @click="updateSortParams(column.topValue)"
            >
              <em
                v-if="column.sortable && headerSortParams.currentSort === column.topValue"
                :class="['sort-header mt-1 pl-2 v-icon mdi active', headerSortParams.currentSortAsc ? 'mdi-sort-ascending' : 'mdi-sort-descending']"
              />
            </span>
          </v-col>
          <v-col v-if="column.doubleTooltip">
            <span
              class="double-column-item header-font"
              style="margin-top: 0.4em;"
              :title="column.doubleTooltip"
              @click="updateSortParams(column.topValue)"
            >{{ column.doubleText }}</span>
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <span
              class="header-font"
              :title="column.bottomTooltip"
              @click="updateSortParams(column.topValue)"
            >{{ column.bottomText }}</span>
          </v-col>
        </v-row>
      </template>
      <template #item="item">
        <tr>
          <td
            v-for="header in headers"
            :key="header.id"
            :class="{'table-checkbox' :header.id, 'row-hightlight': isMergedOrDeceased(item.item) }"
          >
            <div v-if="header.key === 'checkbox'">
              <v-checkbox
                :value="item.item.raw.isSelected"
                color="#606060"
                @update:model-value="selectStudent(item.item.raw)"
              />
            </div>
            <div
              v-else
              class="tableCell"
              @click="viewStudentDetails(item.item.raw.studentID)"
            >
              <span
                v-if="header.topValue === 'dob'"
                class="top-column-item"
              >{{
                  formatDob(item.item.raw[header.topValue], 'uuuu-MM-dd', 'uuuu/MM/dd')
                }}</span>
              <span
                v-else-if="header.topValue === 'pen'"
                class="top-column-item"
              >
                {{ item.item.raw[header.topValue] }}
                <ClipboardButton
                  v-if="item.item.raw[header.topValue]"
                  size="x-small"
                  :copy-text="item.item.raw[header.topValue]"
                  icon="mdi-content-copy"
                />
              </span>
              <span
                v-else
                class="top-column-item"
              >{{ item.item.raw[header.topValue] }}</span>
              <span class="double-column-item">{{ item.item.raw[header.doubleValue] }}</span>
              <br>
              <!-- if top and bottom value are the same, do not display the bottom value -->
              <v-tooltip
                v-if="header.bottomValue === 'memo'"
                bottom
              >
                <template #activator="{ on }">
                  <span class="bottom-column-item">{{
                      firstMemoChars(item.item.raw[header.bottomValue])
                    }}</span>
                </template>
                <span>{{ item.item.raw[header.bottomValue] }}</span>
              </v-tooltip>
              <span
                v-else-if="['usualLastName','usualFirstName','usualMiddleNames'].includes(header.bottomValue)"
                class="bottom-column-item"
              >{{ getUsualName(item.item.raw[header.bottomValue], item.item.raw[header.topValue]) }}</span>
              <span
                v-else
                class="bottom-column-item"
              >{{ item.item.raw[header.bottomValue] }}</span>
            </div>
          </td>
        </tr>
      </template>
    </v-data-table-server>
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
  data() {
    return {
      pageCount: 0,
      itemsPerPage: 10,
      loading: false,
      headers: [
        {
          topText: '',
          align: 'start',
          key: 'checkbox'
        },
        {
          topText: 'PEN',
          align: 'start',
          sortable: true,
          topValue: 'pen',
          topTooltip: 'Personal Education Number',
          key: 'pen'
        },
        {
          topText: 'Legal Surname',
          bottomText: 'Usual Surname',
          topValue: 'legalLastName',
          bottomValue: 'usualLastName',
          sortable: true,
          topTooltip: 'Legal Surname',
          bottomTooltip: 'Usual Surname',
          key: 'legalLastName'
        },
        {
          topText: 'Legal Given',
          bottomText: 'Usual Given',
          topValue: 'legalFirstName',
          bottomValue: 'usualFirstName',
          sortable: true,
          topTooltip: 'Legal Given',
          bottomTooltip: 'Usual Given',
          key: 'legalFirstName'
        },
        {
          topText: 'Legal Middle',
          bottomText: 'Usual Middle',
          topValue: 'legalMiddleNames',
          bottomValue: 'usualMiddleNames',
          sortable: true,
          topTooltip: 'Legal Middle',
          bottomTooltip: 'Usual Middle',
          key: 'legalMiddleNames'
        },
        {
          topText: 'Postal Code',
          bottomText: 'Memo',
          topValue: 'postalCode',
          bottomValue: 'memo',
          sortable: false,
          topTooltip: 'Postal Code',
          bottomTooltip: 'Memo',
          key: 'postalCode'
        },
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
          bottomTooltip: 'Local ID',
          key: 'genderCode'
        },
        {
          topText: 'Birth Date',
          bottomText: 'Grade',
          topValue: 'dob',
          bottomValue: 'gradeCode',
          sortable: true,
          topTooltip: 'Birth Date',
          bottomTooltip: 'Grade',
          key: 'dob'
        },
        {
          topText: 'Mincode',
          topValue: 'mincode',
          sortable: true,
          topTooltip: 'Mincode',
          key: 'mincode'
        },
      ],
    };
  },
  watch: {
    pageNumber: {
      handler() {
        if (!this.searchLoading) {
          this.pagination();
        }
      }
    },
    itemsPerPage: {
      handler() {
        if (!this.searchLoading) {
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
        return this.studentSearchResponse.content.filter(student => student.isSelected);
      },
      set(newRecord) {
        return studentSearchStore().setSelectedRecords(newRecord);
      }
    },
    showingFirstNumber() {
      return ((this.pageNumber - 1) * (this.studentSearchResponse.pageable.pageSize || 0) + ((this.studentSearchResponse.numberOfElements || 0) > 0 ? 1 : 0));
    },
    showingEndNumber() {
      return ((this.pageNumber - 1) * (this.studentSearchResponse.pageable.pageSize || 0) + (this.studentSearchResponse.numberOfElements || 0));
    }
  },
  methods: {
    ...mapActions(studentSearchStore, ['updateSortParams', 'setStudentSearchResponse']),
    viewStudentDetails(studentID) {
      const route = router.resolve({name: REQUEST_TYPES.student.label, params: {studentID: studentID}});
      window.open(route.href, '_blank');
    },
    formatDob,
    firstMemoChars(memo) {
      if (memo) {
        return memo.substring(0, 25);
      }
    },
    getUsualName(usual, legal) {
      if (usual === legal) {
        return '';
      }
      return usual;
    },
    loadItems({page}) {
      this.pageNumber = page;
    },
    selectStudent(student){
      student.isSelected = !student.isSelect;
    },
    pagination() {
      this.loading = true;
      ApiService.apiAxios
        .get(Routes.student.SEARCH_URL, this.prepPut(this.searchCriteria))
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
    font-size: 0.9em;
}

.top-column-item {
    float: left;
    font-size: 0.9em;
}

.header-font {
    font-size: 0.75em;
    font-weight: bold;
}

.bottom-column-item {
    float: left;
    min-height: 1.5em;
    font-size: 0.9em;
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

:deep(.v-data-table-footer__items-per-page) {
    display: none;
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
