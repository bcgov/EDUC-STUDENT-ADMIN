<template>
  <v-row
    no-gutters
    style="background-color:white;"
    class="px-3 pt-3"
  >
    <v-col cols="6">
      <v-row
        no-gutters
        class="textFieldRow"
      >
        <v-col
          class="mr-n8 mt-2"
          cols="3"
        >
          PEN
        </v-col>
        <v-col cols="3">
          <v-text-field
            id="pen"
            v-model.trim="studentSearchParams.pen"
            density="compact"
            variant="outlined"
            bg-color="#efefef"
            maxlength="9"
            minlength="9"
            autofocus
            :rules="validatePen()"
            @keyup.enter="enterPushed()"
            @input="[searchHasValues(),runPENSearchIfPossible()]"
          />
        </v-col>
      </v-row>
      <v-row
        no-gutters
        class="textFieldRow"
      >
        <v-col
          cols="2"
          class="mt-2"
        >
          Birth Date
        </v-col>
        <v-col
          cols="1"
          class="mr-n8"
        >
          <v-checkbox
            id="useDOBCheckbox"
            v-model="useDOBValue"
            class="ma-0 pa-0"
            height="100%"
            density="compact"
            label=""
            color="#606060"
            @change="searchHasValues"
          />
        </v-col>
        <v-col cols="3">
          <v-row no-gutters>
            <v-col cols="4">
              <v-text-field
                id="start-dob-year"
                v-model="advancedSearchCriteria.startDate.year"
                class="doubleWidthInput"
                density="compact"
                bg-color="#efefef"
                variant="outlined"
                maxlength="4"
                placeholder="YYYY"
                :rules="validateStartDOBYear()"
                @keyup.enter="enterPushed()"
                @input="[searchHasValues(), $emit('valueChange')]"
              />
            </v-col>
            <v-col
              cols="3"
              class="mx-2"
            >
              <v-text-field
                id="start-dob-month"
                v-model="advancedSearchCriteria.startDate.month"
                density="compact"
                bg-color="#efefef"
                variant="outlined"
                maxlength="2"
                placeholder="MM"
                :disabled="!isValidStartDOB.year"
                :rules="validateStartDOBMonth()"
                @keyup.enter="enterPushed()"
                @input="[searchHasValues(), $emit('valueChange')]"
              />
            </v-col>
            <v-col cols="3">
              <v-text-field
                id="start-dob-day"
                v-model="advancedSearchCriteria.startDate.day"
                density="compact"
                bg-color="#efefef"
                variant="outlined"
                maxlength="2"
                placeholder="DD"
                :disabled="!isValidStartDOB.month || !isValidStartDOB.year"
                :rules="validateStartDOBDay()"
                @keyup.enter="enterPushed()"
                @input="[searchHasValues(), $emit('valueChange')]"
              />
            </v-col>
          </v-row>
        </v-col>
        <v-col
          cols="2"
          class="mr-n3"
        >
          <v-checkbox
            id="useDOBRangeCheckbox"
            v-model="advancedSearchCriteria.useDOBRange"
            class="ma-0 pa-0"
            height="100%"
            density="compact"
            label="Use range"
            color="#606060"
            @update:model-value="[searchHasValues(), $emit('valueChange')]"
          />
        </v-col>
        <v-col cols="3">
          <v-row
            v-if="advancedSearchCriteria.useDOBRange"
            no-gutters
          >
            <v-col
              cols="4"
              class="ml-3"
            >
              <v-text-field
                id="end-dob-year"
                v-model="advancedSearchCriteria.endDate.year"
                density="compact"
                bg-color="#efefef"
                variant="outlined"
                placeholder="YYYY"
                maxlength="4"
                :rules="validateEndDOBYear()"
                @keyup.enter="enterPushed()"
                @input="[searchHasValues(), $emit('valueChange')]"
              />
            </v-col>
            <v-col
              cols="3"
              class="mx-2"
            >
              <v-text-field
                id="end-dob-month"
                v-model="advancedSearchCriteria.endDate.month"
                density="compact"
                bg-color="#efefef"
                variant="outlined"
                placeholder="MM"
                min-length="2"
                maxlength="2"
                :rules="validateEndDOBMonth()"
                :disabled="!isValidEndDOB.year"
                @keyup.enter="enterPushed()"
                @input="[searchHasValues(), $emit('valueChange')]"
              />
            </v-col>
            <v-col cols="3">
              <v-text-field
                id="end-dob-day"
                v-model="advancedSearchCriteria.endDate.day"
                density="compact"
                bg-color="#efefef"
                variant="outlined"
                placeholder="DD"
                min-length="2"
                maxlength="2"
                :rules="validateEndDOBDay()"
                :disabled="!isValidEndDOB.month || !isValidEndDOB.year"
                @keyup.enter="enterPushed()"
                @input="[searchHasValues(), $emit('valueChange')]"
              />
            </v-col>
          </v-row>
        </v-col>
      </v-row>
      <v-row
        density="compact"
        no-gutters
        class="textFieldRow"
      >
        <v-col
          class="mr-n8 mt-2"
          cols="3"
        >
          Gender
        </v-col>
        <v-col
          id="genderCol"
          cols="2"
        >
          <v-select
            v-model="studentSearchParams.genderCode"
            :items="genders"
            item-title="genderCode"
            item-value="genderCode"
            style="max-width: 7em"
            variant="outlined"
            bg-color="#efefef"
            density="compact"
            clearable
            @update:model-value="[searchHasValues(),$emit('valueChange')]"
          />
        </v-col>
      </v-row>
      <v-row
        no-gutters
        class="textFieldRow"
      >
        <v-col
          class="mr-n8 mt-2"
          cols="3"
        >
          Grade
        </v-col>
        <v-col cols="2">
          <v-select
            v-model="studentSearchParams.gradeCode"
            :items="gradeCodes"
            item-title="gradeCode"
            item-value="gradeCode"
            style="max-width: 7em"
            variant="outlined"
            bg-color="#efefef"
            density="compact"
            clearable
            @update:model-value="[searchHasValues(),$emit('valueChange')]"
          />
        </v-col>
      </v-row>
      <v-row
        no-gutters
        class="textFieldRow"
      >
        <v-col
          class="mr-n8 mt-2"
          cols="3"
        >
          Mincode
        </v-col>
        <v-col cols="2">
          <v-text-field
            id="mincode"
            v-model.trim="studentSearchParams.mincode"
            density="compact"
            bg-color="#efefef"
            variant="outlined"
            maxlength="8"
            min-length="8"
            :rules="validateMincode()"
            @keyup.enter="enterPushed()"
            @input="[searchHasValues(), $emit('valueChange')]"
          />
        </v-col>
      </v-row>
      <v-row
        no-gutters
        class="textFieldRow"
      >
        <v-col
          class="mr-n8 mt-2"
          cols="3"
        >
          Local ID
        </v-col>
        <v-col cols="2">
          <v-text-field
            id="localID"
            v-model.trim="studentSearchParams.localID"
            density="compact"
            bg-color="#efefef"
            variant="outlined"
            maxlength="12"
            @keyup.enter="enterPushed()"
            @input="[searchHasValues(), $emit('valueChange')]"
          />
        </v-col>
      </v-row>
      <v-row
        no-gutters
        class="textFieldRow"
      >
        <v-col
          class="mr-n8 mt-2"
          cols="3"
        >
          Postal Code
        </v-col>
        <v-col cols="2">
          <v-text-field
            id="postalCode"
            v-model.trim="studentSearchParams.postalCode"
            density="compact"
            bg-color="#efefef"
            variant="outlined"
            maxlength="7"
            :rules="validatePostal()"
            @input="[searchHasValues(),uppercasePostal(), $emit('valueChange')]"
            @keyup.enter="enterPushed()"
          />
        </v-col>
      </v-row>
      <v-row
        no-gutters
        class="textFieldRow"
      >
        <v-col
          class="mr-n8 mt-2"
          cols="3"
        >
          Memo
        </v-col>
        <v-col cols="8">
          <v-text-field
            id="memo"
            v-model="studentSearchParams.memo"
            density="compact"
            bg-color="#efefef"
            variant="outlined"
            maxlength="25"
            @keyup.enter="enterPushed()"
            @input="[searchHasValues(), $emit('valueChange')]"
          />
        </v-col>
      </v-row>
    </v-col>
    <v-col>
      <v-card class="pa-4">
        <v-row
          no-gutters
          class="textFieldRow mb-4"
          justify="space-between"
        >
          <v-col cols="3">
            <v-checkbox
              id="searchNameVariantsCheckbox"
              v-model="advancedSearchCriteria.useNameVariants"
              label="Search name variants"
              density="compact"
              color="#606060"
              class="ma-0 pa-0"
            />
          </v-col>
          <v-col cols="2">
            <v-tooltip location="start">
              <template #activator="{ props }">
                <v-icon
                  size="25"
                  v-bind="props"
                  color="#FCBA19"
                  icon="mdi-alert-circle"
                  style="margin-top: 0.3em"
                />
              </template>
              <span>
                Searching by name variant cannot be used in conjunction with wildcards on Legal and Usual Given names<br>
              </span>
            </v-tooltip>
          </v-col>
          <v-col>
            <v-checkbox
              id="searchAuditHistoryCheckbox"
              v-model="advancedSearchCriteria.isAuditHistorySearch"
              label="Search audit history"
              density="compact"
              color="#606060"
              class="ma-0 pa-0"
            />
          </v-col>
        </v-row>
        <v-row
          no-gutters
          class="textFieldRow"
        >
          <v-col
            cols="3"
            class="mt-2"
          >
            Legal Surname
          </v-col>
          <v-text-field
            id="legalLastName"
            v-model="studentSearchParams.legalLastName"
            density="compact"
            bg-color="#efefef"
            variant="outlined"
            maxlength="25"
            @blur="studentSearchParams.legalLastName = trimNameField($event)"
            @keyup.enter="enterPushed()"
            @input="[searchHasValues(), $emit('valueChange')]"
          />
        </v-row>
        <v-row
          no-gutters
          class="textFieldRow"
        >
          <v-col
            cols="3"
            class="mt-2"
          >
            Legal Given
          </v-col>
          <v-text-field
            id="legalFirstName"
            v-model="studentSearchParams.legalFirstName"
            density="compact"
            bg-color="#efefef"
            variant="outlined"
            maxlength="25"
            @blur="studentSearchParams.legalFirstName = trimNameField($event)"
            @keyup.enter="enterPushed()"
            @input="[searchHasValues(), $emit('valueChange')]"
          />
        </v-row>
        <v-row
          no-gutters
          class="textFieldRow"
        >
          <v-col
            cols="3"
            class="mt-2"
          >
            Legal Middle
          </v-col>
          <v-text-field
            id="legalMiddleNames"
            v-model="studentSearchParams.legalMiddleNames"
            density="compact"
            bg-color="#efefef"
            variant="outlined"
            maxlength="25"
            @blur="studentSearchParams.legalMiddleNames = trimNameField($event)"
            @input="[searchHasValues(), $emit('valueChange')]"
            @keyup.enter="enterPushed()"
          />
        </v-row>
        <v-row
          no-gutters
          class="textFieldRow"
        >
          <v-col
            cols="3"
            class="mt-2"
          >
            Usual Surname
          </v-col>
          <v-text-field
            id="usualLastName"
            v-model="studentSearchParams.usualLastName"
            density="compact"
            bg-color="#efefef"
            variant="outlined"
            maxlength="25"
            @blur="studentSearchParams.usualLastName = trimNameField($event)"
            @keyup.enter="enterPushed()"
            @input="[searchHasValues(), $emit('valueChange')]"
          />
        </v-row>
        <v-row
          no-gutters
          class="textFieldRow"
        >
          <v-col
            cols="3"
            class="mt-2"
          >
            Usual Given
          </v-col>
          <v-text-field
            id="usualFirstName"
            v-model="studentSearchParams.usualFirstName"
            density="compact"
            bg-color="#efefef"
            variant="outlined"
            maxlength="25"
            @blur="studentSearchParams.usualFirstName = trimNameField($event)"
            @keyup.enter="enterPushed()"
            @input="[searchHasValues(), $emit('valueChange')]"
          />
        </v-row>
        <v-row
          no-gutters
          class="textFieldRow"
        >
          <v-col
            cols="3"
            class="mt-2"
          >
            Usual Middle
          </v-col>
          <v-text-field
            id="usualMiddleNames"
            v-model="studentSearchParams.usualMiddleNames"
            density="compact"
            bg-color="#efefef"
            variant="outlined"
            maxlength="25"
            @blur="studentSearchParams.usualMiddleNames = trimNameField($event)"
            @keyup.enter="enterPushed()"
            @input="[searchHasValues(), $emit('valueChange')]"
          />
        </v-row>
        <v-row
          no-gutters
          class="textFieldRow"
        >
          <v-col
            cols="3"
            class="mt-2"
          >
            Status
          </v-col>
          <v-col
            v-for="status in statusCodes"
            :key="status.label"
            cols="auto"
            class="px-2"
          >
            <v-checkbox
              v-model="advancedSearchCriteria.statusCode"
              :label="status.label"
              density="compact"
              color="#606060"
              class="ma-0 pa-0"
              :value="status.value"
            />
          </v-col>
        </v-row>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import {mapActions, mapState} from 'pinia';
import {LocalDate} from '@js-joda/core';
import {STUDENT_CODES} from '@/utils/constants';
import {studentSearchStore} from '@/store/modules/studentSearch';

export default {
  name: 'SearchAdvancedSearch',
  props: {
    enterPushed: {
      type: Function,
      required: true
    },
    runPENSearchIfPossible: {
      type: Function,
      required: true
    },
    searchHasValues: {
      type: Function,
      required: true
    },
    validatePen: {
      type: Function,
      required: true
    },
    uppercaseGender: {
      type: Function,
      required: true
    },
    uppercaseGrade: {
      type: Function,
      required: true
    },
    genders: {
      type: Array,
      required: true
    },
    gradeCodes: {
      type: Array,
      required: true
    },
    validateMincode: {
      type: Function,
      required: true
    },
    uppercasePostal: {
      type: Function,
      required: true
    },
    useDOB: {
      type: Boolean,
      required: true
    },
    validatePostal: {
      type: Function,
      required: true
    },
    initialSearch: {
      type: Boolean,
      default: false
    }
  },
  emits: [
    'update:useDOB',
    'valueChange'
  ],
  data() {
    return {
      isValidStartDOB: {
        year: false,
        month: false,
        day: false
      },
      isValidEndDOB: {
        year: false,
        month: false,
        day: false
      }
    };
  },
  computed: {
    useDOBValue: {
      get: function () {
        return this.useDOB;
      },
      set: async function (value) {
        this.$emit('update:useDOB', value);
      }
    },
    ...mapState(studentSearchStore, ['pageNumber', 'headerSortParams', 'studentSearchResponse', 'isAdvancedSearch', 'studentSearchParams', 'advancedSearchCriteria']),
    formattedStartDOB() {
      if (this.advancedSearchCriteria.startDate && this.advancedSearchCriteria.startDate.year) {
        const formattedDate = {
          year: this.advancedSearchCriteria.startDate.year,
          month: this.startMonth(),
          day: this.startDay()
        };
        return Object.values(formattedDate).join('/');
      }
      return null;
    },
    formattedEndDOB() {
      if (this.advancedSearchCriteria.endDate && this.advancedSearchCriteria.endDate.year && this.advancedSearchCriteria.useDOBRange) {
        const formattedDate = {
          year: this.advancedSearchCriteria.endDate.year,
          month: this.endMonth(this.advancedSearchCriteria.endDate.month, this.isValidEndDOB.month),
          day: this.endDay(this.advancedSearchCriteria.endDate, this.isValidEndDOB)
        };
        return Object.values(formattedDate).join('/');
      } else if (this.advancedSearchCriteria.startDate && this.advancedSearchCriteria.startDate.year && (!this.isValidStartDOB.month || !this.isValidStartDOB.day)) {
        const formattedDate = {
          year: this.advancedSearchCriteria.startDate.year,
          month: this.endMonth(this.advancedSearchCriteria.startDate.month, this.isValidStartDOB.month),
          day: this.endDay(this.advancedSearchCriteria.startDate, this.isValidStartDOB)
        };
        return Object.values(formattedDate).join('/');
      }
      return this.formattedStartDOB;
    },
    statusCodes() {
      return [
        {label: 'Active', value: STUDENT_CODES.ACTIVE},
        {label: 'Merged', value: STUDENT_CODES.MERGED},
        {label: 'Deceased', value: STUDENT_CODES.DECEASED}
      ];
    },
  },
  watch: {
    formattedStartDOB: {
      handler() {
        studentSearchStore().studentSearchParams.dob.startDate = this.formattedStartDOB;
      }
    },
    formattedEndDOB: {
      handler() {
        studentSearchStore().studentSearchParams.dob.endDate = this.formattedEndDOB;
      }
    },
    initialSearch: {
      handler() {
        this.setStartDateInAdvancedSearchCriteria();
      }
    }
  },
  mounted() {
    this.setStartDateInAdvancedSearchCriteria();
    this.setIsAdvancedSearch(true);
  },
  methods: {
    ...mapActions(studentSearchStore, ['setIsAdvancedSearch']),
    validateDOBPast(year, month, day) {
      if (year || month || day) {
        if (!!year && month && day) {
          return LocalDate.of(year, month, day).isBefore(LocalDate.now());
        }
        return false;
      }
      return true;
    },
    validateDOBYear(year) {
      if (!year) {
        return [];
      }
      if (!year.match(/\d{4}/g)) {
        return ['Invalid year'];
      } else {
        if (year <= LocalDate.now().year()) {
          return [];
        } else {
          return ['DOB must be in the past'];
        }
      }
    },
    validateStartDOBYear() {
      if (this.advancedSearchCriteria.startDate && this.advancedSearchCriteria.startDate.year) {
        const validYearResponse = this.validateDOBYear(this.advancedSearchCriteria.startDate.year);
        this.isValidStartDOB.year = validYearResponse.length === 0;
        return validYearResponse;
      }
      this.isValidStartDOB.year = false;
      return [];
    },
    validateEndDOBYear() {
      if (this.advancedSearchCriteria.useDOBRange && !this.advancedSearchCriteria.endDate.year) {
        this.isValidEndDOB.year = false;
        return ['Year required for range search'];
      }
      if (this.advancedSearchCriteria.endDate && this.advancedSearchCriteria.endDate.year) {
        const validYearResponse = this.validateDOBYear(this.advancedSearchCriteria.endDate.year);
        if (validYearResponse.length === 0 && this.advancedSearchCriteria.endDate.year < this.advancedSearchCriteria.startDate.year) {
          this.isValidEndDOB.year = false;
          return ['End Date must be the same as or later than the Start Date'];
        }
        this.isValidEndDOB.year = validYearResponse.length === 0;
        return validYearResponse;
      }
      this.isValidEndDOB.year = false;
      return [];
    },
    validateDOBMonth(year, month) {
      if (!month.match(/\d{2}/g) || month < 1 || month > 12) {
        return ['Invalid month'];
      }
      if (month > 0 && this.validateDOBPast(year, month, 1)) {
        return [];
      } else {
        return ['DOB must be in the past'];
      }
    },
    validateStartDOBMonth() {
      if (this.advancedSearchCriteria.startDate && this.advancedSearchCriteria.startDate.month && this.isValidStartDOB.year) {
        const validMonthResponse = this.validateDOBMonth(this.advancedSearchCriteria.startDate.year, this.advancedSearchCriteria.startDate.month);
        this.isValidStartDOB.month = validMonthResponse.length === 0;
        return validMonthResponse;
      }
      this.isValidStartDOB.month = false;
      this.isValidStartDOB.day = false;
      return [];
    },
    validateEndDOBMonth() {
      if (this.advancedSearchCriteria.endDate && this.advancedSearchCriteria.endDate.year && this.advancedSearchCriteria.endDate.month && this.isValidEndDOB.year) {
        const validMonthResponse = this.validateDOBMonth(this.advancedSearchCriteria.endDate.year, this.advancedSearchCriteria.endDate.month);
        const startDOBMonth = !this.advancedSearchCriteria.startDate.month || this.advancedSearchCriteria.startDate.month < 1 ? 1 : this.advancedSearchCriteria.startDate.month;
        if (validMonthResponse.length === 0 && LocalDate.of(this.advancedSearchCriteria.endDate.year, this.advancedSearchCriteria.endDate.month, 1).isBefore(LocalDate.of(this.advancedSearchCriteria.startDate.year, startDOBMonth, 1))) {
          this.isValidEndDOB.month = false;
          this.isValidEndDOB.day = false;
          return ['End Date must be the same as or later than the Start Date'];
        } else {
          this.isValidEndDOB.month = validMonthResponse.length === 0;
          return validMonthResponse;
        }
      }
      this.isValidEndDOB.month = false;
      this.isValidEndDOB.day = false;
      return [];
    },
    validateDOBDay(year, month, day) {
      if (!day.match(/\d{2}/g) || day < 1 || LocalDate.of(year, month, 1).lengthOfMonth() < day) {
        return ['Invalid day'];
      }
      if (this.validateDOBPast(year, month, day)) {
        return [];
      } else {
        return ['DOB must be in the past'];
      }
    },
    validateStartDOBDay() {
      if (this.advancedSearchCriteria.startDate && this.advancedSearchCriteria.startDate.day && this.isValidStartDOB.month) {
        const validDayResponse = this.validateDOBDay(this.advancedSearchCriteria.startDate.year, this.advancedSearchCriteria.startDate.month, this.advancedSearchCriteria.startDate.day);
        this.isValidStartDOB.day = validDayResponse.length === 0;
        return validDayResponse;
      }
      return [];
    },
    validateEndDOBDay() {
      if (this.advancedSearchCriteria.endDate && this.advancedSearchCriteria.endDate.day && this.isValidEndDOB.month) {
        const validDayResponse = this.validateDOBDay(this.advancedSearchCriteria.endDate.year, this.advancedSearchCriteria.endDate.month, this.advancedSearchCriteria.endDate.day);
        const startMonth = !this.advancedSearchCriteria.startDate.month || this.advancedSearchCriteria.startDate.month < 1 ? 1 : this.advancedSearchCriteria.startDate.month;
        const startDay = !this.advancedSearchCriteria.startDate.day || this.advancedSearchCriteria.startDate.day < 1 ? 1 : this.advancedSearchCriteria.startDate.day;
        if (validDayResponse.length === 0 && LocalDate.of(this.advancedSearchCriteria.endDate.year, this.advancedSearchCriteria.endDate.month, this.advancedSearchCriteria.endDate.day).isBefore(LocalDate.of(this.advancedSearchCriteria.startDate.year, startMonth, startDay))) {
          this.isValidEndDOB.day = false;
          return ['End Date must be the same as or later than the Start Date'];
        } else {
          this.isValidEndDOB.day = validDayResponse.length === 0;
          return validDayResponse;
        }
      }
      return [];
    },
    startMonth() {
      return this.advancedSearchCriteria.startDate && this.advancedSearchCriteria.startDate.month && this.isValidStartDOB.month ? this.advancedSearchCriteria.startDate.month : '01';
    },
    startDay() {
      return this.advancedSearchCriteria.startDate && this.advancedSearchCriteria.startDate.day && this.isValidStartDOB.day ? this.advancedSearchCriteria.startDate.day : '01';
    },
    endMonth(month, isValid) {
      return month && isValid && month !== '0' ? month : 12;
    },
    endDay(dateObject, isValidObject) {
      return dateObject.day && isValidObject.day ? dateObject.day : LocalDate.of(dateObject.year, this.endMonth(dateObject.month, isValidObject.month), 1).lengthOfMonth();
    },
    setStartDateInAdvancedSearchCriteria() {
      if (this.studentSearchParams.dob.startDate) {
        const tempStartDates = this.studentSearchParams.dob.startDate.split('/');
        this.advancedSearchCriteria.startDate.year = tempStartDates[0];
        this.advancedSearchCriteria.startDate.month = tempStartDates[1];
        this.advancedSearchCriteria.startDate.day = tempStartDates[2];
      }
    },
    trimNameField(event) {
      return event.target.value.trim().replace(/\s\s+/, ' ');
    }
  }
};
</script>
<style scoped>
.v-text-field /deep/ .v-text-field__details {
    max-width: 300%;
    width: 300%;
    margin-bottom: 0 !important;
    padding-left: 0 !important;
}

.v-text-field /deep/ .v-input__slot {
    margin-bottom: 0 !important;
}
</style>
