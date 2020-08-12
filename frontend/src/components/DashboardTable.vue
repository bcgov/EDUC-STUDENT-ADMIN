<template>
  <v-card flat class="mt-2">
    <v-card-title><h3>{{ title }}</h3></v-card-title>
    <v-card-text>
      <v-card outlined flat rounded="0">
        <v-row v-for="(row, index) in sortedTableData" :key="index" :class="['listRow', index%2===1?'oddRow':'']">
          <v-col v-if="row.error"><v-alert color="#D8292F" v-if="row.error" dismissible width="100%" class="alert mb-0"><strong>Error loading {{ row.title }} row data. Try refreshing the page.</strong></v-alert></v-col>
          <template v-if="!row.error">
            <v-col class="listCol"><strong>{{ row.title }}</strong></v-col>
            <v-col v-for="(col, idx) in omit(row, 'title')" :key="idx" class="listCol">{{ col }} {{ dataColWording(idx) }}</v-col>

          </template>
          <v-col class="listCol" cols="1">
            <router-link :to="routeTo(row.title)">
              <v-btn class="mr-4 white--text" color="#38598a" width="100%">View {{ buttonWording(row.title) }}</v-btn>
            </router-link>
          </v-col>
        </v-row>
      </v-card>
    </v-card-text>
  </v-card>
</template>
<script>
import omit from 'lodash/omit';
import { REQUEST_TYPES } from '../utils/constants';
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
    }
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
