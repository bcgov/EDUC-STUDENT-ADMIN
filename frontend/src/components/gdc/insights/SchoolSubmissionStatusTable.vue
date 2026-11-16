<template>
  <div>
    <v-row justify="start">
      <v-col
        cols="12"
        md="4"
      >
        <v-select
          v-model="statusFilter"
          :items="statusFilterOptions"
          label="Submission Status"
          density="compact"
          variant="underlined"
          class="pb-0"
        />
      </v-col>
      <v-col
        cols="12"
        md="4"
      >
        <v-text-field
          v-model="searchInput"
          label="Search"
          density="compact"
          prepend-inner-icon="mdi-magnify"
          variant="underlined"
          clearable
          class="pt-0"
        />
      </v-col>
    </v-row>

    <v-progress-linear
      v-if="loading"
      indeterminate
      color="primary"
    />

    <v-data-table
      v-else
      v-model:items-per-page="itemsPerPage"
      v-model:page="page"
      :headers="headers"
      :items="filteredData"
      :search="search"
      :sort-by="[{ key: 'statusOrder', order: 'asc' }]"
      class="elevation-1"
      density="compact"
    >
      <template #item.lastSubmission="{ item }">
        {{ formatDate(item.raw.lastSubmission) }}
      </template>
      <template #item.statusOrder="{ item }">
        <v-chip
          :color="STATUSES[item.raw.status]?.color"
          variant="flat"
          size="small"
        >
          {{ STATUSES[item.raw.status]?.label ?? item.raw.status }}
        </v-chip>
      </template>
      <template #no-data>
        No data available for this selection.
      </template>
    </v-data-table>
  </div>
</template>

<script>
import alertMixin from '@/mixins/alertMixin';
import ApiService from '@/common/apiService';
import { Routes, GRAD_SCHOOL_CATEGORY_MAP } from '@/utils/constants';
import { debounce } from 'lodash';

const STATUSES = Object.freeze({
  NO_SUBMISSION: { label: 'No Submission', color: 'error', order: 0 },
  NO_RECENT_SUBMISSION: { label: 'No Submission in Last 30 Days', color: 'warning', order: 1 },
  SUBMITTED: { label: 'Submitted', color: 'success', order: 2 },
});

const CATEGORY_LABELS = Object.freeze(
  Object.fromEntries(Object.entries(GRAD_SCHOOL_CATEGORY_MAP).map(([label, code]) => [code, label]))
);

export default {
  name: 'SchoolSubmissionStatusTable',
  mixins: [alertMixin],
  props: {
    collectionObject: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      STATUSES,
      loading: false,
      data: [],
      page: 1,
      itemsPerPage: 25,
      searchInput: '',
      search: '',
      statusFilter: 'SUBMITTED',
      statusFilterOptions: [
        { title: 'All', value: 'ALL' },
        { title: 'Needs Follow-up', value: 'FOLLOW_UP' },
        ...Object.entries(STATUSES).map(([value, status]) => ({ title: status.label, value })),
      ],
      headers: [
        { title: 'School', key: 'schoolName', align: 'start', sortable: true },
        { title: 'School Category', key: 'categoryLabel', align: 'start', sortable: true },
        { title: 'Total Submissions', key: 'totalSubmissions', align: 'center', sortable: true },
        { title: 'Last Submission', key: 'lastSubmission', align: 'center', sortable: true },
        { title: 'Status', key: 'statusOrder', align: 'center', sortable: true },
      ],
    };
  },
  computed: {
    filteredData() {
      if (this.statusFilter === 'ALL') {
        return this.data;
      }
      if (this.statusFilter === 'FOLLOW_UP') {
        return this.data.filter(row => row.status !== 'SUBMITTED');
      }
      return this.data.filter(row => row.status === this.statusFilter);
    },
  },
  watch: {
    searchInput(value) {
      this.updateSearch(value);
    },
    collectionObject(newValue, oldValue) {
      if (newValue?.reportingPeriodID !== oldValue?.reportingPeriodID) {
        this.fetchData();
      }
    },
  },
  created() {
    this.updateSearch = debounce((value) => {
      this.search = value;
    }, 300);
    this.fetchData();
  },
  beforeUnmount() {
    this.updateSearch.cancel();
  },
  methods: {
    async fetchData() {
      this.data = [];
      this.page = 1;
      if (!this.collectionObject?.reportingPeriodID) {
        return;
      }
      this.loading = true;
      try {
        const response = await ApiService.apiAxios.get(`${Routes.gdc.REPORTING_INSIGHTS}/${this.collectionObject.reportingPeriodID}/submission-status`);
        this.data = (response.data ?? []).map(row => ({
          ...row,
          categoryLabel: CATEGORY_LABELS[row.schoolCategoryCode] ?? row.schoolCategoryCode,
          statusOrder: STATUSES[row.status]?.order ?? 99,
        }));
      } catch (error) {
        console.error('Error fetching school submission status:', error);
        this.setFailureAlert('Failed to load school submission status.');
      } finally {
        this.loading = false;
      }
    },
    formatDate(dateTimeString) {
      if (!dateTimeString) {
        return '-';
      }
      const date = new Date(dateTimeString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}/${month}/${day}`;
    },
  },
};
</script>

<style scoped>
:deep(th) {
  color: #38598a !important;
}

:deep(.v-data-table-footer__items-per-page) {
  display: none !important;
}
</style>
