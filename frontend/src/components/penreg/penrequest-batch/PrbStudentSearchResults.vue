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
      <h3
        id="numberResults"
        class="px-2 pb-2"
      >
        <strong>{{ prbStudentSearchResponse.totalElements }} Records</strong> ({{ selectedFiles.length }} files selected)
      </h3>
      <v-icon
        v-if="archived"
        class="mt-1"
        color="#2E8540"
      >
        mdi-package-up
      </v-icon>
      <v-spacer />
      <v-flex class="select mr-n10">
        <v-checkbox
          id="showSamePENAssignedCheckbox"
          v-model="showSamePENAssigned"
          class="ma-0 pa-0"
          height="100%"
          label="Same PEN Assigned"
          color="#606060"
        />
      </v-flex>
      <v-flex class="select mr-1">
        <v-select
          id="selectStatus"
          v-model="selectedStudentStatus"
          :items="studentStatuses"
          dense
          variant="outlined"
          placeholder="Filter by status"
          color="#38598a"
          append-icon="mdi-chevron-down"
          :menu-props="{ offsetY: true }"
          clearable
        />
      </v-flex>
      <PrimaryButton
        v-if="selected"
        id="viewSelected"
        :disabled="!viewEnabled"
        @click-action="clickViewSelected"
        text="View Selected"
      />
      <PrimaryButton
        v-else
        id="viewDetails"
        :loading="loadingRequestIDs"
        :disabled="!viewEnabled"
        @click-action="clickViewDetails"
        text="View Details"
      />
    </v-row>
    <v-divider class="mb-1 subheader-divider" />
    <v-data-table
      id="dataTable"
      v-model="selectedRecords"
      v-model:page="pageNumber"
      :headers="headers"
      :items="prbStudentSearchResponse.content"
      :items-per-page="prbStudentSearchResponse.pageable.pageSize"
      hide-default-footer
      item-key="penRequestBatchStudentID"
      :loading="loading"
      @page-count="prbStudentSearchResponse.pageable.pageNumber = $event"
    >
      <template
        v-for="h in headers"
        :key="h.id"
        #[`header.${h.value}`]="{ header }"
      >
        <span
          :title="header.topTooltip"
          class="top-column-item"
        >
          {{ header.topText }}
        </span>
        <span
          :title="header.doubleTooltip"
          class="double-column-item"
        >{{ header.doubleText }}</span>
        <br :key="h.id">
        <span
          :title="header.bottomTooltip"
          class="bottom-column-item"
        >{{ header.bottomText }}</span>
      </template>
      <template #item="props">
        <tr
          :class="{'selected-record' : props.item.isSelected}"
          @click="selectItem(props.item)"
        >
          <td
            v-for="header in props.headers"
            :key="header.id"
            :class="header.id"
          >
            <v-checkbox
              v-if="header.type"
              v-model="props.item.isSelected"
              class="record-checkbox header-checkbox"
              color="#606060"
              @click.stop="handleRecordCheckBoxClicked(props.item)"
            />
            <div
              v-else
              class="table-cell"
            >
              <span class="top-column-item">
                <a
                  v-if="header.topValue === 'submissionNumber'"
                  class="submission"
                  @click.stop="handleSubmissionNumberClicked(props.item[header.topValue])"
                >{{ props.item[header.topValue] }}</a>
                <v-tooltip
                  v-else-if="header.topValue === 'mincode'"
                  right
                >
                  <template #activator="{ on }">
                    <span>{{ props.item[header.topValue] }}</span>
                  </template>
                  <span>{{ getSchoolName(props.item) }}</span>
                </v-tooltip>
                <span
                  v-else
                  :class="[{'mark-field-value-errored':isFieldValueErrored(header.topValue, props.item)}]"
                >{{ props.item[header.topValue] }}</span>
              </span>
              <span :class="['double-column-item', {'mark-field-value-errored':isFieldValueErrored(header.doubleValue, props.item)}]">{{ props.item[header.doubleValue] }}</span>
              <br>
              <span class="bottom-column-item mt-1">
                <PrbStudentStatusChip 
                  v-if="header.bottomValue === 'penRequestBatchStudentStatusCode'" 
                  :prb-student="props.item"
                />
                <span
                  v-else-if="header.bottomValue === 'submittedPen'"
                  class="bottom-column-item"
                >
                  {{ props.item[header.bottomValue] }}
                </span>
                <span
                  v-else
                  :class="['bottom-column-item', {'mark-field-value-errored':isFieldValueErrored(header.bottomValue, props.item)}]"
                >{{ props.item[header.bottomValue] !== props.item[header.topValue] ? props.item[header.bottomValue]: '' }}</span>
              </span>
            </div>
          </td>
        </tr>
      </template>
    </v-data-table>
    <v-row
      class="pt-2"
      justify="end"
    >
      <v-col cols="4">
        <v-pagination
          v-model="pageNumber"
          color="#38598A"
          :length="prbStudentSearchResponse.totalPages"
        />
      </v-col>
      <v-col
        id="currentItemsDisplay"
        cols="4"
      >
        Showing {{ showingFirstNumber }} to {{ showingEndNumber }} of {{ prbStudentSearchResponse.totalElements || 0 }}
      </v-col>
    </v-row>
  </div>
</template>

<script>
import {mapActions, mapState} from 'pinia';
import PrimaryButton from '../../util/PrimaryButton.vue';
import PrbStudentStatusChip from './PrbStudentStatusChip.vue';
import {sortBy, uniqBy, values} from 'lodash';
import router from '../../../router';
import {
  PEN_REQ_BATCH_STUDENT_REQUEST_CODES,
  Routes
} from '../../../utils/constants';
import ApiService from '@/common/apiService';
import {penRequestBatchStudentSearchStore} from '@/store/modules/prbStudentSearch';
import {penRequestBatchStore} from '@/store/modules/penRequestBatch';
import {navigationStore} from '@/store/modules/setNavigation';
import {appStore} from '@/store/modules/app';
import {archivedRequestBatchStore} from '@/store/modules/archivedRequestBatch';

export default {
  name: 'PrbStudentSearchResults',
  components: {
    PrimaryButton,
    PrbStudentStatusChip,
  },
  props: {
    loading: {
      type: Boolean,
      required: true
    },
    archived: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      itemsPerPage: 10,
      headers: [
        { id: 'table-checkbox', type: 'select', sortable: false },
        { topText: 'Mincode', bottomText: 'Local ID', align: 'start', sortable: false, topValue: 'mincode', bottomValue: 'localID', topTooltip: 'Mincode', bottomTooltip: 'Local ID' },
        { topText: 'Legal Surname', bottomText: 'Usual Surname', topValue: 'legalLastName', bottomValue: 'usualLastName', sortable: false, topTooltip: 'Legal Surname', bottomTooltip: 'Legal Surname' },
        { topText: 'Legal Given', bottomText: 'Usual Given', topValue: 'legalFirstName', bottomValue: 'usualFirstName', sortable: false, topTooltip: 'Legal Given Name', bottomTooltip: 'Usual Given Name' },
        { topText: 'Legal Middle', bottomText: 'Usual Middle', topValue: 'legalMiddleNames', bottomValue: 'usualMiddleNames', sortable: false, topTooltip: 'Legal Middle Name', bottomTooltip: 'Usual Middle Name' },
        { topText: 'DC', doubleText: 'Gen', bottomText: 'Postal Code', topValue: 'dc', doubleValue: 'genderCode', bottomValue: 'postalCode', sortable: false, topTooltip: 'Demographic Code', bottomTooltip: 'Postal Code', doubleTooltip: 'Gender' },
        { topText: 'Birth Date', bottomText: 'Grade', topValue: 'dob', bottomValue: 'gradeCode', sortable: false, topTooltip: 'Birth Date', bottomTooltip: 'Grade Code' },
        { topText: 'Suggested PEN', bottomText: 'Submitted PEN', topValue: 'bestMatchPEN', bottomValue: 'submittedPen', sortable: false, topTooltip: 'Suggested PEN', bottomTooltip: 'Submitted PEN' },
        { topText: 'Submission', bottomText: 'Status', topValue: 'submissionNumber', bottomValue: 'penRequestBatchStudentStatusCode', sortable: false, topTooltip: 'Submission Number', bottomTooltip: 'Status' },
      ],
      loadingRequestIDs: false
    };
  },
  async beforeMount() {
    await appStore().getCodes();
  },
  computed: {
    ...mapState(penRequestBatchStudentSearchStore, ['prbStudentSearchResponse', 'prbStudentSearchCriteria', 'currentPrbStudentSearchParams']),
    ...mapState(penRequestBatchStore, ['prbStudentStatuses']),
    pageNumber: {
      get(){
        return penRequestBatchStudentSearchStore().pageNumber;
      },
      set(newPage){
        return penRequestBatchStudentSearchStore().setPageNumber(newPage);
      }
    },
    selectedRecords: {
      get(){
        return penRequestBatchStudentSearchStore().selectedRecords;
      },
      set(newRecords){
        return penRequestBatchStudentSearchStore().setSelectedRecords(newRecords);
      }
    },
    showingFirstNumber() {
      return ((this.pageNumber-1) * (this.prbStudentSearchResponse.pageable.pageSize || 0) + ((this.prbStudentSearchResponse.numberOfElements || 0) > 0 ? 1 : 0));
    },
    showingEndNumber() {
      return ((this.pageNumber-1) * (this.prbStudentSearchResponse.pageable.pageSize || 0) + (this.prbStudentSearchResponse.numberOfElements || 0));
    },
    studentStatuses() {
      return sortBy(this.prbStudentStatuses.filter(status => status.penRequestBatchStudentStatusCode !== 'LOADED'), ['displayOrder']).map(status => ({
        text: status.label,
        value: status.penRequestBatchStudentStatusCode
      }));
    },
    selectedStudentStatus: {
      get(){
        return penRequestBatchStudentSearchStore().selectedStudentStatus;
      },
      set(status){
        return penRequestBatchStudentSearchStore().setSelectedStudentStatus(status);
      }
    },
    showSamePENAssigned: {
      get(){
        return penRequestBatchStudentSearchStore().showSamePENAssigned;
      },
      set(status){
        return penRequestBatchStudentSearchStore().setShowSamePENAssigned(status);
      }
    },
    selected() {
      return this.selectedRecords.length > 0 || this.selectedStudentStatus || (this.currentPrbStudentSearchParams && values(this.currentPrbStudentSearchParams).some(v => !!v));
    },
    viewEnabled() {
      return this.prbStudentSearchResponse.totalElements > 0 && !this.loading;
    },
    selectedFiles() {
      if(this.archived){
        return archivedRequestBatchStore().selectedFiles;
      }else{
        return penRequestBatchStore().selectedFiles;
      }
    }
  },
  methods: {
    ...mapActions(penRequestBatchStudentSearchStore, ['setPageNumber', 'setSelectedRecords', 'setPrbStudentSearchResponse']),
    ...mapActions(navigationStore, ['setSelectedIDs', 'setArchived']),
    getSchoolName(request) {
      return appStore().schoolApiMincodeSchoolNames.get(request?.mincode?.replace(' ',''));
    },
    clickViewSelected() {
      if(this.selectedRecords?.length > 0) {
        this.setSelectedIDs(this.selectedRecords);
        this.setArchived(this.archived);
        router.push({name: 'prbStudentDetails', params: {prbStudentID: this.selectedRecords[0].penRequestBatchStudentID}, query: {archived: this.archived}});
      } else {
        this.clickViewDetails();
      }
    },
    clickViewDetails() {
      this.loadingRequestIDs = true;
      let searchCriteria = {};
      let batchIDs = null;
      let statusCodes = null;
      this.prbStudentSearchCriteria[0].searchCriteriaList.forEach(obj => {
        switch (obj.key) {
        case ('penRequestBatchStudentStatusCode'):
          if(obj.operation === 'neq') { //default search criteria for archived files is a not equals, so we have to account for that
            statusCodes = Object.values(PEN_REQ_BATCH_STUDENT_REQUEST_CODES).filter(code => code !== obj.value).join(',');
          } else {
            statusCodes = obj.value;
          }
          break;
        case ('penRequestBatchEntity.penRequestBatchID'):
          batchIDs = obj.value;
          break;
        case ('penRequestBatchEntity.mincode'):
          searchCriteria.mincode = obj.value;
          break;
        case ('penRequestBatchEntity.submissionNumber'):
          searchCriteria.submissionNumber = obj.value;
          break;
        case ('legalFirstName'):
          searchCriteria.legalGivenName = obj.value + '%'; //appending '%' for like query
          break;
        case ('legalLastName'):
          searchCriteria.legalSurname = obj.value + '%';
          break;
        case ('legalMiddleNames'):
          searchCriteria.legalMiddleNames = obj.value + '%';
          break;
        case ('usualFirstName'):
          searchCriteria.usualGivenName = obj.value + '%';
          break;
        case ('usualLastName'):
          searchCriteria.usualSurname = obj.value + '%';
          break;
        case ('usualMiddleNames'):
          searchCriteria.usualMiddleNames = obj.value + '%';
          break;
        case ('genderCode'):
          searchCriteria.gender = obj.value;
          break;
        case ('gradeCode'):
          searchCriteria.grade = obj.value;
          break;
        default:
          searchCriteria[obj.key] = obj.value;
          break;
        }
      });
      const query = {
        params: {
          searchCriteria: searchCriteria,
          penRequestBatchIDs: batchIDs,
          penRequestBatchStudentStatusCodes: statusCodes.length > 0 ? statusCodes : PEN_REQ_BATCH_STUDENT_REQUEST_CODES.LOADED
        }
      };
      ApiService.apiAxios.get(`${Routes['penRequestBatch'].FILES_URL}/penRequestBatchStudentIDs`, query)
        .then(response => {
          this.setSelectedIDs(response.data);
          this.setArchived(this.archived);
          router.push({name: 'prbStudentDetails', params: {prbStudentID: response.data[0].penRequestBatchStudentID}, query: {archived: this.archived}});
        })
        .finally(() => {
          this.loadingRequestIDs = false;
        })
        .catch(error => {
          this.setFailureAlert('An error occurred while fetching PEN Request Files! Please try again later.');
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
        const selectedRecordsFromCurrentData = this.prbStudentSearchResponse.content.filter(file => file.isSelected);
        let newSelectedRecords = [...this.selectedRecords, ...selectedRecordsFromCurrentData];
        newSelectedRecords = uniqBy(newSelectedRecords, a => a.penRequestBatchStudentID);
        this.setSelectedRecords(newSelectedRecords);
      } else {
        const newSelectedRecords = this.selectedRecords.filter(rec => rec.penRequestBatchStudentID !== item.penRequestBatchStudentID);
        this.setSelectedRecords(newSelectedRecords);
      }
    },
    handleSubmissionNumberClicked(submissionNumber) {
      const batchIDs = this.prbStudentSearchResponse.content.find(file => file.submissionNumber === submissionNumber)?.penRequestBatchID;
      const statusFilters = '';
      const route = router.resolve({name: 'prbStudentList', query: { batchIDs, statusFilters }});
      window.open(route.href, '_blank');
    },
    isFieldValueErrored(fieldName, record) {
      return record.validationIssues?.some(issue => issue.dataFieldName === fieldName && issue.penRequestBatchValidationIssueSeverityCode === 'ERROR');
    },
  }
};
</script>

<style scoped>
  #currentItemsDisplay {
    text-align: right;
    font-size: 0.875rem;
  }
  .double-column-item {
    float: right;
  }
  .top-column-item {
    float: left;
  }
  .bottom-column-item {
    float: left;
    min-height: 1.5em;
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
  .submission {
    text-decoration: underline;
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

  .mark-field-value-errored {
    color: #D8292F !important;
    font-weight: bold;
  }
</style>
