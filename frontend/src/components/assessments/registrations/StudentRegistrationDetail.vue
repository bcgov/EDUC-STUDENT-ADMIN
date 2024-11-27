<template>
  <v-card id="viewStudentCard">
    <v-card-title id="viewStudentCardTitle" class="sheetHeader pt-1 pb-1">
      <v-row no-gutters>
        <v-col class="d-flex justify-start"> Edit Student Registration</v-col>
        <v-col class="d-flex justify-end">
          <v-btn
            id="cancel"
            color="white"
            text="Close"
            size="30"
            icon="mdi-close"
            variant="tonal"
            @click="cancel"
          />
        </v-col>
      </v-row>
    </v-card-title>
    <v-divider />
    <v-card-text>
      <EditStudentRegistration
        :selected-assessment-student-id="selectedStudentRegistrationId"
        :school-year-sessions="schoolYearSessions"
        :save-event="saveStudentRegistration"
        @form-validity="isValid"
        @reset-student-registration-parent="reset()"
        @reset-student-registration-pagination="closeAndReload()"
      />
    </v-card-text>
  </v-card>
</template>

<script>
import EditStudentRegistration from './forms/EditStudentRegistration.vue';

export default {
  name: 'StudentRegistrationDetail',
  components: {
    EditStudentRegistration,
  },
  props: {
    selectedStudentRegistrationId: {
      type: String,
      required: true,
      default: null,
    },
    schoolYearSessions: {
      type: Object,
      required: true,
      default: null,
    }
  },
  emits: ['close-student-registration', 'reload-student-registrations'],
  data() {
    return {
      studentRegistrationFormValid: true,
      saveStudentRegistration: false,
      studentRegistrationForEdit: {},
    };
  },
  computed: {
  },
  created() {
  },  
  mounted() {},
  methods: {
    setAssessmentStudentContext($event) {
      this.studentRegistrationForEdit = $event;
      this.selectedStudentRegistrationId = $event.assessmentStudentID;
    },
    save() {
      this.saveStudent = true;
    },
    cancel() {
      this.$emit('close-student-registration');
    },
    closeAndReload() {
      this.$emit('reload-student-registrations');
      this.$emit('close-student-registration');
    },
    isValid($event) {
      this.studentRegistrationFormValid = $event;
    },
    reset() {
      this.saveStudentRegistration = false;
      this.$emit('reload-student-registrations');
    },    
    
    
  },
};
</script>

<style scoped>
.sheetHeader {
  background-color: #003366;
  color: white;
  font-size: medium !important;
  font-weight: bolder !important;
}


.headerVal {
  color: #7f7f7f;
}
</style>
