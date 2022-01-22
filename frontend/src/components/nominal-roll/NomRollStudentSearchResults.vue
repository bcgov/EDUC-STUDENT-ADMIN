<template>
  <div id="searchResults" class="px-3" style="width: 100%" :overlay=false>
    <v-row no-gutters class="d-flex align-start">
      <h3 id="numberResults" class="px-2 pb-2"><strong>{{ nomRollStudentSearchResponse.totalElements }} Records</strong></h3>
      <v-spacer/>
      <PrimaryButton id="goBack" @click.native="clickGoBack" text="Back"></PrimaryButton>
      <v-flex class="select ml-3 mr-1">
        <v-select
          id="selectStatus"
          :items="studentStatuses"
          v-model="selectedStudentStatus"
          dense
          outlined
          placeholder="Filter by status"
          color="#38598a"
          append-icon="mdi-chevron-down"
          :menu-props="{ offsetY: true }"
          clearable
        ></v-select>
      </v-flex>
      <PrimaryButton id="viewSelected" v-if="selected" :disabled="!viewSelectionEnabled" @click.native="clickViewSelected" text="View Selected"></PrimaryButton>
      <PrimaryButton id="viewDetails" v-else :loading="loadingRequestIDs" :disabled="!viewDetailsEnabled" @click.native="clickViewDetails" text="View Details"></PrimaryButton>
      <PrimaryButton id="postRecords" class="ml-1" :loading="processing" :disabled="isPosted" @click.native="clickPostRecords" text="Post"></PrimaryButton>
    </v-row>
    <v-divider class="mb-1 subheader-divider"/>
    <v-data-table
      id="dataTable"
      v-model="selectedRecords"
      :headers="headers"
      :items="nomRollStudentSearchResponse.content"
      :page.sync="pageNumber"
      :items-per-page="nomRollStudentSearchResponse.pageable.pageSize"
      hide-default-footer
      item-key="nominalRollStudentID"
      :loading="loading"
      @page-count="nomRollStudentSearchResponse.pageable.pageNumber = $event"
      :expanded="expanded"
    >
      <template v-for="h in headers" v-slot:[`header.${h.value}`]="{ header }">
        <span :title="header.tooltip" :key="h.id" class="column-item">
          {{ header.text }}
        </span>
      </template>
      <template v-slot:item="props">
        <tr :class="{'selected-record' : props.item.isSelected}" @click="selectItem(props.item)">
          <td v-for="header in props.headers" :key="header.id" :class="header.id">
            <v-checkbox v-if="header.type" class="record-checkbox header-checkbox" color="#606060" v-model="props.item.isSelected" @click.stop="handleRecordCheckBoxClicked(props.item)"></v-checkbox>
            <div v-else class="table-cell">
              <span class="column-item">
                <v-tooltip v-if="header.value === 'mincode'" right>
                  <template v-slot:activator="{ on }">
                    <span v-on="on">{{ props.item[header.value] }}</span>
                  </template>
                  <span>{{getSchoolName(props.item) }}</span>
                </v-tooltip>
                <span v-else-if="header.value === 'status'">
                  <NomRollStudentStatusChip
                    :statusCode="props.item[header.value]"
                  ></NomRollStudentStatusChip>
                  <v-icon
                    v-if="!isEmpty(props.item.validationErrors) && EDIT_NOMINAL_ROLL_ROLE"
                    @click.native="toggleRow(props.item)"
                  >{{ rowExpandedIcon }}</v-icon>
                </span>
                <span v-else-if="props.item.validationErrors[header.text]" style="color: red">
                  {{ formatTableColumn(header.format, props.item[header.value]) }}
                  <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                      <v-icon
                        color="red"
                        small
                        v-bind="attrs"
                        v-on="on"
                      >mdi-alert</v-icon>
                    </template>
                    {{props.item.validationErrors[header.text]}}
                  </v-tooltip>
                </span>
                <span v-else>{{ formatTableColumn(header.format, props.item[header.value]) || '' }}</span>
              </span>
            </div>
          </td>
        </tr>
      </template>
      <template v-slot:expanded-item="{ headers, item }">
        <td style="border-bottom: 1px solid #ececec;" :colspan="headers.length">
          <v-form v-model="validForm" ref="form" lazy-validation>
            <v-row class="px-4">
              <v-col class="pb-0 pt-7">
                <v-autocomplete v-model="editedRecord.schoolDistrictNumber"
                                :disabled="!item.validationErrors['School District'] && !validationErrors['School District']"
                                outlined dense name="1" label="School District"
                                :items="districtCodesObjectSorted"
                                :rules="[!validationErrors['School District'] || validationErrors['School District']]"
                ></v-autocomplete>
              </v-col>
              <v-col class="pb-0 pt-7">
                <v-row>
                  <v-col class="pa-0" :cols="item.validationErrors['School Number'] || validationErrors['School Number'] ? 10 : 12">
                    <v-text-field v-model="editedRecord.schoolNumber"
                                  :disabled="!item.validationErrors['School Number'] && !validationErrors['School Number']"
                                  outlined dense name="2" label="School Number"
                                  :rules="[!validationErrors['School Number'] || validationErrors['School Number']]"
                    ></v-text-field>
                  </v-col>
                  <v-col v-if="item.validationErrors['School Number'] || validationErrors['School Number']" class="pa-0">
                    <MapSchoolCodeModal :fedCode="editedRecord.schoolNumber" @change='updateMincode(editedRecord)'/>
                  </v-col>
                </v-row>
              </v-col>
              <v-col class="pb-0 pt-7">
                <v-autocomplete v-model="editedRecord.schoolName"
                                :disabled="!item.validationErrors['School Name'] && !validationErrors['School Name']"
                                outlined dense name="3" label="School Name"
                                :items="mincodeSchoolNamesObjectSorted"
                                :rules="[!validationErrors['School Name'] || validationErrors['School Name']]"
                ></v-autocomplete>
              </v-col>
              <v-col class="pb-0 pt-7">
                <v-autocomplete v-model="editedRecord.leaProvincial"
                                :disabled="!item.validationErrors['LEA/Provincial'] && !validationErrors['LEA/Provincial']"
                                outlined dense name="4" label="LEA/Provincial"
                                :items="leaProvincialItems"
                                :rules="[!validationErrors['LEA/Provincial'] || validationErrors['LEA/Provincial']]"
                ></v-autocomplete>
              </v-col>
              <v-col class="pb-0 pt-7">
                <v-text-field v-model="editedRecord.recipientNumber"
                              :disabled="!item.validationErrors['Recipient Number'] && !validationErrors['Recipient Number']"
                              outlined dense name="5" label="Recipient Number"
                              :rules="[!validationErrors['Recipient Number'] || validationErrors['Recipient Number']]"
                ></v-text-field>
              </v-col>
              <v-col class="pb-0 pt-7">
                <v-text-field v-model="editedRecord.fte"
                              :disabled="!item.validationErrors['FTE'] && !validationErrors['FTE']"
                              outlined dense name="51" label="FTE"
                              :rules="[!validationErrors['FTE'] || validationErrors['FTE']]"
                ></v-text-field></v-col>
              <v-col class="pb-0 pt-7">
                <v-text-field v-model="editedRecord.surname"
                              :disabled="!item.validationErrors['Surname'] && !validationErrors['Surname']"
                              outlined dense name="52" label="Surname"
                              :rules="[!validationErrors['Surname'] || validationErrors['Surname']]"
                ></v-text-field></v-col>
              <v-col class="pb-0 pt-7">
                <v-autocomplete v-model="editedRecord.gender"
                                :disabled="!item.validationErrors['Gender'] && !validationErrors['Gender']"
                                outlined dense name="4" label="Gender"
                                :items="genders"
                                item-text="label"
                                item-value="genderCode"
                                :rules="[!validationErrors['Gender'] || validationErrors['Gender']]"
                ></v-autocomplete>
              </v-col>
              <v-col class="pb-0 pt-7">
                <v-menu
                  v-model="dateMenu"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  offset-y
                >
                  <template v-slot:activator="{ on }">
                    <v-text-field
                      id="date-picker-text-field"
                      :value="editedRecord.birthDate"
                      outlined
                      dense
                      readonly
                      v-on="on"
                      :disabled="!item.validationErrors['Birth Date'] && !validationErrors['Birth Date']"
                      :rules="[!validationErrors['Birth Date'] || validationErrors['Birth Date']]"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    id="date-picker"
                    v-model="editedRecord.birthDate"
                    no-title
                  >
                    <v-spacer></v-spacer>
                    <PrimaryButton id="date-picker-ok-button" text="OK" @click.native="dateMenu=false"> </PrimaryButton>
                  </v-date-picker>
                </v-menu>
              </v-col>
              <v-col class="pb-0 pt-7">
                <v-autocomplete v-model="editedRecord.grade"
                                :disabled="!item.validationErrors['Grade'] && !validationErrors['Grade']"
                                outlined dense name="4" label="Grade"
                                :items="gradeCodeObjects"
                                item-text="label"
                                item-value="gradeCode"
                                :rules="[!validationErrors['Grade'] || validationErrors['Grade']]"
                ></v-autocomplete>
              </v-col>
              <v-col class="pb-0 pt-7">
                <PrimaryButton width="100%" text="Save" :disabled="!validForm" @click.native="updateRequest(item)" :loading="updating"></PrimaryButton>
              </v-col>
            </v-row>
          </v-form>
        </td>
      </template>
    </v-data-table>
    <v-row class="pt-2" justify="end">
      <v-col cols="4">
        <v-pagination color="#38598A" v-model="pageNumber" :length="nomRollStudentSearchResponse.totalPages"></v-pagination>
      </v-col>
      <v-col cols="4" id="currentItemsDisplay">
        Showing {{ showingFirstNumber }} to {{ showingEndNumber }} of {{ nomRollStudentSearchResponse.totalElements || 0 }}
      </v-col>
    </v-row>
  </div>
</template>

<script>
import {mapGetters, mapMutations, mapState} from 'vuex';
import PrimaryButton from '../util/PrimaryButton';
import NomRollStudentStatusChip from './NomRollStudentStatusChip';
import {uniqBy, values, partialRight} from 'lodash';
import router from '../../router';
import {NOMINAL_ROLL_STUDENT_STATUS_CODES, NOMINAL_ROLL_STUDENT_STATUSES, Routes} from '../../utils/constants';
import ApiService from '@/common/apiService';
import {formatDob, formatPen, formatGrade, formatDistrictNumber} from '@/utils/format';
import {constructPenMatchObjectFromNominalRollStudent, deepCloneObject, getPossibleMatches} from '../../utils/common';
import alertMixin from '@/mixins/alertMixin';
import MapSchoolCodeModal from './MapSchoolCodeModal';

export default {
  name: 'NomRollStudentSearchResults',
  mixins: [alertMixin],
  components: {
    PrimaryButton,
    NomRollStudentStatusChip,
    MapSchoolCodeModal,
  },
  props: {
    loading: {
      type: Boolean,
      required: true
    },
    isPosted: {
      type: Boolean,
      required: true
    },
  },
  watch: {
    dateMenu (val) {
      val && setTimeout(() => (this.activePicker = 'YEAR'));
    },
    editedRecord: {
      handler() {
        this.validateRecord();
      },
      deep: true
    },
    notification(val) {
      if (val) {
        const notificationData = val;
        if (this.sagaId && notificationData && this.sagaId === notificationData.sagaId  && notificationData.sagaStatus === 'COMPLETED') {
          if (notificationData.sagaName === 'NOMINAL_ROLL_POST_DATA_SAGA') {
            this.setSuccessAlert('Success! Your request to post nominal roll data is completed.');
            this.$emit('update:isPosted', true);
          }
          this.processing = false;
        }
      }
    },
  },
  data () {
    return {
      dateMenu: false,
      expanded: [],
      editedRecord: {},
      itemsPerPage: 10,
      headers: [
        { id: 'table-checkbox', type: 'select', sortable: false },
        { text: 'Mincode', align: 'start', sortable: false, value: 'mincode', tooltip: 'Mincode' },
        {text: 'School District', value: 'schoolDistrictNumber', sortable: false, tooltip: 'School District', format: formatDistrictNumber},
        {text: 'School Number', value: 'schoolNumber', sortable: false, tooltip: 'School Number'},
        {text: 'School Name', value: 'schoolName', sortable: false, tooltip: 'School Name'},
        {text: 'LEA/Provincial', value: 'leaProvincial', sortable: false, tooltip: 'LEA/Provincial'},
        {text: 'Recipient Number', value: 'recipientNumber', sortable: false, tooltip: 'Recipient Number'},
        {text: 'Recipient Name', value: 'recipientName', sortable: false, tooltip: 'Recipient Name'},
        {text: 'FTE', value: 'fte', sortable: false, tooltip: 'FTE'},
        {text: 'Identity', value: 'identity', sortable: false, tooltip: 'Identity'},
        {text: 'Surname', value: 'surname', sortable: false, tooltip: 'Legal Surname'},
        {text: 'Given Name(s)', value: 'givenNames', sortable: false, tooltip: 'Legal Given Name'},
        {text: 'Initial', value: 'initial', sortable: false, tooltip: 'Initial'},
        {text: 'Gender', value: 'gender', sortable: false, tooltip: 'Gender'},
        {text: 'Birth Date', value: 'birthDate', sortable: false, tooltip: 'Birth Date', format: partialRight(formatDob,'uuuu-MM-dd','uuuu/MM/dd')},
        {text: 'Grade', value: 'grade', sortable: false, tooltip: 'Grade Code', format: formatGrade},
        { text: 'Assigned PEN', value: 'assignedPEN', sortable: false, tooltip: 'Suggested PEN', format: formatPen },
        { text: 'Status', value: 'status', sortable: false, tooltip: 'Status' }
      ],
      leaProvincialItems: ['LEA', 'PROVINCIAL'],
      loadingRequestIDs: false,
      sysMatchedStatuses: ['AA','B1','C1','D1'],
      updating: false,
      validationErrors: {},
      validForm: true,
      processing: false,
      sagaId: null,
    };
  },
  async beforeMount() {
    if(!this.gradeCodeObjects || !this.genders) {
      this.$store.dispatch('student/getCodes');
    }
    if(this.isEmpty(this.mincodeSchoolNamesObjectSorted) || this.isEmpty(this.districtCodesObjectSorted)) {
      this.$store.dispatch('app/getCodes');
    }
  },
  computed: {
    ...mapState('nomRollStudentSearch', ['nomRollStudentSearchResponse', 'nomRollStudentSearchCriteria', 'currentNomRollStudentSearchParams']),
    ...mapGetters('student', ['genders','gradeCodeObjects']),
    ...mapState('app', ['mincodeSchoolNames', 'districtCodes']),
    ...mapGetters('app', ['mincodeSchoolNamesObjectSorted', 'districtCodesObjectSorted']),
    ...mapGetters('auth', ['EDIT_NOMINAL_ROLL_ROLE']),
    ...mapState('nominalRoll', ['fedProvSchoolCodes']),
    ...mapGetters('notifications', ['notification']),
    pageNumber: {
      get(){
        return this.$store.state['nomRollStudentSearch'].pageNumber;
      },
      set(newPage){
        this.$store.state['nomRollStudentSearch'].pageNumber = newPage;
      }
    },
    selectedRecords: {
      get(){
        return this.$store.state['nomRollStudentSearch'].selectedRecords;
      },
      set(newRecords){
        this.$store.state['nomRollStudentSearch'].selectedRecords = newRecords;
      }
    },
    showingFirstNumber() {
      return ((this.pageNumber-1) * (this.nomRollStudentSearchResponse.pageable.pageSize || 0) + ((this.nomRollStudentSearchResponse.numberOfElements || 0) > 0 ? 1 : 0));
    },
    showingEndNumber() {
      return ((this.pageNumber-1) * (this.nomRollStudentSearchResponse.pageable.pageSize || 0) + (this.nomRollStudentSearchResponse.numberOfElements || 0));
    },
    studentStatuses() {
      return NOMINAL_ROLL_STUDENT_STATUSES.filter(status => status.value !== 'LOADED');
    },
    selectedStudentStatus: {
      get(){
        return this.$store.state['nomRollStudentSearch'].selectedStudentStatus;
      },
      set(status){
        this.$store.state['nomRollStudentSearch'].selectedStudentStatus = status;
      }
    },
    selected() {
      return this.selectedRecords.length > 0 || this.selectedStudentStatus || (this.currentNomRollStudentSearchParams && values(this.currentNomRollStudentSearchParams).some(v => !!v));
    },
    viewSelectionEnabled() {
      return this.nomRollStudentSearchResponse.totalElements > 0 && !this.loading && !this.hasOnlyErrorRecordsInList() && !this.hasErrorRecordsSelected();
    },
    viewDetailsEnabled() {
      return this.nomRollStudentSearchResponse.totalElements > 0 && !this.loading && !this.hasErrorRecordsSelected();
    },
    rowExpandedIcon() {
      return !this.isEmpty(this.expanded)?'mdi-chevron-up':'mdi-chevron-down';
    }
  },
  methods: {
    ...mapMutations('nomRollStudentSearch', ['setSelectedRecords']),
    ...mapMutations('setNavigation', ['setSelectedIDs', 'setRequestType', 'setMultiFiles']),
    formatTableColumn(format, column) {
      return (format && column) ? format(column) : (column || ' ');
    },
    getSchoolName(request) {
      return this.$store.state['app'].mincodeSchoolNames.get(request?.mincode?.replace(' ',''));
    },
    hasErrorRecordsSelected(){
      let filteredError = this.selectedRecords.filter(record =>  record.status === 'ERROR');
      if(filteredError.length > 0) {
        return true;
      }
      return false;
    },
    hasOnlyErrorRecordsInList(){
      let filteredError = this.nomRollStudentSearchResponse.content.filter(record =>  record.status === 'ERROR');
      if(filteredError.length === this.nomRollStudentSearchResponse.content.length) {
        return true;
      }
      return false;
    },
    clickViewSelected() {
      if(this.selectedRecords?.length > 0) {
        this.setSelectedIDs(this.selectedRecords);
        this.setRequestType('nominalRoll');
        this.setMultiFiles(false);
        router.push({name: 'nrStudentDetails', params: {nrStudentID: this.selectedRecords[0].nominalRollStudentID}});
      } else {
        this.clickViewDetails();
      }
    },
    clickViewDetails() {
      this.loadingRequestIDs = true;
      let searchCriteria = {};
      let statusCodes = null;
      let processingYear = null;
      this.nomRollStudentSearchCriteria[0].searchCriteriaList.forEach(obj => {
        switch (obj.key) {
        case ('status'):
          if(obj.operation === 'neq') { //default search criteria for archived files is a not equals, so we have to account for that
            statusCodes = Object.values(NOMINAL_ROLL_STUDENT_STATUS_CODES).filter(code => code !== obj.value && code !== 'ERROR').join(',');
          } else {
            statusCodes = obj.value;
          }
          break;
        case ('processingYear'):
          processingYear = obj.value;
          break;
        case ('givenNames'):
          searchCriteria.givenNames = obj.value + '%'; //appending '%' for like query
          break;
        case ('surname'):
          searchCriteria.surname = obj.value + '%';
          break;
        default:
          searchCriteria[obj.key] = obj.value;
          break;
        }
      });
      const query = {
        params: {
          processingYear,
          statusCodes,
          searchCriteria
        }
      };
      ApiService.apiAxios.get(`${Routes['nominalRoll'].ROOT_ENDPOINT}/nominalRollStudentIDs`, query)
        .then(response => {
          this.setSelectedIDs(response.data);
          this.setRequestType('nominalRoll');
          this.setMultiFiles(false);
          router.push({name: 'nrStudentDetails', params: {nrStudentID: response.data[0].nominalRollStudentID}});
        })
        .finally(() => {
          this.loadingRequestIDs = false;
        })
        .catch(error => {
          this.setFailureAlert('An error occurred while fetching nominal roll students! Please try again later.');
          console.log(error);
        });
    },
    handleRecordCheckBoxClicked(item) {
      this.selectRecord(item);
    },
    selectItem(item) {
      item.isSelected = !item.isSelected;
      this.selectRecord(item);
    },
    selectRecord(item) {
      if (item.isSelected) {
        const selectedRecordsFromCurrentData = this.nomRollStudentSearchResponse.content.filter(file => file.isSelected);
        let newSelectedRecords = [...this.selectedRecords, ...selectedRecordsFromCurrentData];
        newSelectedRecords = uniqBy(newSelectedRecords, a => a.nominalRollStudentID);
        this.setSelectedRecords(newSelectedRecords);
      } else {
        const newSelectedRecords = this.selectedRecords.filter(rec => rec.nominalRollStudentID !== item.nominalRollStudentID);
        this.setSelectedRecords(newSelectedRecords);
      }
    },
    isEmpty(obj) {
      return Object.keys(obj).length === 0;
    },
    async toggleRow(item) {
      const index = this.expanded.indexOf(item);
      if (index === -1) {
        this.validationErrors = item?.validationErrors || {};
        this.editedRecord = deepCloneObject(item);
        this.editedRecord.schoolDistrictNumber = formatDistrictNumber(this.editedRecord.schoolDistrictNumber);
        this.editedRecord.grade = formatGrade(this.editedRecord.grade);
        if (this.expanded.length > 0) {
          this.expanded = [];
        }
        this.expanded.push(item);
        await this.$nextTick();
        this.$refs.form.validate();
      } else {
        this.expanded.splice(index, 1);
      }
    },
    async updateRequest(item) {
      this.updating = true;
      try {
        if(!this.isEmpty(this.validationErrors)) {
          this.setWarningAlert('Cannot update record due to validation errors. Please fix and try again.');
        } else {
          const matchResult = await getPossibleMatches(constructPenMatchObjectFromNominalRollStudent(this.editedRecord));
          const updateRequest = deepCloneObject(this.editedRecord);
          updateRequest.schoolDistrictNumber = updateRequest.schoolDistrictNumber.replace(/^0+/, '');
          updateRequest.grade = updateRequest.grade.replace(/^0/, '');
          if (this.sysMatchedStatuses?.includes(matchResult?.penStatus) && matchResult.data[0]) {
            updateRequest.assignedPEN = matchResult.data[0].pen;
            updateRequest.status = NOMINAL_ROLL_STUDENT_STATUS_CODES.MATCHEDSYS;
            this.setSuccessAlert('System has automatically found a match! Record will be updated.');
          } else {
            updateRequest.status = NOMINAL_ROLL_STUDENT_STATUS_CODES.FIXABLE;
            this.setWarningAlert('System was unable to find a direct match. The record will be set as fixable.');
          }
          ApiService.apiAxios.put(`${Routes['nominalRoll'].ROOT_ENDPOINT}/${this.editedRecord.nominalRollStudentID}`, updateRequest)
            .then(response => {
              this.toggleRow(item);
              this.updateMincode(response.data);
              Object.assign(item, response.data);
              this.setSuccessAlert('Record has been successfully updated.');
            })
            .catch(e => {
              console.log(e);
              this.setFailureAlert('Failed to update record. Please try again later.');
            });
        }
      } catch(e) {
        console.log(e);
        this.setFailureAlert('Failed to update record. There was an error during pen match. Please try again later.');
      }
      this.updating = false;
    },
    async validateRecord() {
      const payload = {
        ...this.editedRecord
      };
      const response = await ApiService.apiAxios.post(`${Routes['nominalRoll'].ROOT_ENDPOINT}/validate`, payload);
      this.validationErrors = response?.data?.validationErrors || {};
    },
    clickGoBack() {
      router.push({name: 'nominal-roll'});
    },
    updateMincode(rec) {
      rec.mincode = this.fedProvSchoolCodes.find(obj => obj.federalCode === rec.schoolNumber)?.provincialCode || rec.schoolNumber;
    },
    clickPostRecords() {
      this.processing = true;
      const payload = {};
      ApiService.apiAxios.post(`${Routes['nominalRoll'].ROOT_ENDPOINT}/postData`, payload)
        .then((response) => {
          this.sagaId = response.data;
          this.setSuccessAlert('Your request to post nominal roll data is accepted.');
        })
        .catch(error => {
          console.log(error);
          this.processing = false;
          if (error?.response?.status === 409) {
            this.setFailureAlert(error?.response?.data?.message || 'Another saga is in progress for this file, please try again later.');
          } else {
            this.setFailureAlert('An error occurred while posting nominal roll data. Please try again later.');
          }
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
  .column-item {
    float: left;
  }
  .table-checkbox {
    margin-top: 0;
    padding-top: 0;
    padding-left: 0.5rem !important;
    padding-right: 0.5rem !important;
  }
  .table-checkbox /deep/ .v-input__slot {
    padding-top: 0;
  }
  .table-cell {
    cursor: pointer;
  }

  #searchResults /deep/ .v-pagination__navigation > i {
    padding-left: 0;
  }

  .subheader-divider {
    border-width: 0.25ex 0 0 0;
  }

  #dataTable /deep/ table th{
    font-size: 0.875rem;
  }
  #dataTable /deep/ table tr.selected-record,
  #dataTable /deep/ table tbody tr:hover { 
    background-color: #E1F5FE
  }

  #dataTable /deep/ table { 
    border-bottom: thin solid #d7d7d7;
  }

  #dataTable /deep/ table tr td{
    text-align: center !important;
    vertical-align: top;
    padding-top: 0.5rem;
    padding-bottom: 0.3rem;
  }

  .record-checkbox {
    margin-top: 0;
  }
  .record-checkbox /deep/ .v-input__slot {
    margin-bottom: 0;
  }
  .record-checkbox /deep/ .v-input__slot .v-input--selection-controls__input {
    margin-right: 0;
  }

  .header-checkbox {
    padding-top: 0;
  }
  .header-checkbox /deep/ .v-input__slot {
    padding-top: 0;
  }

  .select {
    max-width: 245px;
  }
</style>
