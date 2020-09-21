<template>
  <v-container fluid class="full-height px-0 mb-4">
    <v-form ref="prbStudentSearchForm" id="prbStudentSearchForm"
      v-model="validForm"
    >
      <v-container fluid class="fill-height px-0">
        <v-row no-gutters>
          <v-card elevation="0" height="100%" width="100%" style="background-color:#d7d7d7;">
            <v-row no-gutters class="py-2" style="background-color:white;">
              <v-col cols="1" class="py-0 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3">
                <v-text-field
                  id='minCode'
                  v-model="prbStudentSearchParams.minCode"
                  tabindex="1"
                  color="#003366"
                  label="Mincode"
                  maxlength="8"
                  minLength="8"
                  @keyup.enter="enterPushed()"
                  v-on:input="searchHasValues"
                  :rules="validateField(prbStudentSearchParams.minCode, isValidMinCode, minCodeHint)"
                  dense
                  autofocus
                ></v-text-field>
                <v-text-field
                  id='localID'
                  v-model="prbStudentSearchParams.localID"
                  color="#003366"
                  tabindex="9"
                  label="Local ID"
                  maxlength="12"
                  @keyup.enter="enterPushed()"
                  v-on:input="searchHasValues"
                  :rules="validateField(prbStudentSearchParams.localID)"
                  dense
                ></v-text-field>
              </v-col>
              <v-col class="py-0 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3">
                <v-text-field
                  id='legalLastName'
                  v-model="prbStudentSearchParams.legalLastName"
                  color="#003366"
                  label="Legal Surname"
                  @keyup.enter="enterPushed()"
                  v-on:input="searchHasValues"
                  maxlength="255"
                  tabindex="2"
                  dense
                ></v-text-field>
                <v-text-field
                  id='usualLastName'
                  v-model="prbStudentSearchParams.usualLastName"
                  color="#003366"
                  label="Usual Surname"
                  @keyup.enter="enterPushed()"
                  v-on:input="searchHasValues"
                  tabindex="10"
                  maxlength="255"
                  dense
                ></v-text-field>
              </v-col>
              <v-col class="py-0 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3">
                <v-text-field
                  id='legalFirstName'
                  v-model="prbStudentSearchParams.legalFirstName"
                  tabindex="3"
                  color="#003366"
                  label="Legal Given"
                  @keyup.enter="enterPushed()"
                  v-on:input="searchHasValues"
                  maxlength="255"
                  dense
                ></v-text-field>
                <v-text-field
                  id='usualFirstName'
                  v-model="prbStudentSearchParams.usualFirstName"
                  color="#003366"
                  label="Usual Given"
                  @keyup.enter="enterPushed()"
                  v-on:input="searchHasValues"
                  tabindex="11"
                  maxlength="255"
                  dense
                  ></v-text-field>
              </v-col>
              <v-col class="py-0 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3">
                <v-text-field
                  id='legalMiddleNames'
                  v-model="prbStudentSearchParams.legalMiddleNames"
                  color="#003366"
                  label="Legal Middle"
                  v-on:input="searchHasValues"
                  @keyup.enter="enterPushed()"
                  tabindex="4"
                  maxlength="255"
                  dense
                ></v-text-field>
                <v-text-field
                  id='usualMiddleNames'
                  v-model="prbStudentSearchParams.usualMiddleNames"
                  color="#003366"
                  label="Usual Middle"
                  @keyup.enter="enterPushed()"
                  v-on:input="searchHasValues"
                  tabindex="12"
                  maxlength="255"
                  dense
                ></v-text-field>
              </v-col>
              <v-col class="py-0 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3">
                <v-text-field
                  id='genderCode'
                  v-model="prbStudentSearchParams.genderCode"
                  tabindex="5"
                  color="#003366"
                  label="Gender"
                  maxlength="1"
                  @keyup.enter="enterPushed()"
                  v-on:input="[searchHasValues(),uppercaseGender()]"
                  :rules="validateField(prbStudentSearchParams.genderCode, isValidGender, genderHint)"
                  dense
                ></v-text-field>
                <v-text-field
                  id='postalCode'
                  v-model="prbStudentSearchParams.postalCode"
                  tabindex="13"
                  color="#003366"
                  label="Postal Code"
                  v-on:input="[searchHasValues(),uppercasePostal()]"
                  maxlength="7"
                  @keyup.enter="enterPushed()"
                  :rules="validateField(prbStudentSearchParams.postalCode, isValidPostalCode, postalCodeHint)"
                  dense
                ></v-text-field>
              </v-col>
              <v-col class="py-0 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3">
                <v-text-field
                  id='dob'
                  v-model="prbStudentSearchParams.dob"
                  tabindex="6"
                  color="#003366"
                  label="Birth Date"
                  :rules="validateField(prbStudentSearchParams.dob, isValidDob, dobHint)"
                  maxlength="10"
                  minLength="10"
                  @keyup.enter="enterPushed()"
                  v-on:input="searchHasValues"
                  dense
                ></v-text-field>
                <v-text-field
                  id="gradeCode"
                  v-model="prbStudentSearchParams.gradeCode"
                  color="#003366"
                  label="Grade"
                  tabindex="14"
                  maxlength="2"
                  @keyup.enter="enterPushed()"
                  v-on:input="[searchHasValues(), uppercaseGrade()]"
                  :rules="validateField(prbStudentSearchParams.gradeCode, isValidGradeCode, gradeHint)"
                  minLength="1"
                  dense
                ></v-text-field>
              </v-col>
              <v-col class="py-0 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3">
                <v-text-field
                  id='bestMatchPEN'
                  v-model="prbStudentSearchParams.bestMatchPEN"
                  color="#003366"
                  label="Suggested PEN"
                  maxlength="9"
                  minlength="9"
                  @keyup.enter="enterPushed()"
                  v-on:input="[searchHasValues(),runPENSearchIfPossible('bestMatchPEN')]"
                  tabindex="7"
                  dense
                  :rules="validatePen(prbStudentSearchParams.bestMatchPEN)"
                ></v-text-field>
                <v-text-field
                  id='submittedPen'
                  v-model="prbStudentSearchParams.submittedPen"
                  color="#003366"
                  label="Submitted PEN"
                  maxlength="9"
                  minlength="9"
                  @keyup.enter="enterPushed()"
                  v-on:input="[searchHasValues(),runPENSearchIfPossible('submittedPen')]"
                  tabindex="15"
                  dense
                  :rules="validatePen(prbStudentSearchParams.submittedPen)"
                ></v-text-field>
              </v-col>
              <v-col class="py-0 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3">
                <v-text-field
                  id='submission'
                  v-model="prbStudentSearchParams.submissionNumber"
                  color="#003366"
                  label="Submission #"
                  maxlength="8"
                  minlength="8"
                  @keyup.enter="enterPushed()"
                  v-on:input="searchHasValues"
                  tabindex="8"
                  dense
                  :rules="validateField(prbStudentSearchParams.submissionNumber)"
                ></v-text-field>
                <div class="d-flex justify-end pt-2">
                  <PrimaryButton id="perform-search" :disabled="!searchEnabled" :loading="searchLoading && searchEnabled" @click.native="searchPenRequests" text="Search"></PrimaryButton>
                </div>
              </v-col>
            </v-row>
            <v-progress-linear
              indeterminate
              color="blue"
              :active="searchLoading && !searchEnabled"
            ></v-progress-linear>
            <v-row v-if="prbStudentSearchResponse" no-gutters class="py-2" style="background-color:white;">
              <v-divider class="mx-3 header-divider"/>
            </v-row>
            <v-row v-if="prbStudentSearchResponse" id="resultsRow" no-gutters class="py-2" style="background-color:white;">
              <PrbStudentSearchResults
                :retrievePenRequests="retrievePenRequests"
                :loading="searchLoading"
              ></PrbStudentSearchResults>
            </v-row>
          </v-card>
        </v-row>
      </v-container>
    </v-form>
  </v-container>
</template>
<script>
import ApiService from '../../../common/apiService';
import { Routes, SEARCH_FILTER_OPERATION, SEARCH_CONDITION, SEARCH_VALUE_TYPE } from '../../../utils/constants';
import { mapGetters, mapMutations, mapState } from 'vuex';
import PrimaryButton from '../../util/PrimaryButton';
import { isValidPEN, isValidMinCode, isValidPostalCode, isValidDob, isValidAlphanumericValue } from '../../../utils/validation';
import PrbStudentSearchResults from './PrbStudentSearchResults';
import {formatMinCode, formatPen, formatDob, formatPostalCode} from '../../../utils/format';

export default {
  components: {
    PrimaryButton,
    PrbStudentSearchResults,
  },
  props: {
    batchIDs: {
      type: [Array, String],
      default: () => []
    },
    statusFilters: {
      type: [Array, String],
      default: () => []
    }
  },
  data() {
    return {
      penHint: 'Fails check-digit test',
      postalCodeHint: 'Invalid Postal Code',
      minCodeHint: 'Digits only',
      genderHint: 'Invalid gender',
      gradeHint: 'Invalid grade',
      dobHint: 'Invalid Birth Date',
      alphanumericHint: 'Alphanumeric only',
      validForm: false,
      searchLoading: false,
      searchEnabled: false,
      prbStudentSearchResultsKey: 0,
    };
  },
  computed:{
    ...mapGetters('student', ['gradeCodeObjects']),
    ...mapState('student', ['genders']),
    ...mapState('prbStudentSearch', ['pageNumber', 'prbStudentSearchResponse', 'selectedStudentStatus', 'currentPrbStudentSearchParams']),
    prbStudentSearchParams: {
      get(){
        return this.$store.state['prbStudentSearch'].prbStudentSearchParams;
      },
      set(newPage){
        return this.$store.state['prbStudentSearch'].prbStudentSearchParams = newPage;
      }
    },
    genderCodes() {
      return this.genders ? this.genders.map(a => a.genderCode):[];
    },
    gradeCodes() {
      return this.gradeCodeObjects ? this.gradeCodeObjects.map(a => a.gradeCode):[];
    },
    penRequestStatusSearchCriteria() {
      const keys = {
        matchedCount: ['MATCHEDSYS', 'MATCHEDUSR'],
        newPenCount: ['NEWPENSYS', 'NEWPENUSR'],
        errorCount: ['ERROR'],
        repeatCount: ['REPEAT'],
        fixableCount: ['FIXABLE']
      };
      const statuses = this.selectedStudentStatus || [this.statusFilters].flat().map(filter => keys[filter]).join(',');
      return {
        key: 'penRequestBatchStudentStatusCode', 
        operation: statuses.length > 0 ? SEARCH_FILTER_OPERATION.IN : SEARCH_FILTER_OPERATION.NOT_EQUAL, 
        value: statuses.length > 0 ? statuses : 'LOADED', 
        valueType: SEARCH_VALUE_TYPE.STRING
      };
    },
  },
  mounted() {
    this.$store.dispatch('penRequestBatch/getCodes');
    if(this.currentPrbStudentSearchParams) {
      this.prbStudentSearchParams = JSON.parse(JSON.stringify(this.currentPrbStudentSearchParams));
    }
    this.searchPenRequests(true);
    if(this.prbStudentSearchParams) {
      this.searchHasValues();
    }
  },
  methods: {
    ...mapMutations('prbStudentSearch', ['setPageNumber', 'setSelectedRecords', 'setPrbStudentSearchResponse', 'clearPrbStudentSearchParams', 'setCurrentPrbStudentSearchParams']),
    uppercasePostal(){
      if(this.prbStudentSearchParams.postalCode){
        this.prbStudentSearchParams.postalCode = this.prbStudentSearchParams.postalCode.toUpperCase();
      }
    },
    uppercaseGender(){
      if(this.prbStudentSearchParams.genderCode){
        this.prbStudentSearchParams.genderCode = this.prbStudentSearchParams.genderCode.toUpperCase();
      }
    },
    uppercaseGrade() {
      if(this.prbStudentSearchParams.gradeCode) {
        this.prbStudentSearchParams.gradeCode = this.prbStudentSearchParams.gradeCode.toUpperCase();
      }
    },
    enterPushed() {
      if(this.searchHasValues()){
        this.searchPenRequests();
      }
    },
    runPENSearchIfPossible(field){
      const pen = this.prbStudentSearchParams[field];
      if(isValidPEN(pen)){
        this.clearPrbStudentSearchParams();
        this.prbStudentSearchParams[field] = pen;
        this.searchPenRequests();
      }
    },
    isValidGender(code) {
      return !!(code && this.genderCodes.includes(code.toUpperCase()));
    },
    isValidGradeCode(code) {
      return !!(code && this.gradeCodes.includes(code.toUpperCase()));
    },
    isValidMinCode,
    isValidPostalCode,
    isValidDob,
    validateField(value, validator=isValidAlphanumericValue, hint=this.alphanumericHint, length=0) {
      if(!value || validator(value)) {
        return [];
      }
      this.searchEnabled = false;
      if(value.length < length) {
        return [];
      } else {
        return [
          hint
        ];
      }
    },
    validatePen(pen) {
      return this.validateField(pen, isValidPEN, this.penHint, 9);
    },
    searchHasValues(){
      this.searchEnabled = Object.values(this.prbStudentSearchParams).some(v => !!v);
      return this.searchEnabled;
    },
    searchPenRequests(initial = false) {
      this.searchLoading = true;
      this.prbStudentSearchResultsKey += 1; //forces prbStudentSearchResults to rerender and update curPage
      this.setSelectedRecords();
      this.setPageNumber(1);

      if(initial || (this.$refs.prbStudentSearchForm.validate() && this.searchHasValues())) {
        this.retrievePenRequests(this.prbStudentSearchParams)
          .then(() => {
            this.setCurrentPrbStudentSearchParams(JSON.parse(JSON.stringify(this.prbStudentSearchParams)));
          })
          .finally(() => {
            this.searchLoading = false;
          });
      }else{
        this.searchLoading = false;
      }
    },
    initializePrbStudents(students) {
      students.forEach(student => {
        student.minCode && (student.minCode = formatMinCode(student.minCode));
        student.bestMatchPEN && (student.bestMatchPEN = formatPen(student.bestMatchPEN));
        student.submittedPen && (student.submittedPen = formatPen(student.submittedPen));
        student.dob && (student.dob = formatDob(student.dob));
        student.postalCode && (student.postalCode = formatPostalCode(student.postalCode));
        student.isSelected = false;
      });
      return students;
    },
    prbStudentSearchCriteriaList(searchParams) {
      const statusCriteriaList = [this.batchIDs].flat().map(batchID => 
        ({key: 'penRequestBatchEntity.penRequestBatchID', operation: SEARCH_FILTER_OPERATION.EQUAL, value: batchID, valueType: SEARCH_VALUE_TYPE.UUID}));

      let optionalCriteriaList = [this.penRequestStatusSearchCriteria];

      const prbStudentSearchKeys = Object.keys(searchParams).filter(k => (searchParams[k] && searchParams[k].length !== 0));
      if (prbStudentSearchKeys && prbStudentSearchKeys.length > 0) {
        prbStudentSearchKeys.forEach(element => {
          let value  = searchParams[element];

          let operation = SEARCH_FILTER_OPERATION.STARTS_WITH_IGNORE_CASE;
          let valueType = SEARCH_VALUE_TYPE.STRING;
          if (element === 'dob') {
            value = value.replace(/\//g, '');
            valueType = SEARCH_VALUE_TYPE.STRING;
            operation = SEARCH_FILTER_OPERATION.EQUAL;
          } else if (element.includes('Name')) {
            operation = SEARCH_FILTER_OPERATION.STARTS_WITH_IGNORE_CASE;
          } else if (element === 'postalCode') {
            value = value.replace(/ +/g, '');
            operation = SEARCH_FILTER_OPERATION.EQUAL;
          } else if(element === 'genderCode' || element === 'gradeCode') {
            operation = SEARCH_FILTER_OPERATION.EQUAL;
          } else if(element === 'minCode' || element === 'submissionNumber') {
            element = 'penRequestBatchEntity.' + element;
          }

          optionalCriteriaList.push({key: element, operation: operation, value: value, valueType: valueType, condition: SEARCH_CONDITION.AND});
        });
      }

      const searchCriteriaList = [
        { 
          searchCriteriaList: statusCriteriaList,
        },
        { 
          condition: 'AND', 
          searchCriteriaList: optionalCriteriaList
        },
      ];

      return searchCriteriaList.filter(criteria => criteria?.searchCriteriaList?.length > 0);
    },
    retrievePenRequests(searchParams) {
      const params = {
        params: {
          pageNumber: this.pageNumber-1,
          sort: {
            'penRequestBatchEntity.minCode': 'ASC',
            legalLastName: 'ASC',
            legalFirstName: 'ASC',
            legalMiddleNames: 'ASC'
          },
          searchQueries: this.prbStudentSearchCriteriaList(searchParams),
        }
      };

      return ApiService.apiAxios
        .get(Routes['penRequestBatch'].STUDENTS_SEARCH_URL, params)
        .then(response => {
          response.data && response.data.content && this.initializePrbStudents(response.data.content);
          this.setPrbStudentSearchResponse(response.data);
        })
        .catch(error => {
          console.log(error);
          throw error;
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
