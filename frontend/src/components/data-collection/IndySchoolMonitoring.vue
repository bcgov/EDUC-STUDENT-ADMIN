<template>
  <v-row v-if="isLoading">
    <v-col>
      <Spinner />
    </v-col>
  </v-row>
  <v-row
    v-else-if="!isHistoricalCollection()"
    class="mt-n6"
  >
    <v-spacer />
    <v-slide-group
      class="py-4"
      show-arrows
    >
      <v-slide-group-item>
        <v-col>
          <v-card
            height="100%"
          >
            <v-card-item class="pb-0">
              <v-card-title class="column-header">
                Data Uploaded
              </v-card-title>
            </v-card-item>
            <v-card-text>
              <v-row
                class="row-data"
              >
                <v-col class="column-data">
                  <div>Have Data</div>
                  <span id="hasUploadedValue">
                    {{ monitorSdcSchoolCollectionsResponse?.schoolsWithData }}
                  </span>
                </v-col>
                <v-divider
                  class="divider"
                  :vertical="true"
                />
                <v-col class="column-data">
                  <div>Missing Data</div>
                  <span id="missingUploadedValue">
                    {{
                      monitorSdcSchoolCollectionsResponse?.totalSchools - monitorSdcSchoolCollectionsResponse?.schoolsWithData
                    }}
                  </span>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-slide-group-item>
      <v-slide-group-item>
        <v-col>
          <v-card
            height="100%"
          >
            <v-card-item class="pb-0">
              <v-card-title class="column-header">
                Data Issues
              </v-card-title>
            </v-card-item>
            <v-card-text>
              <v-row
                class="row-data"
              >
                <v-col class="column-data">
                  <div>Errors</div>
                  <v-icon color="#d90606">
                    mdi-alert-circle-outline
                  </v-icon>
                  <span id="dataErrorValue">
                    {{ monitorSdcSchoolCollectionsResponse?.totalErrors }}
                  </span>
                </v-col>
                <v-divider
                  class="divider"
                  :vertical="true"
                />
                <v-col class="column-data">
                  <div>Funding Warnings</div>
                  <v-icon color="orange">
                    mdi-alert-outline
                  </v-icon>
                  <span id="dataFundingWarnValue">
                    {{ monitorSdcSchoolCollectionsResponse?.totalFundingWarnings }}
                  </span>
                </v-col>
                <v-divider
                  class="divider"
                  :vertical="true"
                />
                <v-col class="column-data">
                  <div>Info Warnings</div>
                  <v-icon color="blue">
                    mdi-alert-circle-outline
                  </v-icon>
                  <span id="dataInfoWarnValue">
                    {{ monitorSdcSchoolCollectionsResponse?.totalInfoWarnings }}
                  </span>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-slide-group-item>
      <v-slide-group-item>
        <v-col>
          <v-card
            height="100%"
          >
            <v-card-item class="pb-0">
              <v-card-title class="column-header">
                Submitted 
              </v-card-title>
            </v-card-item>
            <v-card-text>
              <v-row
                class="row-data"
              >
                <v-col class="column-data">
                  <div>Submitted</div>
                  <span id="submittedValue">
                    {{ monitorSdcSchoolCollectionsResponse?.schoolsSubmitted }}
                  </span>
                </v-col>
                <v-divider
                  class="divider"
                  :vertical="true"
                />
                <v-col class="column-data">
                  <div>Not Submitted</div>
                  <span id="notSubmittedValue">
                    {{
                      monitorSdcSchoolCollectionsResponse?.totalSchools - monitorSdcSchoolCollectionsResponse?.schoolsSubmitted
                    }}
                  </span>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-slide-group-item>
    </v-slide-group>
    <v-spacer />
  </v-row>
  <v-navigation-drawer
    v-model="showFilters"
    location="right"
    :temporary="true"
    width="700"
    :persistent="true"
    scrim="transparent"
    :border="true"
    style="top:0; height: 100%;"
    rounded="true"
  >
    <Filters
      :filters="allowedFilters"
      :school="school"
      :show-student-search="false"
      :indy-school-district-object="indySchoolDistrictObject"
      :school-ui-filter="schoolUiFilter"
      @apply-filters="applyFilters"
      @clear-filters="clearFilters"
      @close="toggleFilters()"
    />
  </v-navigation-drawer>
  <v-row
    v-if="!isLoading"
    :class="isHistoricalCollection() ? 'mt-2' : ''"
    justify="end"
    no-gutters
  >
    <v-btn
      id="filters"
      color="#003366"
      text="Filter"
      class="mr-1 mb-1"
      prepend-icon="mdi-filter-multiple-outline"
      variant="outlined"
      @click="toggleFilters"
    >
      <template #append>
        <v-badge
          color="error"
          :content="filterCount"
          :floating="true"
          offset-y="-10"
        />
      </template>
    </v-btn>
  </v-row>
  <v-row v-if="!isLoading">
    <v-col class="py-0">
      <span
        id="recordsFound"
        class="bold"
      >
        Records Found:  {{ filteredItems?.length }}
      </span>
    </v-col>
    <v-col
      cols="12"
      class="pt-0"
    >
      <v-data-table
        id="monitoring-table"
        :headers="headers"
        :sort-by="sortBy"
        :items="filteredItems"
      >
        <template #item.schoolTitle="{ item }">
          <a v-if="hasEditPermission"
            :href="`${edxURL}/api/auth/silent_sdc_idir_login?schoolID=${item.raw.schoolId}&sdcSchoolCollectionID=${item.raw.sdcSchoolCollectionId}&idir_guid=${user.userGuid.toLowerCase()}`"
            target="_link"
          >
            {{ item.raw.schoolTitle }}
          </a>
          <span v-else>
            {{ item.raw.schoolTitle }}
          </span>
        </template>
        <template #item.uploadDate="{ item }">
          <span v-if="item.raw.uploadDate">
            <template v-if="item.raw.uploadDate.includes('.')">
              {{ formatDateFromDateTime(item.raw.uploadDate, "uuuu-MM-dd'T'HH:mm:ss.SSSSSS") }}
              <v-tooltip activator="parent">
                {{ formatDateTime(item.raw.uploadDate, "uuuu-MM-dd'T'HH:mm:ss.SSSSSS", 'uuuu/MM/dd HH:mm:ss', true) }}
              </v-tooltip>
            </template>
            <template v-else>
              {{ formatDateFromDateTime(item.raw.uploadDate, "uuuu-MM-dd'T'HH:mm:ss") }}
              <v-tooltip activator="parent">
                {{ formatDateTime(item.raw.uploadDate, "uuuu-MM-dd'T'HH:mm:ss", 'uuuu/MM/dd HH:mm:ss', true) }}
              </v-tooltip>
            </template>
          </span>
          <span v-else>
            -
          </span>
        </template>
        <template #item.uploadReportDate="{ item }">
          <span v-if="item.raw.uploadReportDate">
            {{ formatDate(item.raw.uploadReportDate) }}
          </span>
          <span v-else>
            -
          </span>
        </template>
        <template #item.unsubmit="{ item }">
          <v-btn
            :id="'unsubmitBtn' + item.raw.sdcSchoolCollectionId"
            color="primary"
            icon="mdi-lock-open"
            variant="text"
            :disabled="item.raw.schoolStatus !== 'SUBMITTED'"
            @click="unsubmitSdcSchoolCollection(item.raw.sdcSchoolCollectionId)"
          />
        </template>
        <template #item.contact="{ item }">
          <a
            target="_blank"
            @click="openSchoolContacts(item.raw.schoolId)"
          >
            View
          </a>
        </template>
      </v-data-table>
    </v-col>
  </v-row>
  <ConfirmationDialog ref="confirmRemovalOfCollection">
    <template #message>
      <p>Are you sure that you would like to unsubmit the selected SDC School Collection?</p>
    </template>
  </ConfirmationDialog>
</template>
<script>
import {defineComponent} from 'vue';
import ApiService from '@/common/apiService';
import {Routes} from '@/utils/constants';
import Filters from '../common/Filters.vue';
import {cloneDeep} from 'lodash';
import Spinner from '../common/Spinner.vue';
import {MONITORING} from '@/utils/sdc/collectionTableConfiguration';
import {DateTimeFormatter, LocalDate, LocalDateTime} from '@js-joda/core';
import ConfirmationDialog from '../util/ConfirmationDialog.vue';
import {appStore} from '@/store/modules/app';
import {mapState} from 'pinia';
import {sdcCollectionStore} from '@/store/modules/sdcCollection';
import alertMixin from '@/mixins/alertMixin';
import {authStore} from '@/store/modules/auth';
import { PERMISSION, hasRequiredPermission } from '@/utils/constants/Permission';

export default defineComponent({
  name: 'IndySchoolMonitoring',
  components: {ConfirmationDialog, Spinner, Filters},
  mixins: [alertMixin],
  props: {
    collectionObject: {
      type: Object,
      required: true,
      default: null
    }
  },
  data() {
    return {
      allowedFilters: MONITORING.allowedFilters,
      defaultTab: null,
      edxURL: '',
      filters: {},
      sortBy: [{ key: 'schoolTitle', order:'asc'}],
      headers: [
        {
          title: 'School',
          align: 'start',
          key: 'schoolTitle',
          value: item => { return { title: item.schoolTitle, sdcSchoolCollectionId: item.sdcSchoolCollectionId }; }
        },
        {
          title: 'Data Uploaded',
          align: 'center',
          key: 'uploadDate'
        },
        {
          title: 'Date in File',
          align: 'center',
          key: 'uploadReportDate'
        },
        {
          title: 'Headcount',
          align: 'center',
          key: 'headcount'
        },
        {
          title: 'Errors',
          align: 'center',
          key: 'errors',
          value: item => item.uploadDate ? item.errors : '-'
        },
        {
          title: 'Funding Warnings',
          align: 'center',
          key: 'fundingWarnings',
          value: item => item.uploadDate ? item.fundingWarnings : '-'
        },
        {
          title: 'Info Warnings',
          align: 'center',
          key: 'infoWarnings',
          value: item => item.uploadDate ? item.infoWarnings : '-'
        },
        {
          title: 'Unresolved Duplicates',
          align: 'center',
          key: 'unresolvedDuplicates'
        },
        {
          title: 'School Status',
          align: 'center',
          key: 'schoolStatusDesc',
          value: item => item.schoolStatusDesc
        },
        {
          title: 'Unsubmit',
          align: 'center',
          key: 'unsubmit'
        },
        {
          title: 'Contact',
          align: 'center',
          key: 'contact'
        }
      ],
      generatedDuplicateResponse: {},
      isLoading: true,
      isLoadingDuplicates: false,
      monitorSdcSchoolCollectionsResponse: [],
      openDuplicateView: false,
      showFilters: false,
      school: {},
      user: null,
      schoolCollectionStatusCodes: null,
      selectedSchoolsDuplicates: [],
      indySchoolDistrictObject: {},
      schoolUiFilter: true
    };
  },
  computed: {
    ...mapState(authStore, ['userInfo']),
    ...mapState(appStore, ['config', 'schoolMap']),
    ...mapState(sdcCollectionStore, ['schoolCollectionStatusCodesMap']),
    filterCount() {
      return Object.values(this.filters).filter(filter => !!filter).reduce((acc, filter) => acc.concat(filter), []).length;
    },
    filteredItems() {
      const { schoolNameNumber, issuesFilter, uploadDataFilter } = this.filters || {};

      return this.monitorSdcSchoolCollectionsResponse?.monitorSdcSchoolCollections?.filter(school => {
        if (schoolNameNumber && schoolNameNumber[0]?.value && school.schoolId !== schoolNameNumber[0]?.value) {
          return false;
        }
        if (issuesFilter?.length > 0 && !this.filterForErrorsOrWarnings(school)) {
          return false;
        }
        if (uploadDataFilter?.length > 0 && !this.filterForUploadData(school)) {
          return false;
        }
        return this.filterForStatus(school); //last check so return true if match is found
      });
    },
    hasEditPermission() {
      return this.hasRequiredPermission(this.user, PERMISSION.EDIT_STUDENT_DATA_COLLECTION_PERMISSION);
    }
  },
  async created() {
    appStore().getConfig().then(() => {
      this.edxURL = this.config.EDX_URL;
    });
    authStore().getUserInfo().then(()=> {
      this.user = this.userInfo;
    });
    await appStore().getInstituteCodes().then(() => {
      this.school = this.schoolMap.get(this.collectionObject.schoolID);
    });
    this.schoolCollectionStatusCodes = await sdcCollectionStore().getSchoolCollectionStatusCodeMap();
    this.getSdcSchoolCollections();
    this.setHistoricalHeaders();
  },
  methods: {
    hasRequiredPermission,
    applyFilters($event) {
      this.filters = cloneDeep($event);
    },
    setHistoricalHeaders(){
      if(this.isHistoricalCollection()){
        this.headers = [
          {
            title: 'School',
            align: 'start',
            key: 'schoolTitle',
            value: item => { return { title: item.schoolTitle, sdcSchoolCollectionId: item.sdcSchoolCollectionId }; }
          },
          {
            title: 'Contact',
            align: 'center',
            key: 'contact'
          }
        ];
      }
    },
    isHistoricalCollection(){
      return this.collectionObject?.collectionStatusCode === 'COMPLETED';
    },
    openSchoolContacts(schoolId) {
      let route = this.$router.resolve({name: 'schoolDetails', query: {contact: true}, params: {schoolID: schoolId}});
      window.open(route.href, '_blank');
    },
    clearFilters() {
      this.filters = {};
    },
    filterForErrorsOrWarnings(school) {
      const { issuesFilter = [] } = this.filters || {};

      const filterFunctions = {
        'infoWarnings': () => school.infoWarnings > 0,
        'fundingWarnings': () => school.fundingWarnings > 0,
        'errors': () => school.errors > 0
      };

      return issuesFilter.length === 0 || issuesFilter.some(filter => filterFunctions[filter.value]?.());
    },
    filterForStatus(school) {
      const { detailsFilter = [], contactsFilter = [], submittedFilter = [] } = this.filters || {};

      const filterFunctions = {
        'detailsConfirmed': () => school.detailsConfirmed,
        'contactsConfirmed': () => school.contactsConfirmed,
        'submittedToDistrict': () => school.submittedToDistrict,
        'notDetailsConfirmed': () => !school.detailsConfirmed,
        'notContactsConfirmed': () => !school.contactsConfirmed,
        'notSubmittedToDistrict': () => !school.submittedToDistrict
      };

      const allFilters = [...detailsFilter, ...contactsFilter, ...submittedFilter];

      return allFilters.length === 0 || allFilters.every(filter => filterFunctions[filter.value]());
    },
    filterForUploadData(school) {
      const { uploadDataFilter = [] } = this.filters || {};

      const filterFunctions = {
        'uploadDate': () => !!school.uploadDate,
        'notUploadDate': () => !school.uploadDate
      };

      return uploadDataFilter.length === 0 || uploadDataFilter.every(filter => filterFunctions[filter.value]?.());
    },
    formatDate(inputDate) {
      const date = LocalDate.parse(inputDate, DateTimeFormatter.ofPattern('yyyyMMdd'));
      return date.format(DateTimeFormatter.ofPattern('yyyy/MM/dd'));
    },
    formatDateFromDateTime(inputDate) {
      const date = LocalDateTime.parse(inputDate);
      return date.format(DateTimeFormatter.ofPattern('yyyy/MM/dd'));
    },
    formatDateTime(inputDateTime) {
      const dateTime = LocalDateTime.parse(inputDateTime);
      return dateTime.format(DateTimeFormatter.ofPattern('yyyy/MM/dd HH:mm:ss'));
    },
    async getSdcSchoolCollections(){
      this.isLoading = true;
      await ApiService.apiAxios.get(`${Routes.sdc.BASE_URL}/collection/${this.collectionObject.collectionID}/indySdcSchoolCollectionMonitoring`, {
      }).then(response => {
        this.monitorSdcSchoolCollectionsResponse = response?.data;
      }).catch(error => {
        console.error(error);
        this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while trying to get indy school collections. Please try again later.');
      }).finally(() => {
        this.isLoading = false;
      });
    },
    async unsubmitSdcSchoolCollection(sdcSchoolCollectionId) {
      const confirmation = await this.$refs.confirmRemovalOfCollection.open('Confirm Unsubmit of SDC School Collection', null, {color: '#fff', width: 580, closeIcon: false, subtitle: false, dark: false, resolveText: 'Yes', rejectText: 'No'});
      if (!confirmation) {
        return;
      }
      ApiService.apiAxios.post(`${Routes.sdc.BASE_URL}/sdcSchoolCollection/${sdcSchoolCollectionId}/unsubmit`)
        .then(() => {
          this.setSuccessAlert('Sdc school collection has been unsubmitted');
          this.getSdcSchoolCollections();
        })
        .catch(error => {
          console.error(error);
          this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while unsubmitting school collection. Please try again later.');
        });
    },
    toggleFilters() {
      this.showFilters = !this.showFilters;
    },
  }
});
</script>

<style scoped>
.bold {
  font-weight: bold ;
}
.column-header {
  font-weight: bold;
  text-align: center;
  line-height: 1.5;
  font-size: 1rem;
}
.column-data {
  text-align: center;
  line-height: 1.5;
  font-size: 1rem;
  white-space: nowrap;
}
.divider {
  height: 3rem;
  margin-top: 1rem;
}
.row-data {
  flex-wrap: nowrap;
}
</style>
