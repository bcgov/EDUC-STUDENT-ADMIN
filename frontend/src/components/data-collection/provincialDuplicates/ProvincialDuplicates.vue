<template>
  <v-row v-if="isLoading">
    <v-col>
      <Spinner />
    </v-col>
  </v-row>
  <v-row
    v-else-if="apiError"
    justify="center"
  >
    <v-col>
      <v-alert
        id="api-error-alert"
        density="compact"
        type="error"
        variant="tonal"
        text="There was an error loading the data, please try again."
      />
    </v-col>
  </v-row>
  <div
    v-else
    class="border"
  >
    <v-tabs
      v-model="tab"
      color="#38598a"
      show-arrows
    >
      <v-tab
        v-for="name in tabs"
        :key="name"
        class="divider"
        :value="name"
      >
        {{ name }}
      </v-tab>
    </v-tabs>
    <v-window v-model="tab">
      <v-window-item
        value="Enrollment Duplicates"
        transition="false"
        reverse-transition="false"
      >
        <DuplicateTab
          v-if="tab==='Enrollment Duplicates'"
          duplicate-type="enrollment"
          :non-allowable-duplicates="nonAllowableDuplicates"
          :allowable-duplicates="allowableDuplicates"
          :resolved-duplicates="resolvedDuplicates"
          :collection-object="collectionObject"
          @refresh-duplicates="getProvincialDuplicates()"
        />
      </v-window-item>
      <v-window-item
        value="Program Duplicates"
        transition="false"
        reverse-transition="false"
      >
        <DuplicateTab
          v-if="tab==='Program Duplicates'"
          duplicate-type="program"
          :non-allowable-duplicates="nonAllowableProgramDuplicates"
          :resolved-duplicates="resolvedProgramDuplicates"
          :collection-object="collectionObject"
          @refresh-duplicates="getProvincialDuplicates()"
        />
      </v-window-item>
    </v-window>
  </div>
</template>
<script>
import {defineComponent} from 'vue';
import ApiService from '@/common/apiService';
import {Routes} from '@/utils/constants';
import alertMixin from '@/mixins/alertMixin';
import {sdcCollectionStore} from '@/store/modules/sdcCollection';
import Spinner from '../../common/Spinner.vue';
import DuplicateTab from './DuplicateTab.vue';

export default defineComponent({
  name: 'StepFourInDistrictDuplicates',
  components: {
    DuplicateTab,
    Spinner
  },
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
      apiError: false,
      editOptionsOpen: [],
      nonAllowableDuplicates: [],
      allowableDuplicates: [],
      resolvedDuplicates: [],
      nonAllowableProgramDuplicates: [],
      resolvedProgramDuplicates: [],
      isLoading: true,
      panel: [0],
      duplicateView: 'nonAllowable',
      programDuplicateView: 'nonAllowableProgram',
      duplicateResolutionCodesMap: null,
      collectionID: this.$route.params.collectionID,
      tab: null,
      tabs: [
        'Enrollment Duplicates',
        'Program Duplicates'
      ],
    };
  },
  async created() {
    this.duplicateResolutionCodesMap = sdcCollectionStore().getDuplicateResolutionCodesMap();
    this.getProvincialDuplicates();
  },
  methods: {
    getProvincialDuplicates(){
      this.isLoading = true;
      ApiService.apiAxios.get(Routes.sdc.BASE_URL + '/collection/'+ this.collectionID + '/provincial-duplicates').then(response => {
        this.nonAllowableDuplicates = response.data?.enrollmentDuplicates?.NON_ALLOW;
        this.allowableDuplicates = response.data?.enrollmentDuplicates?.ALLOWABLE;
        this.resolvedDuplicates = response.data?.enrollmentDuplicates?.RESOLVED;
        this.nonAllowableProgramDuplicates = response.data?.programDuplicates?.NON_ALLOW;
        this.resolvedProgramDuplicates = response.data?.programDuplicates?.RESOLVED;
      }).catch(error => {
        console.error(error);
        this.setFailureAlert(error.response?.data?.message || error.message);
        this.apiError = true;
      }).finally(() => {
        this.isLoading = false;
      });
    },
  }
});
</script>

<style scoped>
.border {
  border: 2px solid grey;
  border-radius: 5px;
  padding: 35px;
  margin-bottom: 2em;
}
.form-hint{
  color: rgb(56, 89, 138);
  font-size: 14px;
}
</style>
