<template>
  <v-container fluid class="full-height px-0">
    <CreateNewPenModal @closeDialog="closeDialog" :dialog="createNewPenDialog"
                       :student-data="student">
      <template v-slot:actions="{ isFormValid, isValidForm, createNewPenLoading }">
        <PrimaryButton id="cancel" :secondary="true" text="Cancel"
                       @click.native="closeDialog"
        >
        </PrimaryButton>

        <PrimaryButton width="15%"
                       text="Create PEN"
                       id="createNewPENSubmitButton"
                       :loading="createNewPenLoading"
                       :disabled="isValidForm"
                       @click.native="isFormValid()"
        >
        </PrimaryButton>
      </template>
    </CreateNewPenModal>
    <v-form ref="studentSearchForm" id="searchStudentForm"
            v-model="validForm"
    >
      <v-container fluid class="fill-height px-0">
        <v-row no-gutters>
          <v-card elevation="0" height="100%" width="100%" style="background-color:#d7d7d7;">
            <StudentAdvancedSearch
              :enterPushed="enterPushed"
              :runPENSearchIfPossible="runPENSearchIfPossible"
              :searchHasValues="searchHasValues"
              :validatePen="validatePen"
              :uppercaseGender="uppercaseGender"
              :validateGender="validateGender"
              :validateMincode="validateMincode"
              :uppercasePostal="uppercasePostal"
              :uppercaseGrade="uppercaseGrade"
              :useDOB.sync="useDOB"
              :validatePostal="validatePostal"
              :validateGradeCode="validateGradeCode"
              :initialSearch="initialSearch"
              @valueChange="handleValueChange"
            >
            </StudentAdvancedSearch>
            <v-row justify="end" no-gutters class="py-3 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3"
                   style="background-color:white;">
              <PrimaryButton v-if="createNewPenButtonAvailableForUser" id="create-new-pen" class="mr-2"
                             :disabled="createNewPenDisabled" @click.native="openCreatePenModal"
                             text="Create PEN"></PrimaryButton>
              <PrimaryButton id="search-clear" :secondary="true" class="mr-2" @click.native="clearSearch"
                             text="Clear"></PrimaryButton>
              <PrimaryButton id="perform-search" :disabled="!searchEnabled" :loading="searchLoading"
                             @click.native="searchStudent(true)" text="Search"></PrimaryButton>
            </v-row>
            <v-row v-if="this.studentSearchResponse" no-gutters class="py-2" style="background-color:white;">
              <v-divider class="mx-3"/>
            </v-row>
            <v-row v-if="this.studentSearchResponse" id="resultsRow" no-gutters class="py-2"
                   style="background-color:white;">
              <StudentSearchResults
                :searchCriteria="this.currentStudentSearchParams"
                :prepPut="prepPut"
                :searchLoading="searchLoading"
              ></StudentSearchResults>
            </v-row>
          </v-card>
        </v-row>
      </v-container>
    </v-form>
  </v-container>
</template>
<script>
import {LocalDate} from '@js-joda/core';
import ApiService from '../../../common/apiService';
import {REQUEST_TYPES, Routes, STUDENT_DETAILS_FIELDS} from '@/utils/constants';
import {mapGetters, mapMutations, mapState} from 'vuex';
import StudentSearchResults from './StudentSearchResults';
import StudentAdvancedSearch from './StudentAdvancedSearch';
import PrimaryButton from '../../util/PrimaryButton';
import {checkDigit, isValidMincode, isValidPEN, isValidPostalCode} from '@/utils/validation';
import alertMixin from '@/mixins/alertMixin';
import {AccessEnabledForUser} from '@/common/role-based-access';
import CreateNewPenModal from '@/components/common/CreateNewPenModal';
import {pick, cloneDeep} from 'lodash';
export default {
  components: {
    CreateNewPenModal,
    PrimaryButton,
    StudentAdvancedSearch,
    StudentSearchResults
  },
  mixins: [alertMixin],
  props: {
    searchType: {
      type: String,
      required: true
    },
    searchParams: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      penHint: 'Fails check-digit test',
      postalCodeHint: 'Invalid Postal Code',
      mincodeHint: 'Digits only',
      genderHint: 'Invalid gender',
      gradeHint: 'Invalid grade',
      validForm: false,
      menu: false,
      useDOB: true,
      localDate: LocalDate,
      searchLoading: false,
      searchEnabled: false,
      currentStudentSearchParams: {},
      studentSearchResultsKey: 0,
      REQUEST_TYPES: REQUEST_TYPES,
      initialSearch: false,
      createNewPenButtonAvailableForUser: false,
      createNewPenDisabled: true,
      createNewPenDialog: false,
      createNewPenLoading: false,
      student: {},
    };
  },
  computed: {
    ...mapGetters('auth', ['userInfo']),
    ...mapGetters('student', ['gradeCodeObjects']),
    ...mapState('student', ['genders']),
    ...mapState('studentSearch', ['pageNumber', 'headerSortParams', 'advancedSearchCriteria', 'studentSearchResponse']),
    ...mapState('penRequestBatch', ['prbValidationFieldCodes', 'prbValidationIssueTypeCodes']),
    isAdvancedSearch() {
      return this.searchType === REQUEST_TYPES.studentSearch.type.advanced;
    },
    studentSearchParams: {
      get() {
        this.setCurrentSearchObject(this.$store.state['studentSearch'].studentSearchParams);
        return this.$store.state['studentSearch'].studentSearchParams;
      },
      set(newPage) {
        return this.$store.state['studentSearch'].studentSearchParams = newPage;
      }
    },
    genderCodes() {
      return this.genders ? this.genders.map(a => a.genderCode) : [];
    },
    gradeCodes() {
      return this.gradeCodeObjects ? this.gradeCodeObjects.map(a => a.gradeCode) : [];
    },
    charRules() {
      return [
        v => !(/[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F\u1100-\u11FF\u3040-\u309F\u30A0-\u30FF\u3130-\u318F\u3400-\u4DBF\u4E00-\u9FFF\uAC00-\uD7AF]/.test(v)) || 'Enter English characters only'
      ];
    },
  },
  mounted() {
    this.$store.dispatch('student/getCodes');
    this.$store.dispatch('penRequestBatch/getCodes');
    this.studentSearchParams = {...this.studentSearchParams, ..._.omit(this.searchParams, ['dob'])};
    if (this.searchParams.dob) {
      this.studentSearchParams.dob.startDate = this.searchParams.dob;
    }
    this.initialSearch = true;
    this.createNewPenButtonAvailableForUser = AccessEnabledForUser('student', 'CREATE_NEW_PEN', this.userInfo);
    if (this.studentSearchParams) {
      this.searchHasValues();
    }

    // if any of these fields exist, automatically perform search
    if (this.searchParams &&
      (this.searchParams.legalLastName || this.searchParams.legalFirstName
        || this.searchParams.genderCode || this.searchParams.dob)) {
      this.enterPushed();
    }
  },
  watch: {
    studentSearchResponse: {
      async handler() {
        await this.$nextTick();
        document.getElementById('resultsRow').scrollIntoView({behavior: 'smooth'});
      }
    }
  },
  methods: {
    ...mapMutations('studentSearch', ['setPageNumber', 'setSelectedRecords', 'setStudentSearchResponse', 'clearStudentSearchParams', 'clearStudentSearchResults']),
    setCurrentSearchObject(searchParams) {
      this.currentStudentSearchParams = JSON.parse(JSON.stringify(searchParams));
    },
    clearSearch() {
      this.clearStudentSearchParams();
      this.searchHasValues();
      this.createNewPenDisabled = true;
    },
    clearSearchResult() {
      this.clearStudentSearchResults();
    },
    uppercasePostal() {
      if (this.studentSearchParams.postalCode) {
        this.studentSearchParams.postalCode = this.studentSearchParams.postalCode.toUpperCase();
      }
    },
    uppercaseGender() {
      if (this.studentSearchParams.genderCode) {
        this.studentSearchParams.genderCode = this.studentSearchParams.genderCode.toUpperCase();
      }
    },
    uppercaseGrade() {
      if (this.studentSearchParams.gradeCode) {
        this.studentSearchParams.gradeCode = this.studentSearchParams.gradeCode.toUpperCase();
      }
    },
    enterPushed() {
      if (this.searchHasValues()) {
        this.searchStudent(true, true);
      }
    },
    runPENSearchIfPossible() {
      if (this.studentSearchParams && isValidPEN(this.studentSearchParams.pen)) {
        const pen = this.studentSearchParams.pen;
        this.clearStudentSearchParams();
        this.studentSearchParams.pen = pen;
        this.searchStudent(true, false);
      }
    },
    validatePen() {
      let validPEN = false;
      if (this.studentSearchParams) {
        if (!this.studentSearchParams.pen) {
          validPEN = true;
        } else if (this.studentSearchParams.pen.length === 9) {
          if (checkDigit(this.studentSearchParams.pen)) {
            validPEN = true;
          }
        }
      }
      if (validPEN) {
        return [];
      } else {
        this.searchEnabled = false;
        if (this.studentSearchParams.pen.length < 9) {
          return [];
        } else {
          return [
            this.penHint
          ];
        }
      }
    },
    validateGender() {
      if (this.studentSearchParams) {
        if (!this.studentSearchParams.genderCode) {
          return [];
        } else {
          if (this.genderCodes.length === 0 || this.genderCodes.includes(this.studentSearchParams.genderCode)) {
            return [];
          }
        }
      }
      this.searchEnabled = false;
      return [
        this.genderHint
      ];
    },
    validateMincode() {
      if (this.studentSearchParams) {
        if (!this.studentSearchParams.mincode) {
          return [];
        } else {
          if (isValidMincode(this.studentSearchParams.mincode)) {
            return [];
          }
        }
      }
      this.searchEnabled = false;
      return [
        this.mincodeHint
      ];
    },
    validatePostal() {
      if (this.studentSearchParams) {
        if (!this.studentSearchParams.postalCode) {
          return [];
        } else {
          if (isValidPostalCode(this.studentSearchParams.postalCode)) {
            return [];
          }
        }
      }
      this.searchEnabled = false;
      return [
        this.postalCodeHint
      ];
    },
    validateGradeCode() {
      if (this.studentSearchParams) {
        if (!this.studentSearchParams.gradeCode) {
          return [];
        } else {
          if (this.gradeCodes.length === 0 || this.gradeCodes.includes(this.studentSearchParams.gradeCode.toUpperCase())) {
            return [];
          }
        }
      }
      this.searchEnabled = false;
      return [
        this.gradeHint
      ];
    },
    requiredRules(hint = 'Required') {
      return [
        v => !!(v && v.trim()) || hint,
        ...this.charRules
      ];
    },
    focusBirthdateField(event) {
      if (event.key === 'Tab' && event.type === 'keyup') {
        this.menu = true;
      }
    },
    async searchHasValues() {
      await this.$nextTick();
      if (this.$refs.studentSearchForm.validate() && (this.studentSearchParams.pen ||
        this.studentSearchParams.legalLastName ||
        this.studentSearchParams.legalFirstName ||
        this.studentSearchParams.legalMiddleNames ||
        this.studentSearchParams.postalCode ||
        this.studentSearchParams.genderCode ||
        (this.studentSearchParams.dob.startDate && this.useDOB) ||
        this.studentSearchParams.mincode ||
        this.studentSearchParams.usualLastName ||
        this.studentSearchParams.usualFirstName ||
        this.studentSearchParams.usualMiddleNames ||
        this.studentSearchParams.memo ||
        this.studentSearchParams.localID ||
        this.studentSearchParams.gradeCode)) {
        this.searchEnabled = true;
        return true;
      } else {
        this.searchEnabled = false;
      }
    },
    searchStudent(validationRequired = true) {
      this.searchLoading = true;
      this.studentSearchResultsKey += 1; //forces StudentSearchResults to rerender and update curPage
      this.setSelectedRecords();
      this.setPageNumber(1);
      this.headerSortParams['currentSortAsc'] = true;

      if (validationRequired === false || (this.$refs.studentSearchForm.validate() && this.searchHasValues())) {
        const studentSearchKeys = Object.keys(this.studentSearchParams).filter(k => (this.studentSearchParams[k] && this.studentSearchParams[k].length !== 0));
        let studentSearchFilters;
        if (studentSearchKeys?.length > 0) {
          studentSearchFilters = {};
          studentSearchKeys.forEach(element => {
            if (element === 'dob') {
              if (!this.useDOB || !this.studentSearchParams[element].startDate) {
                return;
              }
            }
            studentSearchFilters[element] = this.studentSearchParams[element];
          });

          studentSearchFilters['useNameVariants'] = this.isAdvancedSearch && this.advancedSearchCriteria.useNameVariants;
          studentSearchFilters['isAuditHistorySearch'] = this.isAdvancedSearch && this.advancedSearchCriteria.isAuditHistorySearch;
          if (this.isAdvancedSearch && this.advancedSearchCriteria.statusCode.length > 0) {
            studentSearchFilters['statusCode'] = this.advancedSearchCriteria.statusCode;
          }
        }
        ApiService.apiAxios
          .get(Routes['student'].SEARCH_URL, this.prepPut(studentSearchFilters))
          .then(response => {
            this.setStudentSearchResponse(response.data);
            this.currentStudentSearchParams = JSON.parse(JSON.stringify(studentSearchFilters));
            this.checkAndEnableCreatePen();
          })
          .catch(error => {
            if (error?.response?.status === 400) {
              this.setFailureAlert(error?.response?.data?.message);
            } else {
              this.setFailureAlert('An error occurred while loading the search results. Please try again later.');
            }
            console.error(error.response);
          })
          .finally(() => {
            this.searchLoading = false;
          });
      } else {
        this.searchLoading = false;
      }
    },
    prepPut(studentSearchFilters) {
      let sort = {};
      sort[this.headerSortParams.currentSort] = this.headerSortParams.currentSortAsc ? 'ASC' : 'DESC';
      return {
        params: {
          pageNumber: this.pageNumber - 1,
          sort: sort,
          searchQueries: studentSearchFilters
        }
      };
    },
    save(date) {
      this.$refs.menu.save(date);
      this.$refs.birthdate.$el.querySelectorAll('#birthdate')[0].focus();
    },
    handleValueChange() {
      this.createNewPenDisabled = true;
    },
    checkAndEnableCreatePen() {
      if (this.createNewPenButtonAvailableForUser) { // do the logic only when the button is available for the user.
        this.createNewPenDisabled = !(
          this.studentSearchParams.legalLastName &&
          this.studentSearchParams.legalFirstName &&
          this.studentSearchParams.genderCode &&
          !this.studentSearchParams.useDOBRange &&
          this.studentSearchParams.dob?.startDate
        );
      }
    },
    async closeDialog() {
      this.createNewPenDialog = false;
      await this.$nextTick(); //need to wait so update can me made in parent and propagated back down to child component
    },
    openCreatePenModal() {
      this.student = null; //clear the data.
      const pickList = [STUDENT_DETAILS_FIELDS.LEGAL_FIRST_NAME, STUDENT_DETAILS_FIELDS.LEGAL_LAST_NAME, STUDENT_DETAILS_FIELDS.LEGAL_MIDDLE_NAMES, STUDENT_DETAILS_FIELDS.USUAL_FIRST_NAME,STUDENT_DETAILS_FIELDS.USUAL_LAST_NAME,STUDENT_DETAILS_FIELDS.USUAL_MIDDLE_NAMES,STUDENT_DETAILS_FIELDS.DOB];
      this.student =  cloneDeep(pick(this.studentSearchParams, pickList));
      this.student.dob = this.studentSearchParams.dob?.startDate?.replace(/\D/g,'');
      this.createNewPenDialog = true;
    }
  }
};
</script>
