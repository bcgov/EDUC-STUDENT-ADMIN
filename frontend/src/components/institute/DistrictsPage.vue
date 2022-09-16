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
      <v-row :class="['d-sm-flex', 'align-center', 'searchBox']" @keydown.enter="searchButtonClick">
        <v-col cols="12" md="4">
          <v-text-field id="name-text-field" label="District Number and Name" v-model="searchFilter.name" clearable></v-text-field>
        </v-col>
        <v-col cols="12" md="4">
          <v-select id="status-select-field" clearable :items="status" v-model="searchFilter.status" item-text="label" item-value="districtStatusCode" label="Status"></v-select>
        </v-col>
        <v-col cols="12" md="4" :class="['text-right']">
          <PrimaryButton id="district-clear-button" secondary @click.native="clearButtonClick">Clear</PrimaryButton>
          <PrimaryButton id="district-search-button" class="ml-2" @click.native="searchButtonClick">Search</PrimaryButton>
        </v-col>
      </v-row>
      <!--    district list -->
      <v-row>
        <v-col>
          <div v-if="filteredDistrictList.length === 0">No Districts Found</div>
          <v-card v-for="district in filteredDistrictList" :key="district.districtId">
            <v-card-text>
              <v-row no-gutters>
                <v-col>
                  <strong>{{ `${district.districtNumber} - ${district.name}` }}</strong>
                </v-col>
                <v-spacer></v-spacer>
                <v-col lg="2" md="3" sm="4">
                  <v-row no-gutters>
                    <v-col>
                      <v-icon :color="getStatusColor(district.districtStatusCode)">
                        mdi-circle-medium
                      </v-icon>
                      <span>{{ getStatusText(district.districtStatusCode) }}</span>
                    </v-col>
                  </v-row>
                  <v-row no-gutters>
                    <v-col>
                      <v-icon>
                        mdi-phone-outline
                      </v-icon>
                      <span>{{ getPhoneNumber(district.phoneNumber) }}</span>
                    </v-col>
                  </v-row>
                </v-col>
                <v-col lg="2" md="3" sm="4">
                  <v-row class="mb-1" no-gutters>
                    <v-col>
                      <PrimaryButton class="districtDetailButton" width="100%" secondary icon="mdi-domain">District Details</PrimaryButton>
                    </v-col>
                  </v-row>
                  <v-row no-gutters>
                    <v-col>
                      <PrimaryButton class="districtContactButton" width="100%" secondary icon="mdi-account-multiple-outline">District Contacts</PrimaryButton>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>
<script>

import {formatPhoneNumber} from '@/utils/format';
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
      searchFilter: {
        name: '',
        status: 'ACTIVE'
      },
      status: [
        {label: 'Open', districtStatusCode: 'ACTIVE'},
        {label: 'Closed', districtStatusCode: 'INACTIVE'}
      ],
      districtList: [],
      filteredDistrictList: [],
      loadingDistricts: true
    };
  },
  methods: {
    getDistricts() {
      this.loadingDistricts = true;
      ApiService.getDistricts({params: {refreshCache: true}}).then((response) => {
        this.districtList = response.data;
        this.searchButtonClick();
      }).catch(error => {
        console.error(error);
        this.setFailureAlert('An error occurred while getting districts. Please try again later.');
      }).finally(() => {
        this.loadingDistricts = false;
      });
    },
    getStatusColor(districtStatusCode){
      if(districtStatusCode === 'ACTIVE') {
        return 'green';
      } else if(districtStatusCode === 'INACTIVE') {
        return 'red';
      }
    },
    getStatusText(districtStatusCode) {
      if (districtStatusCode === 'ACTIVE') {
        return 'Open';
      } else if (districtStatusCode === 'INACTIVE') {
        return 'Closed';
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
          return this.nameFilter(district, this.searchFilter?.name) && this.statusFilter(district, this.searchFilter?.status);
        });
    },
    nameFilter(district, name) {
      if (name) {
        return `${district.districtNumber} ${district.name}`.toLowerCase().includes(name.toLowerCase());
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

.containerSetup{
  padding-right: 32em !important;
  padding-left: 32em !important;
}

@media screen and (max-width: 1950px) {
  .containerSetup{
    padding-right: 20em !important;
    padding-left: 20em !important;
  }
}

@media screen and (max-width: 1200px) {
  .containerSetup{
    padding-right: 4em !important;
    padding-left: 4em !important;
  }
}
</style>

