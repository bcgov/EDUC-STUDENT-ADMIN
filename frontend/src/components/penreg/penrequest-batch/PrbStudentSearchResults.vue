<template>
  <div id="searchResults" class="px-3" style="width: 100%" :overlay=false>
    <v-row no-gutters class="d-flex align-start">
      <h3 id="numberResults" class="px-2 pb-2"><strong>{{ prbStudentSearchResponse.totalElements }} Records</strong> ({{selectedFiles.length}} files selected)</h3>
      <v-icon class="mt-1" color="#2E8540" v-if="archived">mdi-package-up</v-icon>
      <v-spacer/>
      <v-flex class="select mr-1">
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
      <PrimaryButton id="viewSelected" v-if="selected" :disabled="!viewEnabled" @click.native="clickViewSelected" text="View Selected"></PrimaryButton>
      <PrimaryButton id="viewDetails" v-else :disabled="!viewEnabled" @click.native="clickViewDetails" text="View Details"></PrimaryButton>
    </v-row>
    <v-divider class="mb-1 subheader-divider"/>
    <v-data-table
      id="dataTable"
      v-model="selectedRecords"
      :headers="headers"
      :items="prbStudentSearchResponse.content"
      :page.sync="pageNumber"
      :items-per-page="prbStudentSearchResponse.pageable.pageSize"
      hide-default-footer
      item-key="penRequestBatchStudentID"
      :loading="loading"
      @page-count="prbStudentSearchResponse.pageable.pageNumber = $event"
    >
      <template v-for="h in headers" v-slot:[`header.${h.value}`]="{ header }">
        <span :key="h.id" class="top-column-item">
          {{ header.topText }}
        </span>
        <span :key="h.id" class="double-column-item">{{header.doubleText}}</span>
        <br :key="h.id" />
        <span :key="h.id" class="bottom-column-item">{{ header.bottomText }}</span>
      </template>
      <template v-slot:item="props">
        <tr :class="{'selected-record' : props.item.isSelected}" @click="selectItem(props.item)">
          <td v-for="header in props.headers" :key="header.id" :class="header.id">
            <v-checkbox v-if="header.type" class="record-checkbox header-checkbox" color="#606060" v-model="props.item.isSelected" @click.stop="handleRecordCheckBoxClicked(props.item)"></v-checkbox>
            <div v-else class="table-cell">
              <span class="top-column-item">
                <a v-if="header.topValue === 'submissionNumber'" class="submission" @click.stop="handleSubmissionNumberClicked(props.item[header.topValue])">{{props.item[header.topValue] }}</a>
                <v-tooltip v-else-if="header.topValue === 'mincode'" right>
                  <template v-slot:activator="{ on }">
                    <span v-on="on">{{ props.item[header.topValue] }}</span>
                  </template>
                  <span>{{getSchoolName(props.item) }}</span>
                </v-tooltip>
                <span v-else>{{ props.item[header.topValue] }}</span>
              </span>
              <span class="double-column-item">{{props.item[header.doubleValue]}}</span>
              <br>
              <span class="bottom-column-item mt-1">
                <PrbStudentStatusChip 
                  v-if="header.bottomValue === 'penRequestBatchStudentStatusCode'" 
                  :prbStudent="props.item"
                ></PrbStudentStatusChip>
                <span v-else>{{ props.item[header.bottomValue] }}</span>
              </span>
            </div>
          </td>
        </tr>
      </template>
    </v-data-table>
    <v-row class="pt-2" justify="end">
      <v-col cols="4">
        <v-pagination color="#38598A" v-model="pageNumber" :length="prbStudentSearchResponse.totalPages"></v-pagination>
      </v-col>
      <v-col cols="4" id="currentItemsDisplay">
        Showing {{ showingFirstNumber }} to {{ showingEndNumber }} of {{ prbStudentSearchResponse.totalElements }}
      </v-col>
    </v-row>
  </div>
</template>

<script>
import {mapMutations, mapState} from 'vuex';
import PrimaryButton from '../../util/PrimaryButton';
import PrbStudentStatusChip from './PrbStudentStatusChip';
import {sortBy, uniq, uniqBy, values} from 'lodash';
import router from '../../../router';

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
        { topText: 'Mincode', bottomText: 'Local ID', align: 'start', sortable: false, topValue: 'mincode', bottomValue: 'localID' },
        { topText: 'Legal Surname', bottomText: 'Usual Surname', topValue: 'legalLastName', bottomValue: 'usualLastName', sortable: false },
        { topText: 'Legal Given', bottomText: 'Usual Given', topValue: 'legalFirstName', bottomValue: 'usualFirstName', sortable: false },
        { topText: 'Legal Middle', bottomText: 'Usual Middle', topValue: 'legalMiddleNames', bottomValue: 'usualMiddleNames', sortable: false },
        { topText: 'DC', doubleText: 'Gen', bottomText: 'Postal Code', topValue: 'dc', doubleValue: 'genderCode', bottomValue: 'postalCode', sortable: false },
        { topText: 'Birth Date', bottomText: 'Grade', topValue: 'dob', bottomValue: 'gradeCode', sortable: false },
        { topText: 'Suggested PEN', bottomText: 'Submitted PEN', topValue: 'bestMatchPEN', bottomValue: 'submittedPen', sortable: false },
        { topText: 'Submission', bottomText: 'Status', topValue: 'submissionNumber', bottomValue: 'penRequestBatchStudentStatusCode', sortable: false },
      ],
    };
  },
  async beforeMount() {
    await this.$store.dispatch('prbStudentSearch/getCodes');
  },
  computed: {
    ...mapState('prbStudentSearch', ['prbStudentSearchResponse', 'prbStudentSearchCriteria', 'currentPrbStudentSearchParams']),
    ...mapState('penRequestBatch', ['selectedFiles', 'prbStudentStatuses']),
    pageNumber: {
      get(){
        return this.$store.state['prbStudentSearch'].pageNumber;
      },
      set(newPage){
        return this.$store.state['prbStudentSearch'].pageNumber = newPage;
      }
    },
    selectedRecords: {
      get(){
        return this.$store.state['prbStudentSearch'].selectedRecords;
      },
      set(newRecords){
        return this.$store.state['prbStudentSearch'].selectedRecords = newRecords;
      }
    },
    showingFirstNumber() {
      return ((this.pageNumber-1) * this.prbStudentSearchResponse.pageable.pageSize + (this.prbStudentSearchResponse.numberOfElements > 0 ? 1 : 0));
    },
    showingEndNumber() {
      return ((this.pageNumber-1) * this.prbStudentSearchResponse.pageable.pageSize + this.prbStudentSearchResponse.numberOfElements);
    },
    studentStatuses() {
      return sortBy(this.prbStudentStatuses.filter(status => status.penRequestBatchStudentStatusCode !== 'LOADED'), ['displayOrder']).map(status => ({
        text: status.label,
        value: status.penRequestBatchStudentStatusCode
      }));
    },
    selectedStudentStatus: {
      get(){
        return this.$store.state['prbStudentSearch'].selectedStudentStatus;
      },
      set(status){
        return this.$store.state['prbStudentSearch'].selectedStudentStatus = status;
      }
    },
    selected() {
      return this.selectedRecords.length > 0 || this.selectedStudentStatus || (this.currentPrbStudentSearchParams && values(this.currentPrbStudentSearchParams).some(v => !!v));
    },
    viewEnabled() {
      return this.prbStudentSearchResponse.totalElements > 0 && !this.loading;
    },

  },
  methods: {
    ...mapMutations('prbStudentSearch', ['setPageNumber', 'setSelectedRecords', 'setPrbStudentSearchResponse']),
    getSchoolName(request) {
      return this.$store.state['prbStudentSearch'].mincodeSchoolNames.get(request?.mincode?.replace(' ',''));
    },
    clickViewSelected() {
      if(this.selectedRecords?.length > 0) {
        const batchIDs = uniq(this.selectedRecords.map(record => record.penRequestBatchID));
        const prbStudentIDs = this.selectedRecords.map(record => record.penRequestBatchStudentID);
        const query = { 
          seqNumber: 1,
          totalNumber: this.selectedRecords.length, 
          batchCount: batchIDs.length, 
          prbStudentIDs,
          batchIDs
        };
        router.push({name: 'prbStudentDetails', query});
      } else {
        this.clickViewDetails();
      }
    },
    clickViewDetails() {
      const query = { 
        seqNumber: 1,
        totalNumber: this.prbStudentSearchResponse.totalElements, 
        batchCount: this.selectedFiles.length, 
        searchCriteria: JSON.stringify(this.prbStudentSearchCriteria),
      };
      router.push({name: 'prbStudentDetails', query});
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
        const newSelectedRecords = this.selectedRecords.filter(rec => rec.submissionNumber !== item.submissionNumber);
        this.setSelectedRecords(newSelectedRecords);
      }
    },
    handleSubmissionNumberClicked(submissionNumber) {
      const batchIDs = this.prbStudentSearchResponse.content.find(file => file.submissionNumber === submissionNumber)?.penRequestBatchID;
      const statusFilters = '';
      const route = router.resolve({name: 'prbStudentList', query: { batchIDs, statusFilters }});
      window.open(route.href, '_blank');
    }
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
</style>
