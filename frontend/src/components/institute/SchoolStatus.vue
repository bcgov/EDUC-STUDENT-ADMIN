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
            <v-row  class="d-flex justify-start">
              <v-radio-group v-model="action">
                <span v-if="displayOptionsForOpeningSchoolStatus">
                  <v-radio label="Cancel Opening"
                           value="cancelOpening">
                  </v-radio>
                  <v-radio label="Update Open Date"
                           value="updateOpenDate">
                  </v-radio>
                </span>
                <span v-if="displayOptionsForOpenSchoolStatus">
                  <v-radio label="Close"
                           value="setCloseDate">
                  </v-radio>
                </span>
                <span v-if="displayOptionsForClosingSchoolStatus">
                  <v-radio label="Open the School"
                           value="setOpenDate">
                  </v-radio>
                  <v-radio label="Update Closing Date"
                           value="updateCloseDate">
                  </v-radio>
                </span>
                <span v-if="displayOptionsForClosedSchoolStatus || displayOptionsForNeverOpenedSchoolStatus">
                  <v-radio label="Open the School"
                           value="setOpenDate">
                  </v-radio>
                </span>
              </v-radio-group>
            </v-row>
            <v-row class="d-flex justify-start">
              <v-divider class="mt-1"></v-divider>
            </v-row>
            <v-row  v-if="action === 'cancelOpening'"  class="pb-0 pt-2">
              <span>Cancelling the school's opening will remove the schools open date.</span>
            </v-row>
            <v-row class="d-flex justify-start" v-if="action === 'setOpenDate'">
              <v-col>
                <v-row class="d-flex justify-start">
                  <h3>Select the new open date</h3>
                </v-row>
                <v-row>
                  <v-col>
                    <v-menu
                        id="newOpenDatePicker"
                        ref="newOpenDateFilter"
                        :close-on-content-click="false"
                        transition="scale-transition"
                        offset-y
                        min-width="auto"
                    >
                      <template v-slot:activator="{ on, attrs }">
                        <v-text-field
                            id="newOpenDateTextField"
                            :rules="[rules.required()]"
                            class="pt-0 mt-0"
                            v-model="newOpenDateFormatted"
                            label="Open Date"
                            prepend-inner-icon="mdi-calendar"
                            clearable
                            readonly
                            v-bind="attrs"
                            v-on="on"
                        ></v-text-field>
                      </template>
                      <v-date-picker
                          v-model="newOpenDate"
                          @change="saveNewOpenDate"
                      ></v-date-picker>
                    </v-menu>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
            <v-row class="d-flex justify-start" v-if="action === 'updateOpenDate'">
              <v-col>
                <v-row class="d-flex justify-start">
                  <h3>Select the open date</h3>
                </v-row>
                <v-row>
                  <v-col>
                    <v-menu
                        id="updatedOpenDatePicker"
                        ref="updatedOpenDateFilter"
                        :close-on-content-click="false"
                        transition="scale-transition"
                        offset-y
                        min-width="auto"
                    >
                      <template v-slot:activator="{ on, attrs }">
                        <v-text-field
                            id="updatedOpenDateTextField"
                            :rules="[rules.required()]"
                            class="pt-0 mt-0"
                            v-model="updatedOpenDateFormatted"
                            label="Open Date"
                            prepend-inner-icon="mdi-calendar"
                            clearable
                            readonly
                            v-bind="attrs"
                            v-on="on"
                        ></v-text-field>
                      </template>
                      <v-date-picker
                          v-model="updatedOpenDate"
                          @change="saveUpdatedOpenDate"
                      ></v-date-picker>
                    </v-menu>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
            <v-row class="d-flex justify-start" v-if="action === 'setCloseDate'">
              <v-col>
                <v-row class="d-flex justify-start">
                  <h3>Select the new closure date</h3>
                </v-row>
                <v-row>
                  <v-col>
                    <v-menu
                        id="newCloseDatePicker"
                        ref="newCloseDateFilter"
                        :close-on-content-click="false"
                        transition="scale-transition"
                        offset-y
                        min-width="auto"
                    >
                      <template v-slot:activator="{ on, attrs }">
                        <v-text-field
                            id="newCloseDateTextField"
                            :rules="[rules.required()]"
                            class="pt-0 mt-0"
                            v-model="newCloseDateFormatted"
                            label="Close Date"
                            prepend-inner-icon="mdi-calendar"
                            clearable
                            readonly
                            v-bind="attrs"
                            v-on="on"
                        ></v-text-field>
                      </template>
                      <v-date-picker
                          v-model="newCloseDate"
                          @change="saveNewCloseDate"
                      ></v-date-picker>
                    </v-menu>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
            <v-row class="d-flex justify-start" v-if="action === 'updateCloseDate'">
              <v-col>
                <v-row class="d-flex justify-start">
                  <h3>Select the closure date</h3>
                </v-row>
                <v-row>
                  <v-col>
                    <v-menu
                        id="updatedCloseDatePicker"
                        ref="updatedCloseDateFilter"
                        :close-on-content-click="false"
                        transition="scale-transition"
                        offset-y
                        min-width="auto"
                    >
                      <template v-slot:activator="{ on, attrs }">
                        <v-text-field
                            id="updatedCloseDateTextField"
                            :rules="[rules.required()]"
                            class="pt-0 mt-0"
                            v-model="updatedCloseDateFormatted"
                            label="Close Date"
                            prepend-inner-icon="mdi-calendar"
                            clearable
                            readonly
                            v-bind="attrs"
                            v-on="on"
                        ></v-text-field>
                      </template>
                      <v-date-picker
                          v-model="updatedCloseDate"
                          @change="saveUpdatedCloseDate"
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
import alertMixin from '@/mixins/alertMixin';
import * as Rules from '@/utils/institute/formRules';
import {isNumber} from '@/utils/institute/formInput';
import {formatDate} from '@/utils/format';
import {findUpcomingDate} from '@/utils/dateHelpers';

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
      action: this.defaultUpdateActionForSchool(),
      newOpenDate: findUpcomingDate(7, 1).toString(),
      updatedOpenDate: this.parseDate(formatDate(this.schoolOpenDate)),
      newCloseDate: findUpcomingDate(6, 30).toString(),
      updatedCloseDate: this.parseDate(formatDate(this.schoolCloseDate))
    };
  },
  computed: {
    displayOptionsForOpeningSchoolStatus() {
      return this.schoolStatus === 'Opening';
    },
    displayOptionsForOpenSchoolStatus() {
      return this.schoolStatus === 'Open';
    },
    displayOptionsForClosingSchoolStatus() {
      return this.schoolStatus === 'Closing';
    },
    displayOptionsForClosedSchoolStatus() {
      return this.schoolStatus === 'Closed';
    },
    displayOptionsForNeverOpenedSchoolStatus() {
      return this.schoolStatus === 'Never Opened';
    },
    newOpenDateFormatted: {
      get() {
        return this.formatDisplayDate(this.newOpenDate);
      },
      set(newValue) {
        this.newOpenDate = this.parseDate(newValue);
      }
    },
    updatedOpenDateFormatted: {
      get() {
        return this.formatDisplayDate(this.updatedOpenDate);
      },
      set(newValue) {
        this.updatedOpenDate = this.parseDate(newValue);
      }
    },
    newCloseDateFormatted: {
      get() {
        return this.formatDisplayDate(this.newCloseDate);
      },
      set(newValue) {
        this.newCloseDate = this.parseDate(newValue);
      }
    },
    updatedCloseDateFormatted: {
      get() {
        return this.formatDisplayDate(this.updatedCloseDate);
      },
      set(newValue) {
        this.updatedCloseDate = this.parseDate(newValue);
      }
    }
  },
  methods: {
    defaultUpdateActionForSchool() {
      switch (this.schoolStatus) {
      case 'Opening':
        return 'cancelOpening';
      case 'Open':
        return 'setCloseDate';
      case 'Closing':
      case 'Closed':
      case 'Never Opened':
        return 'setOpenDate';
      default:
        return '';
      }
    },
    saveNewOpenDate(date) {
      this.$refs.newOpenDateFilter.save(date);
    },
    saveUpdatedOpenDate(date) {
      this.$refs.updatedOpenDateFilter.save(date);
    },
    saveNewCloseDate(date) {
      this.$refs.newCloseDateFilter.save(date);
    },
    saveUpdatedCloseDate(date) {
      this.$refs.updatedCloseDateFilter.save(date);
    },
    closeEditSchoolStatus() {
      this.resetForm();
      this.$emit('schoolStatus:closeEditSchoolStatusPage');
    },
    cancel() {
      this.resetForm();
      this.$emit('schoolStatus:closeEditSchoolStatusPage');
    },
    updateSchoolDates() {
      let updatedSchoolDates = {};
      switch (this.action) {
      case 'cancelOpening':
        updatedSchoolDates = {
          openedDate: null,
          closedDate: null,
        };
        break;
      case 'setOpenDate':
        updatedSchoolDates = {
          openedDate: this.newOpenDateFormatted,
          closedDate: null,
        };
        break;
      case 'updateOpenDate':
        updatedSchoolDates = {
          openedDate: this.updatedOpenDateFormatted,
          closedDate: null,
        };
        break;
      case 'setCloseDate':
        updatedSchoolDates = {
          openedDate: this.parseDate(formatDate(this.schoolOpenDate)),
          closedDate: this.newCloseDateFormatted
        };
        break;
      case 'updateCloseDate':
        updatedSchoolDates = {
          openedDate: this.parseDate(formatDate(this.schoolOpenDate)),
          closedDate: this.updatedCloseDateFormatted,
        };
        break;
      default:
        break;
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
    formatDisplayDate (date) {
      if (!date) return null;
      const [year, month, day] = date.split('-');
      return `${year}/${month}/${day}`;
    },
    parseDate(date) {
      if (!date) return null;
      const [year, month, day] = date.split('/');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    },
    isNumber,
    formatDate
  },
  watch: {
    //watching effective date to valid form because we need to cross validate expiry and effective date fields
    'newOpenDate': {
      handler() {
        this.validateForm();
      }
    },
    'updatedOpenDate': {
      handler() {
        this.validateForm();
      }
    },
    'newCloseDate': {
      handler() {
        this.validateForm();
      }
    },
    'updatedCloseDate': {
      handler() {
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
