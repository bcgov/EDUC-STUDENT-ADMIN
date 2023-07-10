<template>
  <div>
    <v-row v-if="!isLoading">
      <v-col
        cols="3"
        class="px-6 ma-0"
      >
        <v-card
          class="pa-2 ma-0"
          color="#D7D7D7"
          width="100%"
          elevation="0"
        >
          <v-row
            no-gutters
            colspan="1"
          >
            <v-col cols="1">
              <p class="labelField">
                PEN
              </p>
            </v-col>
          </v-row>
          <v-row no-gutters>
            <v-col cols="5">
              <v-text-field
                :id="STUDENT_DETAILS_FIELDS.PEN"
                v-model="studentCopy.pen"
                readonly
                variant="plain"
                style="margin-top: -8px"
                class="onhoverEdit bolder customNoBorder"
                color="#000000"
                density="compact"
              />
            </v-col>
            <v-col cols="1">
              <PrimaryButton
                color="#38598A"
                text="Copy"
                :short="true"
                class="mt-1"
                :model="copyTxt"
                @click-action="copyPen"
              />
            </v-col>
          </v-row>

          <StudentDetailsComboBox
            label="Demog Code"
            colspan="1"
            :name="STUDENT_DETAILS_FIELDS.DEMOG_CODE"
            :model="studentCopy.demogCode?studentCopy.demogCode:''"
            :has-edits="hasEdits"
            tab-index="14"
            :revert-field="revertField"
            :items="getDemogCodeComboBox()"
            revert-id="revertDemogCode"
            :disabled="isFieldDisabledWithReadOnly(STUDENT_DETAILS_FIELDS.DEMOG_CODE)"
            @changeStudentObjectValue="changeStudentObjectValue"
          />
          <StudentDetailsComboBox
            label="Document Type Code"
            colspan="1"
            :name="STUDENT_DETAILS_FIELDS.DOC_TYPE_CODE"
            :model="studentCopy.documentTypeCode?studentCopy.documentTypeCode:''"
            :rules="validateDemogCode()"
            :has-edits="hasEdits"
            tab-index="15"
            :revert-field="revertField"
            :items="getDocumentTypes()"
            revert-id="revertDocumentTypeCode"

            :disabled="isFieldDisabledWithReadOnly(STUDENT_DETAILS_FIELDS.DOC_TYPE_CODE)"
            @changeStudentObjectValue="changeStudentObjectValue"
          />
          <div
            v-if="studentCopy.statusCode === STUDENT_CODES.MERGED"
            class="mb-5"
          >
            <v-row
              cols="1"
              no-gutters
            >
              <v-col>
                <p class="mb-0">
                  Status
                </p>
              </v-col>
            </v-row>
            <v-chip
              color="#003366"
              small
              dark
            >
              <strong>{{ statusCodeObjects.filter(obj => obj.statusCode === studentCopy.statusCode)[0].label }}</strong>
            </v-chip>
          </div>
          <StudentDetailsComboBox
            v-else
            label="Status"
            colspan="1"
            name="statusCode"
            :model="studentCopy.statusCode?studentCopy.statusCode:''"
            :has-edits="hasEdits"
            tab-index="16"
            :revert-field="revertField"
            :items="getStatusLevels()"
            revert-id="revertStatusCode"
            :disabled="isFieldDisabledWithReadOnly('statusCode')"
            @changeStudentObjectValue="changeStudentObjectValue"
          />
          <v-row
            v-if="dateOfConfirmation"
            no-gutters
            class="mb-2 pb-2"
          >
            <v-col>
              <div>
                <span class="ma-0">Date Of Confirmation:</span> <span class="bolder mb-0 customNoBorder py-0 my-0"> {{ dateOfConfirmation }}</span>
                <PrimaryButton
                  color="#38598A"
                  text="Update"
                  :short="true"
                  class="mt-1 ml-3"
                  :loading="saveStudentLoading"
                  @click-action="updateDOC"
                  title="Set Date Of Confirmation to Current Date."
                  :disabled="fullReadOnly"
                />
              </div>
            </v-col>
          </v-row>

          <StudentDetailsTextFieldSideCardReadOnly
            :model="traxStatus"
            :name="STUDENT_DETAILS_FIELDS.TRAX_STATUS"
            colspan="1"
            label="TRAX Status"
            :loading="loadingTraxData"
            :disabled="isFieldDisabledWithReadOnly(STUDENT_DETAILS_FIELDS.TRAX_STATUS)"
          />

          <StudentDetailsTextFieldSideCardReadOnly
            :model="gradDateAndMincode"
            :name="STUDENT_DETAILS_FIELDS.GRAD_DATE"
            colspan="1"
            label="Grad Date & Mincode"
            multi-line
            :loading="loadingTraxData"
            :disabled="isFieldDisabledWithReadOnly(STUDENT_DETAILS_FIELDS.GRAD_DATE)"
          />

          <StudentDetailsTextFieldSideCardReadOnly
            :model="getCreatedDateTime()"
            :name="STUDENT_DETAILS_FIELDS.CREATED_DATE"
            colspan="1"
            label="Created"
            :disabled="isFieldDisabledWithReadOnly(STUDENT_DETAILS_FIELDS.CREATED_DATE)"
          />

          <StudentDetailsTextFieldSideCardReadOnly
            :model="getUpdatedDateTime()"
            :name="STUDENT_DETAILS_FIELDS.UPDATED_DATE"
            colspan="1"
            label="Updated"
            :disabled="isFieldDisabledWithReadOnly(STUDENT_DETAILS_FIELDS.UPDATED_DATE)"
          />

          <v-row
            no-gutters
            class="mb-2 pb-2"
          >
            <v-col>
              <StudentDetailsTextFieldSideCardReadOnly
                :model="digitalIDType"
                name="CREDENTIAL_TYPE"
                colspan="1"
                label="Credential Type"
                :loading="loadingDigitalIDData"
                :disabled="fullReadOnly"
              />
              <div
                v-if="getAutoMatchedDate !== null"
                style="font-size: small"
                class="mt-n5"
              >
                (Auto-matched {{ getAutoMatchedDate }})
              </div>
            </v-col>
            <v-col v-if="!fullReadOnly && digitalIDType !== 'None'">
              <a
                style="float: right;font-weight: bold"
                class="mr-4 mt-6"
                @click="unlinkStudent"
              >
                Unlink Credential
              </a>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
      <v-col
        cols="7"
        class="py-0 pl-0 mt-3"
      >
        <v-card
          class="pa-0"
          height="100%"
          width="100%"
          elevation="0"
        >
          <StudentDetailsTextField
            max-length="25"
            :name="STUDENT_DETAILS_FIELDS.LEGAL_LAST_NAME"
            tab-index="1"
            :model="studentCopy.legalLastName?studentCopy.legalLastName:''"
            :has-edits="hasEdits"
            revert-id="revertLegalLastName"
            :field-validation-required="true"
            :validation-rules="validateLegalLastName"
            :revert-field="revertField"
            label="Legal Surname"
            colspan="5"
            :async-messages="err.legalLastNameError"
            :disabled="isFieldDisabledWithReadOnly(STUDENT_DETAILS_FIELDS.LEGAL_LAST_NAME)"
            @changeStudentObjectValue="changeStudentObjectValue"
          />

          <StudentDetailsTextField
            max-length="25"
            :name="STUDENT_DETAILS_FIELDS.LEGAL_FIRST_NAME"
            tab-index="2"
            :model="studentCopy.legalFirstName?studentCopy.legalFirstName:''"
            :has-edits="hasEdits"
            revert-id="revertLegalFirstName"
            :revert-field="revertField"
            label="Legal Given"
            colspan="5"
            :async-messages="err.legalFirstNameError"
            :disabled="isFieldDisabledWithReadOnly(STUDENT_DETAILS_FIELDS.LEGAL_FIRST_NAME)"
            @changeStudentObjectValue="changeStudentObjectValue"
          />

          <StudentDetailsTextField
            max-length="25"
            :name="STUDENT_DETAILS_FIELDS.LEGAL_MIDDLE_NAMES"
            tab-index="3"
            :model="studentCopy.legalMiddleNames?studentCopy.legalMiddleNames:''"
            :has-edits="hasEdits"
            revert-id="revertLegalMiddleNames"
            :revert-field="revertField"
            label="Legal Middle"
            colspan="5"
            :async-messages="err.legalMiddleNamesError"
            :disabled="isFieldDisabledWithReadOnly(STUDENT_DETAILS_FIELDS.LEGAL_MIDDLE_NAMES)"
            @changeStudentObjectValue="changeStudentObjectValue"
          />

          <StudentDetailsTextField
            max-length="25"
            :name="STUDENT_DETAILS_FIELDS.USUAL_LAST_NAME"
            tab-index="4"
            :model="studentCopy.usualLastName?studentCopy.usualLastName:''"
            :has-edits="hasEdits"
            revert-id="revertUsualLastName"
            :revert-field="revertField"
            label="Usual Surname"
            colspan="5"
            :async-messages="err.usualLastNameError"
            :disabled="isFieldDisabledWithReadOnly(STUDENT_DETAILS_FIELDS.USUAL_LAST_NAME)"
            @changeStudentObjectValue="changeStudentObjectValue"
          />

          <StudentDetailsTextField
            max-length="25"
            :name="STUDENT_DETAILS_FIELDS.USUAL_FIRST_NAME"
            tab-index="5"
            :model="studentCopy.usualFirstName?studentCopy.usualFirstName:''"
            :has-edits="hasEdits"
            revert-id="revertUsualFirstName"
            :revert-field="revertField"
            label="Usual Given"
            colspan="5"
            :async-messages="err.usualFirstNameError"
            :disabled="isFieldDisabledWithReadOnly(STUDENT_DETAILS_FIELDS.USUAL_FIRST_NAME)"
            @changeStudentObjectValue="changeStudentObjectValue"
          />

          <StudentDetailsTextField
            max-length="25"
            :name="STUDENT_DETAILS_FIELDS.USUAL_MIDDLE_NAMES"
            tab-index="6"
            :model="studentCopy.usualMiddleNames?studentCopy.usualMiddleNames:''"
            :has-edits="hasEdits"
            revert-id="revertUsualMiddleNames"
            :revert-field="revertField"
            label="Usual Middle"
            colspan="5"
            :async-messages="err.usualMiddleNamesError"
            :disabled="isFieldDisabledWithReadOnly(STUDENT_DETAILS_FIELDS.USUAL_MIDDLE_NAMES)"
            @changeStudentObjectValue="changeStudentObjectValue"
          />


          <!-- some fields cant be ported to child component, left as is-->
          <v-row
            no-gutters
            density="compact"
            class="py-2"
            style="max-height: 3em;"
          >
            <v-col cols="2">
              <p class="labelField">
                Gender
              </p>
            </v-col>
            <v-col
              cols="1"
              @mouseover="isFieldDisabledWithReadOnly(STUDENT_DETAILS_FIELDS.GENDER_CODE)?hoveringGender=false:hoveringGender = true"
              @mouseout="editingGender ? hoveringGender = true : hoveringGender = false"
            >
              <v-select
                id="Gender"
                v-model="studentCopy.genderCode"
                tabindex="7"
                class="onhoverEdit bolder mb-0 customNoBorder py-0 "
                :class="{darkBackgound: hoveringGender || hasEdits(STUDENT_DETAILS_FIELDS.GENDER_CODE), 'gender-drop-down-fixed': !hoveringGender&&!editingGender}"
                :items="genderCodes"
                :bg-color="hoveringGender || editingGender || hasEdits(STUDENT_DETAILS_FIELDS.GENDER_CODE) ? '#efefef' : undefined"
                :style="hoveringGender || editingGender || hasEdits(STUDENT_DETAILS_FIELDS.GENDER_CODE) ? '' : 'padding-top: 0px !important; margin-top: -7px'"
                :variant="hoveringGender || editingGender || hasEdits(STUDENT_DETAILS_FIELDS.GENDER_CODE) ? 'outlined' : 'plain'"
                density="compact"
                :disabled="isFieldDisabledWithReadOnly(STUDENT_DETAILS_FIELDS.GENDER_CODE)"
                @keyup.tab="[hoveringGender = true, editingGender = true]"
                @change="[editingGender = false, hoveringGender = false, setGenderLabel()]"
              />
            </v-col>
            <v-col
              cols="3"
              class="textFieldColumn gradeLabelColumn"
            >
              <v-text-field
                id="genderLabel"
                class="onhoverEdit customNoBorder onhoverPad"
                :value="genderLabel"
                color="#000000"
                density="compact"
                style="margin-top: -10px; color: black"
                variant="plain"
                readonly
                tabindex="-1"
                :disabled="true"
              />
            </v-col>
            <v-col
              class="textFieldColumn"
              cols="2"
            >
              <v-text-field
                v-if="hasEdits(STUDENT_DETAILS_FIELDS.GENDER_CODE)"
                id="revertGender"
                class="onhoverEdit revertValue customNoBorder ml-3"
                readonly
                value="Revert"
                style="margin-top: -7px"
                variant="plain"
                density="compact"
                tabindex="-1"
                @click="revertField(STUDENT_DETAILS_FIELDS.GENDER_CODE)"
              />
            </v-col>
          </v-row>

          <v-row
            no-gutters
            density="compact"
            class="py-3"
          >
            <v-col cols="2">
              <div class="labelField">
                <div style="display: inline-block;">
                  Date of Birth
                </div>
                <div style="display: inline-block">
                  <img
                    title="YYYYMMDD"
                    :class="{'ml-3': true, 'dob-disabled': isFieldDisabledWithReadOnly(STUDENT_DETAILS_FIELDS.DOB)}"
                    src="@/assets/images/information.svg"
                    alt="YYYYMMDD"
                  >
                </div>
              </div>
            </v-col>
            <v-col
              cols="2"
              :class="{textFieldColumn: !dobError}"
            >
              <FormattedTextField
                :id="STUDENT_DETAILS_FIELDS.DOB"
                v-model="shortDOB"
                tabindex="8"
                :classes="['onhoverEdit', 'bolder', 'customNoBorder', {onhoverPad: !hoveringDOB && !dobHasChanged(), darkBackgound: hoveringDOB || dobHasChanged()}]"
                :filled="false"
                :clearable="false"
                :format="formatDob"
                :async-messages="err.birthDateError"
                :rules="validateDOB()"
                :has-edits="hasEdits"
                :name="STUDENT_DETAILS_FIELDS.DOB"
                maxlength="8"
                :readonly="!hoveringDOB || !editingDOB"
                :style="hoveringDOB || editingDOB || dobHasChanged() ? '' : 'padding-top: 0px !important; margin-top: -10px'"
                :variant="hoveringDOB || editingDOB || dobHasChanged() ? 'outlined': 'plain'"
                :disabled="isFieldDisabledWithReadOnly(STUDENT_DETAILS_FIELDS.DOB)"
                @keyup.tab="[editingDOB = true, hoveringDOB = true]"
                @mouseover="isFieldDisabledWithReadOnly('dob')? hoveringDOB = false : hoveringDOB = true"
                @mouseout="editingDOB ? hoveringDOB = true : hoveringDOB = false"
                @blur="[editingDOB = false, hoveringDOB = false]"
                @focus="[editingDOB = true, hoveringDOB = true]"
                @input="clearDOBRuleErrors"
              />
            </v-col>
            <v-col
              cols="3"
              class="textFieldColumn"
            >
              <v-text-field
                v-if="hoveringDOB && !editingDOB"
                id="dobFull"
                v-model="longDOB"
                class="onhoverEdit bolder customNoBorder onhoverPad"
                color="#000000"
                style="margin-top: -10px; color: black"
                density="compact"
                variant="plain"
                readonly
                tabindex="-1"
              />
            </v-col>
            <v-col
              class="textFieldColumn"
              cols="2"
            >
              <v-text-field
                v-show="dobHasChanged()"
                id="revertDOB"
                class="onhoverEdit revertValue customNoBorder ml-3"
                readonly
                value="Revert"
                style="margin-top: -7px"
                variant="plain"
                density="compact"
                tabindex="-1"
                @click="revertDOBField(STUDENT_DETAILS_FIELDS.DOB)"
              />
            </v-col>
          </v-row>
          <v-row
            no-gutters
            density="compact"
            class="py-3"
            style="max-height: 3em;"
          >
            <v-col cols="2">
              <p class="labelField">
                Grade
              </p>
            </v-col>
            <v-col
              cols="1"
              @mouseover="isFieldDisabledWithReadOnly(STUDENT_DETAILS_FIELDS.GRADE_CODE)?hovering=false:hovering = true"
              @mouseout="editing ? hovering = true : hovering = false"
            >
              <v-select
                id="GradeCombo"
                v-model="studentCopy.gradeCode"
                tabindex="9"
                :style="hovering || editing || hasEdits(STUDENT_DETAILS_FIELDS.GRADE_CODE) ? '' : 'padding-top: 0px !important; margin-top: -7px'"
                class="onhoverEdit bolder mb-0 customNoBorder py-0 "
                :class="{darkBackgound: hovering || hasEdits(STUDENT_DETAILS_FIELDS.GRADE_CODE), 'grade-drop-down-fixed': !hovering&&!editing}"
                :items="gradeCodes"
                :bg-color="hovering || editing || hasEdits(STUDENT_DETAILS_FIELDS.GRADE_CODE) ? '#efefef' : undefined"
                :variant="hovering || editing || hasEdits(STUDENT_DETAILS_FIELDS.GRADE_CODE) ? 'outlined' : 'plain'"
                density="compact"
                :disabled="isFieldDisabledWithReadOnly(STUDENT_DETAILS_FIELDS.GRADE_CODE)"
                @keyup.tab="[editing = true, hovering = true]"
                @change="[editing = false, hovering = false, setGradeLabel()]"
              />
            </v-col>
            <v-col
              cols="3"
              class="textFieldColumn gradeLabelColumn"
            >
              <v-text-field
                id="gradeLabel"
                class="onhoverEdit customNoBorder onhoverPad"
                :value="gradeLabel"
                color="#000000"
                density="compact"
                style="margin-top: -10px"
                variant="plain"
                readonly
                tabindex="-1"
                :disabled="true"
              />
            </v-col>
            <v-col class="py-2">
              <v-text-field
                v-if="hasEdits(STUDENT_DETAILS_FIELDS.GRADE_CODE)"
                id="revertGradeCode"
                class="onhoverEdit revertValue customNoBorder ml-3"
                readonly
                variant="plain"
                value="Revert"
                density="compact"
                tabindex="-1"
                @click="revertField(STUDENT_DETAILS_FIELDS.GRADE_CODE)"
              />
            </v-col>
          </v-row>

          <StudentDetailsTextFieldReadOnly
            :model="studentCopy.gradeYear?studentCopy.gradeYear:''"
            :name="STUDENT_DETAILS_FIELDS.GRADE_YEAR"
            colspan="1"
            label="Grade School Year"
            :disabled="isFieldDisabledWithReadOnly(STUDENT_DETAILS_FIELDS.GRADE_YEAR)"
          />

          <StudentDetailsTextField
            :model="studentCopy.postalCode?studentCopy.postalCode:''"
            :name="STUDENT_DETAILS_FIELDS.POSTAL_CODE"
            colspan="2"
            label="Postal Code"
            :disabled="isFieldDisabledWithReadOnly(STUDENT_DETAILS_FIELDS.POSTAL_CODE)"
            :has-edits="hasEdits"
            max-length="7"
            :revert-field="revertField"
            :async-messages="[]"
            revert-id="revertPostalCode"
            tab-index="10"
            @changeStudentObjectValue="changeStudentObjectValue"
          />

          <v-row
            no-gutters
            class="py-3"
          >
            <v-col cols="2">
              <p class="labelField">
                Mincode
              </p>
            </v-col>
            <v-col
              cols="2"
              :class="{textFieldColumn: !mincodeError}"
            >
              <FormattedTextField
                :id="STUDENT_DETAILS_FIELDS.MINCODE"
                v-model="studentCopy.mincode"
                tabindex="11"
                :classes="['onhoverEdit', 'bolder', 'customNoBorder', {onhoverPad: !hoveringMincode && !mincodeHasChanged(), darkBackgound: hoveringMincode || mincodeHasChanged()}]"
                :async-messages="mincodeErrors"
                :filled="false"
                :clearable="false"
                :format="formatMincode"
                :name="STUDENT_DETAILS_FIELDS.MINCODE"
                :has-edits="hasEdits"
                :rules="validateMincode()"
                maxlength="8"
                :style="hoveringMincode || editingMincode || mincodeHasChanged() ? '' : 'padding-top: 0px !important; margin-top: -7px'"
                :readonly="!hoveringMincode || !editingMincode"
                :variant="hoveringMincode || editingMincode || mincodeHasChanged() ? 'outlined' : 'plain'"
                :disabled="isFieldDisabledWithReadOnly(STUDENT_DETAILS_FIELDS.MINCODE)"
                @keyup.tab="[editingMincode = true, hoveringMincode = true]"
                @mouseover="isFieldDisabledWithReadOnly('mincode')? hoveringMincode = false : hoveringMincode = true"
                @mouseout="editingMincode ? hoveringMincode = true : hoveringMincode = false"
                @blur="[editingMincode = false, hoveringMincode = false]"
                @focus="[editingMincode = true, hoveringMincode = true]"
              />
            </v-col>
            <v-col
              cols="5"
              class="textFieldColumn"
            >
              <v-progress-circular
                v-if="loadingSchoolData"
                color="primary"
                indeterminate
                class="ml-3"
              />
              <v-text-field
                v-else
                id="schoolFill"
                v-model="schoolLabel"
                class="onhoverEdit customNoBorder onhoverPad"
                color="#000000"
                density="compact"
                style="padding-top: 0px !important; margin-top: -7px"
                variant="plain"
                readonly
                tabindex="-1"
              />
            </v-col>
            <v-col
              class="textFieldColumn"
              cols="2"
            >
              <v-text-field
                v-if="hasEdits(STUDENT_DETAILS_FIELDS.MINCODE)"
                id="revertMincode"
                class="onhoverEdit revertValue customNoBorder ml-3"
                readonly
                value="Revert"
                style="margin-top: -8px"
                variant="plain"
                density="compact"
                tabindex="-1"
                @click="revertMincodeField()"
              />
            </v-col>
          </v-row>
          <StudentDetailsTextField
            :model="studentCopy.localID?studentCopy.localID:''"
            :name="STUDENT_DETAILS_FIELDS.LOCAL_ID"
            colspan="2"
            label="Local ID"
            :disabled="isFieldDisabledWithReadOnly(STUDENT_DETAILS_FIELDS.LOCAL_ID)"
            :has-edits="hasEdits"
            max-length="12"
            :revert-field="revertField"
            :async-messages="[]"
            revert-id="revertLocalID"
            tab-index="12"
            @changeStudentObjectValue="changeStudentObjectValue"
          />


          <StudentDetailsTemplateTextField
            v-if="possibleMatches.length > 0"
            colspan="2"
            label="Twin(s)?"
            :disabled="isFieldDisabled(STUDENT_DETAILS_FIELDS.TWINS)"
          >
            <a @click="twinsDialog=true">
              Yes
            </a>
          </StudentDetailsTemplateTextField>

          <StudentDetailsTemplateTextField
            v-if="mergedTo"
            colspan="8"
            label="Merged To"
            :disabled="isFieldDisabledWithReadOnly(STUDENT_DETAILS_FIELDS.MERGED_TO)"
          >
            <div>
              <router-link
                :to="{params: {studentID: mergedTo.mergeStudentID}}"
                class="pr-4"
              >
                {{ formatPen(mergedTo.mergeStudent.pen) }}
              </router-link>
              <span class="pr-4">{{ formatUpdateTime(mergedTo.updateDate) }}</span>
              <span class="pr-4">{{ mergedTo.studentMergeSourceCode }}</span>
              <span>{{ mergedTo.updateUser }}</span>
            </div>
          </StudentDetailsTemplateTextField>

          <StudentDetailsTemplateTextField
            v-if="mergedFrom.length > 0"
            colspan="8"
            label="Merged From"
            :disabled="isFieldDisabledWithReadOnly(STUDENT_DETAILS_FIELDS.MERGED_FROM)"
          >
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

          <v-row
            no-gutters
            density="compact"
            style="min-height: 7em;"
            class="py-2"
          >
            <v-col cols="2">
              <p class="labelField">
                Memo
              </p>
            </v-col>
            <v-col class="textAreaColumn memo-style">
              <v-textarea
                :id="STUDENT_DETAILS_FIELDS.MEMO"
                v-model="studentCopy.memo"
                tabindex="13"
                class="onhoverEdit bolder customNoBorder"
                :class="{onhoverPad: !hoveringMemo && !hasEdits('memo'), darkBackgound: hoveringMemo || hasEdits('memo')}"
                color="#000000"
                maxlength="4000"
                density="compact"
                :bg-color="hoveringMemo || editingMemo || hasEdits(STUDENT_DETAILS_FIELDS.MEMO) ? '#efefef' : undefined"
                :variant="hoveringMemo || editingMemo || hasEdits(STUDENT_DETAILS_FIELDS.MEMO) ? 'outlined' : 'plain'"
                rows="3"
                no-resize
                :readonly="!hoveringMemo || !editingMemo"
                :outlined="hoveringMemo || editingMemo || hasEdits(STUDENT_DETAILS_FIELDS.MEMO)"
                :disabled="isFieldDisabledWithReadOnly(STUDENT_DETAILS_FIELDS.MEMO)"
                @keyup.tab="[editingMemo = true, hoveringMemo = true]"
                @mouseover="isFieldDisabledWithReadOnly('memo')?hoveringMemo = false:hoveringMemo = true"
                @mouseout="editingMemo ? hoveringMemo = true : hoveringMemo = false"
                @blur="[editingMemo = false, hoveringMemo = false]"
                @click="[editingMemo = true, hoveringMemo = true]"
              />
            </v-col>
            <v-col
              class="textFieldColumn"
              cols="2"
            >
              <v-text-field
                v-if="hasEdits(STUDENT_DETAILS_FIELDS.MEMO)"
                id="revertMemo"
                class="onhoverEdit revertValue customNoBorder ml-3"
                readonly
                value="Revert"
                density="compact"
                variant="plain"
                tabindex="-1"
                @click="revertField(STUDENT_DETAILS_FIELDS.MEMO)"
              />
            </v-col>
          </v-row>
          <v-divider />
          <v-progress-linear
            indeterminate
            color="blue"
            :active="isProcessing || hasSagaInProgress(origStudent)"
          />
        </v-card>
      </v-col>
      <v-col cols="1">
        <CompareDemographicModal
          v-model:selected-records="compareStudent"
          :clear-on-exit="false"
          :disabled="hasSagaInProgress(origStudent) || !PROCESS_STUDENT_ROLE"
        />
      </v-col>
      <v-col cols="1">
        <TertiaryButton
          text="Copy"
          @click-action="copyInfo"
        />
      </v-col>
    </v-row>
    <slot
      v-if="!isLoading"
      name="buttonbar"
      :is-advanced-search="isAdvancedSearch"
      :has-any-edits="hasAnyEdits"
      :save-student="saveStudent"
      :REQUEST_TYPES="REQUEST_TYPES"
      :disable-demerge="disableDemerge"
      :is-student-updated="isStudentUpdated"
      :save-student-loading="saveStudentLoading"
      :demerge="demerge"
    />
    <v-row
      v-if="isLoading"
      fluid
      class="full-height align-center justify-center"
    >
      <article
        id="pen-display-container"
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
    </v-row>

    <v-dialog
      v-model="deceasedDialog"
      width="400px"
    >
      <v-card>
        <v-card-text class="px-5 py-5">
          Change Student Status to Deceased?
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <v-spacer />
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
        :possible-matches="possibleMatches"
        @close="twinsDialog=false"
      />
    </v-dialog>
    <ConfirmationDialog ref="confirmationDialog" />
    <ConfirmationDialog ref="confirmedStudentUnlinkConfirmationDialog">
      <template #message>
        <v-col class="mt-n6">
          <v-row class="mb-3">
            Are you sure you want to unlink this student?
          </v-row>
        </v-col>
      </template>
    </ConfirmationDialog>
    <ConfirmationDialog ref="confirmedStudentUpdateConfirmationDialog" :show-title-bar="false">
      <template #message>
        <v-col>
          <v-row class="mb-3">
            <span>Are you sure you want to edit this <strong>Confirmed</strong> student?</span>
          </v-row>
        </v-col>
      </template>
    </ConfirmationDialog>
    <ConfirmationDialog ref="demergeConfirmationDialog" :show-title-bar="false">
      <template #message>
        <v-col class="mt-n6">
          <v-row
            v-if="isConfirmedStudent"
            class="mb-3"
          >
            <span>Are you sure you want to de-merge this <strong>Confirmed</strong> student?</span>
          </v-row>
          <v-row
            v-else
            class="mb-3"
          >
            <span>Are you sure you want to demerge PENs <strong>{{ getMergedFromPen() }}</strong> and <strong>{{
              getMergedToPen()
            }}</strong>?</span>
          </v-row>
        </v-col>
      </template>
    </ConfirmationDialog>
  </div>
</template>

<script>
import { mapState } from 'pinia';
import moment from 'moment';
import ApiService from '../../common/apiService';
import {REQUEST_TYPES, Routes, STUDENT_CODES, STUDENT_DEMOG_CODES, STUDENT_DETAILS_FIELDS} from '@/utils/constants';
import StudentDetailsTextField from '@/components/penreg/student/StudentDetailsTextField.vue';
import StudentDetailsTextFieldReadOnly from '@/components/penreg/student/StudentDetailsTextFieldReadOnly.vue';
import StudentDetailsComboBox from '@/components/penreg/student/StudentDetailsComboBox.vue';
import StudentDetailsTextFieldSideCardReadOnly from '@/components/penreg/student/StudentDetailsTextFieldSideCardReadOnly.vue';
import StudentDetailsTemplateTextField from '@/components/penreg/student/StudentDetailsTemplateTextField.vue';
import {formatDateTime, formatDob, formatMincode, formatPen} from '@/utils/format';
import {cloneDeep, pick, sortBy, debounce} from 'lodash';
import alertMixin from '../../mixins/alertMixin';
import schoolMixin from '../../mixins/schoolMixin';
import servicesSagaMixin from '../../mixins/servicesSagaMixin';
import ConfirmationDialog from '../util/ConfirmationDialog.vue';
import TwinnedStudentsCard from '@/components/penreg/student/TwinnedStudentsCard.vue';
import CompareDemographicModal from './CompareDemographicModal.vue';
import {isValidDob, isValidMincode} from '@/utils/validation';
import FormattedTextField from '@/components/util/FormattedTextField.vue';
import TertiaryButton from '@/components/util/TertiaryButton.vue';
import PrimaryButton from '@/components/util/PrimaryButton.vue';
import staleStudentRecordMixin from '@/mixins/staleStudentRecordMixin';
import {deepCloneObject, getDemogValidationResults} from '@/utils/common';
import {authStore} from '@/store/modules/auth';
import {notificationsStore} from '@/store/modules/notifications';
import {studentStore} from '@/store/modules/student';
import {penRequestBatchStore} from '@/store/modules/penRequestBatch';
import {studentSearchStore} from '@/store/modules/studentSearch';
import {LocalDate, DateTimeFormatterBuilder, ResolverStyle} from '@js-joda/core';

export default {
  name: 'StudentDetailCommon',
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
      digitalIDType: '',
      loadingDigitalIDData: false,
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
      dateOfConfirmation: '',
      gradeCodes: [],
      genderLabels:[],
      genderLabel:null,
      digitalIdentity: {},
    };
  },
  created() {
    this.genderCodes = this.genders ? this.genders.map(a => a.genderCode) : [];
    this.demogLabels = this.demogCodeObjects ? this.demogCodeObjects.map(a => a.label) : [];
    this.statusLabels = this.statusCodeObjects ? this.statusCodeObjects.map(a => a.label) : [];
    this.gradeLabels = this.gradeCodeObjects ? this.gradeCodeObjects.map(a => a.label) : [];
    this.gradeCodes = this.gradeCodeObjects ? this.gradeCodeObjects.map(a => a.gradeCode) : [];
    this.genderLabels = this.genders ? this.genders.map(a => a.label) : [];
  },
  computed: {
    ...mapState(penRequestBatchStore, ['prbValidationFieldCodes', 'prbValidationIssueTypeCodes']),
    ...mapState(studentStore, ['genders', 'demogCodeObjects', 'statusCodeObjects', 'gradeCodeObjects', 'documentTypeCodes']),
    ...mapState(studentSearchStore, ['isAdvancedSearch']),
    ...mapState(notificationsStore, ['notification']),
    ...mapState(authStore, ['userInfo', 'PROCESS_STUDENT_ROLE']),
    mergedTo() {
      return this.merges.find(merge => merge.studentMergeDirectionCode === 'TO');
    },
    getAutoMatchedDate(){
      if(this.digitalIdentity && this.digitalIdentity.autoMatchedDate){
        return this.frontEndDateFormat(this.digitalIdentity.autoMatchedDate);
      }
      return null;
    },
    mergedFrom() {
      return sortBy(this.merges.filter(merge => merge.studentMergeDirectionCode === 'FROM'), ['mergeStudent.pen']);
    },
    isConfirmedStudent() {
      return this.origStudent?.demogCode === STUDENT_DEMOG_CODES.CONFIRMED;
    }
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
    }
  },
  mounted() {
    studentStore().getCodes();
    penRequestBatchStore().getCodes();
    this.refreshStudent();
    //reset errors
    Object.keys(this.err).forEach(key => {
      this.err[key] = [];
    });
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
    formatDateTime,
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
    changeStudentObjectValue: debounce(function (key, value, event) {
      if (key === STUDENT_DETAILS_FIELDS.DEMOG_CODE && value === 'C' && this.origStudent[`${key}`] !== 'C') {
        this.$nextTick(() => {
          this.parentRefs.studentDetailForm.validate();
        });
      }
      this.studentCopy[`${key}`] = value?.toUpperCase().trim();
      //PEN-1018 and PEN-1891. Calling Trim() or toUpperCase() on a string resets the cursor. SetTimeout needed to reset the cursor position after value has changed.
      if(event) {
        let cursorPositionStart = event.target.selectionStart;
        let cursorPositionEnd = event.target.selectionEnd;
        setTimeout(() => event.target.setSelectionRange(cursorPositionStart, cursorPositionEnd), 0);
      }
      this.clearFieldError(key);
      this.validateForm();
    }, 500),
    setEnableDisableForFields(value, ...excludedFields) {
      this.enableDisableFieldsMap.forEach((fieldValue, fieldKey) => excludedFields.includes(fieldKey) ? this.enableDisableFieldsMap.set(fieldKey, fieldValue) : this.enableDisableFieldsMap.set(fieldKey, value));
    },
    frontEndDateTimeFormat(date) {
      return moment(JSON.stringify(date), 'YYYY-MM-DDTHH:mm:ss').format('YYYY/MM/DD HH:mm:ss a');
    },
    frontEndDateFormat(date) {
      return moment(JSON.stringify(date), 'YYYY-MM-DDTHH:mm:ss').format('YYYY/MM/DD');
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
      return (new DateTimeFormatterBuilder)
        .appendPattern(pattern)
        .toFormatter(ResolverStyle.STRICT);
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
      this.dateOfConfirmation = this.studentCopy.dateOfConfirmation ? this.frontEndDateFormat(this.studentCopy.dateOfConfirmation) : '';
      this.updateDOBLabel(true);
      this.formatPostalCode();
      this.setGradeLabel();
      this.setGenderLabel();
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
      if (key === STUDENT_DETAILS_FIELDS.DOC_TYPE_CODE) {
        this.dateOfConfirmation = this.origStudent[STUDENT_DETAILS_FIELDS.DATE_OF_CONFIRMATION] ? this.frontEndDateFormat(this.origStudent[STUDENT_DETAILS_FIELDS.DATE_OF_CONFIRMATION]) : '';
      } else if (key === STUDENT_DETAILS_FIELDS.DEMOG_CODE && this.studentCopy[key] !== 'C') {
        this.dateOfConfirmation = '';
        this.studentCopy[STUDENT_DETAILS_FIELDS.DOC_TYPE_CODE] = null;
      }
      this.setGradeLabel();
      this.setGenderLabel();
      this.validateForm();
    },
    revertDOBField(value) {
      this.revertField(value);
      this.updateDOBLabel(true);
      this.err.birthDateError = [];
    },
    clearDOBRuleErrors() {
      this.err.birthDateError = [];
    },
    clearFieldError(key) {
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
      }else {
        this.gradeLabel='';
      }
    },
    setGenderLabel(){
      if (this.studentCopy && this.studentCopy.genderCode && this.genders) {
        this.genderLabel = this.genders.filter(it => (it.genderCode === this.studentCopy.genderCode))[0]?.label;
      }else {
        this.genderLabel='';
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
          const dateLong = LocalDate.parse(this.origStudent.dob, formatterLong);
          const dateShort = LocalDate.parse(this.studentCopy.dob, formatterLong);
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
    validateForm(){
      this.parentRefs.studentDetailForm.validate();
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
            const pickList = [STUDENT_DETAILS_FIELDS.LEGAL_FIRST_NAME, STUDENT_DETAILS_FIELDS.LEGAL_LAST_NAME, STUDENT_DETAILS_FIELDS.LEGAL_MIDDLE_NAMES, STUDENT_DETAILS_FIELDS.USUAL_FIRST_NAME, STUDENT_DETAILS_FIELDS.USUAL_LAST_NAME, STUDENT_DETAILS_FIELDS.USUAL_MIDDLE_NAMES, STUDENT_DETAILS_FIELDS.DOB, STUDENT_DETAILS_FIELDS.GENDER_CODE];
            const studentValidationPayload = cloneDeep(pick(this.studentCopy, pickList));
            studentValidationPayload.dob = studentValidationPayload.dob.replace(/\D/g, '');
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
    prepPutDigitalID(digitalID) {
      return {
        digitalIdentity: digitalID
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
    getDocumentTypes() {
      const docTypes = [];
      if (this.documentTypeCodes) {
        for (const element of this.documentTypeCodes) {
          const item = {
            value: element.documentTypeCode,
            text: element.label
          };
          docTypes.push(item);
        }
      }
      return docTypes;
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
      return (!!this.enableDisableFieldsMap.get(fieldName));
    },
    isFieldDisabledWithReadOnly(fieldName) {
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
      this.getDigitalIDData(student.studentID);
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
    getDigitalIDData(studentID) {
      this.loadingDigitalIDData = true;
      ApiService.apiAxios
        .get(Routes.digitalIdentity.DIGITAL_ID_LIST_URL, {params: {studentID}})
        .then(response => {
          let digitalIDResults = response.data.digitalIDResult;
          let digitalParsed = JSON.parse(JSON.stringify(digitalIDResults));
          if(digitalParsed.length > 0){
            this.digitalIdentity = digitalParsed[0];
            this.setCredentialType(digitalParsed[0].identityTypeCode);
          }else{
            this.setCredentialType('None');
          }
        })
        .catch(error => {
          console.log(error);
          this.setFailureAlert('An error occurred while loading the digital identity for this user. Please try again later.');
        })
        .finally(() => {
          this.loadingDigitalIDData = false;
        });
    },
    async unlinkStudent() {
      const confirmation = await this.$refs.confirmedStudentUnlinkConfirmationDialog.open(null, null,
        {color: '#fff', width: 580, closeIcon: true, subtitle: false, dark: false, resolveText: 'Yes'});
      if (confirmation) {
        const body = this.prepPutDigitalID(this.digitalIdentity);
        ApiService.apiAxios
          .put(Routes.digitalIdentity.ROOT_ENDPOINT + '/' + this.digitalIdentity.digitalID, body)
          .then(() => {
            this.digitalIDType = '';
            this.setCredentialType('None');
            this.setSuccessAlert('Student has been successfully unlinked.');
          })
          .catch(error => {
            console.log(error);
            this.setFailureAlert('An error occurred while unlinking the digital identity for this user. Please try again later.');
          });
      }
    },
    disableDemerge() {
      if (this.isProcessing || this.demergeSagaComplete || this.hasSagaInProgress(this.origStudent) || this.fullReadOnly) {
        return true;
      }
      return !(this.origStudent.statusCode === 'M' && !!this.origStudent.trueStudentID);
    },
    setCredentialType(value) {
      if(value === 'BASIC'){
        this.digitalIDType = 'Basic BCeID';
      } else if(value === 'BCSC'){
        this.digitalIDType = 'BC Services Card';
      } else {
        this.digitalIDType = 'None';
      }
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
    },
    validateDemogCode() {
      if (this.studentCopy[STUDENT_DETAILS_FIELDS.DEMOG_CODE] === 'C' && !this.studentCopy[STUDENT_DETAILS_FIELDS.DOC_TYPE_CODE]) {
        return ['Required for Confirmed Demog Code.'];
      }
      return [];
    },
    async updateDOC() {
      this.saveStudentLoading = true;
      try {
        const params = {
          penNumbersInOps: this.origStudent.pen
        };
        this.isStudentUpdatedInDifferentTab = false; //make sure that notification for current tab is ignored.
        const body = this.prepPut(this.studentCopy);
        body.isDateOfConfirmationChanged = true;
        const studentResponse = await ApiService.apiAxios.put(Routes['student'].ROOT_ENDPOINT + '/' + this.studentID, body, {params});
        this.fieldNames.forEach(value => this.enableDisableFieldsMap.set(value, false)); // enable all the fields here, required fields to be disabled will be done in this.setStudent method.
        this.setStudent(studentResponse.data);
        this.$emit('update:student', studentResponse.data);
        this.setSuccessAlert('Student data updated successfully.');
      } catch (e) {
        console.error(e);
        this.processSaveStudentError(e);
      } finally {
        this.saveStudentLoading = false;
      }
    }
  },

};
</script>
<style scoped>
.topMenu {
  display: flex;
  align-items: center;
  justify-content: center;
}

.revertValue{
  cursor: pointer !important;
  color: #1a5a96 !important;
  font-weight: bolder !important;
}

.revertValue :deep(.v-field__input){
  cursor: pointer;
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
.gender-drop-down-fixed{
  margin-left: 0.8em;
}
.grade-drop-down-fixed{
  margin-left: 0.8em;
}
</style>
