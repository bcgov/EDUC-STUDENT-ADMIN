<template>
  <v-container class="fill-height">
    <v-tabs 
      active-class="active-display"
      v-model="tab"
    >
      <v-tab :href="`#${requestTypes.penRequest.name}`">PEN Retrieval Requests</v-tab>
      <v-tab :href="`#${requestTypes.studentRequest.name}`">UMP Requests</v-tab>

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
    </v-tabs>
  </v-container>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex';
import { REQUEST_TYPES } from '../utils/constants';
import RequestsDisplay from './RequestsDisplay';
export default {
  name: 'requestsPage',
  components: {
    RequestsDisplay,
  },
  data() {
    return {
      tab: REQUEST_TYPES.penRequest.name,
    };
  },
  computed: {
    ...mapGetters('app', ['requestType']),
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
