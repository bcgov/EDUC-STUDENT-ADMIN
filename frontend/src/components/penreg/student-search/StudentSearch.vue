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
                  maxlength="9"
                  minglength="9"
                  dense
                  :rules="validatePen()"
                ></v-text-field>
            </v-col>
            <v-col class="py-0 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3">
              <v-text-field
                id='legalLastName'
                v-model="studentSearchParams.legalLastName"
                color="#003366"
                label="Legal Surname"
                maxlength="255"
                dense
                ></v-text-field>
              <v-text-field
                id='usualLastName'
                v-model="studentSearchParams.usualLastName"
                color="#003366"
                label="Usual Surname"
                maxlength="255"
                dense
              ></v-text-field>
            </v-col>
            <v-col class="py-0 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3">
              <v-text-field
                id='legalFirstName'
                v-model="studentSearchParams.legalFirstName"
                color="#003366"
                label="Legal Given"
                maxlength="255"
                dense
              ></v-text-field>
              <v-text-field
                id='usualFirstName'
                v-model="studentSearchParams.usualFirstName"
                color="#003366"
                label="Usual Given"
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
                maxlength="255"
                dense
              ></v-text-field>
              <v-text-field
                id='usualMiddleNames'
                v-model="studentSearchParams.usualMiddleNames"
                color="#003366"
                label="Usual Middle"
                maxlength="255"
                dense
              ></v-text-field>
            </v-col>
            <v-col cols="1" class="py-0 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3">
              <v-text-field
                id='postalCode'
                v-model="studentSearchParams.postalCode"
                color="#003366"
                label="Postal Code"
                maxlength="7"
                :rules="validatePostal()"
                dense
              ></v-text-field>
              <v-text-field
                id='memo'
                v-model="studentSearchParams.memo"
                color="#003366"
                disabled
                label="Memo"
                maxlength="25"
                dense
              ></v-text-field>
            </v-col>
            <v-col cols="1" class="py-0 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3">
              <v-text-field
                id='genderCode'
                v-model="studentSearchParams.genderCode"
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
                maxlength="12"
                dense
              ></v-text-field>
            </v-col>
            <v-col cols="1" class="py-0 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3">
              <v-text-field
                id='dob'
                v-model="studentSearchParams.dob"
                color="#003366"
                label="Birth Date"
                maxlength="9"
                minLength="9"
                dense
              ></v-text-field>
              <v-text-field
                id='grade'
                v-model="studentSearchParams.grade"
                color="#003366"
                label="Grade"
                maxlength="2"
                minLength="1"
                dense
              ></v-text-field>
            </v-col>
            <v-col class="py-0 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3">
              <v-text-field
                id='school'
                v-model="studentSearchParams.school"
                color="#003366"
                label="School"
                counter=false
                maxlength="8"
                minLength="8"
                dense
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row align="end" no-gutters style="background-color:white;">
            <v-col align="end" class="py-3 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3">
                <v-btn disabled outlined class="mx-2" color="#38598a">Advanced Search</v-btn><v-btn class="white--text" :loading="searchLoading" color="#38598a" @click="searchStudent(true)">Search</v-btn>
            </v-col>
          </v-row>
          <v-row no-gutters class="py-2" style="background-color:white;">
            <v-divider class="mx-3"/>
          </v-row>
          <v-row v-if="this.studentSearchResponse" id="resultsRow" no-gutters class="py-2" style="background-color:white;">
            <StudentSearchResults
                    :tableData="this.studentSearchResponse"
                    :searchCriteria="this.studentSearchParams"
                    :search="searchStudent"
                    :key="studentSearchResultsKey"
            ></StudentSearchResults>
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
import { mapGetters, mapMutations } from 'vuex';
import StudentSearchResults from './StudentSearchResults';

export default {
  components: {
    StudentSearchResults
  },
  data() {
    return {
      penHint: 'Invalid PEN',
      postalCodeHint: 'Invalid Postal Code',
      validForm: false,
      menu: false,
      genderLabels: [],
      localDate:LocalDate,
      studentSearchResponse: null,
      searchLoading: false,
      studentSearchParams: {
        pen: null,
        legalLastName: null,
        legalFirstName: null,
        legalMiddleNames: null,
        postalCode: null,
        genderCode: null,
        dob: null,
        school: null,
        usualLastName: null,
        usualFirstName: null,
        usualMiddleNames: null,
        memo: null,
        localID: null,
        grade: null
      },
      studentSearchResultsKey: 0
    };
  },
  computed:{
    ...mapGetters('app', ['requestType']),
    ...mapMutations('penReg', ['pageNumber']),
    charRules() {
      return [
        v => !(/[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F\u1100-\u11FF\u3040-\u309F\u30A0-\u30FF\u3130-\u318F\u3400-\u4DBF\u4E00-\u9FFF\uAC00-\uD7AF]/.test(v)) || 'Enter English characters only'
      ];
    },
  },
  methods: {
  ...mapMutations('penReg', ['setPageNumber']),
    validatePen() {
      var validPEN = false;
      if(this.studentSearchParams) {
        if (!this.studentSearchParams.pen){
          validPEN = true;
        }else if (this.studentSearchParams.pen.length === 9) {
          if (this.checkDigit()) {
            validPEN = true;
          }else{
            validPEN = false;
          } 
        }
      }
      if(validPEN){
        return [];
      }else{
        return [
          this.penHint
        ];   
      }
    },
    validatePostal(){
      if(this.studentSearchParams) {
        if(!this.studentSearchParams.postalCode){
          return [];
        }
        else {
          if(this.studentSearchParams.postalCode.match('^[abceghjklmnprstvxyABCEGHJKLMNPRSTVXY][0-9][abceghjklmnprstvwxyzABCEGHJKLMNPRSTVWXYZ] {0,1}[0-9][abceghjklmnprstvwxyzABCEGHJKLMNPRSTVWXYZ][0-9]$')){
            return [];
          }
        }
      }
      return [
        this.postalCodeHint
      ];   
    },
    requiredRules(hint = 'Required') {
      return [
        v => !!(v && v.trim()) || hint,
        ...this.charRules
      ];
    },
    checkDigit() {
      const penDigits = [];
      
      for(let i = 0; i < this.studentSearchParams.pen.length; i++) {
        penDigits[i] = parseInt(this.studentSearchParams.pen.charAt(i), 10);
      }
      const S1 = penDigits.slice(0,-1).filter((element,index) => {return index % 2 === 0;}).reduce((a,b) => a+b,0);
      const A = parseInt(penDigits.slice(0,-1).filter((element,index) => {return index % 2 === 1;}).join(''), 10);
      const B = 2 * A;
      let S2 = B.toString().split('').map(Number).reduce(function (a, b) {return a + b;}, 0);
      const S3 = S1 + S2;
      if((S3 % 10) === 0) {
        return penDigits.pop() === 0;
      }
      return penDigits.pop() === (10 - (S3%10));
    },
    focusBirthdateField(event) {
      if(event.key === 'Tab' && event.type === 'keyup') {
        this.menu = true;
      }
    },
    searchStudent(isInitialSearch) {
      this.searchLoading = true;
      this.studentSearchResultsKey += 1; //forces StudentSearchResults to rerender and update curPage
      if(isInitialSearch){
        this.setPageNumber(1);
      }
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
            this.studentSearchResponse = response.data;
          })
          .catch(error => {
            console.log(error);
            this.completedUpdateSuccess = false;
          })
          .finally(() => {
            this.searchLoading = false;
          });
      }else{
        this.searchLoading = false;
      }
    },    
    prepPut(studentSearchFilters) {
      return {
        params: {
          pageNumber: this.pageNumber-1,
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
