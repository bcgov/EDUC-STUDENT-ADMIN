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
              v-model="defaultSelected"
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
              :items="filteredResults"
              :sort-by.sync="headerSortParams.currentSort"
              :sort-desc.sync="headerSortParams.currentSortDir"
              :items-per-page="15"
              :loading="loadingTable"
              @click:row="viewRequestDetails"
              class="fill-height">
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
              <template v-slot:header.penRequestStatusCode.label="{ header }">
                <th id="status-header" :class="['table-header ', header.value === headerSortParams.currentSort ? 'active' : '']" @click="sort(header.value)">
                  {{ header.text }}
                  <em
                          :class="['v-icon v-data-table-header__icon fas ', headerSortParams.currentSortDir ? 'fa-sort-down' : 'fa-sort-up', header.value === headerSortParams.currentSort ? 'active' : '']">
                  </em>
                </th>
                <v-text-field id="status-text-field" v-model="headerSearchParams.status" class="header-text" outlined dense>></v-text-field>
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
        { text: 'Submitted Time',
          value: 'initialSubmitDate',
          sortable: false,
          filter: value => {
            if(this.headerSearchParams.initialSubmitDate.length < 2) return true;
            if(!value) return false;
            const start = this.headerSearchParams.initialSubmitDate[0].split('-');
            const end = this.headerSearchParams.initialSubmitDate[1].split('-');
            const check = value.substr(0, 10).split('-');

            const startDate = new Date(start[2], parseInt(start[1])-1, start[0]);
            const endDate = new Date(end[2], parseInt(end[1])-1, end[0]);
            const checkDate = new Date(check[2], parseInt(check[1])-1, check[0]);

            return startDate < checkDate && checkDate > endDate;
          }
        },
        { text: 'Status',
          value: 'penRequestStatusCode.label',
          sortable: false,
          filter: value => {
            if(!this.headerSearchParams.status) return true;
            if(!value) return false;
            return value.toUpperCase().includes(this.headerSearchParams.status.toUpperCase());
          }
        },
        { text: 'Last Name',
          value: 'legalLastName',
          sortable: false,
          filter: value => {
            if(!this.headerSearchParams.legalLastName) return true;
            if(!value) return false;
            return value.toUpperCase().includes(this.headerSearchParams.legalLastName.toUpperCase());
          }
        },
        { text: 'First Name',
          value: 'legalFirstName',
          sortable: false,
          filter: value => {
            if(!this.headerSearchParams.legalFirstName) return true;
            if(!value) return false;
            return value.toUpperCase().includes(this.headerSearchParams.legalFirstName.toUpperCase());
          }
        },
        { text: 'Reviewer',
          value: 'reviewer',
          sortable: false,
          filter: value => {
            if(!this.headerSearchParams.reviewer) return true;
            if(!value) return false;
            return value.toUpperCase().includes(this.headerSearchParams.reviewer.toUpperCase());
          }
        },
      ],
      dateMenu: false,
      headerSearchParams: {},
      headerSortParams: {},
      statusCodes:[],
      defaultSelected:[],
      penRequests: [],
      loadingTable: true,
      loadingSelect: true,
      errored: false,
      comboboxKey:0
    };
  },
  mounted() {
    ApiService.apiAxios
      .get(Routes.PEN_REQUEST_STATUSES_URL)
      .then(response => {
        this.codeTable = response.data;
        this.statusCodes = this.getStatusCodes();

        if(this.$store.state['penRequest'].defaultSelected.length) {
          this.defaultSelected = this.$store.state['penRequest'].defaultSelected;
        } else if(this.statusCodes.includes('First Review') && this.statusCodes.includes('Subsequent Review')){
          this.defaultSelected[0] = 'First Review';
          this.defaultSelected[1] = 'Subsequent Review';
        }

        this.comboboxKey+=1;//force component to re-render
        this.getPenRequests(this.defaultSelected);
        this.getDocumentTypes();
      })
      .catch(error => {
        console.log(error);
        this.errored = true;
      })
      .finally(() => this.loadingSelect = false);

    this.headerSearchParams = this.$store.state['penRequest'].headerSearchParams;
    this.headerSortParams = this.$store.state['penRequest'].headerSortParams;
  },
  computed: {
    filteredResults() {
      if(!Array.isArray(this.defaultSelected) || !this.defaultSelected.length || !Array.isArray(this.penRequests) || !this.penRequests.length) {return this.penRequests;}
      return this.penRequests.filter((request) => this.defaultSelected.includes(request.penRequestStatusCode.label));
    }
  },
  methods: {
    remove (item) {
      this.defaultSelected.splice(this.defaultSelected.indexOf(item), 1);
      this.defaultSelected = [...this.defaultSelected];
      this.getPenRequests(this.defaultSelected);
    },
    getStatusCodes () {
      const labels = [];
      this.codeTable.forEach(element => {
        labels.push(element.label);
      });
      return labels.sort();
    },
    getPenRequests (searchStatuses) {
      ApiService.apiAxios
        .get(Routes.PEN_REQUEST_ENDPOINT, {
          params: {
            queryParams: searchStatuses
          }
        })
        .then(response => {
          this.penRequests = response.data;
        })
        .catch(error => {
          console.log(error);
          this.errored = true;
        })
        .finally(() => this.loadingTable = false);
    },
    viewRequestDetails (request) {
      this.$store.state['penRequest'].selectedRequest = request['penRequestID'];
      this.$store.state['penRequest'].defaultSelected = this.defaultSelected;
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
