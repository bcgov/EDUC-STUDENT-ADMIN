<template>
  <div>
    <v-row class="pb-6">
      <v-col cols="8" v-if="VIEW_EDIT_PEN_REQUEST_BATCH_FILES_ROLE">
        <DashboardTable v-if="!isLoadingBatch" title="School Requests" colour="#CED6E2"
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
      <v-col cols="4" v-if="ADVANCED_SEARCH_ROLE || VIEW_EDIT_PEN_REQUEST_BATCH_FILES_ROLE">
        <v-card flat color="#F2F2F2" class="mt-2" height="100%">
          <template v-if="VIEW_EDIT_PEN_REQUEST_BATCH_FILES_ROLE">
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
          <template v-if="ADVANCED_SEARCH_ROLE">
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
      <v-col cols="8" v-if="(VIEW_GMP_REQUESTS_ROLE || VIEW_UMP_REQUESTS_ROLE)">
        <DashboardTable v-if="!isLoadingGmpUmp" title="Student Requests" colour="#F2F2F2" :tableData="studentData"></DashboardTable>
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
      <v-col cols="4" v-if="HAS_STATS_ROLE">
        <v-card flat color="#F2F2F2" class="mt-2" height="100%">
          <v-row class="py-4 px-8">
            <v-col class="py-0">
              <v-row>
                <router-link :to="{name: 'stats-dashboard'}">
                  <v-card-title class="pa-0"><h3>Student and System Analytics</h3></v-card-title>
                </router-link>
              </v-row>
              <router-link v-if="STUDENT_ANALYTICS_STUDENT_PROFILE" :to="{name: 'analytics-gmp-stats'}">
                <v-row class="pt-2">Get My PEN</v-row>
              </router-link>
              <router-link v-if="STUDENT_ANALYTICS_STUDENT_PROFILE" :to="{name: 'analytics-ump-stats'}">
                <v-row class="pt-2">Update My PEN</v-row>
              </router-link>
              <router-link v-if="STUDENT_ANALYTICS_BATCH" :to="{name: 'new-pens'}">
                <v-row class="pt-2">New PENs</v-row>
              </router-link>
              <router-link v-if="STUDENT_ANALYTICS_BATCH" :to="{name: 'merges'}">
                <v-row class="pt-2">Merges</v-row>
              </router-link>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
      <v-col cols="8" v-if="SECURE_MESSAGE_ROLE">
        <DashboardTable v-if="!isLoadingSecMessage" title="Secure Messaging" colour="#CED6E2"
                        :tableData="secMessageData"></DashboardTable>
        <v-container v-else-if="isLoadingSecMessage" class="full-height" fluid>
          <article class="top-banner full-height">
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
    </v-row>
  </div>
</template>

<script>
import {mapState, mapGetters} from 'vuex';
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
      secMessageData: [],
      pen: null,
      mincode: null,
      loadDate: null,
      isLoadingBatch: true,
      isLoadingGmpUmp: true,
      isLoadingSecMessage: true,
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
    if (this.VIEW_EDIT_PEN_REQUEST_BATCH_FILES_ROLE) {
      ApiService.apiAxios.get(Routes.penRequestBatch.STATS_URL).then(response => {
        this.penRequestData.push({
          title: 'K-12',
          button: {route: REQUEST_TYPES.penRequestBatch.path + '?schoolGroup=' + 'K12', text: 'View K-12'},
          pending: {data: response.data.K12.pending, name: 'submission pending'},
          fixable: {data: response.data.K12.fixable, name: 'fixable records'},
          repeats: {data: response.data.K12.repeats, name: 'repeated records'},
          unarchived: {data: response.data.K12.unarchived, name: 'unarchived submissions'}
        });
        this.penRequestData.push({
          title: 'PSI',
          button: {route: REQUEST_TYPES.penRequestBatch.path + '?schoolGroup=' + 'PSI', text: 'View PSI'},
          pending: {data: response.data.PSI.pending, name: 'submissions pending'},
          fixable: {data: response.data.PSI.fixable, name: 'fixable records'},
          repeats: {data: response.data.PSI.repeats, name: 'repeated records'},
          unarchived: {data: response.data.PSI.unarchived, name: 'unarchived submissions'},
          heldReview: {data: response.data.PSI.heldForReviewCount, name: 'submission held for review'}
        });
        this.penRequestData.push({
          title: 'Errors',
          button: {route: REQUEST_TYPES.failedRequestBatch.path, text: 'View Errors'},
          loadFailed: {data: response.data.ERROR.loadFailed, name: 'submissions failed'},
        });
      }).finally(() => {
        this.isLoadingBatch = false;
      });
    }
    let gumpiPromises = [];
    if(this.VIEW_GMP_REQUESTS_ROLE) {
      gumpiPromises.push(ApiService.apiAxios.get(Routes.penRequest.STATS_URL));
    }
    if(this.VIEW_UMP_REQUESTS_ROLE) {
      gumpiPromises.push(ApiService.apiAxios.get(Routes.studentRequest.STATS_URL));
    }
    Promise.allSettled(gumpiPromises).then((responses)=> {
      responses.forEach((response)=>{
        let titleAndButtonRoute;
        if(response.value.config.url === Routes.penRequest.STATS_URL) {
          titleAndButtonRoute = {title: 'Get My PEN', button: {route: REQUEST_TYPES.penRequest.path, text: 'View GMP'}};
        } else {
          titleAndButtonRoute = {title: 'Update My PEN', button: {route: REQUEST_TYPES.studentRequest.path, text: 'View UMP'}};
        }
        if(response.status === 'fulfilled') {
          this.studentData.push({
            ...titleAndButtonRoute,
            initial: {data: response.value.data.numInitRev, name: 'initial review'},
            subsequent: {data: response.value.data.numSubsRev, name: 'subsequent review'}
          });
        } else {
          this.setFailureAlert(`Error loading ${titleAndButtonRoute.title} row data. Try refreshing the page.`);
          this.studentData.push({
            title: titleAndButtonRoute.title,
            error: true
          });
        }
      });
    }).finally(()=>{
      this.isLoadingGmpUmp = false;
    });

    //TODO: replace this with API call for secure messaging
    if (this.SECURE_MESSAGE_ROLE) {
      this.secMessageData.push({
        title: 'PEN Team Inbox',
        button: {route: REQUEST_TYPES.messages.path, text: 'View Inbox'},
      });

      setTimeout(() => this.isLoadingSecMessage = false, 1000);
    }
  },
  computed: {
    ...mapGetters('auth', ['VIEW_GMP_REQUESTS_ROLE','VIEW_UMP_REQUESTS_ROLE', 'ADVANCED_SEARCH_ROLE', 'VIEW_EDIT_PEN_REQUEST_BATCH_FILES_ROLE', 'HAS_STATS_ROLE', 'STUDENT_ANALYTICS_STUDENT_PROFILE', 'STUDENT_ANALYTICS_BATCH', 'SECURE_MESSAGE_ROLE']),
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
