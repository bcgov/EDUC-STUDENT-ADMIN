<template>
  <div>
    <v-form class="mx-10" v-model="valid">
        <v-row>
          <v-col cols='3' md='4'  class="pb-0">
            <v-text-field
              v-model='request.pen'
              :rules='penRules'
              outlined
              maxlength="9"
              label='PEN'
            ></v-text-field>
          </v-col>
          <v-col cols='3' md='4'  class="pb-0">
            <v-text-field
              id='dob'
              v-model="request.dob"
              label="Birth Date (YYYY/MM/DD)"
              outlined
              :rules="validateDOB()"
            ></v-text-field>
          </v-col>
          <v-col cols='3' md='4'  class="pb-0">
            <v-text-field
              v-model='request.sex'
              :rules='genderRules'
              outlined
              maxlength="1"
              label='Sex'
            ></v-text-field>
          </v-col>
        </v-row>
      <v-row>
        <v-col cols='3' md='4'  class="py-0">
          <v-text-field
                  v-model="request.surname"
                  label="Surname"
                  outlined
          ></v-text-field>
        </v-col>
        <v-col cols='3' md='4'  class="py-0">
          <v-text-field
                  v-model='request.givenName'
                  outlined
                  label='Given Name'
          ></v-text-field>
        </v-col>
        <v-col cols='3' md='4'  class="py-0">
          <v-text-field
                  v-model='request.middleName'
                  outlined
                  label='Middle Name'
          ></v-text-field>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols='3' md='4'  class="py-0">
          <v-text-field
                  v-model='request.usualSurname'
                  outlined
                  label='Usual Surname'
          ></v-text-field>
        </v-col>
        <v-col cols='3' md='4'  class="py-0">
          <v-text-field
                  v-model="request.usualGivenName"
                  label="Usual Given Name"
                  outlined
          ></v-text-field>
        </v-col>
        <v-col cols='3' md='4'  class="py-0">
          <v-text-field
                  v-model='request.usualMiddleName'
                  outlined
                  label='usualMiddleName'
          ></v-text-field>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols='3' md='4'  class="py-0">
          <v-text-field
                  v-model='request.enrolledGradeCode'
                  outlined
                  maxlength="2"
                  label='Enrolled Grade Code'
          ></v-text-field>
        </v-col>
        <v-col cols='3' md='4'  class="py-0">
          <v-text-field
                  v-model="request.mincode"
                  label="Mincode"
                  outlined
                  :rules="mincodeRules"
          ></v-text-field>
        </v-col>
        <v-col cols='3' md='4'  class="py-0">
          <v-text-field
                  v-model='request.localID'
                  outlined
                  label='Local ID'
          ></v-text-field>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols='3' md='4'  class="py-0">
          <v-text-field
                  v-model='request.postal'
                  outlined
                  label='Postal Code'
                  :rules="postalRules"
          ></v-text-field>
        </v-col>
        <v-col cols='3' md='4'  class="py-0">
          <v-text-field
                  v-model='request.updateCode'
                  outlined
                  label='Update Code'
          ></v-text-field>
        </v-col>
      </v-row>
      <v-btn
        :disabled="!valid || !canSearch"
        color="success"
        class="mr-4 mb-4"
        @click="runMatch"
      >
        Match
      </v-btn>
      <v-btn
        color="error"
        class="mb-4"
        @click="reset"
      >
        Reset Form
      </v-btn>
    </v-form>
    <v-alert
      :value="requestFailed"
      color="pink"
      dark
      border="top"
      text
      prominent
      type="error"
      icon="mdi-cloud-alert"
      dismissible
      transition="scale-transition"
    >PEN Match failed</v-alert>
    <v-card v-if="matchResponseData">
      <v-card-title>PEN Match Response</v-card-title>
      <v-card-text><pre>{{ matchResponseData }}</pre></v-card-text>
    </v-card>
  </div>
</template>

<script>
import {LocalDate} from '@js-joda/core';
import ApiService from '../../common/apiService';
let JSJoda = require('@js-joda/core');
import { isValidPEN } from '../../utils/validation';

export default {
  name: 'PenMatch',
  data() {
    return {
      valid: false,
      request: {
        pen: null,
        dob: null,
        sex: null,
        enrolledGradeCode: null,
        surname: null,
        givenName: null,
        middleName: null,
        usualSurname: null,
        usualGivenName: null,
        usualMiddleName: null,
        mincode: null,
        localID: null,
        postal: null,
        updateCode: null
      },
      genderRules: [ v => (!v || this.genderCodes.includes(v)) || this.genderHint],
      penRules: [ v => (!v || isValidPEN(v)) || this.penHint],
      postalRules: [ v => !v || v.match('^[a-zA-Z][0-9][a-zA-Z] {0,1}[0-9][a-zA-Z][0-9]$') || this.postalCodeHint],
      mincodeRules: [ v => !v || v.match('^[0-9]\\d*$') || this.mincodeHint],
      genderCodes: ['M','F','X','U'],
      penHint: 'Fails check-digit test',
      postalCodeHint: 'Invalid Postal Code',
      mincodeHint: 'Digits only',
      genderHint: 'Invalid gender',
      dobHint: 'Invalid Birth Date',
      requestFailed: false,
      matchResponseData: null
    };
  },
  computed: {
    canSearch() {
      return Object.keys(this.request).some(key => this.request[key]);
    }
  },
  methods: {
    reset() {
      this.request = {
        pen: null,
        dob: null,
        sex: null,
        enrolledGradeCode: null,
        surname: null,
        givenName: null,
        givenInitial: null,
        middleName: null,
        middleInitial: null,
        usualSurname: null,
        usualGivenName: null,
        usualGivenInitial: null,
        usualMiddleName: null,
        usualMiddleInitial: null,
        mincode: null,
        localID: null,
        postal: null,
        updateCode: null
      };
    },
    runMatch() {
      this.matchResponseData = null;
      ApiService.apiAxios
        .post('api/penMatches/', this.request)
        .then(response => {
          this.matchResponseData = JSON.stringify(response.data, undefined, 2);
          this.requestFailed = false;
        })
        .catch(error => {
          console.log(error);
          this.requestFailed = true;
        });
    },
    validateDOB(){
      if(this.request) {
        if(!this.request.dob){
          return [];
        }
        else {
          const formatter = (new JSJoda.DateTimeFormatterBuilder)
            .appendPattern('uuuu/MM/dd')
            .toFormatter(JSJoda.ResolverStyle.STRICT);
          try {
            const dateObject = JSJoda.LocalDate.parse(this.request.dob, formatter);
            if(dateObject.isBefore(LocalDate.now())){
              return [];
            }
          }
          catch(err){
            //Do nothing
          }
        }
      }
      return [
        this.dobHint
      ];
    }
  }
};
</script>

<style scoped>
  pre {outline: 1px solid #ccc; padding: 5px; margin: 5px; }
  .string { color: green; }
  .number { color: darkorange; }
  .boolean { color: blue; }
  .null { color: magenta; }
  .key { color: red; }
</style>
