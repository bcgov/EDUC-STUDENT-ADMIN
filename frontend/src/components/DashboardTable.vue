<template>
  <v-card flat :color="colour" class="mt-2" height="100%">
    <v-row class="pt-4 px-8">
      <v-col cols="3" class="pa-0">
        <v-card-title class="pa-0">
          <h3>
            <v-row no-gutters>{{ requestType }}</v-row>
            <v-row no-gutters>Requests</v-row>
          </h3>
        </v-card-title>
      </v-col>
      <v-col cols="4" v-for="(row, index) in sortedTableData" :key="index" class="py-0">
        <v-row class="pa-0"><h3>{{ row.title }}</h3></v-row>
        <v-row v-for="(col, idx) in omit(row, 'title')" :key="idx" class="pt-2 listCol">
          <v-alert v-if="row.error" color="#D8292F" dismissible width="100%" class="bootstrap-error mb-0"><strong>Error</strong> loading {{ row.title }} row data. Try refreshing the page.</v-alert>
          <div v-else>{{ col }} {{ dataColWording(idx) }}</div>
        </v-row>
        <v-row class="pt-4">
          <router-link :to="routeTo(row.title)">
            <PrimaryButton :id="row.title.replace(/ /g,'')+'Btn'" :text="'View ' + buttonWording(row.title)"></PrimaryButton>
          </router-link>
        </v-row>
      </v-col>
    </v-row>
    <v-col></v-col>
  </v-card>
</template>
<script>
import omit from 'lodash/omit';
import { REQUEST_TYPES } from '../utils/constants';
import PrimaryButton from './util/PrimaryButton';
export default {
  name: 'DashboardTable.vue',
  props: {
    tableData: {
      type: Array,
      required: true
    },
    requestType: {
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
  computed: {
    sortedTableData() {
      return Array.prototype.slice.call(this.tableData).sort(this.compare);
    }
  },
  methods: {
    compare(a, b) {
      const titleA = a.title.toUpperCase();
      const titleB = b.title.toUpperCase();

      let comparison = 0;
      if (titleA > titleB) {
        comparison = 1;
      } else if (titleA < titleB) {
        comparison = -1;
      }
      return comparison;
    },
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
        wording = 'schools pending';
        break;
      case 'fixable':
        wording = 'fixable';
        break;
      case 'repeats':
        wording = 'repeats';
        break;
      case 'unarchived':
        wording = 'unarchived';
        break;
      case 'initial':
        wording = 'initial review';
        break;
      case 'subsequent':
        wording = 'subsequent review';
        break;
      }
      return wording;
    },
    omit(object, key) {
      return omit(object, key);
    },
    routeTo(title) {
      switch(this.buttonWording(title)) {
      case 'K-12':
        return REQUEST_TYPES.penRequestBatch.path + '?schoolGroup=' + 'K12';
      case 'PSI':
        return REQUEST_TYPES.penRequestBatch.path + '?schoolGroup=' + 'PSI';
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
  .listRow {
    margin: 0;
    height: 100%;
  }
  .oddRow {
    background-color: #d7d7d7;
  }
  .listCol {
    align-self: center;
  }
  .alert {
    color: white;
  }
</style>
