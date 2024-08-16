<template>
  <v-row no-gutters>
    <v-col cols="4">
      <v-select
        id="reportListDropdown"
        v-model="selectedReportURL"
        class="pt-0"
        label="Select Report"
        variant="outlined"
        :items="reportList"
        item-title="label"
        item-value="url"
      />
    </v-col>
  </v-row>
  <v-row v-if="isLoading">
    <v-col>
      <Spinner />
    </v-col>
  </v-row>
  <v-row
    v-if="reportData !== null"
    no-gutters
  >
    <v-col>
      <v-row>
        <v-col>
          <v-text-field
            v-model="search"
            label="Search"
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            clearable
            hide-details
            single-line
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-data-table
            id="dataTable"
            :search="search"
            :headers="headers"
            :items="reportData"
            items-per-page="10"
            class="elevation-1 rounded"
            mobile-breakpoint="0"
          />
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>

<script>

import ApiService from '@/common/apiService';
import alertMixin from '@/mixins/alertMixin';
import Spinner from '@/components/common/Spinner.vue';

export default {
  name: 'ReportSection',
  components: {Spinner},
  mixins: [alertMixin],
  props: {
    reportList: {
      required: true,
      type: Array,
      default: null
    },
  },
  data() {
    return {
      selectedReportURL: null,
      reportData: null,
      search: null,
      isLoading: false,
      headers: [],
      collectionID: this.$route.params.collectionID
    };
  },
  watch: {
    selectedReportURL() {
      this.getReportData();
    }
  },
  methods: {
    async getReportData() {
      this.isLoading = true;
      await ApiService.apiAxios.get(this.selectedReportURL + this.collectionID).then(response => {
        this.reportData = response.data.rows;
        this.headers = [];
        response.data.headers.forEach(header => {
          let formattedHeader =
            {
              title: header,
              text: header,
              value: header,
              key: header,
              align: 'start'
            };
          this.headers.push(formattedHeader);
        });
      })
        .catch(error => {
          console.error(error);
          this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while retrieving report information. Please try again later.');
        })
        .finally(() => {
          this.isLoading = false;
        });
    }
  }
};
</script>
<style scoped>
:deep(#dataTable > div.v-table__wrapper > table > thead > tr > th > div > span){
  font-size: 0.80rem;
  font-weight: bold;
}

:deep(#dataTable > div.v-table__wrapper > table > thead > tr > th){
  background-color: #ebedef;
}

:deep(#dataTable > div.v-table__wrapper > table > tbody > tr > td){
  font-size: 0.85rem;
}
</style>
