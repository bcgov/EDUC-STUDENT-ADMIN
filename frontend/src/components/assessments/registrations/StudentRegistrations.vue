<template>
  <v-container id="enrollmentTab" fluid>
    <v-row>
      <v-col cols="12">
        <v-row justify="space-between">
          <v-col cols="4" class="found-align">
            <span id="currentPage" class="bold">
              Records Found: {{ totalElements }}
            </span>
          </v-col>
          <v-col cols="8" class="d-flex justify-end">
            <v-btn
                id="addStudentReg"
                color="#003366"
                text="Add Record"
                class="mr-1 mb-1"
                variant="outlined"
                @click="openCreateStudentRegDialog"
            />
            <v-btn
              id="filters"
              color="#003366"
              text="Filter"
              class="mr-1 mb-1"
              prepend-icon="mdi-filter-multiple-outline"
              variant="outlined"
              @click="toggleFilters"
            >
              <template #append>
                <v-badge
                  color="error"
                  :content="filterCount"
                  floating
                  offset-y="-10"
                />
              </template>
            </v-btn>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12">
            <StudentRegistrationsCustomTable
              :headers="config.tableHeaders"
              :data="assessmentStudents"
              :total-elements="totalElements"
              :is-loading="isLoading"
              :reset="resetFlag"
              :can-load-next="canLoadNext"
              :can-load-previous="canLoadPrevious"
              @reload-registrations="reload"
              @editSelectedRow="editRegistration"
              @loadNext="loadNext"
              @loadPrevious="loadPrevious"
            />
          </v-col>
        </v-row>
      </v-col>
      <v-navigation-drawer
        v-model="showFilters"
        location="right"
        :temporary="true"
        width="700"
        :persistent="true"
        scrim="transparent"
        :border="true"
        style="top: 0; height: 100%"
        rounded="true"
      >
        <StudentRegistrationsFilter
          :filters="config.allowedFilters"
          :school-year-sessions="schoolYearSessions"
          :initial-filter-selection="filterSearchParams?.moreFilters"
          @apply-assessment-filters="applyFilters"
          @clear-assessment-filters="clearFilters"
          @close-assessment-filter="showFilters = !showFilters"
        />
      </v-navigation-drawer>
    </v-row>
    <v-bottom-sheet
        v-model="newStudentRegistrationSheet"
        :inset="true"
        :no-click-animation="true"
        :persistent="true"
        max-height="90vh"
    >
      <AddStudentRegistration
          :session-id="sessionID"
          :school-year-sessions="schoolYearSessions"
          @reload-student-registrations="reloadStudentRegistrationsFlag = true"
          @close-new-student-registration="closeNewAndLoadStudentRegistrations"
          @update:sessionID="sessionID = $event"
      />
    </v-bottom-sheet>
    <v-bottom-sheet
      v-model="editStudentRegistrationSheet"
      :inset="true"
      :no-click-animation="true"
      :scrollable="true"
      :persistent="true"
    >
      <StudentRegistrationDetail
        :selected-student-registration-id="studentRegistrationForEdit?.assessmentStudentID"
        :school-year-sessions="schoolYearSessions"
        @reload-student-registrations="reloadStudentRegistrationsFlag = true"
        @close-student-registration="closeEditAndLoadStudentRegistrations"
      />
    </v-bottom-sheet>
  </v-container>
</template>

<script>
import StudentRegistrationsCustomTable from './StudentRegistrationsCustomTable.vue';
import { SCHOOL_YEAR_REGISTRATIONS_VIEW, SESSION_REGISTRATIONS_VIEW } from '@/utils/assessments/StudentRegistrationTableConfiguration.js';
import ApiService from '@/common/apiService';
import { Routes } from '@/utils/constants';
import { cloneDeep, isEmpty, omitBy, capitalize } from 'lodash';
import StudentRegistrationsFilter from './StudentRegistrationsFilter.vue';
import StudentRegistrationDetail from './StudentRegistrationDetail.vue';
import { Month } from '@js-joda/core';
import AddStudentRegistration from "@/components/assessments/registrations/forms/AddStudentRegistration.vue";

export default {
  name: 'StudentRegistrations',
  components: {
    AddStudentRegistration,
    StudentRegistrationsCustomTable,
    StudentRegistrationsFilter,
    StudentRegistrationDetail
  },
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
    schoolYearSessions: {
      type: Object,
      required: true,
    }    
  },
  emits: [],
  data() {
    return {
      config: this.sessionID ? SESSION_REGISTRATIONS_VIEW :  SCHOOL_YEAR_REGISTRATIONS_VIEW ,
      assessmentStudents: [],
      filterSearchParams: {
        moreFilters: {},
      },
      showFilters: null,
      newStudentRegistrationSheet: false,
      isLoading: false,
      totalElements: 0,
      pageNumber: 1,
      pageSize: 15,
      canLoadNext: false,
      canLoadPrevious: false,
      resetFlag: false,
      studentRegistrationForEdit: null,
      reloadStudentRegistrationsFlag: false,
      editStudentRegistrationSheet: false,
    };
  },
  computed: {
    filterCount() {
      return Object.values(this.filterSearchParams.moreFilters).filter(filter => !!filter ).reduce((total, filter) => total.concat(filter), []).length;
    },
  },
  created() {
    this.applyDefaultFilters();
    this.getAssessmentStudents();
  },
  methods: {
    editRegistration($event) {
      this.studentRegistrationForEdit = cloneDeep($event);
      this.editStudentRegistrationSheet = true;
    },
    closeEditAndLoadStudentRegistrations() {
      this.editStudentRegistrationSheet = !this.editStudentRegistrationSheet;
      if (this.reloadStudentRegistrationsFlag === true) {
        this.getAssessmentStudents();
      }
      this.reloadStudentRegistrationsFlag = false;
    },
    closeNewAndLoadStudentRegistrations(){
      this.newStudentRegistrationSheet = !this.newStudentRegistrationSheet;
      if(this.reloadStudentRegistrationsFlag === true){
        this.getAssessmentStudents();
      }
      this.reloadStudentRegistrationsFlag = false;
    },
    applyDefaultFilters() {
      if (this.sessionID) {
        const activeSession = this.schoolYearSessions.find(
          (session) => session.sessionID === this.sessionID
        );
        this.filterSearchParams.moreFilters.session = [
          { title: capitalize(Month.of(activeSession.courseMonth).toString()), id: activeSession.sessionID, value: activeSession.sessionID },
        ];
      }      
    },
    getAssessmentStudents() {
      this.loading = true;
      let sort = {
        assessmentStudentID: 'ASC',
      };
      let assessmentSearchParams = cloneDeep(this.filterSearchParams);
      if (! this.sessionID) {        
        assessmentSearchParams.moreFilters.schoolYear = [
          { title: 'schoolYear', id: 'schoolYear', value: this.schoolYear },
        ];
      }
      ApiService.apiAxios
        .get(`${Routes.assessments.GET_ASSESSMENT_STUDENTS_PAGINATED}`, {
          params: {
            pageNumber: this.pageNumber - 1,
            pageSize: this.pageSize,
            searchParams: omitBy(assessmentSearchParams, isEmpty),
            sort: sort,
          },
        })
        .then((response) => {
          this.assessmentStudents = response.data.content;
          this.totalElements = response.data.totalElements;
          this.canLoadNext = response.data.last === false;
          this.canLoadPrevious = response.data.first === false;
        })
        .catch((error) => {
          console.error(error);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    applyFilters($event) {
      this.filterSearchParams.moreFilters = cloneDeep($event);
      this.pageNumber = 1;
      this.getAssessmentStudents();
    },
    clearFilters() {
      this.filterSearchParams.moreFilters = {};
      this.pageNumber = 1;
      this.getAssessmentStudents();
    },
    toggleFilters() {
      this.showFilters = !this.showFilters;
    },
    openCreateStudentRegDialog() {
      this.newStudentRegistrationSheet = !this.newStudentRegistrationSheet;
    },
    loadNext() {
      if (this.canLoadNext) {
        this.pageNumber += 1;
        this.getAssessmentStudents();
      }
    },
    loadPrevious() {
      if (this.canLoadPrevious) {
        this.pageNumber -= 1;
        this.getAssessmentStudents();
      }
    },
    reload(value) {
      if(value?.pageSize) {
        this.pageSize = value?.pageSize;
      } else if(value?.pageNumber) {
        this.pageNumber = value?.pageNumber;
      }
      this.getAssessmentStudents();
    }
  },
};
</script>

<style scoped>
.search-box {
  background: rgb(235, 237, 239);
  border-radius: 8px;
  padding: 10px;
}

.filter-col {
  color: #7f7f7f;
}

.bold {
  font-weight: bold;
}

.found-align {
  align-self: flex-end;
}

.export {
  margin-left: 1px;
  color: #003366;
}
</style>
