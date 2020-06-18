<template>
  <v-container class="fill-height px-0">
    <v-row no-gutters>
      <v-card height="100%" width="100%"  style="background-color:#d7d7d7;">
        <v-row no-gutters class="mx-5 pa-6">
          <v-col>
            <h3>Student Search</h3>
          </v-col>
        </v-row>
        <v-row no-gutters class="py-2" style="background-color:white;">
          <v-col cols="1" class="py-0 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3">
              <v-text-field
                id='pen'
                v-model="studentSearch.pen"
                color="#003366"
                label="PEN"
                maxlength="40"
                dense
              ></v-text-field>
          </v-col>
          <v-col class="py-0 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3">
            <v-text-field
              id='legalSurame'
              v-model="studentSearch.legalSurame"
              color="#003366"
              label="Legal Surname"
              maxlength="40"
              dense
              ></v-text-field>
            <v-text-field
              id='usualSurname'
              v-model="studentSearch.usualSurname"
              color="#003366"
              label="Usual Surname"
              maxlength="40"
              dense
            ></v-text-field>
          </v-col>
          <v-col class="py-0 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3">
            <v-text-field
              id='legalGivenName'
              v-model="studentSearch.legalGivenName"
              color="#003366"
              label="Legal Given"
              maxlength="40"
              dense
            ></v-text-field>
            <v-text-field
              id='usualGiven'
              v-model="studentSearch.usualGiven"
              color="#003366"
              label="Usual Given"
              maxlength="40"
              dense
              ></v-text-field>
          </v-col>
          <v-col class="py-0 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3">
            <v-text-field
              id='legalMiddleName'
              v-model="studentSearch.legalMiddleName"
              color="#003366"
              label="Legal Middle"
              maxlength="40"
              dense
            ></v-text-field>
            <v-text-field
              id='usualMiddle'
              v-model="studentSearch.usualMiddle"
              color="#003366"
              label="Usual Middle"
              maxlength="40"
              dense
            ></v-text-field>
          </v-col>
          <v-col cols="1" class="py-0 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3">
            <v-text-field
              id='postalCode'
              v-model="studentSearch.postalCode"
              color="#003366"
              label="Postal Code"
              maxlength="40"
              dense
            ></v-text-field>
            <v-text-field
              id='memo'
              v-model="studentSearch.memo"
              color="#003366"
              disabled
              label="Memo"
              maxlength="40"
              dense
            ></v-text-field>
          </v-col>
          <v-col cols="1" class="py-0 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3">
            <v-text-field
              id='gender'
              v-model="studentSearch.gender"
              color="#003366"
              label="Gender"
              maxlength="1"
              dense
            ></v-text-field>
            <v-text-field
              id='localID'
              v-model="studentSearch.localID"
              color="#003366"
              label="Local ID"
              maxlength="40"
              dense
            ></v-text-field>
          </v-col>
          <v-col cols="1" class="py-0 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3">
            <v-text-field
              id='dob'
              v-model="studentSearch.dob"
              color="#003366"
              label="Birth Date"
              maxlength="40"
              dense
            ></v-text-field>
            <v-text-field
              id='grade'
              v-model="studentSearch.grade"
              color="#003366"
              label="Grade"
              maxlength="40"
              dense
            ></v-text-field>
          </v-col>
          <v-col class="py-0 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3">
            <v-text-field
              id='school'
              v-model="studentSearch.school"
              color="#003366"
              label="School"
              maxlength="40"
              dense
            ></v-text-field>
          </v-col>
        </v-row>
        <v-row align="end" no-gutters style="background-color:white;">
          <v-col align="end" class="py-3 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3">
              <v-btn disabled outlined class="mx-2" color="#38598a">Advanced Search</v-btn><v-btn class="white--text" color="#38598a">Search</v-btn>
          </v-col>
        </v-row>
      </v-card>
    </v-row>
  </v-container>
</template>

<script>
import {LocalDate} from '@js-joda/core';

export default {
  data() {
    return {
      menu: false,
      genderLabels: [],
      localDate:LocalDate,
      studentSearch: {
        pen: null,
        legalSurame: null,
        legalGivenName: null,
        legalMiddleName: null,
        postalCode: null,
        gender: null,
        dob: null,
        school: null,
        usualSurname: null,
        usualGiven: null,
        usualMiddle: null,
        memo: null,
        localID: null,
        grade: null
      },
    };
  },
  methods: {
    requiredRules(hint = 'Required') {
      return [
        v => !!(v && v.trim()) || hint,
        ...this.charRules
      ];
    },
    focusBirthdateField(event) {
      if(event.key === 'Tab' && event.type === 'keyup') {
        this.menu = true;
      }
    },
    save(date) {
      this.$refs.menu.save(date);
      this.$refs.birthdate.$el.querySelectorAll('#birthdate')[0].focus();
    },
  }
};
</script>
