<template>
  <v-container class="containerSetup" :fluid="true">
    <v-row v-if="isLoading" class="mt-0">
      <v-col>
        <Spinner />
      </v-col>
    </v-row>
    <v-row v-else>
      <v-col>
        <v-tabs v-model="tab" style="color: #38598a">
          <v-tab
           value="summary"
           id="summary"
           prepend-icon="mdi-file-document-outline"
           >
           Registrations Summary
          </v-tab>
          <v-tab
           value="registrations"
           id="registrations"
           prepend-icon="mdi-file-arrow-up-down-outline"
           >
           Transfer Registrations
          </v-tab>
          <v-tab
           value="transferKeys"
           id="transferKeys"
           prepend-icon="mdi-file-key-outline"
           >
           Transfer Keys
          </v-tab>
          <v-tab
           value="transferResults"
           id="transferResults"
           prepend-icon="mdi-file-arrow-left-right-outline"
           >
           Transfer Results
          </v-tab>
        </v-tabs>
        <v-window v-model="tab">
          <v-window-item
            value="summary"
            transition="false"
            reverse-transition="false"
          >
          <RegistrationSummary
            :school-year-sessions="activeSessions"
          />
          </v-window-item>
          <v-window-item
            value="registrations"
            transition="false"
            reverse-transition="false"
          />
          <v-window-item
            value="transferKeys"
            transition="false"
            reverse-transition="false"
          >
          <TransferKeys 
              v-if="activeSessions?.length > 0"
              :school-year-sessions="activeSessions"
              @refresh-sessions="refreshSession"
            />
          </v-window-item>
          <v-window-item
            value="transferResults"
            transition="false"
            reverse-transition="false"
          >
          <TransferResults 
              v-if="activeSessions?.length > 0"
              :school-year-sessions="activeSessions"
              @refresh-sessions="refreshSession"
          />
          </v-window-item>
        </v-window>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import Spinner from '@/components/common/Spinner.vue';
import ApiService from '../../common/apiService';
import { Routes } from '../../utils/constants';
import TransferKeys from './data-exchange/TransferKeys.vue';
import TransferResults from './data-exchange/TransferResults.vue';
import { DateTimeFormatter, LocalDate } from '@js-joda/core';
import RegistrationSummary from './RegistrationSummary.vue';

export default {
  name: 'AssessmentTabs',
  components: {
    Spinner,
    TransferKeys,
    TransferResults,
    RegistrationSummary
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
    refreshSession() {
      this.getActiveSessions();
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
