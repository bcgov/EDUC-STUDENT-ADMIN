<template>
  <v-col cols="9">
    <h3 class="subHeading pb-1">
      Schools
    </h3>
    <p>Find a school expected to submit GRAD data.</p>
  </v-col>
  <v-col cols="9">
    <SchoolCodeNameFilter
      v-model="schoolNameNumber"
      :collection-object="collectionObject"
    />
  </v-col>
  <div v-if="schoolNameNumber">
    <v-col cols="9">
      <v-row>
        <v-col
          v-if="loading"
          cols="auto"
          class="ma-0 pa-0"
        >
          <v-skeleton-loader
            type="text"
            width="154px"
          />
        </v-col>
        <v-col
          v-else
          cols="auto"
        >
          <v-icon
            icon="mdi-phone-outline"
            class="pe-2"
          />
          {{ school.phoneNumber ? formatPhoneNumber(school.phoneNumber) : 'No phone number found' }}
        </v-col>
        <v-col cols="auto">
          <a
            :href="`${edxURL}/api/auth/silent_sdc_idir_login?schoolID=${schoolNameNumber}&gradDashboard=true&idir_guid=${user.userGuid.toLowerCase()}`"
            target="_link"
          >
            <v-icon
              icon="mdi-school-outline"
              class="pe-2"
            />
            Graduation Dashboard
          </a>
        </v-col>
        <v-col cols="auto">
          <a
            @click="openSchool(schoolNameNumber)"
          >
            <v-icon
              icon="mdi-domain"
              class="pe-2"
            />
            School Details
          </a>
        </v-col>
      </v-row>
    </v-col>
    <v-col cols="9">
      <h3 class="subHeading pb-1">
        <v-icon icon="mdi-chart-timeline-variant" /> Collection Insights
      </h3>
      <v-table>
        <thead>
          <tr>
            <th scope="col">
              Reporting Period
            </th>
            <th scope="col">
              Total Submissions
            </th>
            <th scope="col">
              Last Submission
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <v-icon
                class="pb-1"
                :color="getStatusColorGdcSession(panel1Status)"
              >
                mdi-circle-medium
              </v-icon>
              School Year
            </td>
            <td>{{ schoolYearSubmissionCount || 0 }}</td>
            <td>{{ schoolYearLastSubmission || '-' }}</td>
          </tr>
          <tr>
            <td>
              <v-icon
                class="pb-1"
                :color="getStatusColorGdcSession(panel2Status)"
              >
                mdi-circle-medium
              </v-icon>
              Summer
            </td>
            <td>{{ summerSubmissionCount || 0 }}</td>
            <td>{{ summerLastSubmission || '-' }}</td>
          </tr>
        </tbody>
      </v-table>
    </v-col>
    <v-col cols="9">
      <h3 class="subHeading pb-1">
        Graduation Administrator(s)
      </h3>
      <v-table id="gradAdministrator">
        <thead>
          <tr>
            <th scope="col">
              Name
            </th>
            <th scope="col">
              Email
            </th>
            <th
              id="copyColumn"
              scope="col"
            />
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="admin in gradAdmins"
            :key="admin.edxUserID"
          >
            <td>{{ admin.firstName }} {{ admin.lastName }}</td>
            <td>{{ admin.email }}</td>
            <td>
              <v-btn
                variant="text"
                icon="mdi-content-copy"
                color="#1a5a96"
                @click="copyToClipboard(admin.email)"
              />
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-col>
  </div>
</template>

<script>
import SchoolCodeNameFilter from '@/components/gdc/common/SchoolCodeNameFilter.vue';
import { findReportingPeriodStatus, getStatusColorGdcSession } from '@/utils/institute/status';
import {appStore} from '@/store/modules/app';
import {authStore} from '@/store/modules/auth';
import {mapState} from 'pinia';
import ApiService from '@/common/apiService';
import {Routes} from '@/utils/constants';
import {formatPhoneNumber} from '@/utils/format';
import {setSuccessAlert} from '@/components/composable/alertComposable';

export default {
  name: 'Schools',
  components: { SchoolCodeNameFilter },
  props: {
    collectionObject: {
      type: Object,
      required: false,
      default: null
    },
    isPrevious: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      schoolNameNumber: null,
      panel1Status: '',
      panel2Status: '',
      edxURL: '',
      user: null,
      school: null,
      loading: null,
      users: [],
      schoolsCacheMap: [],
      submissionsByCategory: null,
      schoolYearSubmissionCount: null,
      schoolYearLastSubmission: null,
      summerSubmissionCount: null,
      summerLastSubmission: null
    };
  },
  computed: {
    ...mapState(authStore, ['userInfo']),
    ...mapState(appStore, ['config']),
    ...mapState(appStore, ['schoolMap']),
    gradAdmins() {
      return this.users.filter(user =>
        user.edxUserSchools.some(school =>
          school.schoolID === this.schoolNameNumber &&
              school.edxUserSchoolRoles.some(role => role.edxRoleCode === 'GRAD_SCH_ADMIN')
        )
      );
    }
  },
  watch: {
    collectionObject: {
      handler(newCollection, oldCollection) {
        if (newCollection?.reportingPeriodID !== oldCollection?.reportingPeriodID) {
          if (this.schoolNameNumber) {
            this.getSchoolSubmissions();
          }
        }
        if (newCollection) {
          this.findReportingPeriodStatus();
        }
      },
      immediate: true
    },
    schoolNameNumber: {
      handler(newSchoolNameNumber) {
        if (newSchoolNameNumber) {
          this.school = this.schoolsCacheMap.get(newSchoolNameNumber);
          this.getUsersData();
          this.getSchoolSubmissions();
        }
      }
    }
  },
  created() {
    appStore().getConfig().then(() => {
      this.edxURL = this.config.EDX_URL;
    });
    authStore().getUserInfo().then(()=> {
      this.user = this.userInfo;
    });
    appStore().getInstituteCodes().finally(() => {
      this.schoolsCacheMap = this.schoolMap;
    });
  },
  methods: {
    formatPhoneNumber,
    findReportingPeriodStatus,
    getStatusColorGdcSession,
    openSchool(schoolId) {
      const routeData = this.$router.resolve({
        name: 'schoolDetails',
        params: { schoolID: schoolId }
      });
      window.open(routeData.href, '_blank');
    },
    getSchoolSubmissions() {
      const school = this.schoolsCacheMap.get(this.schoolNameNumber);
      if (!school) return;

      this.loading = true;

      ApiService.apiAxios.get(`${Routes.gdc.REPORTING_SUMMARY}/${this.collectionObject.reportingPeriodID}/school-submission-counts`, {
        params: {
          categoryCode: school.schoolCategoryCode,
        }
      })
        .then(response => {
          this.submissionsByCategory = response.data;
          this.updateSubmissionData(school.schoolID);
        }).catch(error => {
          console.error(error);
          this.setFailureAlert(error.response?.data?.message || error.message);
        }).finally(() => {
          this.loading = false;
        });
    },
    updateSubmissionData(schoolID) {
      if (!this.submissionsByCategory) return;

      const schoolYearData = this.submissionsByCategory.schoolSubmissions.find(s => s.schoolID === schoolID);
      if (schoolYearData) {
        this.schoolYearSubmissionCount = schoolYearData.submissionCount;
        this.schoolYearLastSubmission = schoolYearData.lastSubmissionDate.split('T')[0].replaceAll('-', '/');
      } else {
        this.schoolYearSubmissionCount = 0;
        this.schoolYearLastSubmission = null;
      }

      const summerData = this.submissionsByCategory.summerSubmissions.find(s => s.schoolID === schoolID);
      if (summerData) {
        this.summerSubmissionCount = summerData.submissionCount;
        this.summerLastSubmission = summerData.lastSubmissionDate.split('T')[0].replaceAll('-', '/');
      } else {
        this.summerSubmissionCount = 0;
        this.summerLastSubmission = null;
      }
    },
    getUsersData() {
      this.loadingUsers = true;
      ApiService.apiAxios.get(`${Routes.edx.EDX_SCHOOL_USERS_URL}/${this.schoolNameNumber}`)
        .then(response => {
          this.users =  this.sortUserData(response.data);
        })
        .catch(error => {
          console.error(error);
          this.setFailureAlert(error.response?.data?.message || error.message);
        })
        .finally(() => {
          this.loadingUsers = false;
        });
    },
    sortUserData(users){
      return users.sort((a, b) => {
        if (a.firstName > b.firstName) {
          return 1;
        } else if (a.firstName < b.firstName) {
          return -1;
        }
        return 0;
      } );
    },
    copyToClipboard(text) {
      navigator.clipboard.writeText(text).then(() => {
        setSuccessAlert('Email copied to clipboard');
      }).catch(err => {
        console.error('Could not copy text: ', err);
      });
    }
  }
};
</script>

<style scoped>
.subHeading {
  color: #38598a;
}
</style>
