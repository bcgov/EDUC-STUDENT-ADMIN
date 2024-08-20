<template>
  <v-col>
    <v-row>
      <slot
        name="text-search"
      >
        <v-autocomplete
          id="selectIndySchoolDistrict"
          v-model="indySchoolsDistrictsNameNumberFilter"
          variant="underlined"
          :items="indySchoolsDistrictsNames"
          color="#003366"
          label="District and Independent School Select"
          single-line
          :clearable="true"
          item-title="codeName"
          item-value="id"
          autocomplete="off"
          @update:model-value="setIndySchoolsDistrictsNameNumberFilter('indySchoolsDistrictsNameNumber', $event)"
        />
      </slot>
    </v-row>
  </v-col>
  <v-col v-if="indySchoolsDistrictsNameNumberFilter != null">
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
  },
  data() {
    return {
      indySchoolsDistrictsNameNumberFilter: null,
      indySchoolsDistrictsNames: [],
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
        const type = $event.split(' - ')[0];
        const id = $event.split(' - ')[1];
        this.indySchoolDistrictObject = { type, id };
      } else {
        this.indySchoolDistrictObject = null;
      }
    },
    setupIndySchoolsDistrictsList() {
      this.indySchoolsDistrictsNames = [];

      ApiService.apiAxios.get(`${Routes.sdc.BASE_URL}/collection/${this.$route.params.collectionID}/sdcSchoolCollections`)
        .then((res) => {
          res.data.forEach(schoolCollection => {
            const school = this.schoolMap.get(schoolCollection.schoolID);
            // if no authority ID it is not an indy school
            if (school && school.authorityID != null) {
              let schoolItem = {
                codeName: school.schoolName + ' - ' + school.mincode,
                id: 'indy - ' + schoolCollection.sdcSchoolCollectionID,
              };
              this.indySchoolsDistrictsNames.push(schoolItem);
            }
          });
          this.indySchoolsDistrictsNames = sortBy(this.indySchoolsDistrictsNames, ['codeName']);
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
                id: 'district - ' + districtCollection.sdcDistrictCollectionID,
              };
              this.indySchoolsDistrictsNames.push(districtItem);
            }
          });
          this.indySchoolsDistrictsNames = sortBy(this.indySchoolsDistrictsNames, ['codeName']);
        })
        .catch(error => {
          console.error(error);
        });
    }
  }
};
</script>
