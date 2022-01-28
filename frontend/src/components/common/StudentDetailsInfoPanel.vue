<template>
  <v-container ref="stickyInfoPanel" class="sticky default-container pt-5 px-8">
    <slot name="headerPanel" :openSearchDemographicsModal="openSearchDemographicsModal"></slot>
    <SearchDemographicModal @closeDialog="closeDialog" @updateStudent="updateStudent" :dialog="dialog"
                  :is-field-read-only="() => {return false}"
                  :hidden-fields="hiddenSearchFields"
                  :student-data="modalStudent">
      <template v-slot:actions="{ isFormValid }">
        <PrimaryButton id="cancel" :secondary="true" text="Cancel"
                       @click.native="closeDialog"
        >
        </PrimaryButton>

        <PrimaryButton width="15%"
                       text="Modify Search"
                       id="searchDemogModalSearchBtn"
                       @click.native="isFormValid()"
        >
        </PrimaryButton>
      </template>
    </SearchDemographicModal>
    <v-divider class="mb-1 subheader-divider"/>
    <v-row no-gutters class="py-2 full-width" style="background-color:white;">
      <div style="width: 100%;" :overlay="false">
        <v-data-table
                id="top-table"
                class="details-table mb-3"
                :headers="headers"
                :items="[studentDetails]"
                hide-default-footer
                dense
        >
          <template v-for="h in headers" v-slot:[`header.${h.value}`]="{ header }">
            <span :title="header.topTooltip" :key="h.id || h.topText" class="top-column-item" :class="{'header-half-width': header.doubleText && !isFieldValueWarned(header.topValue)}">
              {{ header.topText }}
            </span>
            <StudentValidationWarningHint
              v-if="header.topValue && isFieldValueWarned(header.topValue)"
              :key="h.topValue"
              :hasDoubleText="!!header.doubleText"
              :validationWarnings="getValidationWarnings(header.topValue)"
            />
            <span :title="header.doubleTooltip" :key="h.id || h.doubleValue" class="double-column-item">{{header.doubleText}}</span>
            <StudentValidationWarningHint
              v-if="header.doubleValue && isFieldValueWarned(header.doubleValue)"
              :key="h.doubleValue"
              :hasDoubleText="!!header.doubleText"
              :validationWarnings="getValidationWarnings(header.doubleValue)"
            />
          </template>
          <template v-slot:item="props">
            <tr>
              <td v-for="header in props.headers" :key="header.id || header.topValue" :class="header.id">
                <div class="table-cell" :class="[props.item[header.doubleValue] ? 'value-half-width':'']">
                  <span :class="['top-column-item',{'mark-field-value-changed':isFieldValueUpdated(header.topValue)}, {'mark-field-value-errored':isFieldValueErrored(header.topValue)}]">
                    <span><strong>{{ formatTableColumn(header.format, props.item[header.topValue]) }}</strong></span>
                  </span>
                  <span :class="['double-column-item-value',{'mark-field-value-changed':isFieldValueUpdated(header.doubleValue)}, {'mark-field-value-errored':isFieldValueErrored(header.doubleValue)}]"><strong>{{props.item[header.doubleValue]}}</strong></span>
                </div>
              </td>
            </tr>
          </template>
        </v-data-table>
        <v-data-table
                id="bottom-table"
                class="details-table"
                :headers="bottomTableHeaders"
                :items="[studentDetails]"
                hide-default-footer
                dense
        >
          <template v-for="h in bottomTableHeaders" v-slot:[`header.${h.value}`]="{ header }">
            <span :title="header.tooltip" :key="h.id || h.text">
              {{ header.text }}
            </span>
            <StudentValidationWarningHint
              v-if="header.value && isFieldValueWarned(header.value)"
              :key="h.id || h.value"
              :validationWarnings="getValidationWarnings(header.value)"
            />
          </template>
          <template v-slot:item="props">
            <tr>
              <td v-for="header in props.headers" :key="header.id || header.value" :class="header.id">
                <div class="table-cell">
                    <span  :class="['top-column-item',{'mark-field-value-changed':studentDetailsCopy && isFieldValueUpdated(header.value)}, {'mark-field-value-errored':isFieldValueErrored(header.value)}]">
                      <span><strong>{{ formatTableColumn(header.format, props.item[header.value]) }}</strong></span>
                    </span>
                </div>
              </td>
            </tr>
          </template>
        </v-data-table>
      </div>
    </v-row>
    <v-row v-if="validationErrorFields && validationErrorFields.length" class="py-2 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3">
      <v-card elevation="0" width="33%">
        <v-card-title class="pb-0">Error Details</v-card-title>
        <v-data-table
                :headers="validationErrorFieldHeaders"
                :items="validationErrorFields"
                hide-default-footer
        ></v-data-table>
      </v-card>
    </v-row>
    <slot name="footerPanel"></slot>
  </v-container>
</template>

<script>
import SearchDemographicModal from './SearchDemographicModal';
import {deepCloneObject} from '@/utils/common';
import {formatDob, formatMincode, formatPen, formatPostalCode} from '@/utils/format';
import {mapMutations} from 'vuex';
import StudentValidationWarningHint from './StudentValidationWarningHint';
import PrimaryButton from '../util/PrimaryButton';
import {partialRight} from 'lodash';

export default {
  name: 'StudentDetailsInfoPanel',
  components: {
    PrimaryButton,
    SearchDemographicModal,
    StudentValidationWarningHint
  },
  props: {
    student: {
      type: Object,
      required: true
    },
    studentDetailsCopy: {
      type: Object,
      default: () => ({})
    },
    validationWarningFields: {
      type: Array,
      default: () => []
    },
    validationErrorFields: {
      type: Array,
      default: () => []
    },
    hiddenSearchFields: {
      type: Array,
      required: true
    },
    isFixableOrErrorStatus: {
      type: Boolean,
      required: true
    },
  },
  data() {
    return {
      headers: [
        { id: 'table-checkbox', type: 'select', sortable: false },
        { topText: 'Mincode', topValue: 'mincode', sortable: false, format: formatMincode, topTooltip: 'Mincode' },
        { topText: 'Legal Surname', topValue: 'legalLastName', sortable: false, topTooltip: 'Legal Surname' },
        { topText: 'Legal Given', topValue: 'legalFirstName', sortable: false, topTooltip: 'Legal Given Name' },
        { topText: 'Legal Middle', topValue: 'legalMiddleNames', sortable: false, topTooltip: 'Legal Middle Names' },
        { topText: 'DC', doubleText: 'Gen', topValue: 'dc', doubleValue: 'genderCode', sortable: false, topTooltip: 'Demographic Code', doubleTooltip: 'Gender' },
        { topText: 'Birth Date', topValue: 'dob', sortable: false, topTooltip: 'Birth Date', format: partialRight(formatDob,'uuuuMMdd','uuuu/MM/dd') },
        { topText: 'Sugg. PEN', topValue: 'bestMatchPEN', topTooltip: 'Suggested PEN', sortable: false, format: formatPen }
      ],
      bottomTableHeaders: [
        { id: 'table-checkbox', type: 'select', sortable: false },
        { text: 'Local ID', value: 'localID', sortable: false, tooltip: 'Local ID' },
        { text: 'Usual Surname', value: 'usualLastName', sortable: false, tooltip: 'Usual Surname' },
        { text: 'Usual Given', value: 'usualFirstName', sortable: false, tooltip: 'Usual Given Name' },
        { text: 'Usual Middle', value: 'usualMiddleNames', sortable: false, tooltip: 'Usual Middle Name' },
        { text: 'Postal Code', value: 'postalCode', sortable: false, format: formatPostalCode, tooltip: 'Postal Code' },
        { text: 'Grade', value: 'gradeCode', sortable: false, tooltip: 'Grade Code' },
        { text: '', value: '', sortable: false }
      ],
      validationErrorFieldHeaders: [
        { text: 'Field Name', value: 'uiFieldName', sortable: false },
        { text: 'Error Description', value: 'description', sortable: false }
      ],
      modalStudent: {},
      dialog: false,
    };
  },
  mounted() {
    this.setStickyInfoPanelHeight(this.$refs.stickyInfoPanel.clientHeight);
    if(!_.isEmpty(this.studentDetails)) { //don't run validation on page load if create new pen screen
      this.setModalStudentFromRequestStudent();
    }
  },
  computed: {
    studentDetails: {
      get: function() {
        return this.student;
      },
      set: function(value) {
        this.$emit('update:student', value);
      }
    },
    stickyInfoPanelHeight() {
      return this.$refs.stickyInfoPanel?.clientHeight;
    }
  },
  watch: {
    stickyInfoPanelHeight(newValue) {
      this.setStickyInfoPanelHeight(newValue);
    }
  },
  methods: {
    ...mapMutations('app', ['setStickyInfoPanelHeight']),
    formatTableColumn(format, column) {
      return (format && column) ? format(column) : (column || ' ');
    },
    getValidationIssues(fieldName, validationIssueFields) {
      return validationIssueFields?.filter(x => x.dataFieldName === fieldName);
    },
    getValidationWarnings(fieldName) {
      return this.getValidationIssues(fieldName, this.validationWarningFields);
    },
    isFieldValueWithIssues(fieldName, validationIssueFields) {
      return !!(this.getValidationIssues(fieldName, validationIssueFields)?.length);
    },
    isFieldValueErrored(fieldName) {
      return this.isFieldValueWithIssues(fieldName, this.validationErrorFields);
    },
    isFieldValueWarned(fieldName) {
      return this.isFixableOrErrorStatus
        && this.isFieldValueWithIssues(fieldName, this.validationWarningFields);
    },
    isFieldValueUpdated(fieldName) {
      if(fieldName && this.studentDetailsCopy && !_.isEmpty(this.studentDetailsCopy)){
        return this.studentDetails[fieldName]?.toLowerCase() !== this.studentDetailsCopy[fieldName]?.toLowerCase();
      }
      return false;
    },
    openSearchDemographicsModal() {
      this.setModalStudentFromRequestStudent();
      this.dialog = true;
    },
    setModalStudentFromRequestStudent(){
      this.modalStudent = deepCloneObject(this.studentDetails);
    },
    async closeDialog() {
      this.dialog = false;
      this.$emit('modifySearchParams');
    },
    async updateStudent(studentModified) {
      this.dialog = false;
      this.studentDetails = deepCloneObject(studentModified);
      await this.$nextTick(); //need to wait so update can me made in parent and propagated back down to child component
      this.$emit('modifySearchParams', this.studentDetails);
    },
  }
};
</script>

<style scoped>
  .default-container {
    padding: 0;
    margin: 0;
    max-width: 100%;
    width: 100%;
  }
  .subheader-divider {
    border-width: 0.25ex 0 0 0;
  }

  #bottom-table /deep/ table th,
  #top-table /deep/ table th {
    border-bottom: none !important;
    font-size: 0.875rem;
    font-weight: normal;
    color: rgba(0, 0, 0, 0.87) !important;
    height: 1.5rem;
  }
  .details-table /deep/ table > tbody > tr > td {
    height: 1.5rem;
  }
  .details-table /deep/ table > tbody > tr:hover {
    background: transparent !important;
  }
  .details-table /deep/ table > tbody > tr:not(:last-child) > td {
    border-bottom: none !important;
  }
  .double-column-item {
    float: right;
    display: contents;
  }
  .double-column-item-value{
    float: right;
  }
  .top-column-item {
    float: left;
  }
  .full-width {
    margin-left: -32px;
    margin-right: -32px;
  }
  .header-half-width {
    width: 3.0em;
  }
  .value-half-width {
    width: 3.9rem;
  }
  .sticky {
    position: sticky;
    top: 0;
    z-index: 6;
    background-color: white;
  }

  pre {
    font-family: inherit;
    font-size: inherit;
  }

  .mark-field-value-errored {
    color: #D8292F !important;
  }

  .mark-field-value-changed {
    color: #2E8540;
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
</style>
