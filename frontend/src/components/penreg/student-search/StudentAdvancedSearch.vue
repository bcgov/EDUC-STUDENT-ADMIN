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
        <v-col cols="2">Date of Birth</v-col>
        <v-col cols="3">
          <v-row no-gutters>
            <v-col cols="4"><v-text-field v-model="startDOB.year" dense filled outlined minLength="4" maxlength="4" placeholder="YYYY"></v-text-field></v-col>
            <v-col cols="3" class="mx-2"><v-text-field v-model="startDOB.month" dense filled outlined placeholder="MM"></v-text-field></v-col>
            <v-col cols="3"><v-text-field v-model="startDOB.day" dense filled outlined placeholder="DD"></v-text-field></v-col>
          </v-row>
        </v-col>
        <v-col cols="2">
          <v-checkbox class="ma-0 pa-0" height="100%" label="Use range" v-model="useDOBRange"></v-checkbox>
        </v-col>
        <v-col cols="3">
          <v-row no-gutters v-if="this.useDOBRange">
            <v-col cols="4" class="ml-3"><v-text-field dense filled outlined placeholder="YYYY" v-model="endDOB.year"></v-text-field></v-col>
            <v-col cols="3" class="mx-2"><v-text-field dense filled outlined placeholder="MM" v-model="endDOB.month"></v-text-field></v-col>
            <v-col cols="3"><v-text-field dense filled outlined placeholder="DD" v-model="endDOB.day"></v-text-field></v-col>
          </v-row>
        </v-col>
      </v-row>
      <v-row no-gutters class="textFieldRow">
        <v-col cols="2">Gender</v-col>
        <v-col cols="2" id="genderCol">
          <v-text-field dense filled outlined
            id='genderCode'
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
            v-on:input="searchHasValues">
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
          <v-checkbox class="ma-0 pa-0" height="100%" label="Audit history"></v-checkbox>
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
          <v-text-field dense filled outlined
            id='legalLastName'
            v-model="studentSearchParams.legalLastName"
            @keyup.enter="enterPushed()"
            v-on:input="searchHasValues"
            maxlength="255">
          </v-text-field>
          <v-col cols="1" class="ml-4">
            <v-row no-gutters justify="center">
              <v-checkbox disabled class="ma-0 pa-0"></v-checkbox>
            </v-row>
          </v-col>
        </v-row>
        <v-row no-gutters class="textFieldRow">
          <v-col cols="3">Legal Given</v-col>
          <v-text-field dense filled outlined
            id='legalFirstName'
            v-model="studentSearchParams.legalFirstName"
            @keyup.enter="enterPushed()"
            v-on:input="searchHasValues"
            maxlength="255">
          </v-text-field>
          <v-col cols="1" class="ml-4">
            <v-row no-gutters justify="center">
              <v-checkbox disabled class="ma-0 pa-0"></v-checkbox>
            </v-row>
          </v-col>
        </v-row>
        <v-row no-gutters class="textFieldRow">
          <v-col cols="3">Legal Middle</v-col>
          <v-text-field dense filled outlined
            id='legalMiddleNames'
            v-model="studentSearchParams.legalMiddleNames"
            v-on:input="searchHasValues"
            @keyup.enter="enterPushed()"
            maxlength="255">
          </v-text-field>
          <v-col cols="1" class="ml-4">
            <v-row no-gutters justify="center">
              <v-checkbox disabled class="ma-0 pa-0"></v-checkbox>
            </v-row>
          </v-col>
        </v-row>
        <v-row no-gutters class="textFieldRow">
          <v-col cols="3">Usual Surname</v-col>
          <v-text-field dense filled outlined
            id='usualLastName'
            v-model="studentSearchParams.usualLastName"
            @keyup.enter="enterPushed()"
            v-on:input="searchHasValues"
            maxlength="255">
          </v-text-field>
          <v-col cols="1" class="ml-4">
            <v-row no-gutters justify="center">
              <v-checkbox disabled class="ma-0 pa-0"></v-checkbox>
            </v-row>
          </v-col>
        </v-row>
        <v-row no-gutters class="textFieldRow">
          <v-col cols="3">Usual Given</v-col>
          <v-text-field dense filled outlined
            id='usualFirstName'
            v-model="studentSearchParams.usualFirstName"
            @keyup.enter="enterPushed()"
            v-on:input="searchHasValues"
            maxlength="255"></v-text-field>
          <v-col cols="1" class="ml-4">
            <v-row no-gutters justify="center">
              <v-checkbox disabled class="ma-0 pa-0"></v-checkbox>
            </v-row>
          </v-col>
        </v-row>
        <v-row no-gutters class="textFieldRow">
          <v-col cols="3">Usual Middle</v-col>
          <v-text-field dense filled outlined
            id='usualMiddleNames'
            v-model="studentSearchParams.usualMiddleNames"
            @keyup.enter="enterPushed()"
            v-on:input="searchHasValues"
            maxlength="255"></v-text-field>
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
      if(this.startDOB.year && this.startDOB.month && this.startDOB.day) {
        return Object.values(this.startDOB).join('/');
      }
      return null;
    },
    formattedEndDOB() {
      if(this.endDOB.year && this.endDOB.month && this.endDOB.day) {
        return Object.values(this.endDOB).join('/');
      }
      return null;
    },
  }
};
</script>
<style>
  .textFieldRow{
    height: 3rem;
  }
  #genderCol /deep/ .v-input__slot {
    width:50%;
  }
</style>
