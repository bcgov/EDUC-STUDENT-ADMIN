<template>
  <div>
    <v-row justify="start">
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
          class="pb-0"
          @update:model-value="fetchDetailedData"
        />
        <div v-else>
          Loading school categories...
        </div>
      </v-col>
    </v-row>

    <v-row>
      <v-col
        cols="12"
        md="4"
      >
        <v-text-field
          v-model="search"
          label="Search"
          density="compact"
          prepend-inner-icon="mdi-magnify"
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
      :headers="tableHeaders"
      :items="detailedData"
      :search="search"
      class="elevation-1"
      density="compact"
    >
      <template #headers="{ getSortIcon, toggleSort }">
        <tr>
          <th
            v-for="column in tableHeaders"
            :key="column.key"
            :class="{
              'text-center': column.align === 'center',
              'text-start': column.align === 'start',
              'text-end': column.align === 'end',
              'v-data-table__th--sortable': column.sortable,
            }"
            :style="{
              width: column.width || 'auto',
              minWidth: column.width || 'auto',
              cursor: column.sortable ? 'pointer' : 'default',
            }"
            scope="col"
            @click="column.sortable ? toggleSort(column) : null"
          >
            <div
              class="v-data-table-header__content d-flex align-center"
              :style="{
                justifyContent:
                  column.align === 'center'
                    ? 'center'
                    : column.align === 'end'
                      ? 'flex-end'
                      : 'flex-start',
              }"
            >
              <template v-if="column.key === 'actions'">
                <template v-if="reportingPeriodType === 'SchoolYear'">
                  <v-tooltip
                    location="bottom"
                    max-width="450px"
                    content-class="custom-tooltip-styling"
                  >
                    <template #activator="{ props: tooltipProps }">
                      <v-icon
                        v-bind="tooltipProps"
                        size="small"
                        color="primary"
                      >
                        mdi-help-circle-outline
                      </v-icon>
                    </template>
                    <div v-html="column.tooltipText" />
                  </v-tooltip>
                </template>
                <template v-else-if="reportingPeriodType !== 'Summer'">
                  <v-icon
                    size="small"
                    color="primary"
                  >
                    mdi-help-circle-outline
                  </v-icon>
                </template>
              </template>
              <template v-else>
                <span>{{ column.title }}</span>
              </template>
              <v-icon
                v-if="column.sortable"
                :icon="getSortIcon(column)"
                class="v-data-table-header__sort-icon ml-1"
                size="x-small"
              />
            </div>
          </th>
        </tr>
      </template>

      <template #item="{ item: dataTableRow, index }">
        <tr>
          <td
            v-for="header in tableHeaders"
            :key="header.key"
            class="table-cell"
            :class="`text-${header.align}`"
            :style="{ width: header.width ? header.width : 'auto' }"
          >
            <template v-if="header.key === 'facilityType'">
              {{
                facilityTypeLabelMap.get(dataTableRow.selectable.facilityType) ||
                  dataTableRow.selectable.facilityType
              }}
            </template>
            <template v-else-if="header.key === 'lastSubmission'">
              {{ formatDate(dataTableRow.selectable[header.key]) }}
            </template>
            <template v-else-if="header.key === 'actions'">
              <v-tooltip
                v-model="tooltipStates[dataTableRow.selectable.schoolID]"
                location="bottom"
                activator="parent"
                :open-on-hover="false"
              >
                <template #activator="{ props }">
                  <span
                    v-bind="props"
                    style="cursor: pointer"
                    @click="toggleTooltip(dataTableRow.selectable.schoolID)"
                  >...</span>
                </template>
                <div>
                  {{ dataTableRow.selectable.schoolName }}<br>
                  {{ dataTableRow.selectable.schoolPhoneNumber }}<br>
                  Grad Administrators:<br>
                  <template v-if="dataTableRow.selectable.gradUsers && dataTableRow.selectable.gradUsers.length > 0">
                    <div
                      v-for="(gradUser, i) in dataTableRow.selectable.gradUsers"
                      :key="i"
                    >
                      {{ gradUser.userFullName }} - {{ gradUser.userEmail }}
                    </div>
                  </template>
                  <template v-else>
                    No Grad Administrators found.
                  </template>
                </div>
              </v-tooltip>
            </template>
            <template v-else>
              {{ dataTableRow.selectable[header.key] ?? '-' }}
            </template>
          </td>
        </tr>
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
import { instituteStore } from '@/store/modules/institute';
import { mapState } from 'pinia';

export default {
  name: 'SchoolCategoryTable',
  mixins: [alertMixin],
  props: {
    preSelectedCategory: {
      type: String,
      required: false,
      default: null,
    },
    reportingPeriodID: {
      type: String,
      required: true,
    },
    reportingPeriodType: {
      type: String,
      required: true,
    },
    availableCategories: {
      type: Array,
      required: true,
      default: () => [],
    },
  },
  data() {
    return {
      loading: false,
      selectedCategory: null,
      detailedData: [],
      schoolYearCategoryTableHeader: [
        { title: 'School', key: 'schoolName', align: 'start' },
        {
          title: 'Facility Type',
          key: 'facilityType',
          align: 'center',
          sortable: false,
        },
        { title: 'Total Submissions', key: 'totalSubmissions', align: 'center' },
        { title: 'Last Submission', key: 'lastSubmission', align: 'center' },
        { title: 'Current Graduates', key: 'currentGraduates', align: 'center' },
        {
          title: 'Current Non-Graduates',
          key: 'currentNonGraduates',
          align: 'center',
        },
        { title: '% Graduation', key: 'percentageGraduation', align: 'center' },
        {
          title: 'Grade 12 Enrolment',
          key: 'grade12Enrolment',
          align: 'center',
        },
        {
          title: '% Graduated SLD',
          key: 'percentGraduatedSLD',
          align: 'center',
        },
        {
          title: '',
          key: 'actions',
          align: 'center',
          sortable: false,
          width: '50px',
          tooltipText: `<strong>The values in the report are calculated for each school as follows:</strong><br><br>
                          <strong>Current Graduates:</strong> Total number of current students in GRAD that are not registered in SCCP and have program completion date within the current reporting period.<br><br>
                          <strong>Current Non-Graduates:</strong> Total number of current grade 12 students in GRAD that are registered in a non-SCCP graduation program and do not have a program completion date.<br><br>
                          <strong>% of Graduated GRAD Students:</strong> Calculated by dividing the number of current graduates by the total number of current graduates and non-graduates.<br><br>
                          <strong>SLD Grade 12 Enrolment:</strong> Total students reported in grade 12 during the September SLD Collection.<br><br>
                          <strong>% of Graduated SLD Students:</strong> Calculated by dividing the number of current graduates by the SLD Grade 12 Enrolment.`
        },
      ],
      summerCategoryTableHeader: [
        { title: 'School', key: 'schoolName', align: 'start' },
        {
          title: 'Facility Type',
          key: 'facilityType',
          align: 'center',
          sortable: false,
        },
        { title: 'Total Submissions', key: 'totalSubmissions', align: 'center' },
        { title: 'Last Submission', key: 'lastSubmission', align: 'center' },
        {
          title: '',
          key: 'actions',
          align: 'center',
          sortable: false,
          width: '50px',
        },
      ],
      sdcCollectionID: null,
      page: 1,
      itemsPerPage: 25,
      search: '',
      tooltipStates: {}, // To track the open/closed state of each tooltip
    };
  },
  computed: {
    ...mapState(instituteStore, ['facilityTypeCodes']),
    facilityTypeLabelMap() {
      if (!this.facilityTypeCodes) {
        return new Map();
      }

      return new Map(
        this.facilityTypeCodes.map((type) => [type.facilityTypeCode, type.label])
      );
    },
    tableHeaders() {
      return this.reportingPeriodType === 'SchoolYear'
        ? this.schoolYearCategoryTableHeader
        : this.summerCategoryTableHeader;
    },
  },
  watch: {
    availableCategories: {
      handler(value) {
        if (value && value.length > 0) {
          if (
            this.preSelectedCategory &&
              value.includes(this.preSelectedCategory)
          ) {
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
          this.page = 1;
          this.tooltipStates = {}; // Clear tooltip states
        }
      },
      immediate: true,
    },
    preSelectedCategory: {
      handler(value) {
        if (
          value &&
            value !== this.selectedCategory &&
            this.availableCategories &&
            this.availableCategories.length > 0 &&
            this.availableCategories.includes(value)
        ) {
          this.selectedCategory = value;
          this.page = 1;
        }
      },
    },
    selectedCategory(newValue, oldValue) {
      if (newValue && newValue !== oldValue) {
        this.fetchDetailedData();
        this.page = 1;
      } else if (newValue === null) {
        this.detailedData = [];
        this.page = 1;
        this.tooltipStates = {}; // Clear tooltip states
      }
    },
    detailedData(newVal) {
      this.tooltipStates = newVal.reduce((acc, item) => {
        // Ensure item.selectable exists and has schoolID
        if (item?.selectable?.schoolID) {
          acc[item.selectable.schoolID] = false;
        }
        return acc;
      }, {});
      this.page = 1;
    },
  },
  created() {
    const store = instituteStore();
    if (!this.facilityTypeCodes || this.facilityTypeCodes.length === 0) {
      store.getAllFacilityTypeCodes().catch((error) => {
        console.error('Failed to load facility type codes:', error);
        this.setFailureAlert(
          'Failed to load facility type codes. Some labels may not display correctly.'
        );
      });
    }
  },
  mounted() {
    document.addEventListener('click', this.handleClickOutside);
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside);
  },
  methods: {
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
    async fetchDetailedData() {
      this.loading = true;
      this.detailedData = [];
      this.tooltipStates = {}; // Reset tooltip states on fetch

      try {
        if (this.sdcCollectionID === null) {
          const sdcResponse = await ApiService.apiAxios.get(
            `${Routes.sdc.COLLECTION_PAGINATED}`,
            {
              params: {
                pageNumber: 0,
                pageSize: 1,
                searchParams: {
                  collectionType: 'SEPTEMBER',
                },
                sort: {
                  submissionDueDate: 'DESC',
                },
              },
            }
          );
          this.sdcCollectionID = sdcResponse?.data?.content?.[0]?.collectionID;
          if (!this.sdcCollectionID) {
            this.setFailureAlert('Required SDC collection data not found.');
            this.loading = false;
            return;
          }
        }

        const response = await ApiService.apiAxios.get(
          `${Routes.gdc.REPORTING_INSIGHTS}/${this.reportingPeriodID}/${this.reportingPeriodType}/${this.sdcCollectionID}/${
            GRAD_SCHOOL_CATEGORY_MAP[this.selectedCategory]
          }`
        );
        this.detailedData = response.data;
      } catch (error) {
        console.error('Error fetching detailed data:', error);
        this.setFailureAlert('Failed to load school submission data.');
        this.detailedData = [];
        this.tooltipStates = {}; // Reset on error as well
      } finally {
        this.loading = false;
      }
    },
    toggleTooltip(schoolID) {
      // Close any other open tooltips
      Object.keys(this.tooltipStates).forEach(id => {
        if (id !== schoolID && this.tooltipStates[id]) {
          this.tooltipStates[id] = false;
        }
      });
      // Toggle the current tooltip
      this.tooltipStates[schoolID] = !this.tooltipStates[schoolID];
    },
    handleClickOutside(event) {
      const tooltips = document.querySelectorAll('.v-tooltip--open');
      let clickedInsideTooltip = false;
      tooltips.forEach(tooltip => {
        if (tooltip.contains(event.target)) {
          clickedInsideTooltip = true;
        }
      });

      if (!clickedInsideTooltip) {
        Object.keys(this.tooltipStates).forEach(id => {
          this.tooltipStates[id] = false;
        });
      }
    },
  },
};
</script>

<style scoped>
th {
  color: #38598a !important;
}

td.table-cell.text-center {
  padding-right: 2em;
}

:deep(.v-data-table-footer__items-per-page) {
  display: none !important;
}
</style>
