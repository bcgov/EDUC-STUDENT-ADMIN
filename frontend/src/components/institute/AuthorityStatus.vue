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
                  <h3>Select the open date</h3>
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
                      <template #activator="{ on, attrs }">
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
                        ></v-text-field>
                      </template>
                      <v-date-picker
                          v-model="newOpenDate"
                          :max="currentDate"
                          @update:model-value="saveNewOpenDate"
                      ></v-date-picker>
                    </v-menu>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
            <v-row class="pb-0 pt-2" v-if="action === 'setCloseDate' && authorityHasOpenSchools">
              <v-col>
                <p>This authority cannot be closed, as there are still open schools under this authority.</p>
                <p>The schools must be closed or moved to another authority before the authority can be closed.</p>
                <ul class="school-highlight pb-2">
                  <li v-for="openSchool in listOfOpenSchoolsByMincode" :key="openSchool.schoolId">
                    {{openSchool.mincode}} - <a class="details" @click="openSchoolDetailsPage(openSchool.schoolId)">{{openSchool.displayName}}</a>
                  </li>
                </ul>
                <p>Refresh the page to see an updated list and options</p>
              </v-col> 
            </v-row>
            <v-row class="d-flex justify-start" v-if="action === 'setCloseDate' && !authorityHasOpenSchools">
              <v-col>
                <v-alert v-if="showAlertForFutureClosureDate" color="#003366" density="compact" text type="info">
                  <p>Some schools under this authority have closing dates in the future.</p>
                  <p>The closing date of the authority must be on or after <strong>{{dateOfLastSchoolClosureFormatted}}</strong>.</p>
                  <p>The following schools have close dates in the future:</p>
                  <ul class="school-highlight pb-2">
                    <li v-for="closingSchool in listOfClosingSchoolsByMincode" :key="closingSchool.schoolId">
                      {{closingSchool.mincode}} - <a class="details" @click="openSchoolDetailsPage(closingSchool.schoolId)">{{closingSchool.displayName}}</a>
                    </li>
                  </ul>
                  <p>Refresh the page to see an updated list of schools.</p>
                </v-alert>
                <v-row class="d-flex justify-start">
                  <h3>Select the closure date</h3>
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
                      <template #activator="{ on, attrs }">
                        <v-text-field
                            id="newCloseDateTextField"
                            :rules="[rules.required(),
                             rules.dateIsAfterOrEqualTo(newCloseDate, dateOfLastSchoolClosure, true, `The closure date must occur on or after ${dateOfLastSchoolClosureFormatted}.`),
                             rules.dateIsAfterOrEqualTo(newCloseDate, authorityOpenDate, true, `The closure date must occur on or after ${authorityOpenDateFormatted}.`)]"
                            class="pt-0 mt-0"
                            v-model="newCloseDateFormatted"
                            label="Close Date"
                            prepend-inner-icon="mdi-calendar"
                            clearable
                            readonly
                            v-bind="attrs"
                        ></v-text-field>
                      </template>
                      <v-date-picker
                          v-model="newCloseDate"
                          :min="dateOfLastSchoolClosure"
                          :show-current="dateOfLastSchoolClosure"
                          @update:model-value="saveNewCloseDate"
                      ></v-date-picker>
                    </v-menu>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
            <v-row class="d-flex justify-start" v-if="action === 'updateCloseDate'">
              <v-col>
                <v-alert v-if="showAlertForFutureClosureDate" color="#003366" density="compact" text type="info">
                  <p>Some schools under this authority have closing dates in the future.</p>
                  <p>The closing date of the authority must be on or after <strong>{{dateOfLastSchoolClosureFormatted}}</strong>.</p>
                  <p>The following schools have close dates in the future:</p>
                  <ul class="school-highlight pb-2">
                    <li v-for="closingSchool in listOfClosingSchoolsByMincode" :key="closingSchool.schoolId">
                      {{closingSchool.mincode}} - <a class="details" @click="openSchoolDetailsPage(closingSchool.schoolId)">{{closingSchool.displayName}}</a>
                    </li>
                  </ul>
                  <p>Refresh the page to see an updated list of schools.</p>
                </v-alert>
                <v-row class="d-flex justify-start">
                  <h3>Select the new closing date</h3>
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
                      <template #activator="{ on, attrs }">
                        <v-text-field
                            id="updatedCloseDateTextField"
                            :rules="[rules.required(),
                             rules.dateIsAfterOrEqualTo(updatedCloseDate, dateOfLastSchoolClosure, true, `The closure date must occur on or after ${dateOfLastSchoolClosureFormatted}.`),
                             rules.dateIsAfterOrEqualTo(updatedCloseDate, authorityOpenDate, true, `The closure date must occur on or after ${authorityOpenDateFormatted}.`)]"
                            class="pt-0 mt-0"
                            v-model="updatedCloseDateFormatted"
                            label="Close Date"
                            prepend-inner-icon="mdi-calendar"
                            clearable
                            readonly
                            v-bind="attrs"
                        ></v-text-field>
                      </template>
                      <v-date-picker
                          v-model="updatedCloseDate"
                          :min="dateOfLastSchoolClosure"
                          @update:model-value="saveUpdatedCloseDate"
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
      <PrimaryButton id="cancelNewContactBtn" secondary text="Cancel" :click-action="closeEditAuthorityStatus"></PrimaryButton>
      <PrimaryButton id="newContactPostBtn" text="Okay" width="7rem" :click-action="updateAuthorityDates" :disabled="!isFormValid" :loading="processing"></PrimaryButton>
    </v-card-actions>
    </v-form>
  </v-card>
</template>

<script>
import PrimaryButton from '../util/PrimaryButton.vue';
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
    },
    listOfOpenSchools: {
      type: Array,
      required: false
    },
    listOfClosingSchools: {
      type: Array,
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
    let currentLocalDate = LocalDate.now().toString();
    return {
      currentDate: currentLocalDate,
      isFormValid: false,
      processing: false,
      rules: Rules,
      action: this.defaultUpdateActionForAuthority(),
      newOpenDate: currentLocalDate,
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
    authorityOpenDateFormatted() {
      if (!this.authorityOpenDate) {
        return '';
      }
      return this.formatDate(this.authorityOpenDate);
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
    },
    listOfOpenSchoolsByMincode() {
      return [...this.listOfOpenSchools].sort((schoolA, schoolB) => {
        return schoolA.mincode.localeCompare(schoolB.mincode);
      });
    },
    listOfClosingSchoolsByMincode() {
      return [...this.listOfClosingSchools].sort((schoolA, schoolB) => {
        return schoolA.mincode.localeCompare(schoolB.mincode);
      });
    },
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
    openSchoolDetailsPage(schoolID) {
      const route = this.$router.resolve({ name: 'schoolDetails', params: {schoolID: schoolID}});
      window.open(route.href, '_blank');
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
.details {
  color: rgb(0, 51, 102);
}

.details:hover {
  text-decoration: underline;
}

.school-highlight {
  color: #003366;
}
</style>
