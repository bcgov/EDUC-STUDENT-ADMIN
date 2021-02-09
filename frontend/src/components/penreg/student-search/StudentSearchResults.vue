<template>
  <div id="searchResults" class="px-3" style="width: 100%" :overlay=false>
    <v-row no-gutters>
      <v-col>
        <span id="numberResults" class="px-4 pb-2">{{ studentSearchResponse.totalElements }} Results</span>
      </v-col>
      <v-col>
        <CompareDemographicModal :disabled="selectedRecords.length<2 || selectedRecords.length>3" :selectedRecords.sync="selectedRecords"></CompareDemographicModal>
      </v-col>
    </v-row>
    <v-data-table
            id="dataTable"
            v-model="selectedRecords"
            :headers="headers"
            :items="studentSearchResponse.content"
            :page.sync="pageNumber"
            :items-per-page="studentSearchResponse.pageable.pageSize"
            hide-default-footer
            item-key="studentID"
            @page-count="studentSearchResponse.pageable.pageNumber = $event">
      <template v-for="h in headers" v-slot:[`header.${h.value}`]="{ header }">
        <span :key="h.id" class="top-column-item">
          {{ header.topText }}
        </span>
        <em :key="h.id" v-if="header.topValue === 'dob'" @click="updateSortParams(header.topValue)"
            :class="['dob-sort pl-2 v-icon v-data-table-header__icon fas active', headerSortParams.currentSortAsc ? 'fa-sort-down' : 'fa-sort-up']"
        ></em>
        <span :key="h.id" class="double-column-item">{{header.doubleText}}</span>
        <br :key="h.id" />
        <span :key="h.id" class="bottom-column-item">{{ header.bottomText }}</span>
      </template>
      <template v-slot:item="props">
        <tr>
          <td v-for="header in props.headers" :key="header.id" :class="{'table-checkbox' :header.id, 'row-hightlight': isMergedOrDeceased(props.item) }">
            <v-checkbox v-if="header.type" :disabled="isAuditHistorySearch" :input-value="props.isSelected" color="#606060" @change="props.select($event)"></v-checkbox>
            <div v-else @click="viewStudentDetails(props.item.studentID)" class="tableCell">
              <span v-if="header.topValue == 'dob'" class="top-column-item">{{ formatDob(props.item[header.topValue],'uuuu-MM-dd','uuuu/MM/dd') }}</span>
              <span v-else class="top-column-item">{{ props.item[header.topValue] }}</span>
              <span class="double-column-item">{{props.item[header.doubleValue]}}</span>
              <br>
              <span class="bottom-column-item">{{ props.item[header.bottomValue] }}</span>
            </div>
          </td>
        </tr>
      </template>
    </v-data-table>
    <v-row class="pt-2" justify="end">
      <v-col cols="4">
        <v-pagination color="#38598A" v-model="pageNumber" :length="studentSearchResponse.totalPages"></v-pagination>
      </v-col>
      <v-col cols="4" id="currentItemsDisplay">
        Showing {{ showingFirstNumber }} to {{ showingEndNumber }} of {{ studentSearchResponse.totalElements || 0 }}
      </v-col>
    </v-row>
  </div>
</template>

<script>
import {formatDob} from '@/utils/format';
import {mapGetters, mapMutations, mapState} from 'vuex';
import ApiService from '../../../common/apiService';
import {REQUEST_TYPES, Routes, STUDENT_CODES} from '../../../utils/constants';
import router from '../../../router';
import CompareDemographicModal from '../../common/CompareDemographicModal';

export default {
  name: 'SearchResults',
  components: { CompareDemographicModal },
  props: {
    searchCriteria: {
      type: Object,
      required: true
    },
    prepPut: {
      type: Function,
      required: true
    }
  },
  data () {
    return {
      pageCount: 0,
      itemsPerPage: 10,
      headers: [
        { id: 'table-checkbox', type: 'select', sortable: false },
        { topText: 'PEN', align: 'start', sortable: false, topValue: 'pen'},
        { topText: 'Legal Surname', bottomText: 'Usual Surname', topValue: 'legalLastName', bottomValue: 'usualLastName', sortable: false },
        { topText: 'Legal Given', bottomText: 'Usual Given', topValue: 'legalFirstName', bottomValue: 'usualFirstName', sortable: false },
        { topText: 'Legal Middle', bottomText: 'Usual Middle', topValue: 'legalMiddleNames', bottomValue: 'usualMiddleNames', sortable: false },
        { topText: 'Postal Code', bottomText: 'Memo', topValue: 'postalCode', bottomValue: 'memo', sortable: false },
        { topText: 'DC', doubleText: 'Gen', bottomText: 'Local ID', topValue: 'dc', doubleValue: 'genderCode', bottomValue: 'localID', sortable: false },
        { topText: 'Birth Date', bottomText: 'Grade', topValue: 'dob', bottomValue: 'gradeCode', sortable: false },
        { topText: 'Mincode', bottomText: 'Twinned', topValue: 'mincode', bottomValue: 'twinned', sortable: false },
      ],
    };
  },
  watch: {
    pageNumber: {
      handler() {
        this.pagination();
      }
    },
    headerSortParams: {
      handler() {
        this.pagination();
      },
      deep: true
    }
  },
  computed: {
    ...mapGetters('studentSearch', ['useNameVariants', 'isAuditHistorySearch', 'statusCode']),  // For advanced search criteria
    ...mapState('studentSearch', ['headerSortParams', 'studentSearchResponse']),
    pageNumber: {
      get(){
        return this.$store.state['studentSearch'].pageNumber;
      },
      set(newPage){
        return this.$store.state['studentSearch'].pageNumber = newPage;
      }
    },
    selectedRecords: {
      get(){
        return this.$store.state['studentSearch'].selectedRecords;
      },
      set(newRecord){
        return this.$store.state['studentSearch'].selectedRecords = newRecord;
      }
    },
    showingFirstNumber() {
      return ((this.pageNumber-1) * (this.studentSearchResponse.pageable.pageSize || 0) + ((this.studentSearchResponse.numberOfElements || 0) > 0 ? 1 : 0));
    },
    showingEndNumber() {
      return ((this.pageNumber-1) * (this.studentSearchResponse.pageable.pageSize || 0) + (this.studentSearchResponse.numberOfElements || 0));
    }
  },
  methods: {
    ...mapMutations('studentSearch', ['updateSortParams', 'setStudentSearchResponse']),
    viewStudentDetails(studentID) {
      const route = router.resolve({ name: REQUEST_TYPES.student.label, params: {studentID: studentID}});
      window.open(route.href, '_blank');
    },
    formatDob,
    compare() {
      //TODO
    },
    pagination() {
      const studentSearchKeys = Object.keys(this.searchCriteria).filter(k => (this.searchCriteria[k] && this.searchCriteria[k].length !== 0));
      let studentSearchFilters;
      if (studentSearchKeys && studentSearchKeys.length > 0) {
        studentSearchFilters = {};
        studentSearchKeys.forEach(element => {
          if(element === 'dob') {
            if(!this.searchCriteria[element].startDate) {
              return;
            }
          }
          studentSearchFilters[element] = this.searchCriteria[element];
        });

        // Advanced search criteria settings
        studentSearchFilters['useNameVariants'] = this.useNameVariants;
        studentSearchFilters['isAuditHistorySearch'] = this.isAuditHistorySearch;
        if(this.statusCode.length > 0) {
          studentSearchFilters['statusCode'] = this.statusCode;
        }
      }
      ApiService.apiAxios
        .get(Routes.student.SEARCH_URL,this.prepPut(studentSearchFilters))
        .then(response => {
          this.setStudentSearchResponse(response.data);
        })
        .catch(error => {
          console.log(error);
        });
    },
    isMergedOrDeceased(student) {
      return [STUDENT_CODES.MERGED, STUDENT_CODES.DECEASED].some(status => status === student.statusCode);
    }
  }
};
</script>

<style scoped>
  #currentItemsDisplay {
    text-align: right;
    font-size: 0.875rem;
  }
  .dob-sort {
    opacity: 1;
    cursor: pointer;
    color: #1A5A96;
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
  }
  .table-checkbox /deep/ .v-input__slot {
    padding-top: 0;
  }
  .tableCell {
    cursor: pointer;
  }
  #searchResults /deep/ .v-pagination__navigation > i {
    padding-left: 0;
  }
  .row-hightlight { 
    background-color: rgba(0, 0, 0, 0.06);
    color: #1A5A96;
    font-weight: bold;
  }
</style>
