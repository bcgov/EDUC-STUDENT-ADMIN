<template>
  <div id="file-list" class="px-3" style="width: 100%" :overlay="false">
    <v-data-table
      id="dataTable"
      :class="{'filterable-table': hasFilterHeader}"
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
                  <v-icon small color="#2E8540" v-on="on">
                    {{isUnarchivedBatchChanged(props.item) ? 'fa-sync-alt' : 'fa-unlock'}}
                  </v-icon>
                </template>
              <span>{{props.item.unarchivedUser}}</span>
              </v-tooltip>
            </div>
          </td>
        </tr>
      </template>
    </v-data-table>
    <v-row class="pt-2" justify="end">
      <v-col cols="4">
        <v-btn id="page-commands" text color="#38598a" v-if="pageCommands">
          Showing page commands
          <v-icon>
            mdi-chevron-down
          </v-icon>
        </v-btn>
      </v-col>
      <v-col cols="4">
        <v-pagination color="#38598A" v-model="pageNumber" :length="penRequestBatchResponse.totalPages"></v-pagination>
      </v-col>
      <v-col cols="4" id="currentItemsDisplay">
        Showing {{ showingFirstNumber }} to {{ showingEndNumber }} of {{ penRequestBatchResponse.totalElements }}
      </v-col>
    </v-row>
  </div>
</template>

<script>
import {uniqBy} from 'lodash';
import router from '../../../router';

export default {
  name: 'PenRequestBatchDataTable',
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
    showingFirstNumber() {
      return ((this.pageNumber-1) * this.penRequestBatchResponse.pageable.pageSize + (this.penRequestBatchResponse.numberOfElements > 0 ? 1 : 0));
    },
    showingEndNumber() {
      return ((this.pageNumber-1) * this.penRequestBatchResponse.pageable.pageSize + this.penRequestBatchResponse.numberOfElements);
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
      return item.penRequestBatchStatusCode === 'UNARCHIVED';
    },
    isUnarchivedBatchChanged(item) {
      return item.unarchivedBatchChangedFlag === 'Y';
    },
    handleFileCheckBoxClicked(item) {
      this.selectFile(item);
    },
    isSelected(file) {
      return this.selectedFiles?.some(item => item?.penRequestBatchID === file.penRequestBatchID);
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

<style scoped>
  #currentItemsDisplay {
    text-align: right;
    font-size: 0.875rem;
  }
  #page-commands {
    font-size: 0.875rem;
    text-transform: none !important;
  }
  .file-column {
    float: left;
  }
  .countable-column-div {
    max-width: 2rem;
    margin: auto;
  }
  .countable-column-data {
    float: right;
  }
  #file-list /deep/ .v-pagination__navigation > i {
    padding-left: 0;
  }
  #file-list /deep/ table th .countable-column-header .v-icon {
    padding: 0.5rem 0;
  }
  #file-list /deep/ table th{
    text-align: center !important;
    font-size: 0.875rem;
  }

  #file-list .filterable-table /deep/ table th{
    vertical-align: top;
    padding-top: 0.5rem;
  }

  #file-list /deep/ table td { 
    border-bottom: none !important;
  }
  #file-list /deep/ table td:nth-child(5),
  #file-list /deep/ table td:nth-child(8),
  #file-list /deep/ table td:nth-child(10),
  #file-list /deep/ table td:nth-child(11),
  #file-list /deep/ table th:nth-child(5),
  #file-list /deep/ table th:nth-child(8),
  #file-list /deep/ table th:nth-child(10),
  #file-list /deep/ table th:nth-child(11) { 
    border-left: thin solid #d7d7d7;
  }
  #file-list /deep/ table tr.first-active-file td{ 
    border-top: thin solid #2E8540;
  }
  #file-list /deep/ table { 
    border-top: thin solid #d7d7d7;
    border-bottom: thin solid #d7d7d7;
  }
  #file-list /deep/ table tr { 
    cursor: pointer;
  }
  #file-list /deep/ table tr.selected-file,
  #file-list /deep/ table tbody tr:hover { 
    background-color: #E1F5FE
  }
  #file-list /deep/ table td:nth-child(10),
  #file-list /deep/ table th:nth-child(10) { 
    background-color: rgba(0, 0, 0, 0.06);
  }

  #file-list /deep/ table .file-checkbox .v-icon.fa-minus-square {
    color: #039BE5 !important;
  }

  .file-checkbox {
    margin-top: 0;
  }
  .file-checkbox /deep/ .v-input__slot {
    margin-bottom: 0;
  }
  .file-checkbox /deep/ .v-input__slot .v-input--selection-controls__input {
    margin-right: 0;
  }

  .header-checkbox {
    padding-top: 0;
  }
  .header-checkbox /deep/ .v-input__slot {
    padding-top: 0;
  }

  .filter-checkbox /deep/ .v-input__slot {
    justify-content: center;
    padding-top: 0;
  }

  .select-column {
    vertical-align: bottom !important;
  }
  .submission {
    text-decoration: underline;
  }
</style>
