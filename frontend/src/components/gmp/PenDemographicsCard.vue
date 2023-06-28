<template>
  <div
    v-if="request.pen"
    class="flex"
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
            id="penNumber"
            class="mb-0"
          >
            <strong>{{ request.pen }}</strong>
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
            Legal:
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
            v-if="!student.legalLastName && !student.legalFirstName && !student.legalMiddleNames"
            id="legalNames"
            class="mb-2"
          />
          <p
            v-else
            id="legalNames"
            class="mb-0"
          >
            <strong>{{ student.legalLastName ? student.legalLastName: '(none)' }}, {{ student.legalFirstName ? student.legalFirstName: '(none)' }}, {{ student.legalMiddleNames ? student.legalMiddleNames: '(none)' }}</strong>
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
            Usual:
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
            v-if="!student.usualLastName && !student.usualFirstName && !student.usualMiddleNames"
            id="usualNames"
            class="mb-2"
          />
          <p
            v-else
            id="usualNames"
            class="mb-0"
          >
            <strong>{{ student.usualLastName ? student.usualLastName: '(none)' }}, {{ student.usualFirstName ? student.usualFirstName: '(none)' }}, {{ student.usualMiddleNames ? student.usualMiddleNames: '(none)' }}</strong>
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
  </div>
</template>

<script>
import ApiService from '../../common/apiService';
import { Routes, Statuses } from '../../utils/constants';
import {formatDob} from '@/utils/format';
export default {
  name: 'PenDemographicsCard',
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
  },
  methods: {
    formatDob
  }
};
</script>
