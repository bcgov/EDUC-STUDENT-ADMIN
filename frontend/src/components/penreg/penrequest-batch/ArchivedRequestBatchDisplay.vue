<template>
    <v-container fluid class="fill-height px-0 mb-4">
      <v-form v-model="isValidSearchForm">
        <v-row no-gutters class="list-actions pt-4 pb-4 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3"
               style="background-color:white;">

          <v-col cols="9" xl="8" class="pa-0">
            <v-sheet
                class="mx-0 px-2 py-1 d-flex align-end align-self-start"
                color="rgba(0, 0, 0, 0.06)"
                outlined
                rounded
            >
              <v-col class="pa-0">
                <v-row no-gutters class="pa-0">
                  <v-col cols="2" class="py-0 px-1 px-sm-1 px-md-2 px-lg-2 px-xl-3">
                    <v-text-field
                        id='minCode'
                        v-model="batchFileSearchParams.mincode"
                        tabindex="1"
                        color="#003366"
                        label="Mincode"
                        maxlength="8"
                        @keyup.enter="enterPushed()"
                        v-on:input="searchHasValues"
                        :rules="validateField(batchFileSearchParams.minCode, isValidMincode, minCodeHint)"
                        dense
                        autofocus
                    ></v-text-field>
                  </v-col>
                  <v-col cols="3" class="py-0 px-1 px-sm-1 px-md-2 px-lg-2 px-xl-3">
                    <v-text-field
                        id='schoolName'
                        v-model="batchFileSearchParams.schoolName"
                        tabindex="2"
                        color="#003366"
                        label="School Name"
                        @keyup.enter="enterPushed()"
                        v-on:input="searchHasValues"
                        dense
                    ></v-text-field>
                  </v-col>
                  <v-col cols="2" class="py-0 px-1 px-sm-1 px-md-2 px-lg-2 px-xl-3">
                    <FormattedTextField
                        :id="'loadDateFrom'"
                        v-model="batchFileSearchParams.load.startDate"
                        :clearable="false"
                        :filled="false"
                        :format="formatDob"
                        :label="'Date From'"
                        :outlined="false"
                        :rules="[validateStartDate,validateEndDate]"
                        :tabindex="'3'"
                        maxlength="8"
                        @input="searchHasValues"
                        @keyup.enter.native="enterPushed()"
                    ></FormattedTextField>
                  </v-col>
                  <v-col cols="2" class="py-0 px-1 px-sm-1 px-md-2 px-lg-2 px-xl-3">
                    <FormattedTextField
                        :id="'loadDateTo'"
                        v-model="batchFileSearchParams.load.endDate"
                        :clearable="false"
                        :filled="false"
                        :format="formatDob"
                        :label="'Date To'"
                        :outlined="false"
                        :rules="[validateEndDate]"
                        :tabindex="'4'"
                        maxlength="8"
                        @input="searchHasValues"
                        @keyup.enter.native="enterPushed()"
                    ></FormattedTextField>
                  </v-col>
                </v-row>
                <v-row no-gutters class="pa-0" v-if="refinedSearch">
                  <v-col cols="2" class="py-0 px-1 px-sm-1 px-md-2 px-lg-2 px-xl-3">
                    <v-text-field
                        id='legalLastName'
                        v-model="batchFileSearchParams.prbStudent.legalLastName"
                        tabindex="5"
                        color="#003366"
                        label="Legal Surname"
                        maxlength="255"
                        @keyup.enter="enterPushed()"
                        v-on:input="searchHasValues"
                        dense
                    ></v-text-field>
                  </v-col>
                  <v-col cols="2" class="py-0 px-1 px-sm-1 px-md-2 px-lg-2 px-xl-3">
                    <v-text-field
                        id='legalFirstName'
                        v-model="batchFileSearchParams.prbStudent.legalFirstName"
                        tabindex="6"
                        color="#003366"
                        label="Legal Given"
                        maxlength="255"
                        @keyup.enter="enterPushed()"
                        v-on:input="searchHasValues"
                        dense
                    ></v-text-field>
                  </v-col>
                  <v-col cols="2" class="py-0 px-1 px-sm-1 px-md-2 px-lg-2 px-xl-3">
                    <v-text-field
                        id='legalMiddleNames'
                        v-model="batchFileSearchParams.prbStudent.legalMiddleNames"
                        tabindex="7"
                        color="#003366"
                        label="Legal Middle"
                        maxlength="255"
                        @keyup.enter="enterPushed()"
                        v-on:input="searchHasValues"
                        dense
                    ></v-text-field>
                  </v-col>
                  <v-col cols="1" class="py-0 px-1 px-sm-1 px-md-2 px-lg-2 px-xl-3">
                    <v-text-field
                        id='genderCode'
                        v-model="batchFileSearchParams.prbStudent.genderCode"
                        tabindex="8"
                        color="#003366"
                        label="Gender"
                        maxlength="1"
                        @keyup.enter="enterPushed()"
                        v-on:input="[searchHasValues(), upperCaseInput(batchFileSearchParams.prbStudent, 'genderCode')]"
                        :rules="validateField(batchFileSearchParams.prbStudent.genderCode, isValidGender, genderHint)"
                        dense
                    ></v-text-field>
                  </v-col>
                  <v-col cols="2" class="py-0 px-1 px-sm-1 px-md-2 px-lg-2 px-xl-3">
                    <v-text-field
                        id='dob'
                        v-model="batchFileSearchParams.prbStudent.dob"
                        tabindex="9"
                        color="#003366"
                        label="Birth Date"
                        maxlength="10"
                        @keyup.enter="enterPushed()"
                        v-on:input="searchHasValues"
                        :rules="validateField(batchFileSearchParams.prbStudent.dob, isValidDob, dobHint)"
                        dense
                    ></v-text-field>
                  </v-col>
                  <v-col cols="2" class="py-0 px-1 px-sm-1 px-md-2 px-lg-2 px-xl-3">
                    <v-text-field
                        id='assignedPEN'
                        v-model="batchFileSearchParams.prbStudent.assignedPEN"
                        tabindex="10"
                        color="#003366"
                        label="PEN"
                        maxlength="9"
                        @keyup.enter="enterPushed()"
                        v-on:input="searchHasValues"
                        :rules="validateField(batchFileSearchParams.prbStudent.assignedPEN, isValidPEN, penHint)"
                        dense
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-col>

              <PrimaryButton id="refine-action" class="mr-2 mb-3" secondary text="Clear" v-if="refinedSearch" @click.native="clearSearchParams"></PrimaryButton>
              <PrimaryButton id="refine-action" class="mr-2 mb-3" secondary text="Refine" v-else @click.native="setRefinedSearch(true)"></PrimaryButton>
              <PrimaryButton id="search-action" :disabled="!isValidSearchForm || !searchEnabled"
                             :loading="searchLoading && searchEnabled" class="mr-0 mb-3" text="Search"
                             @click.native="searchBatchFiles"></PrimaryButton>
            </v-sheet>
          </v-col>

          <v-col cols="3" xl="4" class="pa-0 d-flex justify-end align-end">
            <v-menu offset-y>
              <template v-slot:activator="{ on }">
                <PrimaryButton id="view-action" :disabled="!filesSelected" :on="on" text="View" icon="mdi-chevron-down" largeIcon></PrimaryButton>
              </template>
              <v-list>
                <v-list-item id="view-list-action" @click.native="clickViewList" link>
                  <v-list-item-title>View List</v-list-item-title>
                </v-list-item>
                <v-list-item id="view-details-action" @click.native="clickViewDetails" link>
                  <v-list-item-title>View Details</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
            <PrimaryButton id="view-list-action" class="ml-2" :disabled="!filesSelected" text="Unarchive"
                           :loading="unarchiving" @click.native="unarchive"></PrimaryButton>
          </v-col>

        </v-row>
      </v-form>
        <v-row no-gutters class="py-2" style="background-color:white;">
          <ArchivedRequestBatchList
            :searchParams="searchParams"
            :reloading="!unarchiving"
            @table-load="searchLoading=false"
          ></ArchivedRequestBatchList>
        </v-row>
    </v-container>
</template>

<script>
import {Routes, SEARCH_FILTER_OPERATION, SEARCH_VALUE_TYPE} from '@/utils/constants';
import {mapMutations, mapState} from 'vuex';
import ArchivedRequestBatchList from './ArchivedRequestBatchList';
import PrimaryButton from '../../util/PrimaryButton';
import router from '@/router';
import alertMixin from '@/mixins/alertMixin';
import {
  isNotEmptyInputParams,
  isPresentDateAndAfter1900,
  isValidAlphanumericValue,
  isValidDob,
  isValidEndDate,
  isValidMincode,
  isValidPEN
} from '@/utils/validation';
import {deepCloneObject, setEmptyInputParams} from '@/utils/common';
import pluralize from 'pluralize';
import ApiService from '@/common/apiService';
import {formatDob} from '@/utils/format';
import FormattedTextField from '@/components/util/FormattedTextField';

export default {
  name: 'ArchivedRequestBatchDisplay',
  components: {
    PrimaryButton,
    ArchivedRequestBatchList,
    FormattedTextField
  },
  mixins: [alertMixin],
  props: {
    mincode: {
      type: String,
    },
    loadDate: {
      type: String,
    }
  },
  data() {
    return {
      searchLoading: false,
      unarchiving: false,
      searchParams: { prbStudent: { } },
      batchFileSearchParams: null,
      searchEnabled: false,
      penHint: 'Fails check-digit test',
      postalCodeHint: 'Invalid Postal Code',
      minCodeHint: 'Digits only',
      genderHint: 'Invalid gender',
      gradeHint: 'Invalid grade',
      dobHint: 'Invalid Birth Date',
      dateHint: 'Invalid date',
      alphanumericHint: 'Alphanumeric only',
      endDateHint: 'Date to Must be after Date From',
      isValidSearchForm: false,
    };
  },
  computed: {
    ...mapState('archivedRequestBatch', ['selectedFiles', 'currentBatchFileSearchParams', 'refinedSearch', 'penRequestBatchResponse']),
    ...mapState('student', ['genders']),
    filesSelected() {
      return this.selectedFiles?.length > 0;
    },
    selectedFileBatchIDs() {
      return this.selectedFiles.map(file => file.penRequestBatchID).join(',');
    },
    genderCodes() {
      return this.genders ? this.genders.map(a => a.genderCode):[];
    },
  },
  created() {
    this.$store.dispatch('penRequestBatch/getCodes');
    this.batchFileSearchParams = deepCloneObject(this.currentBatchFileSearchParams);
  },
  mounted() {
    this.batchFileSearchParams.mincode = this.batchFileSearchParams.mincode || this.mincode;
    this.batchFileSearchParams.load.startDate = this.batchFileSearchParams.load.startDate || this.loadDate;
    if (this.batchFileSearchParams.mincode || this.batchFileSearchParams.load.startDate) {
      this.enterPushed();
    }
  },
  methods: {
    ...mapMutations('prbStudentSearch', ['clearPrbStudentSearchState']),
    ...mapMutations('archivedRequestBatch', ['setRefinedSearch', 'setSelectedFiles']),
    clickViewList() {
      const batchIDs = this.selectedFileBatchIDs;
      this.clearPrbStudentSearchState();
      router.push({name: 'archivedPrbStudentList', query: { batchIDs, statusFilters: '' }});
    },
    clickViewDetails() {
      const countColumn = 'studentCount';
      const totalNumber = this.selectedFiles.reduce((sum, file) => sum + file[countColumn], 0);

      const searchCriteriaList = [
        {
          searchCriteriaList: [
            {
              key: 'penRequestBatchEntity.penRequestBatchID',
              operation: SEARCH_FILTER_OPERATION.IN,
              value: this.selectedFileBatchIDs,
              valueType: SEARCH_VALUE_TYPE.UUID
            },
          ],
        },
      ];

      const query = {
        seqNumber: 1,
        totalNumber,
        batchCount: this.selectedFiles.length,
        searchCriteria: JSON.stringify(searchCriteriaList),
        archived: true,
      };
      router.push({name: 'prbStudentDetails', query});
    },
    searchHasValues(){
      this.searchEnabled = isNotEmptyInputParams(this.batchFileSearchParams);
      return this.searchEnabled;
    },
    enterPushed() {
      if(this.searchHasValues()){
        this.searchBatchFiles();
      }
    },
    searchBatchFiles() {
      this.searchLoading = true;
      this.searchParams = deepCloneObject(this.batchFileSearchParams);
    },
    clearSearchParams() {
      setEmptyInputParams(this.batchFileSearchParams, 'mincode');
      this.searchBatchFiles();
    },
    upperCaseInput(params, fieldName) {
      params[fieldName] = params[fieldName] && params[fieldName].toUpperCase();
    },
    isValidMincode,
    isPresentDateAndAfter1900,
    isValidDob,
    isValidPEN,
    isValidEndDate,
    formatDob,
    isValidGender(code) {
      return !!(code && this.genderCodes.includes(code.toUpperCase()));
    },
    validateField(value, validator = isValidAlphanumericValue, hint = this.alphanumericHint, length = 0) {
      if (!value || validator(value)) {
        return [];
      }
      this.searchEnabled = false;
      if (value.length < length) {
        return [];
      } else {
        return [
          hint
        ];
      }
    },
    validateStartDate() {
      if (!this.batchFileSearchParams?.load?.startDate || isPresentDateAndAfter1900(this.batchFileSearchParams?.load?.startDate) || isPresentDateAndAfter1900(this.batchFileSearchParams?.load?.startDate, 'uuuuMMdd')) {
        return true;
      } else {
        return this.dateHint;
      }
    },
    validateEndDate() {
      if (!this.batchFileSearchParams?.load?.endDate) {
        return true;
      } else if (this.batchFileSearchParams?.load?.endDate.length < 8 || isNaN(this.batchFileSearchParams?.load?.endDate)) {
        return this.dateHint;
      } else if (!isPresentDateAndAfter1900(this.batchFileSearchParams?.load?.endDate, 'uuuuMMdd')) {
        return this.dateHint;
      } else if (!isValidEndDate(this.batchFileSearchParams.load)) {
        return this.endDateHint;
      } else {
        return true;
      }
    },
    async unarchive() {
      const fileNumber = this.selectedFiles.length;

      const payload = {
        penRequestBatchIDs: this.selectedFiles.map(file => file.penRequestBatchID)
      };
      this.unarchiving = true;
      ApiService.apiAxios.post(`${Routes['penRequestBatch'].FILES_URL}/unarchiveFiles`, payload)
        .then(response => {
          const archivedNumber = response.data.length;
          const archivedMessage = `${archivedNumber} ${pluralize('file', archivedNumber)} ${pluralize('has', archivedNumber)} been unarchived.`;
          if(archivedNumber === fileNumber) {
            this.setSuccessAlert(`Success! ${archivedMessage}`);
          } else {
            this.setFailureAlert(`An error occurred while unarchiving PEN Request Files! ${archivedMessage} Please try again later.`);
          }
          this.penRequestBatchResponse.content = this.penRequestBatchResponse.content.filter(file =>
            response.data.some(archivedFile => archivedFile.penRequestBatchID === file.penRequestBatchID)
          );
          this.setSelectedFiles();
        })
        .catch(error => {
          this.setFailureAlert('An error occurred while unarchiving PEN Request Files! Please try again later.');
          console.log(error);
        })
        .finally(() => {
          this.unarchiving = false;
        });
    }
  }
};
</script>

<style scoped>
  .v-btn {
    text-transform: none !important;
  }

</style>
