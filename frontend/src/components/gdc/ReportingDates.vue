<template>
  <v-col cols="9">
    <h3 class="subHeading pb-1">
      Reporting Cycle
    </h3>
    <p>{{ formatDate(collectionObject?.periodStart) }} - {{ formatDate(collectionObject?.periodEnd) }}</p>
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
              v-if="!isPrevious && hasWritePermission()"
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
              v-if="!isPrevious && hasWritePermission()"
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
    <v-card style="overflow: visible">
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
                :min-date="editDates.min"
                :max-date="editDates.max"
              />
            </v-col>
            <v-col cols="12">
              <DatePicker
                v-model="editDates.end"
                label="End Date"
                :model-type="'yyyy-MM-dd'"
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
import {hasRequiredPermission, PERMISSION} from '@/utils/constants/Permission';
import {mapState} from 'pinia';
import {authStore} from '@/store/modules/auth';

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
  computed:{
    ...mapState(authStore, ['userInfo']),
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
    hasWritePermission() {
      return this.hasRequiredPermission(this.userInfo, PERMISSION.EDIT_GRAD_DATA_COLLECTION_PERMISSION);
    },
    hasRequiredPermission,
    updateReportingDates() {
      this.saving = true;

      const toISOStringWithTime = (dateStr) => `${dateStr}T00:00:00`;

      const payload = { ...this.collectionObject };

      if (this.editMode === 'school') {
        payload.schYrStart = toISOStringWithTime(this.editDates.start);
        payload.schYrEnd = toISOStringWithTime(this.editDates.end);
      } else {
        payload.summerStart = toISOStringWithTime(this.editDates.start);
        payload.summerEnd = toISOStringWithTime(this.editDates.end);
      }

      ApiService.apiAxios.put(`${Routes.gdc.REPORTING_PERIOD}`, payload)
        .then(response => {
          this.$emit('update:collectionObject', response.data);
          this.dialog = false;
          setSuccessAlert('Success Updating Reporting Periods');
        })
        .catch(error => {
          const validationErrors = error.response?.data?.reportingPeriodValidationErrors;
          if (Array.isArray(validationErrors)) {
            validationErrors.forEach(e => setFailureAlert(`${e.field}: ${e.message}`));
            console.error('Update Failed: Failed validations:', error?.response?.data?.reportingPeriodValidationErrors);
          } else {
            setFailureAlert(error.response?.data?.message || error.message);
            console.error('Update Failed:', error);
          }
        })
        .finally(() => {
          this.saving = false;
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
