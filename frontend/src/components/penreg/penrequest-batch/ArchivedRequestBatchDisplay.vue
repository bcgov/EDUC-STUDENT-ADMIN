<template>
    <v-container fluid class="fill-height px-0 mb-4">
        <v-alert
          v-model="alert"
          dense
          text
          dismissible
          outlined
          transition="scale-transition"
          :class="`${alertType} flex-grow-1 mx-3`"
        >
          {{ alertMessage }}
        </v-alert>
        <v-row no-gutters class="list-actions pt-4 pb-4 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3" style="background-color:white;">
          <v-col cols="9" xl="8" class="pa-0">
            <v-sheet
              class="mx-0 px-2 py-1 d-flex align-center align-self-start"
              color="rgba(0, 0, 0, 0.06)"
              outlined
              rounded
            >
              <v-row no-gutters class="pa-0">
                <v-col cols="2" class="py-0 px-1 px-sm-1 px-md-2 px-lg-2 px-xl-3">
                  <v-text-field
                    id='minCode'
                    v-model="prbStudentSearchParams.mincode"
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
                </v-col>
                <v-col cols="3" class="py-0 px-1 px-sm-1 px-md-2 px-lg-2 px-xl-3">
                  <v-text-field
                    id='schoolName'
                    v-model="prbStudentSearchParams.schoolName"
                    tabindex="2"
                    color="#003366"
                    label="School Name"
                    @keyup.enter="enterPushed()"
                    v-on:input="searchHasValues"
                    :rules="validateField(prbStudentSearchParams.schoolName)"
                    dense
                  ></v-text-field>
                </v-col>
                <v-col cols="2" class="py-0 px-1 px-sm-1 px-md-2 px-lg-2 px-xl-3">
                  <v-text-field
                    id='loadDateFrom'
                    v-model="prbStudentSearchParams.load.startDate"
                    tabindex="3"
                    color="#003366"
                    label="Date From"
                    @keyup.enter="enterPushed()"
                    v-on:input="searchHasValues"
                    :rules="validateField(prbStudentSearchParams.load.startDate, isDateAfter1900, dateHint)"
                    dense
                  ></v-text-field>
                </v-col>
                <v-col cols="2" class="py-0 px-1 px-sm-1 px-md-2 px-lg-2 px-xl-3">
                  <v-text-field
                    id='loadDateTo'
                    v-model="prbStudentSearchParams.load.endDate"
                    tabindex="4"
                    color="#003366"
                    label="Date To"
                    @keyup.enter="enterPushed()"
                    v-on:input="searchHasValues"
                    :rules="validateField(prbStudentSearchParams.load.startDate, isDateAfter1900, dateHint)"
                    dense
                  ></v-text-field>
                </v-col>
              </v-row>

              <PrimaryButton id="refine-action" class="mr-2" secondary text="Refine"></PrimaryButton>
              <PrimaryButton id="search-action" class="mr-0" text="Search"></PrimaryButton>
            </v-sheet>
          </v-col>
          <v-col cols="3" xl="4" class="pa-0 d-flex justify-end align-end">
            <v-menu offset-y>
              <template v-slot:activator="{ on }">
                <PrimaryButton id="view-action" :disabled="!filesSelected" :on="on" text="View" icon="mdi-chevron-down" largeIcon></PrimaryButton>
              </template>
              <v-list>
                <v-list-item id="view-list-action" @click.native="clickViewList">
                  <v-list-item-title>View List</v-list-item-title>
                </v-list-item>
                <v-list-item id="view-details-action" @click.native="clickViewDetails">
                  <v-list-item-title>View Details</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
            <PrimaryButton id="view-list-action" class="ml-2" :disabled="!filesSelected" text="Unarchive"></PrimaryButton>
          </v-col>
        </v-row>
        <v-row no-gutters class="py-2" style="background-color:white;">
          <ArchivedRequestBatchList
            :searchParams="prbStudentSearchParams"
            :loadingFiles="loadingFiles"
            @failure-alert="setFailureAlert"
          ></ArchivedRequestBatchList>
        </v-row>
    </v-container>
</template>

<script>
import { SEARCH_FILTER_OPERATION, SEARCH_VALUE_TYPE } from '../../../utils/constants';
import { mapState, mapMutations } from 'vuex';
import ArchivedRequestBatchList from './ArchivedRequestBatchList';
import PrimaryButton from '../../util/PrimaryButton';
import router from '../../../router';
import alertMixin from '../../../mixins/alertMixin';
import { isValidMinCode, isValidAlphanumericValue, isDateAfter1900 } from '../../../utils/validation';

export default {
  name: 'ArchivedRequestBatchDisplay',
  components: {
    PrimaryButton,
    ArchivedRequestBatchList,
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
      loadingFiles: false,

      prbStudentSearchParams: {
        pen: null,
        legalLastName: null,
        legalFirstName: null,
        legalMiddleNames: null,
        postalCode: null,
        genderCode: null,
        dob: null,
        mincode: null,
        schoolName: null,
        load: {
          startDate: null,
          endDate: null
        },
      },
      searchEnabled: false,
      penHint: 'Fails check-digit test',
      postalCodeHint: 'Invalid Postal Code',
      minCodeHint: 'Digits only',
      genderHint: 'Invalid gender',
      gradeHint: 'Invalid grade',
      dobHint: 'Invalid Birth Date',
      dateHint: 'Invalid date',
      alphanumericHint: 'Alphanumeric only',
    };
  },
  computed: {
    ...mapState('archivedRequestBatch', ['selectedFiles']),
    filesSelected() {
      return this.selectedFiles?.length > 0;
    },
    selectedFileBatchIDs() {
      return this.selectedFiles.map(file => file.penRequestBatchID).join(',');
    },
  },
  created() {
    this.prbStudentSearchParams.mincode = this.mincode;
    this.prbStudentSearchParams.load.startDate = this.loadDate;
  },
  methods: {
    ...mapMutations('prbStudentSearch', ['clearPrbStudentSearchState']),
    clickViewList() {
      const batchIDs = this.selectedFileBatchIDs;
      this.clearPrbStudentSearchState();
      router.push({name: 'prbStudentList', query: { batchIDs, statusFilters: '' }});
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
      };
      router.push({name: 'prbStudentDetails', query});
    },
    searchHasValues(){
      this.searchEnabled = Object.values(this.prbStudentSearchParams).some(v => !!v);
      return this.searchEnabled;
    },
    enterPushed() {
      if(this.searchHasValues()){
        this.searchPenRequests();
      }
    },
    searchPenRequests() {

    },
    isValidMinCode,
    isDateAfter1900,
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
  }
};
</script>

<style scoped>
  .v-btn {
    text-transform: none !important;
  }

</style>
