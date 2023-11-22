<template>
  <v-card
    id="authorityStatusVCard"
  >
    <v-form
      ref="authorityStatusForm"
      v-model="isFormValid"
    >
      <v-card-title class="sheetHeader pt-1 pb-1">
        Update Authority Status
      </v-card-title>
      <v-divider />
      <v-card-text>
        <v-row class="pl-3 pr-3 d-flex justify-center">
          <v-col>
            <v-row class="d-flex justify-start">
              <h3>How would you like to update the status?</h3>
            </v-row>
            <v-row class="d-flex justify-start">
              <v-radio-group v-model="action">
                <span v-if="displayOptionsForOpenAuthorityStatus">
                  <v-radio
                    label="Close the Authority"
                    value="setCloseDate"
                  />
                </span>
                <span v-if="displayOptionsForClosingAuthorityStatus">
                  <v-radio
                    label="Open the Authority"
                    value="setOpenDate"
                  />
                  <v-radio
                    label="Update Closing Date"
                    value="updateCloseDate"
                  />
                </span>
                <span v-if="displayOptionsForClosedAuthorityStatus">
                  <v-radio
                    label="Open the Authority"
                    value="setOpenDate"
                  />
                </span>
              </v-radio-group>
            </v-row>
            <v-row class="d-flex justify-start">
              <v-divider class="mt-1" />
            </v-row>
            <v-row
              v-if="action === 'setOpenDate'"
              class="d-flex justify-start"
            >
              <v-col>
                <v-row class="d-flex justify-start">
                  <h3>Select the open date</h3>
                </v-row>
                <v-row>
                  <v-col>
                    <DatePicker
                      id="newOpenDateTextField"
                      v-model="newOpenDate"
                      label="Open Date"
                      :rules="[rules.required(), rules.dateIsPriorOrEqualTo(newOpenDate, currentDate, true,`The open date must occur on or prior to ${currentDateFormatted}.`)]"
                      :max-date="cutOffDate"
                      model-type="yyyy-MM-dd'T'00:00:00"
                      :allow-teleport="true"
                      @update:model-value="validateForm"
                    />
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
            <v-row
              v-if="action === 'setCloseDate' && authorityHasOpenSchools"
              class="pb-0 pt-2"
            >
              <v-col>
                <p>This authority cannot be closed, as there are still open schools under this authority.</p>
                <p>The following schools must be closed or moved to another authority before the authority can be closed.</p>
                <ul class="school-highlight">
                  <li
                    v-for="openSchool in listOfOpenSchoolsByMincode"
                    :key="openSchool.schoolId"
                  >
                    {{
                      openSchool.mincode
                    }} - <a
                      class="details"
                      @click="openSchoolDetailsPage(openSchool.schoolId)"
                    >{{
                      openSchool.displayName
                    }}</a>
                  </li>
                </ul>
                <p>Refresh the page to see an updated list of schools and new update options.</p>
              </v-col>
            </v-row>
            <v-row
              v-if="action === 'setCloseDate' && !authorityHasOpenSchools"
              class="d-flex justify-start"
            >
              <v-col>
                <v-alert
                  v-if="showAlertForFutureClosureDate"
                  color="#003366"
                  density="compact"
                  type="info"
                  class="px-2"
                  variant="tonal"
                >
                  <p class="py-1">
                    Some schools under this authority have closing dates in the future.
                  </p>
                  <p class="py-1">
                    The closing date of the authority must be on or after
                    <strong>{{
                      dateOfLastSchoolClosureFormatted
                    }}</strong>.
                  </p>
                  <p class="py-1">
                    The following schools have close dates in the future:
                  </p>
                  <ul class="school-highlight py-1">
                    <li
                      v-for="closingSchool in listOfClosingSchoolsByMincode"
                      :key="closingSchool.schoolId"
                    >
                      {{
                        closingSchool.mincode
                      }} - <a
                        class="details"
                        @click="openSchoolDetailsPage(closingSchool.schoolId)"
                      >{{
                        closingSchool.displayName
                      }}</a>
                    </li>
                  </ul>
                  <p class="py-1">
                    Refresh the page to see an updated list of schools.
                  </p>
                </v-alert>
                <v-row class="d-flex justify-start mt-3">
                  <h3>Select the closure date</h3>
                </v-row>
                <v-row>
                  <v-col>
                    <DatePicker
                      id="newCloseDateTextField"
                      v-model="newCloseDate"
                      label="Close Date"
                      :rules="[rules.required(),
                               rules.dateIsAfterOrEqualTo(newCloseDate, dateOfLastSchoolClosure, true, `The closure date must occur on or after ${dateOfLastSchoolClosureFormatted}.`),
                               rules.dateIsAfterOrEqualTo(newCloseDate, authorityOpenDate, true, `The closure date must occur on or after ${authorityOpenDateFormatted}.`)]"
                      :min-date="dateOfLastSchoolClosure"
                      :start-date="dateOfLastSchoolClosure"
                      model-type="yyyy-MM-dd'T'00:00:00"
                      :allow-teleport="true"
                      @update:model-value="validateForm"
                    />
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
            <v-row
              v-if="action === 'updateCloseDate'"
              class="d-flex justify-start"
            >
              <v-col>
                <v-alert
                  v-if="showAlertForFutureClosureDate"
                  color="#003366"
                  density="compact"
                  type="info"
                  class="px-2"
                  variant="tonal"
                >
                  <p>Some schools under this authority have closing dates in the future.</p>
                  <p>
                    The closing date of the authority must be on or after
                    <strong>{{
                      dateOfLastSchoolClosureFormatted
                    }}</strong>.
                  </p>
                  <p>The following schools have close dates in the future:</p>
                  <ul class="school-highlight pb-2">
                    <li
                      v-for="closingSchool in listOfClosingSchoolsByMincode"
                      :key="closingSchool.schoolId"
                    >
                      {{
                        closingSchool.mincode
                      }} - <a
                        class="details"
                        @click="openSchoolDetailsPage(closingSchool.schoolId)"
                      >{{
                        closingSchool.displayName
                      }}</a>
                    </li>
                  </ul>
                  <p>Refresh the page to see an updated list of schools.</p>
                </v-alert>
                <v-row class="d-flex justify-start mt-3">
                  <h3>Select the new closing date</h3>
                </v-row>
                <v-row>
                  <v-col>
                    <DatePicker
                      id="updatedCloseDateTextField"
                      v-model="updatedCloseDate"
                      label="Close Date"
                      :rules="[rules.required(),
                               rules.dateIsAfterOrEqualTo(updatedCloseDate, dateOfLastSchoolClosure, true, `The closure date must occur on or after ${dateOfLastSchoolClosureFormatted}.`),
                               rules.dateIsAfterOrEqualTo(updatedCloseDate, authorityOpenDate, true, `The closure date must occur on or after ${authorityOpenDateFormatted}.`)]"
                      :min-date="dateOfLastSchoolClosure"
                      model-type="yyyy-MM-dd'T'00:00:00"
                      :allow-teleport="true"
                      @update:model-value="validateForm"
                    />
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions class="justify-end">
        <PrimaryButton
          id="cancelNewContactBtn"
          secondary
          text="Cancel"
          @click-action="closeEditAuthorityStatus"
        />
        <PrimaryButton
          id="newContactPostBtn"
          text="Okay"
          width="7rem"
          :disabled="!isFormValid"
          :loading="processing"
          @click-action="updateAuthorityDates"
        />
      </v-card-actions>
    </v-form>
  </v-card>
</template>

<script>
import PrimaryButton from '../util/PrimaryButton.vue';
import alertMixin from '@/mixins/alertMixin';
import * as Rules from '@/utils/institute/formRules';
import {formatDate, formatDisplayDate} from '@/utils/format';
import {DateTimeFormatter, LocalDate, LocalDateTime} from '@js-joda/core';
import DatePicker from '@/components/util/DatePicker.vue';

export default {
  name: 'AuthorityStatus',
  components: {
    DatePicker,
    PrimaryButton,
  },
  mixins: [alertMixin],
  props: {
    authorityOpenDate: {
      type: String,
      required: false,
      default: ''
    },
    authorityCloseDate: {
      type: String,
      required: false,
      default: ''
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
      required: false,
      default: ''
    },
    listOfOpenSchools: {
      type: Array,
      required: false,
      default: () => []
    },
    listOfClosingSchools: {
      type: Array,
      required: false,
      default: () => []
    }
  },
  emits: [
    'authorityStatus:closeEditAuthorityStatusPage',
    'updateAuthorityDates'
  ],
  data() {
    let currentLocalDate = LocalDate.now();
    return {
      currentDate: currentLocalDate.toString(),
      cutOffDate: currentLocalDate.plusDays(1).toString(),
      isFormValid: false,
      processing: false,
      rules: Rules,
      action: this.defaultUpdateActionForAuthority(),
      newOpenDate: currentLocalDate.atStartOfDay().format(DateTimeFormatter.ofPattern('yyyy-MM-dd\'T\'HH:mm:ss')),
      newCloseDate: null,
      updatedCloseDate: this.authorityCloseDate
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
      return this.formatDate(this.dateOfLastSchoolClosure);
    },
    showAlertForFutureClosureDate() {
      if (!this.dateOfLastSchoolClosure) {
        return false;
      }
      return LocalDateTime.now().isBefore(LocalDateTime.parse(this.dateOfLastSchoolClosure));
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
  mounted() {
    this.validateForm();
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
          openedDate: this.newOpenDate,
          closedDate: null,
        };
        break;
      case 'setCloseDate':
        updatedAuthorityDates = {
          openedDate: this.authorityOpenDate,
          closedDate: this.newCloseDate
        };
        break;
      case 'updateCloseDate':
        updatedAuthorityDates = {
          openedDate: this.authorityOpenDate,
          closedDate: this.updatedCloseDate,
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
      const route = this.$router.resolve({name: 'schoolDetails', params: {schoolID: schoolID}});
      window.open(route.href, '_blank');
    },
    resetForm() {
      this.$refs.authorityStatusForm.reset();
    },
    async validateForm() {
      const isValid = await this.$refs.authorityStatusForm.validate();
      this.isFormValid = isValid.valid;
    },
    formatDate,
    formatDisplayDate
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

.details {
    color: rgb(0, 51, 102);
}

.details:hover {
    text-decoration: underline;
}

.school-highlight {
  color: #003366;
  padding: revert;
}
</style>
