<template>
  <div id="file-list" class="px-3" style="width: 100%" :overlay="false">
    <v-data-table
      id="dataTable"
      :class="[{'filterable-table': hasFilterHeader}, 'batch-file-table']"
      :headers="headers"
      :items="penRequestBatchResponse.content"
      :page.sync="pageNumber"
      :items-per-page="penRequestBatchResponse.pageable.pageSize"
      hide-default-footer
      item-key="penRequestBatchID"
      :loading="loadingTable"
      @page-count="penRequestBatchResponse.pageable.pageNumber = $event"
    >
      <template v-for="h in headers" v-slot:[`header.${h.value}`]="{ header }">
        <v-checkbox 
          v-if="header.type === 'select'" 
          :key="h.id" 
          :class="['file-checkbox', {'header-checkbox': hasFilterHeader}]" 
          color="#606060"
          v-model="allSelected" 
          :indeterminate="partialSelected" 
          @change="selectAllFiles"
        ></v-checkbox>
        <span v-else :key="h.id" :class="{'file-column' : !header.countable}" :title="header.tooltip">
          {{ header.text }}
        </span>
        <template v-if="hasFilterHeader">
          <br :key="h.id" />
          <span :key="h.id" :class="header.countable ? 'countable-column-header' : 'file-column'">
            <v-checkbox 
              v-if="header.filterName" 
              class="file-checkbox filter-checkbox" 
              color="#606060"
              v-model="header.isFiltered" 
              @change="selectFilter(header)"
            ></v-checkbox>
          </span>
        </template>
      </template>
      <template v-slot:item="props">
        <tr :class="tableRowClass(props.item)"
          @click="selectItem(props.item)"
          @mouseover="enableActions(props.item)"
          @mouseleave="disableActions(props.item)"
        >
          <td v-for="header in props.headers" :key="header.id" :class="{[header.value]: true, 'select-column': header.type}">
            <div v-if="header.type === 'select'">
              <v-row no-gutters>
                <v-checkbox
                  class="file-checkbox"
                  color="#606060"
                  v-model="props.item.isSelected"
                  :disabled="props.item.sagaInProgress"
                  @click.stop="handleFileCheckBoxClicked(props.item)"
                ></v-checkbox>
                <v-tooltip bottom v-if="props.item.sagaInProgress">
                  <template v-slot:activator="{ on, attrs }">
                    <v-icon
                      color="warning"
                      dark
                      v-bind="attrs"
                      v-on="on"
                      class="pl-2"
                    >
                      info
                    </v-icon>
                  </template>
                  <span>This batch is currently being updated and cannot be actioned. Please try again later.</span>
                </v-tooltip>
              </v-row>
            </div>
            <div v-else :class="{'countable-column-div': header.countable}">
              <span v-if="header.countable" class="countable-column-data">{{ props.item[header.value] || '' }}</span>
              <span v-else-if="header.value==='submissionNumber'">
                <a class="submission" @click.stop="handleSubmissionNumberClicked(props.item[header.value])">{{props.item[header.value] }}</a>
              </span>
              <PrimaryButton v-else-if="header.value === 'actions'" 
                :id="hoveredOveredRowBatchID === props.item.penRequestBatchID ? 'more-info-action': ''"
                :class="{'file-action': hoveredOveredRowBatchID != props.item.penRequestBatchID}"
                short 
                text="More Info"
                :disabled="props.item.sagaInProgress"
                @click.native="clickMoreInfo"
              ></PrimaryButton>
              <span v-else>{{formatTableColumn(header.format, props.item[header.value]) }}</span>
              <v-tooltip v-if="header.value==='mincode' && isUnarchived(props.item)" right>
                <template v-slot:activator="{ on }">
                  <v-icon small color="#2E8540" v-on="on" class="ml-1">
                    {{isUnarchivedBatchChanged(props.item) ? 'fa-sync-alt' : 'fa-unlock'}}
                  </v-icon>
                </template>
                <span>{{getUpdateUser(props.item)}}</span>
              </v-tooltip>
              <v-tooltip v-if="header.value==='mincode' && isRearchived(props.item)" right>
                <template v-slot:activator="{ on }">
                  <v-icon color="#2E8540" v-on="on" class="ml-1">
                    {{'preview'}}
                  </v-icon>
                </template>
                <span>{{getUpdateUser(props.item)}}</span>
              </v-tooltip>
            </div>
          </td>
        </tr>
      </template>
    </v-data-table>
    <Pagination
      v-model="pageNumber"
      :dataResponse="penRequestBatchResponse"
      :pageCommands="pageCommands"
    />
    <PenRequestBatchHistoryModal
      v-if="historyModalOpen"
      v-model="historyModalOpen"
      :batchFile="hoveredOveredRow"
    />
  </div>
</template>

<script>
import {uniqBy} from 'lodash';
import router from '../../../router';
import Pagination from '@/components/util/Pagination';
import {PEN_REQ_BATCH_STATUS_CODES} from '@/utils/constants';
import PrimaryButton from '@/components/util/PrimaryButton';
import PenRequestBatchHistoryModal from './PenRequestBatchHistoryModal';
import {mapState} from 'vuex';

export default {
  name: 'PenRequestBatchDataTable',
  components: {
    Pagination,
    PrimaryButton,
    PenRequestBatchHistoryModal
  },
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
  data () {
    return {
      allSelected: false,
      partialSelected: false,
      hoveredOveredRowBatchID: null,
      historyModalOpen: false,
      hoveredOveredRow: null
    };
  },
  computed: {
    ...mapState('notifications', ['notification']),
    pageNumber: {
      get(){
        return this.batchPageNumber;
      },
      set(newPage){
        return this.$emit('update:batchPageNumber', newPage);
      }
    },
    hasFilterHeader() {
      return this.headers.some(header => header.filterName);
    },
    penRequestBatchStore() {
      return this.archived ? 'archivedRequestBatch' : 'penRequestBatch';
    },
    selectedFiles() {
      return this.$store.state[this.penRequestBatchStore].selectedFiles;
    }
  },
  watch: {
    loadingTable: {
      handler(v) {
        if(!v) {
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
      if (notificationData.sagaName === 'PEN_REQUEST_BATCH_ARCHIVE_AND_RETURN_SAGA') {
        this.inProgressSagaIDs.forEach(sagaObjects => {
          if(sagaObjects.sagaID === notificationData.sagaId && notificationData.sagaStatus === 'COMPLETED') {
            this.$emit('sagaCompleted', `Archive and Return completed for Batch Submission Number ${this.penRequestBatchResponse.content.find(x => x.penRequestBatchID === notificationData.penRequestBatchID).submissionNumber}`);
          }
        });
      }
      this.penRequestBatchResponse.content.forEach((x, index) => {
        const pageHasObjectsRunningSagas = x.penRequestBatchID === notificationData.penRequestBatchID || x.penRequestBatchID === JSON.parse(notificationData?.eventPayload)?.penRequestBatchID;
        if(pageHasObjectsRunningSagas && notificationData.sagaStatus === 'INITIATED') {
          x.sagaInProgress = true;
          this.selectItem(x);
        } else if(pageHasObjectsRunningSagas && notificationData.sagaStatus === 'COMPLETED') {
          this.penRequestBatchResponse.content.splice(index, 1);
        }
      });
    },
  },
  methods: {
    formatTableColumn(format, column) {
      return (format && column) ? format(column) : (column || ' ');
    },
    tableRowClass(item) {
      let rowClass = [item.firstActiveFile ? 'first-active-file' : 'batch-file'];
      item.isSelected && rowClass.push('selected-file');
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
      this.selectFile(item);
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
      this.$store.commit(`${this.penRequestBatchStore}/setSelectedFiles`, newSelectedFiles);
    },
    selectItem(item) {
      if(!item.sagaInProgress) {
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
        newSelectedFiles = [ ...this.selectedFiles];
        unselectedFilesFromCurrentData.forEach(file => {
          newSelectedFiles = newSelectedFiles.filter(item => item.submissionNumber !== file.submissionNumber);
        });
      }
      this.$store.commit(`${this.penRequestBatchStore}/setSelectedFiles`, newSelectedFiles);
    },
    selectFilter(header) {
      this.$emit('select-filter', header);
    },
    handleSubmissionNumberClicked(submissionNumber) {
      const batchID = this.penRequestBatchResponse.content.find(file => file.submissionNumber === submissionNumber)?.penRequestBatchID;
      const name = this.archived ? 'archivedPrbStudentList' : 'prbStudentList';
      const route = router.resolve({name, query: { batchIDs: batchID, statusFilters: '' }});
      window.open(route.href, '_blank');
    },
    enableActions(item) {
      this.hoveredOveredRowBatchID = item.penRequestBatchID;
    },
    disableActions() {
      this.hoveredOveredRowBatchID = null;
    },
    clickMoreInfo(event) {
      event.stopPropagation();
      this.historyModalOpen = true;
      this.hoveredOveredRow = this.penRequestBatchResponse.content.find(batch => batch.penRequestBatchID === this.hoveredOveredRowBatchID);
    }
  }
};
</script>

<style scoped src="@/assets/styles/batchFileDataTable.css"></style>
<style scoped>
  .submission {
    text-decoration: underline;
  }

  .file-action {
    visibility: hidden;
  }
</style>
