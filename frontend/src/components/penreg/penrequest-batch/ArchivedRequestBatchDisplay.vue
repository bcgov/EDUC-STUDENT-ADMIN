<template>
  <v-container
    fluid
    class="fill-height px-0 mb-4"
  >
    <v-form v-model="isValidSearchForm">
      <v-row
        no-gutters
        class="list-actions pt-4 pb-4 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3"
        style="background-color:white;"
      >
        <v-col
          cols="9"
          xl="8"
          class="pa-0"
        >
          <v-sheet
            class="mx-0 px-2 py-1 d-flex align-end align-self-start"
            color="rgba(0, 0, 0, 0.06)"
            outlined
            rounded
          >
            <v-col class="pa-0">
              <v-row
                no-gutters
                class="pa-0"
              >
                <v-col
                  cols="2"
                  class="py-0 px-1 px-sm-1 px-md-2 px-lg-2 px-xl-3"
                >
                  <v-text-field
                    id="submissionNumber"
                    v-model="searchInputParams.submissionNumber"
                    tabindex="1"
                    color="#003366"
                    label="Submission #"
                    maxlength="8"
                    dense
                    autofocus
                    @keyup.enter="enterPushed()"
                    @input="searchHasValues"
                  />
                </v-col>
                <v-col
                  cols="2"
                  class="py-0 px-1 px-sm-1 px-md-2 px-lg-2 px-xl-3"
                >
                  <v-text-field
                    id="minCode"
                    v-model="searchInputParams.mincode"
                    tabindex="2"
                    color="#003366"
                    label="Mincode"
                    maxlength="8"
                    :rules="validateField(searchInputParams.minCode, isValidMincode, minCodeHint)"
                    dense
                    autofocus
                    @keyup.enter="enterPushed()"
                    @input="searchHasValues"
                  />
                </v-col>
                <v-col
                  cols="3"
                  class="py-0 px-1 px-sm-1 px-md-2 px-lg-2 px-xl-3"
                >
                  <v-text-field
                    id="schoolName"
                    v-model="searchInputParams.schoolName"
                    tabindex="3"
                    color="#003366"
                    label="School Name"
                    dense
                    @keyup.enter="enterPushed()"
                    @input="searchHasValues"
                  />
                </v-col>
                <v-col
                  cols="2"
                  class="py-0 px-1 px-sm-1 px-md-2 px-lg-2 px-xl-3"
                >
                  <FormattedTextField
                    :id="'loadDateFrom'"
                    v-model="searchInputParams.load.startDate"
                    :clearable="false"
                    :filled="false"
                    :format="formatDob"
                    :label="'Date From'"
                    :outlined="false"
                    :rules="[validateStartDate,validateEndDate]"
                    :tabindex="'4'"
                    maxlength="8"
                    @input="searchHasValues"
                    @keyup.enter="enterPushed()"
                  />
                </v-col>
                <v-col
                  cols="2"
                  class="py-0 px-1 px-sm-1 px-md-2 px-lg-2 px-xl-3"
                >
                  <FormattedTextField
                    :id="'loadDateTo'"
                    v-model="searchInputParams.load.endDate"
                    :clearable="false"
                    :filled="false"
                    :format="formatDob"
                    :label="'Date To'"
                    :outlined="false"
                    :rules="[validateEndDate]"
                    :tabindex="'5'"
                    maxlength="8"
                    @input="searchHasValues"
                    @keyup.enter="enterPushed()"
                  />
                </v-col>
              </v-row>
              <v-row
                no-gutters
                class="pa-0"
              >
                <v-col
                  cols="2"
                  class="py-0 px-1 px-sm-1 px-md-2 px-lg-2 px-xl-3"
                >
                  <v-text-field
                    id="legalLastName"
                    v-model="searchInputParams.prbStudent.legalLastName"
                    tabindex="6"
                    color="#003366"
                    label="Legal Surname"
                    maxlength="255"
                    dense
                    @keyup.enter="enterPushed()"
                    @input="[searchHasValues(), upperCaseInput(searchInputParams.prbStudent, 'legalLastName')]"
                  />
                </v-col>
                <v-col
                  cols="2"
                  class="py-0 px-1 px-sm-1 px-md-2 px-lg-2 px-xl-3"
                >
                  <v-text-field
                    id="legalFirstName"
                    v-model="searchInputParams.prbStudent.legalFirstName"
                    tabindex="7"
                    color="#003366"
                    label="Legal Given"
                    maxlength="255"
                    dense
                    @keyup.enter="enterPushed()"
                    @input="[searchHasValues(), upperCaseInput(searchInputParams.prbStudent, 'legalFirstName')]"
                  />
                </v-col>
                <v-col
                  cols="2"
                  class="py-0 px-1 px-sm-1 px-md-2 px-lg-2 px-xl-3"
                >
                  <v-text-field
                    id="legalMiddleNames"
                    v-model="searchInputParams.prbStudent.legalMiddleNames"
                    tabindex="8"
                    color="#003366"
                    label="Legal Middle"
                    maxlength="255"
                    dense
                    @keyup.enter="enterPushed()"
                    @input="[searchHasValues(), upperCaseInput(searchInputParams.prbStudent, 'legalMiddleNames')]"
                  />
                </v-col>
                <v-col
                  cols="1"
                  class="py-0 px-1 px-sm-1 px-md-2 px-lg-2 px-xl-3"
                >
                  <v-text-field
                    id="genderCode"
                    v-model="searchInputParams.prbStudent.genderCode"
                    tabindex="9"
                    color="#003366"
                    label="Gender"
                    maxlength="1"
                    :rules="validateField(searchInputParams.prbStudent.genderCode, isValidGender, genderHint)"
                    dense
                    @keyup.enter="enterPushed()"
                    @input="[searchHasValues(), upperCaseInput(searchInputParams.prbStudent, 'genderCode')]"
                  />
                </v-col>
                <v-col
                  cols="2"
                  class="py-0 px-1 px-sm-1 px-md-2 px-lg-2 px-xl-3"
                >
                  <FormattedTextField
                    :id="'dob'"
                    v-model="searchInputParams.prbStudent.dob"
                    :clearable="false"
                    :filled="false"
                    :format="formatDob"
                    :label="'Birth Date'"
                    :outlined="false"
                    :rules="[validateDOB]"
                    :tabindex="'10'"
                    maxlength="8"
                    @input="searchHasValues"
                    @keyup.enter="enterPushed()"
                  />
                </v-col>
                <v-col
                  cols="2"
                  class="py-0 px-1 px-sm-1 px-md-2 px-lg-2 px-xl-3"
                >
                  <v-text-field
                    id="assignedPEN"
                    v-model="searchInputParams.prbStudent.assignedPEN"
                    tabindex="11"
                    color="#003366"
                    label="PEN"
                    maxlength="9"
                    :rules="validateField(searchInputParams.prbStudent.assignedPEN, isValidPEN, penHint)"
                    dense
                    @keyup.enter="enterPushed()"
                    @input="searchHasValues"
                  />
                </v-col>
              </v-row>
            </v-col>

            <PrimaryButton
              id="refine-action"
              class="mr-2 mb-3"
              secondary
              text="Clear"
              @click-action="clearSearchParams"
            />
            <PrimaryButton
              id="search-action"
              :disabled="!isValidSearchForm || !searchEnabled"
              :loading="searchLoading && searchEnabled"
              class="mr-0 mb-3"
              text="Search"
              @click-action="search"
            />
          </v-sheet>
        </v-col>

        <v-col
          cols="3"
          xl="4"
          class="pa-0 d-flex justify-end align-end"
        >
          <v-menu offset-y>
            <template #activator="{ on }">
              <PrimaryButton
                id="view-action"
                :loading="loadingRequestIDs"
                :disabled="!filesSelected"
                :on="on"
                text="View"
                icon="mdi-chevron-down"
                large-icon
              />
            </template>
            <v-list>
              <v-list-item
                id="view-list-action"
                @click-action="clickViewList"
                link
              >
                <v-list-item-title>View List</v-list-item-title>
              </v-list-item>
              <v-list-item
                id="view-details-action"
                @click-action="clickViewDetails"
                link
              >
                <v-list-item-title>View Details</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
          <PrimaryButton
            id="view-list-action"
            class="ml-2"
            :disabled="!filesSelected"
            text="Unarchive"
            :loading="unarchiving"
            @click-action="unarchive"
          />
        </v-col>
      </v-row>
    </v-form>
    <v-row
      no-gutters
      class="py-2"
      style="background-color:white;"
    >
      <ArchivedRequestBatchList
        :search-params="searchParams"
        :reloading="!unarchiving"
        @table-load="searchLoading=false"
      />
    </v-row>
  </v-container>
</template>

<script>
import {Routes,PEN_REQ_BATCH_STUDENT_REQUEST_CODES} from '@/utils/constants';
import {mapActions, mapState} from 'pinia';
import ArchivedRequestBatchList from './ArchivedRequestBatchList.vue';
import PrimaryButton from '../../util/PrimaryButton.vue';
import router from '@/router';
import alertMixin from '@/mixins/alertMixin';
import {
  isPresentDateAndAfter1900,
  isValidDob,
  isValidEndDate,
  isValidPEN
} from '@/utils/validation';
import {deepCloneObject} from '@/utils/common';
import pluralize from 'pluralize';
import ApiService from '@/common/apiService';
import {formatDob} from '@/utils/format';
import FormattedTextField from '@/components/util/FormattedTextField.vue';
import Mousetrap from 'mousetrap';
import searchMixin from '@/mixins/searchMixin';
import {archivedRequestBatchStore} from '@/store/modules/archivedRequestBatch';
import {studentStore} from '@/store/modules/student';
import {navigationStore} from '@/store/modules/setNavigation';
import {penRequestBatchStudentSearchStore} from '@/store/modules/prbStudentSearch';
import {penRequestBatchStore} from '@/store/modules/penRequestBatch';

export default {
  name: 'ArchivedRequestBatchDisplay',
  components: {
    PrimaryButton,
    ArchivedRequestBatchList,
    FormattedTextField
  },
  mixins: [alertMixin, searchMixin],
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
      unarchiving: false,
      searchParams: { prbStudent: { } },
      penHint: 'Fails check-digit test',
      postalCodeHint: 'Invalid Postal Code',
      genderHint: 'Invalid gender',
      gradeHint: 'Invalid grade',
      dobHint: 'Invalid Birth Date',
      dateHint: 'Invalid date',
      endDateHint: 'Date to Must be after Date From',
      loadingRequestIDs: false
    };
  },
  computed: {
    ...mapState(archivedRequestBatchStore, ['selectedFiles', 'currentBatchFileSearchParams', 'refinedSearch', 'penRequestBatchResponse']),
    ...mapState(studentStore, ['genders']),
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
    penRequestBatchStore().getCodes();
    this.searchInputParams = deepCloneObject(this.currentBatchFileSearchParams);
    this.searchHasValues();
  },
  mounted() {
    this.searchInputParams.mincode = this.searchInputParams.mincode || this.mincode;
    this.searchInputParams.load.startDate = this.searchInputParams.load.startDate || this.loadDate;
    if (this.searchInputParams.mincode || this.searchInputParams.load.startDate) {
      this.enterPushed();
    }
    Mousetrap.reset();
  },
  methods: {
    ...mapActions(penRequestBatchStudentSearchStore, ['clearPrbStudentSearchState']),
    ...mapActions(archivedRequestBatchStore, ['setRefinedSearch', 'setSelectedFiles']),
    ...mapActions(navigationStore, ['setSelectedIDs', 'setCurrentRequest', 'setArchived']),
    clickViewList() {
      const batchIDs = this.selectedFileBatchIDs;
      this.clearPrbStudentSearchState();
      router.push({name: 'archivedPrbStudentList', query: { batchIDs, statusFilters: '' }});
    },
    clickViewDetails() {
      this.loadingRequestIDs = true;
      const query = {
        params: {
          penRequestBatchIDs: this.selectedFileBatchIDs,
          penRequestBatchStudentStatusCodes: Object.values(PEN_REQ_BATCH_STUDENT_REQUEST_CODES).toString()
        }
      };

      ApiService.apiAxios.get(`${Routes['penRequestBatch'].FILES_URL}/penRequestBatchStudentIDs`, query)
        .then(response => {
          this.setSelectedIDs(response.data);
          this.setArchived(true);
          router.push({name: 'prbStudentDetails', params: {prbStudentID: response.data[0].penRequestBatchStudentID}, query: {archived: true}});
        })
        .finally(() => {
          this.loadingRequestIDs = false;
        })
        .catch(error => {
          this.setFailureAlert('An error occurred while fetching PEN Request Files! Please try again later.');
          console.log(error);
        });
    },
    upperCaseInput(params, fieldName) {
      params[fieldName] = params[fieldName] && params[fieldName].toUpperCase();
    },
    isPresentDateAndAfter1900,
    isValidDob,
    isValidPEN,
    isValidEndDate,
    formatDob,
    isValidGender(code) {
      return !!(code && this.genderCodes.includes(code.toUpperCase()));
    },
    validateStartDate() {
      if (!this.searchInputParams?.load?.startDate || isPresentDateAndAfter1900(this.searchInputParams?.load?.startDate) || isPresentDateAndAfter1900(this.searchInputParams?.load?.startDate, 'uuuuMMdd')) {
        return true;
      } else {
        return this.dateHint;
      }
    },
    validateDOB() {
      if (!this.searchInputParams.prbStudent.dob || isPresentDateAndAfter1900(this.searchInputParams.prbStudent.dob, 'uuuuMMdd')) {
        return true;
      } else {
        return this.dobHint;
      }
    },
    validateEndDate() {
      if (!this.searchInputParams?.load?.endDate) {
        return true;
      } else if (this.searchInputParams?.load?.endDate.length < 8 || isNaN(this.searchInputParams?.load?.endDate)) {
        return this.dateHint;
      } else if (!isPresentDateAndAfter1900(this.searchInputParams?.load?.endDate, 'uuuuMMdd')) {
        return this.dateHint;
      } else if (!isValidEndDate(this.searchInputParams.load)) {
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

