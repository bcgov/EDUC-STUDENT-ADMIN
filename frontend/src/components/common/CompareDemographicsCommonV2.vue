<template>
  <v-card
    fluid
    class="px-4"
    elevation="0"
    style="overflow-y: auto;"
  >
    <MergeStudentsModal
      v-if="mergeStudentsModalOpen"
      :merge-students-modal-open="mergeStudentsModalOpen"
      :merged-to-student-i-d="mergedToStudentID"
      :merged-from-student-i-d="mergedFromStudentID"
      @merge-students-modal-open-emit="mergeStudentsModalOpenEmit"
    />
    <v-card-title class="px-0 py-5">
      <v-row>
        <v-col
          v-if="title"
          cols="2"
          class="pr-0 py-0"
        >
          {{ title }}
        </v-col>
        <v-col
          cols="2"
          class="py-0 pr-0"
        >
          <v-text-field
            id="enterAPenTxtField"
            v-model="penToAdd"
            variant="outlined"
            density="compact"
            label="Enter a PEN"
            maxlength="9"
            :disabled="studentRecords.length > 2"
            :rules="penRules"
            hide-details="auto"
            @keyup.enter="enterPushed()"
            @input="checkStudentStatusForValidPen()"
          />
        </v-col>
        <v-col
          class="py-0 pt-1"
          cols="5"
        >
          <PrimaryButton
            id="addPenBtn"
            :disabled=" isLoadingStudent || !isValidPEN(penToAdd) || studentRecords.length >= 3"
            :loading="isLoadingStudent"
            text="Add PEN"
            @click-action="addPEN"
          />
          <span
            v-if="isSearchedPENMerged"
            id="truePenMessage"
            class="pl-1"
            style="font-size: 1rem;"
          >{{
            truePenMessage
          }} <a
            :tabindex="0"
            @click="updateAddPen()"
            @keyup.enter="updateAddPen()"
          > {{
            truePen
          }}</a></span>
        </v-col>
        <v-col class="py-0">
          <v-btn
            v-if="closeCompareModal"
            id="closeCompareModalBtn"
            variant="flat"
            icon
            @click="[closeCompareModal(), clearError()]"
          >
            <v-icon
              large
              color="#38598A"
            >
              mdi-close
            </v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-card-title>
    <v-divider />
    <v-data-table class="sldTable pb-2">
      <template #default>
        <thead>
          <tr>
            <th
              v-for="(header, index) in headers"
              :id="`${header.text}Header`"
              :key="index"
              class="header-font"
              :title="header.tooltip"
            >
              {{ header.text }}
            </th>
          </tr>
        </thead>
      </template>
    </v-data-table>
    <div
      v-for="(students, index) in studentRecords"
      :key="index"
      class="pb-2"
    >
      <v-row
        id="studentDemographicsTableTopRow"
        class="studentDemographicsTable"
        no-gutters
      >
        <span class="pl-2 pr-0 flexBox">
          <div>
            <v-checkbox
              v-model="checkedStudents[index]"
              density="compact"
              class="bannerCheckbox pa-0 ma-0"
              hide-details="true"
              color="#606060"
              @update:model-value="validateAction"
            />
          </div>
          <a
            class="ml-2"
            @click="updateSldRowDisplay(students.pen, !sldDataTablesToDisplay[students.pen])"
          >
            <v-icon
              small
              :icon="sldDataTablesToDisplay[students.pen]?'mdi-chevron-down':'mdi-chevron-up'"
              color="#1A5A96"
            />
          </a>
          <a
            class="ml-1 pr-1"
            @click="openStudentDetails(students.studentID)"
          >
            {{ formatPen(students.pen) }}
          </a>
          <v-tooltip
            v-if="students['statusCode']==='M'"
            bottom
          >
            <template #activator="{ props }">
              <v-chip
                v-if="students['statusCode']==='M'"
                color="deep-purple"
                text-color="white"
                small
                class="px-2"
                v-bind="props"
              >M</v-chip>
            </template>
            <span>Merged to {{ students.truePen }}</span>
          </v-tooltip>
        </span>
        <span
          v-for="(key, idx) in studentDataHeaders"
          :key="idx"
          :ref="key+`Col`"
          class="pl-4 pr-3"
        >
          <span
            v-if="key==='dob'"
            ref="dobText"
          >
            {{ formatDob(students[key],'uuuu-MM-dd','uuuu/MM/dd') }}
          </span>
          <span v-else-if="key==='mincode'">{{ formatMincode(students[key]) }}</span>
          <span v-else-if="key==='postalCode'">{{ formatPostalCode(students[key]) }}</span>
          <span v-else>{{ students[key] }}</span>
        </span>
      </v-row>
      <v-row
        id="studentDemographicsTableBottomRow"
        class="studentDemographicsTable pb-2"
        no-gutters
      >
        <span class="pl-11">
          Demog Code: {{ students.demogCode }}
        </span>
        <span class="pl-4 pr-3" />
        <span class="pl-4 pr-3 bottom-field-item">{{ equalsIgnoreCase(students.legalLastName,students.usualLastName)? '' : students.usualLastName }}</span>
        <span class="pl-4 pr-3 bottom-field-item">{{ equalsIgnoreCase(students.legalFirstName, students.usualFirstName)? '' : students.usualFirstName }}</span>
        <span class="pl-4 pr-3 bottom-field-item">{{ equalsIgnoreCase(students.legalMiddleNames, students.usualMiddleNames)? '' : students.usualMiddleNames }}</span>
        <span class="pl-4 pr-3" />
        <span class="pl-4 pr-3" />
        <v-spacer />
        <a
          class="removePenLink pr-3"
          @click="removeRecord(students.studentID, index)"
        >
          <v-icon
            small
            color="#38598A"
          >mdi-close</v-icon>
          Remove Student
        </a>
      </v-row>
      <v-data-table
        v-if="sldDataTablesToDisplay[students.studentID]"
        class="sldTable"
        :headers="headers"
        :items="sldData[students.studentID]"
        :items-length="sldDataTablesNumberOfRows[students.studentID]"
        :items-per-page="sldDataTablesNumberOfRows[students.studentID]"
        @update:items-per-page="getSldData(students)"
      >
        <template #headers />
        <template #item="item">
          <tr>
            <td
              v-for="header in item.columns"
              :key="header.id"
              :class="[header.id, existSldUsualName(item.item.raw)? 'two-rows-column' : 'one-row-column']"
            >
              <v-checkbox
                v-if="header.type === 'select'"
                v-model="item.item.raw.selected"
                density="compact"
                class="studentCheckbox pa-0 ma-0"
                color="#606060"
                :disabled="sldSelectDisabled(students.studentID, existingMergedStudentIdsMap?.get(students.studentID)?.includes(item.item.raw.assignedStudentId))"
              />
              <div
                v-else-if="header.value === 'mincode'"
                :class="existSldUsualName(item.item.raw)? 'flex-column-div' : 'flex-row-div'"
              >
                <span class="top-field-item">{{ item.item.raw.mincode }}</span>
                <span
                  v-if="existSldUsualName(item.item.raw)"
                  class="bottom-field-item"
                />
              </div>
              <div
                v-else-if="header.value === 'legalLastName'"
                :class="existSldUsualName(item.item.raw)? 'flex-column-div' : 'flex-row-div'"
              >
                <span class="top-field-item">{{ item.item.raw[header.value] }}</span>
                <span
                  v-if="existSldUsualName(item.item.raw)"
                  class="bottom-field-item"
                >{{ item.item.raw['usualLastName'] }}</span>
              </div>
              <div
                v-else-if="header.value === 'legalFirstName'"
                :class="existSldUsualName(item.item.raw)? 'flex-column-div' : 'flex-row-div'"
              >
                <span class="top-field-item">{{ item.item.raw[header.value] }}</span>
                <span
                  v-if="existSldUsualName(item.item.raw)"
                  class="bottom-field-item"
                >{{ item.item.raw['usualFirstName'] }}</span>
              </div>
              <div
                v-else-if="header.value === 'legalMiddleNames'"
                :class="existSldUsualName(item.item.raw)? 'flex-column-div' : 'flex-row-div'"
              >
                <span class="top-field-item">{{ item.item.raw[header.value] }}</span>
                <span
                  v-if="existSldUsualName(item.item.raw)"
                  class="bottom-field-item"
                >{{ item.item.raw['usualMiddleNames'] }}</span>
              </div>
              <div
                v-else-if="header.value === 'dob'"
                :class="existSldUsualName(item.item.raw)? 'flex-column-div' : 'flex-row-div'"
              >
                <span class="top-field-item">{{ formatDob(item.item.raw[header.value],'uuuuMMdd','uuuu/MM/dd') }}</span>
                <span
                  v-if="existSldUsualName(item.item.raw)"
                  class="bottom-field-item"
                />
              </div>
              <div
                v-else-if="header.value === 'snapshotDate'"
                :class="existSldUsualName(item.item.raw)? 'flex-column-div' : 'flex-row-div'"
              >
                <span class="top-field-item">{{ formatDateFromDateTime(item.item.raw[header.value]) }}</span>
                <span v-if="existingMergedStudentIdsMap?.get(students.studentID)?.includes(item.item.raw.assignedStudentId)">
                  <v-tooltip
                    bottom
                  >
                    <template #activator="{ props }">
                      <v-chip
                        color="deep-purple"
                        text-color="white"
                        small
                        class="px-2"
                        v-bind="props"
                      >
                        M
                      </v-chip>
                    </template>
                    <span>Merged from {{ item.item.raw.assignedPen }}</span>
                  </v-tooltip>
                </span>
                <span
                  v-else-if="existSldUsualName(item.item.raw)"
                  class="bottom-field-item"
                />
              </div>
              <div
                v-else
                :class="existSldUsualName(item.item.raw)? 'flex-column-div' : 'flex-row-div'"
              >
                <span class="top-field-item">{{ item.item.raw[header.value] }}</span>
                <span
                  v-if="existSldUsualName(item.item.raw)"
                  class="bottom-field-item"
                />
              </div>
            </td>
          </tr>
        </template>
      </v-data-table>
      <v-row
        v-show="sldDataTablesToDisplay[students.studentID]"
        class="pl-4"
      >
        <TertiaryButton
          text="More"
          icon="$plus"
          @click-action="updateSldTableRows(students.studentID, sldDataTablesNumberOfRows[students.studentID] + 10)"
        />
        <TertiaryButton
          text="Less"
          icon="$minus"
          @click-action="updateSldTableRows(students.studentID, sldDataTablesNumberOfRows[students.studentID] - 10)"
        />
      </v-row>
    </div>
    <v-progress-linear
      indeterminate
      color="blue"
      :active="isProcessing"
    />
    <div v-if="selectedRecords && selectedRecords.length">
      <v-divider />
      <v-card-actions class="px-0">
        <v-spacer />
        <slot
          name="actions"
          :clear-error="clearError"
          :validate-action="validateAction"
          :disable-merge="disableMerge"
          :disable-demerge="disableDemerge"
          :disable-move-sld="disableMoveSld"
          :merge="merge"
          :demerge="demerge"
          :twin="twin"
          :move-sld-records="moveSldRecords"
        />
      </v-card-actions>
    </div>
    <ConfirmationDialog
      ref="confirmationDialog"
      :show-title-bar="false"
    >
      <template #message>
        <v-row class="mb-3">
          <v-col>
            <span>Are you sure you want to demerge PENs <strong>{{ getMergedFromPen() }}</strong> and <strong>{{ getMergedToPen() }}</strong>?</span>
          </v-col>
        </v-row>
      </template>
    </ConfirmationDialog>
    <ConfirmationDialog
      ref="moveSldConfirmationDialog"
      :show-title-bar="false"
    >
      <template #message>
        <v-row>
          <v-col>
            <span>Are you sure you want to move the selected SLD records from <strong>{{ movedFromStudent.pen }}</strong> to <strong>{{ movedToStudent.pen }}</strong></span>?
          </v-col>
        </v-row>
      </template>
    </ConfirmationDialog>
  </v-card>
</template>

<script>
import {formatDob, formatMincode, formatPen, formatPostalCode} from '@/utils/format';
import PrimaryButton from '../util/PrimaryButton.vue';
import ApiService from '../../common/apiService';
import {REQUEST_TYPES, Routes, STUDENT_CODES} from '@/utils/constants';
import {isValidPEN} from '@/utils/validation';
import alertMixin from '@/mixins/alertMixin';
import servicesSagaMixin from '@/mixins/servicesSagaMixin';
import router from '../../router';
import TertiaryButton from '../util/TertiaryButton.vue';
import {equalsIgnoreCase, getMatchedRecordsByStudent, sortArrayByDate} from '@/utils/common';
import ConfirmationDialog from '@/components/util/ConfirmationDialog.vue';
import { mapState } from 'pinia';
import MergeStudentsModal from '@/components/common/MergeStudentsModal.vue';
import staleStudentRecordMixin from '@/mixins/staleStudentRecordMixin';
import {notificationsStore} from '@/store/modules/notifications';
import {studentStore} from '@/store/modules/student';
import _ from 'lodash';
import {DateTimeFormatter, LocalDate} from '@js-joda/core';

export default {
  name: 'CompareDemographicsCommonV2',
  components: {
    TertiaryButton,
    PrimaryButton,
    ConfirmationDialog,
    MergeStudentsModal
  },
  mixins: [alertMixin, servicesSagaMixin, staleStudentRecordMixin],
  props: {
    selectedRecords: {
      type: Array,
      required: true
    },
    title: {
      type: String,
      default: ''
    },
    closeCompareModal: {
      type: Function,
      default: null
    }
  },
  emits: ['update:selectedRecords', 'refresh-sld-data'],
  data() {
    return {
      studentDataHeaders: [
        'mincode',
        'legalLastName',
        'legalFirstName',
        'legalMiddleNames',
        'genderCode',
        'dob',
        'localID',
        'gradeCode',
        'postalCode',
      ],
      headers: [
        { id: 'table-checkbox', type: 'select', key: 'checkbox', sortable: false },
        {text: 'Date', value: 'snapshotDate', key: 'snapshotDate', sortable: false, tooltip: 'Activity Date'},
        {text: 'Mincode', value: 'mincode', key: 'mincode', sortable: false, tooltip: 'Mincode'},
        {text: 'Surname', value: 'legalLastName', key: 'surname', sortable: false, tooltip: 'Legal Surname'},
        {text: 'Given', value: 'legalFirstName', key: 'givenName', sortable: false, tooltip: 'Legal Given Name'},
        {text: 'Middle', value: 'legalMiddleNames', key: 'middleName', sortable: false, tooltip: 'Legal Middle Name'},
        {text: 'Gen', value: 'gender', key: 'gender', sortable: false, tooltip: 'Gender'},
        {text: 'Birth Date', value: 'dob', key: 'dob', sortable: false, tooltip: 'Birth Date'},
        {text: 'Local ID', value: 'localID', key: 'localId', sortable: false, tooltip: 'Local ID'},
        {text: 'Gr', value: 'enrolledGradeCode', key: 'grade', sortable: false, tooltip: 'Grade Code'},
        {text: 'Postal Code', value: 'postalCode', key: 'postalCode', sortable: false, tooltip: 'Postal Code'},
      ],
      penToAdd: null,
      penRules: [v => (!v || isValidPEN(v)) || this.penHint],
      penHint: 'Invalid PEN',
      studentDNEErrorMessage: 'Error! This student does not exist in the system.',
      penAlreadyAddedErrorMessage: 'Pen already added to compare list.',
      fetchingStudentErrorMessage: 'Error occurred while fetching student, Please try again later.',
      sldData: {},
      storedSldData: {},
      sldDataTablesToDisplay: {},
      sldDataTablesNumberOfRows: {},
      checkedStudents: [],
      isStudentDataUpdated: false,
      isLoadingStudent: false,
      isSearchedPENMerged: false,
      studentDataMap: new Map(),
      mergeStudentsModalOpen: false,
      mergedToStudentID: '',
      mergedFromStudentID: '',
      movedFromStudent: {},
      movedToStudent: {},
      existingMergedStudentIdsMap: new Map()
    };
  },
  computed: {
    ...mapState(notificationsStore, ['notification']),
    studentRecords: {
      get: function() {
        return this.sortStudents(this.selectedRecords);
      },
      set: async function(value) {
        this.$emit('update:selectedRecords', value);
      }
    },
    checkedSldStudents() {
      return Object.values(this.sldData).flatMap(records => records.filter(record => record.selected));
    },
  },
  watch: {
    notification(val) {
      if (val) {
        const notificationData = val;
        if (notificationData.sagaName === 'PEN_SERVICES_STUDENT_DEMERGE_COMPLETE_SAGA' && this.sagaId === notificationData.sagaId && notificationData.studentID === this.mergedFromStudent?.studentID && notificationData.sagaStatus === 'COMPLETED') {
          this.notifyDemergeSagaCompleteMessage();
          // Open students in new tabs
          setTimeout(() => {
            this.openStudentDetails(this.mergedToStudent.studentID);
          }, 1000);
          setTimeout(() => {
            this.openStudentDetails(this.mergedFromStudent.studentID);
          }, 500);
        } else if (notificationData.eventType === 'UPDATE_STUDENT' && notificationData.eventOutcome === 'STUDENT_UPDATED' && notificationData.eventPayload) {
          this.showWarningAndDisableActionIfUpdatedStudentMatched(notificationData);
        }
      }
    },
  },
  mounted() {
    this.studentRecords.forEach(student => {
      this.getSldData(student);
      if(student.trueStudentID) {
        this.getTrueStudent(student, student.trueStudentID);
      }
    });
    this.checkedStudents = [];
  },
  methods: {
    ...mapState(studentStore, ['setStudentInProcessStatus', 'clearStudentInProcessStatus']),
    equalsIgnoreCase,
    sortStudents(array){
      return array.sort(this.sortStudentRecordsForCompare);
    },
    sortStudentRecordsForCompare(student1, student2){
      let student1digit = student1.pen.substring(0,1);
      let student2digit = student2.pen.substring(0,1);
      //Determine which is the oldest, which will be mergedToPen
      //If two PENs are merged and neither start with "1", or both start with "1" use the lowest number as the survivor
      //If two PENs are merged and one starts with "1" and other starts with something else, the other is the survivor
      if((student1digit == '1' && student2digit == '1') || (student1digit != '1' && student2digit != '1')) {
        return (student1.pen > student2.pen) ? 1 : -1;
      } else {
        return (student1.pen < student2.pen) ? 1 : -1;
      }
    },
    addPEN() {
      const isRecordAlreadyAdded = this.studentRecords.find(el => el.pen === this.penToAdd);
      if (isRecordAlreadyAdded) {
        this.setFailureAlert(this.penAlreadyAddedErrorMessage);
        return;
      }
      this.getSldData(this.studentDataMap.get(this.penToAdd));
      const student = this.studentDataMap.get(this.penToAdd);
      if (student) {
        this.studentRecords.push(student);
        this.studentRecords = _.sortBy(this.studentRecords, o => o.pen);
        this.penToAdd = null;
        this.truePenMessage = null;
        this.truePen = null;
        this.isSearchedPENMerged = false;
      } else {
        ApiService.apiAxios
          .get(Routes['student'].ROOT_ENDPOINT + '/', {params: {pen: this.penToAdd}})
          .then(response => {
            this.studentRecords.push(response.data);
            this.studentRecords = _.sortBy(this.studentRecords, o => o.pen);
          })
          .catch(error => {
            console.log(error);
            this.setFailureAlert(this.studentDNEErrorMessage);
          })
          .finally(() => {
            this.penToAdd = null;
          });
      }
    },
    clearError() {
      this.penToAdd = null;
    },
    enterPushed() {
      this.addPEN();
    },
    updateAddPen() {
      const isRecordAlreadyAdded = this.studentRecords.find(el => el.pen === this.truePen);
      if (isRecordAlreadyAdded) {
        this.setFailureAlert(this.penAlreadyAddedErrorMessage);
        return;
      }
      this.penToAdd = this.truePen;
      this.addPEN();
    },
    async checkStudentStatusForValidPen() {
      const isProceed = this.penToAdd && this.isValidPEN(this.penToAdd) && (!this.studentRecords || this.studentRecords?.length < 3);
      if (isProceed) {
        this.isLoadingStudent = true;
        this.truePenMessage = null;
        this.truePen = null;
        this.isSearchedPENMerged = false;
        try {
          const studentResponse = await ApiService.apiAxios
            .get(Routes['student'].ROOT_ENDPOINT + '/', {params: {pen: this.penToAdd}});
          const student = studentResponse.data;
          this.studentDataMap.set(student.pen, student);
          if (student.statusCode === STUDENT_CODES.MERGED) {
            const trueStudentResponse = await this.getTrueStudent(student, student.trueStudentID);
            this.studentDataMap.set(trueStudentResponse.data.pen, trueStudentResponse.data);
            this.truePenMessage = `${student.pen} is Merged to `;
            this.truePen = trueStudentResponse.data.pen;
            this.isSearchedPENMerged = true;
          }
        } catch (error) {
          if (error?.response?.status === 404 && error?.response?.data?.message) {
            this.setFailureAlert(this.studentDNEErrorMessage);
          } else {
            this.setFailureAlert(this.fetchingStudentErrorMessage);
          }
        } finally {
          this.isLoadingStudent = false;
        }
      } else {
        // reset values if the entered pen is removed
        this.truePenMessage = null;
        this.truePen = null;
        this.isSearchedPENMerged = false;
      }
    },
    formatDateFromDateTime(inputDate) {
      const date = LocalDate.parse(inputDate);
      return date.format(DateTimeFormatter.ofPattern('yyyy/MM/dd'));
    },
    formatDob,
    formatMincode,
    formatPostalCode,
    formatPen,
    sortArrayByDate,
    getMatchedRecordsByStudent,
    getSldData(student) {
      ApiService.apiAxios
        .get(Routes.penServices.ROOT_ENDPOINT + '/' + student?.studentID + '/student-merge',
          {
            params: {
              mergeDirection: 'FROM'
            }
          })
        .then(response => {
          this.existingMergedStudentIdsMap.set(student?.studentID, response.data.map(studentMerges => studentMerges.mergeStudentID));
          ApiService.apiAxios
            .get(Routes.sdc.SDC_SCHOOL_COLLECTION_STUDENT + '/byAssignedStudentID', {
              params: {
                pageNumber: 0,
                pageSize: this.pageSize,
                sort: {
                  'sdcSchoolCollection.collectionEntity.snapshotDate': 'DESC'
                },
                assignedStudentID: [...this.existingMergedStudentIdsMap.get(student?.studentID), student?.studentID],
                tableFormat: true
              }
            })
            .then(response => {
              if (response?.data?.length > 0) {
                response.data.forEach(sld => sld.selected = false);
              }
              this.storedSldData[student?.studentID] = response.data?.content;
              this.updateSldRowDisplay(student?.studentID, true);
              this.updateSldTableRows(student?.studentID, 10);
            })
            .catch(error => {
              console.log(error);
              this.setFailureAlert(this.studentDNEErrorMessage);
            });
        })
        .catch(error => {
          console.log(error);
          this.setFailureAlert(this.studentDNEErrorMessage);
        });
    },
    async getTrueStudent(student, trueStudentID) {
      const trueStudent = await ApiService.apiAxios.get(Routes['student'].ROOT_ENDPOINT + '/demographics/' + trueStudentID);
      student.truePen = trueStudent.data.pen;
      return trueStudent;
    },
    isValidPEN,
    existSldUsualName(sldData) {
      return !!sldData.usualSurname || !!sldData.usualGivenName || !!sldData.usualMiddleName;
    },
    openStudentDetails(studentID) {
      const route = router.resolve({ name: REQUEST_TYPES.student.label, params: {studentID: studentID}});
      window.open(route.href, '_blank');
    },
    removeRecord(studentID, index) {
      const student = this.studentRecords.find(item => item.studentID === studentID);
      this.studentRecords = this.studentRecords.filter(item => item.studentID !== studentID);
      this.checkedStudents = this.checkedStudents.filter((item, idx) => idx !== index);
      this.validateAction();
      this.updateSldRowDisplay(student.pen, false);
      this.resetSldSelection();
    },
    updateSldRowDisplay(id, value) {
      this.sldDataTablesToDisplay[id] = value;
    },
    updateSldTableRows(id, value) {
      if(value < 0) {
        value = 0;
      } else if(value > this.storedSldData[id]?.length) {
        value = this.storedSldData[id]?.length;
      }
      this.sldDataTablesNumberOfRows[id] = value;

      if(value === 0){
        this.sldData[id] = [];
      }else{
        this.sldData[id] = this.storedSldData[id].slice(0, value);
      }
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
    disableMoveSld() {
      return this.isProcessing || this.checkedSldStudents.length <= 0;
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
      let warningMessage = this.getWarningMessage();
      if (warningMessage) {
        this.setWarningAlert(warningMessage);
        return;
      }
      // Determine which is the oldest, which will be mergedToPen
      let student = selectedStudents[0];
      let twinStudent = selectedStudents[1];

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
          matchReasonCode: 'MINISTRY',
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
      let warningMessage = this.getWarningMessage();
      if (warningMessage) {
        this.setWarningAlert(warningMessage);
        return;
      }

      let student1digit = selectedStudents[0].pen.substring(0,1);
      let student2digit = selectedStudents[1].pen.substring(0,1);

      // Determine which is the oldest, which will be mergedToPen
      //If two PENs are merged and neither start with "1", or both start with "1" use the lowest number as the survivor
      //If two PENs are merged and one starts with "1" and other starts with something else, the other is the survivor
      if((student1digit == '1' && student2digit == '1') || (student1digit != '1' && student2digit != '1')) {
        [this.mergedToStudent, this.mergedFromStudent] = _.sortBy(selectedStudents, ['pen']);
      } else {
        [this.mergedFromStudent, this.mergedToStudent ] = _.sortBy(selectedStudents, ['pen']);
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

      // open the merge student / pen modal and the following two values are its props
      this.mergeStudentsModalOpen = true;
      this.mergedToStudentID = this.mergedToStudent.studentID;
      this.mergedFromStudentID = this.mergedFromStudent.studentID;
    },
    async demerge() {
      const selectedStudents = this.getSelectedStudents();
      let warningMessage = this.getWarningMessage();
      if (warningMessage) {
        this.setWarningAlert(warningMessage);
        return;
      }
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
    },
    async moveSldRecords() {
      let warningMessage = this.getWarningMessage();
      if (warningMessage) {
        this.setWarningAlert(warningMessage);
        return;
      }

      this.movedFromStudent = this.studentRecords.find(student => this.checkedSldStudents.some(record => record.assignedStudentId === student.studentID));
      this.movedToStudent = this.studentRecords.find(student => student.pen !== this.movedFromStudent.pen);

      let result = await this.$refs.moveSldConfirmationDialog.open(null, null,
        {color: '#fff', width: 580, closeIcon: true, dark: false, resolveText: 'Move'});
      if (!result) {
        return;
      }

      this.isProcessing = true;

      const moveSldRequest = {
        sdcSchoolCollectionIdsToUpdate: this.checkedSldStudents.map(record => record.sdcSchoolCollectionStudentID),
        toStudentPen: this.movedToStudent?.pen
      };
      ApiService.apiAxios
        .post(Routes['sdc'].BASE_URL + '/move-sld', moveSldRequest)
        .then(() => {
          this.notifyMoveCompleteMessage();
        })
        .catch(error => {
          console.log(error);
          this.isProcessing = false;
          if (error?.response?.status === 409 && error?.response?.data?.message) {
            this.setFailureAlert(error?.response?.data?.message);
          } else {
            this.setFailureAlert('Your request to move sld records could not be accepted, please try again later.');
          }
        });
    },
    showWarningAndDisableActionIfUpdatedStudentMatched(notificationData){
      try {
        const student = JSON.parse(notificationData.eventPayload);
        if (student?.pen &&  !this.isProcessing && this.studentRecords?.some(el => el?.pen === student.pen)) {
          this.isStudentDataUpdated = true;
          const warningMessage = `Student details for ${student.pen} is updated by ${student.updateUser}, Please refresh the page.`;
          this.setWarningAlert(warningMessage);
          const studentID = student.studentID;
          this.addStaleDataToMap({studentID, warningMessage});
        }
      } catch (e) {
        console.error(e);
      }
    },
    mergeStudentsModalOpenEmit(value) {
      this.mergeStudentsModalOpen = value;
    },
    getWarningMessage() {
      let warningMessage;
      for (const stud of this.getSelectedStudents()) {
        warningMessage = this.getMessageForStudent(stud.studentID);
        if (warningMessage) {
          break;
        }
      }
      return warningMessage;
    },
    sldSelectDisabled(assignedStudentID, isMergedSldRecord) {
      const isMergedOrDeceased = this.studentRecords.some(student => student.statusCode === STUDENT_CODES.MERGED || student.statusCode === STUDENT_CODES.DECEASED);
      return this.isProcessing || this.studentRecords.length !== 2 || isMergedOrDeceased || this.checkedSldStudents.some(record => !record.assignedStudentId.startsWith(assignedStudentID)) || isMergedSldRecord;
    },
    resetSldSelection(){
      this.checkedSldStudents.forEach(record => record.selected = false);
    },
    notifyMoveCompleteMessage() {
      this.setSuccessAlert('Success! Your request to move sld records is completed.');
      this.isProcessing = false;
      this.studentRecords.forEach(student => {
        this.getSldData(student);
      });
      this.resetSldSelection();
      this.$emit('refresh-sld-data');
    },
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

  .header-font {
    font-size: 0.9em;
    font-weight: bold !important;
  }

  .sldTable :deep(.one-row-column) {
    height: 32px !important;
  }
  .sldTable :deep(.two-rows-column) {
    height: 42px !important;
  }
  .studentDemographicsTable a {
    color: #1A5A96;
  }
  .studentDemographicsTable {
    background-color: #eeeeee;
    font-size: 0.875rem;
    color: rgba(0, 0, 0, 1);
  }
  .studentDemographicsTable :deep(.bottom-field-item) {
    font-style: italic;
  }

  #studentDemographicsTableTopRow > span:nth-child(1) {
    vertical-align: top;
    padding-top: 6px;
    width: 15%;
  }

  #studentDemographicsTableTopRow > span:nth-child(9),
  #studentDemographicsTableTopRow > span:nth-child(6) {
    vertical-align: top;
    padding-top: 6px;
    width: 5%;
  }
  #studentDemographicsTableTopRow > span:nth-child(2),
  #studentDemographicsTableTopRow > span:nth-child(8) {
    vertical-align: top;
    padding-top: 6px;
    width: 10%;
  }
  #studentDemographicsTableTopRow > span:nth-child(10) {
    vertical-align: top;
    padding-top: 6px;
    text-align: right;
    width: 9%;
  }
  #studentDemographicsTableTopRow > span:nth-child(7) {
    vertical-align: top;
    padding-top: 6px;
    width: 10%;
  }
  #studentDemographicsTableTopRow > span:nth-child(3),
  #studentDemographicsTableTopRow > span:nth-child(4),
  #studentDemographicsTableTopRow > span:nth-child(5) {
    vertical-align: top;
    padding-top: 6px;
    width: 12%;
  }

  #studentDemographicsTableBottomRow /deep/ span:nth-child(1) {
    vertical-align: top;
    width: 15%;
  }
  #studentDemographicsTableBottomRow /deep/ span:nth-child(2) {
    vertical-align: top;
    width: 10%;
  }
  #studentDemographicsTableBottomRow /deep/ span:nth-child(6) {
    vertical-align: top;
    width: 5%;
  }
  #studentDemographicsTableBottomRow /deep/ span:nth-child(7) {
    vertical-align: top;
    width: 10%;
  }
  #studentDemographicsTableBottomRow /deep/ span:nth-child(3),
  #studentDemographicsTableBottomRow /deep/ span:nth-child(4),
  #studentDemographicsTableBottomRow /deep/ span:nth-child(5) {
    vertical-align: top;
    width: 12%;
  }

  .sldTable {
    font-size: 0.9rem;
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
  .sldTable /deep/ tr th:nth-child(7),
  .sldTable /deep/ tr th:nth-child(10),
  .sldTable /deep/ tr td:nth-child(1),
  .sldTable /deep/ tr td:nth-child(7),
  .sldTable /deep/ tr td:nth-child(10) {
    width: 5%;
  }
  .sldTable /deep/ tr th:nth-child(9),
  .sldTable /deep/ tr th:nth-child(8),
  .sldTable /deep/ tr th:nth-child(3),
  .sldTable /deep/ tr th:nth-child(2),
  .sldTable /deep/ tr td:nth-child(9),
  .sldTable /deep/ tr td:nth-child(8),
  .sldTable /deep/ tr td:nth-child(3)
   {
    width: 10%;
  }
  .sldTable /deep/ tr td:nth-child(2)
  {
    width: 10%;
  }
  .sldTable /deep/ tr th:nth-child(11),
  .sldTable /deep/ tr td:nth-child(11){
    width: 10%;
    text-align: right !important;
    padding-right: 12px;
  }
  .sldTable /deep/ tr th:nth-child(4),
  .sldTable /deep/ tr th:nth-child(5),
  .sldTable /deep/ tr th:nth-child(6),
  .sldTable /deep/ tr td:nth-child(4),
  .sldTable /deep/ tr td:nth-child(5),
  .sldTable /deep/ tr td:nth-child(6) {
    width: 12%;
  }

  .studentCheckbox :deep(.v-input__details){
      display: none;
  }

  .bannerCheckbox :deep(.v-input__control){
      height: 24px !important;
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

  :deep(.v-data-table-footer){
      display: none;
  }
</style>
