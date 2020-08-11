<template>
  <v-container fluid class="fill-height my-10 px-16 align-start">
    <v-row no-gutters>
      <v-card height="100%" width="100%" style="background-color:#d7d7d7;">
        <v-row no-gutters class="mx-5 pa-6">
          <v-col>
            <h3>PEN Request Files</h3>
          </v-col>
        </v-row>
        <v-row no-gutters class="list-actions pt-8 pb-4 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3" style="background-color:white;">
          <v-col cols="1">
            <v-select 
              id="select-school-group" 
              :items="schoolGroups" 
              v-model="schoolGroupSelected" 
              outlined 
              dense 
              color="#38598a"
              append-icon="mdi-chevron-down"
            ></v-select>
          </v-col>
          <v-sheet 
            v-if="filters && filters.length > 0" 
            class="mx-4 px-2 py-1 d-flex flex-row flex-grow-1 align-center align-self-start" 
            color="rgba(0, 0, 0, 0.06)" 
            outlined 
            rounded
          >
            <span class="mr-4"><strong>Filtered by</strong></span>
            <v-chip 
              v-for="(filter, index) in filters" 
              :key="index" 
              class="mr-2 filter-chip" 
              label 
              close 
              close-icon="fa-times"  
              @click:close="removeFilter(index)"
            >
              {{filter}}
            </v-chip>
          </v-sheet>
          <v-spacer v-else></v-spacer>
          <v-btn id="archive-action" class="mx-2 white--text" color="#38598a" :disabled="!actionEnabled">
            Archive
            <v-icon large right dark>
              mdi-chevron-down
            </v-icon>
          </v-btn>
          <v-btn id="view-list-action" class="mr-2 white--text" color="#38598a" :disabled="!actionEnabled">View List</v-btn>
          <v-btn id="view-details-action" class="white--text" color="#38598a" :disabled="!actionEnabled">View Details</v-btn>
        </v-row>
        <v-row no-gutters class="py-2" style="background-color:white;">
          <PenRequestBatchList
            :schoolGroup="schoolGroupSelected"
            :filters="filters"
            @filter-change="filterChange"
          ></PenRequestBatchList>
        </v-row>
      </v-card>
    </v-row>
  </v-container>
</template>

<script>
import PenRequestBatchList from './PenRequestBatchList';

export default {
  name: 'PenRequestBatchDisplay',
  components: {
    PenRequestBatchList
  },
  props: {
    schoolGroup: {
      type: String,
      default: 'K12'
    },
  },
  data() {
    return {
      schoolGroups: [{value: 'K12', text: 'K-12'}, {value: 'PSI', text: 'PSI'}],
      filters:[],
      actionEnabled: false,
      schoolGroupSelected: null,
    };
  },
  created() {
    this.schoolGroupSelected = this.schoolGroup;
  },
  methods: {
    removeFilter(index) {
      this.filters.splice(index, 1);
    },
    filterChange(filters) {
      this.filters = filters;
    }
  }
};
</script>

<style scoped>
  .list-actions /deep/ .v-select__selections input { 
    display: none 
  }

  .v-btn {
    text-transform: none !important;
  }

  .filter-chip {
    border: thin solid rgba(0, 0, 0, 0.12);
    background-color: white !important;
    color: #38598a;
  }
  .filter-chip /deep/ .v-icon {
    color: #38598a !important;
  }
</style>
