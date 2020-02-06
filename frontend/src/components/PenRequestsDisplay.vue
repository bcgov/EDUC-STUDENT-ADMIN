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
              :sort-by="['initialSubmitDate']"
              :items-per-page="15"
              :loading="loadingTable"
              @click:row="viewRequestDetails"
              class="fill-height">
              <template v-slot:header.initialSubmitDate="{ header }">
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
                      v-model="initialSubmitDate"
                      v-bind:label="header.text"
                      outlined
                      dense
                      placeholder=" "
                      readonly
                      v-on="on"
                    ></v-text-field>
                  </template>
                  <v-date-picker v-model="initialSubmitDate" no-title range>
                    <v-spacer></v-spacer>
                    <v-btn text color="primary" @click="dateMenu = false">Cancel</v-btn>
                    <v-btn text color="primary" @click="$refs.dateMenu.save(initialSubmitDate)">OK</v-btn>
                  </v-date-picker>
                </v-menu>
              </template>
              <template v-slot:header.penRequestStatusCode.label="{ header }">
                <v-text-field v-model="status" v-bind:label="header.text" placeholder=" " outlined dense></v-text-field>
              </template>
              <template v-slot:header.legalLastName="{ header }">
                <v-text-field v-model="legalLastName" v-bind:label="header.text" placeholder=" " outlined dense></v-text-field>
              </template>
              <template v-slot:header.legalFirstName="{ header }">
                <v-text-field v-model="legalFirstName" v-bind:label="header.text" placeholder=" " outlined dense></v-text-field>
              </template>
              <template v-slot:header.reviewer="{ header }">
                <v-text-field v-model="reviewer" v-bind:label="header.text" placeholder=" " outlined dense></v-text-field>
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
import ApiService from '@/common/apiService.js';
import { Routes } from '@/utils/constants';
export default {
  data () {
    return {
      headers: [
        { text: 'Submitted Time',
          value: 'initialSubmitDate',
          sortable: false,
          filter: value => {
            if(this.initialSubmitDate.length < 2) return true;
            if(!value) return false;
            const start = this.initialSubmitDate[0].split('-');
            const end = this.initialSubmitDate[1].split('-');
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
            if(!this.status) return true;
            if(!value) return false;
            return value.toUpperCase().includes(this.status.toUpperCase());
          }
        },
        { text: 'Last Name',
          value: 'legalLastName',
          sortable: false,
          filter: value => {
            if(!this.legalLastName) return true;
            if(!value) return false;
            return value.toUpperCase().includes(this.legalLastName.toUpperCase());
          }
        },
        { text: 'First Name',
          value: 'legalFirstName',
          sortable: false,
          filter: value => {
            if(!this.legalFirstName) return true;
            if(!value) return false;
            return value.toUpperCase().includes(this.legalFirstName.toUpperCase());
          }
        },
        { text: 'Reviewer',
          value: 'reviewer',
          sortable: false,
          filter: value => {
            if(!this.reviewer) return true;
            if(!value) return false;
            return value.toUpperCase().includes(this.reviewer.toUpperCase());
          }
        },
      ],
      dateMenu: false,
      initialSubmitDate: [],
      status: '',
      legalLastName: '',
      legalFirstName: '',
      reviewer: '',
      statusCodes:[],
      defaultSelected:[],
      penRequests: [],
      loadingTable: true,
      loadingSelect: true,
      errored: false,
      comboboxKey:0,
    };
  },
  mounted() {
    ApiService.apiAxios
      .get(Routes.PEN_REQUEST_STATUSES_URL)
      .then(response => {
        this.codeTable = response.data;
        this.statusCodes = this.getStatusCodes();

        if(this.statusCodes.includes('First Review') && this.statusCodes.includes('Subsequent Review')){
          this.defaultSelected[0] = 'First Review';
          this.defaultSelected[1] = 'Subsequent Review';
        }

        this.comboboxKey+=1;//force component to re-render
        this.getPenRequests(this.defaultSelected);
      })
      .catch(error => {
        console.log(error);
        this.errored = true;
      })
      .finally(() => this.loadingSelect = false);
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
      const id = request.penRequestID;
      this.$router.push({name: 'penrequestdetail', params: { id } });
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
</style>
