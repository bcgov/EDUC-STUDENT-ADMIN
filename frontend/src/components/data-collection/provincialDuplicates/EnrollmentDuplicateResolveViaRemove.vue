<template>
  <ConfirmationDialog ref="confirmResolveEnrollmentDuplicateViaRemoveStudent">
    <template #message>
      <p>Are you sure you want to remove {{ displayName(sdcSchoolCollectionStudent.legalFirstName, sdcSchoolCollectionStudent.legalMiddleNames, sdcSchoolCollectionStudent.legalLastName) }} from {{ sdcSchoolCollectionStudent.schoolName }}?</p>
    </template>
  </ConfirmationDialog>
</template>
<script>
  
  
  
import ConfirmationDialog from '../../util/ConfirmationDialog.vue';
import {displayName} from '@/utils/format';
import ApiService from '@/common/apiService';
import {Routes} from '@/utils/constants';
import alertMixin from '@/mixins/alertMixin';

export default {
  name: 'EnrollmentDuplicateResolveViaRemove',
  components: {
    ConfirmationDialog
  },
  mixins: [alertMixin],
  emits: ['close', 'close-refresh'],
  data() {
    return {
      sdcSchoolCollectionStudent: {}
    };
  },
  methods: {
    displayName,
    async removeAndResolveStudent(duplicate, sdcSchoolCollectionStudent) {
      this.sdcSchoolCollectionStudent = sdcSchoolCollectionStudent;
      const confirmation = await this.$refs.confirmResolveEnrollmentDuplicateViaRemoveStudent.open('Remove Student', null, {color: '#fff', width: 580, closeIcon: false, subtitle: false, dark: false, resolveText: 'Remove', rejectText: 'Cancel'});
      if (!confirmation) {
        return;
      }
      let payload = {
        students: [this.sdcSchoolCollectionStudent],
        duplicate: duplicate
      };
      ApiService.apiAxios.post(Routes.sdc.SDC_DISTRICT_COLLECTION + '/resolve-district-duplicates/' + duplicate?.sdcDuplicateID +'/DELETE_ENROLLMENT_DUPLICATE', payload)
        .then((res) => {
            this.setSuccessAlert('Success! The student has been removed.');
        }).catch(error => {
          console.error(error);
          this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while trying to update student details. Please try again later.');
        }).finally(() => {
          this.$emit('close-refresh');
        });
    }
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
  
