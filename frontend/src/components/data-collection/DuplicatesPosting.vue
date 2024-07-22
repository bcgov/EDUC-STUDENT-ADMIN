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
      <p>The Province Duplicates can be posted once all school districts and independent schools have submitted their 1701 data, and there are no outstanding PEN fixes.</p>
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
          @click="console.log('hello')"
        />
      </v-row>
    </v-col>
  </v-container>
  <ConfirmationDialog ref="confirmPostProvincialDuplicates">
    <template #message>
      <p>Are you sure that you would like to post province duplicates for the collection?</p>
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

export default {
  name: 'DuplicatesPosting',
  components: {Spinner, ConfirmationDialog},
  data() {
    return {
      edxURL: '',
      collectionID: this.$route.params.collectionID,
      isLoading: true,
      nonAllowableDuplicates: [],
      nonAllowableProgramDuplicates: [],
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

      // TODO how do we check there are pen fixes outstanding?

      return !allDistrictsSubmitted || !allIndieSchoolsSubmitted;
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
          this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while post provincial duplicates. Please try again later.');
        });
    },

  }
};
</script>
