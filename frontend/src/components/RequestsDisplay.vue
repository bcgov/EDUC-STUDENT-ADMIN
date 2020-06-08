<template>
  <v-container class="fill-height px-0">
    <!-- <v-row class="fill-height">
      <v-col cols="12">
        <v-row no-gutters class="flex-grow-0">
          <v-card height="100%" width="100%" elevation=0>
            <v-card-title class="pb-0 px-0">PEN Retrieval Requests</v-card-title>
            <v-divider class="pb-4"/>
          </v-card>
        </v-row> -->
        <v-row no-gutters>
          <v-card height="100%" width="100%"  style="background-color:#38598a;">
            <v-combobox
              id="status-dropdown"
              :key="comboboxKey"
              :mandatory="false"
              :items="statusCodes"
              v-model="selectedStatuses"
              :label="label"
              multiple
              small-chips
              auto-select-first
              hide-selected
              solo
              :loading="loadingSelect"
              class="mx-6 mt-6 pa-0">
              <template v-slot:selection="{ attrs, item, select, selected }">
                <v-chip
                  v-bind="attrs"
                  :input-value="selected"
                  label
                  small
                  @click="select"
                >
                  <span class="pr-2">
                    {{ item }}
                  </span>
                  <v-icon
                    small
                    @click="remove(item)"
                  >close</v-icon>
                </v-chip>
              </template>
            </v-combobox>
            <v-data-table
              :headers="headers"
              :items.sync="requests"
              :items-per-page.sync="pageSize"
              :page.sync="pageNumber"
              :footer-props="{
                'items-per-page-options':itemsPerPageOptions
              }"
              :server-items-length="totalRequests"
              :loading="loadingTable"
              @click:row="viewRequestDetails"
              class="fill-height">
              <template v-slot:[requestStatusHeaderSlotName]="{ header }">
                <th id="status-header" :class="['table-header ', header.value === headerSortParams.currentSort ? 'active' : '']" @click="sort(header.value)">
                  {{ header.text }}
                  <em
                          :class="['v-icon v-data-table-header__icon fas ', headerSortParams.currentSortDir ? 'fa-sort-down' : 'fa-sort-up', header.value === headerSortParams.currentSort ? 'active' : '']">
                  </em>
                </th>
              </template>
              <template v-slot:header.initialSubmitDate="{ header }">
                <th id="submit-date-header" :class="['table-header ', header.value === headerSortParams.currentSort ? 'active' : '']" @click="sort(header.value)">
                  {{ header.text }}
                  <em
                          :class="['v-icon v-data-table-header__icon fas ', headerSortParams.currentSortDir ? 'fa-sort-down' : 'fa-sort-up', header.value === headerSortParams.currentSort ? 'active' : '']">
                  </em>
                </th>
                <v-menu
                  ref="dateMenu"
                  v-model="dateMenu"
                  :close-on-content-click="false"
                  :nudge-right="40"
                  transition="scale-transition"
                  offset-y
                  min-width="290px"
                >
                  <template v-slot:activator="{ on }">
                    <v-text-field
                      id="date-picker-text-field"
                      v-model="headerSearchParams.initialSubmitDate"
                      outlined
                      dense
                      readonly
                      v-on="on"
                      class="header-text"
                    ></v-text-field>
                  </template>
                  <v-date-picker id="date-picker" v-model="headerSearchParams.initialSubmitDate" no-title range>
                    <v-spacer></v-spacer>
                    <v-btn id="date-picker-cancel-button" text color="primary" @click="dateMenu = false">Cancel</v-btn>
                    <v-btn id="date-picker-ok-button" text color="primary" @click="$refs.dateMenu.save(headerSearchParams.initialSubmitDate)">OK</v-btn>
                  </v-date-picker>
                </v-menu>
              </template>
              <template v-slot:[penSlotName]="{ header }">
                <th id="pen-header" :class="['table-header ', header.value === headerSortParams.currentSort ? 'active' : '']" @click="sort(header.value)">
                  {{ header.text }}
                  <em
                          :class="['v-icon v-data-table-header__icon fas ', headerSortParams.currentSortDir ? 'fa-sort-down' : 'fa-sort-up', header.value === headerSortParams.currentSort ? 'active' : '']">
                  </em>
                </th>
                <v-text-field id="pen-text-field" v-model="headerSearchParams[penName]" class="header-text" outlined dense></v-text-field>
              </template>
              <template v-slot:header.legalLastName="{ header }">
                <th id="last-name-header" :class="['table-header ', header.value === headerSortParams.currentSort ? 'active' : '']" @click="sort(header.value)">
                  {{ header.text }}
                  <em
                    :class="['v-icon v-data-table-header__icon fas ', headerSortParams.currentSortDir ? 'fa-sort-down' : 'fa-sort-up', header.value === headerSortParams.currentSort ? 'active' : '']">
                  </em>
                </th>
                <v-text-field id="last-name-text-field" v-model="headerSearchParams.legalLastName" class="header-text" outlined dense></v-text-field>
              </template>
              <template v-slot:header.legalFirstName="{ header }">
                <th id="first-name-header" :class="['table-header ', header.value === headerSortParams.currentSort ? 'active' : '']" @click="sort(header.value)">
                  {{ header.text }}
                  <em
                          :class="['v-icon v-data-table-header__icon fas ', headerSortParams.currentSortDir ? 'fa-sort-down' : 'fa-sort-up', header.value === headerSortParams.currentSort ? 'active' : '']">
                  </em>
                </th>
                <v-text-field id="first-name-text-field" v-model="headerSearchParams.legalFirstName" class="header-text" outlined dense></v-text-field>
              </template>
              <template v-slot:header.reviewer="{ header }">
                <th id="reviewer-header" :class="['table-header ', header.value === headerSortParams.currentSort ? 'active' : '']" @click="sort(header.value)">
                  {{ header.text }}
                  <em
                          :class="['v-icon v-data-table-header__icon fas ', headerSortParams.currentSortDir ? 'fa-sort-down' : 'fa-sort-up', header.value === headerSortParams.currentSort ? 'active' : '']">
                  </em>
                </th>
                <v-text-field id="review-text-field" v-model="headerSearchParams.reviewer" class="header-text" outlined dense></v-text-field>
              </template>
              <template v-slot:item.initialSubmitDate="{ item }">
                <span v-if="item.initialSubmitDate == null"></span>
                <span v-else>{{moment(item.initialSubmitDate).format('YYYY-MM-DD LT') }}</span>
              </template>
              <template v-slot:no-data>
                There are no requests with the selected statuses.
              </template>
            </v-data-table>
          </v-card>
        </v-row>
      <!-- </v-col>
    </v-row> -->
  </v-container>
</template>

<script>
import ApiService from '../common/apiService';
import { Routes } from '../utils/constants';
export default {
  name: 'requestsDisplay',
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
  data () {
    return {
      dateMenu: false,
      headerSearchParams: {},
      headerSortParams: {},
      statusCodes:[],
      pageNumber: 1,
      pageSize: 15,
      itemsPerPageOptions: [5,10,15,20,50],
      selectedStatuses:[],
      requests: [],
      totalRequests: 0,
      initialLoad: true,
      loadingTable: true,
      loadingSelect: true,
      errored: false,
      comboboxKey:0,
    };
  },
  mounted() {
    this.initialLoad = true; //stop watch from sending multiple getRequests calls on initial page load
    this.headerSearchParams = this.$store.state[this.requestType].headerSearchParams;
    this.headerSortParams = this.$store.state[this.requestType].headerSortParams;
    this.pageSize = this.$store.state[this.requestType].pageSize;
    this.pageNumber = this.$store.state[this.requestType].pageNumber;
    ApiService.apiAxios
      .get(Routes[this.requestType].STATUSES_URL, )
      .then(response => {
        this.codeTable = response.data;
        this.statusCodes = this.getStatusCodes();
        this.selectedStatuses = this.$store.state[this.requestType].selectedStatuses;
        this.comboboxKey+=1;//force component to re-render
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
  computed: {
    filteredResults() {
      if(!Array.isArray(this.selectedStatuses) || !this.selectedStatuses.length || !Array.isArray(this.requests) || !this.requests.length) {return this.requests;}
      return this.requests.filter((request) => this.selectedStatuses.includes(request[this.requestStatusCodeName].label));
    },
    requestStatusCodeName() {
      return `${this.requestType}StatusCode`;
    },
    requestStatusHeaderName() {
      return `${this.requestStatusCodeName}.label`;
    },
    requestStatusHeaderSlotName() {
      return `header.${this.requestStatusHeaderName}`;
    },
    headers() {
      return [
        { text: 'Status',
          value: this.requestStatusHeaderName,
          sortable: false
        },
        { text: 'Submitted Time',
          value: 'initialSubmitDate',
          sortable: false
        },
        {
          text: 'PEN',
          value: this.penName,
          sortable: false
        },
        { text: 'Last Name',
          value: 'legalLastName',
          sortable: false
        },
        { text: 'First Name',
          value: 'legalFirstName',
          sortable: false
        },
        { text: 'Reviewer',
          value: 'reviewer',
          sortable: false
        },
      ];
    },
    penSlotName() {
      return `header.${this.penName}`;
    },
    requestIdName() {
      return `${this.requestType}ID`;
    }
  },
  watch: {
    pageNumber: {
      handler() {
        this.$store.state[this.requestType].pageNumber = this.pageNumber;
        if(!this.initialLoad) { //stop watch from sending multiple getPenRequests calls on initial page load
          this.getRequests();
        }
      }
    },
    pageSize: {
      handler() {
        this.$store.state[this.requestType].pageSize = this.pageSize;
        if(!this.initialLoad) { //stop watch from sending multiple getPenRequests calls on initial page load
          this.getRequests();
        }
      }
    },
    headerSortParams: {
      deep: true,
      handler() {
        if(!this.initialLoad) { //stop watch from sending multiple getRequests calls on initial page load
          this.getRequests();
        }
      }
    },
    selectedStatuses: {
      handler() {
        this.$store.state[this.requestType].selectedStatuses = this.selectedStatuses;
        if(!this.initialLoad) { //stop watch from sending multiple getRequests calls on initial page load
          this.getRequests();
        }
      }
    },
    headerSearchParams: {
      deep: true,
      handler() {
        if(!this.initialLoad) { //stop watch from sending multiple getRequests calls on initial page load
          this.getRequests();
        }
      }
    }
  },
  methods: {
    remove (item) {
      this.selectedStatuses.splice(this.selectedStatuses.indexOf(item), 1);
      this.selectedStatuses = [...this.selectedStatuses];
    },
    getStatusCodes () {
      const labels = [];
      this.codeTable.forEach(element => {
        labels.push(element.label);
      });
      return labels.sort();
    },
    getRequests () {
      this.loadingTable = true;
      const sort = {};
      sort[this.headerSortParams.currentSort === this.requestStatusHeaderSlotName ? this.requestStatusCodeName : this.headerSortParams.currentSort] = this.headerSortParams.currentSortDir ? 'DESC' : 'ASC';
      const headerKeys = Object.keys(this.headerSearchParams).filter(k => this.headerSearchParams[k].length !== 0);
      let headerFilters;
      if (headerKeys.length > 0) {
        headerFilters = {};
        headerKeys.forEach(element => {
          headerFilters[element] = this.headerSearchParams[element];
        });
      }
      ApiService.apiAxios
        .get(Routes[this.requestType].ROOT_ENDPOINT, {
          params: {
            pageNumber: this.pageNumber-1,
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
        .finally(() => this.loadingTable = false);
    },
    viewRequestDetails (request) {
      this.$store.state['app'].selectedRequest = request[this.requestIdName];
    },
    sort(sortHeader) {
      if(sortHeader === this.headerSortParams.currentSort) {
        this.headerSortParams.currentSortDir = !this.headerSortParams.currentSortDir;
      }
      this.headerSortParams.currentSort = sortHeader;
    },
    getDocumentTypes() {
      ApiService.apiAxios
        .get(Routes[this.requestType].DOCUMENT_TYPES_URL)
        .then(response => {
          if(response && response.data) {
            this.$store.state[this.requestType].documentTypes = response.data;
          }
        })
        .catch(error => {
          console.log(error);
        });
    }
  },
};
</script>
<style scoped>
  .header {
    background-color: #96c0e6;
    top:-24px;
  }
  .v-input {
    padding-bottom: 15px;
    padding-top: 20px;
  }
  .v-data-table /deep/ .v-text-field__details {
    display: none;
  }
  label {
    color:white;
  }
  .v-card {
    background-color:#fafafa;
  }
  .v-combobox {
    background-color:#5475a7 !important;
  }
  .theme--light  .v-label {
    color: white;
  }
  .header-text {
    padding-top: 0;
  }
  th {
    border: none !important;
    padding: 0 !important;
  }
  /deep/ th.text-start:nth-child(1) {
    vertical-align: sub;
    padding-top: 1.2em;
  }
  .active {
    color: rgba(0, 0, 0, 0.87) !important;
  }
  .table-header {
    cursor:pointer;
    padding-top: 10px;
    margin-bottom: 0;
  }
  .v-icon {
    font-size: 18px;
  }
</style>
