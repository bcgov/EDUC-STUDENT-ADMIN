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
    <v-row
      no-gutters
      class="mt-2 mb-2 d-flex justify-start"
    >
      <v-col class="mt-1 d-flex justify-start">
        <v-icon
          small
          color="#1976d2"
        >
          mdi-arrow-left
        </v-icon>
        <a
          class="ml-1"
          @click="backToActiveCollection()"
        >Return to Data Collection</a>
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
            :value="1"
          >
            District Submissions
          </v-tab>
          <v-tab
            :value="2"
          >
            Independent School Data Submissions
          </v-tab>
          <v-tab
            v-if="isCollectionActive"
            :value="3"
          >
            PEN Fixes
          </v-tab>
          <v-tab
            :value="4"
          >
            All Students
          </v-tab>
          <v-tab
            v-if="isCollectionActive"
            :value="5"
          >
            Duplicates Posting and Collection Closure
          </v-tab>
          <v-tab
            v-if="hasAccessToReports()"
            :value="6"
          >
            Reports
          </v-tab>
        </v-tabs>
        <v-window v-model="tab">
          <v-window-item
            :value="1"
            transition="false"
            reverse-transition="false"
          >
            <DistrictMonitoring :collection-object="collectionObject" />
          </v-window-item>
          <v-window-item
            :value="2"
            transition="false"
            reverse-transition="false"
          >
            <IndySchoolMonitoring
              :collection-object="collectionObject"
            />
          </v-window-item>
          <v-window-item
            v-if="isCollectionActive"
            :value="3"
            transition="false"
            reverse-transition="false"
          >
            <PenMatch
              :collection-object="collectionObject"
            />
          </v-window-item>
          <v-window-item
            :value="4"
            transition="false"
            reverse-transition="false"
          >
            <AllStudentsComponent :collection-object="collectionObject" />
          </v-window-item>
          <v-window-item
            v-if="isCollectionActive"
            :value="5"
            transition="false"
            reverse-transition="false"
          >
            <DuplicatesPosting :collection-object="collectionObject"/>
          </v-window-item>
          <v-window-item
            :value="6"
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
import {mapState} from "pinia";
import {authStore} from "@/store/modules/auth";
import {appStore} from "@/store/modules/app";

export default {
  name: 'CollectionView',
  components: {
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
      registerNextEvent: false,
      collectionObject: {},
      collectionType: null,
      collectionYear: null,
      isCollectionActive: false,
      isLoading: true,
      tab: ''
    };
  },
  computed: {
    ...mapState(authStore, ['userInfo'])
  },
  async created() {
    await sdcCollectionStore().getCollectionTypeCodesMap();
    await this.getActiveCollection();
    await this.getCollectionByID().then(() => {
      this.isLoading = !this.isLoading;
    });
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
      ApiService.apiAxios.get(`${Routes.sdc.ACTIVE_COLLECTION}`).then((response) => {
        this.isCollectionActive = response.data.collectionID === this.collectionID;
      });
    },
    async getCollectionByID() {
      if(this.activeCollection == null) {
        const response = await ApiService.apiAxios.get(`${Routes.sdc.COLLECTION}/` + this.collectionID);
        this.collectionObject = response.data;

        this.collectionType = formatCollectionTypeCode(this.collectionObject.collectionTypeCode);
        this.collectionYear = this.collectionObject.snapshotDate.slice(0, 4);
      }
    },
    next() {
      this.registerNextEvent = true;
    },

    navigationCompleted() {
      this.registerNextEvent = false;
    },
    backToActiveCollection() {
      this.$router.push({name: 'sdc-collection'});
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
