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
              <template v-slot:item.initialSubmitDate="{ item }">
                <span>{{moment(item.initialSubmitDate).format('YYYY-MM-DD LT') }}</span>
              </template>
              <template v-slot:item.action="{ item }">
                <v-icon
                  small
                  class="mr-2"
                  @click="editItem(item)"
                >
                  edit
                </v-icon>
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
        { text: 'Submitted Time', value: 'initialSubmitDate',  },
        { text: 'Status', value: 'penRequestStatusCode.label' },
        { text: 'Last Name', value: 'legalLastName' },
        { text: 'First Name', value: 'legalFirstName' },
        { text: 'Reviewer', value: 'reviewer' },
      ],
      fakeData:[
        {
          initialSubmitDate: '2020-12-02',
          penRequestStatusCode: {
            label: 'Submitted'
          },
          legalLastName: 'Cox',
          legalFirstName: 'John',
          REVIEWER: 'JC',
          penRequestID: '12920158-3978-11ea-a137-2e728ce88125'
        },
      ],
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
