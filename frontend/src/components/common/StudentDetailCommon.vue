<template>
  <div>
    <v-row v-if="!isLoading">
      <v-col cols="3" class="px-6 ma-0">
        <v-card class="pa-2 ma-0" color="#D7D7D7" width="100%" elevation=0>
          <v-row no-gutters colspan="1">
            <v-col cols="1">
              <p class="labelField">PEN</p>
            </v-col>
          </v-row>
          <v-row no-gutters>
            <v-col cols="5">
              <v-text-field
                v-model="studentCopy.pen"
                readonly
                class="onhoverEdit bolder customNoBorder"
                :id='STUDENT_DETAILS_FIELDS.PEN'
                color="#000000"
                dense
              ></v-text-field>
            </v-col>
            <v-col cols="1">
              <PrimaryButton
                color="#38598A"
                text="Copy"
                :short="true"
                class="mt-1"
                v-clipboard:copy="copyTxt"
                v-clipboard:error="onError"
                :model="copyTxt"
                @click.native="copyPen"
              >
              </PrimaryButton>
            </v-col>
          </v-row>
          <StudentDetailsComboBox label="Demog Code" colspan="1" :name="STUDENT_DETAILS_FIELDS.DEMOG_CODE"
                                  @changeStudentObjectValue="changeStudentObjectValue"
                                  :model="studentCopy.demogCode?studentCopy.demogCode:''"
                                  :has-edits="hasEdits" tab-index="11" :revert-field="revertField"
                                  :items="getDemogCodeComboBox()" revert-id="revertDemogCode"
                                  :disabled="isFieldDisabled(STUDENT_DETAILS_FIELDS.DEMOG_CODE)"></StudentDetailsComboBox>

          <StudentDetailsTextFieldSideCardReadOnly :model="traxStatus" :name="STUDENT_DETAILS_FIELDS.TRAX_STATUS"
                                                   colspan="1" label="TRAX Status"
                                                   :loading="loadingTraxData"
                                                   :disabled="isFieldDisabled(STUDENT_DETAILS_FIELDS.TRAX_STATUS)"></StudentDetailsTextFieldSideCardReadOnly>

          <StudentDetailsTextFieldSideCardReadOnly :model="gradDateAndMincode" :name="STUDENT_DETAILS_FIELDS.GRAD_DATE"
                                                   colspan="1" label="Grad Date & Mincode"
                                                   multi-line
                                                   :loading="loadingTraxData"
                                                   :disabled="isFieldDisabled(STUDENT_DETAILS_FIELDS.GRAD_DATE)"></StudentDetailsTextFieldSideCardReadOnly>

          <StudentDetailsTextFieldSideCardReadOnly :model="getCreatedDateTime()"
                                                   :name="STUDENT_DETAILS_FIELDS.CREATED_DATE" colspan="1"
                                                   label="Created"
                                                   :disabled="isFieldDisabled(STUDENT_DETAILS_FIELDS.CREATED_DATE)"></StudentDetailsTextFieldSideCardReadOnly>

          <StudentDetailsTextFieldSideCardReadOnly :model="getUpdatedDateTime()"
                                                   :name="STUDENT_DETAILS_FIELDS.UPDATED_DATE" colspan="1"
                                                   label="Updated"
                                                   :disabled="isFieldDisabled(STUDENT_DETAILS_FIELDS.UPDATED_DATE)"></StudentDetailsTextFieldSideCardReadOnly>
          <div v-if="studentCopy.statusCode === STUDENT_CODES.MERGED">
            <v-row cols="1" no-gutters>
              <v-col>
                <p class="mb-0">Status</p>
              </v-col>
            </v-row>
            <v-chip color="#003366"
                    small
                    dark>
              <Strong>{{ statusCodeObjects.filter(obj => obj.statusCode === studentCopy.statusCode)[0].label }}</Strong>
            </v-chip>
          </div>
          <StudentDetailsComboBox v-else label="Status" colspan="1" name="statusCode"
                                  @changeStudentObjectValue="changeStudentObjectValue"
                                  :model="studentCopy.statusCode?studentCopy.statusCode:''"
                                  :has-edits="hasEdits" tab-index="12" :revert-field="revertField"
                                  :items="getStatusLevels()" revert-id="revertStatusCode"

                                  :disabled="isFieldDisabled('statusCode')"></StudentDetailsComboBox>
        </v-card>
      </v-col>
      <v-col cols="7" class="py-0 pl-0">
        <v-card class="pa-0" height="100%" width="100%" elevation=0>

          <StudentDetailsTextField max-length="25" :name="STUDENT_DETAILS_FIELDS.LEGAL_LAST_NAME" tab-index="1"
                                   @changeStudentObjectValue="changeStudentObjectValue"
                                   :model="studentCopy.legalLastName?studentCopy.legalLastName:''"
                                   :has-edits="hasEdits" revert-id="revertLegalLastName"
                                   :fieldValidationRequired=true :validation-rules="validateLegalLastName"
                                   :revert-field="revertField" label="Legal Surname" colspan="5"
                                   :async-messages="err.legalLastNameError"
                                   :disabled="isFieldDisabled(STUDENT_DETAILS_FIELDS.LEGAL_LAST_NAME)"></StudentDetailsTextField>

          <StudentDetailsTextField max-length="25" :name="STUDENT_DETAILS_FIELDS.LEGAL_FIRST_NAME" tab-index="2"
                                   @changeStudentObjectValue="changeStudentObjectValue"
                                   :model="studentCopy.legalFirstName?studentCopy.legalFirstName:''"
                                   :has-edits="hasEdits" revert-id="revertLegalFirstName"
                                   :revert-field="revertField" label="Legal Given" colspan="5"
                                   :async-messages="err.legalFirstNameError"
                                   :disabled="isFieldDisabled(STUDENT_DETAILS_FIELDS.LEGAL_FIRST_NAME)"></StudentDetailsTextField>

          <StudentDetailsTextField max-length="25" :name="STUDENT_DETAILS_FIELDS.LEGAL_MIDDLE_NAMES" tab-index="3"
                                   @changeStudentObjectValue="changeStudentObjectValue"
                                   :model="studentCopy.legalMiddleNames?studentCopy.legalMiddleNames:''"
                                   :has-edits="hasEdits" revert-id="revertLegalMiddleNames"
                                   :revert-field="revertField" label="Legal Middle" colspan="5"
                                   :async-messages="err.legalMiddleNamesError"
                                   :disabled="isFieldDisabled(STUDENT_DETAILS_FIELDS.LEGAL_MIDDLE_NAMES)"></StudentDetailsTextField>

          <StudentDetailsTextField max-length="25" :name="STUDENT_DETAILS_FIELDS.USUAL_LAST_NAME" tab-index="4"
                                   @changeStudentObjectValue="changeStudentObjectValue"
                                   :model="studentCopy.usualLastName?studentCopy.usualLastName:''"
                                   :has-edits="hasEdits" revert-id="revertUsualLastName"
                                   :revert-field="revertField" label="Usual Surname" colspan="5"
                                   :async-messages="err.usualLastNameError"
                                   :disabled="isFieldDisabled(STUDENT_DETAILS_FIELDS.USUAL_LAST_NAME)"></StudentDetailsTextField>

          <StudentDetailsTextField max-length="25" :name="STUDENT_DETAILS_FIELDS.USUAL_FIRST_NAME" tab-index="5"
                                   @changeStudentObjectValue="changeStudentObjectValue"
                                   :model="studentCopy.usualFirstName?studentCopy.usualFirstName:''"
                                   :has-edits="hasEdits" revert-id="revertUsualFirstName"
                                   :revert-field="revertField" label="Usual Given" colspan="5"
                                   :async-messages="err.usualFirstNameError"
                                   :disabled="isFieldDisabled(STUDENT_DETAILS_FIELDS.USUAL_FIRST_NAME)"></StudentDetailsTextField>

          <StudentDetailsTextField max-length="25" :name="STUDENT_DETAILS_FIELDS.USUAL_MIDDLE_NAMES" tab-index="6"
                                   @changeStudentObjectValue="changeStudentObjectValue"
                                   :model="studentCopy.usualMiddleNames?studentCopy.usualMiddleNames:''"
                                   :has-edits="hasEdits" revert-id="revertUsualMiddleNames"
                                   :revert-field="revertField" label="Usual Middle" colspan="5"
                                   :async-messages="err.usualMiddleNamesError"
                                   :disabled="isFieldDisabled(STUDENT_DETAILS_FIELDS.USUAL_MIDDLE_NAMES)"></StudentDetailsTextField>


          <!-- some fields cant be ported to child component, left as is-->
          <v-row no-gutters class="py-1">
            <v-col cols="2">
              <p class="labelField">Gender</p>
            </v-col>
            <v-col cols="1" :class="{textFieldColumn: !genderError}">
              <v-text-field
                tabindex="7"
                v-on:keyup.tab="[editingGender = true, hoveringGender = true]"
                v-on:mouseover="isFieldDisabled('genderCode')?hoveringGender=false:hoveringGender = true"
                v-on:mouseout="editingGender ? hoveringGender = true : hoveringGender=false"
                v-on:blur="[editingGender = false, hoveringGender = false]"
                v-on:click="[editingGender = true, hoveringGender = true]"
                v-on:input="uppercaseGender()"
                v-model="studentCopy.genderCode"
                class="onhoverEdit bolder customNoBorder"
                :class="{onhoverPad: !hoveringGender && !hasEdits('genderCode'), darkBackgound: hoveringGender || hasEdits(STUDENT_DETAILS_FIELDS.GENDER_CODE)}"
                :id='STUDENT_DETAILS_FIELDS.GENDER_CODE'
                color="#000000"
                :rules="validateGender()"
                dense
                maxlength="1"
                :readonly="!hoveringGender || !editingGender"
                :outlined="hoveringGender || editingGender || hasEdits(STUDENT_DETAILS_FIELDS.GENDER_CODE)"
                :disabled="isFieldDisabled(STUDENT_DETAILS_FIELDS.GENDER_CODE)"
              ></v-text-field>
            </v-col>
            <v-col class="textFieldColumn" cols="2">
              <v-text-field
                id='revertGender'
                v-on:click="revertField(STUDENT_DETAILS_FIELDS.GENDER_CODE)"
                class="onhoverEdit revert customNoBorder ml-3"
                readonly
                v-if="hasEdits(STUDENT_DETAILS_FIELDS.GENDER_CODE)"
                value="Revert"
                dense
                tabindex="-1"
              ></v-text-field>
            </v-col>
          </v-row>

          <v-row no-gutters class="py-1">
            <v-col cols="2">
              <div class="labelField">
                <div style="display: inline-block;">
                  Date of Birth
                </div>
                <div style="display: inline-block">
                  <img title="YYYYMMDD"
                       :class="{'ml-3': true, 'dob-disabled': isFieldDisabled(STUDENT_DETAILS_FIELDS.DOB)}"
                       src="@/assets/images/information.svg"
                       alt="YYYYMMDD"
                  >
                </div>
              </div>
            </v-col>
            <v-col cols="2" :class="{textFieldColumn: !dobError}">
              <FormattedTextField
                tabindex="8"
                @keyup.tab.native="[editingDOB = true, hoveringDOB = true]"
                @mouseover.native="isFieldDisabled('dob')? hoveringDOB = false : hoveringDOB = true"
                @mouseout.native="editingDOB ? hoveringDOB = true : hoveringDOB = false"
                @blur="[editingDOB = false, hoveringDOB = false]"
                @focus="[editingDOB = true, hoveringDOB = true]"
                @input="clearDOBRuleErrors"
                :classes="['onhoverEdit', 'bolder', 'customNoBorder', {onhoverPad: !hoveringDOB && !dobHasChanged(), darkBackgound: hoveringDOB || dobHasChanged()}]"
                v-model="shortDOB"
                :id='STUDENT_DETAILS_FIELDS.DOB'
                :filled="false"
                :clearable="false"
                :format="formatDob"
                :async-messages="err.birthDateError"
                :rules="validateDOB()"
                maxlength="8"
                :readonly="!hoveringDOB || !editingDOB"
                :outlined="hoveringDOB || editingDOB || dobHasChanged()"
                :disabled="isFieldDisabled(STUDENT_DETAILS_FIELDS.DOB)"
              ></FormattedTextField>
            </v-col>
            <v-col cols="3" class="textFieldColumn">
              <v-text-field
                class="onhoverEdit bolder customNoBorder onhoverPad"
                v-model="longDOB"
                v-if="hoveringDOB && !editingDOB"
                id='dobFull'
                color="#000000"
                dense
                readonly
                tabindex="-1"
              ></v-text-field>
            </v-col>
            <v-col class="textFieldColumn" cols="2">
              <v-text-field
                id='revertDOB'
                v-on:click="revertDOBField(STUDENT_DETAILS_FIELDS.DOB)"
                class="onhoverEdit revert customNoBorder ml-3"
                readonly
                v-show="dobHasChanged()"
                value="Revert"
                style="padding-top: 2px;"
                dense
                tabindex="-1"
              ></v-text-field>
            </v-col>
          </v-row>
          <StudentDetailsTextFieldReadOnly :model="studentCopy.gradeCode?studentCopy.gradeCode:''"
                                           :name="STUDENT_DETAILS_FIELDS.GRADE_CODE" colspan="1" label="Grade"
                                           :grade-level="gradeLabel"
                                           :disabled="isFieldDisabled(STUDENT_DETAILS_FIELDS.GRADE_CODE)">
            <v-col cols="3" class="textFieldColumn gradeLabelColumn">
              <v-text-field
                class="onhoverEdit customNoBorder onhoverPad"
                :value="gradeLabel"
                id='gradeLabel'
                color="#000000"
                dense
                readonly
                tabindex="-1"
                :disabled="true"
              ></v-text-field>
            </v-col>
          </StudentDetailsTextFieldReadOnly>

          <StudentDetailsTextFieldReadOnly :model="studentCopy.gradeYear?studentCopy.gradeYear:''"
                                           :name="STUDENT_DETAILS_FIELDS.GRADE_YEAR" colspan="1"
                                           label="Grade School Year"
                                           :disabled="isFieldDisabled(STUDENT_DETAILS_FIELDS.GRADE_YEAR)"></StudentDetailsTextFieldReadOnly>

          <StudentDetailsTextFieldReadOnly :model="studentCopy.postalCode?studentCopy.postalCode:''"
                                           :name="STUDENT_DETAILS_FIELDS.POSTAL_CODE"
                                           colspan="2" label="Postal Code"
                                           :disabled="isFieldDisabled(STUDENT_DETAILS_FIELDS.POSTAL_CODE)"></StudentDetailsTextFieldReadOnly>

          <v-row no-gutters class="py-1">
            <v-col cols="2">
              <p class="labelField">Mincode</p>
            </v-col>
            <v-col cols="2" :class="{textFieldColumn: !mincodeError}">
              <FormattedTextField
                tabindex="9"
                @keyup.tab.native="[editingMincode = true, hoveringMincode = true]"
                @mouseover.native="isFieldDisabled('mincode')? hoveringMincode = false : hoveringMincode = true"
                @mouseout.native="editingMincode ? hoveringMincode = true : hoveringMincode = false"
                @blur="[editingMincode = false, hoveringMincode = false]"
                @focus="[editingMincode = true, hoveringMincode = true]"
                :classes="['onhoverEdit', 'bolder', 'customNoBorder', {onhoverPad: !hoveringMincode && !mincodeHasChanged(), darkBackgound: hoveringMincode || mincodeHasChanged()}]"
                :async-messages="mincodeErrors"
                v-model="studentCopy.mincode"
                :id='STUDENT_DETAILS_FIELDS.MINCODE'
                :filled="false"
                :clearable="false"
                :format="formatMincode"
                :rules="validateMincode()"
                maxlength="8"
                :readonly="!hoveringMincode || !editingMincode"
                :outlined="hoveringMincode || editingMincode || mincodeHasChanged() || false"
                :disabled="isFieldDisabled(STUDENT_DETAILS_FIELDS.MINCODE)"
              ></FormattedTextField>
            </v-col>
            <v-col cols="5" class="textFieldColumn">
              <v-progress-circular
                v-if="loadingSchoolData"
                color="primary"
                indeterminate
                class="ml-3"
              ></v-progress-circular>
              <v-text-field
                v-else
                class="onhoverEdit customNoBorder onhoverPad"
                v-model="schoolLabel"
                id='schoolFill'
                color="#000000"
                dense
                readonly
                tabindex="-1"
              ></v-text-field>
            </v-col>
            <v-col class="textFieldColumn" cols="2">
              <v-text-field
                id='revertMincode'
                v-on:click="revertMincodeField()"
                class="onhoverEdit revert customNoBorder ml-3"
                readonly
                v-if="hasEdits(STUDENT_DETAILS_FIELDS.MINCODE)"
                value="Revert"
                style="padding-top: 2px;"
                dense
                tabindex="-1"
              ></v-text-field>
            </v-col>
          </v-row>
          <StudentDetailsTextFieldReadOnly :model="studentCopy.localID?studentCopy.localID:''"
                                           :name="STUDENT_DETAILS_FIELDS.LOCAL_ID"
                                           colspan="2" label="Local ID"
                                           :disabled="isFieldDisabled(STUDENT_DETAILS_FIELDS.LOCAL_ID)"></StudentDetailsTextFieldReadOnly>

          <StudentDetailsTemplateTextField v-if="possibleMatches.length > 0" colspan="2" label="Twin(s)?"
                                           :disabled="isFieldDisabled(STUDENT_DETAILS_FIELDS.TWINS)">
            <a @click="twinsDialog=true">
              Yes
            </a>
          </StudentDetailsTemplateTextField>

          <StudentDetailsTemplateTextField v-if="mergedTo" colspan="8" label="Merged To"
                                           :disabled="isFieldDisabled(STUDENT_DETAILS_FIELDS.MERGED_TO)">
            <div>
              <router-link :to="{params: {studentID: mergedTo.mergeStudentID}}" class="pr-4">
                {{ formatPen(mergedTo.mergeStudent.pen) }}
              </router-link>
              <span class="pr-4">{{ formatUpdateTime(mergedTo.updateDate) }}</span>
              <span class="pr-4">{{ mergedTo.studentMergeSourceCode }}</span>
              <span>{{ mergedTo.updateUser }}</span>
            </div>
          </StudentDetailsTemplateTextField>

          <StudentDetailsTemplateTextField v-if="mergedFrom.length > 0" colspan="8" label="Merged From"
                                           :disabled="isFieldDisabled(STUDENT_DETAILS_FIELDS.MERGED_FROM)">
            <div class="d-flex flex-wrap">
              <router-link
                v-for="merge in mergedFrom"
                :key="merge.studentMergeID"
                :to="{params: {studentID: merge.mergeStudentID}}"
                class="pr-4 pen"
              >
                {{ formatPen(merge.mergeStudent.pen) }}
              </router-link>
            </div>
          </StudentDetailsTemplateTextField>

          <v-row no-gutters dense style="min-height: 7em;">
            <v-col cols="2">
              <p class="labelField">Memo</p>
            </v-col>
            <v-col class="textAreaColumn memo-style">
              <v-textarea
                tabindex="10"
                v-on:keyup.tab="[editingMemo = true, hoveringMemo = true]"
                v-on:mouseover="isFieldDisabled('memo')?hoveringMemo = false:hoveringMemo = true"
                v-on:mouseout="editingMemo ? hoveringMemo = true : hoveringMemo = false"
                v-on:blur="[editingMemo = false, hoveringMemo = false]"
                v-on:click="[editingMemo = true, hoveringMemo = true]"
                class="onhoverEdit bolder customNoBorder"
                :class="{onhoverPad: !hoveringMemo && !hasEdits('memo'), darkBackgound: hoveringMemo || hasEdits('memo')}"
                v-model="studentCopy.memo"
                :id='STUDENT_DETAILS_FIELDS.MEMO'
                color="#000000"
                maxlength="4000"
                dense
                rows="3"
                no-resize
                :readonly="!hoveringMemo || !editingMemo"
                :outlined="hoveringMemo || editingMemo || hasEdits(STUDENT_DETAILS_FIELDS.MEMO)"
                :disabled="isFieldDisabled(STUDENT_DETAILS_FIELDS.MEMO)"
              ></v-textarea>
            </v-col>
            <v-col class="textFieldColumn" cols="2">
              <v-text-field
                id='revertMemo'
                v-on:click="revertField(STUDENT_DETAILS_FIELDS.MEMO)"
                class="onhoverEdit revert customNoBorder ml-3"
                readonly
                v-if="hasEdits(STUDENT_DETAILS_FIELDS.MEMO)"
                value="Revert"
                dense
                tabindex="-1"
              ></v-text-field>
            </v-col>
          </v-row>
          <v-divider/>
          <v-progress-linear
            indeterminate
            color="blue"
            :active="isProcessing || hasSagaInProgress(this.origStudent)"
          ></v-progress-linear>
        </v-card>
      </v-col>
      <v-col cols="1">
        <CompareDemographicModal :clearOnExit="false" :disabled="hasSagaInProgress(this.origStudent)"
                                 :selectedRecords.sync="compareStudent"></CompareDemographicModal>
      </v-col>
      <v-col cols="1">
        <TertiaryButton
          class="ma-0"
          color="#38598A"
          text="Copy"
          v-clipboard:copy="copyTxt"
          v-clipboard:error="onError"
          :model="copyTxt"
          @click.native="copyInfo"
        >
        </TertiaryButton>
      </v-col>
    </v-row>
    <slot
      v-if="!isLoading"
      name="buttonbar"
      :isAdvancedSearch="isAdvancedSearch"
      :hasAnyEdits="hasAnyEdits"
      :saveStudent="saveStudent"
      :REQUEST_TYPES="REQUEST_TYPES"
      :disableDemerge="disableDemerge"
      :isStudentUpdated="isStudentUpdated"
      :saveStudentLoading="saveStudentLoading"
      :demerge="demerge">
    </slot>
    <v-row fluid class="full-height align-center justify-center" v-if="isLoading">
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

    <v-dialog
      v-model="deceasedDialog"
      width="400px"
    >
      <v-card>
        <v-card-text class="px-5 py-5">
          Change Student Status to Deceased?
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            outlined
            tabindex="-1"
            color="#38598a"
            class="mx-2"
            @click="cancelDeceasedDialog"
          >
            Cancel
          </v-btn>

          <v-btn
            color="#003366"
            tabindex="-1"
            class="white--text"
            @click="confirmDeceasedDialog"
          >
            Confirm
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="twinsDialog"
      width="900px"
    >
      <TwinnedStudentsCard
        :student="studentCopy"
        :possibleMatches="possibleMatches"
        @close="twinsDialog=false"
      ></TwinnedStudentsCard>
    </v-dialog>
    <ConfirmationDialog ref="confirmationDialog"></ConfirmationDialog>
    <ConfirmationDialog ref="confirmedStudentUpdateConfirmationDialog">
      <template v-slot:message>
        <v-col class="mt-n6">
          <v-row class="mb-3">
            Are you sure you want to edit this&nbsp;<strong>Confirmed</strong>&nbsp;student?
          </v-row>
        </v-col>
      </template>
    </ConfirmationDialog>
    <ConfirmationDialog ref="demergeConfirmationDialog">
      <template v-slot:message>
        <v-col class="mt-n6">
          <v-row v-if="isConfirmedStudent" class="mb-3">
            Are you sure you want to de-merge this&nbsp;<strong>Confirmed</strong>&nbsp;student?
          </v-row>
          <v-row v-else class="mb-3">
            Are you sure you want to demerge PENs&nbsp;<strong>{{ getMergedFromPen() }}</strong>&nbsp;and&nbsp;<strong>{{
              getMergedToPen()
            }}</strong>?
          </v-row>
        </v-col>
      </template>
    </ConfirmationDialog>
  </div>
</template>

<script>
import {mapGetters, mapState} from 'vuex';
import moment from 'moment';
import ApiService from '../../common/apiService';
import {REQUEST_TYPES, Routes, STUDENT_CODES, STUDENT_DEMOG_CODES, STUDENT_DETAILS_FIELDS} from '@/utils/constants';
import StudentDetailsTextField from '@/components/penreg/student/StudentDetailsTextField';
import StudentDetailsTextFieldReadOnly from '@/components/penreg/student/StudentDetailsTextFieldReadOnly';
import StudentDetailsComboBox from '@/components/penreg/student/StudentDetailsComboBox';
import StudentDetailsTextFieldSideCardReadOnly
  from '@/components/penreg/student/StudentDetailsTextFieldSideCardReadOnly';
import StudentDetailsTemplateTextField from '@/components/penreg/student/StudentDetailsTemplateTextField';
import {formatDob, formatMincode, formatPen} from '@/utils/format';
import {cloneDeep, pick, sortBy} from 'lodash';
import alertMixin from '../../mixins/alertMixin';
import schoolMixin from '../../mixins/schoolMixin';
import servicesSagaMixin from '../../mixins/servicesSagaMixin';
import ConfirmationDialog from '../util/ConfirmationDialog';
import TwinnedStudentsCard from '@/components/penreg/student/TwinnedStudentsCard';
import CompareDemographicModal from './CompareDemographicModal';
import {isValidDob, isValidMincode} from '@/utils/validation';
import FormattedTextField from '@/components/util/FormattedTextField';
import TertiaryButton from '@/components/util/TertiaryButton';
import PrimaryButton from '@/components/util/PrimaryButton';
import staleStudentRecordMixin from '@/mixins/staleStudentRecordMixin';
import {deepCloneObject, getDemogValidationResults} from '@/utils/common';

const JSJoda = require('@js-joda/core');
export default {
  name: 'studentDetailCommon',
  mixins: [alertMixin, schoolMixin, servicesSagaMixin, staleStudentRecordMixin],
  props: {
    studentID: {
      type: String,
      required: true
    },
    studentDetails: {
      type: Object,
      default: () => {
        // this is intentional
      }
    },
    validForm: {
      type: Boolean,
      required: false
    },
    parentRefs: {
      type: Object,
      required: false
    },
    fullReadOnly: {
      type: Boolean,
      required: true
    }
  },
  components: {
    FormattedTextField,
    CompareDemographicModal,
    ConfirmationDialog,
    TwinnedStudentsCard,
    StudentDetailsTextFieldSideCardReadOnly,
    StudentDetailsComboBox,
    StudentDetailsTextFieldReadOnly,
    StudentDetailsTextField,
    StudentDetailsTemplateTextField,
    TertiaryButton,
    PrimaryButton
  },
  data() {
    return {
      hovering: false,
      editing: false,
      spacePostalCode: null,
      isLoading: true,
      deceasedDialog: false,
      genderHint: 'Invalid Gender Code',
      genderError: false,
      dobHint: 'Invalid Date of Birth',
      dobError: false,
      genderCodes: [],
      demogLabels: [],
      statusLabels: [],
      gradeLabels: [],
      gradeLabel: null,
      createdDateTime: null,
      updatedDateTime: null,
      shortDOB: null,
      longDOB: null,
      origStudent: {},
      studentCopy: {},
      REQUEST_TYPES: REQUEST_TYPES,
      editingDOB: false,
      hoveringDOB: false,
      editingGender: false,
      hoveringGender: false,
      editingMincode: false,
      hoveringMincode: false,
      editingMemo: false,
      hoveringMemo: false,
      enableDisableFieldsMap: new Map(),
      fieldNames: Object.values(STUDENT_DETAILS_FIELDS),
      tab: 'Demographics',
      STUDENT_DETAILS_FIELDS: STUDENT_DETAILS_FIELDS,
      STUDENT_CODES: STUDENT_CODES,
      merges: [],
      possibleMatches: [],
      twinsDialog: false,
      unsavedChanges: false,
      gradDateAndMincode: [],
      traxStatus: '',
      loadingTraxData: false,
      loadingSchoolData: false,
      compareStudent: [],
      copyTxt: '',
      isStudentUpdated: false,
      isStudentUpdatedInDifferentTab: true,
      lastMessageFromSTANForStudentUpdate: null,
      err: {
        usualMiddleNamesError: [],
        usualFirstNameError: [],
        usualLastNameError: [],
        legalMiddleNamesError: [],
        legalFirstNameError: [],
        legalLastNameError: [],
        birthDateError: [],
      },
      saveStudentLoading: false,
    };
  },
  created() {
    this.genderCodes = this.genders ? this.genders.map(a => a.genderCode) : [];
    this.demogLabels = this.demogCodeObjects ? this.demogCodeObjects.map(a => a.label) : [];
    this.statusLabels = this.statusCodeObjects ? this.statusCodeObjects.map(a => a.label) : [];
    this.gradeLabels = this.gradeCodeObjects ? this.gradeCodeObjects.map(a => a.label) : [];
  },
  computed: {
    ...mapState('penRequestBatch', ['prbValidationFieldCodes', 'prbValidationIssueTypeCodes']),
    ...mapGetters('student', ['genders', 'demogCodeObjects', 'statusCodeObjects', 'gradeCodeObjects']),
    ...mapState('studentSearch', ['isAdvancedSearch']),
    ...mapGetters('notifications', ['notification']),
    ...mapGetters('auth', ['userInfo']),
    mergedTo() {
      return this.merges.find(merge => merge.studentMergeDirectionCode === 'TO');
    },
    mergedFrom() {
      return sortBy(this.merges.filter(merge => merge.studentMergeDirectionCode === 'FROM'), ['mergeStudent.pen']);
    },
    isConfirmedStudent() {
      return this.origStudent?.demogCode === STUDENT_DEMOG_CODES.CONFIRMED;
    }
  },
  mounted() {
    this.$store.dispatch('student/getCodes');
    this.$store.dispatch('penRequestBatch/getCodes');
    this.refreshStudent();
    //reset errors
    Object.keys(this.err).forEach(key => {
      this.err[key] = [];
    });
  },
  watch: {
    studentID() {
      this.refreshStudent();
    },
    notification(val) {
      if (val) {
        const notificationData = val;
        if (this.sagaId && this.sagaId === notificationData.sagaId && notificationData.studentID && notificationData.studentID === this.origStudent.studentID && notificationData.sagaStatus === 'COMPLETED') {
          if (notificationData.sagaName === 'PEN_SERVICES_STUDENT_DEMERGE_COMPLETE_SAGA') {
            this.notifyDemergeSagaCompleteMessage();
            // Refresh mergedFromStudent in student detail
            setTimeout(() => {
              this.$emit('refresh'); // wait 1000 ms for the user to see saga complete banner.
            }, 1000);
            // Open mergedToStudent in a new tab
            setTimeout(() => {
              this.openStudentDetails(this.mergedToStudent?.studentID);
            }, 500);
          } else if (notificationData.sagaName.startsWith('PEN_SERVICES_')) {
            this.$emit('refresh');
          }
        } else if (!this.sagaId && notificationData.eventType === 'UPDATE_STUDENT' && notificationData.eventOutcome === 'STUDENT_UPDATED' && notificationData.eventPayload) {
          this.showWarningAndDisableActionIfUpdatedStudentMatched(notificationData);
        }
      }
    },
  },
  beforeRouteLeave(to, from, next) {
    if (this.hasAnyEdits()) {
      this.$refs.confirmationDialog.open('Warning!', 'Changes will be lost. Are you sure?', {
        color: '#003366',
        rejectText: 'No, go back'
      }).then((result) => {
        if (result) {
          next();
        } else {
          next(false);
        }
      });
    } else {
      next();
    }
  },
  methods: {
    formatPen,
    formatMincode,
    formatDob,
    deepCloneObject,
    boldFormatter(char) {
      let diff = '';
      if (/[A-Z]/.test(char)) {
        diff = '𝗔'.codePointAt(0) - 'A'.codePointAt(0);
      } else {
        diff = '𝗮'.codePointAt(0) - 'a'.codePointAt(0);
      }
      return String.fromCodePoint(char.codePointAt(0) + diff);
    },
    copyInfo() {
      if (this.isStudentUpdated) {
        const warningMessage = this.getMessageForStudent(this.studentID);
        this.setWarningAlert(warningMessage);
        return;
      }
      let dobCopy = formatDob(this.studentCopy.dob, 'uuuu-MM-dd', 'uuuu/MM/dd');
      this.copyTxt =
        'PEN: '.replace(/[A-Za-z]/g, this.boldFormatter) + (this.studentCopy.pen || '') + '\n' +
        'Legal Surname: '.replace(/[A-Za-z]/g, this.boldFormatter) + (this.studentCopy.legalLastName || '') + '\n' +
        'Legal Given: '.replace(/[A-Za-z]/g, this.boldFormatter) + (this.studentCopy.legalFirstName || '') + '\n' +
        'Legal Middle: '.replace(/[A-Za-z]/g, this.boldFormatter) + (this.studentCopy.legalMiddleNames || '') + '\n' +
        'Birth Date: '.replace(/[A-Za-z]/g, this.boldFormatter) + (dobCopy || '') + '\n' +
        'Gender: '.replace(/[A-Za-z]/g, this.boldFormatter) + (this.studentCopy.genderCode || '');
      this.$copyText(this.copyTxt);
    },
    copyPen() {
      this.copyTxt = this.studentCopy.pen || '';
      this.$copyText(this.copyTxt);
    },
    onError(e) {
      console.log(e);
    },
    changeStudentObjectValue(key, value) {
      this.studentCopy[`${key}`] = value?.toUpperCase();
      this.clearFieldError(key);
    },
    setEnableDisableForFields(value, ...excludedFields) {
      this.enableDisableFieldsMap.forEach((fieldValue, fieldKey) => excludedFields.includes(fieldKey) ? this.enableDisableFieldsMap.set(fieldKey, fieldValue) : this.enableDisableFieldsMap.set(fieldKey, value));
    },
    frontEndDateTimeFormat(date) {
      return moment(JSON.stringify(date), 'YYYY-MM-DDTHH:mm:ss').format('YYYY/MM/DD HH:mm:ss a');
    },
    updateDOBLabel(initialLoad) {
      if (initialLoad) {
        this.shortDOB = this.studentCopy.dob = this.studentCopy.dob.replace(/[^0-9]/g, '');
      } else {
        this.studentCopy.dob = this.shortDOB ? formatDob(this.shortDOB, 'uuuuMMdd', 'uuuu-MM-dd') : '';
      }
      this.longDOB = this.frontEndDOBFormat(this.studentCopy.dob);
    },
    uppercaseGender() {
      if (this.studentCopy.genderCode) {
        this.studentCopy.genderCode = this.studentCopy.genderCode.toUpperCase();
      }
    },
    getDateFormatter(pattern = 'uuuu/MM/dd') {
      return (new JSJoda.DateTimeFormatterBuilder)
        .appendPattern(pattern)
        .toFormatter(JSJoda.ResolverStyle.STRICT);
    },
    validateDOB() {
      if (this.studentCopy) {
        if (!this.shortDOB) {
          this.dobError = true;
          this.updateDOBLabel();
          return ['Required'];
        } else {
          if (isValidDob(this.shortDOB, 'uuuuMMdd')) {
            this.dobError = false;
            this.updateDOBLabel();
            return [];
          }
        }
      }
      this.dobError = true;
      return [
        this.dobHint
      ];
    },
    validateGender() {
      if (this.studentCopy) {
        if (!this.studentCopy.genderCode) {
          this.genderError = true;
          return ['Gender is required.'];
        } else {
          if (this.getGenderCodes().includes(this.studentCopy.genderCode)) {
            this.genderError = false;
            return [];
          }
        }
      }
      this.genderError = true;
      return [
        this.genderHint
      ];
    },
    // Asynchronous validator returns an array of boolean or string that would be provided for :rules prop of input field
    validateMincode() {
      return [v => {
        // reset the values.
        this.mincodeErrors = [];
        this.mincodeError = false;
        // reset the values.
        if (this.isValidFormattedMincode(v)) { // skip when no input or the formatted text is set for view
          return true;
        }
        this.schoolLabel = '';
        if (this.studentCopy?.mincode?.trim().length > 0) {
          if (!isValidMincode(this.studentCopy.mincode)) { // format error
            this.mincodeError = true;
            return this.mincodeHint;
          }
          if (this.studentCopy.mincode.length !== 8) { // length error
            this.mincodeError = true;
            return this.mincodeHint + this.mincodeAdditionalHint;
          }
          this.getSchoolName(this.studentCopy.mincode);
        }
        return true;
      }];
    },
    setStudent(student) {
      this.origStudent = student;
      this.studentCopy = this.deepCloneObject(this.origStudent);
      this.createdDateTime = this.frontEndDateTimeFormat(this.studentCopy.createDate);
      this.updatedDateTime = this.frontEndDateTimeFormat(this.studentCopy.updateDate);
      this.updateDOBLabel(true);
      this.formatPostalCode();
      this.setGradeLabel();
      this.getSchoolName(this.studentCopy.mincode);
      if (this.studentCopy.statusCode === STUDENT_CODES.MERGED) {
        this.setEnableDisableForFields(true, STUDENT_DETAILS_FIELDS.MERGED_TO, STUDENT_DETAILS_FIELDS.PEN);
      }
      if (this.studentCopy.statusCode === STUDENT_CODES.DECEASED || this.studentCopy.statusCode === STUDENT_CODES.DELETED) {
        this.setEnableDisableForFields(true, STUDENT_DETAILS_FIELDS.STATUS_CODE);
      }
    },
    refreshStudent() {
      this.isLoading = true;
      this.fieldNames.forEach(value => this.enableDisableFieldsMap.set(value, false));
      ApiService.apiAxios
        .get(Routes['student'].ROOT_ENDPOINT + '/detail/' + this.studentID)
        .then(response => {
          this.origStudent.truePen = response.data.merges?.find(merge => merge.studentMergeDirectionCode === 'TO')?.mergeStudent.pen;
          this.handleStudentDetails(response.data);
          this.clearStaleData();
          this.$emit('handleUpdatedStudent', response.data);
        })
        .catch(error => {
          console.log(error);
          this.setFailureAlert('An error occurred while loading the student details. Please try again later.');
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    hasEdits(key) {
      let studentCopy = this.studentCopy[key];
      let studentOriginal = this.origStudent[key];
      studentCopy = (studentCopy === null || studentCopy === undefined) ? '' : studentCopy;
      studentOriginal = (studentOriginal === null || studentOriginal === undefined) ? '' : studentOriginal;
      return studentCopy !== studentOriginal;
    },
    hasAnyEdits() {
      return JSON.stringify(this.studentCopy) !== JSON.stringify(this.origStudent);
    },
    revertField(key) {
      this.studentCopy[key] = this.origStudent[key];
      this.clearFieldError(key);
    },
    revertDOBField(value) {
      this.revertField(value);
      this.updateDOBLabel(true);
      this.err.birthDateError = [];
    },
    clearDOBRuleErrors(){
      this.err.birthDateError = [];
    },
    clearFieldError(key){
      Object.keys(this.err).forEach(errKey => {
        if (errKey === `${key}Error`) {
          this.err[errKey] = [];
        }
      });
    },
    revertMincodeField() {
      this.revertField(STUDENT_DETAILS_FIELDS.MINCODE);
      this.getSchoolName(this.studentCopy.mincode);
    },
    setGradeLabel() {
      if (this.studentCopy && this.studentCopy.gradeCode && this.gradeCodeObjects) {
        this.gradeLabel = this.gradeCodeObjects.filter(it => (it.gradeCode === this.studentCopy.gradeCode))[0].label;
      }
    },
    frontEndDOBFormat(date) {
      return moment(JSON.stringify(date), 'YYYY-MM-DDTHH:mm:ss').format('MMMM DD, YYYY');
    },
    formatPostalCode() {
      if (this.studentCopy.postalCode) {
        this.spacePostalCode = this.studentCopy.postalCode.replace(/.{3}$/, ' $&');
      }
    },
    dobHasChanged() {
      if (this.origStudent.dob) {
        if (!this.studentCopy.dob) {
          return true;
        } else if (this.origStudent.dob === this.studentCopy.dob) {
          return false;
        }
        const formatterLong = this.getDateFormatter();
        try {
          const dateLong = JSJoda.LocalDate.parse(this.origStudent.dob, formatterLong);
          const dateShort = JSJoda.LocalDate.parse(this.studentCopy.dob, formatterLong);
          if (dateLong.equals(dateShort)) {
            return false;
          }
        } catch (err) {
          return true;
        }
        return true;
      }
    },
    mincodeHasChanged() {
      if (this.origStudent.mincode) {
        if (!this.studentCopy.mincode) {
          return true;
        } else {
          let inputMincode = this.studentCopy.mincode;
          if (inputMincode.length === 9) {
            inputMincode = inputMincode.replace(' ', '');
          }
          if (this.origStudent.mincode === inputMincode) {
            return false;
          }
        }
        return true;
      }
    },
    confirmDeceasedDialog() {
      this.deceasedDialog = false;
      this.studentCopy.statusCode = STUDENT_CODES.DECEASED;
    },
    cancelDeceasedDialog() {
      this.deceasedDialog = false;
      this.studentCopy.statusCode = STUDENT_CODES.ACTIVE;
    },
    openDeceasedDialog() {
      if (this.studentCopy.statusCode === STUDENT_CODES.DECEASED) {
        this.deceasedDialog = true;
      }
    },
    getPenRequestBatchValidationIssueTypeCode(validationIssues, fieldName) {
      const issues = [];
      const data = validationIssues.find(el => el.penRequestBatchValidationFieldCode === fieldName)?.penRequestBatchValidationIssueTypeCode;
      if (data) {
        issues.push(data);
      }
      return issues;
    },
    async saveStudent() {
      if (this.parentRefs.studentDetailForm.validate()) {
        if (this.isStudentUpdated) {
          const warningMessage = this.getMessageForStudent(this.studentID);
          this.setWarningAlert(warningMessage);
          return;
        }
        const isUpdateStudentAllowed = await this.isStudentUpdateConfirmed();
        if (isUpdateStudentAllowed) {
          try {
            this.saveStudentLoading = true;
            const pickList = [STUDENT_DETAILS_FIELDS.LEGAL_FIRST_NAME, STUDENT_DETAILS_FIELDS.LEGAL_LAST_NAME, STUDENT_DETAILS_FIELDS.LEGAL_MIDDLE_NAMES, STUDENT_DETAILS_FIELDS.USUAL_FIRST_NAME,STUDENT_DETAILS_FIELDS.USUAL_LAST_NAME,STUDENT_DETAILS_FIELDS.USUAL_MIDDLE_NAMES,STUDENT_DETAILS_FIELDS.DOB, STUDENT_DETAILS_FIELDS.GENDER_CODE];
            const studentValidationPayload =  cloneDeep(pick(this.studentCopy, pickList));
            studentValidationPayload.dob = studentValidationPayload.dob.replace(/\D/g,'');
            const payload = {
              student: {
                ...studentValidationPayload
              }
            };
            const result = await getDemogValidationResults(payload);
            const validationIssues = result.filter(el => el.penRequestBatchValidationIssueSeverityCode === 'ERROR').map(y => {
              y.penRequestBatchValidationIssueTypeCode = this.prbValidationIssueTypeCodes.find(obj => obj.code === y.penRequestBatchValidationIssueTypeCode)?.description || y.penRequestBatchValidationIssueTypeCode;
              return y;
            });
            if (validationIssues?.length > 0) {
              this.err.legalLastNameError = this.getPenRequestBatchValidationIssueTypeCode(validationIssues, 'LEGALLAST');
              this.err.legalFirstNameError = this.getPenRequestBatchValidationIssueTypeCode(validationIssues, 'LEGALFIRST');
              this.err.legalMiddleNamesError = this.getPenRequestBatchValidationIssueTypeCode(validationIssues, 'LEGALMID');
              this.err.usualFirstNameError = this.getPenRequestBatchValidationIssueTypeCode(validationIssues, 'USUALFIRST');
              this.err.usualLastNameError = this.getPenRequestBatchValidationIssueTypeCode(validationIssues, 'USUALLAST');
              this.err.usualMiddleNamesError = this.getPenRequestBatchValidationIssueTypeCode(validationIssues, 'USUALMID');
              this.err.birthDateError = this.getPenRequestBatchValidationIssueTypeCode(validationIssues, 'BIRTHDATE');
            } else {
              const params = {
                penNumbersInOps: this.origStudent.pen
              };
              this.isStudentUpdatedInDifferentTab = false; //make sure that notification for current tab is ignored.
              const studentResponse = await ApiService.apiAxios.put(Routes['student'].ROOT_ENDPOINT + '/' + this.studentID, this.prepPut(this.studentCopy), {params});
              this.fieldNames.forEach(value => this.enableDisableFieldsMap.set(value, false)); // enable all the fields here, required fields to be disabled will be done in this.setStudent method.
              this.setStudent(studentResponse.data);
              this.$emit('update:student', studentResponse.data);
              this.setSuccessAlert('Student data updated successfully.');
            }
          } catch (e) {
            console.error(e);
            this.processSaveStudentError(e);
          } finally {
            this.saveStudentLoading = false;
          }

        }

      }
    },
    prepPut(student) {
      student.historyActivityCode = 'USEREDIT';
      return {
        student: student
      };
    },
    getGenderCodes() {
      if (this.genders && this.genderCodes.length === 0) {
        this.genderCodes = this.genders.map(a => a.genderCode);
      }
      return this.genderCodes;
    },
    getDemogCodeComboBox() {
      const demogCodeComboBox = [];
      if (this.demogCodeObjects) {
        for (const element of this.demogCodeObjects) {
          const item = {
            value: element.demogCode,
            text: element.label,
            disabled: element.demogCode === 'F'
          };
          demogCodeComboBox.push(item);
        }
      }
      return demogCodeComboBox;
    },
    getStatusLevels() {
      const statusCodeComboBox = [];
      if (this.statusCodeObjects) {
        for (const element of this.statusCodeObjects) {
          if (([STUDENT_CODES.ACTIVE, STUDENT_CODES.DECEASED].includes(element.statusCode) && this.studentCopy.statusCode !== STUDENT_CODES.DELETED) ||
            ([STUDENT_CODES.DELETED, STUDENT_CODES.ACTIVE].includes(element.statusCode) && this.studentCopy.statusCode === STUDENT_CODES.DELETED)) {
            const item = {
              value: element.statusCode,
              text: element.label,
            };
            statusCodeComboBox.push(item);
          }
        }
      }
      return statusCodeComboBox;
    },
    getCreatedDateTime() {
      return this.createdDateTime;
    },
    getUpdatedDateTime() {
      return this.updatedDateTime;
    },
    isFieldDisabled(fieldName) {
      return (!!this.enableDisableFieldsMap.get(fieldName) || this.fullReadOnly);
    },
    formatUpdateTime(datetime) {
      return moment(JSON.stringify(datetime), 'YYYY-MM-DDTHH:mm:ss').format('YYYY/MM/DD H:mma');
    },
    validateLegalLastName() {
      if (this.studentCopy) {
        if (!this.studentCopy.legalLastName) {
          return ['Legal Surname is required.'];
        }
      }
      return [];
    },
    handleStudentDetails({student, merges, possibleMatches}) {
      this.compareStudent[0] = student;
      this.setStudent(student);
      this.merges = merges;
      this.possibleMatches = possibleMatches;
      this.getTraxData(student.pen);
    },
    formatGradDate(date) {
      return date > 0 ? moment(date + '', 'YYYYMM').format('YYYY/MM') : '';
    },
    getTraxData(pen) {
      this.traxStatus = '';
      this.gradDateAndMincode = [];
      this.loadingTraxData = true;
      ApiService.apiAxios
        .get(Routes.PEN_TRAX_URL, {params: {pen}})
        .then(response => {
          this.traxStatus = response.data.traxStatus;
          if (response.data.student?.gradDate > 0) {
            this.gradDateAndMincode = [this.formatGradDate(response.data.student?.gradDate), formatMincode(response.data.student?.mincodeGrad || '')];
          }
        })
        .catch(error => {
          console.log(error);
          this.setFailureAlert('An error occurred while loading the TRAX status. Please try again later.');
        })
        .finally(() => {
          this.loadingTraxData = false;
        });
    },
    disableDemerge() {
      if (this.isProcessing || this.demergeSagaComplete || this.hasSagaInProgress(this.origStudent)) {
        return true;
      }
      return !(this.origStudent.statusCode === 'M' && !!this.origStudent.trueStudentID);

    },
    async demerge() {
      if (this.isStudentUpdated) {
        const warningMessage = this.getMessageForStudent(this.studentID);
        this.setWarningAlert(warningMessage);
        return;
      }
      this.mergedToStudent = this.mergedTo.mergeStudent;
      this.mergedFromStudent = this.origStudent;

      let result = await this.$refs.demergeConfirmationDialog.open(null, null,
        {color: '#fff', width: 580, closeIcon: true, subtitle: false, dark: false, rejectText: 'No'});
      if (!result) {
        return;
      }
      await this.executeDemerge();
    },
    showWarningAndDisableActionIfUpdatedStudentMatched(notificationData) {
      try {
        const student = JSON.parse(notificationData.eventPayload);
        const warningMessage = `Student details for ${student.pen}, is updated by ${student.updateUser}. Please refresh the page.`;
        if (student?.pen && student?.pen === this.studentDetails?.student?.pen && this.isStudentUpdatedInDifferentTab) { // show only when it is in a diff tab or diff user.
          this.isStudentUpdated = true;
          this.$emit('isStudentUpdated', true);
          this.setWarningAlert(warningMessage);
          const studentID = student.studentID;
          this.addStaleDataToMap({studentID, warningMessage});
        } else if (student?.pen && student?.pen === this.studentDetails?.student?.pen && !this.isStudentUpdatedInDifferentTab) {
          this.isStudentUpdatedInDifferentTab = true; // make it true for future messages.
          this.lastMessageFromSTANForStudentUpdate = warningMessage; // store it to show after receiving 409 http response, this helps in race condition where JetStream is sending message faster than http response.
        }
      } catch (e) {
        console.error(e);
      }
    },
    async isStudentUpdateConfirmed() {
      let isUpdateStudentAllowed = true;
      if (this.origStudent?.demogCode === STUDENT_DEMOG_CODES.CONFIRMED) {
        const confirmation = await this.$refs.confirmedStudentUpdateConfirmationDialog.open(null, null,
          {color: '#fff', width: 580, closeIcon: true, subtitle: false, dark: false, resolveText: 'Yes'});
        if (!confirmation) {
          isUpdateStudentAllowed = false;
        }
      }
      return isUpdateStudentAllowed;
    },
    processSaveStudentError(error) {
      if (error?.response?.status === 409 && error?.response?.data?.message) {
        this.setFailureAlert(error?.response?.data?.message);
        this.isStudentUpdated = true;
        this.$emit('isStudentUpdated', true);
        if (this.isStudentUpdatedInDifferentTab) { // if it is already true that means the message has already arrived from JetStream..
          const warningMsg = this.lastMessageFromSTANForStudentUpdate;
          const studentID = this.studentDetails.student.studentID;
          this.addStaleDataToMap({studentID, warningMsg});
          this.setWarningAlert(warningMsg);
        } else {
          this.isStudentUpdatedInDifferentTab = true; // turn it back to true in case of errors
        }
      } else {
        this.setFailureAlert('Student data could not be updated, please try again.');
      }
    }
  }
};
</script>
<style>
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

.memo-style > .v-input > .v-input__control > .v-input__slot > .v-text-field__slot > textarea {
  margin-right: 2px;
  margin-bottom: 3px;
}

.onEditPad {
  padding-left: 12px !important;
  padding-top: 2px !important;
}

.textFieldColumn {
  display: table-cell;
  height: 1rem;
  margin-top: -2px;
}

.darkBackgound.v-text-field > .v-input__control > .v-input__slot {
  background-color: #eeeeee;
}

.textAreaColumn {
  display: table-cell;
  height: 5em;
}

.sideCardField {
  display: table-cell;
  height: 3em;
}

.labelField {
  display: table-cell;
  height: 1em;
  padding-top: 8px !important;
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

.student-details-tabs-style {
  text-transform: none;
}
</style>
