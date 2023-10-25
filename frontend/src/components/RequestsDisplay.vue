<template>
  <v-container
    fluid
    class="fill-height mb-10 mt-3 px-16"
  >
    <v-row no-gutters>
      <v-card
        height="100%"
        width="100%"
        style="background-color:#38598a;"
      >
        <v-combobox
          id="status-dropdown"
          :key="comboboxKey"
          v-model="selectedStatuses"
          :mandatory="false"
          :items="statusCodes"
          :label="selectedStatuses.length > 0 ? '' : label"
          multiple
          small-chips
          auto-select-first
          hide-details
          hide-selected
          variant="solo"
          density="compact"
          :loading="loadingSelect"
          class="mx-6 my-6 pa-0"
        >
          <template #selection="{ attrs, item, select, selected }">
            <FilterTag
              :id="item + 'tag'"
              :text="item.title"
              @close-item="remove(item)"
            />
          </template>
        </v-combobox>
        <v-data-table-server
          v-model:items="requests"
          v-model:items-per-page="pageSize"
          v-model:page="pageNumber"
          v-model:items-length="totalRequests"
          :headers="headers"
          :footer-props="{
            'items-per-page-options':itemsPerPageOptions
          }"
          :loading="loadingTable"
          class="fill-height"
          style="border-radius: 0;"
          @click:row="viewRequestDetails"
        >
          <template #[requestStatusHeaderSlotName]="{ column }">
            <th
              id="status-header"
              :class="['table-header ', column.value === headerSortParams.currentSort ? 'active' : '']"
              @click="sort(`${requestType}StatusCode`)"
            >
              {{ column.text }}
              <em
                :class="['v-icon v-data-table-header__icon mdi ', headerSortParams.currentSortDir ? 'mdi-chevron-down' : 'mdi-chevron-up', column.value === headerSortParams.currentSort ? 'active' : '']"
              />
            </th>
          </template>
          <template #column.initialSubmitDate="{ column }">
            <th
              id="submit-date-header"
              :class="['table-header ', column.value === headerSortParams.currentSort ? 'active' : '']"
              @click="sort(column.value)"
            >
              {{ column.text }}
              <em
                :class="['v-icon v-data-table-header__icon mdi ', headerSortParams.currentSortDir ? 'mdi-chevron-down' : 'mdi-chevron-up', column.value === headerSortParams.currentSort ? 'active' : '']"
              />
            </th>
            <v-text-field
              id="date-picker-text-field"
              v-model="headerSearchParams.initialSubmitDate"
              variant="outlined"
              density="compact"
              clearable
              hide-details
              class="header-text"
              type="date"
              @click:clear="headerSearchParams.initialSubmitDate = []"
            />
          </template>
          <template #[penSlotName]="{ column }">
            <th
              id="pen-header"
              :class="['table-header ', column.value === headerSortParams.currentSort ? 'active' : '']"
              @click="sort(column.value)"
            >
              {{ column.text }}
              <em
                :class="['v-icon v-data-table-header__icon mdi ', headerSortParams.currentSortDir ? 'mdi-chevron-down' : 'mdi-chevron-up', column.value === headerSortParams.currentSort ? 'active' : '']"
              />
            </th>
            <v-text-field
              id="pen-text-field"
              v-model.trim="headerSearchParams[penName]"
              class="header-text"
              hide-details
              variant="outlined"
              density="compact"
              clearable
            />
          </template>
          <template #column.legalLastName="{ column }">
            <th
              id="last-name-header"
              :class="['table-header ', column.value === headerSortParams.currentSort ? 'active' : '']"
              @click="sort(column.value)"
            >
              {{ column.text }}
              <em
                :class="['v-icon v-data-table-header__icon mdi ', headerSortParams.currentSortDir ? 'mdi-chevron-down' : 'mdi-chevron-up', column.value === headerSortParams.currentSort ? 'active' : '']"
              />
            </th>
            <v-text-field
              id="last-name-text-field"
              v-model.trim="headerSearchParams.legalLastName"
              class="header-text"
              hide-details
              variant="outlined"
              density="compact"
              clearable
            />
          </template>
          <template #column.legalFirstName="{ column }">
            <th
              id="first-name-header"
              :class="['table-header ', column.value === headerSortParams.currentSort ? 'active' : '']"
              @click="sort(column.value)"
            >
              {{ column.text }}
              <em
                :class="['v-icon v-data-table-header__icon mdi ', headerSortParams.currentSortDir ? 'mdi-chevron-down' : 'mdi-chevron-up', column.value === headerSortParams.currentSort ? 'active' : '']"
              />
            </th>
            <v-text-field
              id="first-name-text-field"
              v-model.trim="headerSearchParams.legalFirstName"
              class="header-text"
              hide-details
              variant="outlined"
              density="compact"
              clearable
            />
          </template>
          <template #column.reviewer="{ column }">
            <th
              id="reviewer-header"
              :class="['table-header ', column.value === headerSortParams.currentSort ? 'active' : '']"
              @click="sort(column.value)"
            >
              {{ column.text }}
              <em
                :class="['v-icon v-data-table-header__icon mdi ', headerSortParams.currentSortDir ? 'mdi-chevron-down' : 'mdi-chevron-up', column.value === headerSortParams.currentSort ? 'active' : '']"
              />
            </th>
            <v-text-field
              id="review-text-field"
              v-model.trim="headerSearchParams.reviewer"
              class="header-text"
              variant="outlined"
              hide-details
              density="compact"
              clearable
            />
          </template>
          <template #no-data>
            There are no requests with the selected statuses.
          </template>
          <template #item="{ item }">
            <tr
              class="hoverTable"
              :class="item.sagaInProgress? 'blue-grey lighten-3 tableRow' :'tableRow'"
              @click="viewRequestDetails(item)"
            >
              <td>{{ item[`${requestType}StatusCode`].label }}</td>
              <td>{{ getMomentDate(item.initialSubmitDate) }}</td>
              <td>
                {{ item[`${penName}`] }}
                <ClipboardButton
                  v-if="item[`${penName}`]"
                  :copy-text="item[`${penName}`]"
                  icon="mdi-content-copy"
                />
              </td>
              <td>{{ item.legalLastName }}</td>
              <td>{{ item.legalFirstName }}</td>
              <td>{{ item.reviewer }}</td>
            </tr>
          </template>
        </v-data-table-server>
      </v-card>
    </v-row>
  </v-container>
</template>

<script>
import {mapActions, mapState} from 'pinia';
import ApiService from '../common/apiService';
import {REQUEST_TYPES, Routes} from '@/utils/constants';
import router from '../router';
import ClipboardButton from './util/ClipboardButton.vue';
import FilterTag from './util/FilterTag.vue';
import {notificationsStore} from '@/store/modules/notifications';
import {appStore} from '@/store/modules/app';
import {getMomentDate} from '@/utils/dateHelpers';
import {getRequestStore} from '@/utils/common';

export default {
  name: 'RequestsDisplay',
  components: {FilterTag, ClipboardButton},
  props: {
    requestType: {
      type: String,
      required: true
    },
    label: {
      type: String,
      required: true
    },
    penName: {
      type: String,
      default: 'pen'
    }
  },
  data() {
    return {
      dateMenu: false,
      headerSearchParams: {},
      headerSortParams: {},
      statusCodes: [],
      pageNumber: 1,
      pageSize: 15,
      itemsPerPageOptions: [5, 10, 15, 20, 50],
      selectedStatuses: [],
      requests: [],
      totalRequests: 0,
      initialLoad: true,
      loadingTable: true,
      loadingSelect: true,
      errored: false,
      comboboxKey: 0,
    };
  },
  mounted() {
    this.runInit();
  },
  computed: {
    ...mapState(notificationsStore, ['notification']),
    filteredResults() {
      if (
        !Array.isArray(this.selectedStatuses) ||
        !this.selectedStatuses.length ||
        !Array.isArray(this.requests) ||
        !this.requests.length
      ) {
        return this.requests;
      }
      return this.requests.filter(request =>
        this.selectedStatuses.includes(
          request[this.requestStatusCodeName].label
        )
      );
    },
    requestStatusCodeName() {
      return `${this.requestType}StatusCode`;
    },
    requestStatusHeaderSlotName() {
      return `column.${this.requestStatusCodeName}`;
    },
    headers() {
      return [
        {
          text: 'Status',
          value: this.requestStatusCodeName,
          sortable: false,
          key: this.requestStatusCodeName
        },
        {text: 'Submitted Time', value: 'initialSubmitDate', sortable: false, key: 'initialSubmitDate'},
        {
          text: 'PEN',
          value: this.penName,
          sortable: false,
          key: this.penName
        },
        {text: 'Last Name', value: 'legalLastName', sortable: false, key: 'legalLastName'},
        {text: 'First Name', value: 'legalFirstName', sortable: false, key: 'legalFirstName'},
        {text: 'Reviewer', value: 'reviewer', sortable: false, key: 'reviewer'}
      ];
    },
    penSlotName() {
      return `column.${this.penName}`;
    },
    requestIdName() {
      return `${this.requestType}ID`;
    },
  },
  watch: {
    requestType: {
      handler() {
        this.runInit();
      }
    },
    pageNumber: {
      handler() {
        this.getRequestStore(this.requestType).pageNumber = this.pageNumber;
        if (!this.initialLoad) {
          //stop watch from sending multiple getPenRequests calls on initial page load
          this.getRequests();
        }
      }
    },
    pageSize: {
      handler() {
        this.getRequestStore(this.requestType).pageSize = this.pageSize;
        if (!this.initialLoad) {
          //stop watch from sending multiple getPenRequests calls on initial page load
          this.getRequests();
        }
      }
    },
    headerSortParams: {
      deep: true,
      handler() {
        if (!this.initialLoad) {
          //stop watch from sending multiple getRequests calls on initial page load
          this.getRequests();
        }
      }
    },
    selectedStatuses: {
      handler() {
        this.getRequestStore(this.requestType).setSelectedStatuses(this.selectedStatuses);
        if (!this.initialLoad) {
          //stop watch from sending multiple getRequests calls on initial page load
          this.getRequests();
        }
      }
    },
    headerSearchParams: {
      deep: true,
      handler() {
        if (!this.initialLoad) {
          //stop watch from sending multiple getRequests calls on initial page load
          this.pageNumber = 1; // make it 1 on filter change.
          this.getRequests();
        }
      }
    },
    notification(val) {
      let notificationData = val;
      if (notificationData && this.requests) {
        let sagaCompletedForThisRequest = false;
        let elementOfRequests;
        for (const element of this.requests) {
          if (element[`${this.requestType}ID`] && notificationData[`${this.requestType}ID`]
            && element[`${this.requestType}ID`] === notificationData[`${this.requestType}ID`]
            && ('COMPLETED' === notificationData.sagaStatus || 'FORCE_STOPPED' === notificationData.sagaStatus)) {
            sagaCompletedForThisRequest = true;
            elementOfRequests = element;
            break;
          } else if (element[`${this.requestType}ID`] && notificationData[`${this.requestType}ID`]
            && element[`${this.requestType}ID`] === notificationData[`${this.requestType}ID`]
            && notificationData.sagaStatus === 'INITIATED') {
            element.sagaInProgress = true;
            break;
          }
        }
        if (sagaCompletedForThisRequest && elementOfRequests) {
          ApiService.apiAxios
            .get(Routes[this.requestType].ROOT_ENDPOINT + '/' + elementOfRequests[`${this.requestType}ID`])
            .then(response => {
              elementOfRequests[`${this.requestType}StatusCode`].label = response.data[`${this.requestType}StatusCodeLabel`];
              elementOfRequests[`${this.penName}`] = response.data[`${this.penName}`];
              elementOfRequests.legalLastName = response.data.legalLastName;
              elementOfRequests.legalFirstName = response.data.legalFirstName;
              elementOfRequests.reviewer = response.data.reviewer;
            })
            .catch(error => {
              console.log(error);
            })
            .finally(() => {
              elementOfRequests.sagaInProgress = false;
            });
        }
      }
    }
  },
  methods: {
    ...mapActions(appStore, ['setSelectedRequest', 'setRequest']),
    remove(item) {
      this.selectedStatuses.splice(this.selectedStatuses.indexOf(item), 1);
      this.selectedStatuses = [...this.selectedStatuses];
    },
    async validateForm() {
      const isValid = await this.$refs.form.validate();
      this.validForm = isValid.valid;
    },
    getMomentDate,
    getRequestStore,
    runInit() {
      this.selectedStatuses = this.getRequestStore(this.requestType).selectedStatuses;
      this.requests = [];
      this.initialLoad = true; //stop watch from sending multiple getRequests calls on initial page load
      this.headerSearchParams = this.getRequestStore(this.requestType).headerSearchParams;
      this.headerSortParams = this.getRequestStore(this.requestType).headerSortParams;
      this.pageSize = this.getRequestStore(this.requestType).pageSize;
      this.pageNumber = this.getRequestStore(this.requestType).pageNumber;
      ApiService.apiAxios
        .get(Routes[this.requestType].STATUSES_URL)
        .then(response => {
          this.codeTable = response.data.filter(
            status => status[`${this.requestType}StatusCode`] !== 'AUTO'
          );
          this.statusCodes = this.getStatusCodes();
          this.getRequestStore(this.requestType).setSelectedStatuses(this.selectedStatuses);
          this.comboboxKey += 1; //force component to re-render
        })
        .catch(error => {
          console.log(error);
          this.errored = true;
        })
        .finally(() => {
          this.initialLoad = false;
          this.getRequests();
          this.getDocumentTypes();
          this.loadingSelect = false;
        });
    },
    getStatusCodes() {
      const labels = [];
      this.codeTable.forEach(element => {
        labels.push(element.label);
      });
      return labels.sort();
    },
    getRequests() {
      this.loadingTable = true;
      const sort = {};
      sort[
        this.headerSortParams.currentSort === this.requestStatusHeaderSlotName
          ? this.requestStatusCodeName
          : this.headerSortParams.currentSort
      ] = this.headerSortParams.currentSortDir ? 'DESC' : 'ASC';
      const headerKeys = Object.keys(this.headerSearchParams).filter(
        k =>
          this.headerSearchParams[k] && this.headerSearchParams[k].length !== 0
      );
      let headerFilters;
      if (headerKeys && headerKeys.length > 0) {
        headerFilters = {};
        headerKeys.forEach(element => {
          headerFilters[element] = this.headerSearchParams[element];
        });
      }
      ApiService.apiAxios
        .get(Routes[this.requestType].ROOT_ENDPOINT, {
          params: {
            pageNumber: this.pageNumber - 1,
            pageSize: this.pageSize,
            sort: sort,
            statusFilters: this.selectedStatuses,
            headerFilters: headerFilters
          }
        })
        .then(response => {
          this.requests = response.data['content'];
          this.totalRequests = response.data['totalElements'];
        })
        .catch(error => {
          console.log(error);
          this.errored = true;
        })
        .finally(() => (this.loadingTable = false));
    },
    viewRequestDetails(request) {
      this.setSelectedRequest(request[this.requestIdName]);
      this.setRequest();
      router.push({
        name: REQUEST_TYPES[this.requestType].detailName,
        params: {requestId: request[this.requestType + 'ID']}
      });
    },
    sort(sortHeader) {
      if (sortHeader === this.headerSortParams.currentSort) {
        this.headerSortParams.currentSortDir = !this.headerSortParams
          .currentSortDir;
      }
      this.headerSortParams.currentSort = sortHeader;
    },
    getDocumentTypes() {
      ApiService.apiAxios
        .get(Routes[this.requestType].DOCUMENT_TYPES_URL)
        .then(response => {
          if (response && response.data) {
            this.getRequestStore(this.requestType).setDocumentTypes(response.data);
          }
        })
        .catch(error => {
          console.log(error);
        });
    },
  }
};
</script>
<style scoped>
.header {
    background-color: #96c0e6;
    top: -24px;
}

.v-input {
    padding-bottom: 15px;
    padding-top: 20px;
}

.v-data-table /deep/ .v-text-field__details {
    display: none;
}

label {
    color: white;
}

.v-card {
    background-color: #fafafa;
}

.v-combobox {
    background-color: #5475a7 !important;
}

.theme--light .v-label {
    color: white;
}

.saga-in-progress {
    color: dimgrey;
}

.header-text {
    padding-top: 0;
}

th {
    border: none !important;
    padding-bottom: 0;
    padding-left: 0;
    padding-right: 0;
}

/deep/ th.text-start:nth-child(1) {
    vertical-align: sub;
    padding-top: 10px;
}

.active {
    color: rgba(0, 0, 0, 0.87) !important;
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

.table-header {
    cursor: pointer;
    padding-top: 10px;
    margin-bottom: 0;
    font-size: 0.75em;
}

.v-icon {
    font-size: 18px;
}

.tableRow {
    cursor: pointer;
}

:deep(.v-data-table-footer__items-per-page) {
    display: none;
}

</style>
