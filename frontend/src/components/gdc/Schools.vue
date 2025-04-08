<template>
  <v-col cols="9">
    <h3 class="subHeading pb-1">
      Schools
    </h3>
    <p>Find a school expected to submit GRAD data.</p>
  </v-col>
  <v-col cols="9">
    <SchoolCodeNameFilter v-model="schoolNameNumber" />
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
            <th>Reporting Period</th>
            <th>Total Submissions</th>
            <th>Last Submission</th>
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
            <td />
            <td />
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
            <td />
            <td />
          </tr>
        </tbody>
      </v-table>
    </v-col>
    <v-col cols="9">
      <h3 class="subHeading pb-1">
        Graduation Administrator(s)
      </h3>
      <v-table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th />
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>name</td>
            <td>email</td>
            <td>
              <v-btn
                variant="text"
                icon="mdi-content-copy"
                color="#1a5a96"
                @click="console.log('todo copy')"
              />
            </td>
          </tr>
          <tr>
            <td>name</td>
            <td>email</td>
            <td>
              <v-btn
                variant="text"
                icon="mdi-content-copy"
                color="#1a5a96"
                @click="console.log('todo copy')"
              />
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-col>
  </div>
</template>

<script>
import SchoolCodeNameFilter from '@/components/common/SchoolCodeNameFilter.vue';
import { findReportingPeriodStatus, getStatusColorGdcSession } from '@/utils/institute/status';
import {appStore} from '@/store/modules/app';
import {authStore} from '@/store/modules/auth';
import {mapState} from 'pinia';
import ApiService from '@/common/apiService';
import {Routes} from '@/utils/constants';
import {formatPhoneNumber} from '@/utils/format';

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
      loading: null
    };
  },
  computed: {
    ...mapState(authStore, ['userInfo']),
    ...mapState(appStore, ['config']),
  },
  watch: {
    collectionObject: {
      handler(newCollection) {
        if (newCollection) {
          this.findReportingPeriodStatus();
        }
      },
      immediate: true
    },
    schoolNameNumber: {
      handler(newSchoolNameNumber) {
        if (newSchoolNameNumber) {
          this.getThisSchoolsDetails();
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
    getThisSchoolsDetails() {
      this.loading = true;
      this.school = '';

      ApiService.apiAxios.get(`${Routes.institute.SCHOOL_DATA_URL}/${this.schoolNameNumber}`)
        .then(response => {
          this.school = response.data;
        }).catch(error => {
          console.error(error);
          this.setFailureAlert(error.response?.data?.message || error.message);
        }).finally(() => {
          this.loading = false;
        });
    },
  }
};
</script>

<style scoped>
.subHeading {
  color: #38598a;
}
</style>
