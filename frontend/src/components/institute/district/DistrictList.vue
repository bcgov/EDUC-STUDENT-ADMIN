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
        <v-col
            cols="12"
            class="d-flex justify-end"
        >
            <v-btn
              id="filters"
              color="#003366"
              text="Filter"
              class="mr-1 mb-1"
              prepend-icon="mdi-filter-multiple-outline"
              variant="outlined"
              @click="toggleFilters"
            >
              <template #append>
                <v-badge
                  color="error"
                  :content="filterCount"
                  floating
                  offset-y="-10"
                />
              </template>
            </v-btn>
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
            class="pa-1 hoverTable"
            style="cursor: pointer;"
            @click="openDistrict(item.raw.districtId)"
          >
            <v-col
              cols="6"
              class="d-flex justify-start mt-2"
            >
              <strong class="largeFont">{{
                `${item.raw.districtNumber} - ${item.raw.name}`
              }}</strong>
            </v-col>
            <v-col cols="2" class="d-flex mt-2">
              <v-icon :color="getStatusColor(item.raw.districtStatusCode)">
                mdi-circle-medium
              </v-icon>
              <span class="largeFont">{{
                getStatusText(item.raw.districtStatusCode)
              }}</span>
            </v-col>
            <v-col class="mt-2" cols="3">
              <v-icon>
                mdi-phone-outline
              </v-icon>
              <span class="largeFont">{{
                getPhoneNumber(item.raw.phoneNumber)
              }}</span>
            </v-col>
            <v-col v-if="canViewMenu(item.raw.districtStatusCode)">
                <v-menu
                  transition="fab-transition"
                  location="end"
                >
                  <template #activator="{ props }">
                    <v-btn
                      color="primary"
                      icon="mdi-dots-vertical"
                      variant="text"
                      v-bind="props"
                    />
                  </template>
                  <v-list>
                    <v-list-item
                      id="tvrButton"
                      @click="openDistrictInEdx(item.raw.districtId)"
                    >
                      <v-icon
                        color="#003366"
                        class="pr-1 mb-1"
                      >
                        mdi-open-in-new
                      </v-icon>
                      <span class="ml-2">View EDX Dashboard</span>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </v-col>
          </v-row>
          <v-divider />
        </template>

        <template #no-data>
          There are no districts.
        </template>
      </v-data-table>
    </div>

    <v-navigation-drawer
      v-model="showFilters"
      location="right"
      :temporary="true"
      width="700"
      :persistent="true"
      scrim="transparent"
      :border="true"
      style="top:0; height: 100%;"
      rounded="true"
    >
      <DistrictSearchFilters
        :district-code-name-filter="districtCodeNameFilter"
        :district-status-filter="districtStatusFilter"
        @apply-district-code-name-filter="applyDistrictCodeNameFilter"
        @apply-district-status-filter="applyDistrictStatusFilter"
        @clear-filters="clearFilters"
        @close="showFilters= !showFilters"
      />
    </v-navigation-drawer>
  </v-container>
</template>
<script>

import {formatPhoneNumber, sortByNameValue} from '@/utils/format';
import ApiService from '@/common/apiService';
import alertMixin from '@/mixins/alertMixin';
import PrimaryButton from '@/components/util/PrimaryButton.vue';
import Spinner from '@/components/common/Spinner.vue';
import {mapState} from 'pinia';
import {authStore} from '@/store/modules/auth';
import {appStore} from '@/store/modules/app';
import DistrictSearchFilters from './DistrictSearchFilters.vue';
import { PERMISSION, hasRequiredPermission } from '@/utils/constants/Permission';

export default {
  name: 'InstituteDistrict',
  components: {
    PrimaryButton,
    Spinner,
    DistrictSearchFilters
  },
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
        districtId: '',
        status: 'ACTIVE'
      },
      status: [
        {label: 'Active', districtStatusCode: 'ACTIVE'},
        {label: 'Inactive', districtStatusCode: 'INACTIVE'}
      ],
      districtList: [],
      districtSearchNames: [],
      filteredDistrictList: [],
      loadingDistricts: true,
      edxURL: null,
      showFilters: null,
      districtCodeNameFilter: null,
      districtStatusFilter: 'ACTIVE'
    };
  },
  computed: {
    ...mapState(authStore, ['userInfo']),
    ...mapState(appStore, ['config']),
    filterCount() {
      let totals = Object.values(this.searchFilter).filter(filter => !!filter).reduce((total, filter) => total.concat(filter), []).length;
      return totals;
    },
  },
  async beforeMount() {
    this.getDistricts();
  },
  created() {
    appStore().getConfig().then(() => {
      this.edxURL = this.config.EDX_URL;
    });
  },
  methods: {
    hasRequiredPermission,
    canViewMenu(districtStatusCode) {
      return districtStatusCode === 'ACTIVE' && !this.config.DISABLE_GDC_FUNCTIONALITY && this.hasRequiredPermission(this.userInfo, PERMISSION.VIEW_GRAD_DATA_COLLECTION_PERMISSION);
    },
    applyDistrictCodeNameFilter($event) {
      this.searchFilter.districtId = $event;
      this.searchButtonClick();
    },
    applyDistrictStatusFilter($event) {
      this.searchFilter.status = $event;
      this.searchButtonClick();
    },
    toggleFilters() {
      this.showFilters= !this.showFilters;
    },
    openDistrictInEdx(districtID) {
      window.open(`${this.edxURL}/api/auth/silent_sdc_idir_login?districtID=${districtID}&idir_guid=${this.userInfo.userGuid.toLowerCase()}&gradDashboard=true`, '_blank');
    },
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
    clearFilters() {
      this.districtCodeNameFilter=null;
      this.searchFilter.districtId =null;
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
    openDistrict(districtId) {
      this.$router.push({name: 'districtDetails', params: {districtID: districtId}});
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

.containerSetup {
    padding-right: 24em !important;
    padding-left: 24em !important;
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

