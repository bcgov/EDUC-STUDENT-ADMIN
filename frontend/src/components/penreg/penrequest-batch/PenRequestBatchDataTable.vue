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
          v-if="header.type" 
          :key="h.id" 
          :class="['file-checkbox', {'header-checkbox': hasFilterHeader}]" 
          color="#606060"
          v-model="allSelected" 
          :indeterminate="partialSelected" 
          @change="selectAllFiles"
        ></v-checkbox>
        <span v-else :key="h.id" :class="{'file-column' : !header.countable}">
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
        <tr :class="tableRowClass(props.item)" @click="selectItem(props.item)">
          <td v-for="header in props.headers" :key="header.id" :class="{[header.value]: true, 'select-column': header.type}">
            <v-checkbox v-if="header.type" class="file-checkbox" color="#606060" v-model="props.item.isSelected" @click.stop="handleFileCheckBoxClicked(props.item)"></v-checkbox>
            <div v-else :class="{'countable-column-div': header.countable}">
              <span v-if="header.countable" class="countable-column-data">{{ props.item[header.value] || '' }}</span>
              <span v-else-if="header.value==='submissionNumber'"><a class="submission" @click.stop="handleSubmissionNumberClicked(props.item[header.value])">{{props.item[header.value] }}</a></span>
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
  </div>
</template>

<script>
import {uniqBy} from 'lodash';
import router from '../../../router';
import Pagination from '@/components/util/Pagination';
import {PEN_REQ_BATCH_STATUS_CODES} from '@/utils/constants';

export default {
  name: 'PenRequestBatchDataTable',
  components: {
    Pagination,
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
  },
  data () {
    return {
      allSelected: false,
      partialSelected: false,
    };
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
    }
  },
  computed: {
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
      item.isSelected = !item.isSelected;
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
  }
};
</script>

<style scoped src="@/assets/styles/batchFileDataTable.css"></style>
<style scoped>
  .submission {
    text-decoration: underline;
  }
</style>
