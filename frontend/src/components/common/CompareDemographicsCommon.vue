<template>
  <v-card fluid class="px-4" elevation="0">
    <v-card-title class="px-0">
      <slot name="title"></slot>
    </v-card-title>
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
    <div v-for="(students, index) in studentRecords" :key="index">
      <v-row id="studentDemographicsTableTopRow" class="studentDemographicsTable" no-gutters>
        <span class="px-4">
          <a>
            <v-icon small color="#1A5A96">fa-angle-down</v-icon>
            {{ formatPen(students.pen) }}
          </a>
        </span>
        <span v-for="(key, index) in studentDataHeaders" :key="index" class="pl-4 pr-3">
                <span v-if="key==='dob'">
                  {{ formatDob(students[key].replaceAll('-','')) }}
                </span>
          <span v-else-if="key==='mincode'">{{ formatMinCode(students[key]) }}</span>
          <span v-else-if="key==='postalCode'">{{ formatPostalCode(students[key]) }}</span>
          <span v-else>{{ students[key] }}</span>
        </span>
      </v-row>
      <v-row id="studentDemographicsTableBottomRow" class="studentDemographicsTable pb-2" no-gutters>
        <span class="px-4">
          Demog Code: {{ students.demogCode }}
        </span>
        <v-spacer></v-spacer>
        <a class="px-4" @click="removeRecord(students.studentID)">
            <v-icon small color="#38598A">mdi-close</v-icon>
            Remove PEN
        </a>
      </v-row>
      <!--
      SLD Data table will go here
      give v-data-table the class "sldTable", and v-checkbox the class "sldCheckbox", so that the columns line up correctly.
      Also, this.headers will have to be updated to have the correct "value"s once the sldData payload is known
      JohnC has a sample table that is a good place to start from
      -->
    </div>
  </v-card>
</template>

<script>
import { formatPen, formatDob, formatMinCode, formatPostalCode } from '../../utils/format';
export default {
  name: 'CompareDemographicsCommon',
  props: {
    selectedRecords: {
      type: Array,
      required: true
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
        {text: 'Date', value: 'date', key: 'date', sortable: false},
        {text: 'Gr', value: 'grade', key: 'grade', sortable: false},
        {text: 'Mincode', value: 'mincode', key: 'mincode', sortable: false},
        {text: 'Local ID', value: 'localId', key: 'localId', sortable: false},
        {text: 'Surame', value: 'surname', key: 'surname', sortable: false},
        {text: 'Given', value: 'givenName', key: 'givenName', sortable: false},
        {text: 'Middle', value: 'middleName', key: 'middleName', sortable: false},
        {text: 'Gen', value: 'gender', key: 'gender', sortable: false},
        {text: 'Postal Code', value: 'postalCode', key: 'postalCode', sortable: false},
        {text: 'Birth Date', value: 'dob', key: 'dob', sortable: false}
      ]
    };
  },
  computed: {
    studentRecords: {
      get: function() {
        return _.sortBy(this.selectedRecords, o => o.pen);
      },
      set: function(value) {
        this.$emit('update:selectedRecords', value);
      }
    }
  },
  methods: {
    formatDob,
    formatMinCode,
    formatPostalCode,
    formatPen,
    removeRecord(studentID) {
      this.studentRecords = this.studentRecords.filter(item => item.studentID !== studentID);
    }
  }
};
</script>

<style scoped>

  .sldCheckbox /deep/ .v-input--selection-controls__input {
    margin: 0;
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
  #studentDemographicsTableTopRow /deep/ span:nth-child(4),
  #studentDemographicsTableTopRow /deep/ span:nth-child(9),
  #studentDemographicsTableTopRow /deep/ span:nth-child(10) {
    vertical-align: top;
    padding-top: 6px;
    width: 10%;
  }
  #studentDemographicsTableTopRow /deep/ span:nth-child(5),
  #studentDemographicsTableTopRow /deep/ span:nth-child(6),
  #studentDemographicsTableTopRow /deep/ span:nth-child(7) {
    vertical-align: top;
    padding-top: 6px;
    width: 11.66%;
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
  .sldTable /deep/ tr th:nth-child(11),
  .sldTable /deep/ tr td:nth-child(2),
  .sldTable /deep/ tr td:nth-child(4),
  .sldTable /deep/ tr td:nth-child(5),
  .sldTable /deep/ tr td:nth-child(10),
  .sldTable /deep/ tr td:nth-child(11) {
    width: 10%;
  }
  .sldTable /deep/ tr th:nth-child(6),
  .sldTable /deep/ tr th:nth-child(7),
  .sldTable /deep/ tr th:nth-child(8),
  .sldTable /deep/ tr td:nth-child(6),
  .sldTable /deep/ tr td:nth-child(7),
  .sldTable /deep/ tr td:nth-child(8) {
    width: 11.66%;
  }
</style>
