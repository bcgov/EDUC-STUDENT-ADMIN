<template>
  <div
    id="file-list"
    class="px-3"
    style="width: 100%"
    :overlay="false"
  >
    <v-data-table-server
      id="dataTable"
      v-model:page="currentPageNumber"
      :class="[{'filterable-table': hasFilterHeader}, 'batch-file-table']"
      :headers="headers"
      :items-length="penRequestBatchResponse.length > 0 ? penRequestBatchResponse.totalElements : 0"
      :items="penRequestBatchResponse.content"
      :items-per-page="penRequestBatchResponse.pageable.pageSize"
      item-key="penRequestBatchID"
      :loading="loadingTable"
    >
      <template
        v-for="h in headers"
        #[`column.${h.value}`]="{ column }"
      >
        <v-checkbox
          v-if="column.type === 'select'"
          :key="h.id"
          v-model="allSelected"
          :class="['file-checkbox', {'header-checkbox': hasFilterHeader}]"
          color="#606060"
          hide-details="auto"
          :indeterminate="partialSelected"
          @update:model-value="selectAllFiles"
        />
        <span
          v-else
          :key="h.id"
          :class="{'file-column' : !column.countable}"
          :title="column.tooltip"
        >
          {{ column.text }}
        </span>
        <v-row :key="h.id" v-if="hasFilterHeader">
          <v-col class="d-flex justify-center">
            <span
              :key="h.id"
              :class="column.countable ? 'countable-column-header' : 'file-column'"
            >
              <v-checkbox
                v-if="column.filterName"
                v-model="column.isFiltered"
                class="file-checkbox filter-checkbox"
                hide-details="auto"
                color="#606060"
                @update:model-value="selectFilter(column)"
              />
            </span>
          </v-col>
        </v-row>
      </template>
      <template #item="item">
        <tr
          :class="tableRowClass(item.item)"
          @click="selectItem(item.item)"
          @mouseover="enableActions(item.item)"
          @mouseleave="disableActions(item.item)"
        >
          <td
            v-for="header in item.columns"
            :key="header.id"
            :class="{[header.value]: true, 'select-column': header.type}"
          >
            <div v-if="header.type === 'select'">
              <v-row no-gutters>
                <v-checkbox
                  v-model="item.item.isSelected"
                  class="file-checkbox"
                  hide-details="auto"
                  color="#606060"
                  :disabled="item.item.sagaInProgress"
                  @click.stop="handleFileCheckBoxClicked(item.item)"
                />
                <v-tooltip
                  v-if="item.item.sagaInProgress"
                  bottom
                >
                  <template #activator="{ props }">
                    <v-icon
                      color="warning"
                      dark
                      v-bind="props"
                      class="pl-2"
                    >
                      info
                    </v-icon>
                  </template>
                  <span>This batch is currently being updated and cannot be actioned. Please try again later.</span>
                </v-tooltip>
              </v-row>
            </div>
            <div
              v-else
              :class="{'countable-column-div': header.countable}"
            >
              <span
                v-if="header.countable"
                class="countable-column-data"
              >{{ item.item[header.value] || '' }}</span>
              <span v-else-if="header.value==='submissionNumber'">
                <a
                  v-if="!item.item.sagaInProgress"
                  class="submission"
                  @click.stop="handleSubmissionNumberClicked(item.item[header.value])"
                >{{ item.item[header.value] }}</a>
                <span
                  v-else
                  class="submission"
                >{{ item.item[header.value] }}</span>
              </span>
              <PrimaryButton
                v-else-if="header.value === 'actions'"
                :id="hoveredOveredRowBatchID === item.item.penRequestBatchID ? 'more-info-action': ''"
                :class="{'file-action': hoveredOveredRowBatchID != item.item.penRequestBatchID}"
                short
                text="More Info"
                :disabled="item.item.sagaInProgress"
                @click-action="clickMoreInfo"
              />
              <span v-else>{{ formatTableColumn(header.format, item.item[header.value]) }}</span>
              <v-tooltip
                v-if="header.value==='mincode' && isUnarchived(item.item)"
                right
              >
                <template #activator="{ on }">
                  <v-icon
                    small
                    color="#2E8540"
                    class="ml-1"
                  >
                    {{ isUnarchivedBatchChanged(item.item) ? 'fa-sync-alt' : 'fa-unlock' }}
                  </v-icon>
                </template>
                <span>{{ getUpdateUser(item.item) }}</span>
              </v-tooltip>
              <v-tooltip
                v-if="header.value==='mincode' && isRearchived(item.item)"
                right
              >
                <template #activator="{ on }">
                  <v-icon
                    color="#2E8540"
                    class="ml-1"
                  >
                    {{ 'preview' }}
                  </v-icon>
                </template>
                <span>{{ getUpdateUser(item.item) }}</span>
              </v-tooltip>
            </div>
          </td>
        </tr>
      </template>
    </v-data-table-server>
    <Pagination
      v-model="pageNumber"
      :value="pageNumber"
      :data-response="penRequestBatchResponse"
      :page-commands="pageCommands"
      @page-change="pageChange"
    />
    <PenRequestBatchHistoryModal
      v-if="historyModalOpen"
      :value="historyModalOpen"
      :batch-file="hoveredOveredRow"
      @close-dialog="historyModalOpen = false"
    />
  </div>
</template>

<script>
import {uniqBy} from 'lodash';
import router from '../../../router';
import {PEN_REQ_BATCH_STATUS_CODES} from '@/utils/constants';
import PrimaryButton from '@/components/util/PrimaryButton.vue';
import PenRequestBatchHistoryModal from './PenRequestBatchHistoryModal.vue';
import {mapState} from 'pinia';
import alertMixin from '../../../mixins/alertMixin';
import {notificationsStore} from '@/store/modules/notifications';
import {penRequestBatchStore} from '@/store/modules/penRequestBatch';
import Pagination from '@/components/util/Pagination.vue';
import {archivedRequestBatchStore} from '@/store/modules/archivedRequestBatch';

export default {
  name: 'PenRequestBatchDataTable',
  emits: ['update:batchPageNumber','select-filter'],
  components: {
    PrimaryButton,
    Pagination,
    PenRequestBatchHistoryModal
  },
  mixins: [alertMixin],
  props: {
    headers: {
      type: Array,
      required: true
    },
    penRequestBatchResponse: {
      type: Object,
      required: true
    },
    batchPageNumber: {
      type: Number,
      required: true
    },
    loadingTable: {
      type: Boolean,
      required: true
    },
    archived: {
      type: Boolean,
      default: false
    },
    pageCommands: {
      type: Boolean,
      default: false
    },
    inProgressSagaIDs: {
      type: Array
    }
  },
  data() {
    return {
      allSelected: false,
      partialSelected: false,
      hoveredOveredRowBatchID: null,
      historyModalOpen: false,
      hoveredOveredRow: null,
      currentPageNumber: 1
    };
  },
  computed: {
    ...mapState(notificationsStore, ['notification']),
    pageNumber: {
      get() {
        return this.batchPageNumber;
      },
      set(newPage) {
        this.currentPageNumber = newPage;
        return this.$emit('update:batchPageNumber', newPage);
      }
    },
    hasFilterHeader() {
      return this.headers.some(header => header.filterName);
    },
    batchStore() {
      return this.archived ? archivedRequestBatchStore() : penRequestBatchStore();
    },
    selectedFiles() {
      return this.batchStore.selectedFiles;
    }
  },
  watch: {
    loadingTable: {
      handler(v) {
        if (!v) {
          const files = this.penRequestBatchResponse.content;
          this.allSelected = files?.length > 0 && files?.every(file => file.isSelected);
          this.partialSelected = files?.some(file => file.isSelected) && !this.allSelected;
        }
      }
    },
    notification(val) {
      if (!val) {
        return;
      }
      const notificationData = val;
      if (notificationData.sagaName === 'PEN_REQUEST_BATCH_ARCHIVE_AND_RETURN_SAGA' && this.inProgressSagaIDs) {
        this.inProgressSagaIDs.forEach(sagaObjects => {
          if (sagaObjects.sagaID === notificationData.sagaId && notificationData.sagaStatus === 'COMPLETED') {
            this.setSuccessAlert(`Archive and Return completed for Batch Submission Number ${this.penRequestBatchResponse.content.find(x => x.penRequestBatchID === notificationData.penRequestBatchID).submissionNumber}`);
          }
        });
      }
      this.penRequestBatchResponse.content.forEach((x, index) => {
        const pageHasObjectsRunningSagas = x.penRequestBatchID === notificationData.penRequestBatchID || (notificationData?.eventPayload && x.penRequestBatchID === JSON.parse(notificationData?.eventPayload)?.penRequestBatchID);
        if (pageHasObjectsRunningSagas && notificationData.sagaStatus === 'INITIATED' && notificationData.sagaName === 'PEN_REQUEST_BATCH_ARCHIVE_AND_RETURN_SAGA') {
          x.sagaInProgress = true;
          this.selectItem(x);
        } else if (pageHasObjectsRunningSagas && notificationData.sagaStatus === 'COMPLETED' && notificationData.sagaName === 'PEN_REQUEST_BATCH_ARCHIVE_AND_RETURN_SAGA') {
          this.penRequestBatchResponse.content.splice(index, 1);
        }
      });
    },
  },
  methods: {
    formatTableColumn(format, column) {
      return (format && column) ? format(column) : (column || ' ');
    },
    pageChange(newPage){
      this.pageNumber = newPage;
    },
    tableRowClass(item) {
      let rowClass = [item.firstActiveFile ? 'first-active-file' : 'batch-file'];
      (item.isSelected || item.viewMore) && rowClass.push('selected-file');
      return rowClass;
    },
    isUnarchived(item) {
      return item.penRequestBatchStatusCode === PEN_REQ_BATCH_STATUS_CODES.UNARCHIVED
        || item.penRequestBatchStatusCode === PEN_REQ_BATCH_STATUS_CODES.UNARCH_CHG;
    },
    isUnarchivedBatchChanged(item) {
      return item.penRequestBatchStatusCode === PEN_REQ_BATCH_STATUS_CODES.UNARCH_CHG;
    },
    isRearchived(item) {
      return item.penRequestBatchStatusCode === PEN_REQ_BATCH_STATUS_CODES.REARCHIVED;
    },
    getUpdateUser(item) {
      if (this.isUnarchived(item) || this.isRearchived(item)) {
        return item.updateUser;
      }
      return '';
    },
    handleFileCheckBoxClicked(item) {
      this.selectItem(item);
    },
    selectFile(item) {
      this.allSelected = this.penRequestBatchResponse.content.every(file => file.isSelected);
      this.partialSelected = (item.selected || this.penRequestBatchResponse.content.some(file => file.isSelected)) && !this.allSelected;
      let newSelectedFiles;

      if (item.isSelected) {
        const selectedFilesFromCurrentData = this.penRequestBatchResponse.content.filter(file => file.isSelected);
        newSelectedFiles = [...this.selectedFiles, ...selectedFilesFromCurrentData];
        newSelectedFiles = uniqBy(newSelectedFiles, a => a.submissionNumber);
      } else {
        newSelectedFiles = this.selectedFiles.filter(file => file.submissionNumber !== item.submissionNumber);
      }
      const auStore = this.batchStore;
      auStore.setSelectedFiles(newSelectedFiles);
    },
    selectItem(item) {
      if (!item.sagaInProgress) {
        item.isSelected = !item.isSelected;
      } else {
        item.isSelected = false;
      }
      this.selectFile(item);
    },
    selectAllFiles(selected) {
      this.penRequestBatchResponse.content.forEach(file => file.isSelected = selected);
      this.partialSelected = false;
      let newSelectedFiles;
      if (selected) {
        const selectedFilesFromCurrentData = this.penRequestBatchResponse.content.filter(file => file.isSelected);
        newSelectedFiles = [...this.selectedFiles, ...selectedFilesFromCurrentData];
        newSelectedFiles = uniqBy(newSelectedFiles, a => a.submissionNumber);
      } else {
        const unselectedFilesFromCurrentData = this.penRequestBatchResponse.content.filter(file => !file.isSelected);
        newSelectedFiles = [...this.selectedFiles];
        unselectedFilesFromCurrentData.forEach(file => {
          newSelectedFiles = newSelectedFiles.filter(item => item.submissionNumber !== file.submissionNumber);
        });
      }
      const auStore = this.batchStore;
      auStore.setSelectedFiles(newSelectedFiles);
    },
    selectFilter(header) {
      this.$emit('select-filter', header);
    },
    handleSubmissionNumberClicked(submissionNumber) {
      const batchID = this.penRequestBatchResponse.content.find(file => file.submissionNumber === submissionNumber)?.penRequestBatchID;
      const name = this.archived ? 'archivedPrbStudentList' : 'prbStudentList';
      const route = router.resolve({name, query: {batchIDs: batchID, statusFilters: ''}});
      window.open(route.href, '_blank');
    },
    enableActions(item) {
      this.hoveredOveredRow && (this.hoveredOveredRow.viewMore = false);
      this.hoveredOveredRowBatchID = item.penRequestBatchID;
    },
    disableActions() {
      this.hoveredOveredRowBatchID = null;
    },
    clickMoreInfo(event) {
      event.stopPropagation();
      this.historyModalOpen = true;
      this.hoveredOveredRow = this.penRequestBatchResponse.content.find(batch => batch.penRequestBatchID === this.hoveredOveredRowBatchID);
      this.hoveredOveredRow.viewMore = true;
    }
  }
};
</script>

<style scoped
       src="@/assets/styles/batchFileDataTable.css"
></style>
<style scoped>
.submission {
    text-decoration: underline;
}

.file-action {
    visibility: hidden;
}

:deep(.v-data-table-footer) {
    display: none;
}

:deep(.v-data-table__th) {
    font-size: 0.75em !important;
    font-weight: bold !important;
}

:deep(.batch-file) {
    font-size: 0.85em;
}

#dataTable /deep/ table th {
    font-size: 0.85rem;
}
</style>
