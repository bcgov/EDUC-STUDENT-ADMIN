<template>
  <div>
    <v-card v-if="!isSchoolStatusUpdateAllowed">
      <v-card-title class="sheetHeader pt-1 pb-1">
        Update School Status
      </v-card-title>
      <v-divider/>
      <v-card-text>
        <v-row class="d-flex justify-start">
          <v-col>
            <p>The status of this school cannot be updated.</p>
            <p>The school is under an Independent School Authority that is closing or closed.</p>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions class="justify-end">
        <PrimaryButton
          id="newContactPostBtn"
          text="Okay"
          @click-action="cancel"
        />
      </v-card-actions>
    </v-card>

    <v-card
      v-else
      id="schoolStatusVCard"
    >
      <v-form
        ref="schoolStatusForm"
        v-model="isFormValid"
      >
        <v-card-title class="sheetHeader pt-1 pb-1">
          Update School Status
        </v-card-title>
        <v-divider/>
        <v-card-text>
          <v-row class="pl-3 pr-3 d-flex justify-center">
            <v-col>
              <v-row class="d-flex justify-start">
                <h3>How would you like to update the status?</h3>
              </v-row>
              <v-row class="d-flex justify-start pt-2">
                <v-radio-group v-model="action">
                  <span v-if="displayOptionsForOpeningSchoolStatus">
                    <v-radio
                      label="Cancel Opening"
                      value="cancelOpening"
                    />
                    <v-radio
                      label="Update Open Date"
                      value="updateOpenDate"
                    />
                  </span>
                  <span v-if="displayOptionsForOpenSchoolStatus">
                    <v-radio
                      label="Close the School"
                      value="setCloseDate"
                    />
                  </span>
                  <span v-if="displayOptionsForClosingSchoolStatus">
                    <v-radio
                      label="Open the School"
                      value="setOpenDate"
                    />
                    <v-radio
                      label="Update Closing Date"
                      value="updateCloseDate"
                    />
                  </span>
                  <span v-if="displayOptionsForClosedSchoolStatus || displayOptionsForNeverOpenedSchoolStatus">
                    <v-radio
                      label="Open the School"
                      value="setOpenDate"
                    />
                  </span>
                </v-radio-group>
              </v-row>
              <v-row no-gutters class="d-flex justify-start">
                <v-col>
                  <v-divider class="mt-1"/>
                </v-col>
              </v-row>
              <v-row
                v-if="action === 'cancelOpening'"
                class="pb-0 pt-2"
              >
                <span>Cancelling the school's opening will remove the schools open date.</span>
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
                    <v-col cols="4">
                      <DatePicker
                        id="newOpenDateTextField"
                        v-model="newOpenDate"
                        label="Open Date"
                        :rules="[rules.required()]"
                        model-type="yyyy-MM-dd'T'00:00:00"
                        @update:model-value="validateForm"
                        :allowTeleport="true"
                      />
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
              <v-row
                v-if="action === 'updateOpenDate'"
                class="d-flex justify-start"
              >
                <v-col>
                  <v-row class="d-flex justify-start">
                    <h3>Select the open date</h3>
                  </v-row>
                  <v-row>
                    <v-col cols="4">
                      <DatePicker
                        id="updatedOpenDateTextField"
                        v-model="updatedOpenDate"
                        label="Open Date"
                        :rules="[rules.required()]"
                        model-type="yyyy-MM-dd'T'00:00:00"
                        @update:model-value="validateForm"
                        :allowTeleport="true"
                      />
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
              <v-row
                v-if="action === 'setCloseDate'"
                class="d-flex justify-start"
              >
                <v-col>
                  <v-row class="d-flex justify-start">
                    <h3>Select the closure date</h3>
                  </v-row>
                  <v-row>
                    <v-col cols="4">
                      <DatePicker
                        id="newCloseDateTextField"
                        v-model="newCloseDate"
                        label="Close Date"
                        :rules="[rules.required(), rules.dateIsAfterOrEqualTo(newCloseDate, schoolOpenDate, true, `The closure date must occur on or after ${openDateFormatted}.`)]"
                        model-type="yyyy-MM-dd'T'00:00:00"
                        @update:model-value="validateForm"
                        :allowTeleport="true"
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
                  <v-row class="d-flex justify-start">
                    <h3>Select the new closing date</h3>
                  </v-row>
                  <v-row>
                    <v-col cols="6">
                      <DatePicker
                        id="updatedCloseDateTextField"
                        v-model="updatedCloseDate"
                        label="Close Date"
                        :rules="[rules.required(), rules.dateIsAfterOrEqualTo(updatedCloseDate, schoolOpenDate, true, `The closure date must occur on or after ${openDateFormatted}.`)]"
                        model-type="yyyy-MM-dd'T'00:00:00"
                        @update:model-value="validateForm"
                        :allowTeleport="true"
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
            @click-action="closeEditSchoolStatus"
          />
          <PrimaryButton
            id="newContactPostBtn"
            text="Okay"
            width="7rem"
            @click-action="updateSchoolDates"
            :disabled="!isFormValid"
            :loading="processing"
          />
        </v-card-actions>
      </v-form>
    </v-card>
  </div>
</template>

<script>
import PrimaryButton from '../util/PrimaryButton.vue';
import alertMixin from '@/mixins/alertMixin';
import * as Rules from '@/utils/institute/formRules';
import {formatDate} from '@/utils/format';
import {findUpcomingDate} from '@/utils/dateHelpers';
import DatePicker from '@/components/util/DatePicker.vue';

export default {
  name: 'SchoolStatus',
  components: {
    DatePicker,
    PrimaryButton,
  },
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
    isSchoolStatusUpdateAllowed: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      isFormValid: false,
      processing: false,
      rules: Rules,
      action: this.defaultUpdateActionForSchool(),
      newOpenDate: findUpcomingDate(7, 1).toString(),
      updatedOpenDate: this.schoolOpenDate,
      newCloseDate: findUpcomingDate(6, 30).toString(),
      updatedCloseDate: this.schoolCloseDate
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
    openDateFormatted() {
      if (!this.schoolOpenDate) {
        return '';
      }
      return this.formatDate(this.schoolOpenDate);
    }
  },
  mounted() {
    if (this.isSchoolStatusUpdateAllowed) {
      this.validateForm();
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
    closeEditSchoolStatus() {
      this.resetForm();
      this.$emit('schoolStatus:closeEditSchoolStatusPage');
    },
    cancel() {
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
          openedDate: this.newOpenDate,
          closedDate: null,
        };
        break;
      case 'updateOpenDate':
        updatedSchoolDates = {
          openedDate: this.updatedOpenDate,
          closedDate: null,
        };
        break;
      case 'setCloseDate':
        updatedSchoolDates = {
          openedDate: this.schoolOpenDate,
          closedDate: this.newCloseDate
        };
        break;
      case 'updateCloseDate':
        updatedSchoolDates = {
          openedDate: this.schoolOpenDate,
          closedDate: this.updatedCloseDate,
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
    async validateForm() {
      const isValid = await this.$refs.schoolStatusForm.validate();
      this.isFormValid = isValid.valid;
    },
    formatDate
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
</style>
