<template>
  <div>
    <v-row
      justify="start"
      class="mb-4"
    >
      <v-col
        cols="12"
        md="4"
      >
        <v-select
          v-if="availableCategories && availableCategories.length > 0"
          v-model="selectedCategory"
          :items="availableCategories"
          label="School Category"
          density="compact"
          @update:model-value="fetchDetailedData"
        />
        <div v-else>
          Loading school categories...
        </div>
      </v-col>
      <v-col
        cols="12"
        md="auto"
        align-self="center"
      >
        <v-btn
          variant="outlined"
          @click="$emit('close-detail')"
        >
          Back to Summary
        </v-btn>
      </v-col>
    </v-row>

    <v-progress-linear
      v-if="loading"
      indeterminate
      color="primary"
    />

    <v-table
      v-else
      density="compact"
    >
      <thead>
        <tr>
          <th
            v-for="columnHeader in categoryTableHeader"
            :key="columnHeader.key"
          >
            {{ columnHeader.title }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(row, index) in detailedData"
          :key="`${row.XXXX_schoolName || ''}-${row.XXXX_facilityType || ''}-${index}`"
        >
          <td
            v-for="columnHeader in categoryTableHeader"
            :key="columnHeader.key"
            class="table-cell"
          >
            {{ row[columnHeader.key] }}
          </td>
        </tr>
        <tr v-if="!detailedData || detailedData.length === 0">
          <td
            :colspan="categoryTableHeader.length"
            class="text-center"
          >
            No data available for this selection.
          </td>
        </tr>
      </tbody>
    </v-table>
  </div>
</template>

<script>
import alertMixin from '@/mixins/alertMixin';
import ApiService from '@/common/apiService';
import {Routes, GRAD_SCHOOL_CATEGORY_MAP} from '@/utils/constants';

export default {
  name: 'SchoolCategoryTable',
  mixins: [alertMixin],
  props: {
    preSelectedCategory: {
      type: String,
      required: false,
      default: null
    },
    reportingPeriodID: {
      type: String,
      required: true
    },
    availableCategories: {
      type: Array,
      required: true,
      default: () => []
    }
  },
  data() {
    return {
      loading: false,
      selectedCategory: null,
      detailedData: [],
      categoryTableHeader: [
        { title: 'School', key: 'XXXX_schoolName', align: 'start' },
        { title: 'Facility Type', key: 'XXXX_facilityType', align: 'start' },
        { title: 'Total Submissions', key: 'XXXX_totalSubmissions', align: 'end' },
        { title: 'Last Submission', key: 'XXXX_lastSubmission', align: 'end' },
        { title: 'Current Graduates', key: 'XXXX_currentGraduates', align: 'end' },
        { title: 'Current Non-Graduates', key: 'XXXX_currentNonGraduates', align: 'end' },
        { title: '% of Graduated GRAD Students', key: 'XXXX_percentGraduatedGradStudents', align: 'end' },
        { title: 'SLD Grade 12 Enrolment', key: 'XXXX_sldGrade12Enrolment', align: 'end' },
        { title: '% of Graduated SLD Students', key: 'XXXX_percentGraduatedSldStudents', align: 'end' },
      ],
      sdcCollectionID: null,
    };
  },
  computed: {

  },
  watch: {
    availableCategories: {
      handler(value) {
        if (value && value.length > 0) {
          if (this.preSelectedCategory && value.includes(this.preSelectedCategory)) {
            this.selectedCategory = this.preSelectedCategory;
          } else {
            if (!this.selectedCategory) {
              this.selectedCategory = value[0];
            }
          }
          if (this.selectedCategory) {
            this.fetchDetailedData();
          }
        } else {
          this.selectedCategory = null;
          this.detailedData = [];
        }
      },
      immediate: true,
    },
    preSelectedCategory: {
      handler(value) {
        //TODO: is this if check needed?
        if (value && value !== this.selectedCategory &&
            this.availableCategories && this.availableCategories.length > 0 && this.availableCategories.includes(value)) {
          this.selectedCategory = value;
        }
      }
    },
    selectedCategory(newValue, oldValue) {
      if (newValue && newValue !== oldValue) {
        this.fetchDetailedData();
      } else if (newValue === null) {
        this.detailedData = [];
      }
    }
  },

  methods: {
    async fetchDetailedData() {
      this.loading = true;
      this.detailedData = [];

      try {
        if (this.sdcCollectionID === null) {
          const sdcResponse = await ApiService.apiAxios.get(`${Routes.sdc.COLLECTION_PAGINATED}`, {
            params: {
              pageNumber: 0,
              pageSize: 1,
              searchParams: {
                'collectionType': 'SEPTEMBER',
              },
              sort: {
                'submissionDueDate': 'DESC'
              },
            },
          });

          this.sdcCollectionID = sdcResponse?.data?.content?.[0]?.collectionID;

          if (this.sdcCollectionID === null || this.sdcCollectionID === undefined) {
            this.setFailureAlert('Required collection data not found.');
            return;
          }
        }

        const response = await ApiService.apiAxios.get(`${Routes.gdc.REPORTING_INSIGHTS}/${this.reportingPeriodID}/${this.sdcCollectionID}/${GRAD_SCHOOL_CATEGORY_MAP[this.selectedCategory]}`);

        this.detailedData = response.data;

      } catch (error) {
        console.error('Error fetching detailed data:', error);
        this.setFailureAlert('Failed to load retrieve school submission data.');
        this.detailedData = [];
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.table-cell {
  text-align: left;
}
th {
  color: #38598a !important;
  text-align: left !important;
}
</style>
