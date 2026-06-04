<template>
  <v-row v-if="isLoading">
    <v-col>
      <Spinner />
    </v-col>
  </v-row>
  <v-container
      v-else
      id="duplicatesPosting"
      fluid
  >
    <v-row
        v-if="collectionObject?.collectionTypeCode !== 'JULY'"
        class="mb-5 mt-3 pb-3 pt-3 border"
    >
      <v-col>
        <h4>Province Duplicates Posting</h4>
        <br>
        <p v-if="collectionObject?.collectionStatusCode !== 'PROVDUPES'">
          The Province Duplicates can be posted once all school districts and independent schools have submitted their 1701 data and there are no outstanding PEN fixes.
        </p>
        <br>
        <v-row>
          <v-btn
              id="postProvincialDuplicatesButton"
              color="primary"
              text="Post Province Duplicates"
              class="ma-2"
              :disabled="isPostProvincialDuplicatesButtonDisabled || !hasEditPermission"
              @click="postProvincialDuplicates"
          />
          <v-btn
              id="resolveRemainingDuplicatesButton"
              color="primary"
              text="Resolve Remaining Duplicates"
              class="ma-2"
              :disabled="isResolveRemainingDuplicatesButtonDisabled || !hasEditPermission"
              @click="resolveRemainingDuplicates"
          />
        </v-row>
        <v-row>
          <v-col
              v-if="collectionObject?.collectionStatusCode === 'PROVDUPES' || collectionObject?.collectionStatusCode === 'DUPES_RES'"
          >
            <router-link
                id="downloadReport"
                :to="{ path: postedDupesReport + collectionID}"
                target="_blank"
            >
              <v-icon>mdi-tray-arrow-down</v-icon>
              Download Posted Duplicates CSV
            </router-link>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <v-form
        ref="closeForm"
        v-model="validForm"
    >
      <h4>Collection Closure</h4>
      <v-row>
        <v-col class="mb-3 d-flex">
          <span>The next collection will open when the current collection is closed. Please confirm the information for the next collection.</span>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="6">
          <h3 class="subHeading">
            {{ newCollection.collectionType }} {{ newCollection.collectionYear }} Collection
          </h3>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="6">
          <DatePicker
              id="snapshotDateField"
              v-model="newCollection.snapshotDate"
              :model-value="newCollection.snapshotDate"
              :disabled-week-days="[0, 6]"
              label="Snapshot Date"
              :rules="[rules.required()]"
              model-type="yyyy-MM-dd"
              @update:model-value="calculateSubmissionDate"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="6">
          <DatePicker
              id="submissionDueDateField"
              v-model="newCollection.submissionDueDate"
              :model-value="newCollection.submissionDueDate"
              :disabled-week-days="[0, 6]"
              :min-date="newCollection.snapshotDate"
              label="Submission Due Date"
              :rules="[rules.required()]"
              model-type="yyyy-MM-dd"
              @update:model-value="calculateAdminDates"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="6">
          <DatePicker
              id="duplicateResolutionDateField"
              v-model="newCollection.duplicationResolutionDueDate"
              :model-value="newCollection.duplicationResolutionDueDate"
              :disabled-week-days="[0, 6]"
              :min-date="newCollection.submissionDueDate"
              label="Duplicate Resolution Due Date"
              :rules="[rules.required()]"
              model-type="yyyy-MM-dd"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="6">
          <DatePicker
              id="signoffDueDateField"
              v-model="newCollection.signoffDueDate"
              :model-value="newCollection.signoffDueDate"
              :disabled-week-days="[0, 6]"
              :min-date="newCollection.duplicationResolutionDueDate"
              label="Sign-Off Due Date"
              :rules="[rules.required()]"
              model-type="yyyy-MM-dd"
          />
        </v-col>
      </v-row>

      <v-row class="justify-end pr-3">
        <v-btn
            id="closeCollection"
            color="primary"
            text="Post and Close Collection"
            class="ma-2"
            :disabled="!validForm || isCloseCollectionButtonDisabled || !hasEditPermission"
            @click="closeCollection"
        />
      </v-row>
    </v-form>
  </v-container>
  <ConfirmationDialog ref="confirmPostProvincialDuplicates">
    <template #message>
      <p>Are you sure that you would like to post province duplicates for the collection? This action cannot be undone.</p>
    </template>
  </ConfirmationDialog>
  <ConfirmationDialog ref="confirmResolveRemainingDuplicates">
    <template #message>
      <p>Are you sure that you would like to resolve the remaining duplicates for the collection? This action cannot be undone.</p>
    </template>
  </ConfirmationDialog>
  <ConfirmationDialog ref="confirmCloseCollection">
    <template #message>
      <p>Are you sure that you would like to close the current collection and open {{ newCollection.collectionType }} {{ newCollection.collectionYear }} collection? This action cannot be undone.</p>
    </template>
  </ConfirmationDialog>
  <ConfirmationDialog ref="confirmCloseCollectionWithIncompleteSchools">
    <template #message>
      <div class="july-close-warning">
        <v-alert
            type="warning"
            variant="tonal"
            class="mb-4"
        >
          <div class="july-close-warning__alert-title">
            {{ formatIncompleteSchoolsCount() }} still in progress
          </div>
          <div>
            Posting and closing the July collection may remove 1701 submissions for schools that have not completed all steps.
          </div>
        </v-alert>

        <div class="july-close-warning__list-header">
          <span>Schools requiring attention</span>
          <v-chip
              color="#38598A"
              text-color="white"
              size="small"
          >
            {{ incompleteJulySchoolCollections.length }}
          </v-chip>
        </div>

        <div
            id="incompleteJulySchoolCollectionList"
            class="july-close-warning__list"
        >
          <div
              v-for="school in incompleteJulySchoolCollections"
              :key="school.key"
              class="july-close-warning__row"
          >
            <div class="july-close-warning__school-name">
              {{ school.schoolName }}
            </div>
            <v-chip
                :color="getSchoolCollectionStatusChipColor(school.statusCode)"
                :text-color="getSchoolCollectionStatusChipTextColor(school.statusCode)"
                size="small"
            >
              {{ school.statusLabel }}
            </v-chip>
          </div>
        </div>

        <p class="july-close-warning__footer">
          Do you want to continue posting and closing the collection?
        </p>
      </div>
    </template>
  </ConfirmationDialog>
</template>

<script>
import {sdcCollectionStore} from '@/store/modules/sdcCollection';
import {mapState} from 'pinia';
import ApiService from '@/common/apiService';
import {Routes} from '@/utils/constants';
import ConfirmationDialog from '../util/ConfirmationDialog.vue';
import Spinner from '../common/Spinner.vue';
import {PEN_MATCHING} from '@/utils/sdc/collectionTableConfiguration';
import {isEmpty, omitBy} from 'lodash';
import {formatCollectionTypeCode} from '@/utils/format';
import {findUpcomingDateForCollectionClosure} from '@/utils/dateHelpers.js';
import DatePicker from '@/components/util/DatePicker.vue';
import {DateTimeFormatter, DayOfWeek, LocalDate, TemporalAdjusters} from '@js-joda/core';
import * as Rules from '@/utils/institute/formRules';
import {COLLECTION_TYPE_CODE_MAPPING} from '@/utils/sdc/collectionTypecode';
import alertMixin from '@/mixins/alertMixin';
import { PERMISSION, hasRequiredPermission } from '@/utils/constants/Permission';
import {authStore} from '@/store/modules/auth';

export default {
  name: 'DuplicatesPosting',
  components: {Spinner, ConfirmationDialog, DatePicker},
  mixins: [alertMixin],
  props: {
    collectionObject: {
      type: Object,
      required: true
    }
  },
  emits: ['refreshCollectionObject'],
  data() {
    return {
      edxURL: '',
      collectionID: this.$route.params.collectionID,
      isLoading: true,
      pageNumber: 1,
      pageSize: 1,
      totalPenFixElements: 0,
      nonAllowableDuplicates: [],
      nonAllowableProgramDuplicates: [],
      filterSearchParams: {
        assignedPen: PEN_MATCHING.defaultFilter,
        notSdcSchoolCollectionStudentStatusCode: 'ERROR,DELETED',
        moreFilters: {}
      },
      requiredRules: [v => !!v || 'Required'],
      datePattern: 'yyyy-MM-dd',
      isDisabled: true,
      validForm: false,
      rules: Rules,
      collectionTypes: [],
      closingCollectionType: null,
      newCollection: {
        collectionType: null,
        collectionYear: null,
        snapshotDate: null,
        submissionDueDate: null,
        duplicationResolutionDueDate: null,
        signoffDueDate: null
      },
      postedDupesReport: Routes.POSTED_DUPES_REPORT,
      sdcDistrictCollectionsNotSubmitted: null,
      sdcSchoolCollectionsNotSubmitted: null,
      isPostProvincialDuplicatesButtonDisabled: false,
      isCloseCollectionButtonDisabled: false,
      sdcSchoolCollectionsNotCompleted: false,
      sdcDistrictCollectionsNotCompleted: false,
      collectionClosureSagaUnderway: false,
      sdcSchoolCollections: [],
      incompleteJulySchoolCollections: [],
      schoolCollectionStatusCodesMap: new Map()
    };
  },
  computed: {
    ...mapState(sdcCollectionStore, ['collectionTypeCodesMap']),
    ...mapState(authStore, ['userInfo']),
    isResolveRemainingDuplicatesButtonDisabled() {
      return this.collectionObject?.collectionStatusCode !== 'PROVDUPES';
    },
    hasEditPermission() {
      return this.hasRequiredPermission(this.userInfo, PERMISSION.EDIT_STUDENT_DATA_COLLECTION_PERMISSION);
    }
  },
  async created() {
    await this.getSdcSchoolCollections();
    await this.getSdcDistrictCollectionMonitoring();
    await this.loadStudents();
    await this.checkForCollectionClosureSaga();
    sdcCollectionStore().getCollectionTypeCodesMap().finally(() => {
      this.getActiveCollection();
    });
    this.checkIsPostProvincialDuplicatesButtonDisabled();
    this.checkIsCloseCollectionButtonDisabled();
  },
  methods: {
    hasRequiredPermission,
    async fetchSdcSchoolCollections() {
      const response = await ApiService.apiAxios.get(`${Routes.sdc.BASE_URL}/collection/${this.collectionObject.collectionID}/sdcSchoolCollections`);
      return response?.data || [];
    },
    updateSchoolCollectionsState(sdcSchoolCollections) {
      this.sdcSchoolCollections = sdcSchoolCollections;
      this.sdcSchoolCollectionsNotSubmitted = sdcSchoolCollections.filter(schools =>
          schools.sdcSchoolCollectionStatusCode !== 'SUBMITTED' && schools.sdcSchoolCollectionStatusCode !== 'COMPLETED' && schools.sdcSchoolCollectionStatusCode !== 'P_DUP_POST'
          && schools.sdcSchoolCollectionStatusCode !== 'P_DUP_VRFD')?.length;
      this.sdcSchoolCollectionsNotCompleted = sdcSchoolCollections.filter(schools => schools.sdcSchoolCollectionStatusCode !== 'COMPLETED')?.length;
    },
    async getSdcSchoolCollections(){
      this.isLoading = true;

      await this.fetchSdcSchoolCollections()
          .then((res) => {
            this.updateSchoolCollectionsState(res);
          }).catch(error => {
            console.error(error);
            this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while trying to get indy school collections. Please try again later.');
          }).finally(() => {
            this.isLoading = false;
          });
    },
    async getSdcDistrictCollectionMonitoring() {
      this.isLoading = true;

      await ApiService.apiAxios.get(`${Routes.sdc.BASE_URL}/collection/${this.collectionObject.collectionID}/sdcDistrictCollections`)
          .then((res) => {
            this.sdcDistrictCollectionsNotSubmitted = res.data.filter(district =>
                district.sdcDistrictCollectionStatusCode !== 'SUBMITTED' && district.sdcDistrictCollectionStatusCode !== 'COMPLETED' && district.sdcDistrictCollectionStatusCode !== 'P_DUP_POST'
                && district.sdcDistrictCollectionStatusCode !== 'P_DUP_VRFD')?.length;
            this.sdcDistrictCollectionsNotCompleted = res.data.filter(district => district.sdcDistrictCollectionStatusCode !== 'COMPLETED')?.length;
          }).catch(error => {
            console.error(error);
            this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while trying to get sdc district collections. Please try again later.');
          }).finally(() => {
            this.isLoading = false;
          });
    },
    checkIsPostProvincialDuplicatesButtonDisabled() {
      this.isPostProvincialDuplicatesButtonDisabled = this.sdcDistrictCollectionsNotSubmitted > 0 || this.sdcSchoolCollectionsNotSubmitted > 0
          || this.totalPenFixElements > 0 || this.collectionObject?.collectionStatusCode === 'PROVDUPES' || this.collectionObject?.collectionStatusCode === 'DUPES_RES';
    },
    checkIsCloseCollectionButtonDisabled() {
      if(this.collectionObject?.collectionTypeCode !== 'JULY') {
        this.isCloseCollectionButtonDisabled = this.sdcDistrictCollectionsNotCompleted > 0 || this.sdcSchoolCollectionsNotCompleted > 0 || this.collectionClosureSagaUnderway;
      }
    },
    async postProvincialDuplicates() {
      const confirmation = await this.$refs.confirmPostProvincialDuplicates.open('Confirm Posting of Province Duplicates for the Collection.', null, {color: '#fff', width: 580, closeIcon: false, subtitle: false, dark: false, resolveText: 'Confirm', rejectText: 'Cancel'});
      if (!confirmation) {
        return;
      }
      ApiService.apiAxios.post(`${Routes.sdc.BASE_URL}/collection/${this.collectionID}/in-province-duplicates`)
          .then(() => {
            this.setSuccessAlert('Provincial Duplicates Posted Successfully.');
          })
          .catch(error => {
            console.error(error);
            this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while posting provincial duplicates. Please try again later.');
          });
    },
    async resolveRemainingDuplicates() {
      const confirmation = await this.$refs.confirmResolveRemainingDuplicates.open('Confirm Resolving of Remaining Duplicates for the Collection.', null, {color: '#fff', width: 580, closeIcon: false, subtitle: false, dark: false, resolveText: 'Confirm', rejectText: 'Cancel'});
      if (!confirmation) {
        return;
      }
      this.isLoading = true;
      ApiService.apiAxios.post(`${Routes.sdc.BASE_URL}/collection/${this.collectionID}/resolve-duplicates`)
          .then(() => {
            this.setSuccessAlert('Remaining Duplicates Resolved Successfully.');
          })
          .catch(error => {
            console.error(error);
            this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while resolving remaining duplicates. Please try again later.');
          }).finally(() => {
        this.$emit('refreshCollectionObject');
        this.isLoading = false;
      });
    },
    async loadStudents() {
      this.isLoading = true;
      await ApiService.apiAxios.get(`${Routes.sdc.BASE_URL}/collection/${this.collectionID}/students-paginated?tableFormat=true`, {
        params: {
          pageNumber: this.pageNumber - 1,
          pageSize: this.pageSize,
          searchParams: omitBy(this.filterSearchParams, isEmpty),
          sort: {
            penMatchResult: 'ASC'
          },
        }
      }).then(response => {
        this.totalPenFixElements = response.data.totalElements;
      }).catch(error => {
        console.error(error);
        this.setFailureAlert('An error occurred while trying to calculate total pen fix elements. Please try again later.');
      }).finally(() => {
        this.isLoading = false;
      });
    },
    async fireFormValidate() {
      await this.$nextTick();
      await this.validateForm();
    },

    async validateForm() {
      await this.$nextTick();
      const isValid = await this.$refs?.closeForm?.validate();
      if(isValid){
        this.validForm = isValid.valid;
      }
    },
    getActiveCollection() {
      this.closingCollectionType = formatCollectionTypeCode(this.collectionObject?.collectionTypeCode);
      this.newCollection.collectionType = COLLECTION_TYPE_CODE_MAPPING[this.closingCollectionType]?.next;
      this.calculateSnapshotDate();
    },
    calculateSnapshotDate(){
      let newSnapshotDate = LocalDate.parse(this.collectionTypeCodesMap.get(this.newCollection.collectionType.toUpperCase()).snapshotDate);
      this.newCollection.snapshotDate = findUpcomingDateForCollectionClosure(newSnapshotDate.month(), newSnapshotDate.dayOfMonth()).toString();
      this.newCollection.collectionYear = this.newCollection.snapshotDate.slice(0, 4);
      this.calculateSubmissionDate();
    },
    calculateSubmissionDate(){
      let newSubmissionDate= LocalDate.parse(this.newCollection.snapshotDate, DateTimeFormatter.ofPattern(this.datePattern));
      let weekLater = newSubmissionDate.plusWeeks(1);
      this.newCollection.submissionDueDate = weekLater.with(TemporalAdjusters.nextOrSame(DayOfWeek.FRIDAY)).atStartOfDay().format(DateTimeFormatter.ofPattern(this.datePattern));

      this.calculateAdminDates();
    },
    calculateAdminDates(){
      let baseDate = LocalDate.parse(this.newCollection.submissionDueDate, DateTimeFormatter.ofPattern(this.datePattern));
      let twoWeeksLater = baseDate.plusWeeks(2);
      this.newCollection.duplicationResolutionDueDate = twoWeeksLater.atStartOfDay().format(DateTimeFormatter.ofPattern(this.datePattern));

      let threeWeeksLater = baseDate.plusWeeks(3);
      this.newCollection.signoffDueDate = threeWeeksLater.atStartOfDay().format(DateTimeFormatter.ofPattern(this.datePattern));

      this.fireFormValidate();
    },
    async checkForCollectionClosureSaga(){
      this.isLoading = true;
      ApiService.apiAxios.get(`${Routes.sdc.BASE_URL}/collection/${this.collectionID}/collection-closure-status`)
          .then((response) => {
            if (response.data === true){
              this.collectionClosureSagaUnderway = true;
            }
          }).catch(error => {
        console.error(error);
        this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while checking if collection closure is already underway.');
      })
          .finally(() => {
            this.isLoading = false;
          });
    },
    async loadSchoolCollectionStatusCodes() {
      if (this.schoolCollectionStatusCodesMap.size > 0) {
        return;
      }
      const response = await ApiService.getAllSchoolCollectionStatusCodes();
      this.schoolCollectionStatusCodesMap = new Map(
          response.data.map(statusCode => [statusCode.sdcSchoolCollectionStatusCode, statusCode])
      );
    },
    getIncompleteJulySchoolCollections() {
      return this.sdcSchoolCollections
          .filter(school => school.sdcSchoolCollectionStatusCode !== 'COMPLETED')
          .map(school => ({
            key: school.sdcSchoolCollectionID || school.schoolID || school.schoolName,
            schoolName: school.schoolName || 'Unknown School',
            statusCode: school.sdcSchoolCollectionStatusCode,
            statusLabel: this.schoolCollectionStatusCodesMap.get(school.sdcSchoolCollectionStatusCode)?.label || school.sdcSchoolCollectionStatusCode
          }))
          .sort((a, b) => a.schoolName.localeCompare(b.schoolName));
    },
    formatIncompleteSchoolsCount() {
      const count = this.incompleteJulySchoolCollections.length;
      return `${count} school${count === 1 ? '' : 's'}`;
    },
    getSchoolCollectionStatusChipColor(statusCode) {
      if (statusCode === 'LOADFAIL') {
        return '#D8292F';
      }
      if (['SUBMITTED', 'REVIEWED', 'VERIFIED', 'DUP_VRFD', 'P_DUP_POST', 'P_DUP_VRFD'].includes(statusCode)) {
        return '#F4B183';
      }
      return '#38598A';
    },
    getSchoolCollectionStatusChipTextColor(statusCode) {
      return ['SUBMITTED', 'REVIEWED', 'VERIFIED', 'DUP_VRFD', 'P_DUP_POST', 'P_DUP_VRFD'].includes(statusCode) ? 'black' : 'white';
    },
    async closeCollection() {
      let confirmation;
      if (this.collectionObject?.collectionTypeCode === 'JULY') {
        try {
          const sdcSchoolCollections = await this.fetchSdcSchoolCollections();
          this.updateSchoolCollectionsState(sdcSchoolCollections);
          await this.loadSchoolCollectionStatusCodes();
          this.incompleteJulySchoolCollections = this.getIncompleteJulySchoolCollections();
        } catch (error) {
          console.error(error);
          this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while checking school completion status. Please try again later.');
          return;
        }
      }

      if (this.collectionObject?.collectionTypeCode === 'JULY' && this.incompleteJulySchoolCollections.length > 0) {
        confirmation = await this.$refs.confirmCloseCollectionWithIncompleteSchools.open('Schools Still In Progress', null, {color: '#fff', width: 700, closeIcon: false, subtitle: false, dark: false, resolveText: 'Post and Close Collection', rejectText: 'Not Post Yet'});
      } else {
        confirmation = await this.$refs.confirmCloseCollection.open('Close Collection.', null, {color: '#fff', width: 580, closeIcon: false, subtitle: false, dark: false, resolveText: 'Confirm', rejectText: 'Cancel'});
      }
      if (!confirmation) {
        return;
      }
      this.isLoading = true;
      ApiService.apiAxios.post(`${Routes.sdc.BASE_URL}/collection/${this.collectionID}/close-collection`, this.newCollection)
          .then(() => {
            this.setSuccessAlert('Your request to close the current collection is accepted.');
            this.$router.push({name: 'sdc-collection'});
          })
          .catch(error => {
            console.error(error);
            if (error?.response?.status === 409) {
              this.setFailureAlert(error?.response?.data?.message || 'Another saga is in progress for this file, please try again later.');
            } else {
              this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while closing the collection. Please try again later.');
            }
          })
          .finally(() => {
            this.isLoading = false;
          });
    }
  }
};
</script>

<style scoped>
.july-close-warning__alert-title {
  font-weight: 700;
  margin-bottom: 0.35rem;
}

.july-close-warning__list-header {
  align-items: center;
  display: flex;
  font-size: 0.95rem;
  font-weight: 700;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.july-close-warning__list {
  background: #f8fafc;
  border: 1px solid #d9e2ec;
  border-radius: 6px;
  max-height: 18rem;
  overflow-y: auto;
}

.july-close-warning__row {
  align-items: center;
  border-bottom: 1px solid #e6edf5;
  display: flex;
  gap: 1rem;
  justify-content: space-between;
  padding: 0.85rem 1rem;
}

.july-close-warning__row:last-child {
  border-bottom: none;
}

.july-close-warning__school-name {
  color: #1f2933;
  font-weight: 600;
  line-height: 1.35;
  padding-right: 1rem;
}

.july-close-warning__footer {
  margin: 1rem 0 0;
}

@media screen and (max-width: 768px) {
  .july-close-warning__row {
    align-items: flex-start;
    flex-direction: column;
  }

  .july-close-warning__school-name {
    padding-right: 0;
  }
}
</style>
