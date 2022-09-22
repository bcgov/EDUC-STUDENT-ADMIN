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
                  <strong class="largeFont">{{ `${district.districtNumber} - ${district.name}` }}</strong>
                </v-col>
                <v-spacer></v-spacer>
                <v-col lg="2" md="3" sm="4">
                  <v-row no-gutters>
                    <v-col>
                      <v-icon :color="getStatusColor(district.districtStatusCode)">
                        mdi-circle-medium
                      </v-icon>
                      <span class="largeFont">{{ getStatusText(district.districtStatusCode) }}</span>
                    </v-col>
                  </v-row>
                  <v-row no-gutters>
                    <v-col class="mt-1">
                      <v-icon>
                        mdi-phone-outline
                      </v-icon>
                      <span class="largeFont">{{ getPhoneNumber(district.phoneNumber) }}</span>
                    </v-col>
                  </v-row>
                </v-col>
                <v-col lg="2" md="3" sm="4">
                  <v-row class="mb-2" no-gutters>
                    <v-col>
                      <v-btn id="districtDetails"
                             color="#003366"
                             width="100%"
                             outlined
                             class="mt-0 pt-0 filterButton"
                      >
                        <v-icon color="#003366" style="margin-top: 0.07em" class="ml-n5 mr-1" right dark>mdi-newspaper-variant-outline</v-icon>
                        <span class="ml-1" style="text-transform: initial">District Details</span>
                      </v-btn>
                    </v-col>
                  </v-row>
                  <v-row no-gutters>
                    <v-col>
                      <v-btn id="districtContacts"
                             color="#003366"
                             width="100%"
                             outlined
                             class="mt-0 pt-0 filterButton"
                      >
                        <v-icon color="#003366" style="margin-top: 0.07em" class="ml-n1 mr-1" right dark>mdi-account-multiple-outline</v-icon>
                        <span class="ml-1" style="text-transform: initial">District Contacts</span>
                      </v-btn>
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

