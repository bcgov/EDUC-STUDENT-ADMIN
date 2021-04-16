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
      <v-row>
        <AlertMessage v-model="alert" :alertMessage="alertMessage" :alertType="alertType"
                      :timeoutMs="3000"></AlertMessage>
      </v-row>
      <v-row no-gutters justify="end">
        <v-col class="mt-4">
          <span id="twins-number" class="px-4"><strong>{{ possibleMatches.length }} Twins</strong></span>
        </v-col>
        <v-col class="mt-2">
          <v-row justify="end" class="mx-3">
            <TertiaryButton :disabled="selectedTwins.length < 1" id="deleteButton" class="ma-0" text="Delete"
                            icon="mdi-delete" @click.native="deleteTwinStudent"></TertiaryButton>
          </v-row>
        </v-col>
      </v-row>
      <v-data-table
          id="details-table"
          :headers="headers"
          :items="possibleMatchItems"
          :page.sync="pageNumber"
          :items-per-page="itemsPerPage"
          show-select
          hide-default-footer
          item-key="possibleMatchID"
          v-model="selectedTwins"
      >
        <template v-slot:[`item.pen`]="props">
          <a @click="viewStudentDetails(props.item.matchedStudentID)">
            {{ props.value }}
          </a>
        </template>
        <template v-slot:[`item.matchedReason`]="props">
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <span v-on="on">{{ props.value }}</span>
            </template>
            <span>{{ matchReasonLabel(props.value) }}</span>
          </v-tooltip>
        </template>
      </v-data-table>
      <v-row class="pt-2" justify="end">
        <v-col cols="4">
          <v-pagination color="#38598A" v-model="pageNumber" :length="totalPages"
                        class="twins-pagination"></v-pagination>
        </v-col>
        <v-col cols="4" id="currentItemsDisplay">
          Showing {{ showingFirstNumber }} to {{ showingEndNumber }} of {{ possibleMatches.length }}
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
import TertiaryButton from '../../util/TertiaryButton';
import {mapActions, mapGetters} from 'vuex';
import moment from 'moment';
import {sortBy} from 'lodash';
import ApiService from '../../../common/apiService';
import {REQUEST_TYPES, Routes} from '@/utils/constants';
import {formatPen} from '@/utils/format';
import router from '@/router';
import alertMixin from '@/mixins/alertMixin';
import AlertMessage from '../../util/AlertMessage';

export default {
  name: 'TwinnedStudentsCard',
  mixins: [alertMixin],
  components: {
    TertiaryButton: TertiaryButton,
    AlertMessage
  },
  props: {
    student: {
      type: Object,
      required: true
    },
    possibleMatches: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      selectedTwins: [],
      isTwinSelected: false,
      pageNumber: 1,
      itemsPerPage: 15,
      headers: [
        {text: 'PEN', align: 'start', sortable: false, value: 'pen', topTable: true},
        {text: 'Legal Name', value: 'legalName', sortable: false, topTable: true},
        {text: 'Birth Date', value: 'dob', sortable: false, topTable: true},
        {text: 'Gender', value: 'genderCode', sortable: false, topTable: true},
        {text: 'Twinned', value: 'matchedDate', sortable: false},
        {text: 'Reason', value: 'matchedReason', sortable: false},
      ],
    };
  },
  computed: {
    ...mapGetters('student', ['possibleMatchReasons']),
    topTableHeaders() {
      return this.headers.filter(header => header.topTable);
    },
    currentStudent() {
      return this.formatStudent(this.student);
    },
    possibleMatchItems() {
      return sortBy(this.possibleMatches, ['matchedStudent.pen']).map(possibleMatch => ({
        ...this.formatStudent(possibleMatch.matchedStudent),
        matchedDate: this.formatDateTime(possibleMatch.createDate),
        matchedReason: possibleMatch.matchReasonCode,
        possibleMatchID: possibleMatch.possibleMatchID,
        matchedStudentID: possibleMatch.matchedStudentID,
        studentID: possibleMatch.studentID,
        createUser: possibleMatch.createUser,
        updateUser: possibleMatch.updateUser
      }));
    },
    totalPages() {
      return Math.floor((this.possibleMatches.length - 1) / this.itemsPerPage) + 1;
    },
    showingFirstNumber() {
      return ((this.pageNumber - 1) * this.itemsPerPage + 1);
    },
    showingEndNumber() {
      return this.pageNumber < this.totalPages ? (this.pageNumber * this.itemsPerPage) : this.possibleMatches.length;
    }
  },
  created() {
    if (!this.possibleMatchReasons) {
      this.getPossibleMatchReasonCodes();
    }
  },
  methods: {
    ...mapActions('student', ['getPossibleMatchReasonCodes']),
    formatDateTime(date) {
      return moment(JSON.stringify(date), 'YYYY-MM-DDTHH:mm:ss').format('YYYY/MM/DD');
    },
    formatStudent(student) {
      return {
        pen: formatPen(student.pen),
        legalName: `${student.legalLastName || ''}, ${student.legalFirstName || ''} ${student.legalMiddleNames || ''}`,
        dob: this.formatDateTime(student.dob),
        genderCode: student.genderCode
      };
    },
    matchReasonLabel(code) {
      const reason = this.possibleMatchReasons && this.possibleMatchReasons.find(v => v.matchReasonCode === code);
      return reason && reason.label || code;
    },
    deleteTwinStudent() {
      const payload = this.selectedTwins.map(element => {
        return {
          studentID: element.studentID,
          matchedStudentID: element.matchedStudentID,
          matchReasonCode: element.matchedReason,
          createUser:element.createUser,
          updateUser:element.updateUser
        };
      });
      ApiService.apiAxios
        .post(Routes['penMatch'].POSSIBLE_MATCHES + '/bulk-delete', payload)
        .then(() => {
          this.selectedTwins.forEach(element => {
            let foundElement = this.possibleMatches.find(o => o.possibleMatchID === element.possibleMatchID);
            this.possibleMatches.splice(this.possibleMatches.indexOf(foundElement), 1);
          });
          this.selectedTwins = [];
          this.setSuccessAlert('Selected twin records deleted successfully.');
        })
        .catch(error => {
          console.error(error);
          this.setFailureAlert('Selected twin records could not be deleted, Please try again.');
        });

    },
    viewStudentDetails(studentID) {
      const route = router.resolve({name: REQUEST_TYPES.student.label, params: {studentID: studentID}});
      window.open(route.href, '_blank');
    },
  }
};
</script>

<style scoped>
#currentItemsDisplay {
  text-align: right;
  font-size: 0.875rem;
}

/deep/ tr.v-data-table__selected {
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

#details-table /deep/ table th:nth-child(3) {
  width: 25%;
}

#details-table /deep/ table th:nth-child(4) {
  width: 15%;
}

#details-table /deep/ table th:nth-child(5) {
  width: 11%;
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
