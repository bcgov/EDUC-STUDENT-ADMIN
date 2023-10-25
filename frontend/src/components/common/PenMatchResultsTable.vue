<template>
  <v-card
    id="searchResults"
    elevation="0"
    tile
    width="100%"
    class="px-8"
  >
    <v-row
      no-gutters
      justify="space-between"
      class="sticky pt-3"
      :style="{top: `${stickyInfoPanelHeight}px`}"
    >
      <v-col>
        <v-card-title>
          <span
            id="numberMatches"
            class="px-4"
          ><strong>{{ title }}</strong>
            <v-btn
              variant="flat"
              color="#F2F2F2"
              size="small"
              :icon="!matchesExpanded ? 'mdi-chevron-up' : 'mdi-chevron-down'"
              @click="matchesExpanded=!matchesExpanded"
            />
          </span>
        </v-card-title>
      </v-col>
      <v-col align-self="center">
        <v-row
          v-if="isComparisonRequired || isRefreshRequired"
          justify="end"
          class="mx-3"
        >
          <v-col class="d-flex justify-end">
            <CompareDemographicModal
              @close-compare="closeCompare"
              v-model:selected-records="selectedRecords"
              :disabled="selectedRecords.length<2 || selectedRecords.length>3"
            />
            <TertiaryButton
              v-if="isRefreshRequired"
              id="refreshButton"
              :disabled="disableRefresh"
              icon="mdi-cached"
              icon-style="mdi-flip-h"
              text="Refresh"
              @click-action="$emit('refresh-match-results')"
            />
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    <v-row no-gutters>
      <v-slide-y-transition>
        <v-col
          v-if="matchesExpanded"
          key="results"
          class="pa-0"
        >
          <v-divider/>
          <v-data-table
            id="penMatchResultsDataTable"
            v-model="selectedRecords"
            :headers="headers"
            hide-default-header
            hide-default-footer
            disable-pagination
            item-key="studentID"
            item-value="studentID"
            :items="studentPossibleMatches"
          >
            <template #item="item">
              <tr
                :key="item.index"
                :class="['resultsTableRow',
                         hoveredOveredRowStudentID === item.item.studentID?'hovered-record-match-unmatch':'' ,
                         item.item.isSelected?'selected-record':'',
                         isMatchedToStudent(item.item)?'matchedStudentRow':'',
                         grayoutPossibleMatches(item.item) ? 'grayout':'']"
                @mouseover="enableMatchOrUnMatch(item.item)"
                @mouseleave="disableMatchOrUnMatch(item.item)"
              >
                <td
                  v-for="header in item.columns"
                  :key="header.id"
                  :class="header.id"
                >
                  <div :class="[item.item[header.doubleValue] ? 'value-half-width':'','tableCell']">
                    <span v-if="header.type">
                      <v-checkbox
                        :class="['checkbox', 'pl-3']"
                        color="#606060"
                        :hide-details="isMatchedToStudent(item.item) ? true : false"
                        :input-value="item.item.isSelected"
                        density="compact"
                        @update:model-value="selectItem(item.item)"
                      />
                      <v-icon
                        v-if="header.bottomValue==='icon' && item.item['iconValue']"
                        :class="['checkboxIcon', 'pl-6', 'mt-n3' ]"
                        color="#606060"
                      >
                        {{ item.item['iconValue'] }}
                      </v-icon>

                    </span>
                    <span v-else>
                      <span v-if="header.topValue==='pen'">
                        <a
                          v-if="isPenLink"
                          class="pen-link"
                          @click="popStudentDialog(item.item['studentID'])"
                        >
                          <span
                            :class="['top-column-item', 'pen-link', item.item[header.topValue] && demogValuesMatch(header.topValue, item.item[header.topValue])?'font-weight-bold':'']"
                          >
                            {{ formatPen(item.item[header.topValue]) }}
                          </span>
                        </a>
                        <span
                          v-else
                          :class="['top-column-item', item.item[header.topValue] && demogValuesMatch(header.topValue, item.item[header.topValue])?'font-weight-bold':'']"
                        >
                          {{ formatPen(item.item[header.topValue]) }}
                        </span>
                        <v-tooltip
                          v-if="item.item['memo']"
                          top
                          max-width="40vw"
                        >
                          <template #activator="{ on }">
                            <v-icon class="mx-1">
                              sticky_note_2
                            </v-icon>
                          </template>
                          <span>
                            {{ item.item['memo'] }}
                          </span>
                        </v-tooltip>
                      </span>
                      <span
                        v-else-if="header.topValue==='mincode'"
                        :class="['top-column-item', item.item[header.topValue] && demogValuesMatch(header.topValue, item.item[header.topValue])?'font-weight-bold':'']"
                      >
                        {{ formatMincode(item.item[header.topValue]) }}
                      </span>
                      <span
                        v-else-if="header.topValue==='dob'"
                        :class="['top-column-item', item.item[header.topValue] && demogValuesMatch(header.topValue, item.item[header.topValue])?'font-weight-bold':'']"
                      >
                        {{ formatDob(item.item[header.topValue], 'uuuu-MM-dd') }}
                      </span>
                      <span
                        v-else
                        :class="['top-column-item', item.item[header.topValue] && demogValuesMatch(header.topValue, item.item[header.topValue])?'font-weight-bold':'']"
                      >
                        {{ item.item[header.topValue] }}
                      </span>
                      <span
                        :class="['double-column-item', item.item[header.doubleValue] && demogValuesMatch(header.doubleValue, item.item[header.doubleValue])? 'font-weight-bold':'']"
                      >
                        {{ item.item[header.doubleValue] }}
                      </span>
                      <br>
                      <span v-if="!!isMatchUnMatch && header.bottomValue==='button' && hoveredOveredRowStudentID === item.item.studentID">
                        <PrimaryButton
                          id="matchUnMatchButton"
                          :short="true"
                          :text="matchUnMatchButtonText"
                          :width="'6.5em'"
                          :disabled="disableMatchUnmatch"
                          @click-action="$emit('match-unmatch-student', item.item, matchUnMatchButtonText)"
                        />
                      </span>
                      <span
                        v-else-if="header.bottomValue==='postalCode'"
                        :class="['bottom-column-item', item.item[header.bottomValue] && demogValuesMatch(header.bottomValue, item.item[header.bottomValue])? 'font-weight-bold':'']"
                      >
                        {{ formatPostalCode(item.item[header.bottomValue]) }}
                      </span>

                      <!-- if top and bottom value are the same, do not display the bottom value -->
                      <span
                        v-else
                        :class="['bottom-column-item', item.item[header.bottomValue] && demogValuesMatch(header.bottomValue, item.item[header.bottomValue])? 'font-weight-bold':'']"
                      >{{ item.item[header.bottomValue] !== item.item[header.topValue] ? item.item[header.bottomValue] : ''
                        }}</span>
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
      :student-i-d="currentStudentID"
      :open-dialog="openStudentDialog"
      @closeDialog="closeDialog"
    />
  </v-card>
</template>

<script>

import CompareDemographicModal from './CompareDemographicModal.vue';
import TertiaryButton from '../util/TertiaryButton.vue';
import StudentDetailModal from '../penreg/student/StudentDetailModal.vue';
import {formatDob, formatMincode, formatPen, formatPostalCode} from '@/utils/format';
import {mapState} from 'pinia';
import PrimaryButton from '@/components/util/PrimaryButton.vue';
import {appStore} from '@/store/modules/app';

export default {
  name: 'PenMatchResultsTable',
  components: {
    CompareDemographicModal,
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
    disableMatchUnmatch: {
      type: Boolean,
      default: false
    },
    disableRefresh: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      required: true
    },
    showMatchButton: {
      type: Function,
      required: true
    },
    showUnmatchButton: {
      type: Function,
      required: true
    },
    grayoutPossibleMatches: {
      type: Function,
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
          bottomValue: 'icon',
          key: 'icon'
        },
        {
          title: 'Mincode',
          topText: 'Mincode',
          bottomText: 'Local ID',
          align: 'start',
          sortable: false,
          topValue: 'mincode',
          key: 'mincode',
          bottomValue: 'localID',
          topTooltip: 'Mincode',
          bottomTooltip: 'Local ID'
        },
        {
          title: 'Legal Surname',
          topText: 'Legal Surname',
          bottomText: 'Usual Surname',
          topValue: 'legalLastName',
          key: 'legalLastName',
          bottomValue: 'usualLastName',
          sortable: false,
          topTooltip: 'Legal Surname',
          bottomTooltip: 'Usual Surname'
        },
        {
          title: 'Legal Given',
          topText: 'Legal Given',
          bottomText: 'Usual Given',
          topValue: 'legalFirstName',
          key: 'legalFirstName',
          bottomValue: 'usualFirstName',
          sortable: false,
          topTooltip: 'Legal Given',
          bottomTooltip: 'Usual Given'
        },
        {
          title: 'Legal Middle',
          topText: 'Legal Middle',
          bottomText: 'Usual Middle',
          topValue: 'legalMiddleNames',
          key: 'legalMiddleNames',
          bottomValue: 'usualMiddleNames',
          sortable: false,
          topTooltip: 'Legal Middle',
          bottomTooltip: 'Usual Middle'
        },
        {
          title: 'DC',
          topText: 'DC',
          doubleText: 'Gen',
          bottomText: 'Postal Code',
          topValue: 'demogCode',
          key: 'demogCode',
          doubleValue: 'genderCode',
          bottomValue: 'postalCode',
          sortable: false,
          topTooltip: 'Demographic Code',
          bottomTooltip: 'Postal Code',
          doubleTooltip: 'Gender'
        },
        {
          title: 'Birth Date',
          topText: 'Birth Date',
          bottomText: 'Grade',
          topValue: 'dob',
          key: 'dob',
          bottomValue: 'gradeCode',
          sortable: false,
          topTooltip: 'Birth Date',
          bottomTooltip: 'Grade Code'
        },
        {
          title: 'Sugg. PEN',
          topText: 'Sugg. PEN',
          bottomText: '',
          topValue: 'pen',
          key: 'pen',
          bottomValue: 'button',
          sortable: false,
          topTooltip: 'Suggested PEN'
        },
      ],
      studentPossibleMatches: [],
      loadingMatchResults: false,
      errorCallingMatchResults: false,
      errorMessage: 'There was an error in retrieving the data. Try refreshing the page, or leaving this request and returning to it after viewing another.',
      isMatchUnMatchEnabled: false,
      selectedRecords: [],
      hoveredOveredRowStudentID: null,
      matchUnMatchButtonText: null,
    };
  },
  watch: {
    possibleMatch(newValue) {
      this.studentPossibleMatches = newValue;
    },
  },
  mounted() {
    this.studentPossibleMatches = this.possibleMatch;
  },
  computed: {
    ...mapState(appStore, ['stickyInfoPanelHeight']),
    isMatchedToStudent() {
      return item => !!item?.matchedToStudent;
    },
  },
  methods: {
    popStudentDialog(studentID) {
      this.currentStudentID = studentID;
      this.openStudentDialog = true;
    },
    closeCompare(){
      this.selectedRecords = [];
      if(this.studentPossibleMatches){
        this.studentPossibleMatches.forEach(stud => {
          stud.isSelected = false;
        });
      }
      this.$emit('refresh-match-results');
    },
    selectItem(item){
      item.isSelected = !item.isSelected;

      if(item.isSelected){
        this.selectedRecords.push(item);
      }else{
        const index = this.selectedRecords.indexOf(item);
        if(index){
          this.selectedRecords.splice(index, 1);
        }
      }
    },
    closeDialog() {
      this.openStudentDialog = false;
    },
    demogValuesMatch(valueType, value) {
      switch (valueType) {
      case 'postalCode':
        return this.student?.postalCode?.replace(' ', '')?.toLowerCase() === value?.replace(' ', '')?.toLowerCase(); // match without space
      case 'dob':
        return this.student?.dob?.replace(/\D/g, '') === value?.replace(/\D/g, ''); // match birth date without - or /
      case 'mincode':
        return this.student?.mincode?.replace(/\s/g, '') === value?.replace(/\s/g, '');
      case 'pen':
        if (this.student.assignedPEN) {
          return this.student?.assignedPEN?.replace(/\s/g, '') === value?.replace(/\s/g, '');
        } else {
          return this.student?.bestMatchPEN?.replace(/\s/g, '') === value?.replace(/\s/g, '');
        }
      default:
        return this.student[valueType]?.toLowerCase() === value?.toLowerCase();
      }
    },
    formatPen,
    formatMincode,
    formatPostalCode,
    formatDob,
    enableMatchOrUnMatch(matchedStudent) {
      if (this.student && matchedStudent) {
        if (this.showMatchButton(matchedStudent)) {
          this.hoveredOveredRowStudentID = matchedStudent.studentID;
          this.matchUnMatchButtonText = 'Match';
        } else if (this.showUnmatchButton(matchedStudent)) {
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
    min-height: 1.75rem;
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
    min-height: 1rem;
}

.value-half-width {
    width: 3.9rem;
}

.v-data-table /deep/ tr td:nth-child(1) {
    width: 6%;
}

.v-data-table /deep/ tr td:nth-child(3),
.v-data-table /deep/ tr td:nth-child(4) {
    width: 17%;
}

.v-data-table /deep/ tr td:nth-child(5) {
    width: 17%;
}

.v-data-table /deep/ tr td:nth-child(6) {
    width: 11%;
}

.v-data-table /deep/ tr td:nth-child(2),
.v-data-table /deep/ tr td:nth-child(7) {
    width: 10%;
}

.v-data-table /deep/ tr td:nth-child(8) {
    width: 12%;
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

.matchedStudentRow :deep(td) {
    background-color: #E0EFD9 !important;
}

.resultsTableRow > td {
    border-bottom: thin solid rgba(0, 0, 0, 0.12)
}

.v-input--checkbox {
    margin-top: 0;
}

.checkbox {
    width: 100%;
    min-height: 1.7rem;
}

.checkbox /deep/ .v-messages {
    display: none;
}

.checkbox /deep/ .v-input__slot {
    margin-bottom: 0;
    padding-top: 0;
}

.checkboxIcon {
    min-height: 1rem;
}

.tableCell {
    padding-top: .3rem;
    font-size: 0.85em;
}

:deep(.v-data-table-footer){
    display: none;
}

#penMatchResultsDataTable :deep(thead){
    display: none;
}

#penMatchResultsDataTable :deep(td) {
    background-color: #F2F2F2;
}

</style>
