<template>
  <v-form ref="studentSearchForm" id="searchStudentForm"
        v-model="validForm"
      >
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
                  v-model="studentSearchParams.pen"
                  color="#003366"
                  label="PEN"
                  maxlength="40"
                  dense
                ></v-text-field>
            </v-col>
            <v-col class="py-0 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3">
              <v-text-field
                id='legalSurame'
                v-model="studentSearchParams.legalSurame"
                color="#003366"
                label="Legal Surname"
                maxlength="40"
                dense
                ></v-text-field>
              <v-text-field
                id='usualSurname'
                v-model="studentSearchParams.usualSurname"
                color="#003366"
                label="Usual Surname"
                maxlength="40"
                dense
              ></v-text-field>
            </v-col>
            <v-col class="py-0 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3">
              <v-text-field
                id='legalGivenName'
                v-model="studentSearchParams.legalGivenName"
                color="#003366"
                label="Legal Given"
                maxlength="40"
                dense
              ></v-text-field>
              <v-text-field
                id='usualGiven'
                v-model="studentSearchParams.usualGiven"
                color="#003366"
                label="Usual Given"
                maxlength="40"
                dense
                ></v-text-field>
            </v-col>
            <v-col class="py-0 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3">
              <v-text-field
                id='legalMiddleName'
                v-model="studentSearchParams.legalMiddleName"
                color="#003366"
                label="Legal Middle"
                maxlength="40"
                dense
              ></v-text-field>
              <v-text-field
                id='usualMiddle'
                v-model="studentSearchParams.usualMiddle"
                color="#003366"
                label="Usual Middle"
                maxlength="40"
                dense
              ></v-text-field>
            </v-col>
            <v-col cols="1" class="py-0 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3">
              <v-text-field
                id='postalCode'
                v-model="studentSearchParams.postalCode"
                color="#003366"
                label="Postal Code"
                maxlength="40"
                dense
              ></v-text-field>
              <v-text-field
                id='memo'
                v-model="studentSearchParams.memo"
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
                v-model="studentSearchParams.gender"
                color="#003366"
                label="Gender"
                maxlength="1"
                dense
              ></v-text-field>
              <v-text-field
                id='localID'
                v-model="studentSearchParams.localID"
                color="#003366"
                label="Local ID"
                maxlength="40"
                dense
              ></v-text-field>
            </v-col>
            <v-col cols="1" class="py-0 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3">
              <v-text-field
                id='dob'
                v-model="studentSearchParams.dob"
                color="#003366"
                label="Birth Date"
                maxlength="40"
                dense
              ></v-text-field>
              <v-text-field
                id='grade'
                v-model="studentSearchParams.grade"
                color="#003366"
                label="Grade"
                maxlength="40"
                dense
              ></v-text-field>
            </v-col>
            <v-col class="py-0 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3">
              <v-text-field
                id='school'
                v-model="studentSearchParams.school"
                color="#003366"
                label="School"
                maxlength="40"
                dense
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row align="end" no-gutters style="background-color:white;">
            <v-col align="end" class="py-3 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3">
                <v-btn disabled outlined class="mx-2" color="#38598a">Advanced Search</v-btn><v-btn class="white--text" color="#38598a" @click="searchStudent">Search</v-btn>
            </v-col>
          </v-row>
        </v-card>
      </v-row>
    </v-container>
  </v-form>
</template>

<script>
import {LocalDate} from '@js-joda/core';
import ApiService from '../../../common/apiService';
import { Routes } from '../../../utils/constants';
import { mapGetters } from 'vuex';

export default {
  data() {
    return {
      validForm: false,
      menu: false,
      genderLabels: [],
      localDate:LocalDate,
      studentSearchParams: {
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
  computed:{
    ...mapGetters('app', ['requestType']),
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
    searchStudent() {
      if(this.$refs.studentSearchForm.validate()) {
        const studentSearchKeys = Object.keys(this.studentSearchParams).filter(k => (this.studentSearchParams[k] && this.studentSearchParams[k].length !== 0));
        let studentSearchFilters;
        if (studentSearchKeys && studentSearchKeys.length > 0) {
          studentSearchFilters = {};
          studentSearchKeys.forEach(element => {
            studentSearchFilters[element] = this.studentSearchParams[element];
          });
        }
        ApiService.apiAxios
          .get(Routes[this.requestType].SEARCH_URL,this.prepPut(studentSearchFilters))
          .then(response => {
            console.log('HELLO');
            console.log(JSON.stringify(response.data));
          })
          .catch(error => {
            console.log(error);
            this.completedUpdateSuccess = false;
          })
          .finally(() => {
            console.log('SUBMITTED');
          });
      }
    },    
    prepPut(studentSearchFilters) {
      return {
        params: {
          searchQueries: studentSearchFilters
        }
      };
    },
    save(date) {
      this.$refs.menu.save(date);
      this.$refs.birthdate.$el.querySelectorAll('#birthdate')[0].focus();
    },
  }
};
</script>
