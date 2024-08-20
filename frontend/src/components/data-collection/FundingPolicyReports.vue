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
</template>

<script>
import {appStore} from '@/store/modules/app';
import {mapState} from 'pinia';
import {sortBy} from 'lodash';

export default {
  name: 'FundingPolicyReport',
  data() {
    return {
      indySchoolsDistrictsNameNumberFilter: null,
      indySchoolsDistrictsNames: [],
    };
  },
  computed: {
    ...mapState(appStore, ['districtMap', 'independentAuthorityMap']),
  },
  created() {
    appStore().getInstituteCodes().then(() => {
      this.setupIndySchoolsDistrictsList();
      this.loading = false;
    });
  },
  methods: {
    setIndySchoolsDistrictsNameNumberFilter(key, $event) {
      console.log(key, $event);
    },
    setupIndySchoolsDistrictsList() {
      this.indySchoolsDistrictsNames = [];

      for (const indySchool of this.independentAuthorityMap.values()) {
        let schoolItem = {
          codeName: indySchool.name + ' - ' + indySchool.authorityNumber,
          id: 'indy - ' + indySchool.authorityID,
        };
        this.indySchoolsDistrictsNames.push(schoolItem);
      }

      for (const district of this.districtMap.values()) {
        let districtItem = {
          codeName: district.name + ' - ' + district.districtNumber,
          id: 'district - ' + district.districtID,
        };
        this.indySchoolsDistrictsNames.push(districtItem);
      }

      this.indySchoolsDistrictsNames = sortBy(this.indySchoolsDistrictsNames, ['codeName']);
    }
  }
};
</script>
