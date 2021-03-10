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
        <span :key="h.id" :class="{'file-column' : !header.countable}">
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
        <tr :class="{'selected-file': props.item.isSelected}" @click="selectItem(props.item)">
          <td v-for="header in props.headers" :key="header.id" :class="{[header.value]: true, 'select-column': header.type}">
            <v-checkbox v-if="header.type" class="file-checkbox" color="#606060" v-model="props.item.isSelected" @click.stop="selectFile(props.item)"></v-checkbox>
            <div v-else :class="{'countable-column-div': header.countable}">
              <span :class="{'countable-column-data': header.countable}">{{ props.item[header.value] || '' }}</span>
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
        Showing {{ showingFirstNumber }} to {{ showingEndNumber }} of {{ (penRequestBatchResponse.totalElements || 0) }}
      </v-col>
    </v-row>
  </div>
</template>

<script>
import ApiService from '../../../common/apiService';
import {Routes, PEN_REQ_BATCH_STATUS_CODES} from '../../../utils/constants';

export default {
  name: 'HeldRequestBatchList',
  props: {
    schoolGroup: {
      type: String,
      required: true
    },
    filters: {
      type: Array,
      required: true
    },
    loadingFiles: {
      type: Boolean,
      required: true
    },
    selectedFile: {
      type: Object,
    },
    pageCommands: {
      type: Boolean,
      default: false
    },
  },
  data () {
    return {
      itemsPerPage: 15,
      headers: [
        { value: 'rowSelect', type: 'select', sortable: false },
        { text: 'Mincode', value: 'mincode', sortable: false, align: 'start' },
        { text: 'School Name', value: 'schoolName', sortable: false },
        { text: 'TOT', value: 'studentCount', sortable: false, countable: true },
        { text: 'LRG', value: 'lrgCount', sortable: false, filterName: 'Large', filterValue: PEN_REQ_BATCH_STATUS_CODES.HOLD_SIZE, countable: true, isFiltered: false },
        { text: 'DPF', value: 'dpfCount', sortable: false, filterName: 'Duplicate File', filterValue: PEN_REQ_BATCH_STATUS_CODES.DUPLICATE, countable: true, isFiltered: false },
        { text: 'Submission', value: 'submissionNumber', sortable: false },
      ],
      loadingTable: true,
      pageNumber: 1,
      penRequestBatchResponse: {
        content: [],
        pageable: {}
      },
      filteredStatuses: [],
      defaultStatuses: [PEN_REQ_BATCH_STATUS_CODES.HOLD_SIZE, PEN_REQ_BATCH_STATUS_CODES.DUPLICATE].join()
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
        if (this.pageNumber === 1) {
          this.pagination();
        } else {
          this.pageNumber = 1;
        }        
      }
    },
    loadingFiles: {
      handler(v) {
        if(!v) {
          this.pagination();
        }
      }
    }
  },
  computed: {
    hasFilterHeader() {
      return this.headers.some(header => header.filterName);
    },
    showingFirstNumber() {
      return ((this.pageNumber-1) * (this.penRequestBatchResponse.pageable.pageSize || 0) + ((this.penRequestBatchResponse.numberOfElements || 0)  > 0 ? 1 : 0));
    },
    showingEndNumber() {
      return ((this.pageNumber-1) * (this.penRequestBatchResponse.pageable.pageSize || 0) + (this.penRequestBatchResponse.numberOfElements || 0));
    },
    countableHeaders() {
      return this.headers.filter(header => header.countable);
    },
    searchCriteria() {
      const statusCriteriaList = this.filteredStatuses.length <= 0 ? this.defaultStatuses : this.filteredStatuses.join();
      return [
        { 
          searchCriteriaList: [
            {key: 'schoolGroupCode', operation: 'eq', value: this.schoolGroup, valueType: 'STRING'},
            {key: 'penRequestBatchStatusCode', operation: 'in', value: statusCriteriaList, valueType: 'STRING', condition: 'AND'}
          ]
        }
      ];
    },
  },
  created(){
    this.pagination();
  },
  methods: {
    selectFile(file) {
      this.selectedFile && (this.selectedFile.isSelected = false);
      this.$emit('update:selectedFile', file?.isSelected ? file : null);
    },
    selectItem(item) {
      item.isSelected = !item.isSelected;
      this.selectFile(item);
    },
    initializeFiles(files) {
      //reset
      this.selectFile();
      
      files.forEach(file => {
        file.isSelected = false;
        file.lrgCount = file.penRequestBatchStatusCode === PEN_REQ_BATCH_STATUS_CODES.HOLD_SIZE ? file.studentCount : 0;
        file.dpfCount = file.penRequestBatchStatusCode === PEN_REQ_BATCH_STATUS_CODES.DUPLICATE ? file.studentCount : 0;
        this.countableHeaders.forEach(header => file[header.value] = +file[header.value]);
      });

      return files;
    },

    selectFilters() {
      let statuses = [];
      this.headers.filter(header => !!header.filterName).forEach(header => {
        header.isFiltered = this.filters.some(filter => filter === header.filterName);
        if(header.isFiltered) {
          statuses.push(header.filterValue);
        }
      });
      this.filteredStatuses = statuses;
    },
    selectFilter(header) {
      if(header.isFiltered) {
        this.filters.push(header.filterName);
      } else {
        const index = this.filters.findIndex(filter => filter === header.filterName);
        this.filters.splice(index, 1);
      }

      this.$emit('update:filters', this.filters);
    },
    pagination() {
      this.loadingTable = true;
      const req = {
        params: {
          pageNumber: this.pageNumber-1,
          pageSize: this.itemsPerPage,
          sort: {
            extractDate: 'DESC',
          },
          searchQueries: this.searchCriteria
        }
      };

      ApiService.apiAxios
        .get(Routes.penRequestBatch.FILES_URL, req)
        .then(response => {
          if (response.data && response.data.content) {
            this.initializeFiles(response.data.content);
            this.penRequestBatchResponse = response.data;
          }
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
  #file-list /deep/ table th:nth-child(1) {
    width: 5%;
  }
  #file-list /deep/ table td:nth-child(5),
  #file-list /deep/ table td:nth-last-child(2) ~ td,
  #file-list /deep/ table th:nth-child(5),
  #file-list /deep/ table th:nth-last-child(2) ~ th { 
    border-left: thin solid #d7d7d7;
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

  .filter-checkbox /deep/ .v-input__slot {
    justify-content: center;
    padding-top: 0;
  }

  .select-column {
    vertical-align: bottom !important;
  }
</style>
