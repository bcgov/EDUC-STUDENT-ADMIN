<template>
  <v-container class="fill-height">
    <v-row class="fill-height">
      <v-col cols="12">
        <v-row no-gutters class="flex-grow-0">
          <v-card height="100%" width="100%" elevation=0>
            <v-card-title class="pb-0 px-0">PEN Retrieval Requests</v-card-title>
            <v-divider class="pb-4"/>
          </v-card>
        </v-row>
        <v-row no-gutters>
          <v-card height="100%" width="100%"  style="background-color:#38598a;">
            <v-combobox
              id="status-dropdown"
              :key="comboboxKey"
              :mandatory="false"
              :items="statusCodes"
              v-model="selectedStatuses"
              label="Select PEN request statuses to view"
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
              :items="penRequests"
              :items-per-page="pageSize"
              :page="pageNumber+1"
              :footer-props="{
                'items-per-page-options':itemsPerPageOptions
              }"
              :server-items-length="totalRequests"
              :loading="loadingTable"
              @click:row="viewRequestDetails"
              @update:page="changePage"
              @update:items-per-page="changeItemsPerPage"
              class="fill-height">
              <template v-slot:header.penRequestStatusCode.label="{ header }">
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
                      :value="headerSearchParams.initialSubmitDate? headerSearchParams.initialSubmitDate.join(): ''"
                      outlined
                      dense
                      readonly
                      clearable
                      @click:clear="headerSearchParams.initialSubmitDate = []"
                      v-on="on"
                      class="header-text"
                    ></v-text-field>
                  </template>
                  <v-date-picker id="date-picker" v-model="headerSearchParams.initialSubmitDate" no-title range >
                    <v-spacer></v-spacer>
                    <v-btn id="date-picker-ok-button" text color="primary" @click="dateMenu=false">OK</v-btn>
                  </v-date-picker>
                </v-menu>
              </template>
              <template v-slot:header.pen="{ header }">
                <th id="pen-header" :class="['table-header ', header.value === headerSortParams.currentSort ? 'active' : '']" @click="sort(header.value)">
                  {{ header.text }}
                  <em
                          :class="['v-icon v-data-table-header__icon fas ', headerSortParams.currentSortDir ? 'fa-sort-down' : 'fa-sort-up', header.value === headerSortParams.currentSort ? 'active' : '']">
                  </em>
                </th>
                <v-text-field id="pen-text-field" v-model="headerSearchParams.pen" class="header-text" outlined dense clearable></v-text-field>
              </template>
              <template v-slot:header.legalLastName="{ header }">
                <th id="last-name-header" :class="['table-header ', header.value === headerSortParams.currentSort ? 'active' : '']" @click="sort(header.value)">
                  {{ header.text }}
                  <em
                    :class="['v-icon v-data-table-header__icon fas ', headerSortParams.currentSortDir ? 'fa-sort-down' : 'fa-sort-up', header.value === headerSortParams.currentSort ? 'active' : '']">
                  </em>
                </th>
                <v-text-field id="last-name-text-field" v-model="headerSearchParams.legalLastName" class="header-text" outlined dense clearable></v-text-field>
              </template>
              <template v-slot:header.legalFirstName="{ header }">
                <th id="first-name-header" :class="['table-header ', header.value === headerSortParams.currentSort ? 'active' : '']" @click="sort(header.value)">
                  {{ header.text }}
                  <em
                          :class="['v-icon v-data-table-header__icon fas ', headerSortParams.currentSortDir ? 'fa-sort-down' : 'fa-sort-up', header.value === headerSortParams.currentSort ? 'active' : '']">
                  </em>
                </th>
                <v-text-field id="first-name-text-field" v-model="headerSearchParams.legalFirstName" class="header-text" outlined dense clearable></v-text-field>
              </template>
              <template v-slot:header.reviewer="{ header }">
                <th id="reviewer-header" :class="['table-header ', header.value === headerSortParams.currentSort ? 'active' : '']" @click="sort(header.value)">
                  {{ header.text }}
                  <em
                          :class="['v-icon v-data-table-header__icon fas ', headerSortParams.currentSortDir ? 'fa-sort-down' : 'fa-sort-up', header.value === headerSortParams.currentSort ? 'active' : '']">
                  </em>
                </th>
                <v-text-field id="review-text-field" v-model="headerSearchParams.reviewer" class="header-text" outlined dense clearable></v-text-field>
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
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import ApiService from '../common/apiService';
import { Routes } from '../utils/constants';
export default {
  data () {
    return {
      headers: [
        { text: 'Status',
          value: 'penRequestStatusCode.label',
          sortable: false
        },
        { text: 'Submitted Time',
          value: 'initialSubmitDate',
          sortable: false
        },
        {
          text: 'PEN',
          value: 'pen',
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
      ],
      dateMenu: false,
      headerSearchParams: {},
      headerSortParams: {},
      statusCodes:[],
      pageNumber: 0,
      pageSize: 15,
      itemsPerPageOptions: [5,10,15,20,50],
      selectedStatuses:[],
      penRequests: [],
      totalRequests: 0,
      initialLoad: true,
      loadingTable: true,
      loadingSelect: true,
      errored: false,
      comboboxKey:0
    };
  },
  mounted() {
    this.initialLoad = true; //stop watch from sending multiple getPenRequests calls on initial page load
    this.headerSearchParams = this.$store.state['penRequest'].headerSearchParams;
    this.headerSortParams = this.$store.state['penRequest'].headerSortParams;
    this.pageSize = this.$store.state['penRequest'].pageSize;
    this.pageNumber = this.$store.state['penRequest'].pageNumber;
    ApiService.apiAxios
      .get(Routes.PEN_REQUEST_STATUSES_URL, )
      .then(response => {
        this.codeTable = response.data;
        this.statusCodes = this.getStatusCodes();
        this.selectedStatuses = this.$store.state['penRequest'].selectedStatuses;
        this.comboboxKey+=1;//force component to re-render
      })
      .catch(error => {
        console.log(error);
        this.errored = true;
      })
      .finally(() => {
        this.initialLoad = false;
        this.getPenRequests();
        this.getDocumentTypes();
        this.loadingSelect = false;
      });
  },
  computed: {
    filteredResults() {
      if(!Array.isArray(this.selectedStatuses) || !this.selectedStatuses.length || !Array.isArray(this.penRequests) || !this.penRequests.length) {return this.penRequests;}
      return this.penRequests.filter((request) => this.selectedStatuses.includes(request.penRequestStatusCode.label));
    }
  },
  watch: {
    headerSortParams: {
      deep: true,
      handler() {
        if(!this.initialLoad) { //stop watch from sending multiple getPenRequests calls on initial page load
          this.getPenRequests();
        }
      }
    },
    selectedStatuses: {
      handler() {
        if(!this.initialLoad) { //stop watch from sending multiple getPenRequests calls on initial page load
          this.getPenRequests();
        }
      }
    },
    headerSearchParams: {
      deep: true,
      handler() {
        if(!this.initialLoad) { //stop watch from sending multiple getPenRequests calls on initial page load
          this.getPenRequests();
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
    changeItemsPerPage(value) {
      this.pageSize = value;
      this.getPenRequests();
    },
    changePage(value) {
      this.pageNumber = value-1;
      this.getPenRequests();
    },
    getPenRequests () {
      this.loadingTable = true;
      const sort = {};
      sort[this.headerSortParams.currentSort === 'penRequestStatusCode.label' ? 'penRequestStatusCode' : this.headerSortParams.currentSort] = this.headerSortParams.currentSortDir ? 'DESC' : 'ASC';
      const headerKeys = Object.keys(this.headerSearchParams).filter(k => this.headerSearchParams[k]!== undefined && this.headerSearchParams[k] !== null && this.headerSearchParams[k].length !== 0);
      let headerFilters;
      if (headerKeys && headerKeys.length > 0) {
        headerFilters = {};
        headerKeys.forEach(element => {
          headerFilters[element] = this.headerSearchParams[element];
        });
      }
      ApiService.apiAxios
        .get(Routes.PEN_REQUEST_ENDPOINT, {
          params: {
            pageNumber: this.pageNumber,
            pageSize: this.pageSize,
            sort: sort,
            statusFilters: this.selectedStatuses,
            headerFilters: headerFilters
          }
        })
        .then(response => {
          this.penRequests = response.data['content'];
          this.totalRequests = response.data['totalElements'];
        })
        .catch(error => {
          console.log(error);
          this.errored = true;
        })
        .finally(() => this.loadingTable = false);
    },
    viewRequestDetails (request) {
      this.$store.state['penRequest'].selectedRequest = request['penRequestID'];
      this.$store.state['penRequest'].selectedStatuses = this.selectedStatuses;
      this.$store.state['penRequest'].pageSize = this.pageSize;
      this.$store.state['penRequest'].pageNumber = this.pageNumber;
    },
    sort(sortHeader) {
      if(sortHeader === this.headerSortParams.currentSort) {
        this.headerSortParams.currentSortDir = !this.headerSortParams.currentSortDir;
      }
      this.headerSortParams.currentSort = sortHeader;
    },
    getDocumentTypes() {
      ApiService.apiAxios
        .get(Routes.DOCUMENT_TYPES_URL)
        .then(response => {
          if(response && response.data) {
            this.$store.state['penRequest'].documentTypes = response.data;
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
