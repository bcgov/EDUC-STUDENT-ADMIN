<template>

  <v-card id="searchResults" elevation="0" tile width="100%" class="px-8">
    <v-row no-gutters justify="space-between" class="sticky" :style="{top: `${stickyInfoPanelHeight}px`}">
      <v-col>
        <v-card-title>
          <span id="numberMatches" class="px-4"><strong>{{ title }}</strong><v-btn
              @click="matchesExpanded=!matchesExpanded" icon><v-icon nudge-bottom="4"
                                                                     color="#003366">{{
              !matchesExpanded ? 'fa-angle-up' : 'fa-angle-down'
            }}</v-icon></v-btn></span>
        </v-card-title>
      </v-col>
      <v-col align-self="center">
        <v-row justify="end" class="mx-3" v-if="isComparisonRequired || isRefreshRequired">
          <TertiaryButton v-if="isComparisonRequired" id="compareButton" class="ma-0" text="Compare"
                          icon="mdi-content-copy" @click.native="compare"></TertiaryButton>
          <TertiaryButton v-if="isRefreshRequired" id="refreshButton" class="ma-0" iconStyle="mdi-flip-h" text="Refresh"
                          icon="mdi-cached" @click.native="$emit('refresh-match-results')"></TertiaryButton>
        </v-row>
      </v-col>
    </v-row>
    <v-row no-gutters >
      <v-slide-y-transition>
        <v-col key="results" v-if="matchesExpanded" class="pa-0">
          <v-divider></v-divider>
          <v-data-table
              id="penMatchResultsDataTable"
              :headers="headers"
              hide-default-header
              hide-default-footer
              item-key="studentID"
              :items="studentPossibleMatches">
            <template v-slot:item="props">
              <tr :key="props.index"
                  @mouseover="enableMatchOrUnMatch(props.item)"
                  @mouseleave="disableMatchOrUnMatch(props.item)"
                  :class="[hoveredOveredRowStudentID === props.item.studentID?'hovered-record-match-unmatch':'' ,
                 props.isSelected?'selected-record':'',
                 isMatchedToStudent(props.item)?'matchedStudentRow':'',
                 (student.penRequestBatchStudentStatusCode === PEN_REQ_BATCH_STUDENT_REQUEST_CODES.NEWPENUSR && student.assignedPEN === props.item.pen) || !!props.item.twinRecordToMatchedStudent ? 'grayout':'']">
                <td v-for="header in props.headers" :key="header.id" :class="header.id">
                  <div :class="[props.item[header.doubleValue] ? 'value-half-width':'','tableCell']">
                    <v-checkbox :class="['top-column-item']" v-if="header.type" class="pl-3" color="#606060"
                                @change="props.select($event)"></v-checkbox>
                    <v-icon :class="['bottom-column-item','pl-3']"
                            v-if="header.bottomValue==='icon' && props.item['iconValue']" color="#606060">
                      {{ props.item['iconValue'] }}
                    </v-icon>
                    <a class="pen-link" @click="popStudentDialog(props.item['studentID'])"
                       v-if="header.topValue==='pen' && isPenLink">
                      <span
                          :class="['top-column-item', 'pen-link', props.item[header.topValue] && demogValuesMatch(header.topValue, props.item[header.topValue])?'font-weight-bold':'']">
                        {{ formatPen(props.item[header.topValue]) }}
                      </span>
                    </a>
                    <span v-else-if="header.topValue==='pen'"
                          :class="['top-column-item', props.item[header.topValue] && demogValuesMatch(header.topValue, props.item[header.topValue])?'font-weight-bold':'']">
                    {{ formatPen(props.item[header.topValue]) }}
                    </span>
                    <span v-else-if="header.topValue==='mincode'"
                          :class="['top-column-item', props.item[header.topValue] && demogValuesMatch(header.topValue, props.item[header.topValue])?'font-weight-bold':'']">
                        {{ formatMinCode(props.item[header.topValue]) }}
                    </span>
                    <span v-else-if="header.topValue==='dob'"
                          :class="['top-column-item', props.item[header.topValue] && demogValuesMatch(header.topValue, props.item[header.topValue])?'font-weight-bold':'']">
                        {{ formatDob(props.item[header.topValue], 'uuuu-MM-dd') }}
                    </span>
                    <span v-else
                          :class="['top-column-item', props.item[header.topValue] && demogValuesMatch(header.topValue, props.item[header.topValue])?'font-weight-bold':'']">
                        {{ props.item[header.topValue] }}
                    </span>
                    <span
                        :class="['double-column-item', props.item[header.doubleValue] && demogValuesMatch(header.doubleValue, props.item[header.doubleValue])? 'font-weight-bold':'']">
                      {{ props.item[header.doubleValue] }}
                    </span>
                    <br>
                    <span v-if="!!isMatchUnMatch && header.bottomValue==='button' && hoveredOveredRowStudentID === props.item.studentID">
                      <PrimaryButton :short="true" id="matchUnMatchButton" :text="matchUnMatchButtonText"
                                     :width="'6.5em'"
                                     @click.native="$emit('match-unmatch-student-prb-student', props.item, matchUnMatchButtonText)"></PrimaryButton>
                    </span>
                    <span v-else-if="header.bottomValue==='postalCode'"
                          :class="['bottom-column-item', props.item[header.bottomValue] && demogValuesMatch(header.bottomValue, props.item[header.bottomValue])? 'font-weight-bold':'']">
                      {{ formatPostalCode(props.item[header.bottomValue]) }}
                    </span>
                    <span v-else
                          :class="['bottom-column-item', props.item[header.bottomValue] && demogValuesMatch(header.bottomValue, props.item[header.bottomValue])? 'font-weight-bold':'']">
                      {{ props.item[header.bottomValue] }}
                  </span>
                  </div>
                </td>
              </tr>
            </template>
          </v-data-table>
        </v-col>
      </v-slide-y-transition>
    </v-row>
    <StudentDetailModal
        :studentID="currentStudentID"
        :openDialog="openStudentDialog"
        @closeDialog="closeDialog"
    ></StudentDetailModal>
  </v-card>
</template>

<script>

import TertiaryButton from '../util/TertiaryButton';
import StudentDetailModal from '../penreg/student/StudentDetailModal';
import {PEN_REQ_BATCH_STUDENT_REQUEST_CODES} from '@/utils/constants';
import {formatPen, formatMinCode, formatPostalCode, formatDob} from '@/utils/format';
import { mapState } from 'vuex';
import PrimaryButton from '@/components/util/PrimaryButton';

export default {
  name: 'PenMatchResultsTable.vue',
  components: {
    PrimaryButton,
    TertiaryButton,
    StudentDetailModal
  },
  props: {
    student: {
      type: Object,
      required: true
    },
    possibleMatch: {
      type: Array,
      required: true
    },
    isComparisonRequired: {
      type: Boolean,
      required: true
    },
    isRefreshRequired: {
      type: Boolean,
      required: true
    },
    isPenLink: {
      type: Boolean,
      required: true
    },
    isMatchUnMatch: {
      type: Boolean,
      required: true
    },

  },
  data() {
    return {
      currentStudentID: null,
      openStudentDialog: false,
      matchesExpanded: true,
      headers: [
        {
          id: 'table-checkbox',
          type: 'select',
          sortable: false,
          bottomValue: 'icon'
        },
        {
          topText: 'Mincode',
          bottomText: 'Local ID',
          align: 'start',
          sortable: false,
          topValue: 'mincode',
          bottomValue: 'localID'
        },
        {
          topText: 'Legal Surname',
          bottomText: 'Usual Surname',
          topValue: 'legalLastName',
          bottomValue: 'usualLastName',
          sortable: false
        },
        {
          topText: 'Legal Given',
          bottomText: 'Usual Given',
          topValue: 'legalFirstName',
          bottomValue: 'usualFirstName',
          sortable: false
        },
        {
          topText: 'Legal Middle',
          bottomText: 'Usual Middle',
          topValue: 'legalMiddleNames',
          bottomValue: 'usualMiddleNames',
          sortable: false
        },
        {
          topText: 'DC',
          doubleText: 'Gen',
          bottomText: 'Postal Code',
          topValue: 'dc',
          doubleValue: 'genderCode',
          bottomValue: 'postalCode',
          sortable: false
        },
        {topText: 'Birth Date', bottomText: 'Grade', topValue: 'dob', bottomValue: 'gradeCode', sortable: false},
        {topText: 'Sugg. PEN', bottomText: '', topValue: 'pen', bottomValue: 'button', sortable: false},
      ],
      studentPossibleMatches: [],
      loadingMatchResults: false,
      errorCallingMatchResults: false,
      errorMessage: 'There was an error in retrieving the data. Try refreshing the page, or leaving this request and returning to it after viewing another.',
      isMatchUnMatchEnabled: false,
      selectedRecordStudentID: null,
      hoveredOveredRowStudentID: null,
      matchUnMatchButtonText: null,
      PEN_REQ_BATCH_STUDENT_REQUEST_CODES: PEN_REQ_BATCH_STUDENT_REQUEST_CODES,
    };
  },
  mounted() {
    this.studentPossibleMatches = this.possibleMatch;
  },
  watch: {
    possibleMatch(newValue) {
      this.studentPossibleMatches = newValue;
    },
  },
  computed: {
    ...mapState('app', ['stickyInfoPanelHeight']),
    title() {
      if (this.student.penRequestBatchStudentStatusCode) {
        switch (this.student.penRequestBatchStudentStatusCode) {
        case PEN_REQ_BATCH_STUDENT_REQUEST_CODES.NEWPENUSR:
          return 'New PEN Created';
        case PEN_REQ_BATCH_STUDENT_REQUEST_CODES.MATCHEDSYS:
        case PEN_REQ_BATCH_STUDENT_REQUEST_CODES.MATCHEDUSR:
          return 'Matched To';
        default:
          return `${this.studentPossibleMatches.length || 0} Matches`;
        }
      } else {
        return `${this.studentPossibleMatches.length || 0} Matches`;
      }
    },
    isMatchedToStudent(){
      return item => !!item?.matchedToStudent;
    },
  },
  methods: {
    popStudentDialog(studentID) {
      this.currentStudentID = studentID;
      this.openStudentDialog = true;
    },
    closeDialog() {
      this.openStudentDialog = false;
    },
    compare() {
      //TODO
    },
    refresh() {

    },
    demogValuesMatch(valueType, value) {
      switch (valueType) {
      case 'postalCode':
        return this.student?.postalCode?.replace(' ', '')?.toLowerCase() === value?.replace(' ', '')?.toLowerCase(); // match without space
      case 'dob':
        return this.student?.dob?.replace(/\D/g, '') === value?.replace(/\D/g, ''); // match birth date without - or /
      case 'mincode':
        return this.student?.minCode?.replace(/\s/g, '') === value?.replace(/\s/g, '');
      case 'pen':
        if (this.student.assignedPEN) {
          return this.student.assignedPEN === value;
        } else {
          return this.student.bestMatchPEN === value;
        }
      default:
        return this.student[valueType]?.toLowerCase() === value?.toLowerCase();
      }
    },
    isGreyedOut(matchedStudent) {
      return ( (this.student.penRequestBatchStudentStatusCode === PEN_REQ_BATCH_STUDENT_REQUEST_CODES.NEWPENUSR && this.student.assignedPEN === matchedStudent.pen) || !!matchedStudent.twinRecordToMatchedStudent);
    },
    formatPen,
    formatMinCode,
    formatPostalCode,
    formatDob,
    enableMatchOrUnMatch(matchedStudent) {
      if (this.student && matchedStudent) {
        if (PEN_REQ_BATCH_STUDENT_REQUEST_CODES.FIXABLE === this.student.penRequestBatchStudentStatusCode
            || PEN_REQ_BATCH_STUDENT_REQUEST_CODES.INFOREQ === this.student.penRequestBatchStudentStatusCode) {
          this.hoveredOveredRowStudentID = matchedStudent.studentID;
          this.matchUnMatchButtonText = 'Match';
        } else if ([PEN_REQ_BATCH_STUDENT_REQUEST_CODES.MATCHEDSYS,
          PEN_REQ_BATCH_STUDENT_REQUEST_CODES.MATCHEDUSR ].some(element => element === this.student.penRequestBatchStudentStatusCode)
            && matchedStudent.studentID === this.student.studentID) {
          this.hoveredOveredRowStudentID = matchedStudent.studentID;
          this.matchUnMatchButtonText = 'Unmatch';
        }
      }
    },
    disableMatchOrUnMatch() {
      this.hoveredOveredRowStudentID = null;
      this.matchUnMatchButtonText = '';
    },
  }
};
</script>

<style scoped>

#searchResults {
  background-color: #F2F2F2;
  z-index: 0;
}

.bottom-column-item {
  float: left;
  min-height: 1.5em;
}

#penMatchResultsDataTable {
  background-color: #F2F2F2;
}


#penMatchResultsDataTable /deep/ table tbody tr:not(.selected-record):hover {
  background-color: inherit;
}

.double-column-item {
  float: right;
}

.top-column-item {
  float: left;
}

.value-half-width {
  width: 3.9rem;
}

.v-data-table /deep/ tr td:nth-child(1) {
  width: 6%;
}
.v-data-table /deep/ tr td:nth-child(3),
.v-data-table /deep/ tr td:nth-child(4),
.v-data-table /deep/ tr td:nth-child(5) {
  width: 18%;
}
.v-data-table /deep/ tr td:nth-child(2),
.v-data-table /deep/ tr td:nth-child(6),
.v-data-table /deep/ tr td:nth-child(7),
.v-data-table /deep/ tr td:nth-child(8) {
  width: 10%;
}

.pen-link {
  text-decoration: underline;
}

.sticky {
  position: sticky;
  z-index: 6;
  background-color: #F2F2F2;
}

.hovered-record-match-unmatch {
  background-color: #dff4fd !important;
}

.grayout {
  opacity: 0.5;
}

.matchedStudentRow {
  background-color: #E0EFD9 !important;
}
</style>
