<template>
  <div id="file-list" class="px-3" style="width: 100%" :overlay="false">
    <v-data-table
      id="dataTable"
      v-model="selectedRecords"
      :headers="headers"
      :items="searchResponse.content"
      :page.sync="pageNumber"
      :items-per-page="searchResponse.pageable.pageSize"
      hide-default-footer
      item-key="penRequestBatchID"
      :loading="loadingTable"
      @page-count="searchResponse.pageable.pageNumber = $event"
    >
      <template v-for="h in headers" v-slot:[`header.${h.value}`]="{ header }">
        <v-checkbox 
          v-if="header.type" 
          :key="h.id" 
          class="file-checkbox header-checkbox" 
          color="#606060"
          v-model="allSelected" 
          :indeterminate="partialSelected" 
          @change="selectAllFiles"
        ></v-checkbox>
        <span v-else :key="h.id" :class="{'file-column' : !header.countable}">
          {{ header.text }}
        </span>
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
      <template v-slot:item="props">
        <tr :class="tableRowClass(props.item)" @click="selectItem(props.item)">
          <td v-for="header in props.headers" :key="header.id" :class="{[header.value]: true, 'select-column': header.type}">
            <v-checkbox v-if="header.type" class="file-checkbox" color="#606060" v-model="props.item.isSelected" @change="selectFile" @click.prevent></v-checkbox>
            <div v-else :class="{'countable-column-div': header.countable}">
              <span v-if="header.countable" class="countable-column-data">{{ props.item[header.value] || '-' }}</span>
              <span v-else>{{props.item[header.value]}}</span>
              <v-tooltip v-if="header.value==='minCode' && isUnarchived(props.item)" right>
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
        <v-btn id="page-commands" text color="#38598a">
          Showing page commands
          <v-icon>
            mdi-chevron-down
          </v-icon>
        </v-btn>
      </v-col>
      <v-col cols="4">
        <v-pagination color="#38598A" v-model="pageNumber" :length="searchResponse.totalPages"></v-pagination>
      </v-col>
      <v-col cols="4" id="currentItemsDisplay">
        Showing {{ showingFirstNumber }} to {{ showingEndNumber }} of {{ searchResponse.totalElements }}
      </v-col>
    </v-row>
  </div>
</template>

<script>
import ApiService from '../../../common/apiService';
import {Routes} from '../../../utils/constants';

export default {
  name: 'PenRequestBatchList',
  props: {
    schoolGroup: {
      type: String,
      required: true
    },
    filters: {
      type: Array,
      required: true
    },
  },
  data () {
    return {
      pageNumber: 1,
      itemsPerPage: 15,
      headers: [
        { value: 'rowSelect', type: 'select', sortable: false },
        { text: 'Mincode', value: 'minCode', sortable: false, align: 'start'},
        { text: 'School Name', value: 'schoolName', sortable: false },
        { text: 'TOT', value: 'studentCount', sortable: false, countable: true },
        { text: 'MCH', value: 'matchedCount', sortable: false, filterName: 'Matched', countable: true, isFiltered: false },
        { text: 'NEW', value: 'newPenCount', sortable: false, filterName: 'New PENs', countable: true, isFiltered: false },
        { text: 'ERR', value: 'errorCount', sortable: false, filterName: 'Errors', countable: true, isFiltered: false },
        { text: 'REP', value: 'repeatCount', sortable: false, filterName: 'Repeated', countable: true, isFiltered: false },
        { text: 'FIX', value: 'fixableCount', sortable: false, filterName: 'Fixable', countable: true, isFiltered: false },
        { text: 'FLT', value: 'filteredCount', sortable: false, countable: true },
        { text: 'Submission', value: 'submissionNumber', sortable: false },
      ],
      selectedRecords: [],
      filterCriteriaList: [],
      allSelected: false,
      partialSelected: false,
      searchResponse: {
        content: [],
        pageable: {}
      },
      loadingTable: true,
    };
  },
  watch: {
    pageNumber: {
      handler() {
        this.pagination();
      }
    },
    filters: {
      handler() {
        this.selectFilters();
        this.pagination();
      }
    },
    schoolGroup: {
      handler() {
        this.initializeFilters();
        this.pagination();
      }
    }
  },
  computed: {
    countableHeaders() {
      return this.headers.filter(header => header.countable);
    },
    showingFirstNumber() {
      return ((this.pageNumber-1) * this.searchResponse.pageable.pageSize + 1);
    },
    showingEndNumber() {
      return ((this.pageNumber-1) * this.searchResponse.pageable.pageSize + this.searchResponse.numberOfElements);
    },
    searchCriteria() {
      return [
        { 
          searchCriteriaList: [
            {key: 'schoolGroupCode', operation: 'eq', value: this.schoolGroup, valueType: 'STRING'},
            {key: 'penRequestBatchStatusCode', operation: 'in', value: 'ACTIVE,UNARCHIVED', valueType: 'STRING', condition: 'AND'}
          ]
        },
        { 
          condition: 'AND', 
          searchCriteriaList: this.filterCriteriaList
        },
      ];
    },
  },
  created(){
    this.initializeFilters();
    this.selectFilters();
    this.pagination();
  },
  methods: {
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
    initializeFilters() {
      this.filters.splice(0);
      this.filters.push('Fixable');
    },
    initializeFiles(files) {
      this.partialSelected = false;
      this.allSelected = false;
      let activeFile = files.find(f => f.penRequestBatchStatusCode === 'ACTIVE');
      activeFile && (activeFile.firstActiveFile = true);
      files.forEach(file => {
        file.minCode && (file.minCode = file.minCode.substring(0, 3) + ' ' + file.minCode.substring(3));
        file.isSelected = false;
        this.countableHeaders.forEach(header => file[header.value] = +file[header.value]);
        file.filteredCount = this.headers.reduce((sum, header) => 
          header.isFiltered ? sum + file[header.value] : sum
        , 0);
      });
      return files;
    },
    selectFile(selected) {
      this.allSelected = this.searchResponse.content.every(file => file.isSelected);
      this.partialSelected = (selected || this.searchResponse.content.some(file => file.isSelected)) && !this.allSelected;
    },
    selectItem(item) {
      item.isSelected = !item.isSelected;
      this.selectFile(item.isSelected);
    },
    selectAllFiles(selected) {
      this.searchResponse.content.forEach(file => file.isSelected = selected);
      this.partialSelected = false;
    },
    selectFilters() {
      this.filterCriteriaList.splice(0);
      this.headers.filter(header => !!header.filterName).forEach(header => {
        header.isFiltered = this.filters.some(filter => filter === header.filterName);
        if(header.isFiltered) {
          let criteria = {key: header.value, operation: 'gt', value: 0, valueType: 'LONG'};
          if(this.filterCriteriaList.length > 0) {
            criteria.condition = 'OR';
          }
          this.filterCriteriaList.push(criteria);
        }
      });
    },
    selectFilter(header) {
      if(header.isFiltered) {
        this.filters.push(header.filterName);
      } else {
        const index = this.filters.findIndex(filter => filter === header.filterName);
        this.filters.splice(index, 1);
      }

      this.$emit('filter-change', this.filters);
    },
    pagination() {
      this.loadingTable = true;
      const req = {
        params: {
          pageNumber: this.pageNumber-1,
          pageSize: this.itemsPerPage,
          sort: {
            penRequestBatchStatusCode: 'DESC',
            minCode: 'ASC',
            submissionNumber: 'ASC'
          },
          searchQueries: this.searchCriteria
        }
      };

      ApiService.apiAxios
        .get(Routes.penRequestBatch.FILES_URL, req)
        .then(response => {
          response.data && response.data.content && this.initializeFiles(response.data.content);
          this.searchResponse = response.data;
        })
        .catch(error => {
          console.log(error);
          this.$emit('failure-alert', 'An error occurred while loading the file list. Please try again later.');
        })
        .finally(() => (this.loadingTable = false));
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
  #file-list /deep/ .v-input--selection-controls__ripple {
    left: -7px;
  }
  #file-list /deep/ table th .countable-column-header .v-icon {
    padding: 0.5rem 0;
  }
  #file-list /deep/ table th{
    text-align: center !important;
    vertical-align: top;
    padding-top: 0.5rem;
    font-size: 0.875rem;
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
    /* justify-content: center; */
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
  .filter-checkbox /deep/ .v-input__slot .v-input--selection-controls__ripple {
    left: -12px !important;
  }

  .select-column {
    vertical-align: bottom !important;
  }
</style>
