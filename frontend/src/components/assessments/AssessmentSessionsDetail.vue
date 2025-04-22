<template>
  <v-container class="containerSetup" :fluid="true">
    <v-row class="d-flex justify-start">
      <v-col>
        <h2 class="subjectHeading">School Year: {{ schoolYear.replace('-','/') }}</h2>
      </v-col>
    </v-row>    
    <v-row no-gutters>
      <v-col>
        <v-divider class="divider" />
      </v-col>
    </v-row>
    <v-row v-if="isLoading" class="mt-0">
      <v-col>
        <Spinner />
      </v-col>
    </v-row>
    <v-row v-else>
      <v-col class="border">
        <v-tabs v-model="tab" color="#38598a">
          <v-tab :value="1"> Registrations and Results </v-tab>
          <v-tab :value="2"> Special Case Requests </v-tab>
          <v-tab :value="3"> Reports </v-tab>
        </v-tabs>
        <v-window v-model="tab">
          <v-window-item :value="1" transition="false" reverse-transition="false">
            <StudentRegistrations v-if="schoolYearSessions.length > 0" :school-year="schoolYear"
                                  :school-year-sessions="schoolYearSessions" :session-ID="sessionID" />
          </v-window-item>
          <v-window-item :value="2" transition="false" reverse-transition="false"/>
          <v-window-item :value="3" transition="false" reverse-transition="false"/>
        </v-window>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import alertMixin from '../../mixins/alertMixin';
import StudentRegistrations from './registrations/StudentRegistrations.vue';
import Spinner from '@/components/common/Spinner.vue';
import ApiService from '../../common/apiService';
import { Routes } from '../../utils/constants';

export default {
  name: 'AssessmentSessionDetail',
  components: {
    StudentRegistrations,
    Spinner,
  },
  mixins: [alertMixin],
  props: {
    schoolYear: {
      type: String,
      required: true,
    },
    sessionID: {
      type: String,
      required: false,
      default: null,
    },
  },
  data() {
    return {
      assessmentStudents: [],
      schoolYearSessions: [],
      isLoading: false,
      tab: ''
    };
  },
  computed: {},
  created() {    
    this.loading = true;
    this.getAllSessionsforYear();
  },
  methods: {
    async  getAllSessionsforYear() {
      this.loading = true;
      ApiService.apiAxios
        .get(
          `${Routes.eas.EAS_ASSESSMENT_SESSIONS}/school-year/` +
            this.schoolYear,
          {}
        )
        .then((response) => {
          this.schoolYearSessions = response.data;          
        })
        .catch((error) => {
          console.error(error);
        })
        .finally(() => {
          this.loading = false;
        });
    }
  },
};
</script>
<style scoped>
.border {
  border: 2px solid grey;
  border-radius: 5px;
  padding: 35px;
  margin-bottom: 2em;
}
.divider {
  border-color: #fcba19;
  border-width: 3px;
  opacity: unset;
}
.containerSetup {
  padding-right: 5em !important;
  padding-left: 5em !important;
}

@media screen and (max-width: 1200px) {
  .containerSetup {
    padding-right: 3em !important;
    padding-left: 3em !important;
  }
}
</style>
