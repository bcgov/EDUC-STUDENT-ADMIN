<template>
  <v-container fluid>
    <v-row class="mb-1">
      <v-col>
        Select a school from the list below and enter a PEN to search for a student in the collection.
      </v-col>
    </v-row>
    <v-form
      ref="gradDistrictStudentSearchForm"
      v-model="isValid"
      class="d-flex"
    >
      <v-row>
        <v-col cols="3">
          <SchoolCodeNameFilter
            v-model="schoolNameNumber"
            closed-within-months="3"
            :rules="[rules.required()]"
            :collection-object="collectionObject"
          />
        </v-col>
        <v-col cols="2">
          <v-text-field
            ref="studentPENField"
            v-model="studentPEN"
            label="Enter PEN"
            :rules="[rules.required(),rules.penIsValid()]"
            variant="underlined"
          />
        </v-col>
        <v-col cols="2">
          <v-btn
            id="search"
            color="#003366"
            text="Search"
            class="mr-1 mt-2"
            :disabled="!isValid"
            @click="searchStudent"
          />
          <v-btn
            id="clear"
            color="#003366"
            text="Clear"
            variant="outlined"
            class="mr-1 mt-2"
            @click="clear"
          />
        </v-col>
      </v-row>
    </v-form>

    <div v-if="noDataFlag">
      <p>Student not found.</p>
    </div>
    <div v-else-if="isLoading">
      <v-row>
        <v-col class="d-flex justify-center">
          <Spinner
            :flat="true"
            style="margin-bottom: 40rem"
          />
        </v-col>
      </v-row>
    </div>
    <div v-else-if="!isLoading && demStudentData">
      <v-row
        no-gutters
        class="mb-n2"
      >
        <v-col
          cols="4"
          align-self="center"
        >
          <span class="heading ">
            {{ totalElements }} Submissions Found
          </span>
        </v-col>
        <v-col
          cols="8"
          class="d-flex justify-end"
          align-self="center"
        >
          <v-btn
            id="search"
            color="#1976d2"
            :text="selectedSubmissionText"
            variant="text"
            append-icon="mdi-account-details"
            @click="showSubmission = !showSubmission"
          />
        </v-col>
      </v-row>
      <v-row
        no-gutters
        class="mt-2"
      >
        <v-col>
          <div class="border">
            <v-row class="name-header">
              <v-col>
                <span>
                  <v-icon
                    size="25"
                    :color="getIssueIconColor(demStudentData?.studentStatusCode)"
                  >
                    {{ getIssueIcon(demStudentData?.studentStatusCode) }}
                  </v-icon>
                  {{ demStudentData?.pen }} - {{ getName(demStudentData?.lastName, demStudentData?.firstName, demStudentData?.middleName) }}
                </span>
              </v-col>
              <v-col class="d-flex justify-end">
                <v-menu
                  location="bottom"
                >
                  <template #activator="{ props }">
                    <a
                      class="mt-n1 mr-1"
                      style="font-weight: bold"
                      v-bind="props"
                    >...</a>
                  </template>
                  <v-card
                    style="max-width: 30em;"
                    border="sm"
                    class="pa-2"
                  >
                    <v-row>
                      <v-col>
                        <div>
                          <div class="heading">
                            Citizenship
                          </div>
                          <div>{{ demStudentData?.citizenship }}</div>
                        </div>
                      </v-col>
                      <v-col>
                        <div>
                          <div class="heading">
                            Program Cadre
                          </div>
                          <div>{{ demStudentData?.programCadreFlag }}</div>
                        </div>
                      </v-col>
                      <v-col>
                        <div>
                          <div class="heading">
                            Program Codes
                          </div>
                          <div>
                            <span>{{ getProgramsList() }}</span>
                          </div>
                        </div>
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col>
                        <div>
                          <div class="heading">
                            Address
                          </div>
                          <div>
                            <span v-if="demStudentData?.addressLine1">{{ demStudentData?.addressLine1 }}, </span>
                            <span v-if="demStudentData?.addressLine2">{{ demStudentData?.addressLine2 }}, </span>
                            <span v-if="demStudentData?.city">{{ demStudentData?.city }}, </span>
                            <span v-if="demStudentData?.provincialCode">{{ demStudentData?.provincialCode }}, </span>
                            <span v-if="demStudentData?.countryCode">{{ demStudentData?.countryCode }}, </span>
                            <span v-if="demStudentData?.postalCode">{{ demStudentData?.postalCode }} </span>
                          </div>
                        </div>
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col>
                        <div v-if="studentID && VIEW_SLD_HISTORY_ROLE">
                          <router-link
                            :to="{name: REQUEST_TYPES.student.label, params: {studentID: studentID}, query: {activeTab: 'sld'}}"
                            target="_blank"
                            class="router"
                          >
                            View SLD History
                          </router-link>
                        </div>
                        <div>
                          <a
                            :href="`${gradAdminURL}/api/auth/silent_idir_login?studentID=${studentID}&studentDetails=true&idir_guid=${user.userGuid.toLowerCase()}`"
                            target="_blank"
                          >View GRAD Data</a>
                        </div>
                      </v-col>
                    </v-row>
                  </v-card>
                </v-menu>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="2">
                <div>
                  <div class="heading">
                    Student Status
                  </div>
                  <div>{{ demStudentData?.studentStatus }}</div>
                </div>
              </v-col>
              <v-col cols="2">
                <div>
                  <div class="heading">
                    Grade
                  </div>
                  <div>{{ demStudentData?.grade }}</div>
                </div>
              </v-col>
              <v-col cols="2">
                <div>
                  <div class="heading">
                    Grad Req. Year
                  </div>
                  <div>{{ demStudentData?.gradRequirementYear }}</div>
                </div>
              </v-col>
              <v-col cols="2">
                <div>
                  <div class="heading">
                    SCCP Date
                  </div>
                  <div>{{ demStudentData?.schoolCertificateCompletionDate }}</div>
                </div>
              </v-col>
              <v-col>
                <div>
                  <div class="heading">
                    Birthdate
                  </div>
                  <div>{{ formatDate(demStudentData?.birthdate) }}</div>
                </div>
              </v-col>
              <v-col>
                <div>
                  <div class="heading">
                    Gender
                  </div>
                  <div>{{ demStudentData?.gender }}</div>
                </div>
              </v-col>
              <v-col>
                <div>
                  <div class="heading">
                    Local ID
                  </div>
                  <div>{{ demStudentData?.localID }}</div>
                </div>
              </v-col>
            </v-row>
          </div>
        </v-col>
      </v-row>

      <v-row class="mt-3 mb-3">
        <v-col>
          <v-btn-toggle rounded="0">
            <v-btn
              id="courses"
              size="large"
              class="course-button"
              :class="{ 'active-button': view === 'course' }"
              @click="showCourse"
            >
              Courses
            </v-btn>
            <v-btn
              id="assessments"
              size="large"
              class="assessment-button"
              :class="{ 'active-button': view === 'assessment' }"
              @click="showAssessment"
            >
              Assessments
            </v-btn>
          </v-btn-toggle>
        </v-col>
      </v-row>
      <div v-if="view === 'course'">
        <CourseTable
          :headers="courseHeaders"
          :data="courseData"
        />
      </div>
      <div v-if="view === 'assessment'">
        <AssessmentTable
          :headers="assessmentHeaders"
          :data="assessmentData"
        />
      </div>
    </div>

    <v-navigation-drawer
      v-model="showSubmission"
      location="right"
      :temporary="true"
      width="500"
      :persistent="true"
      scrim="transparent"
      :border="true"
      style="top:0; height: 100%;"
      rounded="true"
    >
      <StudentSubmission
        :submissions="filesetStudentSubmissions"
        :selected-submission="selectedSubmission"
        @close="showSubmission =! showSubmission"
        @refresh-search="refreshSearch"
      />
    </v-navigation-drawer>
  </v-container>
</template>

<script>
import alertMixin from '../../mixins/alertMixin';
import * as Rules from '../../utils/institute/formRules';
import CourseTable from './common/CourseTable.vue';
import AssessmentTable from './common/AssessmentTable.vue';
import StudentSubmission from './common/StudentSubmission.vue';
import ApiService from '../../common/apiService';
import {REQUEST_TYPES, Routes} from '@/utils/constants';
import {isEmpty, omitBy} from 'lodash';
import {LocalDateTime, DateTimeFormatter} from '@js-joda/core';
import Spinner from '../common/Spinner.vue';
import {setFailureAlert} from '@/components/composable/alertComposable';
import {formatDateTime} from '@/utils/format';
import {getStatusColorAuthorityOrSchool} from '@/utils/institute/status';
import SchoolCodeNameFilter from '@/components/gdc/common/SchoolCodeNameFilter.vue';
import {mapState} from 'pinia';
import {authStore} from '@/store/modules/auth';
import {appStore} from '@/store/modules/app';

export default {
  name: 'GradStudentSearch',
  components: {
    SchoolCodeNameFilter,
    CourseTable,
    AssessmentTable,
    StudentSubmission,
    Spinner
  },
  mixins: [alertMixin],
  props: {
    collectionObject: {
      type: Object,
      required: true
    },
  },
  data() {
    return {
      requestCount: 0,
      rules: Rules,
      studentPEN: null,
      isValid: false,
      schoolNameNumber: null,
      view: 'course',
      showSubmission: false,
      courseHeaders: [
        { key: 'status', align: 'start', sortable: true },
        { title: 'Course', key: 'course', align: 'start', sortable: true },
        { title: 'Session', key: 'session', align: 'end', sortable: true },
        { title: 'Status', key: 'courseStatus', align: 'end', sortable: true },
        { title: 'Int. Grade', key: 'interimPercentage', align: 'end', sortable: true },
        { title: 'Final Grade', key: 'finalPercentage', align: 'end', sortable: true },
        { title: 'Credits', key: 'numberOfCredits', align: 'end', sortable: true },
        { title: 'Description', key: 'courseDescription', align: 'end', sortable: true },
        { title: 'Grad Reqt.', key: 'courseGraduationRequirement', align: 'end', sortable: true },
        { title: 'Type', key: 'courseType', align: 'end', sortable: true },
        { title: 'Related Course', key: 'relatedCourse', align: 'end', sortable: true },
      ],
      assessmentHeaders: [
        { key: 'status', align: 'start', sortable: true },
        { title: 'Assessment', key: 'courseCode', align: 'start', sortable: true },
        { title: 'Session', key: 'session', align: 'end', sortable: true },
        { title: 'Status', key: 'courseStatus', align: 'end', sortable: true },
        { title: 'Proficiency Score', key: 'finalPercent', align: 'end', sortable: true },
        { title: 'eExam', key: 'isElectronicExam', align: 'end', sortable: true },
        { title: 'Special Case', key: 'provincialSpecialCase', align: 'end', sortable: true },
        { title: 'Local Course ID', key: 'localCourseID', align: 'end', sortable: true },
      ],
      filterSearchParams: {
        moreFilters: {},
        pen: '',
        schoolID: ''
      },
      filesetStudentSubmissions: [],
      totalElements: 0,
      pageNumber: 1,
      pageSize: 1000,
      demStudentData: null,
      assessmentData: [],
      courseData: [],
      selectedSubmission: {},
      selectedSubmissionText: '',
      noDataFlag: false,
      studentID: null,
      gradAdminURL: '',
      user: null,
    };
  },
  computed: {
    REQUEST_TYPES() {
      return REQUEST_TYPES;
    },
    ...mapState(authStore, ['VIEW_SLD_HISTORY_ROLE']),
    ...mapState(authStore, ['userInfo']),
    ...mapState(appStore, ['config']),
    isLoading() {
      return this.requestCount > 0;
    }
  },
  watch: {
    collectionObject: {
      handler() {
        this.demStudentData = null;
        this.assessmentData = [];
        this.courseData = [];
        this.selectedSubmission = {};
        this.selectedSubmissionText = '';
        this.noDataFlag = false;
      },
      immediate: true
    }
  },
  created() {
    appStore().getConfig().then(() => {
      this.gradAdminURL = this.config.GRAD_ADMIN_URL;
    });
    authStore().getUserInfo().then(()=> {
      this.user = this.userInfo;
    });
  },
  methods: {
    getStatusColorAuthorityOrSchool,
    getProgramsList() {
      let programCodes = [this.demStudentData?.programCode1, this.demStudentData?.programCode2, this.demStudentData?.programCode3, this.demStudentData?.programCode4, this.demStudentData?.programCode5];
      let cleanArray = programCodes.filter(x => x != null);
      return cleanArray.join(', ');
    },
    formatDate(inputDate) {
      return formatDateTime(inputDate, 'uuuuMMdd', 'uuuu/MM/dd', false);
    },
    async refreshSearch(selectedSubmission) {
      this.selectedSubmission = selectedSubmission[0];
      this.noDataFlag = false;
      await this.findStudentInFilesetByPEN();
      this.setIncomingFilesetSelection();
    },
    async searchStudent() {
      this.noDataFlag = false;
      this.selectedSubmission = {};
      this.filterSearchParams.pen = this.studentPEN;
      this.filterSearchParams.schoolID = this.schoolNameNumber;
      this.filterSearchParams.collectionObject = this.collectionObject;
      await this.getStudentSubmissions();
      if (this.filesetStudentSubmissions.length === 0) {
        this.noDataFlag = true;
        return;
      }
      await this.findStudentInFilesetByPEN();
      await this.findStudentIdByPEN();
    },
    clear() {
      this.$refs.gradDistrictStudentSearchForm.reset();
      this.demStudentData = null;
      this.assessmentData = [];
      this.courseData = [];
      this.selectedSubmission = {};
      this.selectedSubmissionText = '';
      this.noDataFlag = false;
    },
    async getStudentSubmissions() {
      this.requestCount += 1;
      await ApiService.apiAxios.get(`${Routes.gdc.BASE_URL}/fileset/paginated`, {
        params: {
          pageNumber: this.pageNumber - 1,
          pageSize: this.pageSize,
          searchParams: omitBy(this.filterSearchParams, isEmpty),
          sort: {
            updateDate: 'DESC'
          },
        }
      }).then(response => {
        this.filesetStudentSubmissions = response.data.content;
        this.totalElements = response.data.totalElements;
        this.selectedSubmission = {};
        if(response.data.content.length > 0) {
          this.setIncomingFilesetSelection();
        }
      }).catch(error => {
        console.error(error);
        this.setFailureAlert('An error occurred while trying get to fileset list. Please try again later.');
      }).finally(() => {
        this.requestCount -= 1;
      });
    },
    async findStudentInFilesetByPEN() {
      this.requestCount += 1;
      await ApiService.apiAxios.get(`${Routes.gdc.BASE_URL}/fileset/${this.selectedSubmission?.incomingFilesetID}/student/${this.studentPEN}`, {
        params: {
          schoolID: this.schoolNameNumber
        }
      }).then(response => {
        if(isEmpty(response.data)) {
          this.noDataFlag=true;
        }
        this.demStudentData = response.data.demographicStudent;
        this.assessmentData = response.data.assessmentStudents;
        this.courseData = response.data.courseStudents;
      }).catch(error => {
        console.error(error);
        if(error?.response?.status == 404) {
          this.noDataFlag=true;
        } else {
          setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while trying to get student detail. Please try again later.');
        }
      }).finally(() => {
        this.requestCount -= 1;
      });
    },
    async findStudentIdByPEN() {
      if (!this.VIEW_SLD_HISTORY_ROLE) {
        return;
      }
      this.requestCount += 1;
      await ApiService.apiAxios.get(`${Routes.student.SEARCH_BY_PEN_URL}?pen=${this.studentPEN}`).then(response => {
        this.studentID = response.data.studentID;
      }).catch(error => {
        console.error(error);
      }).finally(() => {
        this.requestCount -= 1;
      });
    },
    setIncomingFilesetSelection() {
      if(isEmpty(this.selectedSubmission)) {
        let createDate =  formatDateTime(this.filesetStudentSubmissions[0].createDate.substring(0, 19),'uuuu-MM-dd\'T\'HH:mm:ss','uuuu/MM/dd', false);
        let createTime = LocalDateTime.parse(this.filesetStudentSubmissions[0].createDate).format(DateTimeFormatter.ofPattern('HH:mm'));
        this.selectedSubmissionText = `Submitted: ${createDate} ${createTime}`;
        this.selectedSubmission = this.filesetStudentSubmissions[0];
      } else {
        let createDate =  this.selectedSubmission.createDate;
        let createTime = this.selectedSubmission.createTime;
        this.selectedSubmissionText = `Submitted: ${createDate} ${createTime}`;
      }
    },
    showCourse() {
      this.view = 'course';
    },
    showAssessment() {
      this.view = 'assessment';
    },
    getName(last, first, middle){
      if(first && middle){
        return `${last}, ${first} ${middle}`;
      }else if(first){
        return `${last}, ${first}`;
      }else if(middle){
        return `${last}, ${middle}`;
      }else if(last){
        return last;
      }
      return '';
    },
    getIssueIcon(issue){
      switch (issue) {
      case 'ERROR':
        return 'mdi-alert-circle-outline';
      case 'WARNING':
        return 'mdi-alert-outline';
      default:
        return '';
      }
    },
    getIssueIconColor(issue){
      switch (issue) {
      case 'ERROR':
        return '#d90606';
      case 'WARNING':
        return '#2196F3';
      default:
        return '';
      }
    },
  },
};
</script>

<style scoped>

h3 {
 color: #38598a;
}
.border {
border: 2px solid grey;
border-radius: 5px;
padding: 35px;
}

.name-header {
font-weight: bold;
}

.heading {
color: grey;
}

.course-button {
border: 1px solid lightgray;
}

.assessment-button {
border: 1px solid lightgray;
}

.active-button {
background-color: #003366 !important;
color: white !important;
border: 1px solid #003366;
}
.align {
  align-items: flex-end;
}

</style>
