<template>
  <v-row
    no-gutters
    class="py-2 search-inputs"
    style="background-color:white;"
  >
    <v-col
      cols="1"
      order="1"
      class="py-0 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3"
    >
      <v-text-field
        id="mincode"
        v-model="searchParams.mincode"
        tabindex="1"
        color="#003366"
        label="Mincode"
        maxlength="8"
        min-length="8"
        :rules="validateField(searchParams.mincode, isValidMincode, mincodeHint)"
        density="compact"
        variant="underlined"
        autofocus
        @keyup.enter="enterPushed()"
        @input="searchHasValues"
      />
    </v-col>
    <v-col
      order="1"
      class="py-0 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3 search-input"
    >
      <v-text-field
        id="legalLastName"
        v-model.trim="searchParams.legalLastName"
        color="#003366"
        label="Legal Surname"
        maxlength="255"
        variant="underlined"
        tabindex="2"
        density="compact"
        @keyup.enter="enterPushed()"
        @input="[searchHasValues(),upperCaseInput('legalLastName')]"
      />
    </v-col>
    <v-col
      order="1"
      class="py-0 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3 search-input"
    >
      <v-text-field
        id="legalFirstName"
        v-model.trim="searchParams.legalFirstName"
        tabindex="3"
        color="#003366"
        label="Legal Given"
        variant="underlined"
        maxlength="255"
        density="compact"
        @keyup.enter="enterPushed()"
        @input="[searchHasValues(),upperCaseInput('legalFirstName')]"
      />
    </v-col>
    <v-col
      v-if="!(fields.legalMiddleNames && fields.legalMiddleNames.hidden)"
      order="1"
      class="py-0 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3 search-input"
    >
      <v-text-field
        id="legalMiddleNames"
        v-model.trim="searchParams.legalMiddleNames"
        color="#003366"
        label="Legal Middle"
        variant="underlined"
        tabindex="4"
        maxlength="255"
        density="compact"
        @input="[searchHasValues(),upperCaseInput('legalMiddleNames')]"
        @keyup.enter="enterPushed()"
      />
    </v-col>
    <v-col
      order="1"
      class="py-0 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3 search-input"
    >
      <v-text-field
        id="genderCode"
        v-model="searchParams.genderCode"
        tabindex="5"
        color="#003366"
        label="Gender"
        variant="underlined"
        maxlength="1"
        :rules="validateField(searchParams.genderCode, isValidGender, genderHint)"
        density="compact"
        @keyup.enter="enterPushed()"
        @input="[searchHasValues(),upperCaseInput('genderCode')]"
      />
    </v-col>
    <v-col
      order="1"
      class="py-0 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3 search-input"
    >
      <v-text-field
        id="dob"
        v-model="searchParams.dob"
        tabindex="6"
        color="#003366"
        label="Birth Date"
        variant="underlined"
        :rules="validateField(searchParams.dob, isValidDob, dobHint)"
        maxlength="10"
        min-length="10"
        density="compact"
        @keyup.enter="enterPushed()"
        @input="searchHasValues"
      />
    </v-col>
    <v-col
      v-if="!(fields.bestMatchPEN && fields.bestMatchPEN.hidden)"
      order="1"
      class="py-0 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3 search-input"
    >
      <v-text-field
        id="bestMatchPEN"
        v-model="searchParams.bestMatchPEN"
        color="#003366"
        label="Suggested PEN"
        maxlength="9"
        variant="underlined"
        minlength="9"
        tabindex="7"
        density="compact"
        :rules="validatePen(searchParams.bestMatchPEN)"
        @keyup.enter="enterPushed()"
        @input="[searchHasValues(),runPENSearchIfPossible('bestMatchPEN')]"
      />
    </v-col>
    <v-col
      :cols="fields.assignedPEN && fields.assignedPEN.cols !== undefined || 2"
      :order="fields.assignedPEN && fields.assignedPEN.order || 2"
      class="py-0 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3 search-input"
    >
      <v-text-field
        id="assignedPEN"
        v-model="searchParams.assignedPEN"
        color="#003366"
        label="Assigned PEN"
        variant="underlined"
        maxlength="9"
        minlength="9"
        :tabindex="fields.assignedPEN && fields.assignedPEN.tabindex || 8"
        density="compact"
        :rules="validatePen(searchParams.assignedPEN)"
        @keyup.enter="enterPushed()"
        @input="searchHasValues"
      />
    </v-col>
    <v-col
      v-if="!(fields.localID && fields.localID.hidden)"
      cols="1"
      order="2"
      class="py-0 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3"
    >
      <v-text-field
        id="localID"
        v-model="searchParams.localID"
        color="#003366"
        tabindex="9"
        variant="underlined"
        label="Local ID"
        maxlength="12"
        :rules="validateField(searchParams.localID)"
        density="compact"
        @keyup.enter="enterPushed()"
        @input="searchHasValues"
      />
    </v-col>
    <v-col
      v-if="!(fields.usualLastName && fields.usualLastName.hidden)"
      order="2"
      class="py-0 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3 search-input"
    >
      <v-text-field
        id="usualLastName"
        v-model.trim="searchParams.usualLastName"
        color="#003366"
        label="Usual Surname"
        tabindex="10"
        variant="underlined"
        maxlength="255"
        density="compact"
        @keyup.enter="enterPushed()"
        @input="[searchHasValues(),upperCaseInput('usualLastName')]"
      />
    </v-col>
    <v-col
      v-if="!(fields.usualFirstName && fields.usualFirstName.hidden)"
      order="2"
      class="py-0 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3 search-input"
    >
      <v-text-field
        id="usualFirstName"
        v-model.trim="searchParams.usualFirstName"
        color="#003366"
        label="Usual Given"
        tabindex="11"
        variant="underlined"
        maxlength="255"
        density="compact"
        @keyup.enter="enterPushed()"
        @input="[searchHasValues(),upperCaseInput('usualFirstName')]"
      />
    </v-col>
    <v-col
      v-if="!(fields.usualMiddleNames && fields.usualMiddleNames.hidden)"
      order="2"
      class="py-0 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3 search-input"
    >
      <v-text-field
        id="usualMiddleNames"
        v-model.trim="searchParams.usualMiddleNames"
        color="#003366"
        label="Usual Middle"
        tabindex="12"
        variant="underlined"
        maxlength="255"
        density="compact"
        @keyup.enter="enterPushed()"
        @input="[searchHasValues(),upperCaseInput('usualMiddleNames')]"
      />
    </v-col>
    <v-col
      v-if="!(fields.postalCode && fields.postalCode.hidden)"
      order="2"
      class="py-0 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3 search-input"
    >
      <v-text-field
        id="postalCode"
        v-model="searchParams.postalCode"
        tabindex="13"
        color="#003366"
        label="Postal Code"
        variant="underlined"
        maxlength="7"
        density="compact"
        @input="[searchHasValues(),upperCaseInput('postalCode')]"
        @keyup.enter="enterPushed()"
      />
    </v-col>
    <v-col
      order="2"
      class="py-0 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3 search-input"
    >
      <v-text-field
        id="gradeCode"
        v-model="searchParams.gradeCode"
        color="#003366"
        label="Grade"
        variant="underlined"
        tabindex="14"
        maxlength="2"
        :rules="validateField(searchParams.gradeCode, isValidGradeCode, gradeHint)"
        min-length="1"
        density="compact"
        @keyup.enter="enterPushed()"
        @input="[searchHasValues(), upperCaseInput('gradeCode')]"
      />
    </v-col>
    <v-col
      v-if="!(fields.submittedPen && fields.submittedPen.hidden)"
      order="2"
      class="py-0 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3 search-input"
    >
      <v-text-field
        id="submittedPen"
        v-model="searchParams.submittedPen"
        color="#003366"
        label="Submitted PEN"
        variant="underlined"
        maxlength="9"
        minlength="9"
        tabindex="15"
        density="compact"
        :rules="validatePen(searchParams.submittedPen)"
        @keyup.enter="enterPushed()"
        @input="[searchHasValues(),runPENSearchIfPossible('submittedPen')]"
      />
    </v-col>
    <v-col
      cols="2"
      order="4"
      class="py-0 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3"
    >
      <div class="d-flex justify-end pt-2">
        <PrimaryButton
          id="clear-search"
          class="mr-2"
          :secondary="true"
          @click-action="clearSearch"
          text="Clear"
        />
        <PrimaryButton
          id="perform-search"
          :disabled="!searchEnabled"
          :loading="loading && searchEnabled"
          @click-action="searchPenRequests"
          text="Search"
        />
      </div>
    </v-col>
  </v-row>
</template>
<script>
import { mapState } from 'pinia';
import PrimaryButton from '@/components/util/PrimaryButton.vue';
import {isValidAlphanumericValue, isValidDob, isValidMincode, isValidPEN} from '@/utils/validation';
import {studentStore} from '@/store/modules/student';

export default {
  name: 'PenRequestSearchPanel',
  components: {
    PrimaryButton,
  },
  props: {
    searchParams: {
      type: Object,
      required: true,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    fields: {
      type: Object,
      default: () => ({}),
    }
  },
  data() {
    return {
      penHint: 'Fails check-digit test',
      mincodeHint: 'Digits only',
      genderHint: 'Invalid gender',
      gradeHint: 'Invalid grade',
      dobHint: 'Invalid Birth Date',
      alphanumericHint: 'Alphanumeric only',
      searchEnabled: false,
    };
  },
  computed:{
    ...mapState(studentStore, ['gradeCodeObjects', 'genders']),
    genderCodes() {
      return this.genders ? this.genders.map(a => a.genderCode):[];
    },
    gradeCodes() {
      return this.gradeCodeObjects ? this.gradeCodeObjects.map(a => a.gradeCode):[];
    },
  },
  watch: {
    disabled: {
      handler(v) {
        this.searchEnabled = !v;
      },
    },
  },
  methods: {
    upperCaseInput(fieldName) {
      if (this.searchParams[fieldName]) {
        this.searchParams[fieldName] = this.searchParams[fieldName].toUpperCase();
      }
    },
    enterPushed() {
      if(this.searchHasValues()){
        this.$emit('search');
      }
    },
    runPENSearchIfPossible(field){
      const pen = this.searchParams[field];
      if(isValidPEN(pen)){
        this.$emit('searchByPen', [field, pen]);
      }
    },
    isValidGender(code) {
      return !!(code && this.genderCodes.includes(code.toUpperCase()));
    },
    isValidGradeCode(code) {
      return !!(code && this.gradeCodes.includes(code.toUpperCase()));
    },
    isValidMincode,
    isValidDob,
    validateField(value, validator=isValidAlphanumericValue, hint=this.alphanumericHint, length=0) {
      if(!value || validator(value)) {
        return [];
      }
      this.searchEnabled = false;
      if(value.length < length) {
        return [];
      } else {
        return [
          hint
        ];
      }
    },
    validatePen(pen) {
      if (pen && pen.length < 9) {
        this.searchEnabled = false;
        return ['Pen must be nine digits.'];
      }
      return this.validateField(pen, isValidPEN, this.penHint, 9);
    },
    searchHasValues(){
      this.searchEnabled = Object.values(this.searchParams).some(v => !!v);
      return this.searchEnabled;
    },
    clearSearch(){
      Object.keys(this.searchParams).forEach(key => {
        this.searchParams[key] = undefined;
      });
      this.$emit('search', true);
      this.searchEnabled = false;
    },
    searchPenRequests(){
      this.$emit('search');
    },
  }
};
</script>

<style scoped>
  .search-input {
    min-width: 12%;
  }
</style>
