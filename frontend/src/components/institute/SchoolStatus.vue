<template>
  <v-card
      id="schoolStatusVCard">
    <v-form ref="schoolStatusForm" v-model="isFormValid">
    <v-card-title class="sheetHeader pt-1 pb-1">Update School Status</v-card-title>
    <v-divider></v-divider>
    <v-card-text>
        <v-row class="pl-3 pr-3 d-flex justify-center">
          <v-col >
            <v-row class="d-flex justify-start">
              <h3>How would you like to update the status?</h3>
            </v-row>
            <v-row  class="d-flex justify-start" v-if="displayOptionsForOpeningSchoolStatus()">
              <v-radio-group v-model="openingSchool">
                <v-radio label="Cancel Opening"
                         value="cancel">
                </v-radio>
                <v-radio label="Update Open Date"
                         value="update">
                </v-radio>
              </v-radio-group>
            </v-row>
            <v-row class="d-flex justify-start">
              <v-divider class="mt-1"></v-divider>
            </v-row>
            <v-row  v-if="displayCancelOpeningDatePanel()"  class="pb-0 pt-2">
              <span> Cancelling the school's opening will remove the schools open date.</span>
            </v-row>
            <v-row class="d-flex justify-start" v-if="displayUpdateOpeningDatePanel()">
              <v-col>
                <v-row class="d-flex justify-start">
                  <h3>Select the new open date</h3>
                </v-row>
                <v-row>
                  <v-col>
                    <v-menu
                      id="schoolStatusOpenDatePicker"
                      ref="schoolStatusOpenDateFilter"
                      :close-on-content-click="false"
                      transition="scale-transition"
                      offset-y
                      min-width="auto"
                    >
                      <template v-slot:activator="{ on, attrs }">
                        <v-text-field
                          id="schoolStatusOpenDateTextField"
                          :rules="[rules.required()]"
                          class="pt-0 mt-0"
                          v-model="openDateFormatted"
                          label="Open Date"
                          prepend-inner-icon="mdi-calendar"
                          clearable
                          readonly
                          v-bind="attrs"
                          v-on="on"
                          @click="openDate = parseDate(openDateFormatted)"
                        ></v-text-field>
                      </template>
                      <v-date-picker
                        v-model="openDate"
                        @change="saveOpenDate"
                      ></v-date-picker>
                    </v-menu>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
    </v-card-text>
    <v-card-actions class="justify-end">
      <PrimaryButton id="cancelNewContactBtn" secondary text="Cancel" @click.native="closeEditSchoolStatus"></PrimaryButton>
      <PrimaryButton id="newContactPostBtn" text="Okay" width="7rem" @click.native="updateSchoolDates" :disabled="!isFormValid" :loading="processing"></PrimaryButton>
    </v-card-actions>
    </v-form>
  </v-card>
</template>

<script>
import PrimaryButton from '../util/PrimaryButton';
import {mapGetters} from 'vuex';
import alertMixin from '@/mixins/alertMixin';
import * as Rules from '@/utils/institute/formRules';
import {isNumber} from '@/utils/institute/formInput';
import {formatDate} from '@/utils/format';

export default {
  name: 'SchoolStatus',
  mixins: [alertMixin],
  props: {
    schoolOpenDate: {
      type: String,
      required: false
    },
    schoolCloseDate: {
      type: String,
      required: false
    },
    schoolStatus: {
      type: String,
      required: true
    },
  },
  components: {
    PrimaryButton,
  },
  mounted() {
    this.validateForm();
  },
  data() {
    return {
      isFormValid: false,
      processing: false,
      rules: Rules,
      endDate:null,
      openingSchool:'cancel',
      openDateFormatted: formatDate(this.schoolOpenDate),
      openDate: this.parseDate(this.openDateFormatted),
    };
  },
  computed: {
    ...mapGetters('auth', ['isAuthenticated','userInfo']),
  },
  methods: {
    displayUpdateOpeningDatePanel(){
      return this.openingSchool === 'update';
    },
    displayCancelOpeningDatePanel(){
      return this.openingSchool === 'cancel';
    },
    displayOptionsForOpeningSchoolStatus(){
      return this.schoolStatus === 'Opening';
    },
    saveOpenDate(date) {
      this.$refs.schoolStatusOpenDateFilter.save(date);
    },

    closeEditSchoolStatus() {
      this.resetForm();
      this.$emit('schoolStatus:closeEditSchoolStatusPage');
    },
    cancel() {
      this.resetForm();
      this.$emit('schoolStatus:closeEditSchoolStatusPage');
    },
    updateSchoolDates(){
      let updatedSchoolDates = {};
      if(this.displayCancelOpeningDatePanel()){
        updatedSchoolDates = {
          openedDate: null,
          closedDate: null,
        };
      }else if(this.displayUpdateOpeningDatePanel()){
        updatedSchoolDates = {
          openedDate: this.openDateFormatted,
          closedDate: this.endDate
        };
      }
      this.$emit('updateSchoolDates', updatedSchoolDates);
      this.resetForm();
      this.$emit('schoolStatus:closeEditSchoolStatusPage');
    },
    resetForm() {
      this.$refs.schoolStatusForm.reset();
    },
    validateForm() {
      this.isFormValid = this.$refs.schoolStatusForm.validate();
    },
    isNumber,
    formatDate,
    formatDisplayDate (date) {
      if (!date) return null;
      const [year, month, day] = date.split('-');
      return `${year}/${month}/${day}`;
    },
    parseDate (date) {
      if (!date) return null;
      const [year, month, day] = date.split('/');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    },
  },
  watch: {
    //watching effective date to valid form because we need to cross validate expiry and effective date fields
    'openDate': {
      handler() {
        this.openDateFormatted = this.formatDisplayDate(this.openDate);
        this.validateForm();
      }
    }

  }
};
</script>

<style scoped>
.sheetHeader{
  background-color: #003366;
  color: white;
  font-size: medium !important;
  font-weight: bolder !important;
}


</style>
