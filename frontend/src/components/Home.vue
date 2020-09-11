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
        <DashboardTable v-if="isValidPenRequestBatchUser" requestType="School" colour="#CED6E2" :tableData="penRequestData"></DashboardTable>
      </v-col>
      <v-col cols="4">
        <v-card v-if="isValidStudentSearchUser" flat color="#F2F2F2" class="mt-2" height="100%">
          <v-row class="pt-4 px-8">
            <v-card-title class="pa-0"><h3>Requests Search</h3></v-card-title>
          </v-row>
          <v-row class="pt-4 px-8">
            <v-col cols="19" class="pa-0">
              <v-text-field id="requestsTextField" outlined dense background-color="white" label="Enter district or full mincode"></v-text-field>
            </v-col>
            <v-col cols="3" class="py-0 px-2">

              <v-menu id="requestSearchMenu" offset-y allow-overflow>
                <template v-slot:activator="{ on, attrs }">
                  <PrimaryButton
                          id="requestsSearchBtn"
                          text="Search"
                          icon="fa-angle-down"
                          width="100%"
                          :bind="attrs"
                          :on="on"></PrimaryButton>
                </template>
                <v-list class="py-0">
                  <v-list-item
                          v-for="(item, index) in searchDropDownItems"
                          :key="index"
                          dense
                  >
                    <v-list-item-title>{{ item.title }}</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </v-col>

          </v-row>
          <v-row class="pt-4 px-8">
            <v-card-title class="pa-0"><h3>Student Quick Search</h3></v-card-title>
          </v-row>
          <v-row class="pt-4 px-8">
            <v-col cols="5" class="pa-0">
              <v-text-field id="penTextField" outlined dense background-color="white" label="Enter PEN" v-model="pen"></v-text-field>
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
        <DashboardTable v-if="isValidGMPUser || isValidUMPUser" requestType="Student" colour="#F2F2F2" :tableData="studentData"></DashboardTable>
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
      searchDropDownItems: [
        { title: 'Archived' },
        { title: 'Active' }
      ],
      searchError: false,
      searchErrorMessage: 'PEN not found in Student table'
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
    isValidPEN(){
      return !!(this.pen && this.pen.length === 9 && this.checkDigit());
    }
  },
  methods: {
    checkDigit() {
      const penDigits = [];
      for(let i = 0; i < this.pen.length; i++) {
        penDigits[i] = parseInt(this.pen.charAt(i), 10);
      }
      const S1 = penDigits.slice(0,-1).filter((element,index) => {return index % 2 === 0;}).reduce((a,b) => a+b,0);
      const A = parseInt(penDigits.slice(0,-1).filter((element,index) => {return index % 2 === 1;}).join(''), 10);
      const B = 2 * A;
      let S2 = B.toString().split('').map(Number).reduce(function (a, b) {return a + b;}, 0);
      const S3 = S1 + S2;
      if((S3 % 10) === 0) {
        return penDigits.pop() === 0;
      }
      return penDigits.pop() === (10 - (S3%10));
    },
    quickSearch() {
      this.searchError = false;
      ApiService.apiAxios
        .get(Routes['student'].ROOT_ENDPOINT + '/', { params: { pen: this.pen } })
        .then(response => {
          router.push({ name: REQUEST_TYPES.student.label, params: {studentID: response.data}});
        })
        .catch(error => {
          console.log(error);
          this.searchError = true;
        });
    }
  }
};
</script>


