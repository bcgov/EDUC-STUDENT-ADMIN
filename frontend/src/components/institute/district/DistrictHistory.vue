<template>
  <v-row no-gutters>
    <v-col :cols="showRecordDetail ? 6 : 12">
      <v-data-table
        id="districtHistoryTable"
        v-model:items-per-page="districtHistory.pageable.pageSize"
        v-model:items="districtHistory.content"
        v-model="selectedDistrictHistory"
        :headers="getHeaders()"
        :loading="loading"
        class="batch-file-table"
        mobile-breakpoint="0"
      >
        <template #no-data>
          <v-row no-gutters>
            <v-col class="d-flex justify-center">
              There is no history.
            </v-col>
          </v-row>
        </template>
        <template #item="{ item, index }">
          <tr
            no-gutters
            class="hoverTable"
            :class="tableRowClass(item.raw)"
            @click="selectHistoryItem(item.raw)"
          >
            <td
              v-for="header in getHeaders()"
              :key="header"
              :class="header"
            >
              <span :class="{ 'diff-value': item.raw[`${header}_diff`] }">{{
                formatTableColumn(header.format, item.columns[header.key])
              }}</span>
            </td>
          </tr>
        </template>
      </v-data-table>
      <v-row
        class="pt-2"
        justify="end"
      >
        <v-col cols="4">
          <v-pagination
            v-model="pageNumber"
            color="#38598A"
            :length="districtHistory.totalPages"
            @update:model-value="getDistrictHistory"
          />
        </v-col>
        <v-col
          id="currentItemsDisplay"
          cols="4"
        >
          Showing {{
            showingFirstNumber
          }} to {{
            showingEndNumber
          }} of {{
            districtHistory.totalElements || 0
          }}
        </v-col>
      </v-row>
    </v-col>
    <v-col
      v-if="showRecordDetail"
      cols="6"
    >
      <DistrictHistoryDetailPanel
        :next-district-history="nextDistrictHistory"
        :district-history="districtHistory"
        :district-history-id="selectedDistrictHistoryId"
        @close-panel="setShowRecordDetailFalse"
        @update-panel="setSelectedDistrictHistoryId"
      />
    </v-col>
  </v-row>
</template>

<script>
import {Routes} from '@/utils/constants';
import ApiService from '../../../common/apiService';
import alertMixin from '@/mixins/alertMixin';
import router from '@/router';
import {formatDob} from '@/utils/format';
import {mapState} from 'pinia';
import DistrictHistoryDetailPanel from './DistrictHistoryDetailPanel.vue';
import {appStore} from '@/store/modules/app';

export default {
  name: 'DistrictHistory',
  components: {
    DistrictHistoryDetailPanel
  },
  mixins: [alertMixin],
  props: {
    districtID: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      districtHistory: {
        numberOfElements: 0,
        totalElements: 0,
        pageable: {
          pageSize: 0
        }
      },
      showRecordDetail: false,
      loading: true,
      pageNumber: 1,
      pageSize: 15,
      itemsPerPageOptions: [15],
      nextDistrictHistory: [],
      selectedDistrictHistory: [],
      allAuthority: [],
      selectedDistrictHistoryId: null,
      searchParams: {
        districtID: '',
      },
      headers: [
        {title: 'Date', sortable: false, key: 'updateDate', format: this.formatDate, tooltip: 'Activity Date'},
        {title: 'Changed by', sortable: false, key: 'updateUser', tooltip: 'Changed By'},
        {title: 'Status', sortable: false, key: 'districtStatusCode', tooltip: 'Status'},
        {title: 'District Number', sortable: false, key: 'districtNumber', tooltip: 'District Code'},
        {title: 'Name', sortable: false, key: 'displayName', tooltip: 'Name'},
        {title: 'Phone', sortable: false, key: 'phoneNumber', tooltip: 'Phone Number'},
        {title: 'Fax', sortable: false, key: 'faxNumber', tooltip: 'Fax Number'},
        {title: 'Email', sortable: false, key: 'email', tooltip: 'Email'},
        {title: 'Website', sortable: false, key: 'website', tooltip: 'Website'}
      ],
      shortHeaders: [
        {title: 'Date', sortable: false, key: 'updateDate', format: this.formatDate, tooltip: 'Activity Date'},
        {title: 'Changed by', sortable: false, key: 'updateUser', tooltip: 'Changed By'},
        {title: 'Status', sortable: false, key: 'districtStatusCode', tooltip: 'Status'},
        {title: 'Name', sortable: false, key: 'displayName', tooltip: 'Name'}
      ],
    };
  },
  computed: {
    ...mapState(appStore, ['districtMap', 'districtMap']),
    showingFirstNumber() {
      return ((this.pageNumber - 1) * (this.districtHistory.pageable.pageSize || 0) + ((this.districtHistory.numberOfElements || 0) > 0 ? 1 : 0));
    },
    showingEndNumber() {
      return ((this.pageNumber - 1) * (this.districtHistory.pageable.pageSize || 0) + (this.districtHistory.numberOfElements || 0));
    },
  },
  async beforeMount() {
    await appStore().getInstituteCodes();
  },
  mounted() {
    this.getDistrictHistory();
    this.showRecordDetail = false;
  },
  methods: {
    formatTableColumn(format, column) {
      return (format && column) ? format(column) : (column || ' ');
    },
    tableRowClass(item) {
      let rowClass = [];
      item.isSelected && rowClass.push('selected-record');
      return rowClass;
    },
    selectHistoryItem(props) {
      this.setSelectedDistrictHistoryId(props.districtHistoryId);
      this.showRecordDetail = true;
    },
    getHeaders() {
      if (this.showRecordDetail) {
        return this.shortHeaders;
      }
      return this.headers;
    },
    setSelectedDistrictHistoryId(districtHistoryId) {
      this.districtHistory.content.forEach(hist => {
        hist.expanded = false;
        hist.hidden = false;
        hist.isSelected = hist.districtHistoryId === districtHistoryId;
      });
      this.selectedDistrictHistoryId = districtHistoryId;
    },
    compareAddress(preAddress, address) {
      if (!preAddress && !address) {
        return true;
      }
      if ((!preAddress && address) || (preAddress && !address)) {
        return false;
      }
      return preAddress.addressLine1 === address.addressLine1 &&
        preAddress.addressLine2 === address.addressLine2 &&
        preAddress.city === address.city &&
        preAddress.countryCode === address.countryCode &&
        preAddress.postal === address.postal &&
        preAddress.provinceCode === address.provinceCode;
    },
    getDistrictHistory() {
      this.loading = true;
      this.searchParams.districtID = this.districtID;
      const currentPageParams = {
        params: {
          pageSize: 15,
          pageNumber: this.pageNumber - 1,
          sort: {
            createDate: 'DESC'
          },
          searchParams: this.searchParams,
        }
      };

      const nextPageParams = {
        params: {
          pageSize: 1,
          pageNumber: this.pageNumber * currentPageParams.params.pageSize,
          sort: {
            createDate: 'DESC'
          },
          searchParams: this.searchParams,
        }
      };

      return Promise.all([currentPageParams, nextPageParams].map(params => ApiService.apiAxios
        .get(Routes.institute.DISTRICT_HISTORY_PAGINATED_DATA_URL, params)))
        .then(([currentPageResp, nextPageResp]) => {
          this.initializeDistrictHistory(currentPageResp.data, nextPageResp.data);
        })
        .catch(error => {
          this.setFailureAlert('An error occurred while loading the district history. Please try again later.');
          console.log(error);
        })
        .finally(() => this.loading = false);
    },
    setShowRecordDetailFalse(){
      this.showRecordDetail = false;
    },
    checkForDifferences(preHistory, history, key) {
      if (key === 'mailingAddress') {
        history['mailingAddress_diff'] = !this.compareAddress(preHistory.mailingAddress, history.mailingAddress);
        return history;
      } else if (key === 'physicalAddress') {
        history['physicalAddress_diff'] = !this.compareAddress(preHistory.physicalAddress, history.physicalAddress);
        return history;
      } else if (history[key] !== preHistory[key] && !['createDate', 'createUser', 'addresses'].includes(key)) {
        history[`${key}_diff`] = true;
        return history;
      } else {
        history[`${key}_diff`] = false;
        return history;
      }
    },
    markDifferences(currentPageContent, nextPageContent) {
      const historyContent = [...currentPageContent, ...nextPageContent];
      historyContent.forEach((history, index) => {
        if (index < historyContent.length - 1) {
          const preHistory = historyContent[index + 1];
          Object.keys(history).forEach(key => {
            return this.checkForDifferences(preHistory, history, key);
          });
        }
      });
    },
    back() {
      router.push(`/institute/district/${this.districtID}/details`);
    },
    formatDate(datetime) {
      return formatDob(datetime.substring(0, 10), 'uuuu-MM-dd');
    },
    initializeDistrictHistory(currentPageData, nextPageData) {
      [...currentPageData.content, ...nextPageData.content].forEach(history => {
        if (history) {
          this.formatDistrictHistory(history);
        }
      });
      this.markDifferences(currentPageData.content, nextPageData.content);
      this.districtHistory = {
        ...currentPageData,
        content: currentPageData.content,
      };
      this.nextDistrictHistory = nextPageData.content;
    },
    formatDistrictHistory(history) {
      history.updateDateTrunc = history.updateDate.length > 10 ? history.updateDate.substr(0, 10) : history.updateDate;
      history.districtNumber = this.districtMap?.get(history.districtId)?.districtNumber;
      history.mailingAddress = history.addresses?.find(address => address.addressTypeCode === 'MAILING');
      history.physicalAddress = history.addresses?.find(address => address.addressTypeCode === 'PHYSICAL') ?? history.addresses?.find(address => address.addressTypeCode === 'MAILING');
      return history;
    }
  },
};
</script>

<style scoped>
#auditHistory /deep/ .v-pagination__navigation > i {
    padding-left: 0;
}

#districtHistoryTable /deep/ table {
    border-spacing: 0 0.25rem;
    border-bottom: thin solid #d7d7d7;
}

#districtHistoryTable /deep/ table th {
    font-size: 0.875rem;
}

#districtHistoryTable /deep/ table td {
    border-bottom: none !important;
}

#districtHistoryTable /deep/ table tr.selected-record,
#districtHistoryTable /deep/ table tbody tr:hover {
    background-color: #E1F5FE !important;
}

.diff-value {
    font-weight: bold;
}


.hoverTable {
    border-bottom-style: groove;
    border-left-style: groove;
    border-right-style: groove;
    border-color: rgb(255 255 255 / 45%);
}

.hoverTable:nth-child(1) {
    border-top-style: groove;
}

.hoverTable:hover {
    background-color: #e8e8e8;
    cursor: pointer;
}

.hoverTable:hover td {
    background-color: transparent; /* or #000 */
}

.selected-record{
   background-color: #E1F5FE !important;
}

.selected-record td{
   background-color:  #E1F5FE !important;
}

:deep(.v-data-table-footer) {
  display: none;
}

.divider {
    border-color: #FCBA19;
    border-width: unset;
}
</style>
  
