<template>
  <v-row no-gutters class="py-2" style="background-color:white;">
    <v-col cols="1" class="py-0 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3">
        <v-text-field
          id='pen'
          v-model="studentSearchParams.pen"
          color="#003366"
          label="PEN"
          maxlength="9"
          minlength="9"
          @keyup.enter="enterPushed()"
          v-on:input="[searchHasValues(),runPENSearchIfPossible()]"
          tabindex="1"
          dense
          autofocus
          :rules="validatePen()"
        ></v-text-field>
    </v-col>
    <v-col class="py-0 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3">
      <v-text-field
        id='legalLastName'
        v-model="studentSearchParams.legalLastName"
        color="#003366"
        label="Legal Surname"
        @keyup.enter="enterPushed()"
        v-on:input="searchHasValues"
        maxlength="255"
        tabindex="2"
        dense
        ></v-text-field>
      <v-text-field
        id='usualLastName'
        v-model="studentSearchParams.usualLastName"
        color="#003366"
        label="Usual Surname"
        @keyup.enter="enterPushed()"
        v-on:input="searchHasValues"
        tabindex="9"
        maxlength="255"
        dense
      ></v-text-field>
    </v-col>
    <v-col class="py-0 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3">
      <v-text-field
        id='legalFirstName'
        v-model="studentSearchParams.legalFirstName"
        tabindex="3"
        color="#003366"
        label="Legal Given"
        @keyup.enter="enterPushed()"
        v-on:input="searchHasValues"
        maxlength="255"
        dense
      ></v-text-field>
      <v-text-field
        id='usualFirstName'
        v-model="studentSearchParams.usualFirstName"
        color="#003366"
        label="Usual Given"
        @keyup.enter="enterPushed()"
        v-on:input="searchHasValues"
        tabindex="10"
        maxlength="255"
        dense
        ></v-text-field>
    </v-col>
    <v-col class="py-0 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3">
      <v-text-field
        id='legalMiddleNames'
        v-model="studentSearchParams.legalMiddleNames"
        color="#003366"
        label="Legal Middle"
        v-on:input="searchHasValues"
        @keyup.enter="enterPushed()"
        tabindex="4"
        maxlength="255"
        dense
      ></v-text-field>
      <v-text-field
        id='usualMiddleNames'
        v-model="studentSearchParams.usualMiddleNames"
        color="#003366"
        label="Usual Middle"
        @keyup.enter="enterPushed()"
        v-on:input="searchHasValues"
        tabindex="11"
        maxlength="255"
        dense
      ></v-text-field>
    </v-col>
    <v-col cols="1" class="py-0 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3">
      <v-text-field
        id='postalCode'
        v-model="studentSearchParams.postalCode"
        tabindex="5"
        color="#003366"
        label="Postal Code"
        v-on:input="[searchHasValues(),uppercasePostal()]"
        maxlength="7"
        @keyup.enter="enterPushed()"
        :rules="validatePostal()"
        dense
      ></v-text-field>
      <v-text-field
        id='memo'
        v-model="studentSearchParams.memo"
        color="#003366"
        tabindex="12"
        label="Memo"
        @keyup.enter="enterPushed()"
        v-on:input="searchHasValues"
        maxlength="25"
        dense
      ></v-text-field>
    </v-col>
    <v-col cols="1" class="py-0 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3">
      <v-text-field
        id='genderCode'
        v-model="studentSearchParams.genderCode"
        tabindex="6"
        color="#003366"
        label="Gender"
        maxlength="1"
        @keyup.enter="enterPushed()"
        v-on:input="[searchHasValues(),uppercaseGender()]"
        :rules="validateGender()"
        dense
      ></v-text-field>
      <v-text-field
        id='localID'
        v-model="studentSearchParams.localID"
        color="#003366"
        tabindex="13"
        label="Local ID"
        maxlength="12"
        @keyup.enter="enterPushed()"
        v-on:input="searchHasValues"
        dense
      ></v-text-field>
    </v-col>
    <v-col cols="1" class="py-0 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3">
      <v-text-field
        id='dob'
        v-model="studentSearchParams.dob.startDate"
        tabindex="7"
        color="#003366"
        label="Birth Date"
        :rules="validateDOB()"
        maxlength="10"
        minLength="10"
        @keyup.enter="enterPushed()"
        v-on:input="searchHasValues"
        dense
      ></v-text-field>
      <v-text-field
        id="gradeCode"
        v-model="studentSearchParams.gradeCode"
        color="#003366"
        label="Grade"
        tabindex="14"
        maxlength="2"
        @keyup.enter="enterPushed()"
        v-on:input="searchHasValues"
        minLength="1"
        dense
      ></v-text-field>
    </v-col>
    <v-col cols="1" class="py-0 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3">
      <v-text-field
        id='mincode'
        v-model="studentSearchParams.mincode"
        tabindex="8"
        color="#003366"
        label="Mincode"
        maxlength="8"
        minLength="8"
        @keyup.enter="enterPushed()"
        v-on:input="searchHasValues"
        :rules="validateMincode()"
        dense
      ></v-text-field>
    </v-col>
  </v-row>
</template>

<script>

import {mapState} from 'vuex';
import {LocalDate} from '@js-joda/core';
let JSJoda = require('@js-joda/core');

export default {
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
  },
  data() {
    return {
      dobHint: 'Invalid Birth Date',
    };
  },
  mounted() {
    if(this.studentSearchParams.dob.endDate) {
      this.studentSearchParams.dob.endDate = null; //clears lingering range search from advanced search view
    }
  },
  computed: {
    ...mapState('studentSearch', ['studentSearchParams']),
  },
  methods: {
    validateDOB(){
      if(this.studentSearchParams) {
        if(!this.studentSearchParams.dob.startDate){
          return [];
        }
        else {
          const formatter = (new JSJoda.DateTimeFormatterBuilder)
            .appendPattern('uuuu/MM/dd')
            .toFormatter(JSJoda.ResolverStyle.STRICT);
          try {
            const dateObject = JSJoda.LocalDate.parse(this.studentSearchParams.dob.startDate, formatter);
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
