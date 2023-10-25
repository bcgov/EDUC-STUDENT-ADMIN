<template>
  <div
    id="searchResults"
    class="px-3"
    style="width: 100%"
    :overlay="false"
  >
    <v-row
      no-gutters
      class="d-flex align-start"
    >
      <v-col class="justify-start d-flex">
        <h3
          id="numberResults"
          class="px-2 pb-2"
        >
          <strong>{{ nomRollStudentSearchResponse.totalElements }} Records</strong>
        </h3>
      </v-col>
      <v-col
        v-if="!hasReadOnlyRoleAccess()"
        class="d-flex justify-end"
      >
        <v-row>
          <v-col class="d-flex justify-end">
            <div
              style="min-width: 245px;"
              class="mr-1"
            >
              <v-select
                id="selectStatus"
                v-model="selectedStudentStatus"
                :items="studentStatuses"
                item-title="text"
                item-value="value"
                density="compact"
                variant="outlined"
                placeholder="Filter by status"
                color="#38598a"
                clearable
              />
            </div>
            <PrimaryButton
              v-if="!canIgnore"
              id="unignoreRecord"
              class="mt-1"
              :disabled="!canRecover || isPosted"
              text="Recover Record"
              @click-action="clickRecover"
            />
            <PrimaryButton
              v-else
              id="ignoreRecord"
              class="mt-1"
              :disabled="!canIgnore || isPosted"
              text="Ignore Record"
              @click-action="clickIgnore"
            />
            <PrimaryButton
              v-if="selected"
              id="viewSelected"
              class="ml-1 mt-1"
              :disabled="!viewSelectionEnabled || isPosted"
              text="View Selected"
              @click-action="clickViewSelected"
            />
            <PrimaryButton
              v-else
              id="viewDetails"
              class="ml-1 mt-1"
              :loading="loadingRequestIDs"
              :disabled="!viewDetailsEnabled || hasReadOnlyRoleAccess() || isPosted"
              text="View Details"
              @click-action="clickViewDetails"
            />
            <PrimaryButton
              id="postRecords"
              class="ml-1 mt-1"
              :loading="processing"
              :disabled="isPosted || hasReadOnlyRoleAccess()"
              text="Post"
              @click-action="clickPostRecords"
            />
            <PrimaryButton
              id="exportIgnored"
              class="ml-1 mt-1"
              :loading="processing"
              :disabled="hasReadOnlyRoleAccess() || !hasFilterOnlyIgnored()"
              text="Export Ignored"
              @click-action="retrieveAndDownloadIgnoredPenRequests"
            />
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    <v-divider class="mb-1 subheader-divider" />
    <v-data-table-server
      id="dataTable"
      v-model="selectedRecords"
      v-model:page="pageNumber"
      v-model:expanded="expanded"
      v-model:items="nomRollStudentSearchResponse.content"
      v-model:items-length="nomRollStudentSearchResponse.totalElements"
      v-model:items-per-page="nomRollStudentSearchResponse.pageable.pageSize"
      :headers="headers"
      item-value="nominalRollStudentID"
      item-key="nominalRollStudentID"
      :loading="loading"
    >
      <template
        v-for="h in headers"
        :key="h.id"
        #[`column.${h.value}`]="{ column }"
      >
        <span
          :title="column.tooltip"
          class="column-item"
        >
          {{ column.text }}
        </span>
      </template>
      <template #item="item">
        <tr
          :class="{'selected-record' : item.item.isSelected}"
        >
          <td
            v-for="header in item.columns"
            :key="header.id"
            :class="header.id"
          >
            <v-checkbox
              v-if="header.type && !hasReadOnlyRoleAccess()"
              v-model="item.item.isSelected"
              class="record-checkbox header-checkbox"
              color="#606060"
              @click="handleRecordCheckBoxClicked(item.item)"
            />
            <div
              v-else
              class="table-cell"
            >
              <span
                class="column-item mt-2"
                style="text-align: left;"
              >
                <v-tooltip
                  v-if="header.value === 'mincode'"
                  right
                >
                  <template #activator="{ on }">
                    <span>{{ item.item[header.value] }}</span>
                  </template>
                  <span>{{ getSchoolName(item.item) }}</span>
                </v-tooltip>
                <span v-else-if="header.value === 'status'">
                  <NomRollStudentStatusChip
                    :status-code="item.item[header.value]"
                  />
                  <v-icon
                    v-if="!isEmpty(item.item.validationErrors) && item.item.status !== 'IGNORED' && !hasReadOnlyRoleAccess()"
                    @click="toggleRow(item)"
                  >{{ rowExpandedIcon }}</v-icon>
                </span>
                <span
                  v-else-if="item.item.validationErrors[header.text] && item.item.status !== 'IGNORED'"
                  style="color: red"
                >
                  {{ formatTableColumn(header.format, item.item[header.value]) }}
                  <v-tooltip bottom>
                    <template #activator="{ on, props }">
                      <v-icon
                        color="red"
                        size="small"
                        icon="mdi-alert"
                        v-bind="props"
                      ></v-icon>
                    </template>
                    {{ item.item.validationErrors[header.text] }}
                  </v-tooltip>
                </span>
                <span v-else>{{ formatTableColumn(header.format, item.item[header.value]) || '' }}</span>
              </span>
            </div>
          </td>
        </tr>
      </template>
      <template #expanded-row="{ columns, item }">
        <tr>
          <td
            style="border-bottom: 1px solid #ececec;"
            :colspan="columns.length"
          >
            <v-form
              ref="form"
              v-model="validForm"
              lazy-validation
              :disabled="validatingRecord"
            >
              <v-row class="px-4 py-3">
                <v-col class="pb-0">
                  <v-autocomplete
                    v-model="editedRecord.schoolDistrictNumber"
                    :disabled="!item.validationErrors['School District'] && !validationErrors['School District'] || hasReadOnlyRoleAccess()"
                    variant="outlined"
                    density="compact"
                    name="1"
                    label="School District"
                    :items="districtCodesObjectSorted"
                    :rules="[!validationErrors['School District'] || validationErrors['School District']]"
                  />
                </v-col>
                <v-col class="pb-0">
                  <v-row no-gutters>
                    <v-col
                      class="pa-0"
                      :cols="item.validationErrors['School Number'] || validationErrors['School Number'] ? 10 : 12"
                    >
                      <v-text-field
                        v-model="editedRecord.schoolNumber"
                        :disabled="!item.validationErrors['School Number'] && !validationErrors['School Number'] || hasReadOnlyRoleAccess()"
                        variant="outlined"
                        density="compact"
                        name="2"
                        label="School Number"
                        :rules="[!validationErrors['School Number'] || validationErrors['School Number']]"
                      />
                    </v-col>
                    <v-col
                      v-if="item.validationErrors['School Number'] || validationErrors['School Number']"
                      class="pa-0"
                    >
                      <v-row
                        no-gutters
                        align="center"
                        justify="center"
                      >
                        <v-col>
                          <MapSchoolCodeModal
                            :fed-code="editedRecord.schoolNumber"
                            @addFedProvCode="addFedProvCode(editedRecord)"
                          />
                        </v-col>
                      </v-row>
                    </v-col>
                  </v-row>
                </v-col>
                <v-col class="pb-0">
                  <v-autocomplete
                    v-model="editedRecord.schoolName"
                    :disabled="!item.validationErrors['School Name'] && !validationErrors['School Name'] || hasNoEditRoleAccess()"
                    variant="outlined"
                    density="compact"
                    name="3"
                    label="School Name"
                    :items="mincodeSchoolNamesObjectSorted"
                    :rules="[!validationErrors['School Name'] || validationErrors['School Name']]"
                  />
                </v-col>
                <v-col class="pb-0">
                  <v-autocomplete
                    v-model="editedRecord.leaProvincial"
                    :disabled="!item.validationErrors['LEA/Provincial'] && !validationErrors['LEA/Provincial'] || hasNoEditRoleAccess()"
                    variant="outlined"
                    density="compact"
                    name="4"
                    label="LEA/Provincial"
                    :items="leaProvincialItems"
                    :rules="[!validationErrors['LEA/Provincial'] || validationErrors['LEA/Provincial']]"
                  />
                </v-col>
                <v-col class="pb-0">
                  <v-text-field
                    v-model="editedRecord.recipientNumber"
                    :disabled="!item.validationErrors['Recipient Number'] && !validationErrors['Recipient Number'] || hasNoEditRoleAccess()"
                    variant="outlined"
                    density="compact"
                    name="5"
                    label="Recipient Number"
                    :rules="[!validationErrors['Recipient Number'] || validationErrors['Recipient Number']]"
                  />
                </v-col>
                <v-col class="pb-0">
                  <v-text-field
                    v-model="editedRecord.fte"
                    :disabled="!item.validationErrors['FTE'] && !validationErrors['FTE'] || hasNoEditRoleAccess()"
                    variant="outlined"
                    density="compact"
                    name="51"
                    label="FTE"
                    :rules="[!validationErrors['FTE'] || validationErrors['FTE']]"
                  />
                </v-col>
                <v-col class="pb-0">
                  <v-text-field
                    v-model="editedRecord.surname"
                    :disabled="!item.validationErrors['Surname'] && !validationErrors['Surname'] || hasNoEditRoleAccess()"
                    variant="outlined"
                    density="compact"
                    name="52"
                    label="Surname"
                    :rules="[!validationErrors['Surname'] || validationErrors['Surname']]"
                  />
                </v-col>
                <v-col class="pb-0">
                  <v-autocomplete
                    v-model="editedRecord.gender"
                    :disabled="!item.validationErrors['Gender'] && !validationErrors['Gender'] || hasNoEditRoleAccess()"
                    variant="outlined"
                    density="compact"
                    name="53"
                    label="Gender"
                    :items="genders"
                    item-title="label"
                    item-value="genderCode"
                    :rules="[!validationErrors['Gender'] || validationErrors['Gender']]"
                  />
                </v-col>
                <v-col class="pb-0">
                  <v-text-field
                    id="date-picker-text-field"
                    :value="editedRecord.birthDate"
                    variant="outlined"
                    density="compact"
                    :disabled="!item.validationErrors['Birth Date'] && !validationErrors['Birth Date'] || hasNoEditRoleAccess()"
                    :rules="[!validationErrors['Birth Date'] || validationErrors['Birth Date']]"
                    type="date"
                    clearable
                    @update:model-value="validateForm"
                  />
                </v-col>
                <v-col class="pb-0">
                  <v-autocomplete
                    v-model="editedRecord.grade"
                    :disabled="!item.validationErrors['Grade'] && !validationErrors['Grade'] || hasNoEditRoleAccess()"
                    variant="outlined"
                    density="compact"
                    name="54"
                    label="Grade"
                    :items="gradeCodeObjects"
                    item-title="label"
                    item-value="gradeCode"
                    :rules="[!validationErrors['Grade'] || validationErrors['Grade']]"
                  />
                </v-col>
                <v-col class="pb-0">
                  <PrimaryButton
                    width="100%"
                    text="Save"
                    :disabled="!validForm || validatingRecord"
                    :loading="updating"
                    @click-action="updateRequest(item)"
                  />
                </v-col>
              </v-row>
            </v-form>
          </td>
        </tr>
      </template>
    </v-data-table-server>
    <ConfirmationDialog ref="confirmationDialogIgnore">
      <template #message />
    </ConfirmationDialog>
  </div>
</template>

<script>
import {mapActions, mapState} from 'pinia';
import PrimaryButton from '../util/PrimaryButton.vue';
import NomRollStudentStatusChip from './NomRollStudentStatusChip.vue';
import {uniqBy, values, partialRight} from 'lodash';
import router from '../../router';
import {
  NOMINAL_ROLL_STUDENT_STATUS_CODES,
  NOMINAL_ROLL_STUDENT_STATUSES,
  Routes, SEARCH_CONDITION,
  SEARCH_FILTER_OPERATION, SEARCH_VALUE_TYPE
} from '../../utils/constants';
import ApiService from '@/common/apiService';
import {formatDob, formatPen, formatGrade, formatDistrictNumber} from '@/utils/format';
import {constructPenMatchObjectFromNominalRollStudent, deepCloneObject, getPossibleMatches} from '../../utils/common';
import alertMixin from '@/mixins/alertMixin';
import MapSchoolCodeModal from './MapSchoolCodeModal.vue';
import ConfirmationDialog from '@/components/util/ConfirmationDialog.vue';
import {LocalDate} from '@js-joda/core';
import {notificationsStore} from '@/store/modules/notifications';
import {nominalRollStore} from '@/store/modules/nominalRoll';
import {authStore} from '@/store/modules/auth';
import {appStore} from '@/store/modules/app';
import {studentStore} from '@/store/modules/student';
import {nominalRollStudentSearchStore} from '@/store/modules/nomRollStudentSearch';
import {navigationStore} from '@/store/modules/setNavigation';

export default {
  name: 'NomRollStudentSearchResults',
  components: {
    PrimaryButton,
    NomRollStudentStatusChip,
    MapSchoolCodeModal,
    ConfirmationDialog
  },
  mixins: [alertMixin],
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
  data() {
    return {
      dateMenu: false,
      expanded: [],
      editedRecord: {},
      itemsPerPage: 10,
      validatingRecord: false,
      headers: [
        {id: 'table-checkbox', type: 'select', sortable: false},
        {
          title: 'Mincode',
          text: 'Mincode',
          align: 'start',
          sortable: false,
          value: 'mincode',
          key: 'mincode',
          tooltip: 'Mincode'
        },
        {
          text: 'School District',
          value: 'schoolDistrictNumber',
          sortable: false,
          tooltip: 'School District',
          format: formatDistrictNumber,
          key: 'schoolDistrictNumber'
        },
        {text: 'School Number', value: 'schoolNumber', sortable: false, tooltip: 'School Number', key: 'schoolNumber'},
        {text: 'School Name', value: 'schoolName', sortable: false, tooltip: 'School Name', key: 'schoolName'},
        {
          text: 'LEA/Provincial',
          value: 'leaProvincial',
          sortable: false,
          tooltip: 'LEA/Provincial',
          key: 'leaProvincial'
        },
        {
          text: 'Recipient Number',
          value: 'recipientNumber',
          sortable: false,
          tooltip: 'Recipient Number',
          key: 'recipientNumber'
        },
        {
          text: 'Recipient Name',
          value: 'recipientName',
          sortable: false,
          tooltip: 'Recipient Name',
          key: 'recipientName'
        },
        {text: 'FTE', value: 'fte', sortable: false, tooltip: 'FTE', key: 'fte'},
        {text: 'Surname', value: 'surname', sortable: false, tooltip: 'Legal Surname', key: 'surname'},
        {text: 'Given Name(s)', value: 'givenNames', sortable: false, tooltip: 'Legal Given Name', key: 'givenNames'},
        {text: 'Gender', value: 'gender', sortable: false, tooltip: 'Gender', key: 'gender'},
        {
          text: 'Birth Date',
          value: 'birthDate',
          sortable: false,
          tooltip: 'Birth Date',
          key: 'birthDate',
          format: partialRight(formatDob, 'uuuu-MM-dd', 'uuuu/MM/dd')
        },
        {text: 'Grade', value: 'grade', sortable: false, tooltip: 'Grade Code', format: formatGrade, key: 'grade'},
        {
          text: 'Assigned PEN',
          value: 'assignedPEN',
          sortable: false,
          tooltip: 'Suggested PEN',
          format: formatPen,
          key: 'assignedPEN'
        },
        {text: 'Status', value: 'status', sortable: false, tooltip: 'Status', key: 'status'}
      ],
      leaProvincialItems: ['LEA', 'PROVINCIAL'],
      loadingRequestIDs: false,
      sysMatchedStatuses: ['AA', 'B1', 'C1', 'D1'],
      updating: false,
      validationErrors: {},
      validForm: true,
      processing: false,
      sagaId: null,
    };
  },
  async beforeMount() {
    if (!this.gradeCodeObjects || !this.genders) {
      await studentStore().getCodes();
    }
    await appStore().getCodes();
  },
  computed: {
    ...mapState(nominalRollStudentSearchStore, ['nomRollStudentSearchResponse', 'nomRollStudentSearchCriteria', 'currentNomRollStudentSearchParams']),
    ...mapState(studentStore, ['genders', 'gradeCodeObjects']),
    ...mapState(appStore, ['mincodeSchoolNamesObjectSorted', 'districtCodesObjectSorted']),
    ...mapState(authStore, ['EDIT_NOMINAL_ROLL_ROLE', 'NOMINAL_ROLL_READ_ONLY_ROLE']),
    ...mapState(nominalRollStore, ['fedProvSchoolCodes']),
    ...mapState(notificationsStore, ['notification']),
    pageNumber: {
      get() {
        return nominalRollStudentSearchStore().pageNumber;
      },
      set(newPage) {
        nominalRollStudentSearchStore().setPageNumber(newPage);
      }
    },
    selectedRecords: {
      get() {
        return nominalRollStudentSearchStore().selectedRecords;
      },
      set(newRecords) {
        nominalRollStudentSearchStore().setSelectedRecords(newRecords);
      }
    },
    showingFirstNumber() {
      return ((this.pageNumber - 1) * (this.nomRollStudentSearchResponse.pageable.pageSize || 0) + ((this.nomRollStudentSearchResponse.numberOfElements || 0) > 0 ? 1 : 0));
    },
    showingEndNumber() {
      return ((this.pageNumber - 1) * (this.nomRollStudentSearchResponse.pageable.pageSize || 0) + (this.nomRollStudentSearchResponse.numberOfElements || 0));
    },
    studentStatuses() {
      return NOMINAL_ROLL_STUDENT_STATUSES.filter(status => status.value !== 'LOADED');
    },
    selectedStudentStatus: {
      get() {
        return nominalRollStudentSearchStore().selectedStudentStatus;
      },
      set(status) {
        nominalRollStudentSearchStore().setSelectedStudentStatus(status);
      }
    },
    selected() {
      return this.selectedRecords.length > 0 || this.selectedStudentStatus || (this.currentNomRollStudentSearchParams && values(this.currentNomRollStudentSearchParams).some(v => !!v));
    },
    canIgnore() {
      return this.selectedRecords.length > 0 && this.hasCanIgnoreRecordsSelectedOnly() && !this.hasReadOnlyRoleAccess();
    },
    canRecover() {
      return this.selectedRecords.length > 0 && this.hasRecoverOnlyRecordsSelected() && !this.hasReadOnlyRoleAccess();
    },
    viewSelectionEnabled() {
      return this.nomRollStudentSearchResponse.totalElements > 0 && !this.loading && !this.hasOnlyErrorRecordsInList() && !this.hasErrorRecordsSelected() && !this.hasIgnoreRecordsSelected() && !this.hasFilterOnlyIgnored();
    },
    viewDetailsEnabled() {
      return this.nomRollStudentSearchResponse.totalElements > 0 && !this.loading && !this.hasErrorRecordsSelected() && !this.hasIgnoreRecordsSelected() && !this.hasFilterOnlyIgnored();
    },
    rowExpandedIcon() {
      return !this.isEmpty(this.expanded) ? 'mdi-chevron-up' : 'mdi-chevron-down';
    }
  },
  methods: {
    ...mapActions(nominalRollStudentSearchStore, ['setSelectedRecords']),
    ...mapActions(navigationStore, ['setSelectedIDs', 'setRequestType', 'setMultiFiles']),
    formatTableColumn(format, column) {
      return (format && column) ? format(column) : (column || ' ');
    },
    getSchoolName(request) {
      return appStore().mincodeSchoolNames.get(request?.mincode?.replace(' ', ''));
    },
    hasNoEditRoleAccess() {
      return this.EDIT_NOMINAL_ROLL_ROLE === false || this.hasReadOnlyRoleAccess();
    },
    hasReadOnlyRoleAccess() {
      return this.NOMINAL_ROLL_READ_ONLY_ROLE === true;
    },
    hasFilterOnlyIgnored() {
      return this.selectedStudentStatus === 'IGNORED';
    },
    hasErrorRecordsSelected() {
      let filteredError = this.selectedRecords.filter(record => record.status === 'ERROR');
      return filteredError.length > 0;
    },
    hasIgnoreRecordsSelected() {
      let filteredError = this.selectedRecords.filter(record => record.status === 'IGNORED');
      return filteredError.length > 0;
    },
    hasCanIgnoreRecordsSelectedOnly() {
      let filteredError = this.selectedRecords.filter(record => record.status === 'FIXABLE' || record.status === 'ERROR');
      return (filteredError.length > 0 && filteredError.length === this.selectedRecords.length);
    },
    hasRecoverOnlyRecordsSelected() {
      let filteredError = this.selectedRecords.filter(record => record.status === 'IGNORED');
      return (filteredError.length > 0 && filteredError.length === this.selectedRecords.length);
    },
    hasOnlyErrorRecordsInList() {
      let filteredError = this.nomRollStudentSearchResponse.content.filter(record => record.status === 'ERROR');
      return (filteredError.length === this.nomRollStudentSearchResponse.content.length);
    },
    async validateForm() {
      const isValid = await this.$refs.form.validate();
      this.validForm = isValid.valid;
    },
    async clickIgnore() {
      if (this.selectedRecords?.length > 0) {
        const result = await this.confirmToProceedIgnore();
        if (!result) {
          return;
        }
        this.selectedRecords.forEach(obj => {
          this.ignoreStudent(obj);
        });
      }
    },
    async clickRecover() {
      if (this.selectedRecords?.length > 0) {
        this.selectedRecords.forEach(obj => {
          this.recoverStudent(obj);
        });
      }
    },
    /**
     * This method is ignore a student record.
     *
     * @returns {Promise<void>}
     */
    async ignoreStudent(student) {
      let payload;

      payload = {
        ...student,
        status: NOMINAL_ROLL_STUDENT_STATUS_CODES.IGNORED,
      };

      ApiService.apiAxios.put(`${Routes['nominalRoll'].ROOT_ENDPOINT}/${student.nominalRollStudentID}`, payload)
        .then(response => {
          if (response.data) {
            student.status = NOMINAL_ROLL_STUDENT_STATUS_CODES.IGNORED;
            this.setSuccessAlert('Success! The student record has been set to ignored.');
            this.collapseAll();
          }
        })
        .catch(error => {
          this.setFailureAlert('An error occurred while ignoring the student record. Please try again later.');
          console.log(error);
        });
    },
    /**
     * This method is recover a student record.
     *
     * @returns {Promise<void>}
     */
    async recoverStudent(student) {
      let payload;

      if (!this.isEmpty(student.validationErrors)) {
        payload = {
          ...student,
          status: NOMINAL_ROLL_STUDENT_STATUS_CODES.ERROR,
        };
      } else {
        payload = {
          ...student,
          status: NOMINAL_ROLL_STUDENT_STATUS_CODES.FIXABLE,
        };
      }

      ApiService.apiAxios.put(`${Routes['nominalRoll'].ROOT_ENDPOINT}/${student.nominalRollStudentID}`, payload)
        .then(response => {
          if (response.data) {
            student.status = payload.status;
            this.setSuccessAlert('Success! The student record has been recovered.');
          }
        })
        .catch(error => {
          this.setFailureAlert('An error occurred while ignoring the student record. Please try again later.');
          console.log(error);
        });
    },
    async confirmToProceedIgnore() {
      let result = true;
      result = await this.$refs.confirmationDialogIgnore.open('Are you sure you want to ignore these student record(s)?', 'All selected records will be ignored.',
        {
          width: '850px',
          messagePadding: 'px-4 pt-1',
          color: '',
          dark: false,
          titleBold: true,
          closeIcon: true,
          divider: true,
          resolveText: 'Confirm'
        });
      return result;
    },
    clickViewSelected() {
      if (this.selectedRecords?.length > 0) {
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
          if (obj.operation === 'neq') { //default search criteria for archived files is a not equals, so we have to account for that
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
    collapseAll() {
      this.expanded = [];
    },
    async toggleRow(item) {
      const index = this.expanded.indexOf(item.item.raw.nominalRollStudentID);
      if (index === -1) {
        this.validationErrors = item?.validationErrors || {};
        this.editedRecord = deepCloneObject(item.item.raw);
        if (this.editedRecord.schoolDistrictNumber) {
          this.editedRecord.schoolDistrictNumber = formatDistrictNumber(this.editedRecord.schoolDistrictNumber);
        }
        this.editedRecord.grade = formatGrade(this.editedRecord.grade);
        if (this.expanded.length > 0) {
          this.expanded = [];
        }
        this.expanded.push(item.item.raw.nominalRollStudentID);
        await this.$nextTick();
        await this.$refs.form.validate();
      } else {
        this.expanded.splice(index, 1);
      }
    },
    async updateRequest(item) {
      this.updating = true;
      try {
        if (!this.isEmpty(this.validationErrors)) {
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
      } catch (e) {
        console.log(e);
        this.setFailureAlert('Failed to update record. There was an error during pen match. Please try again later.');
      }
      this.updating = false;
    },
    async validateRecord() {
      this.validatingRecord = true;
      const payload = {
        ...this.editedRecord
      };
      const response = await ApiService.apiAxios.post(`${Routes['nominalRoll'].ROOT_ENDPOINT}/validate`, payload);
      this.validationErrors = response?.data?.validationErrors || {};
      await this.validateForm();
      this.validatingRecord = false;
    },
    updateMincode(rec) {
      rec.mincode = this.fedProvSchoolCodes.find(obj => obj.federalCode === rec.schoolNumber)?.provincialCode || rec.schoolNumber;
    },
    addFedProvCode(rec) {
      this.updateMincode(rec);
      this.$emit('addFedProvCode');
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
    },
    retrieveAndDownloadIgnoredPenRequests() {
      let optionalCriteriaList = [];
      optionalCriteriaList.push({
        key: 'status',
        operation: SEARCH_FILTER_OPERATION.EQUAL,
        value: 'IGNORED',
        valueType: SEARCH_VALUE_TYPE.STRING,
        condition: SEARCH_CONDITION.AND
      });
      optionalCriteriaList.push({
        key: 'processingYear',
        operation: SEARCH_FILTER_OPERATION.EQUAL,
        value: '' + LocalDate.now().year(),
        valueType: SEARCH_VALUE_TYPE.STRING,
        condition: SEARCH_CONDITION.AND
      });
      const params = {
        params: {
          pageNumber: 0,
          pageSize: 10000,
          pageSizeOverride: true,
          sort: {
            status: 'ASC',
            schoolNumber: 'ASC',
            surname: 'ASC',
            givenNames: 'ASC',
          },
          searchQueries: [{searchCriteriaList: [...optionalCriteriaList]}],
        }
      };
      return ApiService.apiAxios
        .get(`${Routes['nominalRoll'].ROOT_ENDPOINT}/search`, params)
        .then(response => {
          let csv = 'School District,School Number,School Name,LEA/Provincial,Recipient Number,' +
            'Recipient Name,FTE,Surname,Given Name(s),Gender,Birth Date,Grade,Band of Residence\n';
          response.data.content.forEach((s) => {
            csv += s.schoolDistrictNumber + ',' + s.schoolNumber + ','
              + s.schoolName + ',' + s.leaProvincial + ',' + s.recipientNumber + ','
              + s.recipientName + ',' + s.fte + ',' + s.surname + ',' + s.givenNames
              + ',' + s.gender + ',' + s.birthDate + ',' + s.grade + ',' + s.bandOfResidence;
            csv += '\n';
          });
          const anchor = document.createElement('a');
          anchor.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
          anchor.target = '_blank';
          anchor.download = LocalDate.now().year() + '-NomRoll-Ignored.csv';
          anchor.click();
        })
        .catch(error => {
          this.setFailureAlert('An error occurred while loading nominal roll ignored data. Please try again later.');
          console.log(error);
          throw error;
        });
    },
  },
  watch: {
    dateMenu(val) {
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
        if (this.sagaId && notificationData && this.sagaId === notificationData.sagaId && notificationData.sagaStatus === 'COMPLETED') {
          if (notificationData.sagaName === 'NOMINAL_ROLL_POST_DATA_SAGA') {
            this.setSuccessAlert('Success! Your request to post nominal roll data is completed.');
            this.$emit('update:isPosted', true);
          }
          this.processing = false;
        }
      }
    },
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
    font-size: 0.87em;
}

.header-checkbox :deep(.v-input__control) {
    height: 24px !important;
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

#dataTable /deep/ table th {
    font-size: 0.875rem;
}

#dataTable /deep/ table tr.selected-record,
#dataTable /deep/ table tbody tr:hover {
    background-color: #E1F5FE
}

#dataTable /deep/ table {
    border-bottom: thin solid #d7d7d7;
}

#dataTable /deep/ table tr td {
    text-align: center !important;
    vertical-align: top;
    padding-top: 0.5rem;
    padding-bottom: 0.3rem;
}

.record-checkbox {
    margin-top: -10px;
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

:deep(.v-table__wrapper) {
    overflow-y: hidden;
    overflow-x: hidden;
}

:deep(.v-data-table__th){
    font-size: 0.75em !important;
    font-weight: bold !important;
}

:deep(.v-data-table-footer__items-per-page){
    display: none;
}


</style>
