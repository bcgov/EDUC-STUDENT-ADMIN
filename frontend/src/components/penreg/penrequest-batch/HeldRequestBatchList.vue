<template>
  <div
    id="file-list"
    class="px-3"
    style="width: 100%"
    :overlay="false"
  >
    <v-data-table-server
      id="dataTable"
      v-model:page="pageNumber"
      :class="[{'filterable-table': hasFilterHeader}, 'batch-file-table']"
      :headers="headers"
      :items="penRequestBatchResponse.content"
      :items-length="penRequestBatchResponse.length > 0 ? penRequestBatchResponse.totalElements : 0"
      :items-per-page="penRequestBatchResponse.pageable.pageSize"
      hide-default-footer
      item-key="penRequestBatchID"
      :loading="loadingTable"
      @page-count="penRequestBatchResponse.pageable.pageNumber = $event"
    >
      <template
        v-for="h in headers"
        :key="h.id"
        #[`column.${h.value}`]="{ column }"
      >
        <span
          :title="column.tooltip"
          :class="{'file-column' : !column.countable}"
        >
          {{ column.text }}
        </span>
        <v-row
          v-if="hasFilterHeader"
          :key="h.id"
        >
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
          :class="{'selected-file': item.item.isSelected}"
          @click="clickItem(item.item)"
        >
          <td
            v-for="header in item.columns"
            :key="header.id"
            :class="{[header.value]: true, 'select-column': header.type}"
          >
            <v-checkbox
              v-if="header.type"
              v-model="item.item.isSelected"
              class="file-checkbox"
              hide-details="auto"
              color="#606060"
              @click.stop="selectFile(item.item)"
            />
            <div
              v-else
              :class="{'countable-column-div': header.countable}"
            >
              <span :class="{'countable-column-data': header.countable}">{{ item.item[header.value] || '' }}</span>
            </div>
          </td>
        </tr>
      </template>
    </v-data-table-server>
    <Pagination
      v-model="pageNumber"
      :value="pageNumber"
      :data-response="penRequestBatchResponse"
      page-commands
      @page-change="pageChange"
    />
  </div>
</template>

<script>
import ApiService from '../../../common/apiService';
import {Routes, PEN_REQ_BATCH_STATUS_CODES} from '@/utils/constants';
import Pagination from '@/components/util/Pagination.vue';
import alertMixin from '../../../mixins/alertMixin';
import {mapActions} from 'pinia';
import {penRequestBatchStore} from '@/store/modules/penRequestBatch';

export default {
  emits: ['update:selectedFile','select-filter'],
  name: 'HeldRequestBatchList',
  components: {
    Pagination,
  },
  mixins: [alertMixin],
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
  },
  data () {
    return {
      itemsPerPage: 15,
      headers: [
        { title: '', value: 'rowSelect', key: 'rowSelect', type: 'select', sortable: false },
        { title: 'Mincode', text: 'Mincode', value: 'mincode', key: 'mincode', sortable: false, align: 'start', tooltip: 'Mincode' },
        { title: 'School Name', text: 'School Name', value: 'schoolName', key: 'schoolName', sortable: false, tooltip: 'School Name' },
        { title: 'TOT', text: 'TOT', value: 'studentCount', key: 'studentCount', sortable: false, countable: true, tooltip: 'Total Requests' },
        { title: 'LRG', text: 'LRG', value: 'lrgCount', key: 'lrgCount', sortable: false, filterName: 'Large', filterValue: PEN_REQ_BATCH_STATUS_CODES.HOLD_SIZE, countable: true, isFiltered: false, tooltip: 'Large File Request Count' },
        { title: 'DPF', text: 'DPF', value: 'dpfCount', key: 'dpfCount', sortable: false, filterName: 'Duplicate File', filterValue: PEN_REQ_BATCH_STATUS_CODES.DUPLICATE, countable: true, isFiltered: false, tooltip: 'Duplicate File Request Count' },
        { title: 'Submission', text: 'Submission', value: 'submissionNumber', key: 'submissionNumber', sortable: false, tooltip: 'Submission Number' },
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
  computed: {
    hasFilterHeader() {
      return this.headers.some(header => header.filterName);
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
  watch: {
    pageNumber: {
      handler() {
        this.pagination();
      }
    },
    filters: {
      handler() {
        this.filteredStatuses = this.selectFilters(this.headers, 'filterValue');
        if (this.pageNumber === 1) {
          this.pagination();
        } else {
          this.pageNumber = 1;
        }
      },
      deep: true
    },
    loadingFiles: {
      handler(v) {
        if(!v) {
          this.pagination();
        }
      }
    }
  },
  created(){
    this.pagination();
  },
  methods: {
    ...mapActions(penRequestBatchStore, ['setPrbStudentStatusFilters']),
    async selectFilter(header) {
      const parsedHeader = this.headers.filter(nHeader => nHeader.value === header.value);
      parsedHeader.isFiltered = header.isFiltered;
      await this.$nextTick();
      if (header.isFiltered) {
        this.filters.push(header.filterName);
      } else {
        const index = this.filters.findIndex(filter => filter === header.filterName);
        this.filters.splice(index, 1);
      }
      await this.setPrbStudentStatusFilters(this.filters);
    },
    selectFilters(headers, filterValueField) {
      let statusFilters = [];
      headers.filter(header => !!header.filterName).forEach(header => {
        header.isFiltered = this.filters.some(filter => filter === header.filterName);
        if (header.isFiltered) {
          statusFilters.push(header[filterValueField]);
        }
      });
      return statusFilters;
    },
    pageChange(newPage){
      this.pageNumber = newPage;
    },
    selectFile(file) {
      file.isSelected = !file.isSelected;
      this.$emit('update:selectedFile', file);
    },
    clickItem(item) {
      this.$emit('file-click', item);
    },
    initializeFiles(files) {
      files.forEach(file => {
        file.isSelected = false;
        file.lrgCount = file.penRequestBatchStatusCode === PEN_REQ_BATCH_STATUS_CODES.HOLD_SIZE ? file.studentCount : 0;
        file.dpfCount = file.penRequestBatchStatusCode === PEN_REQ_BATCH_STATUS_CODES.DUPLICATE ? file.studentCount : 0;
        this.countableHeaders.forEach(header => file[header.value] = +file[header.value]);
      });

      return files;
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
          this.setFailureAlert('An error occurred while loading the file list. Please try again later.');
          
        })
        .finally(() => (this.loadingTable = false));
    },
  }
};
</script>

<style scoped src="@/assets/styles/batchFileDataTable.css"></style>
<style scoped>
  #dataTable /deep/ table th:nth-child(1) {
    width: 5%;
  }

  #dataTable /deep/ table td:nth-last-child(2) ~ td,
  #dataTable /deep/ table th:nth-last-child(2) ~ th {
    border-left: thin solid #d7d7d7;
  }

  :deep(.v-data-table-footer) {
    display: none;
  }
  
  :deep(.v-data-table__th) {
      font-size: 0.75em !important;
      font-weight: bold !important;
  }
  
  :deep(td) {
      font-size: 0.85em;
  }
  
  #dataTable /deep/ table th {
      font-size: 0.85rem;
  }
</style>
