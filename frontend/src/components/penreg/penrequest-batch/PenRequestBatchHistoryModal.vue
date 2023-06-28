<template>
  <v-dialog
    id="historyModal"
    v-model="modalOpen"
    max-width="65%"
  >
    <v-card
      fluid
      class="px-6 pt-2"
      elevation="0"
    >
      <v-card-title class="px-0 pb-0 pt-5" />
      <v-row>
        <div class="flex-grow-1 pt-0 px-3">
          <DataListItem
            v-for="(item, i) in fileItems"
            :key="item.name + i"
            :name="item.name"
            :label="item.label"
            :value="item.value"
            :loading="loadingPenCoord && item.type === 'coord'"
          />
        </div>
        <div class="pt-0 d-flex justify-end">
          <PrimaryButton
            id="repostBtn"
            class="mr-5"
            text="Repost Reports"
            :click-action="repostReports"
            :disabled="batchFile.sagaInProgress"
            :loading="isProcessing"
          />
          <v-btn
            id="closeModalBtn"
            text
            icon
            @click="modalOpen=false"
          >
            <v-icon
              large
              color="#38598A"
            >
              mdi-close
            </v-icon>
          </v-btn>
        </div>     
      </v-row>
      <v-data-table
        id="fileHistoryTable"
        class="py-5"
        :headers="headers"
        :items="penWebBlobs"
        hide-default-footer
        :loading="loadingTable"
        :items-per-page="1000"
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
        </template>
        <template #item="props">
          <tr>
            <td
              v-for="header in props.headers"
              :key="header.id"
            >
              <span>{{ formatTableColumn(header.format, props.item[header.value]) }}</span>
            </td>
          </tr>
        </template>
      </v-data-table>
    </v-card>
  </v-dialog>
</template>

<script>
import PrimaryButton from '@/components/util/PrimaryButton.vue';
import alertMixin from '@/mixins/alertMixin';
import DataListItem from '@/components/util/DataListItem.vue';
import ApiService from '@/common/apiService';
import { Routes } from '@/utils/constants';
import { formatTableColumn, formatDateTime } from '@/utils/format';
import { mapState } from 'pinia';
import {notificationsStore} from '@/store/modules/notifications';
import _ from 'lodash';

export default {
  name: 'PenRequestBatchHistoryModal',
  components: {
    PrimaryButton,
    DataListItem,
  },
  mixins: [alertMixin],
  props: {
    value: {
      type: Boolean,
      required: true
    },
    batchFile: {
      type: Object,
      required: true
    },
  },
  data() {
    return {
      modalOpen: false,
      loadingTable: false,
      loadingPenCoord: false,
      isProcessing: false,
      penWebBlobs: [],
      headers: [
        { text: 'Type', value: 'fileType', sortable: false, align: 'start', tooltip: 'Type' },
        { text: 'Insert Date', value: 'insertDateTime', sortable: false, format: this.formateDate, tooltip: 'Insert Date' },
        { text: 'Insert Time', value: 'insertDateTime', sortable: false, format: this.formateTime, tooltip: 'Insert Time' },
        { text: 'Extract Date', value: 'extractDateTime', sortable: false, format: this.formateDate, tooltip: 'Extract Date' },
        { text: '', value: '', sortable: false},
      ],
      penCoordinator: {},
    };
  },
  computed: {
    ...mapState(notificationsStore, ['notification']),
    fileItems() {
      return [
        { name: 'district', label: this.districtFieldLabel, value: this.districtName },
        { name: 'school', label: this.schoolFieldLabel, value: this.batchFile.schoolName },
        { name: 'coord', label: 'PEN Coord:', value: this.penCoordinator.penCoordinatorName, type: 'coord' },
        { name: 'email', label: 'Email:', value: this.penCoordinator.penCoordinatorEmail, type: 'coord' },
        { name: 'breakLine', label: '', value: '' },
        { name: 'fileName', label: 'File Name:', value: this.batchFile.fileName },
        { name: 'submission', label: 'Submission #:', value: this.batchFile.submissionNumber },
        { name: 'dateCreated', label: 'Date Created:', value: this.formateDate(this.batchFile.extractDate) },
        { name: 'timeCreated', label: 'Time Created:', value: this.formateTime(this.batchFile.extractDate) },
        { name: 'resultSent', label: 'Result Sent:', value: this.resultSentDateTime },
        { name: 'studentCount', label: 'Student Count:', value: '' + this.batchFile.studentCount },
        { name: 'errorCount', label: 'Error Count', value: '' + this.batchFile.errorCount },
      ];
    },
    districtFieldLabel() {
      return `District: ${this.districtCode}`;
    },
    districtName() {
      return this.districtCode === '102' ? 'Post Secondary Institutions' : 'K-12 Schools';
    },
    schoolFieldLabel() {
      return `School: ${this.schoolCode}`;
    },
    districtCode() {
      return this.batchFile.mincode?.substring(0, 3);
    },
    schoolCode() {
      return this.batchFile.mincode?.substring(3);
    },
    resultSentDateTime() {
      const sentDate = this.formateDate(this.batchFile.processDate);
      const sentTime = this.formateTime(this.batchFile.processDate, 'HH:mm');
      return `${sentDate} at ${sentTime}`;
    }
  },
  watch: {
    value: {
      handler(v) {
        this.modalOpen = v;
      }
    },
    modalOpen(newValue) {
      if(!newValue && this.value) {
        this.$emit('input', this.modalOpen);
      }
    },
    notification(notificationData) {
      if (notificationData) {
        if (notificationData.penRequestBatchID === this.batchFile.penRequestBatchID && notificationData.sagaStatus === 'COMPLETED' &&
          notificationData.sagaName === 'PEN_REQUEST_BATCH_REPOST_REPORTS_SAGA') {
          this.batchFile.sagaInProgress = false;
          this.setSuccessAlert('The request to repost reports is now completed.');
          this.loadPenWebBlobs();
        }
      }
    },
  },
  created() {
    this.modalOpen = this.value;
    this.loadPenCoord();
    this.loadPenWebBlobs();
  },
  methods: {
    formatTableColumn,
    loadPenWebBlobs() {
      this.loadingTable = true;
      const req = {
        params: {
          submissionNumber: this.batchFile.submissionNumber
        }
      };
      ApiService.apiAxios
        .get(Routes.penRequestBatch.SOURCE_METADATA_URL, req)
        .then(response => {
          if (response.data) {
            this.penWebBlobs = _.orderBy(response.data, ['insertDateTime'], ['desc']);
          }
        })
        .catch(error => {
          console.log(error);
          this.setFailureAlert('An error occurred while loading the pen web blob. Please try again later.');
        })
        .finally(() => (this.loadingTable = false));
    },
    loadPenCoord() {
      this.loadingPenCoord = true;
      ApiService.apiAxios
        .get(`${Routes.SCHOOL_DATA_URL}/${this.batchFile.mincode}/penCoordinator`)
        .then(response => {
          if (response.data) {
            this.penCoordinator = response.data;
          }
        })
        .catch(error => {
          console.log(error);
          this.setFailureAlert('An error occurred while loading the pen coordinator data. Please try again later.');
        })
        .finally(() => (this.loadingPenCoord = false));
    },
    repostReports() {
      this.isProcessing = true;
      const req = {
        penRequestBatchID: this.batchFile.penRequestBatchID,
        schoolName: this.batchFile.schoolName
      };
      ApiService.apiAxios
        .post(`${Routes['penRequestBatch'].FILES_URL}/repostReports`, req)
        .then(() => {
          this.setSuccessAlert('Your request to repost reports is accepted.');
          this.batchFile.sagaInProgress = true;
        })
        .catch((error) => {
          console.log(error);
          if (error.response.data && error.response.data.code && error.response.data.code === 409) {
            this.setFailureAlert('Another saga is in progress for this file, please try again later.');
          } else {
            this.setFailureAlert('Your request to repost reports could not be accepted, please try again later.');
          }
        })
        .finally(() => {
          this.isProcessing = false;
        });
    },
    formateDate(dateTime) {
      return formatDateTime(dateTime,'uuuu-MM-dd\'T\'HH:mm:ss','uuuu/MM/dd', true);
    },
    formateTime(dateTime, timeFormat = 'HH:mm:ss') {
      return formatDateTime(dateTime,'uuuu-MM-dd\'T\'HH:mm:ss', timeFormat, true);
    }
  }
};
</script>

<style scoped>
  #fileHistoryTable {
    overflow: auto;
  }

  #fileHistoryTable /deep/ table { 
    border-top: solid #d7d7d7;
  }

  #fileHistoryTable /deep/ table th{
    text-align: center !important;
    font-size: 0.875rem;
  }

  #fileHistoryTable /deep/ table td{
    text-align: center !important;
    border-bottom: none !important;
  }

  #fileHistoryTable /deep/ table td:nth-child(2),
  #fileHistoryTable /deep/ table th:nth-child(2) { 
    border-left: thin solid #d7d7d7;
  }

  #fileHistoryTable /deep/ table th:nth-child(1) {
    width: 10%;
  }
  #fileHistoryTable /deep/ table th:nth-child(2),
  #fileHistoryTable /deep/ table th:nth-child(3),
  #fileHistoryTable /deep/ table th:nth-child(4) {
    width: 20%;
  }
</style>
