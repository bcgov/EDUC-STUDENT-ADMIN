<template>
  <v-col
    class="py-2 px-0"
  >
    <v-progress-linear
      indeterminate
      color="blue"
      :active="loadingDemographics"
    />
    <v-alert
      :value="showDemographics"
      width="100%"
      outlined
      transition="scale-transition"
      class="bootstrap-success"
    >
      <v-row
        no-gutters
        class="px-2"
      >
        <v-col
          cols="12"
          xl="1"
          lg="1"
          md="1"
          sm="1"
        >
          <p class="mb-0">
            PEN:
          </p>
        </v-col>
        <v-col
          cols="12"
          xl="11"
          lg="11"
          md="11"
          sm="11"
        >
          <p
            id="recordedPEN"
            class="mb-0"
          >
            <strong>{{ request.recordedPen }}</strong>
          </p>
        </v-col>
      </v-row>
      <v-row
        no-gutters
        class="px-2"
      >
        <v-col
          cols="12"
          xl="1"
          lg="1"
          md="1"
          sm="1"
        >
          <p class="mb-0">
            First:
          </p>
        </v-col>
        <v-col
          cols="12"
          xl="11"
          lg="11"
          md="11"
          sm="11"
        >
          <p
            id="legalFirstName"
            class="mb-0"
          >
            <strong>{{ student.legalFirstName || '' }}</strong>
          </p>
        </v-col>
      </v-row>
      <v-row
        no-gutters
        class="px-2"
      >
        <v-col
          cols="12"
          xl="1"
          lg="1"
          md="1"
          sm="1"
        >
          <p class="mb-0">
            Middle:
          </p>
        </v-col>
        <v-col
          cols="12"
          xl="11"
          lg="11"
          md="11"
          sm="11"
        >
          <p
            id="legalMiddleName"
            class="mb-0"
          >
            <strong>{{ student.legalMiddleNames || '' }}</strong>
          </p>
        </v-col>
      </v-row>
      <v-row
        no-gutters
        class="px-2"
      >
        <v-col
          cols="12"
          xl="1"
          lg="1"
          md="1"
          sm="1"
        >
          <p class="mb-0">
            Last:
          </p>
        </v-col>
        <v-col
          cols="12"
          xl="11"
          lg="11"
          md="11"
          sm="11"
        >
          <p
            id="legalLastName"
            class="mb-0"
          >
            <strong>{{ student.legalLastName || '' }}</strong>
          </p>
        </v-col>
      </v-row>
      <v-row
        no-gutters
        class="px-2"
      >
        <v-col
          cols="12"
          xl="1"
          lg="1"
          md="1"
          sm="1"
        >
          <p class="mb-0">
            DOB:
          </p>
        </v-col>
        <v-col
          cols="12"
          xl="11"
          lg="11"
          md="11"
          sm="11"
        >
          <p
            id="studentDOB"
            class="mb-0"
          >
            <strong>{{ formatDob(student.dob,'uuuu-MM-dd', 'uuuu/MM/dd') }}</strong>
          </p>
        </v-col>
      </v-row>
    </v-alert>
  </v-col>
</template>

<script>
import ApiService from '../../common/apiService';
import { Routes, Statuses } from '../../utils/constants';
import {formatDob} from '@/utils/format';
export default {
  name: 'StudentDemographicsCard',
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
  computed: {
    statusCodes() {
      return Statuses.studentRequest;
    },
  },
  watch: {
    'request.studentRequestStatusCode': function() {
      if(this.request.recordedPen && (this.request.studentRequestStatusCode === this.statusCodes.COMPLETED)) {
        this.showDemographics = true;
        this.loadingDemographics = true;
        ApiService.apiAxios
          .get(Routes.STUDENT_DATA_URL + '/' + this.request.recordedPen)
          .then(demographicsResponse => {
            this.student = demographicsResponse.data;
          })
          .catch(error => {
            this.setFailureAlert(this.studentErrorMessage);
            console.log(error);
          })
          .finally(()=>{this.loadingDemographics = false;});
      }else {
        this.showDemographics = false;
        this.loadingDemographics = false;
      }
    }
  },
  methods: {
    formatDob
  }
};
</script>
