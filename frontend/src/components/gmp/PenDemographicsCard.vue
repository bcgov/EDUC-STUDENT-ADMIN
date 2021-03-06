<template>
  <div class="flex">
    <v-main v-if="this.request.pen">
    <v-progress-linear
            indeterminate
            color="blue"
            :active="loadingDemographics"
    ></v-progress-linear>
    <v-alert
      :value="showDemographics"
      width="100%"
      outlined
      transition="scale-transition"
      class="bootstrap-success">

      <v-row no-gutters class="px-2">
        <v-col cols="12" xl="1" lg="1" md="1" sm="1">
          <p class="mb-0">PEN:</p>
        </v-col>
        <v-col cols="12" xl="11" lg="11" md="11" sm="11">
          <p id="penNumber" class="mb-0"><strong>{{ this.request.pen }}</strong></p>
        </v-col>
      </v-row>
      <v-row no-gutters class="px-2">
        <v-col cols="12" xl="1" lg="1" md="1" sm="1">
          <p class="mb-0">Legal:</p>
        </v-col>
        <v-col cols="12" xl="11" lg="11" md="11" sm="11">
          <p id="legalNames" v-if="!this.student.legalLastName && !this.student.legalFirstName && !this.student.legalMiddleNames" class="mb-2"></p>
          <p id="legalNames" v-else class="mb-0"><strong>{{ this.student.legalLastName ? this.student.legalLastName: '(none)'}}, {{ this.student.legalFirstName ? this.student.legalFirstName: '(none)'}}, {{ this.student.legalMiddleNames ? this.student.legalMiddleNames: '(none)'}}</strong></p>
        </v-col>
      </v-row>
      <v-row no-gutters class="px-2">
        <v-col cols="12" xl="1" lg="1" md="1" sm="1">
          <p class="mb-0">Usual:</p>
        </v-col>
        <v-col cols="12" xl="11" lg="11" md="11" sm="11">
          <p id="usualNames" v-if="!this.student.usualLastName && !this.student.usualFirstName && !this.student.usualMiddleNames" class="mb-2"></p>
          <p id="usualNames" v-else class="mb-0"><strong>{{ this.student.usualLastName ? this.student.usualLastName: '(none)'}}, {{ this.student.usualFirstName ? this.student.usualFirstName: '(none)'}}, {{ this.student.usualMiddleNames ? this.student.usualMiddleNames: '(none)'}}</strong></p>
        </v-col>
      </v-row>
      <v-row no-gutters class="px-2">
        <v-col cols="12" xl="1" lg="1" md="1" sm="1">
          <p class="mb-0">DOB:</p>
        </v-col>
        <v-col cols="12" xl="11" lg="11" md="11" sm="11">
          <p id="studentDOB" class="mb-0"><strong>{{ formatDob(this.student.dob,'uuuu-MM-dd', 'uuuu/MM/dd') }}</strong></p>
        </v-col>
      </v-row>
      <v-row no-gutters class="px-2">
        <v-col cols="12" xl="1" lg="1" md="1" sm="1">
          <p class="mb-0">Gender:</p>
        </v-col>
        <v-col cols="12" xl="11" lg="11" md="11" sm="11">
          <p id="studentGender" class="mb-0"><strong>{{ this.student.genderCode }}</strong></p>
        </v-col>
      </v-row>
      <v-row v-if="this.request.dataSourceCode === 'BC Services Card' || this.request.dataSourceCode === 'BCSC'" no-gutters class="px-2">
        <v-col cols="12" xl="1" lg="1" md="1" sm="1">
          <p class="mb-0">BCSC:</p>
        </v-col>
        <v-col cols="12" xl="11" lg="11" md="11" sm="11">
          <p id="studentBCSCAuto" class="mb-0"><strong>{{ this.request.bcscAutoMatchDetails }}</strong></p>
        </v-col>
      </v-row>

    </v-alert>
    </v-main>
  </div>

</template>

<script>
import ApiService from '../../common/apiService';
import { Routes, Statuses } from '../../utils/constants';
import {formatDob} from '@/utils/format';
export default {
  name: 'penDemographicsCard',
  props: {
    request: {
      type: Object,
      required: true
    },
  },
  data () {
    return {
      showDemographics:false,
      studentErrorMessage: 'There was an error while attempting to load student demographics.',
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
  methods: {
    formatDob
  },
  computed: {
    statusCodes() {
      return Statuses.penRequest;
    },
  },
  watch: {
    'request.penRequestStatusCode': function() {
      this.showDemographics = false;
      if(this.request.pen && (this.request.penRequestStatusCode === this.statusCodes.MANUAL_MATCH || this.request.penRequestStatusCode === this.statusCodes.AUTO_MATCH)) {
        this.showDemographics = true;
        this.loadingDemographics = true;
        ApiService.apiAxios
          .get(Routes.STUDENT_DATA_URL + '/' + this.request.pen)
          .then(demographicsResponse => {
            this.student = demographicsResponse.data;
          })
          .catch(error => {
            this.setFailureAlert(this.studentErrorMessage);
            console.log(error);
          })
          .finally(()=>{this.loadingDemographics = false;});
      }
    }
  }
};
</script>
