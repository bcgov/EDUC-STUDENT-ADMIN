<template>
  <v-col cols="9">
    <h3 class="subHeading pb-1">
      Reporting Cycle
    </h3>
    <p>{{ formatDate(collectionObject?.schYrStart) }} - {{ formatDate(collectionObject?.summerEnd) }}</p>
  </v-col>
  <v-col cols="9">
    <h3 class="subHeading">
      Reporting Periods
    </h3>
    <v-row
      class="py-5 px-2"
      dense
      no-gutters
    >
      <v-col
        v-for="status in ['Pending Start', 'Ongoing', 'Complete']"
        :key="status"
        class="d-inline-flex"
        cols="auto"
      >
        <v-chip
          class="me-2 mb-2"
          :color="getStatusColorGdcSession(status)"
          variant="flat"
        >
          {{ status }}
        </v-chip>
      </v-col>
    </v-row>

    <v-table>
      <thead>
        <tr>
          <th
            class="text-left"
            scope="col"
          >
            Reporting Period
          </th>
          <th
            class="text-left"
            scope="col"
          >
            Open Date
          </th>
          <th
            class="text-left"
            scope="col"
          >
            Close Date
          </th>
          <th
            class="text-left"
            scope="col"
          >
            Action
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
          <td>{{ formatDate(collectionObject?.schYrStart) }}</td>
          <td>{{ formatDate(collectionObject?.schYrEnd) }}</td>
          <td>
            <v-btn
              variant="text"
              icon="mdi-pencil-outline"
              @click="openEditDialog('school')"
            />
          </td>
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
          <td>{{ formatDate(collectionObject?.summerStart) }}</td>
          <td>{{ formatDate(collectionObject?.summerEnd) }}</td>
          <td>
            <v-btn
              variant="text"
              icon="mdi-pencil-outline"
              @click="openEditDialog('summer')"
            />
          </td>
        </tr>
      </tbody>
    </v-table>
  </v-col>

  <v-dialog
    v-model="dialog"
    persistent
    max-width="500px"
  >
    <v-card>
      <v-card-title class="header">
        Edit {{ editMode === 'school' ? 'School Year' : 'Summer' }} Reporting Period
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12">
              <DatePicker
                v-model="editDates.start"
                label="Start Date"
                :model-type="'yyyy-MM-dd'"
                :allow-teleport="true"
              />
            </v-col>
            <v-col cols="12">
              <DatePicker
                v-model="editDates.end"
                label="End Date"
                :model-type="'yyyy-MM-dd'"
                :allow-teleport="true"
              />
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <PrimaryButton
          text="Cancel"
          secondary
          @click-action="dialog = false"
        />
        <PrimaryButton
          text="Save"
          @click-action="updateReportingDates"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
import ApiService from '@/common/apiService';
import {Routes} from '@/utils/constants';
import {formatDate} from '@/utils/format';
import DatePicker from '@/components/util/DatePicker.vue';
import PrimaryButton from '@/components/util/PrimaryButton.vue';
import {findReportingPeriodStatus, getStatusColorGdcSession} from '@/utils/institute/status';
import {setFailureAlert} from '@/components/composable/alertComposable';

export default {
  name: 'ReportingDates',
  components: {PrimaryButton, DatePicker},
  props: {
    collectionObject: {
      type: Object,
      required: false,
      default: null
    },
  },
  emits: ['update:collectionObject'],
  data() {
    return {
      dialog: false,
      editMode: '',
      editDates: {
        start: '',
        end: '',
      },
      panel1Status: '',
      panel2Status: '',
    };
  },
  watch: {
    collectionObject: {
      handler(value) {
        if(value) {
          this.findReportingPeriodStatus();
        }
      },
      immediate: true
    },
  },
  methods: {
    findReportingPeriodStatus,
    formatDate,
    getStatusColorGdcSession,
    openEditDialog(mode) {
      this.editMode = mode;
      if (mode === 'school') {
        this.editDates.start = this.collectionObject.schYrStart?.split('T')[0];
        this.editDates.end = this.collectionObject.schYrEnd?.split('T')[0];
      } else {
        this.editDates.start = this.collectionObject.summerStart?.split('T')[0];
        this.editDates.end = this.collectionObject.summerEnd?.split('T')[0];
      }
      this.dialog = true;
    },
    updateReportingDates() {
      const toISOStringWithTime = (dateStr) => {
        return `${dateStr}T00:00:00`;
      };

      if (this.editMode === 'school') {
        this.collectionObject.schYrStart = toISOStringWithTime(this.editDates.start);
        this.collectionObject.schYrEnd = toISOStringWithTime(this.editDates.end);
      } else {
        this.collectionObject.summerStart = toISOStringWithTime(this.editDates.start);
        this.collectionObject.summerEnd = toISOStringWithTime(this.editDates.end);
      }

      ApiService.apiAxios.put(`${Routes.gdc.REPORTING_PERIOD}`, this.collectionObject)
        .then(response => {
          this.$emit('update:collectionObject', response.data);
          this.dialog = false;
        })
        .catch(error => {
          setFailureAlert(error.response?.data?.message || error.message);
          console.error('Update failed:', error);
        });
    },
  }
};
</script>
<style scoped>
.subHeading {
  color: #38598a;
}
.header {
  background-color: #003366;
  color: white;
  font-size: medium !important;
  font-weight: bolder !important;
}
</style>
