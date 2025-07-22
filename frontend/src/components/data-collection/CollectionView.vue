<template>
  <v-container
    class="containerSetup"
    :fluid="true"
  >
    <v-row class="d-flex justify-start">
      <v-col>
        <h2 class="subjectHeading">
          Student Level Data (1701)
        </h2>
      </v-col>
    </v-row>
    <v-row
      no-gutters
      class="mt-1 d-flex justify-start"
    >
      <v-col>
        <h4>{{ collectionType }} {{ collectionYear }}</h4>
      </v-col>
    </v-row>
    <v-row no-gutters>
      <v-col>
        <v-divider class="divider" />
      </v-col>
    </v-row>
    <v-row
      v-if="isLoading"
      class="mt-0"
    >
      <v-col>
        <Spinner />
      </v-col>
    </v-row>
    <v-row v-else>
      <v-col class="border">
        <v-tabs
          v-model="tab"
          color="#38598a"
        >
          <v-tab
            :value="'districtSubmissionsTab'"
          >
            District Submissions
          </v-tab>
          <v-tab
            :value="'independentSchoolSubmissionsTab'"
          >
            Independent School Data Submissions
          </v-tab>
          <v-tab
            :value="'reprocessSchoolTab'"
          >
            Reprocess School
          </v-tab>
          <v-tab
            v-if="isCollectionActive"
            :value="'penFixesTab'"
          >
            PEN Fixes
          </v-tab>
          <v-tab
            :value="'allStudentsTab'"
          >
            All Students
          </v-tab>
          <v-tab
            v-if="isCollectionActive"
            :value="'duplicatesPostingTab'"
          >
            Duplicates Posting and Collection Closure
          </v-tab>
          <v-tab
            v-if="hasAccessToReports()"
            :value="'reportsTab'"
          >
            Reports
          </v-tab>
        </v-tabs>
        <v-window v-model="tab">
          <v-window-item
            :value="'districtSubmissionsTab'"
            transition="false"
            reverse-transition="false"
          >
            <DistrictMonitoring :collection-object="collectionObject" />
          </v-window-item>
          <v-window-item
            :value="'independentSchoolSubmissionsTab'"
            transition="false"
            reverse-transition="false"
          >
            <IndySchoolMonitoring
              :collection-object="collectionObject"
            />
          </v-window-item>
          <v-window-item
            :value="'reprocessSchoolTab'"
            transition="false"
            reverse-transition="false"
          >
            <ReprocessSchool :collection-object="collectionObject" />
          </v-window-item>
          <v-window-item
            v-if="isCollectionActive"
            :value="'penFixesTab'"
            transition="false"
            reverse-transition="false"
          >
            <PenMatch
              :collection-object="collectionObject"
            />
          </v-window-item>
          <v-window-item
            :value="'allStudentsTab'"
            transition="false"
            reverse-transition="false"
          >
            <AllStudentsComponent :collection-object="collectionObject" />
          </v-window-item>
          <v-window-item
            v-if="isCollectionActive"
            :value="'duplicatesPostingTab'"
            transition="false"
            reverse-transition="false"
          >
            <DuplicatesPosting
              :collection-object="collectionObject"
              @refresh-collection-object="getCollectionByID"
            />
          </v-window-item>
          <v-window-item
            :value="'reportsTab'"
            transition="false"
            reverse-transition="false"
          >
            <Reports :collection-object="collectionObject" />
          </v-window-item>
        </v-window>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import alertMixin from '../../mixins/alertMixin';
import {sdcCollectionStore} from '@/store/modules/sdcCollection';
import {formatCollectionTypeCode} from '@/utils/format';
import ApiService from '@/common/apiService';
import {Routes} from '@/utils/constants';
import IndySchoolMonitoring from '@/components/data-collection/IndySchoolMonitoring.vue';
import PenMatch from '@/components/data-collection/PenMatch.vue';
import DistrictMonitoring from '@/components/data-collection/DistrictMonitoring.vue';
import Spinner from '@/components/common/Spinner.vue';
import AllStudentsComponent from '@/components/data-collection/AllStudents/AllStudentsComponent.vue';
import DuplicatesPosting from '@/components/data-collection/DuplicatesPosting.vue';
import Reports from '@/components/data-collection/Reports.vue';
import {hasRequiredPermission, PERMISSION} from '@/utils/constants/Permission';
import {mapState} from 'pinia';
import {authStore} from '@/store/modules/auth';
import ReprocessSchool from '@/components/data-collection/ReprocessSchool.vue';

export default {
  name: 'CollectionView',
  components: {
    ReprocessSchool,
    Reports,
    DuplicatesPosting,
    Spinner,
    DistrictMonitoring,
    AllStudentsComponent,
    PenMatch,
    IndySchoolMonitoring,
  },
  mixins: [alertMixin],
  props: {
    collectionID: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      requestCount: 0,
      registerNextEvent: false,
      collectionObject: {},
      collectionType: null,
      collectionYear: null,
      isCollectionActive: false,
      tab: ''
    };
  },
  computed: {
    ...mapState(authStore, ['userInfo']),
    isLoading() {
      return this.requestCount > 0;
    }
  },
  async created() {
    this.requestCount += 1;
    await sdcCollectionStore().getCollectionTypeCodesMap();
    await this.getActiveCollection();
    await this.getCollectionByID();
    this.requestCount -= 1;
    this.setTab();
  },
  methods: {
    formatCollectionTypeCode,
    setTab(){
      if(this.$route.query?.penMatch){
        this.tab = 3;
      }
    },
    hasAccessToReports(){
      return hasRequiredPermission(this.userInfo, PERMISSION.REPORTS_SDC_PUBLIC_SCHOOLS_PERMISSION) 
          || hasRequiredPermission(this.userInfo, PERMISSION.REPORTS_SDC_INDEPENDENT_SCHOOLS_PERMISSION) 
          || hasRequiredPermission(this.userInfo, PERMISSION.REPORTS_SDC_HEADCOUNTS_PERMISSION);
    },
    async getActiveCollection() {
      this.requestCount += 1;
      ApiService.apiAxios.get(`${Routes.sdc.ACTIVE_COLLECTION}`).then((response) => {
        this.isCollectionActive = response.data.collectionID === this.collectionID;
      }).finally(() => {
        this.requestCount -= 1;
      });
    },
    async getCollectionByID() {
      this.requestCount += 1;
      ApiService.apiAxios.get(`${Routes.sdc.COLLECTION}/${this.collectionID}`)
        .then((response) => {
          this.collectionObject = response.data;
          this.collectionType = formatCollectionTypeCode(this.collectionObject.collectionTypeCode);
          this.collectionYear = this.collectionObject.snapshotDate.slice(0, 4);
        })
        .catch(error => {
          console.error(error);
          this.setFailureAlert(error.response?.data?.message || error.message);
        })
        .finally(() => {
          this.requestCount -= 1;
        });
    },
    next() {
      this.registerNextEvent = true;
    },
    navigationCompleted() {
      this.registerNextEvent = false;
    }
  }
};
</script>

<style scoped>
.border {
  border: 2px solid grey;
  border-radius: 5px;
  padding: 35px;
  margin-bottom: 2em;
}
.divider {
  border-color: #FCBA19;
  border-width: 3px;
  opacity: unset;
}
.containerSetup{
  padding-right: 5em !important;
  padding-left: 5em !important;
}

@media screen and (max-width: 1200px) {
  .containerSetup{
    padding-right: 3em !important;
    padding-left: 3em !important;
  }
}
</style>
