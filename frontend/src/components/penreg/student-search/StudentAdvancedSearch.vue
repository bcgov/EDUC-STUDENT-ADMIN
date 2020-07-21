<template>
  <v-row no-gutters style="background-color:white;" class="px-3 pt-3">
    <v-col cols="6">
      <v-row no-gutters class="textFieldRow">
        <v-col cols="2">PEN</v-col>
        <v-col cols="2">
          <v-text-field
            dense
            filled
            outlined
            id='pen'
            v-model="studentSearchParams.pen"
            maxlength="9"
            minlength="9"
            @keyup.enter="enterPushed()"
            v-on:input="[searchHasValues(),runPENSearchIfPossible()]"
            autofocus
            :rules="validatePen()">
          </v-text-field>
        </v-col>
      </v-row>
      <v-row no-gutters class="textFieldRow">
        <v-col cols="2">Birth Date</v-col>
        <v-col cols="3">
          <v-row no-gutters>
            <v-col cols="4">
              <v-text-field class="doubleWidthInput" v-model="startDOB.year" dense filled outlined maxlength="4" placeholder="YYYY"
                :rules="validateStartDOBYear()"
                @keyup.enter="enterPushed()"
                v-on:input="searchHasValues"></v-text-field>
            </v-col>
            <v-col cols="3" class="mx-2">
              <v-text-field v-model="startDOB.month" dense filled outlined maxlength="2" placeholder="MM"
                :disabled="!isValidStartDOB.year"
                :rules="validateStartDOBMonth()"
                @keyup.enter="enterPushed()"
               v-on:input="searchHasValues"></v-text-field>
            </v-col>
            <v-col cols="3">
              <v-text-field v-model="startDOB.day" dense filled outlined maxlength="2" placeholder="DD"
                :disabled="!isValidStartDOB.month || !isValidStartDOB.year"
                :rules="validateStartDOBDay()"
                @keyup.enter="enterPushed()"
                v-on:input="searchHasValues"></v-text-field>
            </v-col>
          </v-row>
        </v-col>
        <v-col cols="2">
          <v-checkbox class="ma-0 pa-0" height="100%" label="Use range" v-model="useDOBRange"></v-checkbox>
        </v-col>
        <v-col cols="3">
          <v-row no-gutters v-if="this.useDOBRange">
            <v-col cols="4" class="ml-3">
              <v-text-field dense filled outlined placeholder="YYYY" maxlength="4" v-model="endDOB.year"
                :rules="validateEndDOBYear()"
                @keyup.enter="enterPushed()"
                v-on:input="searchHasValues"
              ></v-text-field>
            </v-col>
            <v-col cols="3" class="mx-2">
              <v-text-field dense filled outlined placeholder="MM" minLength="2" maxlength="2" v-model="endDOB.month"
                :rules="validateEndDOBMonth()"
                :disabled="!isValidEndDOB.year"
                @keyup.enter="enterPushed()"
                v-on:input="searchHasValues"></v-text-field>
            </v-col>
            <v-col cols="3">
              <v-text-field dense filled outlined placeholder="DD" minLength="2" maxlength="2" v-model="endDOB.day"
                :rules="validateEndDOBDay()"
                :disabled="!isValidEndDOB.month || !isValidEndDOB.year"
                @keyup.enter="enterPushed()"
                v-on:input="searchHasValues"></v-text-field>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
      <v-row no-gutters class="textFieldRow">
        <v-col cols="2">Gender</v-col>
        <v-col cols="1" id="genderCol">
          <v-text-field dense filled outlined
            v-model="studentSearchParams.genderCode"
            @keyup.enter="enterPushed()"
            v-on:input="[searchHasValues(),uppercaseGender()]"
            maxlength="1"
            :rules="validateGender()">
          </v-text-field>
        </v-col>
      </v-row>
      <v-row no-gutters class="textFieldRow">
        <v-col cols="2">Grade</v-col>
        <v-col cols="1">
          <v-text-field dense filled outlined
            id="gradeCode"
            v-model="studentSearchParams.gradeCode"
            maxlength="2"
            @keyup.enter="enterPushed()"
            v-on:input="[searchHasValues(), uppercaseGrade()]"
            :rules="validateGradeCode()">
          </v-text-field>
        </v-col>
      </v-row>
      <v-row no-gutters class="textFieldRow">
        <v-col cols="2">Mincode</v-col>
        <v-col cols="2">
          <v-text-field dense filled outlined
            id='mincode'
            v-model="studentSearchParams.mincode"
            @keyup.enter="enterPushed()"
            v-on:input="searchHasValues"
            maxlength="8"
            minLength="8"
            :rules="validateMincode()">
          </v-text-field>
        </v-col>
      </v-row>
      <v-row no-gutters class="textFieldRow">
        <v-col cols="2">Local ID</v-col>
        <v-col cols="2">
          <v-text-field dense filled outlined
            id='localID'
            v-model="studentSearchParams.localID"
            @keyup.enter="enterPushed()"
            v-on:input="searchHasValues"
            maxlength="12">
          </v-text-field>
        </v-col>
        <v-col cols="3" class="ml-3">
          <v-checkbox disabled class="ma-0 pa-0" height="100%" label="Audit history"></v-checkbox>
        </v-col>
      </v-row>
      <v-row no-gutters class="textFieldRow">
        <v-col cols="2">Postal Code</v-col>
        <v-col cols="2">
          <v-text-field dense filled outlined
            id='postalCode'
            v-model="studentSearchParams.postalCode"
            v-on:input="[searchHasValues(),uppercasePostal()]"
            @keyup.enter="enterPushed()"
            maxlength="7"
            :rules="validatePostal()">
          </v-text-field>
        </v-col>
      </v-row>
      <v-row no-gutters class="textFieldRow">
        <v-col cols="2">Memo</v-col>
        <v-col cols="9">
          <v-text-field dense filled outlined
            id='memo'
            v-model="studentSearchParams.memo"
            @keyup.enter="enterPushed()"
            v-on:input="searchHasValues"
            maxlength="25">
          </v-text-field>
        </v-col>
      </v-row>
    </v-col>
    <v-col>
      <v-card class="pa-4">
        <v-row no-gutters class="textFieldRow mb-4" justify="space-between">
          <v-checkbox disabled label="Search name variants" class="ma-0 pa-0"></v-checkbox>
          <v-col cols="1">
            <v-row no-gutters justify="end">
              <p style="text-align: center">AUDIT<br>HISTORY</p>
            </v-row>
          </v-col>
        </v-row>
        <v-row no-gutters class="textFieldRow">
          <v-col cols="3">Legal Surname</v-col>
          <v-textarea dense filled outlined
            id='legalLastName'
            v-model="studentSearchParams.legalLastName"
            @keyup.enter="enterPushed()"
            v-on:input="searchHasValues"
            maxlength="255"
            rows="1"
            auto-grow>
          </v-textarea>
          <v-col cols="1" class="ml-4">
            <v-row no-gutters justify="center">
              <v-checkbox disabled class="ma-0 pa-0"></v-checkbox>
            </v-row>
          </v-col>
        </v-row>
        <v-row no-gutters class="textFieldRow">
          <v-col cols="3">Legal Given</v-col>
          <v-textarea dense filled outlined
            id='legalFirstName'
            v-model="studentSearchParams.legalFirstName"
            @keyup.enter="enterPushed()"
            v-on:input="searchHasValues"
            maxlength="255"
            rows="1"
            auto-grow>
          </v-textarea>
          <v-col cols="1" class="ml-4">
            <v-row no-gutters justify="center">
              <v-checkbox disabled class="ma-0 pa-0"></v-checkbox>
            </v-row>
          </v-col>
        </v-row>
        <v-row no-gutters class="textFieldRow">
          <v-col cols="3">Legal Middle</v-col>
          <v-textarea dense filled outlined
            id='legalMiddleNames'
            v-model="studentSearchParams.legalMiddleNames"
            v-on:input="searchHasValues"
            @keyup.enter="enterPushed()"
            maxlength="255"
            rows="1"
            auto-grow>
          </v-textarea>
          <v-col cols="1" class="ml-4">
            <v-row no-gutters justify="center">
              <v-checkbox disabled class="ma-0 pa-0"></v-checkbox>
            </v-row>
          </v-col>
        </v-row>
        <v-row no-gutters class="textFieldRow">
          <v-col cols="3">Usual Surname</v-col>
          <v-textarea dense filled outlined
            id='usualLastName'
            v-model="studentSearchParams.usualLastName"
            @keyup.enter="enterPushed()"
            v-on:input="searchHasValues"
            maxlength="255"
            rows="1"
            auto-grow>
          </v-textarea>
          <v-col cols="1" class="ml-4">
            <v-row no-gutters justify="center">
              <v-checkbox disabled class="ma-0 pa-0"></v-checkbox>
            </v-row>
          </v-col>
        </v-row>
        <v-row no-gutters class="textFieldRow">
          <v-col cols="3">Usual Given</v-col>
          <v-textarea dense filled outlined
            id='usualFirstName'
            v-model="studentSearchParams.usualFirstName"
            @keyup.enter="enterPushed()"
            v-on:input="searchHasValues"
            maxlength="255"
            rows="1"
            auto-grow></v-textarea>
          <v-col cols="1" class="ml-4">
            <v-row no-gutters justify="center">
              <v-checkbox disabled class="ma-0 pa-0"></v-checkbox>
            </v-row>
          </v-col>
        </v-row>
        <v-row no-gutters class="textFieldRow">
          <v-col cols="3">Usual Middle</v-col>
          <v-textarea dense filled outlined
            id='usualMiddleNames'
            v-model="studentSearchParams.usualMiddleNames"
            @keyup.enter="enterPushed()"
            v-on:input="searchHasValues"
            maxlength="255"
            rows="1"
            auto-grow></v-textarea>
          <v-col cols="1" class="ml-4">
            <v-row no-gutters justify="center">
              <v-checkbox disabled class="ma-0 pa-0"></v-checkbox>
            </v-row>
          </v-col>
        </v-row>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import { mapState } from 'vuex';
import {LocalDate} from '@js-joda/core';
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
    validateGender: {
      type: Function,
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
    validatePostal: {
      type: Function,
      required: true
    },
    validateGradeCode: {
      type: Function,
      required: true
    }
  },
  data() {
    return {
      useDOBRange: false,
      startDOB: {
        year: '',
        month: '',
        day: ''
      },
      endDOB: {
        year: '',
        month: '',
        day: ''
      },
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
  mounted() {
    if(this.studentSearchParams.dob.startDate) {
      const tempStartDates = this.studentSearchParams.dob.startDate.split('/');
      this.startDOB.year = tempStartDates[0];
      this.startDOB.month = tempStartDates[1];
      this.startDOB.day = tempStartDates[2];
    }
  },
  watch: {
    formattedStartDOB: {
      handler() {
        this.$store.state['studentSearch'].studentSearchParams.dob.startDate = this.formattedStartDOB;
      }
    },
    formattedEndDOB: {
      handler() {
        this.$store.state['studentSearch'].studentSearchParams.dob.endDate = this.formattedEndDOB;
      }
    }
  },
  computed: {
    ...mapState('studentSearch', ['pageNumber', 'headerSortParams', 'studentSearchResponse', 'isAdvancedSearch', 'studentSearchParams']),
    formattedStartDOB() {
      if(this.startDOB.year) {
        const formattedDate = {
          year: this.startDOB.year,
          month: this.startMonth(),
          day: this.startDay()
        };
        return Object.values(formattedDate).join('/');
      }
      return null;
    },
    formattedEndDOB() {
      if(this.endDOB.year && this.useDOBRange) {
        const formattedDate = {
          year: this.endDOB.year,
          month: this.endMonth(this.endDOB.month, this.isValidEndDOB.month),
          day: this.endDay(this.endDOB, this.isValidEndDOB)
        };
        return Object.values(formattedDate).join('/');
      } else if (!this.isValidStartDOB.month || !this.isValidStartDOB.day) {
        const formattedDate = {
          year: this.startDOB.year,
          month: this.endMonth(this.startDOB.month, this.isValidStartDOB.month),
          day: this.endDay(this.startDOB, this.isValidStartDOB)
        };
        return Object.values(formattedDate).join('/');
      }
      return this.formattedStartDOB;
    },
  },
  methods: {
    validateDOBPast(year, month, day) {
      if(year || month || day) {
        if(!!year && month && day) {
          return LocalDate.of(year, month, day) < LocalDate.now();
        }
        return false;
      }
      return true;
    },
    validateDOBYear(year) {
      if (!year.match(/\d{4}/g)) {
        return ['Invalid year'];
      } else {
        if(year <= LocalDate.now().year()) {
          return [];
        } else {
          return ['DOB must be in the past'];
        }
      }
    },
    validateStartDOBYear() {
      if(this.startDOB.year) {
        const validYearResponse = this.validateDOBYear(this.startDOB.year);
        this.isValidStartDOB.year = validYearResponse.length===0;
        return validYearResponse;
      }
      this.isValidStartDOB.year = false;
      return [];
    },
    validateEndDOBYear() {
      if(this.useDOBRange && !this.endDOB.year) {
        this.isValidEndDOB.year = false;
        return ['Year required for range search'];
      }
      if(this.endDOB.year) {
        const validYearResponse = this.validateDOBYear(this.endDOB.year);
        if(validYearResponse.length===0 && this.endDOB.year < this.startDOB.year) {
          this.isValidEndDOB.year = false;
          return ['End Date must be the same as or later than the Start Date'];
        }
        this.isValidEndDOB.year = validYearResponse.length===0;
        return validYearResponse;
      }
      this.isValidEndDOB.year = false;
      return [];
    },
    validateDOBMonth(year, month) {
      if(!month.match(/\d{2}/g) || month < 1 || month > 12) {
        return ['Invalid month'];
      }
      if(month > 0 && this.validateDOBPast(year, month, 1)) {
        return [];
      } else {
        return ['DOB must be in the past'];
      }
    },
    validateStartDOBMonth() {
      if(this.startDOB.month && this.isValidStartDOB.year) {
        const validMonthResponse =  this.validateDOBMonth(this.startDOB.year, this.startDOB.month);
        this.isValidStartDOB.month = validMonthResponse.length===0;
        return validMonthResponse;
      }
      this.isValidStartDOB.month = false;
      this.isValidStartDOB.day = false;
      return [];
    },
    validateEndDOBMonth() {
      if(this.endDOB.month && this.isValidEndDOB.year) {
        const validMonthResponse =  this.validateDOBMonth(this.endDOB.year, this.endDOB.month);
        const startDOBMonth = !this.startDOB.month || this.startDOB.month < 1?1:this.startDOB.month;
        if(validMonthResponse.length===0 && LocalDate.of(this.endDOB.year, this.endDOB.month, 1)  < LocalDate.of(this.startDOB.year, startDOBMonth, 1)) {
          this.isValidEndDOB.month = false;
          this.isValidEndDOB.day = false;
          return ['End Date must be the same as or later than the Start Date'];
        } else {
          this.isValidEndDOB.month = validMonthResponse.length===0;
          return validMonthResponse;
        }
      }
      this.isValidEndDOB.month = false;
      this.isValidEndDOB.day = false;
      return [];
    },
    validateDOBDay(year, month, day) {
      if(!day.match(/\d{2}/g) || day < 1 || LocalDate.of(year, month, 1).lengthOfMonth() < day) {
        return ['Invalid day'];
      }
      if(this.validateDOBPast(year, month, day)) {
        return [];
      } else {
        return ['DOB must be in the past'];
      }
    },
    validateStartDOBDay() {
      if(this.startDOB.day && this.isValidStartDOB.month) {
        const validDayResponse =  this.validateDOBDay(this.startDOB.year, this.startDOB.month, this.startDOB.day);
        this.isValidStartDOB.day = validDayResponse.length===0;
        return validDayResponse;
      }
      return [];
    },
    validateEndDOBDay() {
      if(this.endDOB.day && this.isValidEndDOB.month) {
        const validDayResponse =  this.validateDOBDay(this.endDOB.year, this.endDOB.month, this.endDOB.day);
        const startMonth = !this.startDOB.month || this.startDOB.month < 1?1:this.startDOB.month;
        const statDay = !this.startDOB.day || this.startDOB.day < 1?1:this.startDOB.day;
        if(validDayResponse.length===0 && LocalDate.of(this.endDOB.year, this.endDOB.month, this.endDOB.day)  < LocalDate.of(this.startDOB.year, startMonth, statDay)) {
          this.isValidEndDOB.day = false;
          return ['End Date must be the same as or later than the Start Date'];
        } else {
          this.isValidEndDOB.day = validDayResponse.length===0;
          return validDayResponse;
        }
      }
      return [];
    },
    startMonth() {
      return this.startDOB.month && this.isValidStartDOB.month? this.startDOB.month: '01';
    },
    startDay() {
      return this.startDOB.day && this.isValidStartDOB.day?this.startDOB.day: '01';
    },
    endMonth(month, isValid) {
      return month && isValid && month!=='0' ? month: 12;
    },
    endDay(dateObject, isValidObject) {
      return dateObject.day && isValidObject.day? dateObject.day: LocalDate.of(dateObject.year, this.endMonth(dateObject.month, isValidObject.month), 1).lengthOfMonth();
    }
  }
};
</script>
<style>
  .v-text-field>.v-input__control>.v-text-field__details {
    max-width:300%;
    width:300%;
    margin-bottom: 0 !important;
    padding-left: 0 !important;
  }
  .v-text-field>.v-input__control>.v-input__slot {
    margin-bottom: 0 !important;
  }
</style>
