<template>
  <v-main>
    <DashboardTable v-if="isValidPenRequestBatchUser" title="School PEN Requests" :tableData="penRequestData"></DashboardTable>
    <DashboardTable v-if="isValidGMPUser || isValidUMPUser" title="Student Requests" :tableData="studentData"></DashboardTable>
    <v-card v-if="isValidStudentSearchUser" flat class="mt-2">
      <v-card-title><h3>Student Search</h3></v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="2">
            <v-text-field id="penTextField" outlined dense label="PEN" v-model="pen"></v-text-field>
          </v-col>
          <v-col cols="2">
              <v-row>
                <v-btn id="quickSearchBtn" :to="REQUEST_TYPES.studentSearch.path.basic + '?pen=' + pen" :disabled="!isValidPEN" :dark="isValidPEN" width="100%" color="#38598a">Quick Search</v-btn>
              </v-row>
            <router-link :to="REQUEST_TYPES.studentSearch.path.basic">
              <v-row>
                <v-btn id="fullSearchBtn" width="100%" color="#38598a" class="mt-2" outlined>Full Search</v-btn>
              </v-row>
            </router-link>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-main>
</template>

<script>
import { mapState } from 'vuex';
import { REQUEST_TYPES } from '../utils/constants';
import DashboardTable from './DashboardTable';
import ApiService from '../common/apiService';
import { Routes } from '../utils/constants';
export default {
  name: 'home',
  components: {DashboardTable},
  data () {
    return {
      REQUEST_TYPES: REQUEST_TYPES,
      penRequestData: [],
      studentData: [],
      pen: null
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
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.top-banner{
  min-height: 500px;
  background-size: cover;
  align-items: center;
  display: flex;
}
.full-height{
  height: 100%;
}
.infoTab{
  padding: 10px 0px;
}
.bottomContainer{
  padding-bottom: 30px
}
</style>
