<template>
  <v-container fluid class="full-height px-0 mb-4">
    <v-form ref="studentSearchForm" id="studentSearchForm"
      v-model="validForm"
    >
      <v-container fluid class="fill-height px-0">
        <v-row no-gutters>
          <v-card elevation="0" height="100%" width="100%" style="background-color:white;">
            <PenRequestSearchPanel
              :searchParams="nomRollStudentSearchParams"
              :loading="searchLoading"
              :disabled="!searchEnabled"
              :fields="searchFields"
              @searchByPen="searchPenRequestsByPen"
              @search="searchPenRequests"
            ></PenRequestSearchPanel>
            <v-progress-linear
              indeterminate
              color="blue"
              :active="searchLoading && !nomRollStudentSearchResponse"
            ></v-progress-linear>
            <v-row v-if="nomRollStudentSearchResponse" no-gutters class="py-2" style="background-color:white;">
              <v-divider class="mx-3 header-divider"/>
            </v-row>
            <v-row v-if="nomRollStudentSearchResponse" id="resultsRow" no-gutters class="py-2" style="background-color:white;">
              <NomRollStudentSearchResults
                :loading="searchLoading"
                :isPosted.sync="isPosted"
              ></NomRollStudentSearchResults>
            </v-row>
          </v-card>
        </v-row>
      </v-container>
    </v-form>
  </v-container>
</template>
<script>
import ApiService from '../../common/apiService';
import {
  NOMINAL_ROLL_STUDENT_STATUS_CODES,
  STUDENT_DETAILS_FIELDS_TO_NOMINAL_ROLL_STUDENT_FIELDS_MAPPER,
  Routes,
  SEARCH_CONDITION,
  SEARCH_FILTER_OPERATION,
  SEARCH_VALUE_TYPE
} from '@/utils/constants';
import {mapMutations, mapState} from 'vuex';
import NomRollStudentSearchResults from './NomRollStudentSearchResults';
import alertMixin from '../../mixins/alertMixin';
import Mousetrap from 'mousetrap';
import router from '@/router';
import PenRequestSearchPanel from '@/components/common/PenRequestSearchPanel';
import {LocalDate} from '@js-joda/core';
import {formatDob} from '@/utils/format';

export default {
  name: 'NomRollStudentListDisplay',
  components: {
    NomRollStudentSearchResults,
    PenRequestSearchPanel,
  },
  mixins: [alertMixin],
  props: {
    statusFilters: {
      type: String,
      default: ''
    },
  },
  data() {
    return {
      validForm: false,
      searchLoading: false,
      searchEnabled: false,
      disablePageHandler: false,
      searchFields: {
        legalMiddleNames: {
          hidden: true,
        },
        bestMatchPEN: {
          hidden: true,
        },
        assignedPEN: {
          order: 3,
          tabindex: 15,
          cols: 0
        },
        localID: {
          hidden: true,
        },
        usualLastName: {
          hidden: true,
        },
        usualFirstName: {
          hidden: true,
        },
        usualMiddleNames: {
          hidden: true,
        },
        postalCode: {
          hidden: true,
        },
        submittedPen: {
          hidden: true,
        },
      },
      isPosted: false,
    };
  },
  computed:{
    ...mapState('nomRollStudentSearch', ['pageNumber', 'selectedRecords', 'nomRollStudentSearchResponse', 'selectedStudentStatus', 'currentNomRollStudentSearchParams', 'nomRollStudentSearchCriteria']),
    ...mapState('nominalRoll', ['fedProvSchoolCodes']),
    nomRollStudentSearchParams: {
      get(){
        return this.$store.state['nomRollStudentSearch'].nomRollStudentSearchParams;
      },
      set(newPage){
        this.$store.state['nomRollStudentSearch'].nomRollStudentSearchParams = newPage;
      }
    },
    nomRollStudentStatusSearchCriteria() {
      const statuses = this.selectedStudentStatus || this.statusFilters;
      return {
        key: 'status',
        operation: statuses.length > 0 ? SEARCH_FILTER_OPERATION.IN : SEARCH_FILTER_OPERATION.NOT_EQUAL,
        value: statuses.length > 0 ? statuses : NOMINAL_ROLL_STUDENT_STATUS_CODES.LOADED,
        valueType: SEARCH_VALUE_TYPE.STRING,
        condition: SEARCH_CONDITION.AND
      };
    },
    nomRollStudentProcessingYearSearchCriteria() {
      return ({key: 'processingYear', operation: SEARCH_FILTER_OPERATION.EQUAL, value: '' + LocalDate.now().year(), valueType: SEARCH_VALUE_TYPE.STRING});
    }
  },
  watch: {
    pageNumber: {
      handler() {
        if(!this.disablePageHandler){
          this.searchLoading = true;
          this.retrievePenRequests(this.nomRollStudentSearchCriteria, false)
            .finally(() => {
              this.searchLoading = false;
            });
        }
      }
    },
    selectedStudentStatus: {
      handler() {
        this.initialSearch();
      }
    },
    isPosted: {
      handler() {
        if(!this.searchLoading) {
          this.initialSearch();
        }
      }
    }
  },
  mounted() {
    Mousetrap.bind('ctrl+b', () => {
      router.push({name: 'nominal-roll'});
      return false;
    });
    this.$store.dispatch('student/getCodes');
    this.setSelectedRecords();
    this.initialSearch();
  },
  methods: {
    ...mapMutations('nomRollStudentSearch', ['setPageNumber', 'setSelectedRecords', 'setNomRollStudentSearchResponse', 'clearNomRollStudentSearchParams', 'setCurrentNomRollStudentSearchParams', 'setNomRollStudentSearchCriteria']),
    ...mapMutations('nominalRoll', ['setFedProvSchoolCodes']),
    searchPenRequestsByPen([field, pen]){
      this.clearNomRollStudentSearchParams();
      this.nomRollStudentSearchParams[field] = pen;
      this.searchPenRequests();
    },
    searchHasValues(){
      this.searchEnabled = Object.values(this.nomRollStudentSearchParams).some(v => !!v);
      return this.searchEnabled;
    },
    initialSearch() {
      if(this.currentNomRollStudentSearchParams) {
        this.nomRollStudentSearchParams = JSON.parse(JSON.stringify(this.currentNomRollStudentSearchParams));
      }
      this.searchPenRequests(true);
      if(this.nomRollStudentSearchParams) {
        this.searchHasValues();
      }
    },
    async searchPenRequests(initial = false) {
      this.setPageNumber(1);

      if(initial || (this.$refs.studentSearchForm.validate() && this.searchHasValues())) {
        this.searchLoading = true;
        this.disablePageHandler=true;
        try {
          if(this.fedProvSchoolCodes.length === 0) {
            try {
              const codesResponse = await ApiService.getFedProvSchoolCodes();
              this.setFedProvSchoolCodes(codesResponse.data);
            } catch (e) {
              this.setFailureAlert('An error occurred while loading school data. Please try again later.');
              console.log(e);
              throw e;
            }
          }

          if(initial) {
            await this.checkPostedNomRollStudents();
          }

          const searchCriteria = this.nomRollStudentSearchCriteriaList(this.nomRollStudentSearchParams);
          await this.retrievePenRequests(searchCriteria, true);
           
          this.setCurrentNomRollStudentSearchParams(JSON.parse(JSON.stringify(this.nomRollStudentSearchParams)));
          this.setNomRollStudentSearchCriteria(searchCriteria);
        } finally {
          this.searchLoading = false;
          this.disablePageHandler = false;
        }
      }
    },
    initializeNomRollStudents(students, isFilterOperation) {
      if (isFilterOperation) {
        // reset
        this.setSelectedRecords([]);
      }

      students.forEach(rec => {
        rec.isSelected = this.isSelected(rec);
        rec.mincode = this.fedProvSchoolCodes.find(obj => obj.federalCode === rec.schoolNumber)?.provincialCode || rec.schoolNumber;
      });

      return students;
    },
    isSelected(rec) {
      const foundItem = this.selectedRecords?.find(item => item?.nominalRollStudentID === rec.nominalRollStudentID);
      return !!foundItem;
    },
    nomRollStudentSearchCriteriaList(searchParams) {
      let optionalCriteriaList = [this.nomRollStudentStatusSearchCriteria];

      const studentSearchKeys = Object.keys(searchParams).filter(k => (searchParams[k] && searchParams[k].length !== 0));
      if (studentSearchKeys && studentSearchKeys.length > 0) {
        studentSearchKeys.forEach(element => {
          let value  = searchParams[element];

          let operation = SEARCH_FILTER_OPERATION.STARTS_WITH_IGNORE_CASE;
          let valueType = SEARCH_VALUE_TYPE.STRING;
          if (element === 'dob') {
            value = formatDob(value, 'uuuu/MM/dd', 'uuuu-MM-dd');
            valueType = SEARCH_VALUE_TYPE.STRING;
            operation = SEARCH_FILTER_OPERATION.EQUAL;
          } else if (element.includes('Name')) {
            operation = SEARCH_FILTER_OPERATION.STARTS_WITH;
          } else if (element === 'gradeCode') {
            value = value.replace(/^0/, '');
            operation = SEARCH_FILTER_OPERATION.EQUAL;
          } else if(element === 'genderCode' || element === 'assignedPEN') {
            operation = SEARCH_FILTER_OPERATION.EQUAL;
          } else if(element === 'mincode') {
            value = this.fedProvSchoolCodes.filter(obj => obj.provincialCode.startsWith(value)).map(obj => obj.federalCode).join(',');
            operation = SEARCH_FILTER_OPERATION.IN;
          }

          element = STUDENT_DETAILS_FIELDS_TO_NOMINAL_ROLL_STUDENT_FIELDS_MAPPER[element] || element;

          optionalCriteriaList.push({key: element, operation: operation, value: value, valueType: valueType, condition: SEARCH_CONDITION.AND});
        });
      }
      return [{
        searchCriteriaList: [this.nomRollStudentProcessingYearSearchCriteria, ...optionalCriteriaList],
      }];

    },
    retrievePenRequests(searchCriteria, isFilterOperation) {
      const params = {
        params: {
          pageNumber: this.pageNumber-1,
          sort: {
            status: 'ASC',
            schoolNumber: 'ASC',
            surname: 'ASC',
            givenNames: 'ASC',
          },
          searchQueries: searchCriteria || this.nomRollStudentSearchCriteriaList(this.nomRollStudentSearchParams),
        }
      };

      return ApiService.apiAxios
        .get(`${Routes['nominalRoll'].ROOT_ENDPOINT}/search`, params)
        .then(response => {
          response.data && response.data.content && this.initializeNomRollStudents(response.data.content, isFilterOperation);
          this.setNomRollStudentSearchResponse(response.data);
        })
        .catch(error => {
          this.setFailureAlert('An error occurred while loading nominal roll data. Please try again later.');
          console.log(error);
          throw error;
        });
    },
    checkPostedNomRollStudents() {
      return ApiService.apiAxios
        .get(`${Routes['nominalRoll'].ROOT_ENDPOINT}/posted`)
        .then(response => {
          this.isPosted = response.data;
        })
        .catch(err => {
          this.setFailureAlert('An error occurred while loading nominal roll data. Please try again later.');
          console.log(err);
          throw err;
        });
    },
  }
};
</script>

<style scoped>
  .header-divider {
    border-width: 0.35ex 0 0 0;
  }
</style>
