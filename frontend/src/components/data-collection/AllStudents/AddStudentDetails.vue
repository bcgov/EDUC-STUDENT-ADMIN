<template>
  <v-card
    id="viewStudentCard"
  >
    <v-card-title
      id="viewStudentCardTitle"
      class="sheetHeader pt-1 pb-1"
    >
      <v-row no-gutters>
        <v-col class="d-flex justify-start">
          Add Student
        </v-col>
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
    <v-card-text>
      <EditStudent
        :selected-students="selectedStudent"
        :total-students="1"
        :save-event="saveStudent"
        :function-type="type"
        @form-validity="isValid"
        @reset-parent="reset()"
        @student-object="setStudentContext"
        @close-success="openinEditMode"
      />
    </v-card-text>
  </v-card>
</template>
    
<script>
import alertMixin from '@/mixins/alertMixin';
import EditStudent from './EditStudent.vue';
import { sdcCollectionStore } from '@/store/modules/sdcCollection';
    
export default {
  name: 'AddStudentDetails',
  components: {
    EditStudent
  },
  mixins: [alertMixin],
  props: {
  },
  emits: ['close', 'open-edit', 'reload-students'],
  data() {
    return {
      selectedStudent: [],
      studentDetailsFormValid: false,
      saveStudent: false,
      sdcCollection: sdcCollectionStore(),
      studentDetails: {},
      type: 'add'
    };
  },
  methods: {
    setStudentContext($event) {
      this.studentDetails = $event;
    },
    save() {
      this.saveStudent =true;
    },
    cancel() {
      this.$emit('close');
    },
    isValid($event) {
      this.studentDetailsFormValid = $event;
    },
    reset() {
      this.saveStudent =false;
      this.$emit('reload-students');
    },
    openinEditMode($event) {
      this.$emit('open-edit', $event);
    }
  }
};
</script>
    
    <style scoped>
      .sheetHeader {
          background-color: #003366;
          color: white;
          font-size: medium !important;
          font-weight: bolder !important;
      }
  
      .headerVal{
      color: #7f7f7f;
   }
    </style>
    
  
