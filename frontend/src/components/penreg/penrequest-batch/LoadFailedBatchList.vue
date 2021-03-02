<template>
    <v-container fluid class="fill-height px-0 mb-4">
        <AlertMessage v-model="alert" :alertMessage="alertMessage" :alertType="alertType"></AlertMessage>
        <v-row no-gutters class="list-actions pt-2 pb-2 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3" style="background-color:white;">
          <v-col offset="9" cols="3" xl="4" class="pa-0 d-flex justify-end align-end">
            <PrimaryButton id="view-file-action" class="ml-2" :disabled="!fileSelected()" text="Review" :loading="isProcessing" @click.native="reviewFile"></PrimaryButton>
            <PrimaryButton id="delete-file-action" class="ml-2" :disabled="!fileSelected()" text="Delete" :loading="isProcessing" @click.native="deleteFile"></PrimaryButton>
          </v-col>
        </v-row>
        <v-row no-gutters class="py-1" style="background-color:white;">
          <div id="file-list" class="px-3" style="width: 100%" :overlay="false">
            <v-data-table
                id="dataTable"
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
              </template>
              <template v-slot:item="props">
                <tr @click="showFile(props.item)">
                  <td v-for="header in props.headers" :key="header.id" :class="{[header.value]: true, 'select-column': header.type}">
                    <v-checkbox v-if="header.type" class="file-checkbox" color="#606060" v-model="props.item.isSelected" @click.stop="handleFileCheckBoxClicked(props.item)"></v-checkbox>
                    <div v-else :class="{'countable-column-div': header.countable}">
                      <span v-if="header.countable" class="countable-column-data">{{ props.item[header.value] || '' }}</span>
                      <span v-else>{{formatTableColumn(header.format, props.item[header.value]) }}</span>
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
        </v-row>
      <PrbFileVModal
          :open-dialog="openFileViewer"
          :submission-number="submissionNumber"
          @closeDialog="closeFileViewer"
      >
      </PrbFileVModal>
    </v-container>
</template>

<script>
import {Routes} from '@/utils/constants';
import { mapState } from 'vuex';
import PrimaryButton from '../../util/PrimaryButton';
import alertMixin from '../../../mixins/alertMixin';
import {isValidAlphanumericValue } from '@/utils/validation';
import AlertMessage from '../../util/AlertMessage';
import ApiService from '@/common/apiService';
import moment from 'moment';
import PrbFileVModal from '@/components/penreg/penrequest-batch/PrbFileModal';

export default {
  name: 'LoadFailedBatchList',
  components: {
    PrbFileVModal,
    PrimaryButton,
    AlertMessage
  },
  mixins: [alertMixin],
  props: {
    loadDate: {
      type: String,
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
  data() {
    return {
      pageNumber: 1,
      selectedFiles: [],
      penRequestBatchResponse: {
        content: [],
        pageable: {}
      },
      itemsPerPage: 15,
      headers: [
        {value: 'rowSelect', type: 'select', sortable: false},
        {text: 'Mincode', value: 'mincode', sortable: false, align: 'start'},
        {text: 'School Name', value: 'schoolName', sortable: false},
        {text: 'Failed Reason', value: 'penRequestBatchStatusReason', sortable: false},
        {
          text: 'DATE and TIME SUBMITTED',
          value: 'insertDate',
          sortable: false,
          format: this.frontEndDateTimeFormat
        },
        {
          text: 'DATE and TIME EXTRACTED',
          value: 'extractDate',
          sortable: false,
          format: this.frontEndDateTimeFormat
        },
        {text: 'Submission', value: 'submissionNumber', sortable: false},
      ],
      loadingTable: true,
      reloading: false,
      pageCommands: true,
      alphanumericHint: 'Alphanumeric only',
      isProcessing: false,
      openFileViewer: false,
      submissionNumber: '',
    };
  },
  computed: {
    ...mapState('student', ['genders']),
    selectedFileBatchIDs() {
      return this.selectedFiles.map(file => file.penRequestBatchID).join(',');
    },
    genderCodes() {
      return this.genders ? this.genders.map(a => a.genderCode) : [];
    },
    showingFirstNumber() {
      return ((this.pageNumber-1) * (this.penRequestBatchResponse.pageable.pageSize || 0) + ((this.penRequestBatchResponse.numberOfElements || 0)  > 0 ? 1 : 0));
    },
    showingEndNumber() {
      return ((this.pageNumber-1) * (this.penRequestBatchResponse.pageable.pageSize || 0) + (this.penRequestBatchResponse.numberOfElements || 0));
    },
    searchCriteria() {
      return [
        {
          searchCriteriaList: [
            // {key: 'schoolGroupCode', operation: 'eq', value: this.schoolGroup, valueType: 'STRING'},
            {
              key: 'penRequestBatchStatusCode',
              operation: 'in',
              value: 'LOADFAIL',
              valueType: 'STRING',
              condition: 'AND'
            }
          ]
        }
      ];
    }
  },
  mounted() {
    this.pagination();
  },
  methods: {
    formatTableColumn(format, column) {
      return (format && column) ? format(column) : (column || ' ');
    },
    frontEndDateTimeFormat(date) {
      return moment(JSON.stringify(date), 'YYYY-MM-DDTHH:mm:ss').format('YYYY/MM/DD h:mm:ss A');
    },
    handleFileCheckBoxClicked(item) {
      this.selectFile(item);
    },
    fileSelected() {
      return this.penRequestBatchResponse.content.filter(file => file.isSelected).length > 0;
    },
    selectFile(item) {
      if (item.isSelected) {
        this.penRequestBatchResponse.content.forEach(file => {
          if (file.submissionNumber !== item.submissionNumber) {
            file.isSelected = false;
          }
        });
      } else {
        this.penRequestBatchResponse.content.forEach(file => file.isSelected = false);
      }
    },
    showFile(item) {
      this.submissionNumber = item.submissionNumber;
      this.openFileViewer = true;
    },
    closeFileViewer() {
      this.openFileViewer = false;
    },
    initializeFiles(files) {
      files.forEach(file => {
        file.isSelected = false;
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
            penRequestBatchStatusCode: 'DESC',
            mincode: 'ASC',
            submissionNumber: 'ASC'
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
    reviewFile() {
      const selectedItem = this.penRequestBatchResponse.content.find(file => file.isSelected);
      if (selectedItem) {
        this.showFile(selectedItem);
      }
    },
    deleteFile() {
      // this will be implemented in PEN-1226 - Delete failed PEN Request File
    },
    validateField(value, validator = isValidAlphanumericValue, hint = this.alphanumericHint, length = 0) {
      if (!value || validator(value)) {
        return [];
      }
      this.searchEnabled = false;
      if (value.length < length) {
        return [];
      } else {
        return [
          hint
        ];
      }
    },
  }
};
</script>
