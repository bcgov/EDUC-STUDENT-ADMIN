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
      <AlertMessage v-model="searchError" :alertMessage="alertMessage" alertType="bootstrap-error"></AlertMessage>
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
          <v-checkbox dense class="sldCheckbox pa-0 ma-0" color="#606060"
                      v-model="checkedStudents[index]"
                      @change.native="validateMerge"></v-checkbox>
          <a @click="updateSldRowDisplay(students.pen, !sldDataTablesToDisplay[students.pen])">
            <v-icon small color="#1A5A96">{{sldDataTablesToDisplay[students.pen]?'fa-angle-down':'fa-angle-up'}}</v-icon>
          </a>
          <a @click="openStudentDetails(students.studentID)">
            {{ formatPen(students.pen) }}
          </a>
        </span>
        <span v-for="(key, index) in studentDataHeaders" :key="index" class="pl-4 pr-3" :ref="key+`Col`">
                <span v-if="key==='dob'" ref="dobText">
                  {{ formatDob(students[key].replaceAll('-','')) }}
                </span>
          <span v-else-if="key==='mincode'">{{ formatMincode(students[key]) }}</span>
          <span v-else-if="key==='postalCode'">{{ formatPostalCode(students[key]) }}</span>
          <span v-else>{{ students[key] }}</span>
        </span>
      </v-row>
      <v-row id="studentDemographicsTableBottomRow" class="studentDemographicsTable pb-2" no-gutters>
        <span class="px-4">
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
            <td v-for="header in props.headers" :key="header.id" :class="header.id">
              <v-checkbox dense v-if="header.type" class="sldCheckbox pa-0 ma-0" color="#606060"
                          @change="props.select($event)"></v-checkbox>
              <span v-if="header.value === 'mincode'">
                {{ props.item.distNo + ' ' + props.item.schlNo }}
              </span>
              <span v-else>
                {{ props.item[header.value] }}
              </span>
            </td>
          </tr>
        </template>
      </v-data-table>
      <v-row class="pl-4" v-show="sldDataTablesToDisplay[students.pen]">
        <TertiaryButton text="More" icon="$plus" @click.native="updateSldTableRows(students.pen, sldDataTablesNumberOfRows[students.pen] + 10)"></TertiaryButton>
        <TertiaryButton text="Less" icon="$minus" @click.native="updateSldTableRows(students.pen, sldDataTablesNumberOfRows[students.pen] - 10)"></TertiaryButton>
      </v-row>
    </div>
    <div v-if="selectedRecords && selectedRecords.length">
      <v-divider></v-divider>
      <v-card-actions class="px-0">
        <v-spacer></v-spacer>
        <slot name="actions" :clearError="clearError" :validateMerge="validateMerge" :merge="merge"></slot>
      </v-card-actions>
    </div>
  </v-card>
</template>

<script>
import { formatPen, formatDob, formatMincode, formatPostalCode } from '../../utils/format';
import PrimaryButton from '../util/PrimaryButton';
import ApiService from '../../common/apiService';
import {REQUEST_TYPES, Routes} from '../../utils/constants';
import { isValidPEN } from '../../utils/validation';
import AlertMessage from '../util/AlertMessage';
import router from '../../router';
import TertiaryButton from '../util/TertiaryButton';

export default {
  name: 'CompareDemographicsCommon',
  components: {
    TertiaryButton,
    AlertMessage,
    PrimaryButton
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
        {text: 'Surame', value: 'legalSurName', key: 'surname', sortable: false},
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
      alertMessage: 'Error! This student does not exist in the system.',
      sldData: {},
      sldDataTablesToDisplay: {},
      sldDataTablesNumberOfRows: {},
      checkedStudents: []
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
    openStudentDetails(studentID) {
      const route = router.resolve({ name: REQUEST_TYPES.student.label, params: {studentID: studentID}});
      window.open(route.href, '_blank');
    },
    removeRecord(studentID, index) {
      this.studentRecords = this.studentRecords.filter(item => item.studentID !== studentID);
      this.checkedStudents.splice(index, 1);
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
    getMergedFromPen() {
      return this.selectedRecords[0];
    },
    getMergedToPen() {
      return this.selectedRecords[1];
    },
    validateMerge() {
      let cnt = 0;
      this.checkedStudents.forEach(checked => cnt += checked? 1 : 0);
      return cnt !== 2;
    },
    merge() {
      router.push(
        {
          name: 'mergeStudents',
          params: {
            mergedToPen: this.getMergedToPen(),
            mergedFromPen: this.getMergedFromPen()
          }
        }
      );
    }
  }
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
  .sldCheckbox /deep/ .v-input--selection-controls__input {
    margin: 0;
  }
  .sldCheckbox /deep/ .v-messages {
    display: none;
  }
  .sldCheckbox /deep/ .v-input__slot {
    margin-bottom: 0;
    padding-top: 0;
  }
  .sldTable /deep/ td {
    height: 32px !important;
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
