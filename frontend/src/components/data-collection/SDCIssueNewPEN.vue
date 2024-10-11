<template>
  <v-card v-if="isLoadingMatches">
    <v-card-text>
      <Spinner
        :flat="true"
      />
    </v-card-text>
  </v-card>
  <div v-else>
    <v-card>
      <v-card-title>
        <span>PEN Match</span>
      </v-card-title>
      <v-card-text>
        <div
          ref="topDiv"
        >
          <v-row>
            <v-col
              class="pt-0"
              cols="12"
            >
              <v-form
                ref="studentDetailsForm"
                v-model="studentDetailsFormValid"
              >
                <v-row>
                  <v-col cols="12">
                    <v-row class="mt-4">
                      <v-col>
                        <v-text-field
                          id="legalLastName"
                          v-model="sdcStudent.legalLastName"
                          label="Legal Surname"
                          variant="underlined"
                          :rules="[rules.required()]"
                          :maxlength="25"
                          :error-messages="err.legalLastNameError"
                          density="compact"
                          @update:model-value="formUpdated"
                        />
                      </v-col>
                      <v-col>
                        <v-text-field
                          id="usualLastName"
                          v-model="sdcStudent.usualLastName"
                          label="Usual Surname"
                          variant="underlined"
                          :maxlength="25"
                          :error-messages="err.usualLastNameError"
                          density="compact"
                          @update:model-value="formUpdated"
                        />
                      </v-col>
                    </v-row>
                    <v-row class="mt-n4">
                      <v-col>
                        <v-text-field
                          id="legalFirstName"
                          v-model="sdcStudent.legalFirstName"
                          label="Legal Given"
                          variant="underlined"
                          :maxlength="25"
                          :error-messages="err.legalFirstNameError"
                          density="compact"
                          @update:model-value="formUpdated"
                        />
                      </v-col>
                      <v-col>
                        <v-text-field
                          id="usualFirstName"
                          v-model="sdcStudent.usualFirstName"
                          label="Usual Given"
                          variant="underlined"
                          :maxlength="25"
                          :error-messages="err.usualFirstNameError"
                          density="compact"
                          @update:model-value="formUpdated"
                        />
                      </v-col>
                    </v-row>
                    <v-row class="mt-n4">
                      <v-col>
                        <v-text-field
                          id="legalMiddleNames"
                          v-model="sdcStudent.legalMiddleNames"
                          label="Legal Middle"
                          variant="underlined"
                          :maxlength="25"
                          :error-messages="err.legalMiddleNamesError"
                          density="compact"
                          @update:model-value="formUpdated"
                        />
                      </v-col>
                      <v-col>
                        <v-text-field
                          id="usualMiddleNames"
                          v-model="sdcStudent.usualMiddleNames"
                          label="Usual Middle"
                          variant="underlined"
                          :maxlength="25"
                          :error-messages="err.usualMiddleNamesError"
                          density="compact"
                          @update:model-value="formUpdated"
                        />
                      </v-col>
                    </v-row>
                    <v-row class="mt-n4">
                      <v-col>
                        <DatePicker
                          id="dobPicker"
                          v-model="sdcStudent.dob"
                          label="Birthdate"
                          style="z-index: 20000"
                          :rules="[rules.required()]"
                          model-type="yyyyMMdd"
                          :error-message="err.birthDateError"
                          density="compact"
                          @update:model-value="formUpdated"
                        />
                      </v-col>
                      <v-col>
                        <v-select
                          id="gender"
                          v-model="sdcStudent.gender"
                          :items="sdcCollection.genderCodes"
                          item-value="genderCode"
                          item-title="dropdownText"
                          label="Gender"
                          variant="underlined"
                          :rules="[rules.required()]"
                          :error-messages="err.genderError"
                          density="compact"
                          @update:model-value="formUpdated"
                        />
                      </v-col>
                    </v-row>
                    <v-row class="mt-n4">
                      <v-col>
                        <v-text-field
                          id="localID"
                          v-model="sdcStudent.localID"
                          label="Local ID"
                          variant="underlined"
                          :maxlength="12"
                          density="compact"
                          @update:model-value="formUpdated"
                        />
                      </v-col>
                      <v-col>
                        <v-select
                          id="enrolledGradeCode"
                          v-model="sdcStudent.enrolledGradeCode"
                          label="Grade"
                          variant="underlined"
                          :items="sdcCollection.enrolledGradeCodes"
                          item-value="enrolledGradeCode"
                          item-title="dropdownText"
                          :rules="[rules.required()]"
                          density="compact"
                          @update:model-value="formUpdated"
                        />
                      </v-col>
                    </v-row>
                    <v-row class="mt-n4">
                      <v-col cols="6">
                        <v-text-field
                          id="postalCode"
                          v-model="sdcStudent.postalCode"
                          label="Postal Code"
                          variant="underlined"
                          :maxlength="6"
                          density="compact"
                          @update:model-value="formUpdated"
                        />
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
              </v-form>
            </v-col>
          </v-row>
        </div>
        
        
      </v-card-text>
      <v-card-actions>
        <div v-if="bestMatchPEN">
          <v-row>
            <v-col>
              <v-alert
                id="collection-submission"
                density="compact"
                type="success"
                variant="tonal"
                :text="newPenText"
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col class="d-flex justify-end">
              <v-btn
                id="saveNewPEN"
                color="#003366"
                variant="elevated"
                text="Update Student"
                :disabled="!bestMatchPEN"
                @click="saveNewPen"
              />
            </v-col>
          </v-row>
        </div>
        

        <v-row v-else>
          <v-col class="d-flex justify-end">
            <v-btn
              id="cancelMatchButton"
              color="#003366"
              text="Cancel"
              variant="outlined"
              @click="cancelClicked"
            />
            <v-btn
              id="generatePEN"
              color="#003366"
              variant="elevated"
              text="Generate PEN"
              :disabled="!studentDetailsFormValid"
              @click="issueNewPEN"
            />
          </v-col>
        </v-row>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script>

import {getDemogValidationResults, constructPenMatchObjectFromSdcStudent} from '../../utils/common';
import {Routes} from '@/utils/constants';
import Spinner from '../common/Spinner.vue';
import alertMixin from '@/mixins/alertMixin';
import ApiService from '@/common/apiService';
import DatePicker from '@/components/util/DatePicker.vue';
import {isValidPEN} from '@/utils/validation';
import * as Rules from '@/utils/institute/formRules';
import {sdcCollectionStore} from '@/store/modules/sdcCollection';
import {mapState} from 'pinia';
import {penRequestBatchStore} from '@/store/modules/penRequestBatch';

export default {
  name: 'SDCIssueNewPEN',
  components: {DatePicker, Spinner},
  mixins: [alertMixin],
  props: {
    sdcStudent: {
      type: Object,
      required: true
    }
  },
  emits: ['cancel', 'saveNewPen'],
  data() {
    return {
      penRules: [v => (!v || isValidPEN(v) || 'Must be a valid PEN')],
      rules: Rules,
      err: {
        usualMiddleNamesError: '',
        usualFirstNameError: '',
        usualLastNameError: '',
        legalMiddleNamesError: '',
        legalFirstNameError: '',
        legalLastNameError: '',
        birthDateError: '',
        genderError: ''
      },
      sdcCollection: sdcCollectionStore(),
      studentDetailsFormValid: false,
      penMatchStatus: null,
      isLoadingMatches: false,
      isSearchingStudent: false,
      showMatchStatus: false,
      showMultiStatus: false,
      showNewStatus: false,
      bestMatchPEN: null,
      newPenText: null,
      newPenDetails: null
    };
  },
  computed: {
    ...mapState(penRequestBatchStore, ['prbValidationIssueTypeCodes'])
  },
  created() {
    penRequestBatchStore().getCodes();
    this.$nextTick().then(this.validateForm);
  },
  methods: {
    cancelClicked(){
      this.$emit('cancel');
    },
    formUpdated(){
      Object.keys(this.err).forEach(key => {
        this.err[key] = '';
      });
    },
    saveNewPen(){
      this.$emit('saveNewPen', this.newPenDetails);
    },
    async issueNewPEN() {
      if (this.$refs.studentDetailsForm.validate()) {
        this.isLoadingMatches = true;
        try {
          const payload = {
            student: {
              ...this.sdcStudent,
              genderCode: this.sdcStudent.gender
            }
          };
          console.log(payload)
          const result = await getDemogValidationResults(payload);
          const onlyErrors = result.filter(el => el.penRequestBatchValidationIssueSeverityCode === 'ERROR');
          let validationIssues = onlyErrors.map(y => {
            y.penRequestBatchValidationIssueTypeCode = this.prbValidationIssueTypeCodes.find(obj => obj.code === y.penRequestBatchValidationIssueTypeCode)?.description || y.penRequestBatchValidationIssueTypeCode;
            return y;
          });
          if (validationIssues?.length > 0) {
            this.err.legalLastNameError = validationIssues.find(el => el.penRequestBatchValidationFieldCode === 'LEGALLAST')?.penRequestBatchValidationIssueTypeCode || '';
            this.err.legalFirstNameError = validationIssues.find(el => el.penRequestBatchValidationFieldCode === 'LEGALFIRST')?.penRequestBatchValidationIssueTypeCode || '';
            this.err.legalMiddleNamesError = validationIssues.find(el => el.penRequestBatchValidationFieldCode === 'LEGALMID')?.penRequestBatchValidationIssueTypeCode || '';
            this.err.usualFirstNameError = validationIssues.find(el => el.penRequestBatchValidationFieldCode === 'USUALFIRST')?.penRequestBatchValidationIssueTypeCode || '';
            this.err.usualLastNameError = validationIssues.find(el => el.penRequestBatchValidationFieldCode === 'USUALLAST')?.penRequestBatchValidationIssueTypeCode || '';
            this.err.usualMiddleNamesError = validationIssues.find(el => el.penRequestBatchValidationFieldCode === 'USUALMID')?.penRequestBatchValidationIssueTypeCode || '';
            this.err.birthDateError = validationIssues.find(el => el.penRequestBatchValidationFieldCode === 'BIRTHDATE')?.penRequestBatchValidationIssueTypeCode || '';
            this.err.genderError = validationIssues.find(el => el.penRequestBatchValidationFieldCode === 'GENDER')?.penRequestBatchValidationIssueTypeCode || '';
          } else {
            // const studentResponse = await ApiService.apiAxios.post(ApiRoutes.studentRequest.ROOT_ENDPOINT + '/sdcSchoolCollection/' + this.sdcStudent.sdcSchoolCollectionID + '/createStudent', payload);
            const studentResponse = await ApiService.apiAxios.post(Routes.student.ROOT_ENDPOINT, payload);
            this.bestMatchPEN = studentResponse.data.pen;
            this.newPenDetails = {
              assignedPen: studentResponse.data.pen,
              assignedstudentId: studentResponse.data.studentID
            }
            this.newPenText = `New PEN: ${this.bestMatchPEN} generated. Please update the student record.`;
          }
        } catch (e) {
          console.error(e);
          this.setFailureAlert('PEN could not be created, Please retry later.');
        } finally {
          this.isLoadingMatches = false;
        }
      }
    },
    validateForm() {
      this.$refs?.studentDetailsForm?.validate();
    }
  }
};
</script>

<style scoped>
:deep(#dobPicker > div.dp__outer_menu_wrap.dp--menu-wrapper > div){
  position: fixed;
}
</style>
