<template>
  <div id="searchResults" class="px-3" style="width: 100%" :overlay=false>
    <v-row no-gutters>
      <h3 id="numberResults" class="px-2 pb-2"><strong>{{ prbStudentSearchResponse.totalElements }} Records</strong> ({{selectedFiles.length}} files selected)</h3>
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
      <PrimaryButton id="viewSelected" v-if="selectedRecords.length > 0" text="View Selected"></PrimaryButton>
      <PrimaryButton id="viewDetails" v-else text="View Details"></PrimaryButton>
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
      item-key="studentID"
      :loading="loadingTable || loading"
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
        <tr :class="{'selected-record' : props.item.isSelected}">
          <td v-for="header in props.headers" :key="header.id" :class="header.id">
            <v-checkbox v-if="header.type" class="record-checkbox header-checkbox" v-model="props.item.isSelected" color="#606060" @change="props.select($event)"></v-checkbox>
            <div v-else class="table-cell">
              <span class="top-column-item">
                <a v-if="header.topValue === 'submissionNumber'" class="submission">{{props.item[header.topValue] || '-'}}</a>
                <v-tooltip v-else-if="header.topValue === 'minCode'" right>
                  <template v-slot:activator="{ on }">
                    <span v-on="on">{{ props.item[header.topValue] || '-' }}</span>
                  </template>
                  <span>{{getSchoolName(props.item) || '-'}}</span>
                </v-tooltip>
                <span v-else>{{ props.item[header.topValue] || '-' }}</span>
              </span>
              <span class="double-column-item">{{props.item[header.doubleValue]}}</span>
              <br>
              <span class="bottom-column-item mt-1">
                <v-chip 
                  v-if="header.bottomValue === 'penRequestBatchStudentStatusCode'" 
                  :color="statusChipColors[props.item[header.bottomValue]][0] || '#027CB1' " 
                  :text-color="statusChipColors[props.item[header.bottomValue]][1] || 'white'"
                >
                  <strong>{{ getStatusLabel(props.item) || '-' }}</strong>
                </v-chip>
                <span v-else>{{ props.item[header.bottomValue] || '-' }}</span>
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
import { mapMutations, mapState } from 'vuex';
import PrimaryButton from '../../util/PrimaryButton';
import { sortBy } from 'lodash';

export default {
  name: 'PrbStudentSearchResults',
  components: {
    PrimaryButton,
  },
  props: {
    retrievePenRequests: {
      type: Function,
      required: true
    },
    loading: {
      type: Boolean,
      required: true
    }
  },
  data () {
    return {
      itemsPerPage: 10,
      loadingTable: false,
      headers: [
        { id: 'table-checkbox', type: 'select', sortable: false },
        { topText: 'Mincode', bottomText: 'Local ID', align: 'start', sortable: false, topValue: 'minCode', bottomValue: 'localID' },
        { topText: 'Legal Surname', bottomText: 'Usual Surname', topValue: 'legalLastName', bottomValue: 'usualLastName', sortable: false },
        { topText: 'Legal Given', bottomText: 'Usual Given', topValue: 'legalFirstName', bottomValue: 'usualFirstName', sortable: false },
        { topText: 'Legal Middle', bottomText: 'Usual Middle', topValue: 'legalMiddleNames', bottomValue: 'usualMiddleNames', sortable: false },
        { topText: 'DC', doubleText: 'Gen', bottomText: 'Postal Code', topValue: 'dc', doubleValue: 'genderCode', bottomValue: 'postalCode', sortable: false },
        { topText: 'Birth Date', bottomText: 'Grade', topValue: 'dob', bottomValue: 'gradeCode', sortable: false },
        { topText: 'Suggested PEN', bottomText: 'Submitted PEN', topValue: 'bestMatchPEN', bottomValue: 'submittedPen', sortable: false },
        { topText: 'Submission', bottomText: 'Status', topValue: 'submissionNumber', bottomValue: 'penRequestBatchStudentStatusCode', sortable: false },
      ],
      statusChipColors: {
        'MATCHEDSYS': ['#027CB1', 'white'],
        'MATCHEDUSR': ['#027CB1', 'white'],
        'NEWPENSYS' : ['#7737BD', 'white'],
        'NEWPENUSR' : ['#7737BD', 'white'],
        'FIXABLE' : ['#2E8540', 'white'],
        'ERROR' : ['#D8292F', 'white'],
        'REPEAT' : ['#FCBA19', '#313132'],
        'INFOREQ' : ['#FF9839', '#313132'],
      },
    };
  },
  watch: {
    pageNumber: {
      handler() {
        this.pagination();
      }
    },
    selectedStudentStatus: {
      handler() {
        this.setSelectedRecords();
        this.setPageNumber(1);
        this.pagination();
      }
    },
  },
  computed: {
    ...mapState('prbStudentSearch', ['prbStudentSearchResponse', 'currentPrbStudentSearchParams']),
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
      set(newRecord){
        return this.$store.state['prbStudentSearch'].selectedRecords = newRecord;
      }
    },
    showingFirstNumber() {
      return ((this.pageNumber-1) * this.prbStudentSearchResponse.pageable.pageSize + (this.prbStudentSearchResponse.numberOfElements > 0 ? 1 : 0));
    },
    showingEndNumber() {
      return ((this.pageNumber-1) * this.prbStudentSearchResponse.pageable.pageSize + this.prbStudentSearchResponse.numberOfElements);
    },
    studentStatuses() {
      const statuses = sortBy(this.prbStudentStatuses.filter(status => status.penRequestBatchStudentStatusCode !== 'LOADED'), ['displayOrder']).
        map(status => ({text: status.label, value: status.penRequestBatchStudentStatusCode}));
      return statuses;
    },
    selectedStudentStatus: {
      get(){
        return this.$store.state['prbStudentSearch'].selectedStudentStatus;
      },
      set(status){
        return this.$store.state['prbStudentSearch'].selectedStudentStatus = status;
      }
    }
  },
  methods: {
    ...mapMutations('prbStudentSearch', ['setPageNumber', 'setSelectedRecords', 'setPrbStudentSearchResponse']),
    pagination() {
      this.loadingTable = true;
      this.retrievePenRequests(this.currentPrbStudentSearchParams)
        .finally(() => {
          this.loadingTable = false;
        });
    },
    getStatusLabel(request) {
      const statusLabel = this.prbStudentStatuses.find(status => status.penRequestBatchStudentStatusCode === request.penRequestBatchStudentStatusCode)?.label;
      return request.penRequestBatchStudentStatusCode === 'REPEAT' ? `${request.repeatRequestSequenceNumber || ''} Repeats` : statusLabel;
    },
    getSchoolName(request) {
      const schoolName = this.selectedFiles.find(file => file.penRequestBatchID === request.penRequestBatchID)?.schoolName;
      return schoolName;
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
  #searchResults /deep/ .v-input--selection-controls__ripple {
    left: -7px;
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
  #dataTable /deep/ table tr.selected-record { 
    background-color: #E1F5FE
  }
  #dataTable /deep/ table tbody tr:not(.selected-record):hover { 
    background-color: inherit
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
