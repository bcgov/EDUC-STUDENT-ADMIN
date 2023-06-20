<!--Depracated -->
<template>
  <v-container fluid class="my-10 px-16">
    <v-tabs
      active-class="active-display"
      v-model="tab"
    >
      <v-tab  :disabled="!isValidGMPUser" :href="`#${requestTypes.penRequest.name}`">PEN Retrieval Requests</v-tab>
      <v-tab :disabled="!isValidUMPUser" :href="`#${requestTypes.studentRequest.name}`">UMP Requests</v-tab>
      <v-tab :disabled="!isValidStudentSearchUser" :href="`#${requestTypes.studentSearch.name}`">Student Search</v-tab>
      <v-tab :disabled="!isValidStudentSearchUser" :href="`#${requestTypes.penRequestBatch.name}`">PEN Request Files</v-tab>

      <v-tab-item
        :value="requestTypes.penRequest.name"
      >
        <RequestsDisplay
          :requestType="requestTypes.penRequest.name"
          label="Select PEN request statuses to view"
        ></RequestsDisplay>
      </v-tab-item>
      <v-tab-item
        :value="requestTypes.studentRequest.name"
      >
        <RequestsDisplay
          :requestType="requestTypes.studentRequest.name"
          label="Select UMP request statuses to view"
          penName="recordedPen"
        ></RequestsDisplay>
      </v-tab-item>
      <v-tab-item
        :value="requestTypes.studentSearch.name"
      >
        <StudentSearchDisplay
          :requestType="requestTypes.studentSearch.name"
          penName="recordedPen"
        ></StudentSearchDisplay>
      </v-tab-item>
      <v-tab-item
        :value="requestTypes.penRequestBatch.name"
      >
        <PenRequestBatchDisplay
        ></PenRequestBatchDisplay>
      </v-tab-item>
    </v-tabs>
  </v-container>
</template>

<script>
import {mapActions, mapState} from 'pinia';
import { REQUEST_TYPES } from '../utils/constants';
import RequestsDisplay from './RequestsDisplay';
import StudentSearchDisplay from './penreg/student-search/StudentSearchDisplay';
import PenRequestBatchDisplay from './penreg/penrequest-batch/PenRequestBatchDisplay';
import {authStore} from '@/store/modules/auth';
import {appStore} from '@/store/modules/app';
export default {
  name: 'requestsPage',
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
  mounted() {
    this.tab = this.requestType;
  },
  watch: {
    tab(val) {
      val && this.setRequestType(val);
    }
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
