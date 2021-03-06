<template>
  <div>
    <v-row class="pb-6">
      <v-col cols="8" v-if="isValidPenRequestBatchUser">
        <DashboardTable v-if="!isLoadingBatch" requestType="School" colour="#CED6E2"
                        :tableData="penRequestData"></DashboardTable>
        <v-container v-else-if="isLoadingBatch" class="full-height" fluid>
          <article id="pen-display-container" class="top-banner full-height">
            <v-row align="center" justify="center">
              <v-progress-circular
                  :size="70"
                  :width="7"
                  color="primary"
                  indeterminate
              ></v-progress-circular>
            </v-row>
          </article>
        </v-container>
      </v-col>
      <v-col cols="4" v-if="isValidStudentSearchUser || isValidPenRequestBatchUser">
        <v-card flat color="#F2F2F2" class="mt-2" height="100%">
          <template v-if="isValidPenRequestBatchUser">
            <v-row class="pt-4 px-8" >
              <v-card-title class="pa-0"><h3>Archived Requests Search</h3></v-card-title>
            </v-row>
            <v-row class="pt-4 px-8">
              <v-col cols="5" class="pa-0">
                <v-text-field
                    id="requestsMincodeField"
                    background-color="white"
                    dense
                    label="Enter district or mincode"
                    maxlength="8"
                    v-model="mincode"
                    outlined
                    :rules="mincodeRules"
                    @keyup.enter="enterPushedForRequests()"
                ></v-text-field>
              </v-col>
              <v-col cols="2" class="py-0 px-2">
                <PrimaryButton id="requestsSearchBtn" :disabled="!isValidRequestsSearchInput" text="Search" width="100%"
                               @click.native="searchRequests"></PrimaryButton>
              </v-col>
              <v-col class="py-0 px-2" cols="5">
                <PrimaryButton class="advanceSearchButtonStyle" id="advanceSearchBtn" text="Advanced Archive Search"
                               @click.native="archiveSearch"></PrimaryButton>
              </v-col>
            </v-row>
          </template>
          <template v-if="isValidStudentSearchUser">
            <v-row class="pt-4 px-8">
              <v-card-title class="pa-0"><h3>Student Search</h3></v-card-title>
            </v-row>
            <v-row class="pt-4 px-8">
              <v-col cols="5" class="pa-0">
                <v-text-field
                    id="penTextField"
                    v-model="pen"
                    :rules="penRules"
                    background-color="white"
                    dense
                    label="Enter PEN"
                    maxlength="9"
                    outlined
                    @keyup.enter="enterPushed()">
                </v-text-field>
              </v-col>
              <v-col cols="2" class="py-0 px-2">
                <PrimaryButton id="quickSearchBtn" :disabled="!isValidPEN" text="Search" width="100%"
                               @click.native="quickSearch"></PrimaryButton>
              </v-col>
              <v-col class="py-0 px-2" cols="5">
                <PrimaryButton id="advanceSearchBtn" text="Advanced Student Search"
                               @click.native="advanceSearch"></PrimaryButton>
              </v-col>
            </v-row>
          </template>
        </v-card>
      </v-col>
      <v-col cols="8" v-if="(isValidGMPUser || isValidUMPUser)">
        <DashboardTable v-if="!isLoadingGmpUmp" requestType="Student" colour="#F2F2F2" :tableData="studentData"></DashboardTable>
        <v-container fluid class="full-height" v-else-if="isLoadingGmpUmp">
          <article id="pen-display-container" class="top-banner full-height">
            <v-row align="center" justify="center">
              <v-progress-circular
                  :size="70"
                  :width="7"
                  color="primary"
                  indeterminate
              ></v-progress-circular>
            </v-row>
          </article>
        </v-container>
      </v-col>
      <v-col cols="4">
        <v-card flat color="#F2F2F2" class="mt-2" height="100%">
          <v-row class="py-4 px-8">
            <v-col class="py-0">
              <v-row>
                <v-card-title class="pa-0"><h3>Reports</h3></v-card-title>
              </v-row>
              <v-row class="pt-2">Report A</v-row>
              <v-row class="pt-2">Report B</v-row>
              <v-row class="pt-2">Report C</v-row>
              <v-row class="pt-2">Report D</v-row>
            </v-col>
            <v-col class="py-0">
              <v-row>
                <v-card-title class="pa-0"><h3>Analytics</h3></v-card-title>
              </v-row>
              <v-row class="pt-2">View A</v-row>
              <v-row class="pt-2">View B</v-row>
              <v-row class="pt-2">View C</v-row>
              <v-row class="pt-2">View D</v-row>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import {mapState} from 'vuex';
import {REQUEST_TYPES, Routes} from '@/utils/constants';
import DashboardTable from './DashboardTable';
import ApiService from '../common/apiService';
import PrimaryButton from './util/PrimaryButton';
import router from '../router';
import {isPresentDateAndAfter1900, isValidMincode, isValidPEN} from '@/utils/validation';
import alertMixin from '../mixins/alertMixin';

export default {
  name: 'home',
  components: {
    PrimaryButton,
    DashboardTable
  },
  mixins: [alertMixin],
  data () {
    return {
      REQUEST_TYPES: REQUEST_TYPES,
      penRequestData: [],
      studentData: [],
      pen: null,
      mincode: null,
      loadDate: null,
      isLoadingBatch: true,
      isLoadingGmpUmp: true,
      searchDropDownItems: [
        { title: 'Archived' },
        { title: 'Active' }
      ],
      searchErrorMessage: 'PEN not found in Student table',
      penRules: [ v => (!v || isValidPEN(v)) || this.penHint],
      penHint: 'Fails check-digit test',
      mincodeRules: [ v => (!v || this.isValidDistrictOrMincode(v)) || 'Invalid district or mincode'],
      loadDateRules: [ v => (!v || isPresentDateAndAfter1900(v)) || 'Invalid date'],
    };
  },
  async beforeMount() {
    await this.$store.dispatch('app/getCodes');
  },
  mounted() {
    if (this.isValidPenRequestBatchUser) {
      ApiService.apiAxios.get(Routes.penRequestBatch.STATS_URL).then(response => {
        this.penRequestData.push({
          title: 'K-12',
          pending: response.data.K12.pending,
          fixable: response.data.K12.fixable,
          repeats: response.data.K12.repeats,
          unarchived: response.data.K12.unarchived
        });
        this.penRequestData.push({
          title: 'PSI',
          pending: response.data.PSI.pending,
          fixable: response.data.PSI.fixable,
          repeats: response.data.PSI.repeats,
          unarchived: response.data.PSI.unarchived,
          heldReview: response.data.PSI.heldForReviewCount
        });
        this.penRequestData.push({
          title: 'Errors',
          loadFailed: response.data.ERROR.loadFailed,
        });
      }).finally(() => {
        this.isLoadingBatch = false;
      });
    }
    let gumpiPromises = [];
    if(this.isValidGMPUser) {
      gumpiPromises.push(ApiService.apiAxios.get(Routes.penRequest.STATS_URL));
    }
    if(this.isValidUMPUser) {
      gumpiPromises.push(ApiService.apiAxios.get(Routes.studentRequest.STATS_URL));
    }
    Promise.allSettled(gumpiPromises).then(([gmp, ump])=>{
      if(gmp) {
        if(gmp.status=== 'fulfilled'){
          this.studentData.push({
            title: 'Get My PEN',
            initial: gmp.value.data.numInitRev,
            subsequent: gmp.value.data.numSubsRev
          });
        }else {
          this.setFailureAlert('Error loading Get My PEN row data. Try refreshing the page.');
          this.studentData.push({
            title: 'Get My PEN',
            error: true
          });
        }
      }
      if(ump){
        if(ump.status=== 'fulfilled'){
          this.studentData.push({
            title: 'Update My PEN',
            initial: ump.value.data.numInitRev,
            subsequent: ump.value.data.numSubsRev
          });
        }else {
          this.setFailureAlert('Error loading Update My PEN row data. Try refreshing the page.');
          this.studentData.push({
            title: 'Update My PEN',
            error: true
          });
        }
      }
    }).finally(()=>{
      this.isLoadingGmpUmp = false;
    });
  },
  computed: {
    ...mapState('auth', ['isValidGMPUser','isValidUMPUser', 'isValidStudentSearchUser', 'isValidPenRequestBatchUser', 'isValidStaffAdministrationUser']),
    ...mapState('app', ['mincodeSchoolNames', 'districtCodes']),
    requestTypes() {
      return REQUEST_TYPES;
    },
    isValidPEN() {
      return isValidPEN(this.pen);
    },
    isValidRequestsSearchInput() {
      if(!this.mincode && !this.loadDate) {
        return false;
      }

      return (!this.mincode || this.isValidDistrictOrMincode(this.mincode)) &&
          (!this.loadDate || isPresentDateAndAfter1900(this.loadDate));
    },
  },
  methods: {
    quickSearch() {
      ApiService.apiAxios
        .get(Routes['student'].ROOT_ENDPOINT + '/', {params: {pen: this.pen}})
        .then(response => {
          router.push({name: REQUEST_TYPES.student.label, params: {studentID: response.data.studentID}});
        })
        .catch(error => {
          console.log(error);
          this.setFailureAlert(this.searchErrorMessage);
        });
    },
    advanceSearch() {
      router.push(REQUEST_TYPES.studentSearch.path.basic);
    },
    archiveSearch() {
      router.push(REQUEST_TYPES.archivedPENRequestBatch.path);
    },
    enterPushed() {
      if (this.pen && this.isValidPEN) {
        this.quickSearch();
      }
    },
    enterPushedForRequests() {
      if (this.isValidRequestsSearchInput) {
        this.searchRequests();
      }
    },
    isValidDistrictOrMincode(v) {
      if(isValidMincode(v) && (v.length === 3 || v.length === 8)) {
        if(v.length === 3) {
          return this.districtCodes.size === 0 || this.districtCodes.has(v);
        } else {
          return this.mincodeSchoolNames.size === 0 || this.mincodeSchoolNames.has(v);
        }
      }
      return false;
    },
    searchRequests() {
      router.push({ name: 'archivedRequestBatch', query: {mincode: this.mincode, loadDate: this.loadDate}});
    },
  }
};
</script>
<style scoped>
#requestsSearchBtn, #quickSearchBtn, #advanceSearchBtn {
  height: 2.858em;
}

.advanceSearchButtonStyle{
  padding-left: 0.9em !important;
  padding-right: 0.9em !important;
}

.full-height {
  height: 100%;
}
</style>
