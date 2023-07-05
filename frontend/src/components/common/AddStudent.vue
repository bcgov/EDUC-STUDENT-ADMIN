<template>
  <v-card class="add-student mb-1">
    <v-alert
      id="addStudentAlert"
      v-model="alert"
      density="compact"
      outlined
      dismissible
      :class="alertType"
      class="mb-3"
    >
      {{ alertMessage }}
    </v-alert>

    <v-row
      row
      d-flex
      nowrap
      style="min-width: 30em"
      align="center"
      justify="center"
      class="px-2"
    >
      <v-text-field
        id="studentPenTextField"
        v-model="penNumber"
        class="pr-5"
        clearable
        variant="underlined"
        placeholder="Enter a Student's PEN"
        :rules="penRules"
        maxlength="9"
        counter="9"
        @keyup.enter="enterPushed()"
      />
      <PrimaryButton
        id="searchPenBtn"
        width="6rem"
        :disabled="enableSearchButton"
        text="Search"
        :loading="isSearchingStudent"
        @click-action="searchStudentForGivenPEN"
      />
    </v-row>

    <v-row
      v-if="showStudentDetails"
    >
      <v-col cols="auto" class="pr-0">
        <v-icon
          v-if="showStudentDetails"
          size="x-large"
          class="pr-2"
        >
          mdi-account-box-outline
        </v-icon>
      </v-col>
      <v-col>
        <div :class="['d-flex', 'flex-column']">
          <strong>{{ student['studentName'] }}</strong>
          <span>{{ student['studentLocalID'] }}</span>
          <span>{{ student['studentDoB'] }}</span>
          <span>{{ student['studentGender'] }}</span>
        </div>
      </v-col>
    </v-row>
    <v-row>
      <v-col class="d-flex justify-end pl-0">
        <PrimaryButton
          id="cancelAddStudentBtn"
          secondary
          text="Cancel"
          class="mr-2"
          @click-action="closeForm"
        />
        <PrimaryButton
          id="addStudentToNewMessageBtn"
          :disabled="!studentExist"
          text="Add"
          width="5rem"
          @click-action="addStudentToMessage"
        />
      </v-col>
    </v-row>
  </v-card>
</template>

<script>
import {mapState} from 'pinia';
import ApiService from '@/common/apiService';
import alertMixin from '@/mixins/alertMixin';
import PrimaryButton from '@/components/util/PrimaryButton.vue';
import {isValidPEN} from '@/utils/validation';
import {Routes} from '@/utils/constants';
import {appStore} from '@/store/modules/app';

export default {
  components: {PrimaryButton},
  mixins: [alertMixin],
  props: {
    eager: {
      type: Boolean,
      default: false
    },
    instituteTypeValue: {
      type: Object,
      required: true
    },
    additionalStudentAddWarning: {
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
      penRules: [v => (!v || isValidPEN(v))],
      studentExist: false,
      student: {},
      alert: false,
      alertMessage: null,
      alertType: null
    };
  },
  computed: {
    ...mapState(appStore, ['schoolMap']),
    enableSearchButton() {
      return !(isValidPEN(this.penNumber));
    }
  },
  watch: {
    additionalStudentAddWarning(newVal) {
      if (newVal) {
        this.setInfoAlert(newVal);
      }
    },
    alert(newVal) {
      if (!newVal) {
        this.$emit('updateAdditionalStudentAddWarning', '');
      }
    },
    penNumber(newVal) {
      if (!(isValidPEN(newVal))) {
        this.student = {};
        this.showStudentDetails = false;
        this.studentExist = false;
        this.alert = false;
      }
    },
  },
  methods: {
    enterPushed() {
      if ((isValidPEN(this.penNumber))) {
        this.searchStudentForGivenPEN();
      }
    },
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
      this.student['pen'] = data.pen;
      this.student['studentID'] = data.studentID;
      this.student['studentName'] = data.legalFirstName + ' ' + (data.legalMiddleNames ?? '') + ' ' + data.legalLastName;
      this.student['studentLocalID'] = data.localID;
      this.student['studentGender'] = data.genderCode;
      this.student['studentDoB'] = data.dob;
      this.mismatchCheck(data);
    },
    mismatchCheck(data) {
      if (this.instituteTypeValue?.type === 'SCHOOL' && this.instituteTypeValue?.value !== data.mincode) {
        this.setInfoAlert('This student\'s mincode does not match the school which you are sending the message.');
      } else if (this.instituteTypeValue?.type === 'DISTRICT' && this.instituteTypeValue?.value !== this.getSchoolByMincode(data.mincode)[1].districtID) {
        this.setInfoAlert('This student\'s mincode does not belong to the district to which you are sending the message.');
      } else {
        this.alert = false;
      }
    },
    closeForm() {
      this.resetFields();
      this.$emit('close:form');
    },
    resetFields() {
      this.penNumber = null;
      this.alert = false;
      this.alertMessage = null;
    },
    addStudentToMessage() {
      let secureExchangeStudent = {
        studentID: this.student['studentID'],
        pen: this.student['pen'],
      };
      this.$emit('addStudent', secureExchangeStudent);
      this.resetFields();
      this.$emit('close:form');
    },
    getSchoolByMincode(mincode) {
      for (const [key, val] of this.schoolMap) {
        if (val.mincode === mincode) {
          return [key, val];
        }
      }
    }
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
