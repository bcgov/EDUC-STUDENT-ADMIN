<template>
  <v-container
    fluid
    class="px-0 mb-4"
  >
    <v-row
      no-gutters
      class="list-actions py-2 px-4 d-flex justify-end"
      style="background-color:white;"
    >
      <v-col class="d-flex justify-end">
        <PrimaryButton
          id="review-file-action"
          class="ml-2"
          :disabled="!fileChecked()"
          text="Review"
          :loading="isProcessing"
          @click-action="reviewFile"
        />
        <PrimaryButton
          id="delete-file-action"
          class="ml-2"
          :disabled="!fileChecked()"
          text="Delete"
          :loading="isDeleting"
          @click-action="deleteFile"
        />
      </v-col>
    </v-row>
    <v-row
      no-gutters
      class="py-1"
      style="background-color:white;"
    >
      <div
        id="load-failed-file-list"
        class="px-4"
        style="width: 100%"
        :overlay="false"
      >
        <v-data-table-server
          id="dataTable"
          v-model:page="pageNumber"
          :headers="headers"
          :items="prbResponse.content"
          :items-length="prbResponse.length > 0 ? prbResponse.totalElements : 0"
          :items-per-page="prbResponse.pageable.pageSize"
          hide-default-footer
          item-key="penRequestBatchID"
          :loading="loadingTable"
          @page-count="prbResponse.pageable.pageNumber = $event"
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
          </template>
          <template #item="item">
            <tr @click="showFile(item.item.raw)">
              <td
                v-for="header in item.columns"
                :key="header.id"
                :class="{[header.value]: true, 'select-column': header.type}"
              >
                <v-checkbox
                  v-if="header.type"
                  v-model="item.item.raw.isChecked"
                  class="file-checkbox"
                  hide-details="auto"
                  color="#606060"
                  @click.stop="handleFileCheckBoxClicked(item.item.raw)"
                />
                <div
                  v-else
                  :class="{'countable-column-div': header.countable}"
                >
                  <span
                    v-if="header.countable"
                    class="countable-column-data"
                  >{{ item.item.raw[header.value] || '' }}</span>
                  <span v-else>{{ formatTableColumn(header.format, item.item.raw[header.value]) }}</span>
                </div>
              </td>
            </tr>
          </template>
        </v-data-table-server>
        <Pagination
          v-model="pageNumber"
          :value="pageNumber"
          :data-response="prbResponse"
          page-commands
          @page-change="pageChange"
        />
      </div>
    </v-row>
    <PrbFileModal
      v-if="openFileViewer"
      :open-dialog="openFileViewer"
      :submission-number="submissionNumber"
      @closeDialog="closeFileViewer"
    />
    <ConfirmationDialog ref="confirmationDialog">
      <template #message>
        <v-col class="mt-n6">
          <v-row class="mt-n2 mb-3">
            <span>Are you sure you want to <strong>Delete</strong> submission <strong>{{ submissionNumber
              }}</strong>?</span>
          </v-row>
        </v-col>
      </template>
    </ConfirmationDialog>
  </v-container>
</template>

<script>
import {Routes, PEN_REQ_BATCH_STATUS_CODES} from '@/utils/constants';
import PrimaryButton from '../../util/PrimaryButton.vue';
import alertMixin from '../../../mixins/alertMixin';
import ApiService from '@/common/apiService';
import moment from 'moment';
import PrbFileModal from '@/components/penreg/penrequest-batch/PrbFileModal.vue';
import pluralize from 'pluralize';
import ConfirmationDialog from '@/components/util/ConfirmationDialog.vue';
import Pagination from '@/components/util/Pagination.vue';

export default {
  name: 'LoadFailedBatchList',
  components: {
    Pagination,
    PrbFileModal,
    PrimaryButton,
    ConfirmationDialog
  },
  mixins: [alertMixin],
  data() {
    return {
      pageNumber: 1,
      prbResponse: {
        content: [],
        pageable: {}
      },
      itemsPerPage: 15,
      headers: [
        {title: '', value: 'rowSelect', key: 'rowSelect', type: 'select', sortable: false},
        {
          title: 'Mincode',
          text: 'Mincode',
          value: 'mincode',
          key: 'mincode',
          sortable: false,
          align: 'start',
          tooltip: 'Mincode'
        },
        {
          title: 'School Name',
          text: 'School Name',
          value: 'schoolName',
          key: 'schoolName',
          sortable: false,
          tooltip: 'School Name'
        },
        {
          title: 'Failed Reason',
          text: 'Failed Reason',
          value: 'penRequestBatchStatusReason',
          key: 'penRequestBatchStatusReason',
          sortable: false,
          tooltip: 'Failed Reason'
        },
        {
          title: 'Date and Time Submitted',
          text: 'Date and Time Submitted',
          key: 'insertDate',
          value: 'insertDate',
          sortable: false,
          format: this.frontEndDateTimeFormat,
          tooltip: 'Date and Time Submitted'
        },
        {
          title: 'Submission',
          text: 'Submission',
          value: 'submissionNumber',
          key: 'submissionNumber',
          sortable: false,
          tooltip: 'Submission Number'
        },
      ],
      loadingTable: true,
      reloading: false,
      pageCommands: true,
      alphanumericHint: 'Alphanumeric only',
      isProcessing: false,
      isDeleting: false,
      openFileViewer: false,
      submissionNumber: '',
    };
  },
  computed: {
    showingFirstNumber() {
      return ((this.pageNumber - 1) * (this.prbResponse.pageable.pageSize || 0) + ((this.prbResponse.numberOfElements || 0) > 0 ? 1 : 0));
    },
    showingEndNumber() {
      return ((this.pageNumber - 1) * (this.prbResponse.pageable.pageSize || 0) + (this.prbResponse.numberOfElements || 0));
    },
    searchCriteria() {
      return [
        {
          searchCriteriaList: [
            {
              key: 'penRequestBatchStatusCode',
              operation: 'in',
              value: PEN_REQ_BATCH_STATUS_CODES.LOAD_FAIL,
              valueType: 'STRING',
              condition: 'AND'
            }
          ]
        }
      ];
    }
  },
  watch: {
    pageNumber: {
      handler() {
        this.pagination();
      }
    },
    reloading: {
      handler(v) {
        if (v) {
          this.pagination();
        }
      }
    },
  },
  mounted() {
    this.pagination();
  },
  methods: {
    pageChange(newPage) {
      this.pageNumber = newPage;
    },
    formatTableColumn(format, column) {
      return (format && column) ? format(column) : (column || ' ');
    },
    frontEndDateTimeFormat(date) {
      return moment(JSON.stringify(date), 'YYYY-MM-DDTHH:mm:ss').format('YYYY/MM/DD h:mm:ss A');
    },
    handleFileCheckBoxClicked(item) {
      this.selectFile(item);
    },
    fileChecked() {
      return this.prbResponse.content.filter(file => file.isChecked).length > 0;
    },
    selectFile(item) {
      if (item.isChecked) {
        this.prbResponse.content.forEach(file => {
          if (file.submissionNumber !== item.submissionNumber) {
            file.isChecked = false;
          }
        });
      } else {
        this.prbResponse.content.forEach(file => file.isChecked = false);
      }
    },
    showFile(item) {
      this.submissionNumber = item.submissionNumber;
      this.openFileViewer = true;
    },
    closeFileViewer() {
      this.openFileViewer = false;
    },
    initializeData(files) {
      files.forEach(file => {
        file.isChecked = false;
      });
      return files;
    },
    pagination() {
      this.loadingTable = true;
      const req = {
        params: {
          pageNumber: this.pageNumber - 1,
          pageSize: this.itemsPerPage,
          sort: {
            insertDate: 'DESC',
            mincode: 'ASC',
          },
          searchQueries: this.searchCriteria
        }
      };

      ApiService.apiAxios
        .get(Routes.penRequestBatch.FILES_URL, req)
        .then(response => {
          if (response.data && response.data.content) {
            this.initializeData(response.data.content);
            this.prbResponse = response.data;
          }
        })
        .catch(error => {
          console.log(error);
          this.setFailureAlert('An error occurred while loading the file list. Please try again later.');
        })
        .finally(() => {
          this.loadingTable = false;
          this.reloading = false;
        });
    },
    reviewFile() {
      const selectedItem = this.prbResponse.content.find(file => file.isChecked);
      if (selectedItem) {
        this.showFile(selectedItem);
      }
    },
    async deleteFile() {
      this.submissionNumber = this.prbResponse.content.find(file => file.isChecked).submissionNumber;
      let result = await this.$refs.confirmationDialog.open(null, null,
        {color: '#fff', width: 480, closeIcon: true, dark: false, rejectText: 'Cancel', resolveText: 'Confirm'});
      if (!result) {
        return;
      }

      const fileNumber = this.prbResponse.content.filter(file => file.isChecked).length;
      const payload = {
        penRequestBatchIDs: this.prbResponse.content.filter(file => file.isChecked).map(file => file.penRequestBatchID)
      };
      this.isDeleting = true;
      ApiService.apiAxios.post(`${Routes['penRequestBatch'].FILES_URL}/deleteFiles`, payload)
        .then(response => {
          const deletedNumber = response.data.length;
          const deletedMessage = `${deletedNumber} ${pluralize('file', deletedNumber)} ${pluralize('has', deletedNumber)} been deleted.`;
          if (deletedNumber === fileNumber) {
            this.setSuccessAlert(`Success! ${deletedMessage}`);
          } else {
            this.setFailureAlert('An error occurred while deleting PEN Request Files! Please try again later.');
          }
          this.pagination();
        })
        .catch(error => {
          this.setFailureAlert('An error occurred while deleting PEN Request Files! Please try again later.');
          console.log(error);
        })
        .finally(() => {
          this.isDeleting = false;
        });
    },
  }
};
</script>

<style scoped>
:deep(.v-data-table-footer) {
    display: none;
}

:deep(.v-data-table__th) {
    font-size: 0.75em !important;
    font-weight: bold !important;
}

:deep(td) {
    font-size: 0.85em;
    cursor: pointer;
}

#dataTable /deep/ table th {
    font-size: 0.85rem;
}
</style>
