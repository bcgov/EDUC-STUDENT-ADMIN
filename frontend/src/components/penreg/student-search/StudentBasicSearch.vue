<!--Deprecated -->
<template>
  <v-row
    no-gutters
    class="py-2"
    style="background-color:white;"
  >
    <v-col
      cols="1"
      class="py-0 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3"
    >
      <v-text-field
        id="pen"
        v-model="studentSearchParams.pen"
        color="#003366"
        label="PEN"
        maxlength="9"
        minlength="9"
        tabindex="1"
        dense
        autofocus
        :rules="validatePen()"
        @keyup.enter="enterPushed()"
        @input="[searchHasValues(),runPENSearchIfPossible()]"
      />
    </v-col>
    <v-col class="py-0 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3">
      <v-text-field
        id="legalLastName"
        v-model="studentSearchParams.legalLastName"
        color="#003366"
        label="Legal Surname"
        maxlength="255"
        tabindex="2"
        dense
        @keyup.enter="enterPushed()"
        @input="searchHasValues"
      />
      <v-text-field
        id="usualLastName"
        v-model="studentSearchParams.usualLastName"
        color="#003366"
        label="Usual Surname"
        tabindex="9"
        maxlength="255"
        dense
        @keyup.enter="enterPushed()"
        @input="searchHasValues"
      />
    </v-col>
    <v-col class="py-0 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3">
      <v-text-field
        id="legalFirstName"
        v-model="studentSearchParams.legalFirstName"
        tabindex="3"
        color="#003366"
        label="Legal Given"
        maxlength="255"
        dense
        @keyup.enter="enterPushed()"
        @input="searchHasValues"
      />
      <v-text-field
        id="usualFirstName"
        v-model="studentSearchParams.usualFirstName"
        color="#003366"
        label="Usual Given"
        tabindex="10"
        maxlength="255"
        dense
        @keyup.enter="enterPushed()"
        @input="searchHasValues"
      />
    </v-col>
    <v-col class="py-0 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3">
      <v-text-field
        id="legalMiddleNames"
        v-model="studentSearchParams.legalMiddleNames"
        color="#003366"
        label="Legal Middle"
        tabindex="4"
        maxlength="255"
        dense
        @input="searchHasValues"
        @keyup.enter="enterPushed()"
      />
      <v-text-field
        id="usualMiddleNames"
        v-model="studentSearchParams.usualMiddleNames"
        color="#003366"
        label="Usual Middle"
        tabindex="11"
        maxlength="255"
        dense
        @keyup.enter="enterPushed()"
        @input="searchHasValues"
      />
    </v-col>
    <v-col
      cols="1"
      class="py-0 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3"
    >
      <v-text-field
        id="postalCode"
        v-model="studentSearchParams.postalCode"
        tabindex="5"
        color="#003366"
        label="Postal Code"
        maxlength="7"
        :rules="validatePostal()"
        dense
        @input="[searchHasValues(),uppercasePostal()]"
        @keyup.enter="enterPushed()"
      />
      <v-text-field
        id="memo"
        v-model="studentSearchParams.memo"
        color="#003366"
        tabindex="12"
        label="Memo"
        maxlength="25"
        dense
        @keyup.enter="enterPushed()"
        @input="searchHasValues"
      />
    </v-col>
    <v-col
      cols="1"
      class="py-0 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3"
    >
      <v-text-field
        id="genderCode"
        v-model="studentSearchParams.genderCode"
        tabindex="6"
        color="#003366"
        label="Gender"
        maxlength="1"
        :rules="validateGender()"
        dense
        @keyup.enter="enterPushed()"
        @input="[searchHasValues(),uppercaseGender()]"
      />
      <v-text-field
        id="localID"
        v-model="studentSearchParams.localID"
        color="#003366"
        tabindex="13"
        label="Local ID"
        maxlength="12"
        dense
        @keyup.enter="enterPushed()"
        @input="searchHasValues"
      />
    </v-col>
    <v-col
      cols="1"
      class="py-0 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3"
    >
      <v-text-field
        id="dob"
        v-model="studentSearchParams.dob.startDate"
        tabindex="7"
        color="#003366"
        label="Birth Date"
        :rules="validateDOB()"
        maxlength="10"
        min-length="10"
        dense
        @keyup.enter="enterPushed()"
        @input="searchHasValues"
      />
      <v-text-field
        id="gradeCode"
        v-model="studentSearchParams.gradeCode"
        color="#003366"
        label="Grade"
        tabindex="14"
        maxlength="2"
        :rules="validateGradeCode()"
        min-length="1"
        dense
        @keyup.enter="enterPushed()"
        @input="[searchHasValues(), uppercaseGrade()]"
      />
    </v-col>
    <v-col
      cols="1"
      class="py-0 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3"
    >
      <v-text-field
        id="mincode"
        v-model="studentSearchParams.mincode"
        tabindex="8"
        color="#003366"
        label="Mincode"
        maxlength="8"
        min-length="8"
        :rules="validateMincode()"
        dense
        @keyup.enter="enterPushed()"
        @input="searchHasValues"
      />
    </v-col>
  </v-row>
</template>

<script>

import { mapState, mapActions } from 'pinia';
import { isValidDob } from '../../../utils/validation';
import {studentSearchStore} from '@/store/modules/studentSearch';

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
    uppercaseGrade: {
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
      dobHint: 'Invalid Birth Date',
    };
  },
  mounted() {
    if(this.studentSearchParams.dob.endDate) {
      this.studentSearchParams.dob.endDate = null; //clears lingering range search from advanced search view
    }
    this.setIsAdvancedSearch(false);
  },
  computed: {
    ...mapState(studentSearchStore, ['studentSearchParams']),
  },
  methods: {
    ...mapActions(studentSearchStore, ['setIsAdvancedSearch']),
    validateDOB(){
      if(this.studentSearchParams) {
        if(!this.studentSearchParams.dob.startDate || isValidDob(this.studentSearchParams.dob.startDate)){
          return [];
        }
      }
      return [
        this.dobHint
      ];
    }
  }
};
</script>
