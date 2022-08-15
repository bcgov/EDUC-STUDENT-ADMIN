<template>
  <v-card class="add-student" min-width="490px">

    <v-alert
      id="addStudentAlert"
      dense
      outlined
      dismissible
      v-model="alert"
      :class="alertType"
      class="mb-3"
    >
      {{ alertMessage }}
    </v-alert>
    <v-form
      ref="form"
      v-model="validForm"
    >
      <v-row row d-flex nowrap align="center" justify="center" class="px-2">
        <v-text-field class="pr-5"
                      clearable
                      v-model="penNumber"
                      placeholder="Enter a Student's PEN"
                      :rules="penRules"
                      maxlength="9"
                      counter="9"
                      id="studentPenTextField">
        </v-text-field>
        <PrimaryButton width="6rem" :disabled="enableSearchButton" id="searchPenBtn" text="Search"
                       :loading="isSearchingStudent"
                       @click.native="searchStudentForGivenPEN"/>
      </v-row>
    </v-form>
    <v-row no-gutters v-if="showStudentDetails">
      <v-icon x-large v-if="showStudentDetails" class="pr-2">mdi-account-box-outline</v-icon>
      <div :class="['d-flex', 'flex-column']">
        <strong>{{ this.student['studentName'] }}</strong>
        <span>{{ this.student['studentLocalID'] }}</span>
        <span>{{ this.student['studentDoB'] }}</span>
        <span>{{ this.student['studentGender'] }}</span>
      </div>
    </v-row>
    <v-row class="justify-end pr-2 pt-2" >
      <PrimaryButton id="cancelAddStudentBtn" secondary text="Cancel" class="mr-2"
                     @click.native="closeForm"></PrimaryButton>
      <PrimaryButton :disabled="!studentExist" id="addStudentToNewMessageBtn"
                     text="Add" width="5rem" @click.native="addStudentToMessage"></PrimaryButton>
    </v-row>
  </v-card>
</template>

<script>
import ApiService from '@/common/apiService';
import alertMixin from '@/mixins/alertMixin';
import PrimaryButton from '@/components/util/PrimaryButton';
import {isValidPEN} from '@/utils/validation';
import {Routes} from '@/utils/constants';

export default {
  components: {PrimaryButton},
  mixins: [alertMixin],
  props: {
    eager: {
      type: Boolean,
      default: false
    },
    mincode: {
      type: String,
      required: true
    },
    additionalStudentAddWarning:{
      type: String,
      required: false,
      default: ''
    }
  },
  data() {
    return {
      isSearchingStudent: false,
      showStudentDetails: false,
      penNumber: null,
      validForm: false,
      penRules: [v => (!v || isValidPEN(v))],
      studentExist: false,
      student: {},
      alert: false,
      alertMessage: null,
      alertType: null
    };
  },
  computed: {
    enableSearchButton() {
      return !(isValidPEN(this.penNumber));
    }
  },
  watch: {
    additionalStudentAddWarning(newVal){
      if(newVal){
        this.setInfoAlert(newVal);
      }
    },
    alert(newVal){
      if(!newVal){
        this.$emit('updateAdditionalStudentAddWarning','');
      }
    },
    penNumber(newVal) {
      if (!(isValidPEN(newVal))) {
        this.student = {};
        this.showStudentDetails=false;
        this.studentExist=false;
        this.alert = false;
      }
    },
  },
  methods: {
    setErrorAlert(alertMessage) {
      this.alertMessage = alertMessage;
      this.alertType = 'bootstrap-error';
      this.alert = true;
    },
    setInfoAlert(alertMessage) {
      this.alertMessage = alertMessage;
      this.alertType = 'bootstrap-info';
      this.alert = true;
    },
    searchStudentForGivenPEN() {
      this.isSearchingStudent = true;
      this.studentExist = false;
      this.student = {};
      ApiService.apiAxios.get(Routes.student.ROOT_ENDPOINT + '?pen=' + this.penNumber)
        .then(response => {
          this.populateStudentInfoCard(response.data);
        })
        .catch(() => {
          this.setErrorAlert('PEN must be a valid PEN associated with a student');
        }).finally(() => {
          this.isSearchingStudent = false;
        });
    },
    populateStudentInfoCard(data) {
      this.alert = false;
      this.studentExist = true;
      this.showStudentDetails = true;
      this.student = {};
      this.student['pen']=data.pen;
      this.student['studentID'] = data.studentID;
      this.student['studentName'] = data.legalFirstName + ' ' + (data.legalMiddleNames ?? '') + ' ' + data.legalLastName;
      this.student['studentLocalID'] = data.localID;
      this.student['studentGender'] = data.genderCode;
      this.student['studentDoB'] = data.dob;
      if (data.mincode !== this.mincode) {
        this.setInfoAlert('This student\'s mincode does not match the school which you are sending the message.');
      } else{
        this.alert = false;
      }
    },
    closeForm() {
      this.resetForm();
      this.$emit('close:form');
    },
    resetForm() {
      this.$refs.form.reset();
      this.alert = false;
      this.alertMessage = null;
    },
    validate() {
      this.$refs.form.validate();
    },
    addStudentToMessage() {
      let secureExchangeStudent = {
        studentID: this.student['studentID'],
        pen: this.student['pen'],
      };
      this.$emit('addStudent', secureExchangeStudent);
      this.resetForm();
      this.$emit('close:form');
    },
  },
};
</script>
<style scoped>
.add-student {
  padding: 1.1rem;
  max-width: 50rem;
  min-width: 10rem;
}
p {
  padding-top: 10px;
}
ul {
  width: 100%;
}
h3 {
  font-size: 1.2rem
}
.v-alert >>> .v-alert__content {
  max-width: 28em;
}
</style>
