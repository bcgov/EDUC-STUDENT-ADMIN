<!--Depracated -->
<template>
  <v-container
    fluid
    class="my-10 px-16"
  >
    <v-tabs
      selected-class="active-display"
      :model-value="tab"
    >
      <v-tab
        :disabled="!isValidGMPUser"
        :href="`#${requestTypes.penRequest.name}`"
      >
        PEN Retrieval Requests
      </v-tab>
      <v-tab
        :disabled="!isValidUMPUser"
        :href="`#${requestTypes.studentRequest.name}`"
      >
        UMP Requests
      </v-tab>
      <v-tab
        :disabled="!isValidStudentSearchUser"
        :href="`#${requestTypes.studentSearch.name}`"
      >
        Student Search
      </v-tab>
      <v-tab
        :disabled="!isValidStudentSearchUser"
        :href="`#${requestTypes.penRequestBatch.name}`"
      >
        PEN Request Files
      </v-tab>

      <v-tab-item
        :model-value="requestTypes.penRequest.name"
      >
        <RequestsDisplay
          :request-type="requestTypes.penRequest.name"
          label="Select PEN request statuses to view"
        />
      </v-tab-item>
      <v-tab-item
        :value="requestTypes.studentRequest.name"
      >
        <RequestsDisplay
          :request-type="requestTypes.studentRequest.name"
          label="Select UMP request statuses to view"
          pen-name="recordedPen"
        />
      </v-tab-item>
      <v-tab-item
        :model-value="requestTypes.studentSearch.name"
      >
        <StudentSearchDisplay
          :request-type="requestTypes.studentSearch.name"
          pen-name="recordedPen"
        />
      </v-tab-item>
      <v-tab-item
        :model-value="requestTypes.penRequestBatch.name"
      >
        <PenRequestBatchDisplay />
      </v-tab-item>
    </v-tabs>
  </v-container>
</template>

<script>
import {mapActions, mapState} from 'pinia';
import { REQUEST_TYPES } from '../utils/constants';
import RequestsDisplay from './RequestsDisplay.vue';
import StudentSearchDisplay from './penreg/student-search/StudentSearchDisplay.vue';
import PenRequestBatchDisplay from './penreg/penrequest-batch/PenRequestBatchDisplay.vue';
import {authStore} from '@/store/modules/auth';
import {appStore} from '@/store/modules/app';
export default {
  name: 'RequestsPage',
  components: {
    RequestsDisplay,
    StudentSearchDisplay,
    PenRequestBatchDisplay
  },
  data() {
    if(this.isValidGMPUser){
      return {
        tab: REQUEST_TYPES.penRequest.name
      };
    }else if(this.isValidUMPUser){
      return {
        tab: REQUEST_TYPES.studentRequest.name
      };
    }else if(this.isValidStudentSearchUser){
      return {
        tab: REQUEST_TYPES.studentSearch.name
      };
    }else {
      return {
        tab: null
      };
    }
  },
  computed: {
    ...mapState(appStore, ['requestType']),
    ...mapState(authStore, ['isValidGMPUser','isValidUMPUser','isValidStudentSearchUser']),
    requestTypes() {
      return REQUEST_TYPES;
    }
  },
  watch: {
    tab(val) {
      val && this.setRequestType(val);
    }
  },
  mounted() {
    this.tab = this.requestType;
  },
  methods: {
    ...mapActions(appStore, ['setRequestType']),
  }
};
</script>
<style scoped>
  .active-display {
    background-color: #38598a;
    color: white;
  }
</style>
