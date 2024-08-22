<template>
  <v-col>
    <v-row no-gutters v-if="collectionType === 'FUNDING_POLICY_REPORT_INDY'">
      <slot
        name="text-search"
      >
        <v-autocomplete
          id="selectIndySchool"
          v-model="indySchoolsNameNumberFilter"
          variant="outlined"
          :items="indySchoolNames"
          color="#003366"
          label="Independent School Select"
          single-line
          :clearable="true"
          item-title="codeName"
          item-value="id"
          autocomplete="off"
          @update:model-value="setIndySchoolsDistrictsNameNumberFilter('indy', $event)"
        />
      </slot>
    </v-row>
    <v-row v-if="collectionType === 'FUNDING_POLICY_REPORT_DISTRICT'">
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
          @update:model-value="setIndySchoolsDistrictsNameNumberFilter('district', $event)"
        />
      </slot>
    </v-row>
  </v-col>
  <v-col v-if="indySchoolsNameNumberFilter != null || districtsNameNumberFilter != null">
    <DetailComponent
      :config="config"
      :collection-object="collectionObject"
      :indy-school-district-object="indySchoolDistrictObject"
      :show-export-btn="true"
    />
  </v-col>
</template>

<script>
import ApiService from '@/common/apiService';
import {Routes} from '@/utils/constants';
import {appStore} from '@/store/modules/app';
import {mapState} from 'pinia';
import {sortBy} from 'lodash';
import DetailComponent from './AllStudents/DetailComponent.vue';
import {FTE} from '@/utils/sdc/collectionTableConfiguration.js';

export default {
  name: 'FundingPolicyReport',
  components: {DetailComponent},
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
      indySchoolNames: [],
      districtNames: [],
      config: FTE,
      indySchoolDistrictObject: null,
    };
  },
  computed: {
    ...mapState(appStore, ['districtMap', 'schoolMap']),
  },
  created() {
    appStore().getInstituteCodes().then(() => {
      this.setupIndySchoolsDistrictsList();
      this.loading = false;
    });
  },
  methods: {
    setIndySchoolsDistrictsNameNumberFilter(key, $event) {
      if ($event) {
        this.indySchoolDistrictObject = { type: key, id: $event };
      } else {
        this.indySchoolDistrictObject = null;
      }
    },
    setupIndySchoolsDistrictsList() {
      this.indySchoolNames = [];
      this.districtNames = [];

      ApiService.apiAxios.get(`${Routes.sdc.BASE_URL}/collection/${this.$route.params.collectionID}/sdcSchoolCollections`)
        .then((res) => {
          res.data.forEach(schoolCollection => {
            const school = this.schoolMap.get(schoolCollection.schoolID);
            // if no authority ID it is not an indy school
            if (school && school.authorityID != null) {
              let schoolItem = {
                codeName: school.schoolName + ' - ' + school.mincode,
                id: schoolCollection.sdcSchoolCollectionID,
              };
              this.indySchoolNames.push(schoolItem);
            }
          });
          this.indySchoolNames = sortBy(this.indySchoolNames, ['codeName']);
        })
        .catch(error => {
          console.error(error);
        });

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
