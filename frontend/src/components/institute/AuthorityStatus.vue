<template>
  <v-card
      id="authorityStatusVCard">
    <v-form ref="authorityStatusForm" v-model="isFormValid">
    <v-card-title class="sheetHeader pt-1 pb-1">Update Authority Status</v-card-title>
    <v-divider></v-divider>
    <v-card-text>
        <v-row class="pl-3 pr-3 d-flex justify-center">
          <v-col >
            <v-row class="d-flex justify-start">
              <h3>How would you like to update the status?</h3>
            </v-row>
            <v-row  class="d-flex justify-start">
              <v-radio-group v-model="action">
                <span v-if="displayOptionsForOpenAuthorityStatus">
                  <v-radio label="Close the Authority"
                           value="setCloseDate">
                  </v-radio>
                </span>
                <span v-if="displayOptionsForClosingAuthorityStatus">
                  <v-radio label="Open the Authority"
                           value="setOpenDate">
                  </v-radio>
                  <v-radio label="Update Closing Date"
                           value="updateCloseDate">
                  </v-radio>
                </span>
                <span v-if="displayOptionsForClosedAuthorityStatus">
                  <v-radio label="Open the Authority"
                           value="setOpenDate">
                  </v-radio>
                </span>
              </v-radio-group>
            </v-row>
            <v-row class="d-flex justify-start">
              <v-divider class="mt-1"></v-divider>
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
                            :rules="[rules.required(), rules.dateIsPriorOrEqualTo(newOpenDate, currentDate, `The open date must occur on or prior to ${currentDateFormatted}.`)]"
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
                          :max="currentDate"
                          @change="saveNewOpenDate"
                      ></v-date-picker>
                    </v-menu>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
            <v-row class="pb-0 pt-2" v-if="action === 'setCloseDate' && authorityHasOpenSchools">
              <span>This authority cannot be closed, as there are still open schools under this authority. The schools must be closed, before the authority can be closed.</span>
            </v-row>
            <v-row class="d-flex justify-start" v-if="action === 'setCloseDate' && !authorityHasOpenSchools">
              <v-col>
                <v-alert v-if="showAlertForFutureClosureDate" color="#003366" dense text type="info">
                  <p>Some schools under this authority have closing dates in the future.</p>
                  <p>The closing date of the authority must be on or after <strong>{{dateOfLastSchoolClosureFormatted}}</strong>.</p>
                </v-alert>
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
                            :rules="[rules.required(), rules.dateIsAfterOrEqualTo(newCloseDate, dateOfLastSchoolClosure, true, `The closure date must occur on or after ${dateOfLastSchoolClosureFormatted}.`)]"
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
                          :min="dateOfLastSchoolClosure"
                          @change="saveNewCloseDate"
                      ></v-date-picker>
                    </v-menu>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
            <v-row class="d-flex justify-start" v-if="action === 'updateCloseDate'">
              <v-col>
                <v-alert v-if="showAlertForFutureClosureDate" color="#003366" dense text type="info">
                  <p>Some schools under this authority have closing dates in the future.</p>
                  <p>The closing date of the authority must be on or after <strong>{{dateOfLastSchoolClosureFormatted}}</strong>.</p>
                </v-alert>
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
                            :rules="[rules.required(), rules.dateIsAfterOrEqualTo(updatedCloseDate, dateOfLastSchoolClosure, true, `The closure date must occur on or after ${dateOfLastSchoolClosureFormatted}.`)]"
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
                          :min="dateOfLastSchoolClosure"
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
      <PrimaryButton id="cancelNewContactBtn" secondary text="Cancel" @click.native="closeEditAuthorityStatus"></PrimaryButton>
      <PrimaryButton id="newContactPostBtn" text="Okay" width="7rem" @click.native="updateAuthorityDates" :disabled="!isFormValid" :loading="processing"></PrimaryButton>
    </v-card-actions>
    </v-form>
  </v-card>
</template>

<script>
import PrimaryButton from '../util/PrimaryButton';
import alertMixin from '@/mixins/alertMixin';
import * as Rules from '@/utils/institute/formRules';
import {formatDate, formatDisplayDate} from '@/utils/format';
import {parseDate} from '@/utils/dateHelpers';
import {LocalDate} from '@js-joda/core';

export default {
  name: 'AuthorityStatus',
  mixins: [alertMixin],
  props: {
    authorityOpenDate: {
      type: String,
      required: false
    },
    authorityCloseDate: {
      type: String,
      required: false
    },
    authorityStatus: {
      type: String,
      required: true
    },
    authorityHasOpenSchools: {
      type: Boolean,
      required: true
    },
    dateOfLastSchoolClosure: {
      type: String,
      required: false
    }
  },
  components: {
    PrimaryButton,
  },
  mounted() {
    this.validateForm();
  },
  data() {
    return {
      currentDate: LocalDate.now().toString(),
      isFormValid: false,
      processing: false,
      rules: Rules,
      action: this.defaultUpdateActionForAuthority(),
      newOpenDate: this.currentDate,
      newCloseDate: null,
      updatedCloseDate: this.parseDate(formatDate(this.authorityCloseDate))
    };
  },
  computed: {
    displayOptionsForOpenAuthorityStatus() {
      return this.authorityStatus === 'Open';
    },
    displayOptionsForClosingAuthorityStatus() {
      return this.authorityStatus === 'Closing';
    },
    displayOptionsForClosedAuthorityStatus() {
      return this.authorityStatus === 'Closed';
    },
    currentDateFormatted() {
      return this.formatDisplayDate(this.currentDate);
    },
    dateOfLastSchoolClosureFormatted() {
      if (!this.dateOfLastSchoolClosure) {
        return '';
      }
      return this.formatDisplayDate(this.dateOfLastSchoolClosure);
    },
    showAlertForFutureClosureDate() {
      if (!this.dateOfLastSchoolClosure) {
        return false;
      }
      return LocalDate.now().isBefore(LocalDate.parse(this.dateOfLastSchoolClosure));
    },
    newOpenDateFormatted: {
      get() {
        return this.formatDisplayDate(this.newOpenDate);
      },
      set(newValue) {
        this.newOpenDate = this.parseDate(newValue);
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
    defaultUpdateActionForAuthority() {
      switch (this.authorityStatus) {
      case 'Open':
        return 'setCloseDate';
      case 'Closing':
      case 'Closed':
        return 'setOpenDate';
      default:
        return '';
      }
    },
    saveNewOpenDate(date) {
      this.$refs.newOpenDateFilter.save(date);
    },
    saveNewCloseDate(date) {
      this.$refs.newCloseDateFilter.save(date);
    },
    saveUpdatedCloseDate(date) {
      this.$refs.updatedCloseDateFilter.save(date);
    },
    closeEditAuthorityStatus() {
      this.resetForm();
      this.$emit('authorityStatus:closeEditAuthorityStatusPage');
    },
    cancel() {
      this.resetForm();
      this.$emit('authorityStatus:closeEditAuthorityStatusPage');
    },
    updateAuthorityDates() {
      let updatedAuthorityDates = {};
      switch (this.action) {
      case 'setOpenDate':
        updatedAuthorityDates = {
          openedDate: this.newOpenDateFormatted,
          closedDate: null,
        };
        break;
      case 'setCloseDate':
        updatedAuthorityDates = {
          openedDate: this.parseDate(formatDate(this.authorityOpenDate)),
          closedDate: this.newCloseDateFormatted
        };
        break;
      case 'updateCloseDate':
        updatedAuthorityDates = {
          openedDate: this.parseDate(formatDate(this.authorityOpenDate)),
          closedDate: this.updatedCloseDateFormatted,
        };
        break;
      default:
        break;
      }
      this.$emit('updateAuthorityDates', updatedAuthorityDates);
      this.resetForm();
      this.$emit('authorityStatus:closeEditAuthorityStatusPage');
    },
    resetForm() {
      this.$refs.authorityStatusForm.reset();
    },
    validateForm() {
      this.isFormValid = this.$refs.authorityStatusForm.validate();
    },
    formatDate,
    formatDisplayDate,
    parseDate
  },
  watch: {
    //watching effective date to valid form because we need to cross validate expiry and effective date fields
    'newOpenDate': {
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
.v-alert__content p:last-child {
  margin-bottom: 0;
}
</style>