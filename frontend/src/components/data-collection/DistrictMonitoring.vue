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
        :items="monitorSdcDistrictCollectionsResponse"
        :search="search"
      >
        <template #item.districtTitle="{ item }">
          <a
            :href="`${edxURL}/api/auth/silent_sdc_idir_login?districtID=${item.raw.districtID}&sdcDistrictCollectionID=${item.raw.sdcDistrictCollectionId}&idir_guid=${user.userGuid.toLowerCase()}`"
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
      </v-data-table>
    </v-col>
  </v-row>
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

export default defineComponent({
  name: 'DistrictMonitoring',
  components: { ConfirmationDialog, Spinner },
  mixins: [alertMixin],
  props: {
    collectionObject: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      edxURL: '',
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
      monitorSdcDistrictCollectionsResponse: [],
      search: ''
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
