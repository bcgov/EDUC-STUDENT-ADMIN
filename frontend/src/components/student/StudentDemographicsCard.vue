<template>
  <div class="flex">
    <v-progress-linear
            indeterminate
            color="blue"
            :active="loadingDemographics"
    ></v-progress-linear>
    <v-alert
      :value="studentError"
      width="100%"
      outlined
      transition="scale-transition"
      class="bootstrap-error">
      There was an error while attempting to load student demographics.
    </v-alert>
    <v-alert
      :value="showDemographics"
      width="100%"
      outlined
      transition="scale-transition"
      class="bootstrap-success"
    >
      <v-row no-gutters class="px-2">
        <v-col cols="12" xl="1" lg="1" md="1" sm="1">
          <p class="mb-0">PEN:</p>
        </v-col>
        <v-col cols="12" xl="11" lg="11" md="11" sm="11">
          <p class="mb-0"><strong>{{ this.request.recordedPen }}</strong></p>
        </v-col>
      </v-row>
      <v-row no-gutters class="px-2">
        <v-col cols="12" xl="1" lg="1" md="1" sm="1">
          <p class="mb-0">First:</p>
        </v-col>
        <v-col cols="12" xl="11" lg="11" md="11" sm="11">
          <p class="mb-0"><strong>{{ this.student.legalFirstName || ''}}</strong></p>
        </v-col>
      </v-row>
      <v-row no-gutters class="px-2">
        <v-col cols="12" xl="1" lg="1" md="1" sm="1">
          <p class="mb-0">Middle:</p>
        </v-col>
        <v-col cols="12" xl="11" lg="11" md="11" sm="11">
          <p class="mb-0"><strong>{{ this.student.legalMiddleNames || ''}}</strong></p>
        </v-col>
      </v-row>
        <v-row no-gutters class="px-2">
        <v-col cols="12" xl="1" lg="1" md="1" sm="1">
          <p class="mb-0">Last:</p>
        </v-col>
        <v-col cols="12" xl="11" lg="11" md="11" sm="11">
          <p class="mb-0"><strong>{{ this.student.legalLastName || ''}}</strong></p>
        </v-col>
      </v-row>
      <v-row no-gutters class="px-2">
        <v-col cols="12" xl="1" lg="1" md="1" sm="1">
          <p class="mb-0">DOB:</p>
        </v-col>
        <v-col cols="12" xl="11" lg="11" md="11" sm="11">
          <p class="mb-0"><strong>{{ this.student.dob }}</strong></p>
        </v-col>
      </v-row>
      <v-row no-gutters class="px-2">
        <v-col cols="12" xl="1" lg="1" md="1" sm="1">
          <p class="mb-0">Gender:</p>
        </v-col>
        <v-col cols="12" xl="11" lg="11" md="11" sm="11">
          <p class="mb-0"><strong>{{ this.student.genderCode }}</strong></p>
        </v-col>
      </v-row>
    </v-alert>
  </div>
</template>

<script>
import ApiService from '../../common/apiService';
import { Routes, Statuses } from '../../utils/constants';
export default {
  name: 'studentDemographicsCard',
  props: {
    request: {
      type: Object,
      required: true
    },
  },
  data () {
    return {
      showDemographics:false,
      studentError: false,
      loadingDemographics:false,
      student: {
        legalFirstName: null,
        legalMiddleNames: null,
        legalLastName: null,
        usualFirstName: null,
        usualMiddleNames: null,
        usualLastName: null,
        dob: null,
        genderCode: null
      },
    };
  },
  computed: {
    statusCodes() {
      return Statuses.studentRequest;
    },
  },
  watch: {
    'request.recordedPen': function() {
      if(this.request.recordedPen && (this.request.studentRequestStatusCode === this.statusCodes.COMPLETED)) {
        this.showDemographics = true;
        this.loadingDemographics = true;
        ApiService.apiAxios
          .get(Routes.STUDENT_DATA_URL + '/' + this.request.recordedPen)
          .then(demographicsResponse => {
            this.student = demographicsResponse.data;
          })
          .catch(error => {
            this.studentError = true;
            console.log(error);
          })
          .finally(()=>{this.loadingDemographics = false;});
      }
    }
  }
};
</script>
