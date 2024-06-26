<template>
  <v-container
    ref="stickyInfoPanel"
    class="sticky default-container pt-5 px-8"
  >
    <slot
      name="headerPanel"
      :open-search-demographics-modal="openSearchDemographicsModal"
    />
    <SdcSearchDemographicModal
      :dialog="dialog"
      :hidden-fields="hiddenSearchFields"
      :student-data="modalStudent"
      @closeDialog="closeDialog"
      @updateStudent="updateStudent"
    >
      <template #actions="{ modifySearch, searchEnabled }">
        <PrimaryButton
          id="cancel"
          :secondary="true"
          text="Cancel"
          @click-action="closeDialog"
        />

        <PrimaryButton
          id="searchDemogModalSearchBtn"
          width="15%"
          text="Modify Request"
          :disabled="!searchEnabled"
          @click-action="modifySearch()"
        />
        <PrimaryButton
          id="runAdvancedSearch"
          width="15%"
          text="Advanced Search"
          @click-action="searchStudent"
        />
      </template>
    </SdcSearchDemographicModal>
    <v-divider class="mb-1 subheader-divider" />
    <v-row
      no-gutters
      class="py-2 full-width"
      style="background-color:white;"
    >
      <div
        style="width: 100%;"
        :overlay="false"
      >
        <v-data-table
          id="top-table"
          class="details-table mb-3"
          :headers="headers"
          :items="[studentDetails]"
          density="compact"
        >
          <template
            v-for="h in headers"
            :key="h.key"
            #[`column.${h.key}`]="{ column }"
          >
            <span
              :title="column.topTooltip"
              class="top-column-item"
              :class="{'header-half-width': column.doubleText}"
            >
              {{ column.topText }}
            </span>
            <span
              :title="column.doubleTooltip"
              class="double-column-item"
            >{{ column.doubleText }}</span>
          </template>
          <template #item="item">
            <tr>
              <td
                v-for="header in item.columns"
                :key="header.id || header.topValue"
                :class="header.id"
              >
                <div
                  class="table-cell"
                  :class="[item.item.raw[header.doubleValue] ? 'value-half-width':'']"
                >
                  <span :class="['top-column-item']">
                    <span><strong>{{ formatTableColumn(header.format, item.item.raw[header.topValue]) }}</strong></span>
                  </span>
                  <span :class="['double-column-item-value']"><strong>{{ item.item.raw[header.doubleValue] }}</strong></span>
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
          density="compact"
        >
          <template
            v-for="h in bottomTableHeaders"
            :key="h.id || h.text"
            #[`column.${h.value}`]="{ column }"
          >
            <span
              :title="column.tooltip"
            >
              {{ column.text }}
            </span>
          </template>
          <template #item="item">
            <tr>
              <td
                v-for="header in item.columns"
                :key="header.id || header.value"
                :class="header.id"
              >
                <div class="table-cell">
                  <span :class="['top-column-item']">
                    <span><strong>{{ formatTableColumn(header.format, item.item.raw[header.value]) }}</strong></span>
                  </span>
                </div>
              </td>
            </tr>
          </template>
        </v-data-table>
      </div>
    </v-row>
  </v-container>
</template>

<script>

import {formatDob, formatMincode, formatPen, formatPostalCode} from '@/utils/format';
import SdcSearchDemographicModal from '../../components/common/SdcSearchDemographicModal.vue';
import {partialRight} from 'lodash';
import PrimaryButton from '../util/PrimaryButton.vue';
import {
  deepCloneObject
} from '@/utils/common';

export default {
  name: 'StudentDetailsPanel',
  components: {
    PrimaryButton,
    SdcSearchDemographicModal
  },
  props: {
    student: {
      type: Object,
      required: true
    },
    hiddenSearchFields: {
      type: Array,
      required: true
    },
  },
  data() {
    return {
      headers: [
        { id: 'table-checkbox', type: 'select', key:'select', sortable: false },
        { title: 'Mincode', topText: 'Mincode', topValue: 'mincode', sortable: false, format: formatMincode, topTooltip: 'Mincode', key: 'mincode' },
        { title: 'Legal Surname', topText: 'Legal Surname', topValue: 'legalLastName', sortable: false, topTooltip: 'Legal Surname', key: 'legalLastName' },
        { title: 'Legal Given', topText: 'Legal Given', topValue: 'legalFirstName', sortable: false, topTooltip: 'Legal Given Name', key: 'legalFirstName' },
        { title: 'Legal Middle', topText: 'Legal Middle', topValue: 'legalMiddleNames', sortable: false, topTooltip: 'Legal Middle Names', key: 'legalMiddleNames' },
        { title: 'DC', topText: 'DC', doubleText: 'Gen', topValue: 'dc', doubleValue: 'gender', sortable: false, topTooltip: 'Demographic Code', doubleTooltip: 'Gender', key: 'genderCode' },
        { title: 'Birth Date', topText: 'Birth Date', topValue: 'dob', sortable: false, topTooltip: 'Birth Date', format: partialRight(formatDob,'uuuuMMdd','uuuu/MM/dd'), key: 'dob' },
        { title: 'Sugg. PEN', topText: 'Sugg. PEN', topValue: 'bestMatchPEN', topTooltip: 'Suggested PEN', sortable: false, format: formatPen, key: 'bestMatchPEN' }
      ],
      bottomTableHeaders: [
        { id: 'table-checkbox', type: 'select',key:'select', sortable: false },
        { title: 'Local ID', text: 'Local ID', value: 'localID', key: 'localID', sortable: false, tooltip: 'Local ID' },
        { title: 'Usual Surname',text: 'Usual Surname', value: 'usualLastName', key: 'usualLastName', sortable: false, tooltip: 'Usual Surname' },
        { title: 'Usual Given',text: 'Usual Given', value: 'usualFirstName', key: 'usualFirstName', sortable: false, tooltip: 'Usual Given Name' },
        { title: 'Usual Middle',text: 'Usual Middle', value: 'usualMiddleNames', key: 'usualMiddleNames', sortable: false, tooltip: 'Usual Middle Name' },
        { title: 'Postal Code',text: 'Postal Code', value: 'postalCode', key: 'postalCode', sortable: false, format: formatPostalCode, tooltip: 'Postal Code' },
        { title: 'Grade',text: 'Grade', value: 'enrolledGradeCode', key: 'gradeCode', sortable: false, tooltip: 'Grade Code' },
        { title: '',text: '', value: '', sortable: false, key: 'none' }
      ],
      validationErrorFieldHeaders: [
        { title: 'Field Name', text: 'Field Name', value: 'uiFieldName', key: 'uiFieldName', sortable: false },
        { title: 'Error Description', text: 'Error Description', value: 'description', key: 'description', sortable: false }
      ],
      modalStudent: {},
      dialog: false,
    };
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
  },
  mounted() {

  },
  methods: {
    openSearchDemographicsModal() {
      this.setModalStudentFromRequestStudent();
      this.dialog = true;
    },
    formatTableColumn(format, column) {
      return (format && column) ? format(column) : (column || ' ');
    },
    setModalStudentFromRequestStudent(){
      this.modalStudent = deepCloneObject(this.studentDetails);
    },
    async closeDialog() {
      this.dialog = false;
      this.$emit('modifySearchParams');
    },
    searchStudent() {
      const searchParams = {
        legalLastName: this.student.legalLastName?? null,
        legalFirstName: this.student.legalFirstName?? null,
        legalMiddleNames: this.student.legalMiddleNames?? null,
        usualFirstName: this.student.usualFirstName?? null,
        usualMiddleNames: this.student.usualMiddleNames?? null,
        usualLastName: this.student.usualLastName?? null,
        gradeCode: this.student.enrolledGradeCode?? null,
        postalCode: null,
        genderCode: this.student.gender?? null,
        dob: this.student.dob? formatDob(this.student.dob) : null,
      };

      const route = this.$router.resolve({name: 'basicSearch', query: { ...searchParams }});
      window.open(route.href, '_blank');
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

  :deep(.v-data-table-footer){
      display: none;
  }
</style>
