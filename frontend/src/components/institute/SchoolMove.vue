<template>
  <div id="schoolMove" class="px-0 pt-3 ma-0" style="width: 100%;">
    <v-row class="d-flex justify-start">
      <v-col cols="6" class="d-flex justify-start">
        <h2 class="subjectHeading">{{ getPageHeading() }}</h2>
      </v-col>
    </v-row>
    <v-row>
      <v-col id="schoolMoveReturnToSchoolDetails" class="mt-1 d-flex justify-start">
        <v-icon small color="#1976d2">mdi-arrow-left</v-icon>
        <a class="ml-1" @click="back">Return to School Details</a>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <v-divider class="divider"></v-divider>
      </v-col>
    </v-row>

    <v-data-table
        :headers="headers"
        :items="schoolMoveDataFormatted"
        :loading="loading"
        class="elevation-1"
        item-key="schoolMoveId"
        hide-default-footer
    >
    </v-data-table>

  </div>
</template>
  
<script>
import { Routes } from '@/utils/constants';
import ApiService from '../../common/apiService';
import alertMixin from '@/mixins/alertMixin';
import router from '@/router';
import {formatDob} from '@/utils/format';
import {mapState} from 'vuex';
export default {
  name: 'SchoolMove',
  mixins: [alertMixin],
  props: {
    schoolID: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      schoolMoveDataFormatted: [],
      loading: true,
      headers: [
        {text: 'Date', sortable: false, value: 'moveDate'},
        {text: 'Moved By', sortable: false, value: 'createUser'},
        {text: 'From District', sortable: false, value: 'fromDistrict'},
        {text: 'To District', sortable: false, value: 'toDistrict'},
        {text: 'From Authority', sortable: false, value: 'fromAuthority'},
        {text: 'To Authority', sortable: false, value: 'toAuthority'},
        {text: 'Old School Number', sortable: false, value: 'fromSchoolNumber'},
        {text: 'New School Number', sortable: false, value: 'toSchoolNumber'},
      ],
    };
  },
  computed: {
    ...mapState('app', ['schoolMap', 'districtMap', 'independentAuthorityMap']),
  },
  created() {
    this.$store.dispatch('app/getCodes').then(() => this.getSchoolDetails());
  },
  methods: {
    getPageHeading() {
      let school = this.schoolMap?.get(this.schoolID);
      if(school) {
        return school?.mincode + ' - ' + school?.schoolName;
      }
    },
    getSchoolDetails() {
      ApiService.apiAxios.get(`${Routes.institute.SCHOOL_DATA_URL}/${this.schoolID}`)
        .then(response => {
          this.schoolMoveDataFormatted = this.formatSchoolMoveData(response.data.schoolMove);
        }).catch(error => {
          console.error(error);
          this.setFailureAlert(error.response?.data?.message || error.message);
        }).finally(() => {
          this.loading = false;
        });
    },
    formatSchoolMoveData(schoolMoveData) {

      let result = schoolMoveData.map((schoolMoveItem => {
        let schoolMove = {
          moveDate: this.formatDate(schoolMoveItem.moveDate),
          createUser: schoolMoveItem.createUser,
          ...this.formatSchoolData(schoolMoveItem.fromSchoolId, 'from'),
          ...this.formatSchoolData(schoolMoveItem.toSchoolId, 'to'),
        };
        return schoolMove;
      }));

      return result;
    },
    formatSchoolData(schoolUUID, moveDirection) {
      let school = this.schoolMap.get(schoolUUID);
      let districtName = '';
      let authorityName = '';

      if (school.districtID) {
        districtName = `${this.districtMap.get(school.districtID).districtNumber} - ${this.districtMap.get(school.districtID).name}`;
      }

      if (school.authorityID) {
        authorityName = `${this.independentAuthorityMap.get(school.authorityID).authorityNumber} - ${this.independentAuthorityMap.get(school.authorityID).name}`;
      }

      return {
        [`${moveDirection}District`] : districtName,
        [`${moveDirection}Authority`] : authorityName,
        [`${moveDirection}SchoolNumber`] : school.schoolNumber
      };
    },
    back() {
      router.push(`/institute/school/${this.schoolID}/details`);
    },
    formatDate(datetime) {
      return formatDob(datetime.substring(0, 10), 'uuuu-MM-dd');
    },
  },
};
</script>
  
<style scoped>

.divider {
  border-color: #FCBA19;
  border-width: unset;
}
</style>
  
