<template>
  <v-dialog           
          id="studentDetailDialog"
          v-model="isDialogOpen"
          content-class="studentDialog">
    <v-card class="studentDetailDialogCard fill-height ma-0 px-4 pb-4">
        <v-card-title class="px-0 pb-0 pt-5">
          <v-list-item>
            <v-list-item-content style="padding-bottom: 0px; padding-top: 0px">
              <v-list-item-title class="headline">Student Details</v-list-item-title>
            </v-list-item-content>
            <v-list-item-icon style="margin: 0px;">
              <v-btn text icon @click="isDialogOpen=false">
                <v-icon large color="#38598A">mdi-close</v-icon>
              </v-btn>
            </v-list-item-icon>
          </v-list-item>
        </v-card-title>
        <v-col>
          <StudentDetailCommon 
            class="mx-3"
            :studentID="studentID"
            :fullReadOnly="true"
          >
            <template v-slot:buttonbar>
              <v-row>
                <v-col class="subheader-divider-col">
                  <v-divider class="subheader-divider"/>
                </v-col>
                <v-col cols="12">
                  <v-card-actions style="float: right;">
                    <PrimaryButton @click.native="$emit('closeDialog')" :secondary="true" class="mx-1" text="Cancel"></PrimaryButton>
                    <PrimaryButton class="mx-1" text="Go to Record" @click.native="viewStudentDetails"></PrimaryButton>
                    <PrimaryButton class="mx-1" text="Open in new window" @click.native="openStudentDetails"></PrimaryButton>
                  </v-card-actions>
                </v-col>
              </v-row>
            </template>
          </StudentDetailCommon>
        </v-col>
    </v-card>
  </v-dialog>
</template>

<script>
import StudentDetailCommon from '../../common/StudentDetailCommon';
import PrimaryButton from '../../util/PrimaryButton';
import router from '../../../router';
import {REQUEST_TYPES} from '@/utils/constants';
import alertMixin from '../../../mixins/alertMixin';

export default {
  name: 'studentDetailModal',
  mixins: [alertMixin],
  props: {
    studentID: {
      type: String,
      required: false
    },
    openDialog: {
      type: Boolean,
      required: true
    }
  },
  methods: {
    viewStudentDetails() {
      router.push({ name: REQUEST_TYPES.student.label, params: {studentID: this.studentID}});
    },
    openStudentDetails() {
      const route = router.resolve({ name: REQUEST_TYPES.student.label, params: {studentID: this.studentID}});
      window.open(route.href, '_blank');
    },
  },
  components: {
    PrimaryButton,
    StudentDetailCommon
  },
  data() {
    return {
      isDialogOpen: this.openDialog,
    };
  },
  watch: {
    openDialog(val) {
      this.isDialogOpen = val;
    },
    isDialogOpen(newValue) {
      if(!newValue && this.openDialog) {
        this.$emit('closeDialog');
      }
    },
  }
};
</script>

<style>
.subheader-divider {
  border-width: 0.25ex 0 0 0;
}

.subheader-divider-col {
  padding: 1px;
}

.topMenu {
  display: flex;
  align-items: center;
  justify-content: center;
}

.studentDialog{
  max-height: 100% !important;
  max-width: 1200px;
}

.studentDetailDialogCard {
  line-height: 1.1;
}

.onhoverEdit.v-text-field > .v-input__control > .v-input__slot:before {
  border-style: none;
}

.onhoverEdit.v-text-field > .v-input__control > .v-input__slot:after {
  border-style: none;
}

.onhoverPad {
  padding-left: 12px !important;
  padding-top: 2px !important;
}

.onEditPad {
  padding-left: 12px !important;
  padding-top: 2px !important;
}

.textFieldColumn {
  display: table-cell;
  height: 1rem;
}

.darkBackgound.v-text-field > .v-input__control > .v-input__slot {
  background-color: #eeeeee;
}

.textAreaColumn {
  display: table-cell;
}

.sideCardField {
  display: table-cell;
  height: 3em;
}

.labelField {
  display: table-cell;
  height: 1em;
  padding-top: 9px !important;
}

.customNoBorder.v-text-field > .v-input__control > .v-input__slot {
  padding-top: 0px !important;
  padding-bottom: 0px !important;
}

.revert.v-text-field > .v-input__control > .v-input__slot > .v-text-field__slot > input {
  color: #1a5a96 !important;
  font-weight: bolder;
  cursor: pointer;
}

.bolder {
  color: #000000 !important;
  font-weight: bolder;
}

.bolder > .v-input__control > .v-input__slot > .v-text-field__slot > input {
  color: #000000 !important;
}

.gradeLabelColumn > .v-input > .v-input__control > .v-input__slot > .v-text-field__slot > input {
  color: #000000 !important;
}

.bolder > .disabled > span {
  color: #000000 !important;
}

.top-banner {
  background-color: white;
  background-size: cover;
  align-items: center;
  display: flex;
}

.full-height {
  height: 100%;
}
.active-display {
  background-color: #eaf8fe;
}

.pen {
  white-space: nowrap;
}

.dob-disabled {
  visibility: hidden;
}
.student-details-tabs-style{
  text-transform: none;
}
</style>
