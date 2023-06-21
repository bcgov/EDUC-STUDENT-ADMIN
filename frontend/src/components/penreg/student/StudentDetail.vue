<template>
    <v-form ref="studentDetailForm" id="detailStudentForm"
            v-model="validForm" class="fill-height"
    >
      <v-container fluid class="fill-height ma-0 pa-2 studentDetail">

        <v-col cols="12" class="fill-height ma-0 pa-0">
          <v-row>
            <v-tabs active-class="active-display" class="pa-0 ma-0 " v-model="tab">
              <v-tab key="Demographics" class="student-details-tabs-style"><strong>Demographics</strong></v-tab>
              <v-tab key="SLD" v-if="VIEW_SLD_HISTORY_ROLE" class="student-details-tabs-style"><strong>SLD History</strong></v-tab>
              <v-tab key="Audit" v-if="VIEW_AUDIT_HISTORY_ROLE" class="student-details-tabs-style"><strong>Audit History</strong></v-tab>
            </v-tabs>
          </v-row>
          <v-tabs-items v-if="!isLoading">
            <StudentDetailCommon
                :studentID="studentID"
                :studentDetails="studentDetails"
                :validForm="validForm"
                :parentRefs="this.$refs"
                :fullReadOnly="hasSagaInProgress || !EDIT_STUDENT_RECORDS_ROLE"
                @update:student="v => studentDetails.student = v"
                @isStudentUpdated="v=> isStudentDataUpdated = v"
                @refresh="refreshStudent"
                v-if="tab===0"
            >
              <template v-slot:buttonbar="{ isAdvancedSearch, hasAnyEdits, saveStudent, REQUEST_TYPES, disableDemerge, demerge, saveStudentLoading }">
                <v-row>
                  <v-col cols="12">
                    <v-card-actions style="float: right;">
                      <router-link
                        :to="`${isAdvancedSearch?REQUEST_TYPES.studentSearch.path.advanced:REQUEST_TYPES.studentSearch.path.basic}`">
                        <PrimaryButton :secondary="true" class="mx-1" text="Cancel"></PrimaryButton>
                      </router-link>
                      <PrimaryButton v-if="studentDetails.student.statusCode === 'M'"
                                     :disabled="disableDemerge()" text="Demerge"
                                     @click.native="demerge()"></PrimaryButton>
                      <PrimaryButton :disabled="!hasAnyEdits() || !validForm" text="Save" :loading="saveStudentLoading"
                                     @click.native="saveStudent()"></PrimaryButton>
                    </v-card-actions>
                  </v-col>
                </v-row>
              </template>
            </StudentDetailCommon>
            <StudentSLDHistory v-else-if="tab===1 && VIEW_SLD_HISTORY_ROLE" :student="studentDetails.student" @refresh="refreshStudent"  @isStudentUpdated="v=> isStudentDataUpdated = v"/>
            <StudentAuditHistory v-else-if="tab===2 && VIEW_AUDIT_HISTORY_ROLE" :student="studentDetails.student" @refresh="refreshStudent"  @isStudentUpdated="v=> isStudentDataUpdated = v"/>
          </v-tabs-items>
          <v-row v-else>
          <v-row fluid class="full-height align-center justify-center" >
            <article id="pen-display-container" class="top-banner full-height">
              <v-row align="center" justify="center">
                <v-progress-circular
                    :size="70"
                    :width="7"
                    color="primary"
                    indeterminate
                ></v-progress-circular>
              </v-row>
            </article>
          </v-row>
          </v-row>
        </v-col>
      </v-container>
    </v-form>
</template>

<script>
import StudentDetailCommon from '../../common/StudentDetailCommon.vue';
import StudentAuditHistory from './StudentAuditHistory.vue';
import PrimaryButton from '../../util/PrimaryButton.vue';
import {Routes} from '@/utils/constants';
import ApiService from '../../../common/apiService';
import alertMixin from '../../../mixins/alertMixin';
import StudentSLDHistory from '@/components/penreg/student/StudentSLDHistory.vue';
import {mapState} from 'pinia';
import staleStudentRecordMixin from '@/mixins/staleStudentRecordMixin';
import {studentStore} from '@/store/modules/student';
import {authStore} from '@/store/modules/auth';

export default {
  name: 'studentDetail',
  mixins: [alertMixin, staleStudentRecordMixin],
  props: {
    studentID: {
      type: String,
      required: true
    }
  },
  components: {
    StudentSLDHistory,
    PrimaryButton,
    StudentDetailCommon,
    StudentAuditHistory
  },
  data() {
    return {
      validForm: false,
      studentForm: null,
      tab: 0,
      isLoading: true,
      studentDetails: null,
      isStudentDataUpdated: false,
    };
  },
  computed: {
    ...mapState(studentStore, ['studentsInProcess']),
    ...mapState(authStore, ['VIEW_AUDIT_HISTORY_ROLE', 'VIEW_SLD_HISTORY_ROLE', 'EDIT_STUDENT_RECORDS_ROLE', 'VIEW_TRANSCRIPT_ROLE']),
    hasSagaInProgress() {
      return this.studentDetails && (this.studentDetails.sagaInProgress || this.studentsInProcess.has(this.studentDetails.studentID));
    },
  },
  mounted() {
    this.$store.dispatch('student/getCodes');
    this.refreshStudent();
  },
  watch: {
    studentID() {
      this.refreshStudent();
    }
  },
  methods: {
    refreshStudent() {
      this.isLoading = true;
      ApiService.apiAxios
        .get(Routes['student'].ROOT_ENDPOINT + '/detail/' + this.studentID)
        .then(response => {
          this.studentDetails = response.data;
          this.studentDetails.student.truePen = this.studentDetails.merges?.find(merge => merge.studentMergeDirectionCode === 'TO')?.mergeStudent.pen;
          this.isStudentDataUpdated = false; // make sure that once it is refreshed enable everything back.
          this.clearStaleData();
        })
        .catch(error => {
          this.setFailureAlert('An error occurred while loading the student details. Please try again later.');
          console.log(error);
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    handleUpdatedStudent(studentDetails) {
      this.studentDetails = studentDetails;
      this.studentDetails.student.truePen = this.studentDetails.merges?.find(merge => merge.studentMergeDirectionCode === 'TO')?.mergeStudent.pen;
      this.isStudentDataUpdated = false; // make sure that once it is refreshed enable everything back.
      this.clearStaleData();
    }
  }
};
</script>

<style>
.studentDetail {
  line-height: 1.2;
}

.topMenu {
  display: flex;
  align-items: center;
  justify-content: center;
}

.onhoverEdit.v-text-field > .v-input__control > .v-input__slot:before {
  border-style: none;
}

.onhoverEdit.v-text-field > .v-input__control > .v-input__slot:after {
  border-style: none;
}

.onhoverPad {
  padding-left: 12px !important;
  padding-top: 2px !important;
}

.onEditPad {
  padding-left: 12px !important;
  padding-top: 2px !important;
}

.textFieldColumn {
  display: table-cell;
  height: 1rem;
}

.darkBackgound.v-text-field > .v-input__control > .v-input__slot {
  background-color: #eeeeee;
}

.textAreaColumn {
  display: table-cell;
}

.sideCardField {
  display: table-cell;
  height: 3em;
}

.labelField {
  display: table-cell;
  height: 1em;
  padding-top: 9px !important;
}

.customNoBorder.v-text-field > .v-input__control > .v-input__slot {
  padding-top: 0px !important;
  padding-bottom: 0px !important;
}

.revert.v-text-field > .v-input__control > .v-input__slot > .v-text-field__slot > input {
  color: #1a5a96 !important;
  font-weight: bolder;
  cursor: pointer;
}

.bolder {
  color: #000000 !important;
  font-weight: bolder;
}

.top-banner {
  background-color: white;
  background-size: cover;
  align-items: center;
  display: flex;
}

.full-height {
  height: 100%;
  min-height: 400px;
}
.active-display {
  background-color: #eaf8fe;
}

.pen {
  white-space: nowrap;
}

.dob-disabled {
  visibility: hidden;
}
.student-details-tabs-style{
  text-transform: none;
}
</style>
