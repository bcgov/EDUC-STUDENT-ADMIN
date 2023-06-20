<template>
  <div id="sldHistory" class="px-0 pt-3 ma-0" style="width: 100%;">
    <v-row no-gutters>
      <v-col cols="11">
      <div id="studentInfo" class="px-1 pt-2 pb-5"><strong class="pr-3">{{ formatPen(student.pen) }}</strong>
        {{ getStudentName(student) }}
      </div>
      </v-col>
      <v-col cols="1">
        <CompareDemographicModal :clearOnExit="false" :disabled="isStudentUpdated || !PROCESS_STUDENT_ROLE" :selectedRecords.sync="compareStudent"></CompareDemographicModal>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <v-data-table
            class="sldTable"
            id="sldHistoryDataTable"
            :headers="headers"
            :items="sldData"
            :items-per-page="10"
            :loading="loading"
            no-data-text="No SLD history found"
            :hide-default-footer="sldData.length===0"
        >
          <template v-for="h in headers" v-slot:[`header.${h.value}`]="{ header }">
              <span :title="header.tooltip" :key="h.id" :class="{'file-column' : !header.countable}">
                {{ header.text }}
              </span>
          </template>
          <template v-slot:item="props">
            <tr>
              <td v-for="header in props.headers" :key="header.id" :class="[header.id, existSldUsualName(props.item)? 'two-rows-column' : 'one-row-column']">
                <div v-if="header.value === 'mincode'" :class="existSldUsualName(props.item)? 'flex-column-div' : 'flex-row-div'">
                  <span class="top-field-item">{{ props.item.distNo + props.item.schlNo }}</span>
                  <span v-if="existSldUsualName(props.item)" class="bottom-field-item"></span>
                </div>
                <div v-else-if="header.value === 'legalSurname'" :class="existSldUsualName(props.item)? 'flex-column-div' : 'flex-row-div'">
                  <span class="top-field-item">{{ props.item[header.value] }}</span>
                  <span v-if="existSldUsualName(props.item)" class="bottom-field-item">{{ props.item['usualSurname']}}</span>
                </div>
                <div v-else-if="header.value === 'legalGivenName'" :class="existSldUsualName(props.item)? 'flex-column-div' : 'flex-row-div'">
                  <span class="top-field-item">{{ props.item[header.value] }}</span>
                  <span v-if="existSldUsualName(props.item)" class="bottom-field-item">{{ props.item['usualGivenName']}}</span>
                </div>
                <div v-else-if="header.value === 'legalMiddleName'" :class="existSldUsualName(props.item)? 'flex-column-div' : 'flex-row-div'">
                  <span class="top-field-item">{{ props.item[header.value] }}</span>
                  <span v-if="existSldUsualName(props.item)" class="bottom-field-item">{{ props.item['usualMiddleName']}}</span>
                </div>
                <div v-else-if="header.value === 'birthDate'" :class="existSldUsualName(props.item)? 'flex-column-div' : 'flex-row-div'">
                  <span class="top-field-item">{{ formatDob(props.item[header.value],'uuuuMMdd','uuuu/MM/dd') }}</span>
                  <span v-if="existSldUsualName(props.item)" class="bottom-field-item"></span>
                </div>
                <div v-else :class="existSldUsualName(props.item)? 'flex-column-div' : 'flex-row-div'">
                  <span class="top-field-item">{{ props.item[header.value] }}</span>
                  <span v-if="existSldUsualName(props.item)" class="bottom-field-item"></span>
                </div>
              </td>
            </tr>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import {Routes} from '@/utils/constants';
import ApiService from '../../../common/apiService';
import alertMixin from '../../../mixins/alertMixin';
import {formatDob, formatMincode, formatPen, formatPostalCode} from '@/utils/format';
import CompareDemographicModal from '@/components/common/CompareDemographicModal';
import {mapState} from 'pinia';
import {sortArrayByDate} from '@/utils/common';
import {notificationsStore} from '@/store/modules/notifications';
import {authStore} from '@/store/modules/auth';

export default {
  name: 'StudentSLDHistory',
  mixins: [alertMixin],
  props: {
    student: {
      type: Object,
      required: true
    }
  },
  components: {
    CompareDemographicModal
  },
  data() {
    return {
      headers: [
        {text: 'Date', value: 'reportDate', key: 'date', sortable: false, tooltip: 'Activity Date'},
        {text: 'Mincode', value: 'mincode', key: 'mincode', sortable: false, tooltip: 'Mincode'},
        {text: 'Surname', value: 'legalSurname', key: 'surname', sortable: false, tooltip: 'Legal Surname'},
        {text: 'Given', value: 'legalGivenName', key: 'givenName', sortable: false, tooltip: 'Legal Given Name'},
        {text: 'Middle', value: 'legalMiddleName', key: 'middleName', sortable: false, tooltip: 'Legal Middle Name'},
        {text: 'Gen', value: 'sex', key: 'gender', sortable: false, tooltip: 'Gender'},
        {text: 'Birth Date', value: 'birthDate', key: 'dob', sortable: false, tooltip: 'Birth Date'},
        {text: 'Local ID', value: 'localStudentId', key: 'localId', sortable: false, tooltip: 'Local ID'},
        {text: 'Gr', value: 'enrolledGradeCode', key: 'grade', sortable: false, tooltip: 'Grade Code'},
        {text: 'Postal Code', value: 'postal', key: 'postalCode', sortable: false, tooltip: 'Postal Code'},
      ],
      loading: true,
      sldData: [],
      compareStudent: [],
      isStudentUpdated: false,
    };
  },
  computed:{
    ...mapState(notificationsStore, ['notification']),
    ...mapState(authStore, ['PROCESS_STUDENT_ROLE']),
  },
  watch: {
    notification(val) {
      if (val) {
        const notificationData = val;
        if (notificationData.eventType === 'UPDATE_STUDENT' && notificationData.eventOutcome === 'STUDENT_UPDATED' && notificationData.eventPayload) {
          try {
            const student = JSON.parse(notificationData.eventPayload);
            if (student?.pen && student?.pen === this.student?.pen) {
              this.isStudentUpdated = true;
              this.$emit('isStudentUpdated', true);
              const warningMessage = `Student details for ${student.pen} is updated by ${student.updateUser}, Please refresh the page.`;
              this.setWarningAlert(warningMessage);
              const studentID = student.studentID;
              this.addStaleDataToMap({studentID, warningMessage});
            }
          } catch (e) {
            console.error(e);
          }
        }
      }
    }
  },
  created() {
    this.compareStudent[0] = this.student;
    this.retrieveStudentSLDData();
  },

  methods: {
    formatPen,
    formatDob,
    formatMincode,
    formatPostalCode,
    sortArrayByDate,
    getStudentName(student) {
      return `${student.legalLastName ? student.legalLastName + ',' : ''} ${student.legalFirstName ? student.legalFirstName : ''} ${student.legalMiddleNames ? student.legalMiddleNames : ''}`;
    },
    retrieveStudentSLDData() {
      this.loading = true;
      ApiService.apiAxios
        .get(Routes['sld'].STUDENT_HISTORY_URL + '/', {params: {pen: this.student.pen}})
        .then(response => {
          if (response?.data?.length > 0) {
            this.sldData = this.sortArrayByDate(response.data, 'reportDate', false);
          }
        }).catch(error => {
          this.setFailureAlert('Could not retrieve data from API, Please try again later.');
          console.log(error);
        }).finally(() => {
          this.loading = false;
        });
    },
    existSldUsualName(sldData) {
      return !!sldData.usualSurname || !!sldData.usualGivenName || !!sldData.usualMiddleName;
    }
  }
};
</script>

<style scoped>
#sldHistoryDataTable /deep/ table {
  border-spacing: 0 0.25rem;
  border-bottom: thin solid #d7d7d7;
}
#sldHistoryDataTable /deep/ table th {
  font-size: 0.875rem;
}

#sldHistoryDataTable /deep/ table td {
  border-bottom: none !important;
}
#studentInfo {
  font-size: 1.25rem;
}

.sldTable /deep/ td.one-row-column {
  height: 3rem !important;
}
.sldTable /deep/ td.two-rows-column {
  height: 4.2rem !important;
}
.sldTable {
  font-size: 0.67rem;
}


.sldTable .flex-column-div {
  display: flex;
  flex-direction: column;
  height: 3rem !important;
}

.sldTable .top-field-item {
  margin: 0;
  padding: 0;
}

.sldTable .bottom-field-item {
  font-style: italic;
  margin: 0;
  padding: 0;
}

.flexBox {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;

  /*padding: 8px 12px;*/
}
.flexBox a {
  margin-top: 2px;
  margin-left: 12px;
}
</style>
