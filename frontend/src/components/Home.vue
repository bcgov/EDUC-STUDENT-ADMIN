<template>
  <v-main>
    <DashboardTable title="School PEN Requests" :tableData="tableData"></DashboardTable>
    <DashboardTable title="Student Requests" :tableData="studentData"></DashboardTable>
    <v-card v-if="isValidStudentSearchUser" flat class="mt-2">
      <v-card-title><h3>Student Search</h3></v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="2">
            <v-text-field outlined dense label="PEN"></v-text-field>
          </v-col>
          <v-col cols="2">
            <v-row><v-btn width="100%" color="#38598a" dark>Quick Search</v-btn></v-row>
            <router-link :to="REQUEST_TYPES.studentSearch.path.basic">
              <v-row>
                <v-btn width="100%" color="#38598a" class="mt-2" outlined>Full Search</v-btn>
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
      tableData: [
        {
          title: 'K-12',
          pending: 30,
          fixable: 298,
          repeats: 6,
          unarchived: 1
        },
        {
          title: 'PSI',
          pending: 20,
          fixable: 199,
          repeats: 52,
          unarchived: 3
        }
      ],
      studentData: []
    };
  },
  mounted() {
    /*if(this.isValidBatchUser) {
      ApiService.apiAxios.get(Routes.penRequestBatch.STATS_URL);
    }*/
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
      ApiService.apiAxios.get(Routes.studentRequest.STATS_URL+'butt').then(response => {
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
    ...mapState('auth', ['isAuthenticated','isAuthorizedUser','isValidGMPUser','isValidUMPUser', 'isValidStudentSearchUser']),
    ...mapState('app', ['selectedRequest', 'requestType']),
    ...mapState('student', ['selectedStudent']),
    requestTypes() {
      return REQUEST_TYPES;
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
