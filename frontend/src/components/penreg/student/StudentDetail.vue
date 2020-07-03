<template>
  <v-main>
    <v-container class="fill-height">
      <v-col cols="15" class="fill-height pb-5">
        <v-row class="flex-grow-0 pb-5">
          <v-card style="background-color:#d7d7d7;" height="100%" width="100%" elevation=0>
            <v-row>
              <v-col @click="backToSearch" cols="1" class="topMenu pl-16 mr-12">
                <img 
                  src="@/assets/images/hamburger.svg"
                  alt="Menu"
                >
                <p class="pl-2 mb-0">Menu</p>
              </v-col>
              <v-col cols="10" class="pl-0">
                <v-card-title class="bolder px-0 pl-5">PEN Record</v-card-title>
              </v-col>
            </v-row>
          </v-card>
        </v-row>
        <v-row>
          <v-col cols="2" class="py-0 px-3 pl-0">
            <v-card class="px-2 py-2" color="#D7D7D7" width="100%" elevation=0>
              <v-row cols="1" no-gutters>
                <v-col>
                  <p class="mb-0 mt-1">PEN</p>
                </v-col>
              </v-row>
              <v-row cols="1" no-gutters>
                <v-col class="sideCardField">
                  <v-text-field
                    id='pen'
                    class="onhoverEdit bolder mb-0 customNoBorder py-0 my-0"
                    color="#000000"
                    v-model="studentCopy.pen"
                    readonly
                    dense
                    tabindex="-1"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row cols="1" no-gutters>
                <v-col>
                  <p class="mb-0">Demog Code</p>
                </v-col>
              </v-row>
              <v-row cols="1" no-gutters>
                <v-col class="sideCardField">
                  <v-combobox
                    id='demogCode'
                    tabindex="11"
                    v-on:keyup.tab="editing = true; hovering = true"
                    v-on:mouseover="hovering = true"
                    v-on:mouseout="editing ? hovering = true : hovering = false"
                    v-on:blur="editing = false; hovering = false;"
                    v-on:click="editing = true; hovering = true"
                    class="onhoverEdit bolder mb-0 customNoBorder py-0 my-0"
                    :class="{darkBackgound: hovering || hasEdits('demogCode')}"
                    color="#000000"
                    v-model="studentCopy.demogCode"
                    :items="demogLabels"
                    :readonly="!hovering || !editing"
                    :outlined="hovering || editing || hasEdits('demogCode')"
                    dense
                    type="solo"
                  ></v-combobox>
                </v-col>
              </v-row>
              <v-row cols="1" no-gutters>
                <v-col>
                  <p class="mb-0">TRAX Status</p>
                </v-col>
              </v-row>
              <v-row cols="1" no-gutters>
                <v-col class="sideCardField">
                  <v-text-field
                    id='traxStatus'
                    class="onhoverEdit bolder mb-0 customNoBorder py-0 my-0"
                    color="#000000"
                    value="N/A"
                    readonly
                    dense
                    tabindex="-1"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row cols="1" no-gutters>
                <v-col>
                  <p class="mb-0">Grad Date</p>
                </v-col>
              </v-row>
              <v-row cols="1" no-gutters>
                <v-col class="sideCardField">
                  <v-text-field
                    id='gradDate'
                    class="onhoverEdit bolder mb-0 customNoBorder py-0 my-0"
                    color="#000000"
                    value="N/A"
                    readonly
                    dense
                    tabindex="-1"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row cols="1" no-gutters>
                <v-col>
                  <p class="mb-0">Created</p>
                </v-col>
              </v-row>
              <v-row cols="1" no-gutters>
                <v-col class="sideCardField">
                  <v-text-field
                    id='createdDate'
                    class="onhoverEdit bolder mb-0 customNoBorder py-0 my-0"
                    color="#000000"
                    v-model="createdDateTime"
                    readonly
                    dense
                    tabindex="-1"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row cols="1" no-gutters>
                <v-col>
                  <p class="mb-0">Updated</p>
                </v-col>
              </v-row>
              <v-row cols="1" no-gutters>
                <v-col class="sideCardField">
                  <v-text-field
                    id='updatedDate'
                    class="onhoverEdit bolder mb-0 customNoBorder py-0 my-0"
                    color="#000000"
                    v-model="updatedDateTime"
                    readonly
                    dense
                    tabindex="-1"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row cols="1" no-gutters>
                <v-col>
                  <p class="mb-0">Status</p>
                </v-col>
              </v-row>
              <v-row cols="1" no-gutters>
                <v-col class="sideCardField">
                  <v-combobox
                    id='statusCode'
                    tabindex="12"
                    v-on:keyup.tab="editing = true; hovering = true"
                    v-on:mouseover="hovering = true"
                    v-on:mouseout="editing ? hovering = true : hovering = false"
                    v-on:blur="editing = false; hovering = false;"
                    v-on:click="editing = true; hovering = true"
                    class="onhoverEdit bolder mb-0 customNoBorder py-0 my-0"
                    :class="{darkBackgound: hovering || hasEdits('statusCode')}"
                    v-model="studentCopy.statusCode"
                    color="#000000"
                    :items="statusLabels"
                    :readonly="!hovering || !editing"
                    :outlined="hovering || editing || hasEdits('statusCode')"
                    dense
                    type="solo"
                  ></v-combobox>
                </v-col>
              </v-row>
            </v-card>
          </v-col>
          <v-col cols="8" class="py-0 pl-0">
            <v-card class="px-2 py-2" height="100%" width="100%" elevation=0>
              <v-row no-gutters class="py-1">
                <v-col cols="3">
                  <p class="labelField mb-0">Legal Surname</p>
                </v-col>
                <v-col class="textFieldColumn">
                  <v-text-field
                    tabindex="1"
                    v-on:keyup.tab="editing = true; hovering = true"
                    v-on:mouseover="hovering = true"
                    v-on:mouseout="editing ? hovering = true : hovering = false"
                    v-on:blur="editing = false; hovering = false;"
                    v-on:click="editing = true; hovering = true"
                    v-model="studentCopy.legalLastName"
                    class="onhoverEdit bolder customNoBorder"
                    :class="{onhoverPad: !hovering && !hasEdits('legalLastName'), darkBackgound: hovering || hasEdits('legalLastName')}"
                    id='legalSurname'
                    color="#000000"
                    dense
                    :readonly="!hovering || !editing"
                    :outlined="hovering || editing || hasEdits('legalLastName')"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row no-gutters class="py-1">
                <v-col cols="3">
                  <p class="labelField">Legal Given</p>
                </v-col>
                <v-col class="textFieldColumn">
                  <v-text-field
                    tabindex="2"
                    v-on:keyup.tab="editing = true; hovering = true"
                    v-on:mouseover="hovering = true"
                    v-on:mouseout="editing ? hovering = true : hovering = false"
                    v-on:blur="editing = false; hovering = false;"
                    v-on:click="editing = true; hovering = true"
                    class="onhoverEdit bolder customNoBorder"
                    :class="{onhoverPad: !hovering && !hasEdits('legalFirstName'), darkBackgound: hovering || hasEdits('legalFirstName')}"
                    v-model="studentCopy.legalFirstName"
                    id='legal'
                    color="#000000"
                    dense
                    :readonly="!hovering || !editing"
                    :outlined="hovering || editing || hasEdits('legalFirstName')"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row no-gutters class="py-1">
                <v-col cols="3">
                  <p class="labelField">Legal Middle</p>
                </v-col>
                <v-col class="textFieldColumn">
                  <v-text-field
                    tabindex="3"
                    v-on:keyup.tab="editing = true; hovering = true"
                    v-on:mouseover="hovering = true"
                    v-on:mouseout="editing ? hovering = true : hovering = false"
                    v-on:blur="editing = false; hovering = false;"
                    v-on:click="editing = true; hovering = true"
                    class="onhoverEdit bolder customNoBorder"
                    :class="{onhoverPad: !hovering && !hasEdits('legalMiddleNames'), darkBackgound: hovering || hasEdits('legalMiddleNames')}"
                    v-model="studentCopy.legalMiddleNames"
                    id='legalMiddleName'
                    color="#000000"
                    dense
                    :readonly="!hovering || !editing"
                    :outlined="hovering || editing || hasEdits('legalMiddleNames')"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row no-gutters class="py-1">
                <v-col cols="3">
                  <p class="labelField">Usual Surname</p>
                </v-col>
                <v-col class="textFieldColumn">
                  <v-text-field
                    tabindex="4"
                    v-on:keyup.tab="editing = true; hovering = true"
                    v-on:mouseover="hovering = true"
                    v-on:mouseout="editing ? hovering = true : hovering = false"
                    v-on:blur="editing = false; hovering = false;"
                    v-on:click="editing = true; hovering = true"
                    class="onhoverEdit bolder customNoBorder"
                    v-model="studentCopy.usualLastName"
                    :class="{onhoverPad: !hovering && !hasEdits('usualLastName'), darkBackgound: hovering || hasEdits('usualLastName')}"
                    id='usualSurname'
                    color="#000000"
                    dense
                    :readonly="!hovering || !editing"
                    :outlined="hovering || editing || hasEdits('usualLastName')"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row no-gutters class="py-1">
                <v-col cols="3">
                  <p class="labelField">Usual Given</p>
                </v-col>
                <v-col class="textFieldColumn">
                  <v-text-field
                    tabindex="5"
                    v-on:keyup.tab="editing = true; hovering = true"
                    v-on:mouseover="hovering = true"
                    v-on:mouseout="editing ? hovering = true : hovering = false"
                    v-on:blur="editing = false; hovering = false;"
                    v-on:click="editing = true; hovering = true"
                    class="onhoverEdit bolder customNoBorder"
                    :class="{onhoverPad: !hovering && !hasEdits('usualFirstName'), darkBackgound: hovering || hasEdits('usualFirstName')}"
                    v-model="studentCopy.usualFirstName"
                    id='usualFirstName'
                    color="#000000"
                    dense
                    :readonly="!hovering || !editing"
                    :outlined="hovering || editing || hasEdits('usualFirstName')"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row no-gutters class="py-1">
                <v-col cols="3">
                  <p class="labelField">Usual Middle</p>
                </v-col>
                <v-col class="textFieldColumn">
                  <v-text-field
                    tabindex="6"
                    v-on:keyup.tab="editing = true; hovering = true"
                    v-on:mouseover="hovering = true"
                    v-on:mouseout="editing ? hovering = true : hovering = false"
                    v-on:blur="editing = false; hovering = false;"
                    v-on:click="editing = true; hovering = true"
                    v-model="studentCopy.usualMiddleNames"
                    class="onhoverEdit bolder customNoBorder"
                    :class="{onhoverPad: !hovering && !hasEdits('usualMiddleNames'), darkBackgound: hovering || hasEdits('usualMiddleNames')}"
                    id='usualMiddleNames'
                    color="#000000"
                    dense
                    :readonly="!hovering || !editing"
                    :outlined="hovering || editing || hasEdits('usualMiddleNames')"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row no-gutters class="py-1">
                <v-col cols="3">
                  <p class="labelField">Gender</p>
                </v-col>
                <v-col cols="2" class="textFieldColumn">
                  <v-combobox
                    tabindex="7"
                    v-on:keyup.tab="editing = true; hovering = true"
                    v-on:mouseover="hovering = true"
                    v-on:mouseout="editing ? hovering = true : hovering = false"
                    v-on:blur="editing = false; hovering = false;"
                    v-on:click="editing = true; hovering = true"
                    class="onhoverEdit bolder customNoBorder"
                    :class="{onhoverPad: !hovering && !hasEdits('genderCode'), darkBackgound: hovering || hasEdits('genderCode')}"
                    v-model="studentCopy.genderCode"
                    :items="genderCodes"
                    id='gender'
                    color="#000000"
                    dense
                    :readonly="!hovering || !editing"
                    :outlined="hovering || editing || hasEdits('genderCode')"
                  ></v-combobox>
                </v-col>
              </v-row>
              <v-row no-gutters class="py-1">
                <v-col cols="3">
                  <div class="labelField">
                    <div style="display: inline-block;vertical-align: middle;">
                      Date of Birth
                    </div>
                    <div style="display: inline-block;vertical-align: sub;">
                       <img title="YYYYMMDD" class="ml-3" 
                        src="@/assets/images/information.svg"
                        alt="YYYYMMDD"
                       >
                    </div>
                  </div>
                </v-col>
                <v-col cols="2" class="textFieldColumn">
                  <v-text-field
                    tabindex="8"
                    v-on:keyup.tab="editing = true; hovering = true"
                    v-on:mouseover="hovering = true"
                    v-on:mouseout="editing ? hovering = true : hovering = false"
                    v-on:blur="editing = false; hovering = false;"
                    v-on:click="editing = true; hovering = true"
                    class="onhoverEdit bolder customNoBorder"
                    :class="{onhoverPad: !hovering && !hasEdits('dob'), darkBackgound: hovering || hasEdits('dob')}"
                    v-model="studentCopy.dob"
                    id='dob'
                    color="#000000"
                    dense
                    :readonly="!hovering || !editing"
                    :outlined="hovering || editing || hasEdits('dob')"
                  ></v-text-field>
                </v-col>
                <v-col cols="3" class="textFieldColumn">
                  <v-text-field
                    class="onhoverEdit bolder customNoBorder onhoverPad"
                    v-model="longDOB"
                    v-if="hovering"
                    id='dobFull'
                    color="#000000"
                    dense
                    readonly
                    tabindex="-1"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row no-gutters class="py-1">
                <v-col cols="3">
                  <p class="labelField">Grade</p>
                </v-col>
                <v-col cols="1" class="textFieldColumn">
                  <v-text-field
                    class="onhoverEdit bolder customNoBorder onhoverPad"
                    v-model="studentCopy.gradeCode"
                    id='grade'
                    color="#000000"
                    dense
                    readonly
                    tabindex="-1"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row no-gutters class="py-1">
                <v-col cols="3">
                  <p class="labelField">Grade School Year</p>
                </v-col>
                <v-col cols="1" class="textFieldColumn">
                  <v-text-field
                    class="onhoverEdit bolder customNoBorder onhoverPad"
                    v-model="studentCopy.gradeYear"
                    id='gradeYear'
                    color="#000000"
                    dense
                    readonly
                    tabindex="-1"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row no-gutters class="py-1">
                <v-col cols="3">
                  <p class="labelField">Postal Code</p>
                </v-col>
                <v-col class="textFieldColumn">
                  <v-text-field
                    class="onhoverEdit bolder customNoBorder onhoverPad"
                    id='postalCode'
                    v-model="studentCopy.postalCode"
                    color="#000000"
                    dense
                    readonly
                    tabindex="-1"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row no-gutters class="py-1">
                <v-col cols="3">
                  <p class="labelField">School</p>
                </v-col>
                <v-col cols="2" class="textFieldColumn">
                  <v-text-field
                    tabindex="9"
                    v-on:keyup.tab="editing = true; hovering = true"
                    v-on:mouseover="hovering = true"
                    v-on:mouseout="editing ? hovering = true : hovering = false"
                    v-on:blur="editing = false; hovering = false;"
                    v-on:click="editing = true; hovering = true"
                    class="onhoverEdit bolder customNoBorder"
                    :class="{onhoverPad: !hovering && !hasEdits('mincode'), darkBackgound: hovering || hasEdits('mincode')}"
                    v-model="studentCopy.mincode"
                    id='school'
                    color="#000000"
                    dense
                    :readonly="!hovering || !editing"
                    :outlined="hovering || editing || hasEdits('mincode')"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row no-gutters class="py-1">
                <v-col cols="3">
                  <p class="labelField">Local ID</p>
                </v-col>
                <v-col class="textFieldColumn">
                  <v-text-field
                    class="onhoverEdit bolder customNoBorder onhoverPad"
                    id='localID'
                    color="#000000"
                    v-model="studentCopy.localID"
                    dense
                    readonly
                    tabindex="-1"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row no-gutters class="py-1">
                <v-col cols="3">
                  <p class="labelField">Twin(s)?</p>
                </v-col>
                <v-col class="textFieldColumn">
                  <v-text-field
                    class="onhoverEdit bolder customNoBorder onhoverPad"
                    id='twins'
                    color="#000000"
                    value="N/A"
                    dense
                    readonly
                    tabindex="-1"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row no-gutters class="py-1">
                <v-col cols="3">
                  <p class="labelField">Merged To</p>
                </v-col>
                <v-col class="textFieldColumn">
                  <v-text-field
                    class="onhoverEdit bolder customNoBorder onhoverPad"
                    id='mergedTo'
                    color="#000000"
                    value="N/A"
                    dense
                    readonly
                    tabindex="-1"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row no-gutters class="py-1">
                <v-col cols="3">
                  <p class="labelField">Merged From</p>
                </v-col>
                <v-col class="textFieldColumn">
                  <v-text-field
                    class="onhoverEdit bolder customNoBorder onhoverPad"
                    id='mergedFrom'
                    color="#000000"
                    value="N/A"
                    dense
                    readonly
                    tabindex="-1"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row no-gutters class="py-1">
                <v-col cols="3">
                  <p class="labelField">Memo</p>
                </v-col>
                <v-col class="textAreaColumn">
                  <v-textarea
                    tabindex="10"
                    v-on:keyup.tab="editing = true; hovering = true"
                    v-on:mouseover="hovering = true"
                    v-on:mouseout="editing ? hovering = true : hovering = false"
                    v-on:blur="editing = false; hovering = false;"
                    v-on:click="editing = true; hovering = true"
                    class="onhoverEdit bolder customNoBorder"
                    :class="{onhoverPad: !hovering && !hasEdits('memo'), darkBackgound: hovering || hasEdits('memo')}"
                    v-model="studentCopy.memo"
                    id='memo'
                    color="#000000"
                    dense
                    no-resize
                    :readonly="!hovering || !editing"
                    :outlined="hovering || editing || hasEdits('memo')"
                  ></v-textarea>
                </v-col>
              </v-row>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-container>
  </v-main>
</template>
<script>
import { mapGetters, mapMutations } from 'vuex';
import moment from 'moment';

export default {
  name: 'studentDetail',
  data(){
    return {
      hovering: false,
      editing: false,
      demogEditing: false,
      statusEditing: false,
      genderCodes: [],
      demogLabels: [],
      statusLabels: [],
      gradeLabels: [],
      createdDateTime: null,
      updatedDateTime: null,
      longDOB: null,
      studentCopy: null 
    }
  },
  created(){
    this.genderCodes = this.genders ? this.genders.map(a => a.genderCode):[];
    this.demogLabels = this.demogCodeObjects ? this.demogCodeObjects.map(a => a.label):[];
    this.statusLabels = this.statusCodeObjects ? this.statusCodeObjects.map(a => a.label):[];
    this.gradeLabels = this.gradeCodeObjects ? this.gradeCodeObjects.map(a => a.label):[];
    this.studentCopy = this.selectedStudent ? JSON.parse(JSON.stringify(this.selectedStudent)):null;
  },
 computed: {
    ...mapGetters('student', ['selectedStudent', 'genders', 'demogCodeObjects', 'statusCodeObjects', 'gradeCodeObjects'])
  },
  mounted() {
    this.createdDateTime = this.frontEndDateTimeFormat(this.selectedStudent.createDate);
    this.updatedDateTime = this.frontEndDateTimeFormat(this.selectedStudent.updateDate);
    this.longDOB = this.frontEndDOBFormat(this.selectedStudent.dob);
  },
  methods: {
    ...mapMutations('student', ['setSelectedStudent']),
    frontEndDateTimeFormat(date){
      return moment(JSON.stringify(date), 'YYYY-MM-DDTHH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
    },
    hasEdits(value){

      // console.log('Field value: ' + JSON.stringify(this.studentCopy[value]));
      // console.log('Field Orig value: ' + JSON.stringify(this.selectedStudent[value]));

      if(JSON.stringify(this.studentCopy[value]) === JSON.stringify(this.selectedStudent[value])){
        return false;
      }

      return true;
    },
    frontEndDOBFormat(date){
      return moment(JSON.stringify(date), 'YYYY-MM-DDTHH:mm:ss').format('MMMM DD, YYYY');
    },
    backToSearch() {
      this.setSelectedStudent(null);
    },
    prepPut(requestId, request) {
      return {
        // 'penRequestID': requestId,
        // 'pen': request.pen,
        // 'penRequestStatusCode': request.penRequestStatusCode,
        // 'reviewer': request.reviewer,
        // 'failureReason': request.failureReason,
        // 'completeComment': request.completeComment,
        // 'demogChanged': request.demogChanged,
        // 'bcscAutoMatchOutcome': request.bcscAutoMatchOutcome,
        // 'bcscAutoMatchDetails': request.bcscAutoMatchDetails
      };
    }
  }
};
</script>

<style>
  .topMenu {
     display: flex;
     align-items: center;
     justify-content: center;
  }
  .onhoverEdit.v-text-field>.v-input__control>.v-input__slot:before {
     border-style: none;
  }
  .onhoverEdit.v-text-field>.v-input__control>.v-input__slot:after {
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
  .textFieldColumn{
     display: table-cell;
     height: 36px;
  }
  .darkBackgound.v-text-field>.v-input__control>.v-input__slot{
    background-color: #eeeeee;
  }
  .textAreaColumn{
     display: table-cell;
     min-height: 11em;
  }
  .sideCardField{
     display: table-cell;
     height: 3em;
  }
  .labelField{
     display: table-cell;
     height: 1em;
     padding-top: 9px !important;
  }
  .customNoBorder.v-text-field>.v-input__control>.v-input__slot {
     padding-top: 0px !important;
     padding-bottom: 0px !important;
  }
  .bolder {   
    color: #000000 !important;
    font-weight: bolder; 
  }
</style>