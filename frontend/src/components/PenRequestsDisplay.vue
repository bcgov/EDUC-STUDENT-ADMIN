<template>
  <v-container class="fill-height" fluid>
    <v-row style="border: 1px solid red" class="fill-height">
      <v-col cols="12" elevated=4 class="d-flex flex-column grow-shrink-0">
        <v-row no-gutters style="border: 1px solid green" class="flex-grow-0">
          <v-card height="100%" width="100%" elevation=0>
            <v-card-title class="pa-0">PEN Retreival Requests</v-card-title>
            <v-divider/>
            <v-combobox
              :key="comboboxKey"
              :mandatory="false"
              :items="statusCodes"
              label="Select PEN request statuses to view"
              v-model="defaultSelected"
              multiple
              small-chips
              auto-select-first
              hide-selected
              :loading="loadingSelect"
              class="pa-0">
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
          </v-card>
        </v-row>
        <v-row no-gutters style="border: 1px solid yellow">
          <v-card height="100%" width="100%" elevation=0>
            <v-data-table
                :headers="headers"
                :items="filteredResults"
                :sort-by="['createDate']"
                :items-per-page="15"
                :loading="loadingTable"
                style="border: 1px solid black"
                class="fill-height">
                <template v-slot:item.createDate="{ item }">
                  <span>{{new Date(item.createDate).toISOString().replace(/T/, ', ').replace(/\..+/, '') }}</span>
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
import Constants from '@/utils/constants.js';
export default {
  data () {
    return {
      headers: [
        { text: 'Submitted Time', value: 'createDate',  },
        { text: 'Status', value: 'penRequestStatusCode.label' },
        { text: 'Last Name', value: 'legalLastName' },
        { text: 'First Name', value: 'legalFirstName' },
        { text: 'Reviewer', value: 'REVIEWER' },
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
      .get(Constants.codeTableUrl)
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
    getStatusCodes() {
      var labels = [];
      this.codeTable.forEach(element => {
        labels.push(element.label);
      });
      return labels.sort();
    },
    getPenRequests (searchStatuses) {
      ApiService.apiAxios
        .get(Constants.penRequestUrl, {
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
  },
};
</script>
<style scoped>
  .theme--light.v-data-table .v-data-table__actions .v-data-footer {
    position: fixed;
    bottom: 0;
    width: 100%;
}
</style>
