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
          <th scope="col">
            Reporting Period
          </th>
          <th scope="col">
            Open Date
          </th>
          <th scope="col">
            Close Date
          </th>
          <th
            id="actionColumn"
            scope="col"
          />
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
              v-if="!isPrevious"
              variant="text"
              color="#1a5a96"
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
              v-if="!isPrevious"
              variant="text"
              color="#1a5a96"
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
                :min-date="editDates.min"
                :max-date="editDates.max"
              />
            </v-col>
            <v-col cols="12">
              <DatePicker
                v-model="editDates.end"
                label="End Date"
                :model-type="'yyyy-MM-dd'"
                :allow-teleport="true"
                :min-date="editDates.min"
                :max-date="editDates.max"
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
          :loading="saving"
          :disabled="saving"
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
import {setFailureAlert, setSuccessAlert} from '@/components/composable/alertComposable';

export default {
  name: 'ReportingDates',
  components: {PrimaryButton, DatePicker},
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
  emits: ['update:collectionObject'],
  data() {
    return {
      dialog: false,
      editMode: '',
      editDates: {
        start: '',
        end: '',
        min: '',
        max:  ''
      },
      panel1Status: '',
      panel2Status: '',
      saving: false,
    };
  },
  watch: {
    collectionObject: {
      handler(value) {
        if(value) {
          this.findReportingPeriodStatus();
          this.setDateBoundaries();
        }
      },
      immediate: true
    },
  },
  methods: {
    findReportingPeriodStatus,
    formatDate,
    getStatusColorGdcSession,
    setDateBoundaries() {

      const schYrStart = this.collectionObject.schYrStart.split('T')[0];
      const summerEnd = this.collectionObject.summerEnd.split('T')[0];

      const startYear = new Date(schYrStart).getFullYear();
      const endYear = new Date(summerEnd).getFullYear();

      this.editDates.min = `${startYear}-10-01`;
      this.editDates.max = `${endYear}-09-30`;
    },
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
      this.saving = true;

      const toISOStringWithTime = (dateStr) => `${dateStr}T00:00:00`;
      const start = this.editDates.start;
      const end = this.editDates.end;

      const schYrStart = this.collectionObject.schYrStart?.split('T')[0];
      const schYrEnd = this.collectionObject.schYrEnd?.split('T')[0];
      const summerStart = this.collectionObject.summerStart?.split('T')[0];
      const summerEnd = this.collectionObject.summerEnd?.split('T')[0];

      const cycleStart = `${new Date(schYrStart).getFullYear()}-10-01`;
      const cycleEnd = `${new Date(summerEnd).getFullYear()}-09-30`;

      if (!start || !end) {
        this.saving = false;
        setFailureAlert('Start and end dates are required.');
        return;
      }
      if (start > end) {
        this.saving = false;
        setFailureAlert('Start Date cannot be after End Date.');
        return;
      }
      if (start < cycleStart || end > cycleEnd) {
        this.saving = false;
        setFailureAlert(`Dates must be between ${cycleStart} and ${cycleEnd}.`);
        return;
      }

      if (this.editMode === 'school') {
        if (summerStart && summerEnd &&
            (this.isBetween(start, summerStart, summerEnd) || this.isBetween(end, summerStart, summerEnd))) {
          this.saving = false;
          setFailureAlert('School Year dates cannot overlap Summer period.');
          return;
        }
      } else if (this.editMode === 'summer') {
        if (schYrStart && schYrEnd &&
            (this.isBetween(start, schYrStart, schYrEnd) || this.isBetween(end, schYrStart, schYrEnd))) {
          this.saving = false;
          setFailureAlert('Summer dates cannot overlap School Year period.');
          return;
        }
      }

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
          setSuccessAlert('Success Updating Reporting Periods');
        })
        .catch(error => {
          setFailureAlert(error.response?.data?.message || error.message);
          console.error('Update failed:', error);
        })
        .finally(() => {
          this.saving = false;
        });
    },
    isBetween(date, min, max) {
      return date >= min && date <= max;
    }
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
