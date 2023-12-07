<template>
  <v-container
  class="containerSetup"
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
      <v-col class="d-flex justify center">
        <v-progress-circular
          class="mt-16"
          :size="70"
          :width="7"
          color="primary"
          indeterminate
          :active="isLoading"
          />
      </v-col>
    </v-row>
    <v-row v-else>
      <v-col cols="2">
        <StepperComponent
          :steps="steps"
          :next-event="registerNextEvent"
          @on-navigation-complete="navigationCompleted()"
          />
      </v-col>
      <v-col cols="10">
        <router-view
            :collection-object="activeCollectionObject"
            @next="next"
            @refreshStore="refreshStore"
        />
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import alertMixin from '../../mixins/alertMixin';
import StepperComponent from '../common/StepperComponent.vue';
import { mapState, mapActions } from 'pinia';
import { collectionStore } from '@/store/modules/collection';
import {formatCollectionTypeCode} from '@/utils/format';

export default {
  name: 'collectionView',
  components: {
    StepperComponent
  },
  mixins: [alertMixin],
  data() {
    return {
      steps: [],
      registerNextEvent: false,
      activeCollectionObject: {},
      activeCollectionType: null,
      activeCollectionYear: null,
      isLoading: false,
    };
  },
  computed: {
    ...mapState(collectionStore, ['stepsInCollectionClosureProcess', 'activeCollection'])
  },
  async created() {
    this.isLoading = !this.isLoading;

    this.steps = [...this.stepsInCollectionClosureProcess];
    //TODO: Replace the below with actual retrieval of collection closure status
    collectionStore().setCurrentStepInCollectionClosureProcess(        {
      label: 'STEP-1',
      name: 'Close Collection',
      id: 'step-1',
      route: 'step-1',
      next: 'step-2',
      index: 0,
      isStarted: false,
      isComplete: false
    });

    await collectionStore().getActiveCollection().then(() => {
      this.activeCollectionObject = this.activeCollection;
      this.isLoading = !this.isLoading;
    });

    this.activeCollectionType = formatCollectionTypeCode(this.activeCollectionObject.collectionTypeCode);
    this.activeCollectionYear = this.activeCollectionObject.snapshotDate.slice(0, 4);


  },
  methods: {
    formatCollectionTypeCode,
    ...mapActions(collectionStore, ['setCurrentStepInCollectionClosureProcess']),

    next() {
      this.registerNextEvent = true;
    },

    navigationCompleted() {
      this.registerNextEvent = false;
    },

    refreshStore() {
      collectionStore().getActiveCollection().finally(() => {
        this.activeCollectionObject = this.activeCollection;
        this.steps = [...this.stepsInCollectionClosureProcess];
      });
    },

    backToActiveCollection() {
      this.$router.push({name: 'sdc-collection'});
    }
  }
};
</script>

<style scoped>
.divider {
  border-color: #FCBA19;
  border-width: 3px;
  opacity: unset;
}
.containerSetup{
  padding-right: 10em !important;
  padding-left: 10em !important;
}

@media screen and (max-width: 1200px) {
  .containerSetup{
    padding-right: 3em !important;
    padding-left: 3em !important;
  }
}
</style>
