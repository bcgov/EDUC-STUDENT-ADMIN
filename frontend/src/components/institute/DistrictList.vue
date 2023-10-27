<template>
  <v-container
    class="containerSetup"
    fluid
  >
    <Spinner
      v-if="loadingDistricts"
      flat
    />
    <div v-else>
      <v-row>
        <v-col class="mt-1 d-flex justify-start">
          <v-icon
            small
            color="#1976d2"
          >
            mdi-arrow-left
          </v-icon>
          <a
            class="ml-1"
            @click="backButtonClick"
          >Return to Dashboard</a>
        </v-col>
      </v-row>
      <!--    search filter -->
      <v-row
        :class="['d-sm-flex', 'align-center', 'searchBox', 'elevation-2']"
        @keydown.enter="searchButtonClick"
      >
        <v-col
          cols="5"
        >
          <v-autocomplete
            id="district-text-field"
            v-model="searchFilter.districtId"
            :clearable="true"
            :items="districtSearchNames"
            item-title="districtNumberName"
            variant="underlined"
            item-value="districtId"
            :menu-props="{closeOnContentClick:true}"
            label="District Number & Name"
            @update:model-value="searchButtonClick"
          >
            <template #prepend-inner>
              <v-icon
                v-if="searchFilter.districtId"
                :color="getStatusColor(districtSearchNames.find(item=>item.districtId===searchFilter.districtId)?.status)"
              >
                mdi-circle-medium
              </v-icon>
            </template>
            <template #selection="{ item, index }">
              {{
                item.raw.districtNumberName
              }}
            </template>
            <template #item="{ props, item }">
              <v-list-item
                v-bind="props"
                prepend-icon="mdi-circle-medium"
                :base-color="getStatusColor(item.raw.status)"
                title=""
              >
                <v-list-item-title style="color: black !important;">
                  {{
                    item.raw.districtNumberName
                  }}
                </v-list-item-title>
              </v-list-item>
            </template>
          </v-autocomplete>
        </v-col>
        <v-col
          cols="3"
        >
          <v-select
            id="status-select-field"
            v-model="searchFilter.status"
            :clearable="true"
            :items="status"
            item-title="label"
            variant="underlined"
            item-value="districtStatusCode"
            :menu-props="{closeOnContentClick:true}"
            label="Status"
          >
            <template #prepend-inner>
              <v-icon
                v-if="searchFilter.status"
                :color="getStatusColor(searchFilter.status)"
              >
                mdi-circle-medium
              </v-icon>
            </template>
            <template #selection="{ item, index }">
              {{
                item.raw.label
              }}
            </template>
            <template #item="{ props, item }">
              <v-list-item
                v-bind="props"
                prepend-icon="mdi-circle-medium"
                :base-color="getStatusColor(item.raw.districtStatusCode)"
                title=""
              >
                <v-list-item-title style="color: black !important;">
                  {{
                    item.raw.label
                  }}
                </v-list-item-title>
              </v-list-item>
            </template>
          </v-select>
        </v-col>
        <v-col
          cols="12"
          md="4"
          :class="['text-right']"
        >
          <PrimaryButton
            id="district-clear-button"
            secondary
            text="Clear"
            @click-action="clearButtonClick"
          />
          <PrimaryButton
            id="district-search-button"
            class="ml-2"
            text="Search"
            width="7rem"
            @click-action="searchButtonClick"
          />
        </v-col>
      </v-row>
      <v-data-table
        :headers="headers"
        :items="filteredDistrictList"
        items-per-page="-1"
        class="elevation-1 mt-5 rounded"
        mobile-breakpoint="0"
      >
        <template #item="{ item }">
          <v-row
            no-gutters
            class="pa-2 hoverTable"
            style="cursor: pointer;"
            @click="openDistrict(item.districtId)"
          >
            <v-col
              cols="6"
              class="d-flex justify-start"
            >
              <strong class="largeFont">{{
                `${item.districtNumber} - ${item.name}`
              }}</strong>
            </v-col>
            <v-col class="d-flex">
              <v-icon :color="getStatusColor(item.districtStatusCode)">
                mdi-circle-medium
              </v-icon>
              <span class="largeFont">{{
                getStatusText(item.districtStatusCode)
              }}</span>
            </v-col>
            <v-col cols="3">
              <v-icon>
                mdi-phone-outline
              </v-icon>
              <span class="largeFont">{{
                getPhoneNumber(item.phoneNumber)
              }}</span>
            </v-col>
          </v-row>
          <v-divider />
        </template>

        <template #no-data>
          There are no districts.
        </template>
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
import PrimaryButton from '@/components/util/PrimaryButton.vue';
import Spinner from '@/components/common/Spinner.vue';


export default {
  name: 'InstituteDistrict',
  components: {PrimaryButton, Spinner},
  mixins: [alertMixin],
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
  async beforeMount() {
    this.getDistricts();
  },
  methods: {
    getDistricts() {
      this.loadingDistricts = true;
      ApiService.getDistricts({params: {refreshCache: true}}).then((response) => {
        this.districtList = response.data;
        for (const district of this.districtList) {
          let districtItem = {
            districtNumberName: district.districtNumber + ' - ' + district.name,
            districtId: district.districtId,
            status: district.districtStatusCode
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
    getStatusColor(districtStatusCode) {
      if (districtStatusCode === 'ACTIVE') {
        return 'green';
      } else if (districtStatusCode === 'INACTIVE') {
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
    },
    openDistrict(districtId) {
      this.$router.push({name: 'districtDetails', params: {districtID: districtId}});
    },
    openDistrictContacts(districtId) {
      this.$router.push({name: 'districtContacts', params: {districtID: districtId}});
    },
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

.containerSetup {
    padding-right: 28em !important;
    padding-left: 28em !important;
}

.hoverTable:hover {
    background-color: #e8e8e8;
    cursor: pointer;
}

:deep(.v-data-table-footer) {
    display: none;
}

:deep(.v-data-table__th) {
    display: none;
}

:deep(.v-list-item__prepend){
    margin-right: -2em;
}
</style>

