<template>
  <v-card
    id="enrollmentDuplicate"
  >
    <v-card-title
      id="enrollmentDuplicateTitle"
      class="sheetHeader pt-1 pb-1"
    >
      <v-row no-gutters>
        <v-col class="d-flex justify-start">
          Remove Student
        </v-col>
        <v-col class="d-flex justify-end">
          <v-btn
            id="cancel"
            color="white"
            text="Close"
            size="30"
            icon="mdi-close"
            variant="tonal"
            @click="close"
          />
        </v-col>
      </v-row>
    </v-card-title>
    <v-divider />
    <v-card-text>
      Are you sure you want to remove {{ displayName(sdcSchoolCollectionStudent.legalFirstName, sdcSchoolCollectionStudent.legalMiddleNames, sdcSchoolCollectionStudent.legalLastName) }} from {{ sdcSchoolCollectionStudent.schoolName }}?
    </v-card-text>
    <v-card-actions>
      <VSpacer />
      <PrimaryButton
        id="cancelResolveDialog"
        secondary
        text="Cancel"
        :click-action="close"
      />
      <PrimaryButton
        id="actionResolve"
        text="Remove"
        :click-action="removeAndResolve"
      />
    </v-card-actions>
  </v-card>
</template>
<script>
  
  
  
import PrimaryButton from '../../../util/PrimaryButton.vue';
import {displayName} from '../../../../utils/format';
import ApiService from '../../../../common/apiService';
import {ApiRoutes} from '../../../../utils/constants';
import {setFailureAlert, setSuccessAlert, setWarningAlert} from '../../../composable/alertComposable';

export default {
  name: 'EnrollmentDuplicateResolveViaRemove',
  components: {
    PrimaryButton
  },
  props: {
    duplicate: {
      type: Object,
      required: true
    },
    sdcSchoolCollectionStudent: {
      type: Object,
      required: true
    }
  },
  emits: ['close', 'close-refresh'],
  methods: {
    displayName,
    removeAndResolve() {
      ApiService.apiAxios.post(`${ApiRoutes.sdc.SDC_DISTRICT_COLLECTION}/${this.$route.params.sdcDistrictCollectionID}/resolve-district-duplicates/${this.duplicate?.sdcDuplicateID}/DELETE_ENROLLMENT_DUPLICATE`, [this.sdcSchoolCollectionStudent])
        .then((res) => {
          if (res.data.sdcDuplicateID === this.selectedProgramDuplicate?.sdcDuplicateID && res.data.duplicateResolutionCode !== 'RELEASED') {
            setWarningAlert('Warning! This update has created an error on the student record. Duplicate resolution will not be saved until all errors are resolved.');
          } else {
            setSuccessAlert('Success! The student has been removed.');
            this.closeRefresh();
          }
        }).catch(error => {
          console.error(error);
          setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while trying to update student details. Please try again later.');
          this.closeRefresh();
        });
    },
    close() {
      this.$emit('close');
    },
    closeRefresh() {
      this.$emit('close-refresh');
    },
  }
};
</script>
  
  <style scoped>
   .containerSetup{
      padding-right: 0em !important;
      padding-left: 0em !important;
    }
  
    @media screen and (max-width: 1200px) {
      .containerSetup{
        padding-right: 3em !important;
        padding-left: 3em !important;
      }
    }
  
    .success-message{
      vertical-align: sub;
     }
  
    .sheetHeader {
      background-color: #003366;
      color: white;
      font-size: medium !important;
      font-weight: bolder !important;
    }
  
  </style>
  
