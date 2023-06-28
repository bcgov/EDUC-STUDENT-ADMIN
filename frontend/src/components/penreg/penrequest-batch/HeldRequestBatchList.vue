<template>
  <div
    id="file-list"
    class="px-3"
    style="width: 100%"
    :overlay="false"
  >
    <v-data-table
      id="dataTable"
      v-model:page="pageNumber"
      :class="[{'filterable-table': hasFilterHeader}, 'batch-file-table']"
      :headers="headers"
      :items="penRequestBatchResponse.content"
      :items-per-page="penRequestBatchResponse.pageable.pageSize"
      hide-default-footer
      item-key="penRequestBatchID"
      :loading="loadingTable"
      @page-count="penRequestBatchResponse.pageable.pageNumber = $event"
    >
      <template
        v-for="h in headers"
        :key="h.id"
        #[`header.${h.value}`]="{ header }"
      >
        <span
          :title="header.tooltip"
          :class="{'file-column' : !header.countable}"
        >
          {{ header.text }}
        </span>
        <template v-if="hasFilterHeader">
          <br>
          <span
            :class="header.countable ? 'countable-column-header' : 'file-column'"
          >
            <v-checkbox
              v-if="header.filterName"
              v-model="header.isFiltered"
              class="file-checkbox filter-checkbox"
              color="#606060"
              @update:model-value="selectFilter(header)"
            />
          </span>
        </template>
      </template>
      <template #item="props">
        <tr
          :class="{'selected-file': props.item.isSelected}"
          @click="clickItem(props.item)"
        >
          <td
            v-for="header in props.headers"
            :key="header.id"
            :class="{[header.value]: true, 'select-column': header.type}"
          >
            <v-checkbox
              v-if="header.type"
              v-model="props.item.isSelected"
              class="file-checkbox"
              color="#606060"
              @click.stop="selectFile(props.item)"
            />
            <div
              v-else
              :class="{'countable-column-div': header.countable}"
            >
              <span :class="{'countable-column-data': header.countable}">{{ props.item[header.value] || '' }}</span>
            </div>
          </td>
        </tr>
      </template>
    </v-data-table>
    <Pagination
      v-model="pageNumber"
      :data-response="penRequestBatchResponse"
      page-commands
    />
  </div>
</template>

<script>
import ApiService from '../../../common/apiService';
import {Routes, PEN_REQ_BATCH_STATUS_CODES} from '@/utils/constants';
import filtersMixin from '@/mixins/filtersMixin';
import Pagination from '@/components/util/Pagination.vue';
import alertMixin from '../../../mixins/alertMixin';

export default {
  name: 'HeldRequestBatchList',
  components: {
    Pagination,
  },
  mixins: [alertMixin, filtersMixin],
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
        { value: 'rowSelect', type: 'select', sortable: false },
        { text: 'Mincode', value: 'mincode', sortable: false, align: 'start', tooltip: 'Mincode' },
        { text: 'School Name', value: 'schoolName', sortable: false, tooltip: 'School Name' },
        { text: 'TOT', value: 'studentCount', sortable: false, countable: true, tooltip: 'Total Requests' },
        { text: 'LRG', value: 'lrgCount', sortable: false, filterName: 'Large', filterValue: PEN_REQ_BATCH_STATUS_CODES.HOLD_SIZE, countable: true, isFiltered: false, tooltip: 'Large File Request Count' },
        { text: 'DPF', value: 'dpfCount', sortable: false, filterName: 'Duplicate File', filterValue: PEN_REQ_BATCH_STATUS_CODES.DUPLICATE, countable: true, isFiltered: false, tooltip: 'Duplicate File Request Count' },
        { text: 'Submission', value: 'submissionNumber', sortable: false, tooltip: 'Submission Number' },
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
  created(){
    this.pagination();
  },
  methods: {
    selectFile(file) {
      this.selectedFile && (this.selectedFile.isSelected = false);
      this.$emit('update:selectedFile', file?.isSelected ? file : null);
    },
    clickItem(item) {
      this.$emit('file-click', item);
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

</style>
