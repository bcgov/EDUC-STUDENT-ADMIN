<template>
  <v-card flat :color="colour" class="mt-2" height="100%">
    <v-row class="pt-4 px-8">
      <v-col class="pa-0" cols="2">
        <v-card-title class="pa-0">
          <h3>
            <v-row no-gutters class="dashboard-title mr-4">{{ title }}</v-row>
          </h3>
        </v-card-title>
      </v-col>
      <v-col v-for="(row, index) in tableData" :key="index" class="py-0" cols="3">
        <v-row class="pa-0"><h3>{{ row.title }}</h3></v-row>
        <v-row v-for="(col, idx) in omit(row, 'title')" :key="idx" class="pt-2 listCol">
          <div v-if="idx==='heldReview' && col > 0">
            <router-link to="heldRequestBatch">
              <strong>{{ col }} {{ dataColWording(idx) }}</strong>
            </router-link>
          </div>
          <div v-else-if="!row.error">{{ col }} {{ dataColWording(idx) }}</div>
        </v-row>
      </v-col>
    </v-row>
    <v-row class="pt-4 px-8">
      <v-col cols="2"></v-col>
      <v-col v-for="(row, index) in tableData" :key="index" class="pt-4 py-0 px-0" cols="3">
        <router-link :to="routeTo(row.title)">
          <PrimaryButton :id="row.title.replace(/ /g,'')+'Btn'"
                         :text="'View ' + buttonWording(row.title)"></PrimaryButton>
        </router-link>
      </v-col>
    </v-row>

    <v-col></v-col>
  </v-card>
</template>
<script>
import omit from 'lodash/omit';
import {REQUEST_TYPES} from '@/utils/constants';
import PrimaryButton from './util/PrimaryButton';

export default {
  name: 'DashboardTable.vue',
  props: {
    tableData: {
      type: Array,
      required: true
    },
    title: {
      type: String,
      required: false
    },
    colour: {
      type: String
    }
  },
  components: {
    PrimaryButton
  },
  methods: {
    buttonWording(title){
      if(title.toUpperCase().includes('GET')) {
        return 'GMP';
      } else if (title.toUpperCase().includes('UPDATE')) {
        return 'UMP';
      }
      return title;
    },
    dataColWording(key) {
      let wording = '';
      switch(key) {
      case 'pending':
        wording = 'submissions pending';
        break;
      case 'fixable':
        wording = 'fixable records';
        break;
      case 'repeats':
        wording = 'repeated records';
        break;
      case 'unarchived':
        wording = 'unarchived submissions';
        break;
      case 'initial':
        wording = 'initial review';
        break;
      case 'subsequent':
        wording = 'subsequent review';
        break;
      case 'loadFailed':
        wording = 'submissions failed';
        break;
      case 'heldReview':
        wording = 'submission held for review';
        break;
      }
      return wording;
    },
    omit(object, key) {
      return omit(object, key);
    },
    routeTo(title) {
      switch (this.buttonWording(title)) {
      case 'K-12':
        return REQUEST_TYPES.penRequestBatch.path + '?schoolGroup=' + 'K12';
      case 'PSI':
        return REQUEST_TYPES.penRequestBatch.path + '?schoolGroup=' + 'PSI';
      case 'Errors':
        return REQUEST_TYPES.failedRequestBatch.path;
      case 'GMP':
        return REQUEST_TYPES.penRequest.path;
      case 'UMP':
        return REQUEST_TYPES.studentRequest.path;
      }
    }
  }
};
</script>

<style scoped>
  .listCol {
    align-self: center;
  }
  .dashboard-title {
    word-break: break-word;
  }
</style>
