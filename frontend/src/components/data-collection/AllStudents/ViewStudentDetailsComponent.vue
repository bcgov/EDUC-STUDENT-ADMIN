<template>
  <v-card
    id="viewStudentCard"
  >
    <v-card-title
      id="viewStudentCardTitle"
      class="sheetHeader pt-1 pb-1"
    >
      <v-row no-gutters>
        <v-col class="d-flex justify-start">
          Edit Student
        </v-col>
        <v-col class="d-flex justify-end">
          <v-btn
            id="cancel"
            color="white"
            text="Close"
            size="30"
            icon="mdi-close"
            variant="tonal"
            @click="cancel"
          />
        </v-col>
      </v-row>
    </v-card-title>
    <v-divider />
    <v-card-text>
      <EditStudent
        :selected-students="selectedStudent"
        :total-students="1"
        :save-event="saveStudent"
        :show-funding-eligibility-detail="showFundingEligibilitySection()"
        @form-validity="isValid"
        @show-issues="cancel"
        @reset-parent="reset()"
        @student-object="setStudentContext"
      >
        <template #eligibility>
          <v-row v-if="studentForEdit?.fte === 0">
            <v-col>
              <span id="fteReason"><b>Reason for FTE of 0:</b> {{ getZeroFteReasonCodes(studentForEdit?.fteZeroReasonCode) }}</span>
            </v-col>
          </v-row>
          <v-row v-if="showFundingEligibilitySection() && studentForEdit">
            <v-col cols="8">
              <span><b>Program Funding Ineligibility:</b></span>
              <br>
              <v-table>
                <thead>
                  <tr>
                    <th
                      id="program"
                      class="text-left"
                    >
                      Program
                    </th>
                    <th
                      id="funding"
                      class="text-left"
                    >
                      Funding Eligible
                    </th>
                    <th
                      id="reasonCode"
                      class="text-left"
                    >
                      Non-Eligibility Reason
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="item in programEligibilityData"
                    :key="item.program"
                  >
                    <td>{{ item.program }}</td>
                    <td>{{ item.fundingEligible }}</td>
                    <td>{{ item.nonEligibilityReason }}</td>
                  </tr>
                </tbody>
              </v-table>
            </v-col>
          </v-row>
        </template>
      </EditStudent>
    </v-card-text>
  </v-card>
</template>

<script>
import alertMixin from '../../../mixins/alertMixin';
import EditStudent from './EditStudent.vue';
import {sdcCollectionStore} from '@/store/modules/sdcCollection';
import {mapState} from 'pinia';

export default {
  name: 'ViewStudentDetailsComponent',
  components: {
    EditStudent
  },
  mixins: [alertMixin],
  props: {
    selectedStudentIds: {
      type: Array,
      required: true,
      default: null,
    }
  },
  emits: ['close'],
  data() {
    return {
      selectedStudent: [],
      studentDetailsFormValid: true,
      saveStudent: false,
      studentForEdit: {},
      programEligibilityData: []
    };
  },
  created() {
    this.selectedStudent.splice(0);
    this.selectedStudent.push(this.selectedStudentIds);
  },
  computed: {
    ...mapState(sdcCollectionStore, ['schoolCollection', 'districtCollection']),
  },
  mounted() {

  },
  methods: {
    setStudentContext($event) {
      this.studentForEdit = $event;
      this.setProgramEligibility();
    },
    save() {
      this.saveStudent =true;
      this.programEligibilityData.splice(0);
    },
    cancel() {
      this.$emit('close');
    },
    isValid($event) {
      this.studentDetailsFormValid = $event;
    },
    reset() {
      this.saveStudent =false;
      this.programEligibilityData.splice(0);
    },
    showFundingEligibilitySection() {
      return (this.studentForEdit?.careerProgramNonEligReasonCode !== null && this.studentForEdit?.careerProgramNonEligReasonCode !== 'NTENRCAREE')
          || (this.studentForEdit?.frenchProgramNonEligReasonCode !== null && this.studentForEdit?.frenchProgramNonEligReasonCode !== 'NTENRFRENC')
          || (this.studentForEdit?.indigenousSupportProgramNonEligReasonCode !== null && this.studentForEdit?.indigenousSupportProgramNonEligReasonCode !== 'NTENRINDIG')
          || (this.studentForEdit?.specialEducationNonEligReasonCode !== null && this.studentForEdit?.specialEducationNonEligReasonCode !== 'NTENRSPED')
          || (this.studentForEdit?.ellNonEligReasonCode !== null && this.studentForEdit?.ellNonEligReasonCode !== 'NTENRELL');
    },
    getProgramEligibiltyTypeCodesDescription(key){
      return sdcCollectionStore().programEligibilityCodesMap.get(key)?.message;
    },
    getZeroFteReasonCodes(key){
      return sdcCollectionStore().zeroFteReasonCodesMap.get(key)?.message;
    },
    setProgramEligibility() {
      this.programEligibilityData = [];

      //french row
      let frenchRow = {};
      frenchRow.program = 'French Programs';
      frenchRow.fundingEligible = this.studentForEdit?.frenchProgramNonEligReasonCode !== null ? 'No': 'Yes';
      frenchRow.nonEligibilityReason = this.getProgramEligibiltyTypeCodesDescription(this.studentForEdit?.frenchProgramNonEligReasonCode);

      let careerRow = {};
      //career row
      careerRow.program = 'Career Programs';
      careerRow.fundingEligible = this.studentForEdit?.careerProgramNonEligReasonCode !== null ? 'No': 'Yes';
      careerRow.nonEligibilityReason = this.getProgramEligibiltyTypeCodesDescription(this.studentForEdit?.careerProgramNonEligReasonCode);

      //Indigenous row
      let indRow = {};
      indRow.program = 'Indigenous Support Programs';
      indRow.fundingEligible = this.studentForEdit?.indigenousSupportProgramNonEligReasonCode !== null ? 'No': 'Yes';
      indRow.nonEligibilityReason = this.getProgramEligibiltyTypeCodesDescription(this.studentForEdit?.indigenousSupportProgramNonEligReasonCode);

      //sped row
      let spedRow = {};
      spedRow.program = 'Special Education';
      spedRow.fundingEligible = this.studentForEdit?.specialEducationNonEligReasonCode !== null ? 'No': 'Yes';
      spedRow.nonEligibilityReason = this.getProgramEligibiltyTypeCodesDescription(this.studentForEdit?.specialEducationNonEligReasonCode);

      //ell row
      let ellRow = {};
      ellRow.program = 'English Language Learning';
      ellRow.fundingEligible = this.studentForEdit?.ellNonEligReasonCode !== null ? 'No': 'Yes';
      ellRow.nonEligibilityReason = this.getProgramEligibiltyTypeCodesDescription(this.studentForEdit?.ellNonEligReasonCode);

      this.programEligibilityData.push(frenchRow);
      this.programEligibilityData.push(careerRow);
      this.programEligibilityData.push(indRow);
      this.programEligibilityData.push(spedRow);
      this.programEligibilityData.push(ellRow);
    }
  }
};
</script>

<style scoped>
.sheetHeader {
  background-color: #003366;
  color: white;
  font-size: medium !important;
  font-weight: bolder !important;
}

.headerVal{
  color: #7f7f7f;
}
</style>

