<template>
  <v-row v-if="isLoading">
    <v-col>
      <Spinner />
    </v-col>
  </v-row>
  <v-container
    v-else
    id="reprocessSchool"
    fluid
  >
    <v-row>
      <h4 class="mb-4">
        Reprocess School
      </h4>
    </v-row>
    <v-row>
      <p class="mb-4">
        Select a school below to reprocess all the school's current students in the collection.
      </p>
      <p class="mb-4">
        Reprocessing the students will run them through all validation rules again. This will cause previous edits made to the students to be reverted, including manual PEN matches. Student records will be set back to the status "loaded" which can not be undone.
      </p>
      <p class="mb-4">
        Schools will not appear in the dropdown menu if they have made it to the provincial duplicates step of the collection.
      </p>
    </v-row>

    <v-row>
      <v-autocomplete
        id="school-code-name-filter"
        v-model="selectedSchool"
        label="School Code & Name"
        variant="underlined"
        item-value="sdcSchoolCollectionID"
        item-title="schoolName"
        autocomplete="off"
        :items="sdcSchoolCollectionsNotProvDupes"
        return-object
        clearable
      >
        <template #item="{ props, item }">
          <v-list-item
            v-bind="props"
            title=""
          >
            <v-list-item-title style="color: black !important;">
              {{ item.title }}
            </v-list-item-title>
          </v-list-item>
        </template>
      </v-autocomplete>
    </v-row>
    <v-row class="justify-end pr-3">
      <v-btn
        color="primary"
        text="Reprocess School"
        :disabled="!selectedSchool || isReprocessSchool"
        :loading="isReprocessSchool"
        @click="showReprocessConfirmation = true"
      />
    </v-row>

    <v-dialog
      v-model="showReprocessConfirmation"
      max-width="500"
      persistent
    >
      <v-card>
        <v-card-title>
          Confirm Reprocessing
        </v-card-title>
        <v-card-text>
          Are you sure you want to reprocess this school's student data? This action can not be undone.
        </v-card-text>
        <v-card-text>
          Reprocessing will cause previous edits made to the students to be reverted, including manual PEN matches. Student records will be set back to the status "loaded" which can not be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            text="Cancel"
            @click="showReprocessConfirmation = false"
          />
          <v-btn
            color="primary"
            text="Reprocess"
            @click="reprocessSchool"
          />
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
<script>
import ApiService from '@/common/apiService';
import {Routes} from '@/utils/constants';
import Spinner from '@/components/common/Spinner.vue';
import alertMixin from '@/mixins/alertMixin';

export default {
  name: 'ReprocessSchool',
  components: {Spinner},
  mixins: [alertMixin],
  props: {
    collectionObject: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      isLoading: true,
      isReprocessSchool: false,
      sdcSchoolCollectionsNotProvDupes: [],
      selectedSchool: null,
      showReprocessConfirmation: false
    };
  },
  async created() {
    await this.getSdcSchoolCollections();
  },
  methods: {
    async reprocessSchool() {
      this.showReprocessConfirmation = false;
      this.isReprocessSchool = true;
      await ApiService.apiAxios.post(`${Routes.sdc.BASE_URL}/sdcSchoolCollection/${this.selectedSchool.sdcSchoolCollectionID}/reprocess`)
        .then((res) => {
          const successMessage = res?.data?.message || 'School collection is being reprocessed.';
          this.setSuccessAlert(successMessage);
        }).catch(error => {
          console.error(error);
          let errorMessage = 'An error occurred while trying to reprocess school collection. Please try again later.';

          if (error?.response?.data?.subErrors && error.response.data.subErrors.length > 0) {
            errorMessage = error.response.data.subErrors.map(subError => subError.message).join('. ');
          } else if (error?.response?.data?.message) {
            errorMessage = error.response.data.message;
          }

          this.setFailureAlert(errorMessage);
        }).finally(() => {
          this.isReprocessSchool = false;
        });
    },
    async getSdcSchoolCollections(){
      this.isLoading = true;

      await ApiService.apiAxios.get(`${Routes.sdc.BASE_URL}/collection/${this.collectionObject.collectionID}/sdcSchoolCollections`)
        .then((res) => {
          this.sdcSchoolCollectionsNotProvDupes = res.data.filter(schools =>
            schools.sdcSchoolCollectionStatusCode !== 'P_DUP_POST' && schools.sdcSchoolCollectionStatusCode !== 'P_DUP_VRFD');
        }).catch(error => {
          console.error(error);
          this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while trying to get school collections. Please try again later.');
        }).finally(() => {
          this.isLoading = false;
        });
    },
  }
};
</script>
