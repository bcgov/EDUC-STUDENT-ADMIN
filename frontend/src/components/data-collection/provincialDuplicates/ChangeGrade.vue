<template>
  <v-card
    id="programDuplicate"
  >
    <v-card-title
      id="programDuplicateTitle"
      class="sheetHeader pt-1 pb-1"
    >
      <v-row no-gutters>
        <v-col class="d-flex justify-start">
          Change Grade
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
      <v-row class="mt-n4">
        <v-col>
          <v-select
            id="enrolledGradeCode"
            v-model="changedEnrolledGradeCode"
            label="Grade"
            variant="underlined"
            :items="allowedEnrolledGrades"
            item-value="enrolledGradeCode"
            item-title="dropdownText"
           
            density="compact"
          />
        </v-col>
      </v-row>

      <v-row class="mt-n2">
        <v-col
          cols="12"
          class="d-flex justify-end"
        >
          <v-btn
            id="release"
            color="#003366"
            class="mb-1 release-button"
            text="Change Grade"
            variant="outlined"
            :disabled="changedEnrolledGradeCode === null"
            @click="changeGradeForStudent()"
          />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>
<script>
  
import ApiService from '../../../../common/apiService';
import {ApiRoutes} from '../../../../utils/constants';
import {setSuccessAlert, setFailureAlert} from '../../../composable/alertComposable';
import {sdcCollectionStore} from '../../../../store/modules/sdcCollection';
import {cloneDeep} from 'lodash';
  
export default {
  name: 'ChangeGrade',
  components: {
  },
  props: {
    selectedStudent: {
      type: Object,
      required: true,
      default: null
    },
    selectedDuplicateId: {
      type: String,
      required: true,
      default: null
    }
  },
  emits: ['close', 'close-refresh'],
  data() {
    return {
      changedEnrolledGradeCode: null,
      allowedGrades: ['10', '11', '12'],
      enrolledGradesArray: [],
      type: 'CHANGE_GRADE',
    };
  },
  computed: {
    allowedEnrolledGrades() {
      return sdcCollectionStore().enrolledGradeCodes.filter(item => this.allowedGrades.includes(item.enrolledGradeCode));
    }
  },
  methods: {
    close() {
      this.$emit('close');
    },
    cancel() {
      this.$emit('close-refresh');
    },
    changeGradeForStudent() {
      let updatedStudent = cloneDeep(this.selectedStudent);
      updatedStudent.enrolledGradeCode = this.changedEnrolledGradeCode;
      ApiService.apiAxios.post(ApiRoutes.sdc.SDC_DISTRICT_COLLECTION + '/'+ this.$route.params.sdcDistrictCollectionID + '/resolve-district-duplicates' + '/'+ this.selectedDuplicateId +'/' +this.type, [updatedStudent])
        .then(() => {
          setSuccessAlert('Success! The student details have been updated.');
        }).catch(error => {
          console.error(error);
          setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while trying to update student details. Please try again later.');
        }).finally(() => {
          this.cancel();
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
  
      .label {
        color: grey;
        text-decoration-line: underline;
     }
    
    </style>
    
  
