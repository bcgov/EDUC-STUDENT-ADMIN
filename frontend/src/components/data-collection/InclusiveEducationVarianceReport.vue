<template>
  <v-col>
    <v-row>
      <slot
        name="text-search"
      >
        <v-autocomplete
          id="selectDistrict"
          v-model="districtsNameNumberFilter"
          variant="outlined"
          :items="districtNames"
          color="#003366"
          label="District Select"
          single-line
          :clearable="true"
          item-title="codeName"
          item-value="id"
          autocomplete="off"
          @update:model-value="setDistrictsNameNumberFilter('district', $event)"
        />
      </slot>
    </v-row>
  </v-col>
  <v-col v-if="loading">
    <Spinner />
  </v-col>
  <v-col v-else-if="districtsNameNumberFilter != null && tableID != null">
    <HeadCountReportComponent
      :table-i-d="tableID"
      :headcount-table-data="headcountTableData"
    />
    <br>
    <span>** This report displays the count of students reported by each district and eligible for Inclusive Education funding.</span>
  </v-col>
</template>

<script>
import ApiService from '@/common/apiService';
import {Routes} from '@/utils/constants';
import {appStore} from '@/store/modules/app';
import {mapState} from 'pinia';
import {sortBy} from 'lodash';
import {FTE} from '@/utils/sdc/collectionTableConfiguration.js';
import HeadCountReportComponent from './common/HeadCountReportComponent.vue';
import Spinner from '@/components/common/Spinner.vue';

export default {
  name: 'FundingPolicyReport',
  components: {HeadCountReportComponent, Spinner},
  props: {
    collectionObject: {
      type: Object,
      required: true,
      default: null
    },
    collectionType: {
      type: String,
      required: true,
    }
  },
  data() {
    return {
      districtsNameNumberFilter: null,
      districtNames: [],
      config: FTE,
      districtObject: null,
      headcountTableData: null,
      tableID: null,
      loading: false
    };
  },
  computed: {
    ...mapState(appStore, ['districtMap']),
  },
  created() {
    appStore().getInstituteCodes().then(() => {
      this.setupDistrictsList();
      this.loading = false;
    });
  },
  methods: {
    setDistrictsNameNumberFilter(key, $event) {
      if ($event) {
        this.districtObject = { type: key, id: $event };
        this.fetchDistrictSummaryCounts();
      } else {
        this.districtObject = null;
      }
    },
    setupDistrictsList() {
      this.districtNames = [];

      ApiService.apiAxios.get(`${Routes.sdc.BASE_URL}/collection/${this.$route.params.collectionID}/sdcDistrictCollections`)
        .then((res) => {
          res.data.forEach(districtCollection => {
            const district = this.districtMap.get(districtCollection.districtID);
            if (district) {
              let districtItem = {
                codeName: district.name + ' - ' + district.districtNumber,
                id: districtCollection.sdcDistrictCollectionID,
                districtNumber: district.districtNumber
              };
              this.districtNames.push(districtItem);
            }
          });
          this.districtNames = sortBy(this.districtNames, ['districtNumber']);
        })
        .catch(error => {
          console.error(error);
        });
    },
    fetchDistrictSummaryCounts() {
      this.loading = true;
      ApiService.apiAxios.get(`${Routes.sdc.SDC_SCHOOL_COLLECTION_STUDENT}/getDistrictHeadcounts/${this.districtObject.id}`, {
        params: {
          type: this.collectionType,
        }
      }).then(response => {
        this.headcountTableData = response.data.headcountResultsTable;
        this.tableID = '12345';
      }).catch(error => {
        console.error(error);
        this.setFailureAlert('An error occurred while trying to retrieve students list. Please try again later.');
      }).finally(() => {
        this.loading = false;
      });
    },
  }
};
</script>
