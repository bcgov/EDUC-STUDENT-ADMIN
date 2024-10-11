<template>
  <v-container fluid>
    <v-row class="mt-0">
      <v-col class="pt-0">
        <v-row>
          <v-col class="mt-1 d-flex justify-start">
            <v-icon
              small
              color="#1976d2"
            >
              mdi-arrow-left
            </v-icon>
            <a
              class="ml-1"
              @click="backButtonClick"
            >Return to PEN fixes List</a>
          </v-col>
        </v-row>

        <v-row v-if="isLoading()">
          <v-col class="d-flex justify-center">
            <Spinner
              :flat="true"
              style="margin-bottom: 80rem"
            />
          </v-col>
        </v-row>

        <div v-else>
          <StudentDetailsPanel
            key="info-panel"
            v-model:student="studentDetails"
            :hidden-search-fields="hiddenSearchFields"
            @modifySearchParams="modifySearchParams"
          >
            <template #headerPanel="{openSearchDemographicsModal}">
              <v-row
                no-gutters
                class="list-actions pt-4 pb-4 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3 d-flex align-center"
                style="background-color:white;"
              >
                <v-btn 
                  id="preRecord"
                  icon="mdi-arrow-left"
                  size="small"
                  color="rgb(0, 51, 102)"
                  :disabled="preDisabled"
                  @click="clickPrevBtn()"
                />
                <span class="mr-6 ml-6">{{ page + 1 }} of {{ selectedIDs.length }}</span>
                <v-btn 
                  id="nextRecord"
                  size="small"
                  color="rgb(0, 51, 102)"
                  icon="mdi-arrow-right"
                  :disabled="nextDisabled"
                  @click="clickNextBtn()"
                />

                <v-chip
                  :color="statusChipColors[studentDetails?.penMatchResult]"
                  :text-color="statusChipColors[studentDetails?.penMatchResult]"
                  small
                  class="result-chip"
                >
                  <strong>{{ mapPenMatchResult(studentDetails?.penMatchResult) }}</strong>
                </v-chip>

                <v-spacer />
                <PrimaryButton
                  id="modify-search-action"
                  :secondary="true"
                  class="mx-2"
                  text="Modify search"
                  :disabled="studentDetails?.penMatchResult === 'NEW' || studentDetails?.penMatchResult === 'MATCH'"
                  @click-action="[clickOpenSearch(), openSearchDemographicsModal()]"
                />
                <PrimaryButton
                  id="issue-pen-action"
                  class="mr-2"
                  :loading="isIssuingNewPen"
                  :disabled="studentDetails?.penMatchResult === 'NEW' || studentDetails?.penMatchResult === 'MATCH'"
                  text="Issue new PEN"
                  @click-action="togglePENRequestDialog"
                />
              </v-row>
              <v-row
                no-gutters
                class="py-2 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3"
                style="background-color:white"
              >
                <span style="font-size: 1.25rem">
                  <strong>{{ studentDetails?.schoolName }}</strong>
                </span>
                <v-spacer />
                <span v-if="studentDetails?.assignedPen">
                  <span class="mr-3">Assigned PEN</span>
                  <span style="color: #2E8540"><strong>{{
                    studentDetails?.assignedPen
                  }}</strong></span>
                </span>
              </v-row>
            </template>
          </StudentDetailsPanel>
          <v-row v-if="isLoadingMatches">
            <v-container
              fluid
              class="full-height"
            >
              <article
                id="match-results-container"
                class="top-banner full-height"
              >
                <v-row
                  align="center"
                  justify="center"
                >
                  <v-progress-circular
                    :size="70"
                    :width="7"
                    color="primary"
                    indeterminate
                  />
                </v-row>
              </article>
            </v-container>
          </v-row>

          <v-row
            v-if="showPossibleMatch"
            class="full-width mt-5"
          >
            <PenMatchResults
              :student="studentDetails"
              :is-comparison-required="true"
              :is-pen-link="true"
              :is-refresh-required="true"
              :is-match-un-match="true"
              :disable-match-unmatch="isMatchingToStudentRecord || studentDetails?.penMatchResult === 'NEW' || studentDetails?.penMatchResult === 'MATCH'"
              :disable-refresh="false"
              :title="title"
              :show-match-button="true"
              :show-unmatch-button="false"
              :possible-match="possibleMatches"
              @match-student="matchStudent"
              @refresh-match-results="refreshMatchResults"
            />
          </v-row>
        </div>
      </v-col>
    </v-row>
  </v-container>
  <v-dialog
    v-model="showPenRequestDialog"
    :max-width="600"
  >
    <SDCIssueNewPEN
      :sdc-student="clonedStudentDetail"
      @cancel="togglePENRequestDialog"
      @save-new-pen="saveNewPen"
    />
  </v-dialog>
</template>
<script>

import Spinner from '../common/Spinner.vue';
import ApiService from '@/common/apiService';
import { STUDENT_DETAILS_FIELDS, Routes } from '@/utils/constants';
import alertMixin from '@/mixins/alertMixin';
import StudentDetailsPanel from './StudentDetailsPanel.vue';
import {
  getPossibleMatches,
  deepCloneObject
} from '@/utils/common';
import {mapState, mapActions} from 'pinia';
import PenMatchResults from './PenMatchResults.vue';
import {sdcCollectionStore} from '@/store/modules/sdcCollection';
import PrimaryButton from '../util/PrimaryButton.vue';
import _ from 'lodash';
import SDCIssueNewPEN from './SDCIssueNewPEN.vue';
import {constructPenMatchObjectFromSdcStudent} from '../../utils/common';

export default {
  name: 'PenMatchStudentDetails',
  components: {
    Spinner,
    StudentDetailsPanel,
    PenMatchResults,
    PrimaryButton,
    SDCIssueNewPEN
  },
  mixins: [alertMixin],
  async beforeRouteUpdate(to, from) {
    if (to.params.studentID !== from.params.studentID) {
      await this.getSdcSchoolCollectionStudentDetail(to.params.studentID);
    }
  },
  props: {
    studentID: {
      type: String,
      required: true
    }
  },

  data() {
    return {
      loadingCount: 0,
      selectedSdcStudentID: null,
      studentDetails: {},
      clonedStudentDetail: {},
      isLoadingMatches: false,
      showPossibleMatch: false,
      possibleMatches: [],
      title:'',
      isIssuingNewPen: false,
      modifySearchDialog: false,
      hiddenSearchFields: [STUDENT_DETAILS_FIELDS.MINCODE],
      isMatchingToStudentRecord: false,
      activeCollection: null,
      statusChipColors: {
        'INREVIEW': '#C55A11',
        'MULTI' : '#7737BD',
        'MATCH' : '#2E8540',
        'NEW' : '#2E8540',
      },
      showPenRequestDialog: false,
    };
  },
  beforeUnmount() {
    this.setSelectedIDs([]);
  },
  computed: {
    ...mapState(sdcCollectionStore, ['selectedIDs', 'page']),
    preDisabled() {
      return this.page <= 0;
    },
    nextDisabled() {
      return this.page >= this.selectedIDs.length -1;
    }
  },
  async created() {
    await this.getActiveCollection();
    if(Object.keys(this.selectedIDs).length > 0) {
      await this.getSdcSchoolCollectionStudentDetail(this.$route.params.studentID);
    } else {
      this.$router.push({name: 'collection-view', params: {collectionID: this.activeCollection?.collectionID}});
    }
  },
  methods: {
    ...mapActions(sdcCollectionStore, ['setSelectedIDs', 'setNavigationPage']),
    togglePENRequestDialog(){
      this.showPenRequestDialog = !this.showPenRequestDialog;
    },
    backButtonClick() {
      this.$router.push({name: 'collection-view', query: {penMatch: true}, params: {collectionID: this.activeCollection?.collectionID}});
    },
    async getActiveCollection() {
      if(this.activeCollection == null) {
        const response = await ApiService.apiAxios.get(`${Routes.sdc.ACTIVE_COLLECTION}`);
        this.activeCollection = response.data;
      }
    },
    clickNextBtn() {
      let currPage = this.page;
      let index = this.page >= this.selectedIDs.length - 1 ? currPage : currPage + 1;
      this.setNavigationPage(index);
      this.$router.push({name: 'student-detail', params: {studentID: this.selectedIDs[index]}});
    },
    clickPrevBtn() {
      let currPage = this.page;
      let index = this.page <=0 ? currPage : currPage - 1;
      this.setNavigationPage(index);
      this.$router.push({name: 'student-detail', params: {studentID: this.selectedIDs[index]}});
    },
    navigate() {
      this.getSdcSchoolCollectionStudentDetail(this.selectedIDs[this.page - 1]);
    },
    isLoading() {
      return this.loadingCount > 0;
    },
    async getSdcSchoolCollectionStudentDetail(sdcSchoolCollectionStudentID) {
      this.loadingCount += 1;
      this.selectedSdcStudentID = sdcSchoolCollectionStudentID;
      ApiService.apiAxios.get(`${Routes.sdc.SDC_SCHOOL_COLLECTION_STUDENT}/${sdcSchoolCollectionStudentID}`)
        .then(response => {
          this.studentDetails = response.data;
          this.clonedStudentDetail = deepCloneObject(this.studentDetails);
        }).catch(error => {
          console.error(error);
          this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while trying to get student detail counts. Please try again later.');
        }).finally(() => {
          this.runPenMatch();
          this.loadingCount -= 1;
        });
    },
    async runPenMatch() {
      this.isLoadingMatches = true;
      this.showPossibleMatch = false;
      this.possibleMatches = [];
      try {
        const result = await getPossibleMatches(constructPenMatchObjectFromSdcStudent(this.studentDetails));
        this.isIssuePenDisabled = false;
        this.possibleMatches = result.data ?? [];
        await this.checkForDuplicates();
        this.showPossibleMatch = true;
        if(this.prbStudent?.bestMatchPEN){ // rearrange the array and if there is a best match pen then put that record on top.
          const bestMatchPen = this.prbStudent?.bestMatchPEN;
          this.possibleMatches.sort(function (a, b) {
            return (a.pen !== bestMatchPen) - (b.pen !== bestMatchPen);
          });
        }
        this.title = `${this.possibleMatches.length || 0} Matches`;
        this.isStudentDataUpdated = false; // pen match result is refreshed now enable the table.
      } catch (error) {
        console.log(error);
        this.setFailureAlert('PEN Match API call failed, please try again.');
      } finally {
        this.isLoadingMatches = false;
      }
    },
    async checkForDuplicates() {
      if(this.possibleMatches.length > 0) {
        let matchedPenIds =  this.possibleMatches.map(match => match.studentID).join(',');
        const response = await ApiService.apiAxios.get(`${Routes.sdc.BASE_URL}/collection/${this.activeCollection.collectionID}/duplicates`, {
          params: {
            matchedAssignedIDs: matchedPenIds
          }
        });
        if (response.data) {
          if(response.data.length > 0) {
            this.possibleMatches.map(m => {
              if(response.data.includes(m.studentID)) {
                m.warningCode = 'Y';
              }
            });
          }
        } else {
          this.setFailureAlert('An error occurred while checking for duplicates. Please try again later.');
        }
      }
    },
    async matchStudent(matchedStudent) {
      this.isMatchingToStudentRecord = true;
      this.clonedStudentDetail.assignedPen = matchedStudent.pen;
      this.clonedStudentDetail.assignedStudentId = matchedStudent.studentID;
      this.updatePEN('MATCH').finally(() => {
        this.isMatchingToStudentRecord = false;
        this.getSdcSchoolCollectionStudentDetail(this.$route.params.studentID);
      });
    },
    async saveNewPen(newPenDetails) {
      this.isIssuingNewPen = true;
      this.clonedStudentDetail.assignedPen = newPenDetails.assignedPen;
      this.clonedStudentDetail.assignedStudentId = newPenDetails.assignedstudentId;
      this.updatePEN('NEW').finally(() => {
        this.isIssuingNewPen = false;
        this.togglePENRequestDialog();
        this.getSdcSchoolCollectionStudentDetail(this.$route.params.studentID);
      });
    },
    async updatePEN(type) {
      return ApiService.apiAxios.post(`${Routes.sdc.SDC_SCHOOL_COLLECTION_STUDENT}/${this.clonedStudentDetail.sdcSchoolCollectionStudentID}/update-pen/${type}`, this.clonedStudentDetail)
        .then(() => {
          if(type === 'NEW') {
            this.setSuccessAlert('PEN updated successfully.');
          } else {
            this.setSuccessAlert('PEN has been MATCHED successfully.');
          }
          
          if(!this.nextDisabled) {
              this.clickNextBtn();
          }
        })
        .catch(error => {
          this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while updating PEN. Please try again later.');
          console.log(error);
        });
    },
    clickOpenSearch(){
      this.modifySearchDialog = true;
    },
    async modifySearchParams(updatedStudent) {
      if(updatedStudent) {
        if(!_.isEqual(this.studentDetails, updatedStudent)) {
          this.setFailureAlert('Modify search failed, please try again.');
          return;
        } 
        await this.runPenMatch();

      }
      this.modifySearchDialog = false;
    },
    async refreshMatchResults() {
      await this.runPenMatch();
    },
    mapPenMatchResult(penMatchResult) {
      switch(penMatchResult) {
        case 'INREVIEW':
          return 'Review Requested';
        case 'MULTI':
          return 'Multiple PEN Matches';
        case 'NEW':
          return 'New PEN Assigned';
        case 'MATCH':
          return 'PEN Matched';
        default:
          return penMatchResult;
      }
    }
  }
};
</script>

<style scoped>
#preRecord.v-btn--disabled .v-icon,
#nextRecord.v-btn--disabled .v-icon {
  background-color: rgba(255, 255, 255, 0.80) !important;
  color: white !important;
  border-radius: 50%;
}
.result-chip{
  margin-left: 16px;
}
</style>
