<template>
  <v-container class="containerSetup" fluid>
    <Spinner v-if="loadingDistricts"/>
    <div v-else>
      <v-row>
        <v-col class="mt-1 d-flex justify-start">
          <v-icon small color="#1976d2">mdi-arrow-left</v-icon>
          <a class="ml-1" @click="backButtonClick">Return to Dashboard</a>
        </v-col>
      </v-row>
      <!--    search filter -->
      <v-row :class="['d-sm-flex', 'align-center', 'searchBox', 'elevation-2']" @keydown.enter="searchButtonClick">
        <v-col cols="12" md="5">
          <v-autocomplete
            id="name-text-field"
            label="District Number and Name"
            item-value="districtId"
            item-text="districtNumberName"
            :items="districtSearchNames"
            v-model="searchFilter.districtId"
            clearable>
          </v-autocomplete>
        </v-col>
        <v-col cols="12" md="3">
          <v-select id="status-select-field" clearable :items="status" v-model="searchFilter.status" item-text="label" item-value="districtStatusCode" label="Status"></v-select>
        </v-col>
        <v-col cols="12" md="4" :class="['text-right']">
          <PrimaryButton id="district-clear-button" secondary @click.native="clearButtonClick">Clear</PrimaryButton>
          <PrimaryButton id="district-search-button" class="ml-2" @click.native="searchButtonClick">Search</PrimaryButton>
        </v-col>
      </v-row>

      <v-data-table
        :headers="headers"
        :items="filteredDistrictList"
        :items-per-page=1000
        class="elevation-2 mt-4"
        hide-default-header
        hide-default-footer
        mobile-breakpoint="0"
      >

        <template v-slot:item.secureExchangeStatusCode="{ item }">
          <v-row>
            <v-col cols="6">
              <strong class="largeFont">{{ `${item.districtNumber} - ${item.name}` }}</strong>
            </v-col>
            <v-spacer></v-spacer>
            <v-col cols="3">
              <v-row no-gutters>
                <v-col>
                  <v-icon :color="getStatusColor(item.districtStatusCode)">
                    mdi-circle-medium
                  </v-icon>
                  <span class="largeFont">{{ getStatusText(item.districtStatusCode) }}</span>
                </v-col>
              </v-row>
              <v-row no-gutters>
                <v-col class="mt-1">
                  <v-icon>
                    mdi-phone-outline
                  </v-icon>
                  <span class="largeFont">{{ getPhoneNumber(item.phoneNumber) }}</span>
                </v-col>
              </v-row>
            </v-col>
            <v-col class="d-flex justify-end">
              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn id="districtContacts"
                         color="#003366"
                         outlined
                         @click.native.stop="openAuthorityContacts(item.independentAuthorityId)"
                         class="mt-0 pt-0 filterButton ml-2"
                         style="text-transform: initial"
                         v-on="on"
                  >
                    <v-icon color="#003366" style="margin-top: 0.07em" dark>mdi-account-multiple-outline</v-icon>
                  </v-btn>
                </template>
                <span>View Contacts</span>
              </v-tooltip>
            </v-col>
          </v-row>
        </template>

        <template v-slot:no-data>There are no districts.</template>

      </v-data-table>
    </div>
  </v-container>
</template>
<script>

import {formatPhoneNumber, sortByNameValue} from '@/utils/format';
import router from '@/router';
import ApiService from '@/common/apiService';
import {setEmptyInputParams} from '@/utils/common';

import alertMixin from '@/mixins/alertMixin';
import PrimaryButton from '@/components/util/PrimaryButton';
import Spinner from '@/components/common/Spinner';


export default {
  name: 'instituteDistrict',
  components: {PrimaryButton, Spinner},
  mixins: [alertMixin],
  async beforeMount() {
    this.getDistricts();
  },
  data() {
    return {
      headers: [
        {
          text: 'Status',
          align: 'start',
          sortable: false,
          value: 'secureExchangeStatusCode',
        }
      ],
      searchFilter: {
        name: '',
        status: 'ACTIVE'
      },
      status: [
        {label: 'Active', districtStatusCode: 'ACTIVE'},
        {label: 'Inactive', districtStatusCode: 'INACTIVE'}
      ],
      districtList: [],
      districtSearchNames: [],
      filteredDistrictList: [],
      loadingDistricts: true
    };
  },
  methods: {
    getDistricts() {
      this.loadingDistricts = true;
      ApiService.getDistricts({params: {refreshCache: true}}).then((response) => {
        this.districtList = response.data;
        for(const district of this.districtList){
          let districtItem = {
            districtNumberName: district.districtNumber + ' - ' + district.name,
            districtId: district.districtId,
          };
          this.districtSearchNames.push(districtItem);
        }
        this.districtSearchNames = this.sortByNameValue(this.districtSearchNames, 'districtNumberName');
        this.districtList = this.sortByNameValue(this.districtList, 'districtNumber');
        this.searchButtonClick();
      }).catch(error => {
        console.error(error);
        this.setFailureAlert('An error occurred while getting districts. Please try again later.');
      }).finally(() => {
        this.loadingDistricts = false;
      });
    },
    sortByNameValue,
    getStatusColor(districtStatusCode){
      if(districtStatusCode === 'ACTIVE') {
        return 'green';
      } else if(districtStatusCode === 'INACTIVE') {
        return 'red';
      }
    },
    getStatusText(districtStatusCode) {
      if (districtStatusCode === 'ACTIVE') {
        return 'Active';
      } else if (districtStatusCode === 'INACTIVE') {
        return 'Inactive';
      }
    },
    getPhoneNumber(phoneNumber) {
      return formatPhoneNumber(phoneNumber);
    },
    clearButtonClick() {
      setEmptyInputParams(this.searchFilter);
      this.searchButtonClick();
    },
    searchButtonClick() {
      this.filteredDistrictList = this.districtList
        .filter(district => {
          return this.districtIdFilter(district, this.searchFilter?.districtId) && this.statusFilter(district, this.searchFilter?.status);
        });
    },
    districtIdFilter(district, districtId) {
      if (districtId) {
        return district.districtId === districtId;
      }

      return true;
    },
    statusFilter(district, statusCode) {
      if (statusCode) {
        return district.districtStatusCode === statusCode;
      }

      return true;
    },
    backButtonClick() {
      router.push({name: 'home'});
    }
  },
};

</script>

<style scoped>

.searchBox {
  padding-left: 1em;
  padding-right: 1em;
  margin-left: 0;
  margin-right: 0;
  border-radius: 5px;
  background-color: #F2F2F2;
}

.largeFont {
  font-size: large;
}

.containerSetup{
  padding-right: 40em !important;
  padding-left: 40em !important;
}

@media screen and (max-width: 1950px) {
  .containerSetup{
    padding-right: 30em !important;
    padding-left: 30em !important;
  }
}

@media screen and (max-width: 1200px) {
  .containerSetup{
    padding-right: 4em !important;
    padding-left: 4em !important;
  }
}
</style>

