<template>
  <v-dialog           
          id="studentDetailDialog"
          v-model="openDialog"
          content-class="studentDialog">
    <v-card class="studentDetailDialogCard fill-height ma-0 pa-4">
        <v-list-item>
          <v-list-item-content style="padding-bottom: 0px">
            <v-list-item-title class="headline">Student Details</v-list-item-title>
          </v-list-item-content>
          <v-list-item-icon>
            <v-btn text icon @click="$emit('closeDialog')">
              <v-icon large color="#38598A">mdi-close</v-icon>
            </v-btn>
          </v-list-item-icon>
        </v-list-item>
        <v-col>
        <StudentDetailCommon 
            class="mx-3"
            :studentID="studentID">
            <template v-slot:buttonbar>
              <v-col class="subheader-divider-col">
                <v-divider class="subheader-divider"/>
              </v-col>
              <v-col cols="12">
                <v-card-actions style="float: right;">
                  <PrimaryButton :secondary="true" class="mx-1" text="Cancel"></PrimaryButton>
                  <PrimaryButton class="mx-1" text="Go to Record"></PrimaryButton>
                  <PrimaryButton class="mx-1" text="Open in new window"></PrimaryButton>
                </v-card-actions>
              </v-col>
            </template>
        </StudentDetailCommon>
        </v-col>
    </v-card>
  </v-dialog>
</template>

<script>
import StudentDetailCommon from '../../common/StudentDetailCommon';
import PrimaryButton from '../../util/PrimaryButton';

export default {
  name: 'studentDetailModal',
  props: {
    studentID: {
      type: String,
      required: true
    },
    openDialog: {
      type: Boolean,
      required: true
    }
  },
  components: {
    PrimaryButton,
    StudentDetailCommon
  },
  watch: {
    openDialog: {
      handler() {
        console.log('Hello');
      }
    },
  },
  data() {
    return {
      
    };
  },
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
  max-width: 1024px;
  font-size: 14px;
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
