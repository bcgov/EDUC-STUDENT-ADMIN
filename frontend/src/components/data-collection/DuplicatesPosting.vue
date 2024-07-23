<template>
  <v-row v-if="isLoading">
    <v-col>
      <Spinner />
    </v-col>
  </v-row>
  <v-container
    v-else
    id="duplicatesPosting"
    fluid
  >
    <v-col>
      <h4>Province Duplicates Posting</h4>
      <br>
      <p v-if="isPostProvincialDuplicatesButtonDisabled">
        The Province Duplicates can be posted once all school districts and independent schools have submitted their 1701 data, and there are no outstanding PEN fixes.
      </p>
      <br>
      <v-row>
        <v-btn
          id="postProvincialDuplicatesButton"
          color="primary"
          text="Post Province Duplicates"
          class="ma-2"
          :disabled="isPostProvincialDuplicatesButtonDisabled"
          @click="postProvincialDuplicates"
        />
        <v-btn
          id="resolveRemainingDuplicatesButton"
          color="primary"
          text="Resolve Remaining Duplicates"
          class="ma-2"
          :disabled="isResolveRemainingDuplicatesButtonDisabled"
          @click="resolveRemainingDuplicates"
        />
      </v-row>
    </v-col>
  </v-container>
  <ConfirmationDialog ref="confirmPostProvincialDuplicates">
    <template #message>
      <p>Are you sure that you would like to post province duplicates for the collection? This action cannot be undone.</p>
    </template>
  </ConfirmationDialog>
  <ConfirmationDialog ref="confirmResolveRemainingDuplicates">
    <template #message>
      <p>Are you sure that you would like to resolve the remaining duplicates for the collection? This action cannot be undone.</p>
    </template>
  </ConfirmationDialog>
</template>

<script>
import {authStore} from '@/store/modules/auth';
import {appStore} from '@/store/modules/app';
import {sdcCollectionStore} from '@/store/modules/sdcCollection';
import {mapState} from 'pinia';
import ApiService from '@/common/apiService';
import {Routes} from '@/utils/constants';
import ConfirmationDialog from '../util/ConfirmationDialog.vue';
import Spinner from '../common/Spinner.vue';
import {PEN_MATCHING} from '../../utils/sdc/collectionTableConfiguration';
import {isEmpty, omitBy} from 'lodash';

export default {
  name: 'DuplicatesPosting',
  components: {Spinner, ConfirmationDialog},
  data() {
    return {
      edxURL: '',
      collectionID: this.$route.params.collectionID,
      isLoading: true,
      pageNumber: 1,
      pageSize: 1,
      totalPenFixElements: 0,
      nonAllowableDuplicates: [],
      nonAllowableProgramDuplicates: [],
      filterSearchParams: {
        assignedPen: PEN_MATCHING.defaultFilter,
        sdcSchoolCollectionStudentStatusCode: 'INFOWARN,FUNDWARN,VERIFIED',
        moreFilters: {}
      },
    };
  },
  computed: {
    ...mapState(authStore, ['userInfo']),
    ...mapState(appStore, ['config']),
    ...mapState(sdcCollectionStore, ['districtCollectionStatusCodesMap']),
    ...mapState(sdcCollectionStore, ['schoolCollectionStatusCodesMap']),
    ...mapState(sdcCollectionStore, ['duplicateResolutionCodesMap']),
    isPostProvincialDuplicatesButtonDisabled() {
      const allDistrictsSubmitted = Array.from(this.districtCollectionStatusCodesMap.values()).every(value => value.sdcDistrictCollectionStatusCode === 'SUBMITTED');
      const allIndieSchoolsSubmitted = Array.from(this.schoolCollectionStatusCodesMap.values()).every(value => value.sdcSchoolCollectionStatusCode === 'SUBMITTED');
      const allPenFixesResolved = this.totalPenFixElements === 0;

      return !allDistrictsSubmitted || !allIndieSchoolsSubmitted || !allPenFixesResolved;
    },
    isResolveRemainingDuplicatesButtonDisabled() {
      return this.nonAllowableDuplicates.length === 0 && this.nonAllowableProgramDuplicates.length === 0;
    }
  },
  async created() {
    appStore().getConfig().then(() => {
      this.edxURL = this.config.EDX_URL;
    });
    authStore().getUserInfo().then(()=> {
      this.user = this.userInfo;
    });
    await sdcCollectionStore().getDistrictCollectionStatusCodeMap();
    await sdcCollectionStore().getSchoolCollectionStatusCodeMap();
    await sdcCollectionStore().getDuplicateResolutionCodesMap();
    sdcCollectionStore().getCodes().then(() => {
      this.loadStudents();
    });
    this.getProvincialDuplicates();
  },
  methods: {
    getProvincialDuplicates(){
      this.isLoading = true;
      ApiService.apiAxios.get(Routes.sdc.BASE_URL + '/collection/'+ this.collectionID + '/provincial-duplicates').then(response => {
        this.nonAllowableDuplicates = response.data?.enrollmentDuplicates?.NON_ALLOW;
        this.nonAllowableProgramDuplicates = response.data?.programDuplicates?.NON_ALLOW;
      }).catch(error => {
        console.error(error);
        this.setFailureAlert(error.response?.data?.message || error.message);
        this.apiError = true;
      }).finally(() => {
        this.isLoading = false;
      });
    },
    async postProvincialDuplicates() {
      const confirmation = await this.$refs.confirmPostProvincialDuplicates.open('Confirm Posting of Province Duplicates for the Collection.', null, {color: '#fff', width: 580, closeIcon: false, subtitle: false, dark: false, resolveText: 'Confirm', rejectText: 'Cancel'});
      if (!confirmation) {
        return;
      }
      ApiService.apiAxios.post(`${Routes.sdc.BASE_URL}/collection/${this.collectionID}/post-provincial-duplicates`)
        .then(() => {
          this.setSuccessAlert('Provincial Duplicates Posted Successfully.');
        })
        .catch(error => {
          console.error(error);
          this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while posting provincial duplicates. Please try again later.');
        });
    },
    async resolveRemainingDuplicates() {
      const confirmation = await this.$refs.confirmResolveRemainingDuplicates.open('Confirm Resolving of Remaining Duplicates for the Collection.', null, {color: '#fff', width: 580, closeIcon: false, subtitle: false, dark: false, resolveText: 'Confirm', rejectText: 'Cancel'});
      if (!confirmation) {
        return;
      }
      ApiService.apiAxios.post(`${Routes.sdc.BASE_URL}/collection/${this.collectionID}/resolve-duplicates`)
        .then(() => {
          this.setSuccessAlert('Remaining Duplicates Resolved Successfully.');
        })
        .catch(error => {
          console.error(error);
          this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while resolving remaining duplicates. Please try again later.');
        });
    },
    loadStudents() {
      this.isLoading = true;
      ApiService.apiAxios.get(`${Routes.sdc.BASE_URL}/collection/${this.collectionID}/students-paginated?tableFormat=true`, {
        params: {
          pageNumber: this.pageNumber - 1,
          pageSize: this.pageSize,
          searchParams: omitBy(this.filterSearchParams, isEmpty),
          sort: {
            penMatchResult: 'ASC'
          },
        }
      }).then(response => {
        this.totalPenFixElements = response.data.totalElements;
      }).catch(error => {
        console.error(error);
        this.setFailureAlert('An error occurred while trying to calculate total pen fix elements. Please try again later.');
      }).finally(() => {
        this.isLoading = false;
      });
    },
  }
};
</script>
