<template>
  <v-container class="containerSetup mb-5">
    <v-row class="pr-4">
      <v-col class="pb-0 mt-4">
        <h2>Open Assessment Sessions</h2>
      </v-col>
    </v-row>
    <v-row 
      v-for="(sessions, index) in activeSessions" 
      :key="index"
    >
      <v-col 
        v-for="session in sessions" 
        :key="session.sessionid" 
        cols="5"
      >
        <SessionCard
          :session="session"
          :handle-open-editor="() => openEditSessionSheet(session)"
        />
      </v-col>
    </v-row>
    <v-divider class="py-6 mt-6" />
    <v-row>
      <v-icon icon="mdi-history pt-3" />
      <h2 class="pl-2">Assessment Session History</h2>
    </v-row>
    <v-row>
      <v-data-table
        id="session-history-dataTable"
        v-model:items-per-page="itemsPerPage"
        :page="pageNumber"
        :items="historicalSessions"
        :items-length="historicalSessions?.length"
        :search="search"
        :headers="headers"
        :items-per-page-options="[
          { value: 5, title: '5' },
          { value: 10, title: '10' },
          { value: 25, title: '25' },
          { value: 50, title: '50' },
          { value: 100, title: '100' },
          { value: -1, title: 'All' }
        ]"
        :hover="true"
        class="fill-height"
        style="border-radius: 0"
      >
        <template #top>
          <v-text-field
            v-model="search"
            clearable
            hide-details="auto"
            label="Search"
            class="pa-4"
          />
        </template>
      </v-data-table>
    </v-row>
    <v-dialog
      v-model="editSessionSheet"
      :inset="true"
      :no-click-animation="true"
      :scrollable="true"
      :persistent="true"
      max-width="40%"
      min-height="35%"
    >
      <EditSession
        v-if="editSessionSheet"
        :session="editSession"
        :on-success-handler="sessionEditSuccess"
        :close-handler="() => (editSessionSheet = false)"
      />
    </v-dialog>
  </v-container>
</template>

<script>
import SessionCard from './sessions/SessionCard.vue';
import EditSession from './sessions/SessionEdit.vue';
import ApiService from '../../common/apiService';
import { Routes } from '../../utils/constants';
import { LocalDate } from '@js-joda/core';
import moment from 'moment';

export default {
  name: 'AssessmentSessions',
  components: {
    SessionCard,
    EditSession,
  },
  data() {
    return {
      topN: 4,
      search: null,
      currentYear: LocalDate.now().year(),
      itemsPerPage: 5,
      pageNumber: 1,
      allsessions: [],
      headers: [
        { title: 'Session ID', key: 'courseSession' },
        { title: 'Month', key: 'courseMonth' },
        { title: 'Year', key: 'courseYear' },
        { title: 'Open Date', key: 'activeFromDate' },
        { title: 'Close Date', key: 'activeUntilDate' },
      ],
      editSessionSheet: false,
      editSession: null,
      headerSearchParams: {},
      headerSortParams: {},
    };
  },
  computed: {
    activeSessions() {
      const orderedSessions = [];
      const allsessions = this.allsessions
      .filter((session, index) => index < this.topN)
        .map((session) => {
          return {
            ...session,
            courseMonth: this.formatMonth(session.courseMonth)
          };
        });
      allsessions.sort((a, b) => a.courseSession - b.courseSession);
      for (let i = 0; i < allsessions.length; i += 2) {
        orderedSessions.push(allsessions.slice(i, i + 2));
      }
      return orderedSessions;
    },
    historicalSessions() {
      return this.allsessions
        .filter((session, index) => index >= this.topN)
        .map((session) => {
          return {
            ...session,
            activeFromDate: this.formattoDate(session.activeFromDate),
            activeUntilDate: this.formattoDate(session.activeUntilDate),
            courseMonth: this.formatMonth(session.courseMonth),
          };
        });
    },
    sessionHeaderSlotName() {
      return `column.${this.sessionid}`;
    },
  },
  created() {
    this.getAllAssessmentSessions();
  },
  methods: {
    getAllAssessmentSessions() {
      this.loading = true;
      ApiService.apiAxios
        .get(`${Routes.eas.GET_ASSESSMENT_SESSIONS}`, {})
        .then((response) => {
          this.allsessions = response.data;
        })
        .catch((error) => {
          console.error(error);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    sessionEditSuccess() {
      this.getAllAssessmentSessions();
    },
    openEditSessionSheet(session) {
      this.editSession = session;
      this.editSessionSheet = !this.editSessionSheet;
    },
    formattoDate(date) {
      return moment(JSON.stringify(date), 'YYYY-MM-DDTHH:mm:ss').format('YYYY/MM/DD');
    },
    formatMonth(month) {
      return moment(month, 'MM').format('MMMM');
    }
  },
};
</script>
