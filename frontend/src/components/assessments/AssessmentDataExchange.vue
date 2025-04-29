<template>
  <v-container class="containerSetup" :fluid="true">
    <v-row class="d-flex justify-start">
      <v-col>
        <h2 class="subjectHeading">
          School Year: {{ schoolYear?.replace("-", "/") }}
        </h2>
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
          <v-tab :value="1">Assessment Keys</v-tab>
          <v-tab :value="2">Assessment Results</v-tab>
        </v-tabs>
        <v-window v-model="tab">
          <v-window-item
            :value="1"
            transition="false"
            reverse-transition="false"
          >
            <AssessmentKeyUpload 
              v-if="activeSessions?.length > 0"
              :school-year="schoolYear"
              :school-year-sessions="activeSessions"
            />
          </v-window-item>
          <v-window-item
            :value="2"
            transition="false"
            reverse-transition="false"
          />
          <v-window-item
            :value="3"
            transition="false"
            reverse-transition="false"
          />
        </v-window>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import Spinner from '@/components/common/Spinner.vue';
import ApiService from '../../common/apiService';
import { Routes } from '../../utils/constants';
import AssessmentKeyUpload from './data-exchange/AssessmentKeyUpload.vue';
import { DateTimeFormatter, LocalDate } from '@js-joda/core';

export default {
  name: 'AssessmentSessionDetail',
  components: {
    Spinner,
    AssessmentKeyUpload,
  },
  mixins: [],
  props: {},
  data() {
    return {
      activeSessions: [],
      schoolYear: null,
      isLoading: false,
      tab: '',
    };
  },
  computed: {},
  created() {
    this.loading = true;
    this.getActiveSessions();
  },
  methods: {
    async getActiveSessions() {
      this.loading = true;
      const formatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
      ApiService.apiAxios
        .get(`${Routes.assessments.ASSESSMENT_SESSIONS}`, {})
        .then((response) => {
          const allSessions = response.data;
          allSessions.sort((a, b) => {
            const dateA = LocalDate.parse(a.activeUntilDate, formatter);
            const dateB = LocalDate.parse(b.activeUntilDate, formatter);
            return dateB.compareTo(dateA);
          });
          this.schoolYear = allSessions?.length > 0 ? allSessions[0].schoolYear : null;
          this.activeSessions = allSessions.filter((session) => session.schoolYear === this.schoolYear);
        })
        .catch((error) => {
          console.error(error);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    backToAssesmentSessions() {
      this.$router.push({ name: 'assessment-sessions' });
    },
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
