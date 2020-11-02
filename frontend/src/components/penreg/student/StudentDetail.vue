<template>
    <v-form ref="studentDetailForm" id="detailStudentForm"
            v-model="validForm" class="fill-height"
    >
      <v-container class="fill-height ma-0 pa-2 studentDetail">

        <v-col cols="12" class="fill-height ma-0 pa-0">
          <v-row>
                <v-tabs   active-class="active-display" class="pa-0 ma-0 " v-model="tab">
                  <v-tab class="student-details-tabs-style" ><strong>Demographics</strong></v-tab>
                  <v-tab class="student-details-tabs-style" :disabled="true"><strong>SLD Data</strong></v-tab>
                  <v-tab class="student-details-tabs-style" :disabled="true"><strong>Audit History</strong></v-tab>
                  <v-tab class="student-details-tabs-style" :disabled="true"><strong>Transcript</strong></v-tab>

                  <v-tab-item value="Demographics"/>
                  <v-tab-item value="Sld"/>
                  <v-tab-item value="Audit"/>
                  <v-tab-item value="Transcript"/>
                </v-tabs>
          </v-row>
          <StudentDetailCommon 
              :studentID="studentID"
              :validForm="validForm"
              :parentRefs="this.$refs"
              :fullReadOnly="false">
              <template v-slot:buttonbar="{ isAdvancedSearch, hasAnyEdits, saveStudent, REQUEST_TYPES }">
                <v-row no-gutters dense class="mt-n4">
                  <v-col cols="10">
                    <v-card-actions style="float: right;">
                      <router-link :to="`${isAdvancedSearch?REQUEST_TYPES.studentSearch.path.advanced:REQUEST_TYPES.studentSearch.path.basic}`">
                        <PrimaryButton :secondary="true" class="mx-1" text="Cancel"></PrimaryButton>
                      </router-link>
                      <PrimaryButton :disabled="!hasAnyEdits() || !validForm" @click.native="saveStudent()" text="Save"></PrimaryButton>
                    </v-card-actions>
                  </v-col>
                </v-row>
              </template>
          </StudentDetailCommon>
        </v-col>
      </v-container>
    </v-form>
</template>

<script>
import StudentDetailCommon from '../../common/StudentDetailCommon';
import alterMixin from '../../../mixins/alterMixin';
import PrimaryButton from '../../util/PrimaryButton';

export default {
  name: 'studentDetail',
  mixins: [alterMixin],
  props: {
    studentID: {
      type: String,
      required: true
    }
  },
  components: {
    PrimaryButton,
    StudentDetailCommon
  },
  data() {
    return {
      validForm: false,
      studentForm: null,
      tab:'Demographics'
    };
  },
};
</script>

<style>
.studentDetail {
  line-height: 1.2;
}

.topMenu {
  display: flex;
  align-items: center;
  justify-content: center;
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
