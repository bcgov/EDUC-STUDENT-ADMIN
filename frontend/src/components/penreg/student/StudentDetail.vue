<template>
  <v-content>
    <v-container class="fill-height">
      <v-col cols="12" class="fill-height pb-5">
        <v-row class="flex-grow-0 pb-5">
          <v-card height="100%" width="100%" elevation=0>
            <v-card-title class="pb-0 px-0">{{title}}</v-card-title>
            <v-divider/>
          </v-card>
        </v-row>
        <v-row>
          <v-col cols="2" class="py-0 pl-0">
            <v-card class="px-2 py-2" color="#D7D7D7" width="100%" elevation=0>
              <v-row cols="1" no-gutters>
                <v-col>
                  <p class="mb-0 mt-1">PEN</p>
                </v-col>
              </v-row>
              <v-row cols="1" no-gutters>
                <v-col>
                  <p class="mb-5"><strong>123456789</strong></p>
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
                    v-on:mouseover="hovering = true"
                    v-on:mouseout="editing ? hovering = true : hovering = false"
                    v-on:blur="editing = false; hovering = false;"
                    v-on:click="editing = true; hovering = true"
                    class="onhoverEdit bolder mb-0 customNoBorder py-0 my-0"
                    color="#000000"
                    value="Accepted"
                    :readonly="!hovering || !editing"
                    :outlined="hovering || editing"
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
                <v-col>
                  <p class="mb-5"><strong>None</strong></p>
                </v-col>
              </v-row>
              <v-row cols="1" no-gutters>
                <v-col>
                  <p class="mb-0">Grad Date</p>
                </v-col>
              </v-row>
              <v-row cols="1" no-gutters>
                <v-col>
                  <p class="mb-5"><strong>2022/06</strong></p>
                </v-col>
              </v-row>
              <v-row cols="1" no-gutters>
                <v-col>
                  <p class="mb-0">Created</p>
                </v-col>
              </v-row>
              <v-row cols="1" no-gutters>
                <v-col>
                  <p class="mb-5"><strong>2008/09/10 2:43PM</strong></p>
                </v-col>
              </v-row>
              <v-row cols="1" no-gutters>
                <v-col>
                  <p class="mb-0">Updated</p>
                </v-col>
              </v-row>
              <v-row cols="1" no-gutters>
                <v-col>
                  <p class="mb-5"><strong>2018/09/10 10:13PM</strong></p>
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
                    v-on:mouseover="hovering = true"
                    v-on:mouseout="editing ? hovering = true : hovering = false"
                    v-on:blur="editing = false; hovering = false;"
                    v-on:click="editing = true; hovering = true"
                    class="onhoverEdit bolder mb-0 customNoBorder py-0 my-0"
                    color="#000000"
                    value="Active"
                    :readonly="!hovering || !editing"
                    :outlined="hovering || editing"
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
                    v-on:mouseover="hovering = true"
                    v-on:mouseout="editing ? hovering = true : hovering = false"
                    v-on:blur="editing = false; hovering = false;"
                    v-on:click="editing = true; hovering = true"
                    class="onhoverEdit bolder customNoBorder"
                    :class="{onhoverPad: !hovering}"
                    id='legalSurname'
                    color="#000000"
                    value="Smithe"
                    dense
                    :readonly="!hovering || !editing"
                    :outlined="hovering || editing"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row no-gutters class="py-1">
                <v-col cols="3">
                  <p class="labelField">Legal Given</p>
                </v-col>
                <v-col class="textFieldColumn">
                  <v-text-field
                    v-on:mouseover="hovering = true"
                    v-on:mouseout="editing ? hovering = true : hovering = false"
                    v-on:blur="editing = false; hovering = false;"
                    v-on:click="editing = true; hovering = true"
                    class="onhoverEdit bolder customNoBorder"
                    :class="{onhoverPad: !hovering}"
                    id='legal'
                    color="#000000"
                    value="Nathaniel"
                    dense
                    :readonly="!hovering || !editing"
                    :outlined="hovering || editing"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row no-gutters class="py-1">
                <v-col cols="3">
                  <p class="labelField">Legal Middle</p>
                </v-col>
                <v-col class="textFieldColumn">
                  <v-text-field
                    v-on:mouseover="hovering = true"
                    v-on:mouseout="editing ? hovering = true : hovering = false"
                    v-on:blur="editing = false; hovering = false;"
                    v-on:click="editing = true; hovering = true"
                    class="onhoverEdit bolder customNoBorder"
                    :class="{onhoverPad: !hovering}"
                    id='legalMiddleName'
                    color="#000000"
                    value="Jacob Alexander"
                    dense
                    :readonly="!hovering || !editing"
                    :outlined="hovering || editing"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row no-gutters class="py-1">
                <v-col cols="3">
                  <p class="labelField">Usual Surname</p>
                </v-col>
                <v-col class="textFieldColumn">
                  <v-text-field
                    v-on:mouseover="hovering = true"
                    v-on:mouseout="editing ? hovering = true : hovering = false"
                    v-on:blur="editing = false; hovering = false;"
                    v-on:click="editing = true; hovering = true"
                    class="onhoverEdit bolder customNoBorder"
                    :class="{onhoverPad: !hovering}"
                    id='usualSurname'
                    color="#000000"
                    value=""
                    dense
                    :readonly="!hovering || !editing"
                    :outlined="hovering || editing"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row no-gutters class="py-1">
                <v-col cols="3">
                  <p class="labelField">Usual Given</p>
                </v-col>
                <v-col class="textFieldColumn">
                  <v-text-field
                    v-on:mouseover="hovering = true"
                    v-on:mouseout="editing ? hovering = true : hovering = false"
                    v-on:blur="editing = false; hovering = false;"
                    v-on:click="editing = true; hovering = true"
                    class="onhoverEdit bolder customNoBorder"
                    :class="{onhoverPad: !hovering}"
                    id=''
                    color="#000000"
                    value="Nate"
                    dense
                    :readonly="!hovering || !editing"
                    :outlined="hovering || editing"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row no-gutters class="py-1">
                <v-col cols="3">
                  <p class="labelField">Usual Middle</p>
                </v-col>
                <v-col class="textFieldColumn">
                  <v-text-field
                    v-on:mouseover="hovering = true"
                    v-on:mouseout="editing ? hovering = true : hovering = false"
                    v-on:blur="editing = false; hovering = false;"
                    v-on:click="editing = true; hovering = true"
                    class="onhoverEdit bolder customNoBorder"
                    :class="{onhoverPad: !hovering}"
                    id=''
                    color="#000000"
                    value=""
                    dense
                    :readonly="!hovering || !editing"
                    :outlined="hovering || editing"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row no-gutters class="py-1">
                <v-col cols="3">
                  <p class="labelField">Gender</p>
                </v-col>
                <v-col cols="2" class="textFieldColumn">
                  <v-combobox
                    v-on:mouseover="hovering = true"
                    v-on:mouseout="editing ? hovering = true : hovering = false"
                    v-on:blur="editing = false; hovering = false;"
                    v-on:click="editing = true; hovering = true"
                    class="onhoverEdit bolder customNoBorder"
                    :class="{onhoverPad: !hovering}"
                    id='gender'
                    color="#000000"
                    value="M"
                    dense
                    :readonly="!hovering || !editing"
                    :outlined="hovering || editing"
                  ></v-combobox>
                </v-col>
              </v-row>
              <v-row no-gutters class="py-1">
                <v-col cols="3">
                  <p class="labelField">Date of Birth</p>
                </v-col>
                <v-col class="textFieldColumn">
                  <v-text-field
                    v-on:mouseover="hovering = true"
                    v-on:mouseout="editing ? hovering = true : hovering = false"
                    v-on:blur="editing = false; hovering = false;"
                    v-on:click="editing = true; hovering = true"
                    class="onhoverEdit bolder customNoBorder"
                    :class="{onhoverPad: !hovering}"
                    id='dob'
                    color="#000000"
                    value="2005/04/29"
                    dense
                    :readonly="!hovering || !editing"
                    :outlined="hovering || editing"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row no-gutters class="py-1">
                <v-col cols="3">
                  <p class="labelField">Grade</p>
                </v-col>
                <v-col class="textFieldColumn">
                  <v-text-field
                    v-on:mouseover="hovering = true"
                    v-on:mouseout="editing ? hovering = true : hovering = false"
                    v-on:blur="editing = false; hovering = false;"
                    v-on:click="editing = true; hovering = true"
                    class="onhoverEdit bolder customNoBorder"
                    :class="{onhoverPad: !hovering}"
                    id='grade'
                    color="#000000"
                    value="10"
                    dense
                    :readonly="!hovering || !editing"
                    :outlined="hovering || editing"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row no-gutters class="py-1">
                <v-col cols="3">
                  <p class="labelField">Grade School Year</p>
                </v-col>
                <v-col class="textFieldColumn">
                  <v-text-field
                    v-on:mouseover="hovering = true"
                    v-on:mouseout="editing ? hovering = true : hovering = false"
                    v-on:blur="editing = false; hovering = false;"
                    v-on:click="editing = true; hovering = true"
                    class="onhoverEdit bolder customNoBorder"
                    :class="{onhoverPad: !hovering}"
                    id='gradeYear'
                    color="#000000"
                    value="2020"
                    dense
                    :readonly="!hovering || !editing"
                    :outlined="hovering || editing"
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
                    color="#000000"
                    value="V1B2C3"
                    dense
                    readonly
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row no-gutters class="py-1">
                <v-col cols="3">
                  <p class="labelField">School</p>
                </v-col>
                <v-col class="textFieldColumn">
                  <v-text-field
                    v-on:mouseover="hovering = true"
                    v-on:mouseout="editing ? hovering = true : hovering = false"
                    v-on:blur="editing = false; hovering = false;"
                    v-on:click="editing = true; hovering = true"
                    class="onhoverEdit bolder customNoBorder"
                    :class="{onhoverPad: !hovering}"
                    id='school'
                    color="#000000"
                    value="04398256"
                    dense
                    :readonly="!hovering || !editing"
                    :outlined="hovering || editing"
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
                    value="823723727"
                    dense
                    readonly
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
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row no-gutters class="py-1">
                <v-col cols="3">
                  <p class="labelField">Memo</p>
                </v-col>
                <v-col class="textAreaColumn">
                  <v-textarea
                    v-on:mouseover="hovering = true"
                    v-on:mouseout="editing ? hovering = true : hovering = false"
                    v-on:blur="editing = false; hovering = false;"
                    v-on:click="editing = true; hovering = true"
                    class="onhoverEdit bolder customNoBorder"
                    :class="{onhoverPad: !hovering}"
                    id='memo'
                    color="#000000"
                    value="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
                    dense
                    no-resize
                    :readonly="!hovering || !editing"
                    :outlined="hovering || editing"
                  ></v-textarea>
                </v-col>
              </v-row>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-container>
  </v-content>
</template>
<script>
export default {
  name: 'studentDetail',
  data(){
    return {
      hovering: false,
      editing: false,
      demogEditing: false,
      statusEditing: false,
      student: {
        studentID: null,
        pen: null,
        legalFirstName: null,
        legalMiddleNames: null,
        legalLastName: null,
        dob: null,
        sexCode: null,
        genderCode: null,
        usualFirstName: null,
        usualMiddleNames: null,
        usualLastName: null,
        email: null,
        emailVerified: null,
        deceasedDate: null,
        postalCode: null,
        mincode: null,
        localID: null,
        grade: null,
        gradeYear: null,
        demogCode: null,
        statusCode: null,
        memo: null
      }
    }
  },
  methods: {
    showEditStyle(readonlyObj){
      console.log('This object is: ' + readonlyObj);
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
  .textFieldColumn{
     display: table-cell;
     height: 36px;
  }
  .textAreaColumn{
     display: table-cell;
     min-height: 11em;
  }
  .sideCardField{
     display: table-cell;
     min-height: 3em;
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