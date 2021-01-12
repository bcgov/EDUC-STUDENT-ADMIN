<template>
  <div>
    <v-alert
            :value="searchError"
            dense
            text
            dismissible
            outlined
            transition="scale-transition"
            class="bootstrap-error"
    >
      {{ searchErrorMessage }}
    </v-alert>
    <v-row>
      <v-col cols="8">
        <DashboardTable v-if="isValidPenRequestBatchUser && !isLoadingBatch" requestType="School" colour="#CED6E2" :tableData="penRequestData"></DashboardTable>
         <v-container fluid class="full-height" v-else-if="isLoadingBatch">
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
        <v-card v-if="isValidStudentSearchUser" flat color="#F2F2F2" class="mt-2" height="100%">
          <v-row class="pt-4 px-8">
            <v-card-title class="pa-0"><h3>Archived Requests Search</h3></v-card-title>
          </v-row>
          <v-row class="pt-4 px-8">
            <v-col cols="6" class="pa-0">
              <v-text-field 
                id="requestsMincodeField" 
                outlined 
                dense 
                background-color="white" 
                label="Enter district or mincode" 
                v-model="mincode"
                maxlength="8" 
                :rules="mincodeRules"
                @keyup.enter="enterPushedForRequests()"
              ></v-text-field>
            </v-col>
            <v-col cols="4" class="pa-0 pl-1">
              <v-text-field 
                id="requestsDateField" 
                outlined 
                dense 
                background-color="white" 
                label="Enter date"
                v-model="loadDate"
                maxlength="10"
                minLength="10"
                :rules="loadDateRules"
                @keyup.enter="enterPushedForRequests()"
              ></v-text-field>
            </v-col>
            <v-col cols="2" class="py-0 pl-2">
              <PrimaryButton
                id="requestsSearchBtn"
                text="Search"
                width="100%"
                :disabled="!isValidRequestsSearchInput"
                @click.native="searchRequests"
              ></PrimaryButton>
            </v-col>

          </v-row>
          <v-row class="pt-4 px-8">
            <v-card-title class="pa-0"><h3>Student Quick Search</h3></v-card-title>
          </v-row>
          <v-row class="pt-4 px-8">
            <v-col cols="5" class="pa-0">
              <v-text-field
                      id="penTextField"
                      outlined
                      dense
                      background-color="white"
                      label="Enter PEN"
                      v-model="pen"
                      @keyup.enter="enterPushed()"
                      maxlength="9"
                      :rules="penRules">
              </v-text-field>
            </v-col>
            <v-col cols="2" class="py-0 px-2">
              <PrimaryButton id="quickSearchBtn" :disabled="!isValidPEN" text="Search" width="100%" @click.native="quickSearch"></PrimaryButton>
            </v-col>
            <v-col cols="5" class="pl-4 pt-1">
              <router-link :to="REQUEST_TYPES.studentSearch.path.basic">
                <span style="text-decoration: underline">Student Full Search</span>
              </router-link>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
    <v-row class="pb-6">
      <v-col cols="8">
        <DashboardTable v-if="(isValidGMPUser || isValidUMPUser) && !isLoadingGmpUmp" requestType="Student" colour="#F2F2F2" :tableData="studentData"></DashboardTable>
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
              <v-row class="pt-2">Report A</v-row> <!--TODO I suggest these rows are done using v-for and object.. -->
              <v-row class="pt-2">Report B</v-row> <!--TODO ..once we know what these link will be -->
              <v-row class="pt-2">Report C</v-row>
              <v-row class="pt-2">Report D</v-row>
            </v-col>
            <v-col class="py-0">
              <v-row>
                <v-card-title class="pa-0"><h3>Analytics</h3></v-card-title>
              </v-row>
              <v-row class="pt-2">View A</v-row> <!--TODO I suggest these rows are done using v-for and object.. -->
              <v-row class="pt-2">View B</v-row> <!--TODO ..once we know what these link will be -->
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
import { mapState } from 'vuex';
import { REQUEST_TYPES } from '../utils/constants';
import DashboardTable from './DashboardTable';
import ApiService from '../common/apiService';
import { Routes } from '../utils/constants';
import PrimaryButton from './util/PrimaryButton';
import router from '../router';
import { isValidPEN, isValidMinCode, isDateAfter1900 } from '../utils/validation';

export default {
  name: 'home',
  components: {
    PrimaryButton,
    DashboardTable
  },
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
      searchError: false,
      searchErrorMessage: 'PEN not found in Student table',
      penRules: [ v => (!v || isValidPEN(v)) || this.penHint],
      penHint: 'Fails check-digit test',
      mincodeRules: [ v => (!v || this.isValidDistrictOrMincode(v)) || 'Invalid district or mincode'],
      loadDateRules: [ v => (!v || isDateAfter1900(v)) || 'Invalid date'],
    };
  },
  mounted() {
    if(this.isValidPenRequestBatchUser) {
      ApiService.apiAxios.get(Routes.penRequestBatch.STATS_URL).then(response => {
        this.penRequestData.push({
          title: 'K-12',
          pending: response.data.K12.pending,
          fixable: response.data.K12.fixable,
          repeats: response.data.K12.repeats,
          unarchived: response.data.K12.unarchived
        });
        this.penRequestData.push(
          {
            title: 'PSI',
            pending: response.data.PSI.pending,
            fixable: response.data.PSI.fixable,
            repeats: response.data.PSI.repeats,
            unarchived: response.data.PSI.unarchived
          });
      }).finally(() => {
        this.isLoadingBatch = false;
      });
    }
    if(this.isValidGMPUser) {
      ApiService.apiAxios.get(Routes.penRequest.STATS_URL).then(response => {
        this.studentData.push({
          title: 'Get My PEN',
          initial: response.data.numInitRev,
          subsequent: response.data.numSubsRev
        });
      }).catch(() => {
        this.studentData.push({
          title: 'Get My PEN',
          error: true
        });
      }).finally(() => {
        this.isLoadingGmpUmp = false;
      });

    }
    if(this.isValidUMPUser) {
      ApiService.apiAxios.get(Routes.studentRequest.STATS_URL).then(response => {
        this.studentData.push({
          title: 'Update My PEN',
          initial: response.data.numInitRev,
          subsequent: response.data.numSubsRev
        });
      }).catch(() => {
        this.studentData.push({
          title: 'Update My PEN',
          error: true
        });
      }).finally(() => {
        this.isLoadingGmpUmp = false;
      });
    }
  },
  computed: {
    ...mapState('auth', ['isAuthenticated','isAuthorizedUser','isValidGMPUser','isValidUMPUser', 'isValidStudentSearchUser', 'isValidPenRequestBatchUser']),
    ...mapState('app', ['selectedRequest', 'requestType']),
    ...mapState('student', ['selectedStudent']),
    requestTypes() {
      return REQUEST_TYPES;
    },
    isValidPEN() {
      return isValidPEN(this.pen);
    },
    isValidRequestsSearchInput() {
      if(this.mincode) {
        return this.isValidDistrictOrMincode(this.mincode);
      } else if(this.loadDate) {
        return isDateAfter1900(this.loadDate);
      } else {
        return false;
      }
    },
  },
  methods: {
    quickSearch() {
      this.searchError = false;
      ApiService.apiAxios
        .get(Routes['student'].ROOT_ENDPOINT + '/', { params: { pen: this.pen } })
        .then(response => {
          router.push({ name: REQUEST_TYPES.student.label, params: {studentID: response.data.studentID}});
        })
        .catch(error => {
          console.log(error);
          this.searchError = true;
        });
    },
    enterPushed() {
      if(this.pen && this.isValidPEN){
        this.quickSearch();
      }
    },
    enterPushedForRequests() {
      if(this.isValidRequestsSearchInput){
        this.searchRequests();
      }
    },
    isValidDistrictOrMincode(v) {
      return isValidMinCode(v) && (v.length === 3 || v.length === 8);
    },
    searchRequests() {
      router.push({ name: 'archivedRequestBatch', query: {mincode: this.mincode, loadDate: this.loadDate}});
    },
  }
};
</script>
<style scoped>
  #requestsSearchBtn, #quickSearchBtn {
    height: 2.858em;
  }
  .full-height {
    height: 100%;
  }
</style>
