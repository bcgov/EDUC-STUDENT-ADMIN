<template>
  <v-card fluid class="px-4" elevation="0">
    <v-card-title class="px-0 pb-0">
      <v-row>
        <v-col v-if="title" cols="2" class="pr-0">
          {{ title }}
        </v-col>
        <v-col cols="2" class="pb-0 pr-0">
          <v-text-field
                  id="enterAPenTxtField"
                  v-model="penToAdd"
                  outlined
                  dense
                  label="Enter a PEN"
                  @keyup.enter="enterPushed()"
                  maxlength="9"
                  :rules="penRules"
          ></v-text-field>
        </v-col>
        <v-col cols="1" class="pb-0">
          <PrimaryButton id="addPenBtn" :disabled="!isValidPEN(penToAdd) || studentRecords.length >= 3" text="Add PEN" @click.native="addPEN"></PrimaryButton>
        </v-col>
        <v-col class="pt-0">
          <v-btn v-if="closeCompareModal" id="closeCompareModalBtn" text icon @click="[closeCompareModal(), clearError()]">
            <v-icon large color="#38598A">mdi-close</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-card-title>
    <v-row>
      <AlertMessage v-model="searchError" :alertMessage="errorMessage" alertType="bootstrap-error"></AlertMessage>
    </v-row>
    <v-divider></v-divider>
    <v-simple-table class="sldTable pb-2">
      <template v-slot:default>
        <thead>
        <tr>
          <th v-for="(header, index) in headers" :key="index" :id="`${header.text}Header`">
            {{ header.text }}
          </th>
        </tr>
        </thead>
      </template>
    </v-simple-table>
    <div v-for="(students, index) in studentRecords" :key="index" class="pb-2">
      <v-row id="studentDemographicsTableTopRow" class="studentDemographicsTable" no-gutters>
        <span class="px-2 flexBox">
          <v-checkbox dense class="studentCheckbox pa-0 ma-0" color="#606060"
                      v-model="checkedStudents[index]"
                      @change.native="validateAction"></v-checkbox>
          <a @click="updateSldRowDisplay(students.pen, !sldDataTablesToDisplay[students.pen])">
            <v-icon small color="#1A5A96">{{sldDataTablesToDisplay[students.pen]?'fa-angle-down':'fa-angle-up'}}</v-icon>
          </a>
          <a @click="openStudentDetails(students.studentID)">
            {{ formatPen(students.pen) }}
          </a>
        </span>
        <span v-for="(key, index) in studentDataHeaders" :key="index" class="pl-4 pr-3" :ref="key+`Col`">
                <span v-if="key==='dob'" ref="dobText">
                  {{ formatDob(students[key],'uuuu-MM-dd','uuuu/MM/dd') }}
                </span>
          <span v-else-if="key==='mincode'">{{ formatMincode(students[key]) }}</span>
          <span v-else-if="key==='postalCode'">{{ formatPostalCode(students[key]) }}</span>
          <span v-else>{{ students[key] }}</span>
        </span>
      </v-row>
      <v-row id="studentDemographicsTableBottomRow" class="studentDemographicsTable pb-2" no-gutters>
        <span class="pl-11">
          Demog Code: {{ students.demogCode }}
        </span>
        <v-spacer></v-spacer>
        <a class="removePenLink pr-3" @click="removeRecord(students.studentID, index)">
            <v-icon small color="#38598A">mdi-close</v-icon>
            Remove PEN
        </a>
      </v-row>
      <v-data-table v-show="sldDataTablesToDisplay[students.pen]"
              class="sldTable"
              :headers="headers"
              :items="sldData[students.pen]"
              :items-per-page="sldDataTablesNumberOfRows[students.pen]"
              hide-default-header
              hide-default-footer>
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
      <v-row class="pl-4" v-show="sldDataTablesToDisplay[students.pen]">
        <TertiaryButton text="More" icon="$plus" @click.native="updateSldTableRows(students.pen, sldDataTablesNumberOfRows[students.pen] + 10)"></TertiaryButton>
        <TertiaryButton text="Less" icon="$minus" @click.native="updateSldTableRows(students.pen, sldDataTablesNumberOfRows[students.pen] - 10)"></TertiaryButton>
      </v-row>
    </div>
    <v-row>
      <AlertMessage v-model="alert" :alertMessage="alertMessage" :alertType="alertType"></AlertMessage>
    </v-row>
    <v-progress-linear
        indeterminate
        color="blue"
        :active="isProcessing"
    ></v-progress-linear>
    <div v-if="selectedRecords && selectedRecords.length">
      <v-divider></v-divider>
      <v-card-actions class="px-0">
        <v-spacer></v-spacer>
        <slot name="actions" :clearError="clearError" :validateAction="validateAction" :disableMerge="disableMerge" :disableDemerge="disableDemerge" :merge="merge"  :demerge="demerge" :twin="twin"></slot>
      </v-card-actions>
    </div>
    <ConfirmationDialog ref="confirmationDialog">
      <template v-slot:message>
        <v-col class="mt-n6">
          <v-row class="mb-3">
            Are you sure you want to demerge PENs&nbsp;<strong>{{getMergedFromPen()}}</strong>&nbsp;and&nbsp;<strong>{{getMergedToPen()}}</strong>?
          </v-row>
        </v-col>
      </template>
    </ConfirmationDialog>
  </v-card>
</template>

<script>
import { formatPen, formatDob, formatMincode, formatPostalCode } from '../../utils/format';
import PrimaryButton from '../util/PrimaryButton';
import ApiService from '../../common/apiService';
import {REQUEST_TYPES, Routes} from '../../utils/constants';
import { isValidPEN, isOlderThan } from '../../utils/validation';
import AlertMessage from '../util/AlertMessage';
import alertMixin from '@/mixins/alertMixin';
import servicesSagaMixin from '@/mixins/servicesSagaMixin';
import router from '../../router';
import TertiaryButton from '../util/TertiaryButton';
import {getMatchedRecordsByStudent} from '@/utils/common';
import ConfirmationDialog from '@/components/util/ConfirmationDialog';
import {mapGetters} from 'vuex';

export default {
  name: 'CompareDemographicsCommon',
  mixins: [alertMixin,servicesSagaMixin],
  components: {
    TertiaryButton,
    AlertMessage,
    PrimaryButton,
    ConfirmationDialog
  },
  props: {
    selectedRecords: {
      type: Array,
      required: true
    },
    title: {
      type: String
    },
    closeCompareModal: {
      type: Function,
      default: null
    }
  },
  watch: {
    notification(val) {
      if (val) {
        const notificationData = JSON.parse(val);
        if (notificationData && notificationData.studentID && notificationData.studentID === this.mergedFromStudent.studentID && notificationData.sagaStatus === 'COMPLETED') {
          if (notificationData.sagaName === 'PEN_SERVICES_STUDENT_DEMERGE_COMPLETE_SAGA') {
            this.notifyDemergeSagaCompleteMessage();
            // Open students in new tabs
            setTimeout(() => {
              this.openStudentDetails(this.mergedToStudent.studentID);
            }, 1000);
            setTimeout(() => {
              this.openStudentDetails(this.mergedFromStudent.studentID);
            }, 500);
          }
        }
      }
    },
  },
  data() {
    return {
      studentDataHeaders: [
        'gradeCode',
        'mincode',
        'localID',
        'legalLastName',
        'legalFirstName',
        'legalMiddleNames',
        'genderCode',
        'postalCode',
        'dob'
      ],
      headers: [
        { id: 'table-checkbox', type: 'select', sortable: false },
        {text: 'Date', value: 'reportDate', key: 'date', sortable: false},
        {text: 'Gr', value: 'enrolledGradeCode', key: 'grade', sortable: false},
        {text: 'Mincode', value: 'mincode', key: 'mincode', sortable: false},
        {text: 'Local ID', value: 'localStudentId', key: 'localId', sortable: false},
        {text: 'Surame', value: 'legalSurname', key: 'surname', sortable: false},
        {text: 'Given', value: 'legalGivenName', key: 'givenName', sortable: false},
        {text: 'Middle', value: 'legalMiddleName', key: 'middleName', sortable: false},
        {text: 'Gen', value: 'sex', key: 'gender', sortable: false},
        {text: 'Postal Code', value: 'postal', key: 'postalCode', sortable: false},
        {text: 'Birth Date', value: 'birthDate', key: 'dob', sortable: false}
      ],
      penToAdd: null,
      searchError: false,
      penRules: [ v => (!v || isValidPEN(v)) || this.penHint],
      penHint: 'Invalid PEN',
      errorMessage: 'Error! This student does not exist in the system.',
      sldData: {},
      sldDataTablesToDisplay: {},
      sldDataTablesNumberOfRows: {},
      checkedStudents: [],
    };
  },
  mounted() {
    _.sortBy(this.selectedRecords, o => o.pen);
    this.studentRecords.forEach(student => {
      this.getSldData(student.pen);
    });
    this.checkedStudents = [];
  },
  computed: {
    ...mapGetters('notifications', ['notification']),
    studentRecords: {
      get: function() {
        return _.sortBy(this.selectedRecords, o => o.pen);
      },
      set: async function(value) {
        this.$emit('update:selectedRecords', value);
      }
    }
  },
  methods: {
    addPEN() {
      this.alert = false;
      this.searchError = false;
      this.getSldData(this.penToAdd);
      ApiService.apiAxios
        .get(Routes['student'].ROOT_ENDPOINT + '/', { params: { pen: this.penToAdd } })
        .then(response => {
          this.studentRecords.push(response.data);
          this.studentRecords = _.sortBy(this.studentRecords, o => o.pen);
        })
        .catch(error => {
          console.log(error);
          this.searchError = true;
        })
        .finally(() => {
          this.penToAdd = null;
        });
    },
    clearError() {
      this.searchError = false;
      this.penToAdd = null;
      this.alert = false;
    },
    enterPushed() {
      if (this.penToAdd && this.isValidPEN(this.penToAdd) && (!this.studentRecords || this.studentRecords?.length<3)) {
        this.addPEN();
      }
    },
    formatDob,
    formatMincode,
    formatPostalCode,
    formatPen,
    getMatchedRecordsByStudent,
    getSldData(pen) {
      ApiService.apiAxios
        .get(Routes['sld'].STUDENT_HISTORY_URL + '/', { params: { pen: pen } })
        .then(response => {
          this.$set(this.sldData, pen, response.data);
          this.updateSldRowDisplay(pen, true);
          this.updateSldTableRows(pen, 10);
        })
        .catch(error => {
          console.log(error);
          this.searchError = true;
        });
    },
    isValidPEN,
    isOlderThan,
    existSldUsualName(sldData) {
      if (!!sldData.usualSurname || !!sldData.usualGivenName || !!sldData.usualMiddleName) {
        return true;
      }
      return false;
    },
    openStudentDetails(studentID) {
      const route = router.resolve({ name: REQUEST_TYPES.student.label, params: {studentID: studentID}});
      window.open(route.href, '_blank');
    },
    removeRecord(studentID, index) {
      this.studentRecords = this.studentRecords.filter(item => item.studentID !== studentID);
      this.checkedStudents = this.checkedStudents.filter((item, idx) => idx !== index);
      this.validateAction();
    },
    updateSldRowDisplay(id, value) {
      this.$set(this.sldDataTablesToDisplay, id, value);
    },
    updateSldTableRows(id, value) {
      if(value < 0) {
        value = 0;
      } else if(value > this.sldData[id]?.length) {
        value = this.sldData[id]?.length;
      }
      this.$set(this.sldDataTablesNumberOfRows, id, value);
    },
    validateAction() {
      let cnt = 0;
      this.checkedStudents.forEach(checked => cnt += checked ? 1 : 0);
      return cnt !== 2;
    },
    disableMerge() {
      if (this.validateAction()) {
        return true;
      }

      const selectedStudents = this.getSelectedStudents();
      if (selectedStudents.length === 2) {
        return this.validateStudentsAreMerged(selectedStudents[0], selectedStudents[1]);
      }
      return true;
    },
    disableDemerge() {
      if (this.isProcessing || this.demergeSagaComplete) {
        return true;
      }
      if (this.validateAction()) {
        return true;
      }

      const selectedStudents = this.getSelectedStudents();
      if (selectedStudents.length === 2) {
        return !this.validateStudentsAreMerged(selectedStudents[0], selectedStudents[1]);
      }
      return true;
    },
    validateTwinRecordsExist(studentID, twinStudentID) {
      return getMatchedRecordsByStudent(studentID)
        .then(data => {
          if (data && data.length > 0) {
            const twin = data.find(item => item.matchedStudentID === twinStudentID || item.studentID === twinStudentID);
            if (twin) {
              this.setFailureAlert('Error! Records are already twinned.');
              return true;
            }
          }
          return false;
        })
        .catch(error => {
          this.setFailureAlert('An error occurred while loading the possible matches in twin validation. Please try again later.');
          console.log(error);
          return true;  // set true to make the validation failed
        });
    },
    getSelectedStudents() {
      return this.checkedStudents.map((checked, idx) => {
        if (!checked) {
          return false;
        } else {
          return this.studentRecords[idx];
        }
      }).filter(item => !!item);
    },
    async twin() {
      const selectedStudents = this.getSelectedStudents();

      this.alert = false;
      this.searchError = false;

      // Determine which is the oldest, which will be mergedToPen
      let student = selectedStudents[0];
      let twinStudent =  selectedStudents[1];

      // Same Pen validation
      if (this.validateStudentsHaveSamePen(student, twinStudent,
        'Error! PENs cannot be twinned, as same PENs are selected.')) {
        return;
      }
      // Status validation
      if (this.validateStudentIsStatusOfMerged(student, twinStudent,
        'Error! PENs cannot be twinned, as one of the PENs has a status of merged.')) {
        return;
      }
      // Twins validation
      const hasAnyTwins = await this.validateTwinRecordsExist(student.studentID, twinStudent.studentID);
      if (hasAnyTwins) {
        return;
      }

      const twinRequests = [
        {
          studentID: student.studentID,
          matchedStudentID: twinStudent.studentID,
          matchReasonCode: 'MI',
        }
      ];

      return ApiService.apiAxios
        .post(Routes['penMatch'].POSSIBLE_MATCHES, twinRequests)
        .then(() => {
          this.setSuccessAlert('Success! The two records have been twinned.');
        })
        .catch(error => {
          this.setFailureAlert('An error occurred while saving twinned students. Please try again later.');
          console.log(error);
        });
    },
    async merge() {
      const selectedStudents = this.getSelectedStudents();

      this.alert = false;
      this.searchError = false;

      // Determine which is the oldest, which will be mergedToPen
      if (this.isOlderThan(selectedStudents[0].createDate, selectedStudents[1].createDate)) {
        this.mergedToStudent = selectedStudents[0];
        this.mergedFromStudent = selectedStudents[1];
      } else {
        this.mergedToStudent = selectedStudents[1];
        this.mergedFromStudent = selectedStudents[0];
      }

      // Same Pen validation
      if (this.validateStudentsHaveSamePen(this.mergedToStudent, this.mergedFromStudent,
        'Error! PENs cannot be merged, as same PENs are selected.')) {
        return;
      }
      // Status validation
      if (this.validateStudentIsStatusOfMerged(this.mergedToStudent, this.mergedFromStudent,
        'Error! PENs cannot be merged, as one of the PENs has a status of merged.')) {
        return;
      }
      // Merge validation
      const hasAnyMergedFrom = await this.validateStudentHasAnyMergedFrom(this.mergedFromStudent.studentID);
      if (hasAnyMergedFrom) {
        return;
      }

      await router.push(
        {
          name: 'mergeStudents',
          params: {
            mergedToPen: this.mergedToStudent,
            mergedFromPen: this.mergedFromStudent
          }
        }
      );
    },
    async demerge() {
      const selectedStudents = this.getSelectedStudents();

      this.alert = false;
      this.searchError = false;

      if (selectedStudents[0].statusCode === 'M') { // This check is enough as validateDemerge is performed before.
        this.mergedFromStudent = selectedStudents[0];
        this.mergedToStudent = selectedStudents[1];
      } else {
        this.mergedFromStudent = selectedStudents[1];
        this.mergedToStudent = selectedStudents[0];
      }

      let result = await this.$refs.confirmationDialog.open(null, null,
        {color: '#fff', width: 580, closeIcon: true, dark: false, rejectText: 'No'});
      if (!result) {
        return;
      }
      await this.executeDemerge();
    }
  },
};
</script>

<style scoped>
  #addPenBtn {
    height: 2.858em;
  }
  #closeCompareModalBtn {
    float: right;
  }
  .paginatedButtons {
    color: #38598A;
  }
  .studentCheckbox /deep/ .v-input--selection-controls__input {
    margin: 0;
  }
  .studentCheckbox /deep/ .v-messages {
    display: none;
  }
  .studentCheckbox /deep/ .v-input__slot {
    margin-bottom: 0;
    padding-top: 0;
  }
  .sldTable /deep/ td.one-row-column {
    height: 32px !important;
  }
  .sldTable /deep/ td.two-rows-column {
    height: 42px !important;
  }
  .studentDemographicsTable a {
    color: #1A5A96;
  }
  .studentDemographicsTable {
    background-color: #eeeeee;
    font-size: 0.75rem;
    font-weight: bold;
    color: rgba(0, 0, 0, 0.6);
  }
  #studentDemographicsTableTopRow /deep/ span:nth-child(1) {
    vertical-align: top;
    padding-top: 6px;
    width: 15%;
  }

  #studentDemographicsTableTopRow /deep/ span:nth-child(2),
  #studentDemographicsTableTopRow /deep/ span:nth-child(8) {
    vertical-align: top;
    padding-top: 6px;
    width: 5%;
  }
  #studentDemographicsTableTopRow /deep/ span:nth-child(3),
  #studentDemographicsTableTopRow /deep/ span:nth-child(4) {
    vertical-align: top;
    padding-top: 6px;
    width: 10%;
  }
  #studentDemographicsTableTopRow /deep/ span:nth-child(9) {
    vertical-align: top;
    padding-top: 6px;
    width: 9%;
  }
  #studentDemographicsTableTopRow /deep/ span:nth-child(10) {
    vertical-align: top;
    padding-top: 6px;
    text-align: right;
    width: 10%;
  }
  #studentDemographicsTableTopRow /deep/ span:nth-child(5),
  #studentDemographicsTableTopRow /deep/ span:nth-child(6),
  #studentDemographicsTableTopRow /deep/ span:nth-child(7) {
    vertical-align: top;
    padding-top: 6px;
    width: 12%;
  }

  .sldTable {
    font-size: 0.67rem;
  }

  .sldTable .flex-row-div {
    height: 21px !important;
  }

  .sldTable .flex-column-div {
    display: flex;
    flex-direction: column;
    height: 42px !important;
  }

  .sldTable .top-field-item {
    margin: 0px;
    padding: 0px;
  }

  .sldTable .bottom-field-item {
    font-style: italic;
    margin: 0px;
    padding: 0px;
  }

  .sldTable /deep/ tr th:nth-child(1),
  .sldTable /deep/ tr th:nth-child(3),
  .sldTable /deep/ tr th:nth-child(9),
  .sldTable /deep/ tr td:nth-child(1),
  .sldTable /deep/ tr td:nth-child(3),
  .sldTable /deep/ tr td:nth-child(9) {
    width: 5%;
  }
  .sldTable /deep/ tr th:nth-child(2),
  .sldTable /deep/ tr th:nth-child(4),
  .sldTable /deep/ tr th:nth-child(5),
  .sldTable /deep/ tr th:nth-child(10),
  .sldTable /deep/ tr td:nth-child(2),
  .sldTable /deep/ tr td:nth-child(4),
  .sldTable /deep/ tr td:nth-child(5)
   {
    width: 10%;
  }
  .sldTable /deep/ tr td:nth-child(10)
  {
    width: 9%;
  }
  .sldTable /deep/ tr th:nth-child(11),
  .sldTable /deep/ tr td:nth-child(11){
    width: 10%;
    text-align: right !important;
    padding-right: 12px;
  }
  .sldTable /deep/ tr th:nth-child(6),
  .sldTable /deep/ tr th:nth-child(7),
  .sldTable /deep/ tr th:nth-child(8),
  .sldTable /deep/ tr td:nth-child(6),
  .sldTable /deep/ tr td:nth-child(7),
  .sldTable /deep/ tr td:nth-child(8) {
    width: 12%;
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
