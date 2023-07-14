<template>
  <div v-if="total > 0">
    <span class="mr-6 nav-title">{{ title }}</span>
    <v-btn 
      id="preRecord"
      icon="mdi-arrow-left-bold-circle"
      density="comfortable"
      size="x-large"
      color="white"
      :disabled="preDisabled"
      @click="clickBtn(preRoute)"
    >
    </v-btn>
    <v-btn 
      id="nextRecord"
      density="comfortable"
      size="x-large"
      color="white"
      icon="mdi-arrow-right-bold-circle"
      :disabled="nextDisabled"
      @click="clickBtn(nextRoute)"
    >
    </v-btn>
  </div>
</template>

<script>
import {mapActions, mapState} from 'pinia';
import router from '../../router';
import { abbreviateCamelCase } from '@/utils/common';
import {navigationStore} from '@/store/modules/setNavigation';

export default {
  name: 'SetNavigation',
  computed:{
    ...mapState(navigationStore, ['title', 'selectedIDs', 'currentRequest', 'archived', 'requestType']),
    preDisabled() {
      return this.currentRequest <= 0;
    },
    nextDisabled() {
      return this.currentRequest >= this.total - 1;
    },
    preRoute() {
      return this.currentRequest <= 0 ? this.currentRequest : this.currentRequest - 1;
    },
    nextRoute() {
      return this.currentRequest >= this.total - 1 ? this.currentRequest : this.currentRequest + 1;
    },
    total() {
      return Object.keys(this.selectedIDs).length;
    },
  },
  methods: {
    ...mapActions(navigationStore, ['setCurrentRequest']),
    clickBtn(route) {
      this.setCurrentRequest(route);
      const requestTypeAbbrev = abbreviateCamelCase(this.requestType);
      router.push({name: `${requestTypeAbbrev}StudentDetails`, params: {[`${requestTypeAbbrev}StudentID`]: this.selectedIDs[route][`${this.requestType}StudentID`]}, query: {archived: this.archived}});
    }
  }
};
</script>

<style scoped>
#preRecord.v-btn--disabled .v-icon,
#nextRecord.v-btn--disabled .v-icon {
  background-color: rgba(255, 255, 255, 0.80) !important;
  color: white !important;
  border-radius: 50%;
}

.nav-title {
  font-size: 1.065rem;
  color: white
}

</style>
