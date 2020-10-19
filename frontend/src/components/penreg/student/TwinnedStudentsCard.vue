<template>
  <v-card height="100%">
    <v-list-item>
      <v-list-item-content>
        <v-list-item-title class="headline">Twinned Students</v-list-item-title>
      </v-list-item-content>
      <v-list-item-icon>
        <v-btn text icon @click="$emit('close')">
          <v-icon color="#38598A" class="px-0">mdi-close</v-icon>
        </v-btn>
      </v-list-item-icon>
    </v-list-item>
    <v-card-text class="px-3 py-2 text--primary">
      <v-row no-gutters>
        <v-col no-gutters cols="9">
          <v-data-table
            id="top-table"
            :headers="topTableHeaders"
            :items="[currentStudent]"
            hide-default-footer
            dense
          ></v-data-table>
        </v-col>
      </v-row>
      <v-divider class="mt-2"></v-divider>
      <v-row no-gutters justify="end">
        <v-col class="mt-4">
          <span id="twins-number" class="px-4"><strong>{{ twins.length }} Twins</strong></span>
        </v-col>
        <v-col class="mt-2">
          <v-row justify="end" class="mx-3">
            <TertiaryButton :disabled="selectedTwins.length < 1" id="deleteButton" class="ma-0" text="Delete" icon="mdi-delete" @click.native="deleteTwinStudent" ></TertiaryButton>
          </v-row>
        </v-col>
      </v-row>
      <v-data-table
        id="details-table"
        :headers="headers"
        :items="twinItems"
        :page.sync="pageNumber"
        :items-per-page="itemsPerPage"
        show-select
        hide-default-footer
        item-key="twinID"
        v-model="selectedTwins"
      >
        <template v-slot:[`item.pen`]="props">
          <a>
            {{props.value}}
          </a>
        </template>
        <template v-slot:[`item.twinReason`]="props">
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <span v-on="on">{{props.value}}</span>
            </template>
            <span>{{twinReasonLabel(props.value)}}</span>
          </v-tooltip>
        </template>
      </v-data-table>
      <v-row class="pt-2" justify="end">
        <v-col cols="4">
          <v-pagination color="#38598A" v-model="pageNumber" :length="totalPages" class="twins-pagination"></v-pagination>
        </v-col>
        <v-col cols="4" id="currentItemsDisplay">
          Showing {{ showingFirstNumber }} to {{ showingEndNumber }} of {{ twins.length }}
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
import TertiaryButton from '../../util/TertiaryButton';
import {mapGetters, mapActions} from 'vuex';
import moment from 'moment';
import {sortBy} from 'lodash';
import ApiService from '../../../common/apiService';
import { Routes } from '../../../utils/constants';
import {formatPen} from '../../../utils/format';

export default {
  name: 'TwinnedStudentsCard',
  components: {
    TertiaryButton: TertiaryButton
  },
  props: {
    student: {
      type: Object,
      required: true
    },
    twins: {
      type: Array,
      required: true
    }
  },
  data () {
    return {
      selectedTwins: [],
      isTwinSelected: false,
      pageNumber: 1,
      itemsPerPage: 15,
      headers: [
        { text: 'PEN', align: 'start', sortable: false, value: 'pen', topTable: true},
        { text: 'Legal Name', value: 'legalName', sortable: false, topTable: true },
        { text: 'Birth Date', value: 'dob', sortable: false, topTable: true },
        { text: 'Gen', value: 'genderCode', sortable: false, topTable: true },
        { text: 'Twinned', value: 'twinDate', sortable: false },
        { text: 'Reason', value: 'twinReason', sortable: false },
      ],
    };
  },
  computed: {
    ...mapGetters('student', ['twinReasons']),
    topTableHeaders() {
      return this.headers.filter(header => header.topTable);
    },
    currentStudent() {
      return this.formatStudent(this.student);
    },
    twinItems() {
      return sortBy(this.twins, ['twinStudent.pen']).map(twinItem => ({
        ...this.formatStudent(twinItem.twinStudent),
        twinDate: this.formatDateTime(twinItem.createDate),
        twinReason: twinItem.studentTwinReasonCode,
        twinID: twinItem.studentTwinID,
        twinStudentID: twinItem.twinStudentID
      }));
    },
    totalPages() {
      return Math.floor((this.twins.length - 1) / this.itemsPerPage) + 1;
    },
    showingFirstNumber() {
      return ((this.pageNumber - 1) * this.itemsPerPage + 1);
    },
    showingEndNumber() {
      return this.pageNumber < this.totalPages ? (this.pageNumber * this.itemsPerPage) : this.twins.length;
    }
  },
  created() {
    if(!this.twinReasons) {
      this.getTwinReasonCodes();
    }
  },
  methods: {
    ...mapActions('student', ['getTwinReasonCodes']),
    formatDateTime(date) {
      return moment(JSON.stringify(date), 'YYYY-MM-DDTHH:mm:ss').format('YYYY-MM-DD');
    },
    formatStudent(student) {
      return {
        pen: formatPen(student.pen),
        legalName: `${student.legalLastName||''}, ${student.legalFirstName||''} ${student.legalMiddleNames||''}`,
        dob: this.formatDateTime(student.dob),
        genderCode: student.genderCode
      };
    },
    twinReasonLabel(code) {
      const reason = this.twinReasons && this.twinReasons.find(v => v.twinReasonCode === code);
      return reason && reason.label || code;
    },
    deleteTwinStudent() {
      this.selectedTwins.forEach(element => {
        ApiService.apiAxios
          .delete(Routes['student'].ROOT_ENDPOINT + '/' + this.student.studentID + '/twins/' + element.twinID)
          .catch(error => {
            console.log(error);
          })
          .finally(() => {
            this.twins.splice(this.twins.indexOf(element));
          });
      });
    }
  }
};
</script>

<style scoped>
  #currentItemsDisplay {
    text-align: right;
    font-size: 0.875rem;
  }
  ::v-deep tr.v-data-table__selected {
    background: #dff4fd !important;
  }
  .twins-pagination /deep/ .v-pagination__navigation > i {
    padding-left: 0;
  }

  #top-table /deep/ table th:nth-child(1) {
    width: 21%;
  }
  #top-table /deep/ table th:nth-child(3),
  #top-table /deep/ table th:nth-child(4) {
    width: 20%;
  }

  #top-table /deep/ table th:nth-child(2) {
    width: 39%;
  }

  #top-table /deep/ table th { 
    border-bottom: none !important;
    font-size: 0.875rem;
    font-weight: normal;
    color: rgba(0, 0, 0, 0.87) !important;
  }

  #top-table /deep/ table td { 
    cursor: default;
    font-weight: bold;
  }

  #top-table /deep/ table > tbody > tr:hover {
    background: transparent !important;
  }

  #details-table /deep/ table {
    table-layout: fixed;
    width: 100%;
  }

  #details-table /deep/ table th:nth-child(1) {
     width: 5%;
  }
  #details-table /deep/ table th:nth-child(2) {
    width: 16%;
  }
  #details-table /deep/ table th:nth-child(3){
    width: 25%;
  }
  #details-table /deep/ table th:nth-child(4) {
    width: 15%;
  }
  #details-table /deep/ table th:nth-child(5){
    width: 8%;
  }
  #details-table /deep/ table th:nth-child(6) {
    width: 15%;
  }
  #details-table /deep/ table th:nth-child(7) {
    width: 18%;
  }

  #details-table /deep/ table > tbody > tr:not(:last-child) > td { 
    border-bottom: none !important;
  }

  #details-table /deep/ table > thead > tr:last-child > th,
  #details-table /deep/ table > tbody > tr:last-child > td {
    border-bottom: thin solid black;
  }

  #details-table /deep/ table th { 
    font-size: 0.875rem;
    color: rgba(0, 0, 0, 0.87) !important;
  }

  #details-table /deep/ table > tbody > tr { 
    cursor: pointer;
  }
  #details-table /deep/ table > tbody > tr > td {
    height: 32px;
  }
  .v-divider {
    display: block;
    flex: 1 1 0;
    max-width: 100%;
    height: 0;
    max-height: 0;
    border: 0 solid black;
    border-top-width: medium;
    transition: inherit;
  }
</style>
