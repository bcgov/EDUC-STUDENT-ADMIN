<template>
  <v-row v-if="false">
    <v-col>
      <Spinner />
    </v-col>
  </v-row>
  <v-col class="border">
    <v-tabs
      v-model="tab"
      color="#38598a"
    >
      <v-tab
        class="divider"
        :value="1"
      >
        District Submissions
      </v-tab>
      <v-tab
        class="divider"
        :value="2"
      >
        Independent School Data Submissions
      </v-tab>
      <v-tab
        class="divider"
        :value="3"
      >
        PEN Fixes
      </v-tab>
    </v-tabs>
    <v-window v-model="tab">
      <v-window-item
        :value="1"
        transition="false"
        reverse-transition="false"
      >
        <v-row>
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
            <v-data-table-virtual
              id="monitoring-table"
              :headers="headers"
              :items="monitorSdcDistrictCollectionsResponse"
              items-per-page="-1"
              :search="search"
              height="700"
            >
              <template #item.districtTitle="{ item }">
                <a
                  :href="`${edxURL}/open-district-collection-details/${item.raw.sdcDistrictCollectionId}`"
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
              <template #bottom />
            </v-data-table-virtual>
          </v-col>
        </v-row>
      </v-window-item>
      <v-window-item
        :value="2"
        transition="false"
        reverse-transition="false"
      >
        <IndySchoolMonitoring
          :collection-object="collectionObject"
        />
      </v-window-item>
      <v-window-item
        :value="3"
        transition="false"
        reverse-transition="false"
      >
        <PenMatch 
          :collection-object="collectionObject"
        />
      </v-window-item>
    </v-window>
  </v-col>
  <ConfirmationDialog ref="confirmRemovalOfCollection">
    <template #message>
      <p>Are you sure that you would like to unsubmit the selected SDC District Collection?</p>
    </template>
  </ConfirmationDialog>
</template>

<script>
import ApiService from '../../common/apiService';
import {defineComponent} from 'vue';
import {MONITORING} from '@/utils/sdc/collectionTableConfiguration';
import {Routes} from '@/utils/constants';
import Spinner from '@/components/common/Spinner.vue';
import alertMixin from '@/mixins/alertMixin';
import {appStore} from '@/store/modules/app';
import {mapState} from 'pinia';
import {sdcCollectionStore} from '@/store/modules/sdcCollection';
import IndySchoolMonitoring from '../data-collection/IndySchoolMonitoring.vue';
import ConfirmationDialog from '@/components/util/ConfirmationDialog.vue';
import PenMatch from '../data-collection/PenMatch.vue';

export default defineComponent({
  name: 'Monitoring',
  components: {
    ConfirmationDialog,
    IndySchoolMonitoring,
    Spinner,
    PenMatch
  },
  mixins: [ alertMixin ],
  props: {
    collectionObject: {
      type: Object,
      required: true
    }
  },
  emits: ['next'],
  data() {
    return {
      allowedFilters: MONITORING.allowedFilters,
      filters: {},
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
          value: item => {return this.districtCollectionStatusCodesMap.get(item.sdcDistrictCollectionStatusCode)?.label;}
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
      edxURL: '',
      isLoading: false,
      monitorSdcDistrictCollectionsResponse: [],
      search: '',
      showFilters: false,
      tab: null
    };
  },
  computed: {
    ...mapState(appStore, ['config']),
    ...mapState(sdcCollectionStore, ['districtCollectionStatusCodesMap']),
  },
  async created() {
    appStore().getConfig().then(() => {
      this.edxURL = this.config.EDX_URL;
    });
    await sdcCollectionStore().getDistrictCollectionStatusCodeMap();
    await this.getSdcDistrictCollectionMonitoring();
  },
  methods: {
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
    }
  }
});
</script>

<style scoped>
  .bold {
    font-weight: bold ;
  }
  .border {
    border: 2px solid grey;
    border-radius: 5px;
    padding: 35px;
    margin-bottom: 2em;
  }
</style>

