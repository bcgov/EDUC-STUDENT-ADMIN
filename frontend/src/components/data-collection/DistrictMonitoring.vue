<template>
  <v-row v-if="isLoading">
    <v-col>
      <Spinner />
    </v-col>
  </v-row>
  <v-row
    v-else
  >
    <v-col cols="12">
      <v-text-field
        v-model="search"
        class="pt-4"
        label="Search"
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        hide-details
      />
    </v-col>
    <v-col class="py-0">
      <span
        id="recordsFound"
        class="bold"
      >
        Records Found:  {{ monitorSdcDistrictCollectionsResponse?.length }}
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
        :items="monitorSdcDistrictCollectionsResponse"
        :search="search"
      >
        <template #item.districtTitle="{ item }">
          <a
            :href="safeURL(item.raw.districtID, item.raw.sdcDistrictCollectionId)"
            target="_link"
          >
            {{ item.raw.districtTitle }}
          </a>
        </template>
        <template #item.unsubmit="{ item }">
          <v-btn
            :id="'unsubmitBtn' + item.raw.sdcDistrictCollectionId"
            color="primary"
            icon="mdi-lock-open"
            variant="text"
            :disabled="item.raw.sdcDistrictCollectionStatusCode !== 'SUBMITTED'"
            @click="unsubmitSdcDistrictCollection(item.raw.sdcDistrictCollectionId)"
          />
        </template>
        <template #item.contact="{ item }">
          <a
            target="_blank"
            @click="openDistrictContacts(item.raw.districtID)"
          >
            View
          </a>
        </template>
        <template #item.unresolvedEnrollmentDuplicates="{ item }">
          <v-progress-circular
            v-if="isLoadingDuplicates"
            color="primary"
            indeterminate
          />
          <a
            v-else-if="item.raw.unresolvedEnrollmentDuplicates !== 0"
            @click="showDuplicates(item.raw.sdcDistrictCollectionId, 'Enrollment Duplicates')"
          >
            {{ item.raw.unresolvedEnrollmentDuplicates }}
          </a>
          <span v-else>{{ item.raw.unresolvedEnrollmentDuplicates }}</span>
        </template>
        <template #item.unresolvedProgramDuplicates="{ item }">
          <v-progress-circular
            v-if="isLoadingDuplicates"
            color="primary"
            indeterminate
          />
          <a
            v-else-if="item.raw.unresolvedProgramDuplicates !== 0"
            @click="showDuplicates(item.raw.sdcDistrictCollectionId, 'Program Duplicates')"
          >
            {{ item.raw.unresolvedProgramDuplicates }}
          </a>
          <span v-else>{{ item.raw.unresolvedProgramDuplicates }}</span>
        </template>
      </v-data-table>
    </v-col>
  </v-row>
  <v-bottom-sheet
    v-model="openDuplicateView"
    :no-click-animation="true"
    :scrollable="true"
    :persistent="true"
  >
    <ProvincialDuplicates
      :collection-object="collectionObject"
      :sdc-duplicates="selectedDistrictsDuplicates?.sdcDuplicates"
      :default-tab="defaultTab"
      @close-sheet="openDuplicateView = false"
    />
  </v-bottom-sheet>
  <ConfirmationDialog ref="confirmRemovalOfCollection">
    <template #message>
      <p>Are you sure that you would like to unsubmit the selected SDC District Collection?</p>
    </template>
  </ConfirmationDialog>
</template>
<script>
import {defineComponent} from 'vue';
import ApiService from '@/common/apiService';
import {Routes} from '@/utils/constants';
import Spinner from '../common/Spinner.vue';
import ConfirmationDialog from '../util/ConfirmationDialog.vue';
import {appStore} from '@/store/modules/app';
import {sdcCollectionStore} from '@/store/modules/sdcCollection';
import alertMixin from '@/mixins/alertMixin';
import {authStore} from '@/store/modules/auth';
import {mapState} from 'pinia';
import {sanitizeUrl} from '@braintree/sanitize-url';
import ProvincialDuplicates from './provincialDuplicates/ProvincialDuplicates.vue';

export default defineComponent({
  name: 'DistrictMonitoring',
  components: { ConfirmationDialog, ProvincialDuplicates, Spinner },
  mixins: [alertMixin],
  props: {
    collectionObject: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      defaultTab: null,
      edxURL: '',
      generatedDuplicateResponse: {},
      sortBy: [{ key: 'districtTitle', order:'asc'}],
      headers: [
        {
          title: 'District',
          align: 'start',
          key: 'districtTitle'
        },
        {
          title: 'Schools Submitted',
          align: 'center',
          key: 'numSubmittedSchools'
        },
        {
          title: 'District Status',
          align: 'center',
          key: 'sdcDistrictCollectionStatusCode',
          value: item => this.districtCollectionStatusCodesMap.get(item.sdcDistrictCollectionStatusCode)?.label
        },
        {
          title: 'Enrollment Duplicates',
          align: 'center',
          key: 'unresolvedEnrollmentDuplicates'
        },
        {
          title: 'Program Duplicates',
          align: 'center',
          key: 'unresolvedProgramDuplicates'
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
      isLoading: true,
      isLoadingDuplicates: false,
      monitorSdcDistrictCollectionsResponse: [],
      openDuplicateView: false,
      search: '',
      selectedDistrictsDuplicates: []
    };
  },
  computed: {
    ...mapState(authStore, ['userInfo']),
    ...mapState(appStore, ['config']),
    ...mapState(sdcCollectionStore, ['districtCollectionStatusCodesMap']),
  },
  async created() {
    appStore().getConfig().then(() => {
      this.edxURL = this.config.EDX_URL;
    });
    authStore().getUserInfo().then(()=> {
      this.user = this.userInfo;
    });
    await sdcCollectionStore().getDistrictCollectionStatusCodeMap();
    this.getSdcDistrictCollectionMonitoring();
    if(this.collectionObject.collectionStatusCode !== 'PROVDUPES' ) {
      this.getProvincialDuplicateCounts();
    }
  },
  methods: {
    openDistrictContacts(districtId) {
      let route = this.$router.resolve({name: 'districtDetails', query: {contact: true}, params: {districtID: districtId}});
      window.open(route.href, '_blank');
    },
    async getProvincialDuplicateCounts() {
      this.isLoadingDuplicates = true;
      await ApiService.apiAxios.get(`${Routes.sdc.BASE_URL}/sdc-duplicate/all-district-provincial-in-flight/${this.collectionObject.collectionID}`).then(response => {
        this.generatedDuplicateResponse = response?.data;
        this.monitorSdcDistrictCollectionsResponse.forEach(district => {
          let districtDuplicates = this.generatedDuplicateResponse[district.sdcDistrictCollectionId];
          district.unresolvedEnrollmentDuplicates = districtDuplicates ? districtDuplicates?.numEnrollmentDuplicates : 0;
          district.unresolvedProgramDuplicates = districtDuplicates ? districtDuplicates?.numProgramDuplicates : 0;
        });
      }).catch(error => {
        console.error(error);
        this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while trying to get duplicate counts. Please try again later.');
      }).finally(() => {
        this.isLoadingDuplicates = false;
      });
    },
    async getSdcDistrictCollectionMonitoring() {
      this.isLoading = true;
      await ApiService.apiAxios.get(`${Routes.sdc.BASE_URL}/collection/${this.collectionObject.collectionID}/sdcDistrictCollectionMonitoring`, {
      }).then(response => {
        this.monitorSdcDistrictCollectionsResponse = response?.data;
      }).catch(error => {
        console.error(error);
        this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while trying to get sdc district collections. Please try again later.');
      }).finally(() => {
        this.isLoading = false;
      });
    },
    async unsubmitSdcDistrictCollection(sdcDistrictCollectionId) {
      const confirmation = await this.$refs.confirmRemovalOfCollection.open('Confirm Unsubmit of SDC District Collection', null, {color: '#fff', width: 580, closeIcon: false, subtitle: false, dark: false, resolveText: 'Yes', rejectText: 'No'});
      if (!confirmation) {
        return;
      }
      ApiService.apiAxios.post(`${Routes.sdc.BASE_URL}/sdcDistrictCollection/${sdcDistrictCollectionId}/unsubmit`)
        .then(() => {
          this.setSuccessAlert('Sdc district collection has been unsubmitted');
          this.getSdcDistrictCollectionMonitoring();
        })
        .catch(error => {
          console.error(error);
          this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while unsubmitting district collection. Please try again later.');
        });
    },
    safeURL(districtID, sdcDistrictCollectionId) {
      return sanitizeUrl(`${this.edxURL}/api/auth/silent_sdc_idir_login?districtID=${districtID}&sdcDistrictCollectionID=${sdcDistrictCollectionId}&idir_guid=${this.user.userGuid.toLowerCase()}`);
    },
    showDuplicates(sdcDistrictCollectionID, defaultTab) {
      this.selectedDistrictsDuplicates = this.generatedDuplicateResponse[sdcDistrictCollectionID];
      this.defaultTab = defaultTab;
      this.openDuplicateView = true;
    }
  }
});
</script>

<style scoped>
.bold {
  font-weight: bold ;
}
</style>
