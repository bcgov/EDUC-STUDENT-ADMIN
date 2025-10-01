<template>
  <div>
    <v-row
      v-if="displaySeptemberCollectionWarning"
      justify="start"
    >
      <v-col>
        <v-alert
          type="info"
          variant="tonal"
          text="The September Student Data Collection is still ongoing. The table below will be populated once the collection is complete."
        />
      </v-col>
    </v-row>
    
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
          variant="underlined"
          class="pb-0"
          @update:model-value="fetchDetailedData"
        />
        <div v-else>
          Loading school categories...
        </div>
      </v-col>
      <v-col
        cols="12"
        md="4"
      >
        <v-text-field
          v-model="search"
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

      <template #item="{ item: dataTableRow }">
        <tr>
          <td
            v-for="header in tableHeaders"
            :key="header.key"
            class="table-cell"
            :class="`text-${header.align}`"
            :style="{ width: header.width ? header.width : 'auto' }"
          >
            <template v-if="header.key === 'facilityTypeLabel'">
              {{ dataTableRow?.raw?.facilityTypeLabel ?? '-' }}
            </template>
            <template v-else-if="header.key === 'lastSubmission'">
              {{ formatDate(dataTableRow?.raw?.[header.key]) }}
            </template>
            <template v-else-if="header.key === 'actions'">
              <v-menu
                location="bottom end"
                :close-on-content-click="false"
              >
                <template #activator="{ props: menuProps }">
                  <v-btn
                    icon="mdi-dots-vertical"
                    variant="text"
                    size="small"
                    v-bind="menuProps"
                  />
                </template>
                <v-list density="compact">
                  <v-list-item>
                    <v-list-item-title class="text-subtitle-2 font-weight-bold">
                      {{ dataTableRow?.raw?.schoolName ?? 'N/A' }}
                    </v-list-item-title>
                    <v-list-item-subtitle>
                      <v-icon> mdi-phone-outline</v-icon>
                      {{ dataTableRow?.raw?.schoolPhoneNumber ?? 'N/A' }}
                    </v-list-item-subtitle>
                  </v-list-item>
                  <v-divider class="my-1" />
                  <v-list-subheader><strong>Grad Administrators</strong></v-list-subheader>
                  <template v-if="dataTableRow?.raw?.gradUsers && dataTableRow.raw.gradUsers.length > 0">
                    <v-list-item
                      v-for="(gradUser, i) in dataTableRow.raw.gradUsers"
                      :key="i"
                      density="compact"
                    >
                      <v-list-item-title class="text-body-2">
                        {{ gradUser.userFullName }}
                      </v-list-item-title>
                      <v-list-item-subtitle
                        class="text-caption"
                      >
                        <v-icon> mdi-email-outline </v-icon>
                        {{ gradUser.userEmail }}
                      </v-list-item-subtitle>
                    </v-list-item>
                  </template>
                  <template v-else>
                    <v-list-item density="compact">
                      <v-list-item-title class="text-body-2">
                        No Grad Administrators found
                      </v-list-item-title>
                    </v-list-item>
                  </template>
                  <v-divider class="my-1" />
                  <v-list-item>
                    <v-list-item-title
                      class="text-subtitle-2 pb-2"
                    >
                      <a
                        :href="`${edxURL}/api/auth/silent_sdc_idir_login?schoolID=${dataTableRow?.raw?.schoolID}&gradDashboard=true&idir_guid=${userInfo?.userGuid?.toLowerCase()}`"
                        target="_link"
                      >
                        <v-icon>mdi-school-outline</v-icon>
                        Graduation Dashboard
                      </a>
                    </v-list-item-title>
                    <v-list-item-title
                      class="text-subtitle-2"
                    >
                      <a @click="openSchool(dataTableRow?.raw?.schoolID)">
                        <v-icon>mdi-domain</v-icon>
                        School Details
                      </a>
                    </v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </template>
            <template v-else>
              {{ dataTableRow?.raw?.[header.key] ?? '-' }}
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
import { appStore } from '@/store/modules/app';
import { authStore } from '@/store/modules/auth';
import {setFailureAlert} from '@/components/composable/alertComposable';
import {DateTimeFormatter, LocalDate} from '@js-joda/core';

export default {
  name: 'SchoolCategoryTable',
  mixins: [alertMixin],
  props: {
    collectionObject: {
      type: Object,
      required: true,
    },
    preSelectedCategory: {
      type: String,
      required: false,
      default: null,
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
      loadingCount: 0,
      userSelectedCategory: null,
      septemberSdcCollection: null,
      detailedData: [],
      page: 1,
      itemsPerPage: 25,
      search: '',
      edxURL: '',
      schoolYearCategoryTableHeader: [
        { title: 'School', key: 'schoolName', align: 'start', sortable: true },
        {
          title: 'Facility Type',
          key: 'facilityTypeLabel',
          align: 'center',
          sortable: true,
        },
        { title: 'Total Submissions', key: 'totalSubmissions', align: 'center', sortable: true },
        { title: 'Last Submission', key: 'lastSubmission', align: 'center', sortable: true },
        { title: 'Current Graduates', key: 'currentGraduates', align: 'center', sortable: true },
        {
          title: 'Current Non-Graduates',
          key: 'currentNonGraduates',
          align: 'center',
          sortable: true,
        },
        { title: '% Graduation', key: 'percentageGraduation', align: 'center', sortable: true },
        {
          title: 'Grade 12 Enrolment',
          key: 'grade12Enrolment',
          align: 'center',
          sortable: true,
        },
        {
          title: '% Graduated SLD',
          key: 'percentGraduatedSLD',
          align: 'center',
          sortable: true,
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
        { title: 'School', key: 'schoolName', align: 'start', sortable: true },
        {
          title: 'Facility Type',
          key: 'facilityTypeLabel',
          align: 'center',
          sortable: true,
        },
        { title: 'Total Submissions', key: 'totalSubmissions', align: 'center', sortable: true },
        { title: 'Last Submission', key: 'lastSubmission', align: 'center', sortable: true },
        {
          title: '',
          key: 'actions',
          align: 'center',
          sortable: true,
          width: '50px',
        },
      ],
    };
  },
  computed: {
    ...mapState(instituteStore, ['facilityTypeCodes']),
    ...mapState(authStore, ['userInfo']),
    ...mapState(appStore, ['config']),
    loading() {
      return this.loadingCount > 0;
    },
    canFetchSchoolYearDetailReport() {
      if (!this.septemberSdcCollection) {
        return false;
      }
      return this.septemberSdcCollection.collectionStatusCode === 'COMPLETED';
    },
    displaySeptemberCollectionWarning() {
      return this.reportingPeriodType === 'SchoolYear' && !this.canFetchSchoolYearDetailReport;
    },
    selectedCategory: {
      get() {
        if (this.userSelectedCategory === null) {
          return this.preSelectedCategory;
        }
        return this.userSelectedCategory;
      },
      set(selectedCategory) {
        if (!this.availableCategories.includes(selectedCategory)) {
          return;
        }
        this.userSelectedCategory = selectedCategory;
      }
    },
    facilityTypeLabelMap() {
      if (!this.facilityTypeCodes) {
        return new Map();
      }
      return new Map(
        this.facilityTypeCodes.map((type) => [type.facilityTypeCode, type.label])
      );
    },
    tableHeaders() {
      return this.reportingPeriodType === 'SchoolYear' ? this.schoolYearCategoryTableHeader : this.summerCategoryTableHeader;
    },
  },
  watch: {
    async collectionObject(newValue, oldValue) {
      if (newValue === oldValue) {
        return;
      }
      await this.findSeptemberSdcCollection();
      await this.fetchDetailedData();
    }
  },
  async created() {
    const store = instituteStore();
    if (!this.facilityTypeCodes || this.facilityTypeCodes.length === 0) {
      store.getAllFacilityTypeCodes().catch((error) => {
        console.error('Failed to load facility type codes:', error);
      });
    }
    appStore().getConfig().then(() => {
      this.edxURL = this.config.EDX_URL;
    });
    await this.findSeptemberSdcCollection();
    await this.fetchDetailedData();
  },
  methods: {
    async findSeptemberSdcCollection() {
      if (this.reportingPeriodType !== 'SchoolYear') {
        return;
      }
      this.loadingCount += 1;
      try {
        let results = await ApiService.apiAxios.get(Routes.sdc.COLLECTION_PAGINATED, {
          params: {
            pageNumber: 0,
            pageSize: 1,
            searchParams: {
              collectionType: 'SEPTEMBER',
              submissionDueDateRangeStart: LocalDate.parse(this.collectionObject.periodStart, DateTimeFormatter.ISO_LOCAL_DATE_TIME).format(DateTimeFormatter.ISO_LOCAL_DATE),
              submissionDueDateRangeEnd:  LocalDate.parse(this.collectionObject.periodEnd, DateTimeFormatter.ISO_LOCAL_DATE_TIME).format(DateTimeFormatter.ISO_LOCAL_DATE)
            },
            sort: {
              submissionDueDate: 'DESC'
            },
          },
        });
        this.septemberSdcCollection = results.data?.content?.[0];
      }
      catch(error) {
        console.error(error);
        await setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while trying to find the closest SDC September Collection. Please try again later.');
      }
      finally {
        this.loadingCount -= 1;
      }
    },
    async fetchDetailedData() {
      this.detailedData = [];
      this.page = 1;
      if (this.reportingPeriodType === 'SchoolYear') {
        await this.fetchSchoolYearDetailData();
      } else if (this.reportingPeriodType === 'Summer') {
        await this.fetchSummerDetailData();
      }
    },
    async fetchSchoolYearDetailData() {
      if (!this.canFetchSchoolYearDetailReport) {
        return;
      }
      this.loadingCount += 1;
      try {
        const response = await ApiService.apiAxios.get(`${Routes.gdc.REPORTING_INSIGHTS}/${this.collectionObject?.reportingPeriodID}/${this.reportingPeriodType}/${this.septemberSdcCollection?.collectionID}/${GRAD_SCHOOL_CATEGORY_MAP[this.selectedCategory]}`);
        this.detailedData = this.transformReportResponseData(response);
      } catch (error) {
        console.error('Error fetching School Year detailed data:', error);
        this.setFailureAlert('Failed to load School Year submission data.');
        this.detailedData = [];
      } finally {
        this.loadingCount -= 1;
      }
    },
    async fetchSummerDetailData() {
      this.loadingCount += 1;
      try {
        const response = await ApiService.apiAxios.get(`${Routes.gdc.REPORTING_INSIGHTS}/${this.collectionObject?.reportingPeriodID}/${this.reportingPeriodType}/${GRAD_SCHOOL_CATEGORY_MAP[this.selectedCategory]}`);
        this.detailedData = this.transformReportResponseData(response);
      } catch (error) {
        console.error('Error fetching Summer detailed data:', error);
        this.setFailureAlert('Failed to load Summer submission data.');
        this.detailedData = [];
      } finally {
        this.loadingCount -= 1;
      }
    },
    transformReportResponseData(reportResponse) {
      if (!reportResponse.data || !Array.isArray(reportResponse.data)) {
        return [];
      }
      return reportResponse.data.map(apiItem => {
        const originalFacilityTypeCode = apiItem.facilityType;
        const facilityTypeLabel =
            (this.facilityTypeLabelMap.get(originalFacilityTypeCode) || originalFacilityTypeCode || '').toString();

        return {
          ...apiItem,
          facilityTypeLabel: facilityTypeLabel,
        };
      });
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
    openSchool(schoolID) {
      if (!schoolID) return;
      const routeData = this.$router.resolve({
        name: 'schoolDetails',
        params: { schoolID: schoolID }
      });
      window.open(routeData.href, '_blank');
    }
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
