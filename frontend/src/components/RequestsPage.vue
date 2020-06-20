<template>
  <v-container class="fill-height">
    <v-tabs 
      active-class="active-display"
      v-model="tab"
    >
      <v-tab  :disabled="!isValidGMPUser" :href="`#${requestTypes.penRequest.name}`">PEN Retrieval Requests</v-tab>
      <v-tab :disabled="!isValidUMPUser" :href="`#${requestTypes.studentRequest.name}`">UMP Requests</v-tab>
      <v-tab :href="`#${requestTypes.studentSearch.name}`">Student Search</v-tab>

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
        <StudentSearch
          :requestType="requestTypes.studentSearch.name"
          label="Select UMP request statuses to view"
          penName="recordedPen"
        ></StudentSearch>
      </v-tab-item>
    </v-tabs>
  </v-container>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex';
import { REQUEST_TYPES } from '../utils/constants';
import RequestsDisplay from './RequestsDisplay';
import StudentSearch from './penreg/student-search/StudentSearch';
export default {
  name: 'requestsPage',
  components: {
    RequestsDisplay,
    StudentSearch
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
    }else {
      return {
        tab: REQUEST_TYPES.studentSearch.name
      };
    }
  },
  computed: {
    ...mapGetters('app', ['requestType']),
    ...mapGetters('auth', ['isValidGMPUser','isValidUMPUser']),
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
    ...mapMutations('app', ['setRequestType']),
  }
};
</script>
<style scoped>
  .active-display {
    background-color: #38598a;
    color: white;
  }
</style>
