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
</template>

<script>
import ApiService from '@/common/apiService';
import {Routes} from '@/utils/constants';
import {appStore} from '@/store/modules/app';
import {mapState} from 'pinia';
import {sortBy} from 'lodash';
import {FTE} from '@/utils/sdc/collectionTableConfiguration.js';

export default {
  name: 'FundingPolicyReport',
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
      indySchoolsNameNumberFilter: null,
      districtsNameNumberFilter: null,
      districtNames: [],
      config: FTE,
      districtObject: null,
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
              };
              this.districtNames.push(districtItem);
            }
          });
          this.districtNames = sortBy(this.districtNames, ['codeName']);
        })
        .catch(error => {
          console.error(error);
        });
    }
  }
};
</script>
