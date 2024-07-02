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
        <h4>{{ activeCollectionType }} {{ activeCollectionYear }}</h4>
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
            :value="3"
          >
            PEN Fixes
          </v-tab>
          <v-tab
            :value="4"
          >
            Resolve Provincial Duplicates
          </v-tab>
          <v-tab
            :value="5"
          >
            All Students
          </v-tab>
        </v-tabs>
        <v-window v-model="tab">
          <v-window-item
            :value="1"
            transition="false"
            reverse-transition="false"
          >
            <DistrictMonitoring :collection-object="activeCollectionObject" />
          </v-window-item>
          <v-window-item
            :value="2"
            transition="false"
            reverse-transition="false"
          >
            <IndySchoolMonitoring
              :collection-object="activeCollectionObject"
            />
          </v-window-item>
          <v-window-item
            :value="3"
            transition="false"
            reverse-transition="false"
          >
            <PenMatch
              :collection-object="activeCollectionObject"
            />
          </v-window-item>
          <v-window-item
            :value="4"
            transition="false"
            reverse-transition="false"
          >
            <ProvincialDuplicates :collection-object="activeCollectionObject" />
          </v-window-item>
          <v-window-item
            :value="5"
            transition="false"
            reverse-transition="false"
          >
            <AllStudentsComponent />
          </v-window-item>
        </v-window>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import alertMixin from '../../mixins/alertMixin';
import {formatCollectionTypeCode} from '@/utils/format';
import {COLLECTION_CLOSURE_STEPS} from '@/utils/institute/collectionClosureSteps';
import ApiService from '@/common/apiService';
import {Routes} from '@/utils/constants';
import IndySchoolMonitoring from '@/components/data-collection/IndySchoolMonitoring.vue';
import PenMatch from '@/components/data-collection/PenMatch.vue';
import ProvincialDuplicates from '@/components/data-collection/provincialDuplicates/ProvincialDuplicates.vue';
import DistrictMonitoring from '@/components/data-collection/DistrictMonitoring.vue';
import Spinner from '@/components/common/Spinner.vue';
import AllStudentsComponent from '@/components/data-collection/AllStudents/AllStudentsComponent.vue';

export default {
  name: 'CollectionView',
  components: {
    Spinner,
    DistrictMonitoring,
    ProvincialDuplicates,
    AllStudentsComponent,
    PenMatch,
    IndySchoolMonitoring,
  },
  mixins: [alertMixin],
  data() {
    return {
      steps: [],
      currentStepInCollectionClosureProcess: {},
      registerNextEvent: false,
      activeCollectionObject: {},
      activeCollectionType: null,
      activeCollectionYear: null,
      isLoading: true,
      tab: ''
    };
  },
  async created() {

    this.steps = [...COLLECTION_CLOSURE_STEPS];

    //TODO: Replace the below with actual retrieval of collection closure status
    this.setCurrentStepInCollectionClosureProcess(this.steps[0]);

    await this.getActiveCollection().then(() => {
      this.isLoading = !this.isLoading;
    });
  },
  methods: {
    formatCollectionTypeCode,

    async getActiveCollection() {
      if(this.activeCollection == null) {
        const response = await ApiService.apiAxios.get(`${Routes.sdc.ACTIVE_COLLECTION}`);
        this.activeCollectionObject = response.data;

        this.activeCollectionType = formatCollectionTypeCode(this.activeCollectionObject.collectionTypeCode);
        this.activeCollectionYear = this.activeCollectionObject.snapshotDate.slice(0, 4);
      }
    },

    next() {
      this.registerNextEvent = true;
    },

    navigationCompleted() {
      this.registerNextEvent = false;
    },

    setCurrentStepInCollectionClosureProcess(currentStepInCollectionClosureProcess) {
      this.currentStepInCollectionClosureProcess = currentStepInCollectionClosureProcess;
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
