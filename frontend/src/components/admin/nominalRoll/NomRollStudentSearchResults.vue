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
      <PrimaryButton id="viewSelected" v-if="selected" :disabled="!viewEnabled" @click.native="clickViewSelected" text="View Selected"></PrimaryButton>
      <PrimaryButton id="viewDetails" v-else :loading="loadingRequestIDs" :disabled="!viewEnabled" @click.native="clickViewDetails" text="View Details"></PrimaryButton>
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
                <NomRollStudentStatusChip 
                  v-else-if="header.value === 'status'" 
                  :statusCode="props.item[header.value]"
                ></NomRollStudentStatusChip>
                <span v-else>{{ formatTableColumn(header.format, props.item[header.value]) }}</span>
              </span>
            </div>
          </td>
        </tr>
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
import {mapMutations, mapState} from 'vuex';
import PrimaryButton from '../../util/PrimaryButton';
import NomRollStudentStatusChip from './NomRollStudentStatusChip';
import {uniqBy, values, partialRight} from 'lodash';
import router from '../../../router';
import {NOMINAL_ROLL_STUDENT_STATUS_CODES, NOMINAL_ROLL_STUDENT_STATUSES, Routes} from '../../../utils/constants';
import ApiService from '@/common/apiService';
import {formatDob, formatPen, formatGrade} from '@/utils/format';

export default {
  name: 'NomRollStudentSearchResults',
  components: {
    PrimaryButton,
    NomRollStudentStatusChip,
  },
  props: {
    loading: {
      type: Boolean,
      required: true
    }
  },
  data () {
    return {
      itemsPerPage: 10,
      headers: [
        { id: 'table-checkbox', type: 'select', sortable: false },
        { text: 'Mincode', align: 'start', sortable: false, value: 'mincode', tooltip: 'Mincode' },
        { text: 'Legal Surname', value: 'surname', sortable: false, tooltip: 'Legal Surname' },
        { text: 'Legal Given', value: 'givenNames', sortable: false, tooltip: 'Legal Given Name' },
        { text: 'Gen', value: 'gender', sortable: false, tooltip: 'Gender' },
        { text: 'Birth Date', value: 'birthDate', sortable: false, tooltip: 'Birth Date', format: partialRight(formatDob,'uuuu-MM-dd','uuuu/MM/dd') },
        { text: 'Grade', value: 'grade', sortable: false, tooltip: 'Grade Code', format: formatGrade },
        { text: 'Assigned PEN', value: 'assignedPEN', sortable: false, tooltip: 'Suggested PEN', format: formatPen },
        { text: 'Status', value: 'status', sortable: false, tooltip: 'Status' },
      ],
      loadingRequestIDs: false
    };
  },
  async beforeMount() {
    await this.$store.dispatch('app/getCodes');
  },
  computed: {
    ...mapState('nomRollStudentSearch', ['nomRollStudentSearchResponse', 'nomRollStudentSearchCriteria', 'currentNomRollStudentSearchParams']),
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
    viewEnabled() {
      return this.nomRollStudentSearchResponse.totalElements > 0 && !this.loading;
    },
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
            statusCodes = Object.values(NOMINAL_ROLL_STUDENT_STATUS_CODES).filter(code => code !== obj.value).join(',');
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
          this.setFailureAlert('An error occurred while fetching PEN Requests! Please try again later.');
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
    clickGoBack() {
      router.push({name: 'nominal-roll'});
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
