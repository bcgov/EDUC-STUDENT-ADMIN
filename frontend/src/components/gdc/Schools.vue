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
        <v-col cols="auto">
          <v-btn variant="text">
            <v-icon
              icon="mdi-phone-outline"
              class="pe-2"
            />
            604-644-4444
          </v-btn>
        </v-col>
        <v-col cols="auto">
          <v-btn
            variant="text"
            color="#1a5a96"
          >
            <v-icon
              icon="mdi-school-outline"
              class="pe-2"
            />
            Graduation Dashboard
          </v-btn>
        </v-col>
        <v-col cols="auto">
          <v-btn
            variant="text"
            color="#1a5a96"
          >
            <v-icon
              icon="mdi-domain"
              class="pe-2"
            />
            School Details
          </v-btn>
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
    };
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
  },
  methods: {
    findReportingPeriodStatus,
    getStatusColorGdcSession
  }
};
</script>

<style scoped>
.subHeading {
  color: #38598a;
}
</style>
