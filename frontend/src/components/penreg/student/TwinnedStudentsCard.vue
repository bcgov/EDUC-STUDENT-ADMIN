<template>
  <v-card>
    <v-card-title class="px-0 pb-0">
      <v-list-item>
        <v-list-item class="pt-0">
          <v-list-item-title class="headline">
            <v-row>
              <v-col class="mt-2">
                <span style="font-size: x-large;font-weight: bold">Twinned Students</span>
              </v-col>
              <v-col class="d-flex justify-end">
                <v-btn
                  variant="flat"
                  icon="mdi-close"
                  @click="$emit('close')"
                >
                </v-btn>
              </v-col>
            </v-row>
          </v-list-item-title>
        </v-list-item>
      </v-list-item>
    </v-card-title>
    <v-card-text class="px-3 py-2 text--primary">
      <v-row no-gutters>
        <v-col
          no-gutters
          cols="9"
        >
          <v-data-table
            id="top-table"
            :headers="topTableHeaders"
            :items="[currentStudent]"
            hide-default-footer
            density="compact"
          />
        </v-col>
      </v-row>
      <v-divider class="mt-2"/>
      <v-row
        no-gutters
        justify="end"
      >
        <v-col class="mt-4">
          <span
            id="twins-number"
            class="px-4"
          ><strong>{{ possibleMatches.length }} Twins</strong></span>
        </v-col>
        <v-col class="mt-4">
          <v-row
            justify="end"
            class="mx-3"
          >
            <TertiaryButton
              id="deleteButton"
              :disabled="selectedTwins.length < 1 || !ADVANCED_SEARCH_ROLE"
              text="Delete"
              icon="mdi-delete"
              @click-action="deleteTwinStudent"
            />
          </v-row>
        </v-col>
      </v-row>
      <v-data-table
        id="details-table"
        v-model:page="pageNumber"
        v-model="selectedTwins"
        return-object
        :headers="headers"
        :items="possibleMatchItems"
        :items-per-page="itemsPerPage"
        show-select
        item-key="possibleMatchID"
      >
        <template #[`item.pen`]="props">
          <a @click="viewStudentDetails(props.item.matchedStudentID)">
            {{ props.value }}
          </a>
        </template>
        <template #[`item.matchedReason`]="props">
          <v-tooltip bottom>
            <template #activator="{ on }">
              <span>{{ props.value }}</span>
            </template>
            <span>{{ matchReasonLabel(props.value) }}</span>
          </v-tooltip>
        </template>
      </v-data-table>
      <v-row
        class="pt-2"
        justify="end"
        no-gutters
      >
        <v-col cols="4">
          <v-pagination
            v-model="pageNumber"
            color="#38598A"
            :length="totalPages"
            class="twins-pagination"
          />
        </v-col>
        <v-col
          id="currentItemsDisplay"
          cols="4"
        >
          Showing {{ showingFirstNumber }} to {{ showingEndNumber }} of {{ possibleMatches.length }}
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
import TertiaryButton from '../../util/TertiaryButton.vue';
import {mapState, mapActions} from 'pinia';
import moment from 'moment';
import {sortBy} from 'lodash';
import ApiService from '../../../common/apiService';
import {REQUEST_TYPES, Routes} from '@/utils/constants';
import {formatPen} from '@/utils/format';
import router from '@/router';
import alertMixin from '@/mixins/alertMixin';
import {studentStore} from '@/store/modules/student';
import {authStore} from '@/store/modules/auth';

export default {
  name: 'TwinnedStudentsCard',
  components: {
    TertiaryButton: TertiaryButton
  },
  mixins: [alertMixin],
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
        {title: 'PEN', key: 'pen', align: 'start', sortable: false, value: 'pen', topTable: true},
        {title: 'Legal Name', value: 'legalName', key: 'legalName', sortable: false, topTable: true},
        {title: 'Birth Date', value: 'dob', key: 'dob', sortable: false, topTable: true},
        {title: 'Gender', value: 'genderCode', key: 'genderCode', sortable: false, topTable: true},
        {title: 'Twinned', value: 'matchedDate', key: 'matchedDate', sortable: false},
        {title: 'Reason', value: 'matchedReason', key: 'matchedReason', sortable: false},
      ],
    };
  },
  computed: {
    ...mapState(studentStore, ['possibleMatchReasons']),
    ...mapState(authStore, ['ADVANCED_SEARCH_ROLE']),
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
    ...mapActions(studentStore, ['getPossibleMatchReasonCodes']),
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
          createUser: element.createUser,
          updateUser: element.updateUser
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

:deep(.v-data-table-footer){
    display: none;
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
