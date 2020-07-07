<template>
  <v-main class="fill-height">
    <v-form ref="studentDetailForm" id="detailStudentForm"
            v-model="validForm" class="fill-height"
          >
      <v-container class="fill-height" v-if="!isLoading">
        <v-col cols="15" class="fill-height pb-5">
          <v-row class="flex-grow-0 pb-5">
            <v-card style="background-color:#d7d7d7;" height="100%" width="100%" elevation=0>
              <v-row>
                <v-col cols="1" class="topMenu pl-16 mr-12">
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
            <v-col cols="3" class="pr-15 pl-0">
              <v-card class="px-3 py-2" color="#D7D7D7" width="100%" elevation=0>
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
                  <v-col v-on:mouseover="hovering = true" class="sideCardField" v-on:mouseout="editing ? hovering = true : hovering = false">
                    <v-select
                      id='demogCode'
                      tabindex="11"
                      v-on:keyup.tab="editing = true; hovering = true"
                      v-on:change="editing = false; hovering = false;"
                      class="onhoverEdit bolder mb-0 customNoBorder py-0 my-0"
                      :class="{darkBackgound: hovering || hasEdits('demogCode')}"
                      color="#000000"
                      v-model="studentCopy.demogCode"
                      :items="demogLabels"
                      :outlined="hovering || editing || hasEdits('demogCode')"
                      dense
                      type="solo"   
                    ></v-select>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col class="py-0" style="margin-top: -0.5em;">
                    <v-text-field
                      id='revertDemog'
                      v-on:click="revertField('demogCode')"
                      class="my-0 onhoverEdit revert customNoBorder ml-3"
                      readonly
                      v-if="hasEdits('demogCode')"
                      value="Revert"
                      dense
                      tabindex="-1"
                    ></v-text-field>
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
                      value=""
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
                      value=""
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
                  <v-col v-on:mouseover="hovering = true" class="sideCardField" v-on:mouseout="editing ? hovering = true : hovering = false">
                    <v-select
                      id='statusCode'
                      tabindex="12"
                      v-on:keyup.tab="editing = true; hovering = true"
                      v-on:change="editing = false; hovering = false; openDeceasedDialog()"
                      class="onhoverEdit bolder mb-0 customNoBorder py-0 my-0"
                      :class="{darkBackgound: hovering || hasEdits('statusCode')}"
                      color="#000000"
                      v-model="studentCopy.statusCode"
                      :items="statusLabels"
                      :outlined="hovering || editing || hasEdits('statusCode')"
                      dense
                      type="solo"
                    ></v-select>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col class="py-0" style="margin-top: -0.5em;">
                    <v-text-field
                      id='revertStatus'
                      v-on:click="revertField('statusCode')"
                      class="my-0 onhoverEdit revert customNoBorder ml-3"
                      readonly
                      v-if="hasEdits('statusCode')"
                      value="Revert"
                      dense
                      tabindex="-1"
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-card>
            </v-col>
            <v-col cols="9" class="py-0 pl-0">
              <v-card class="px-0 py-2" height="100%" width="100%" elevation=0>
                <v-row no-gutters class="py-1">
                  <v-col cols="2">
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
                      maxlength="255"
                      :readonly="!hovering || !editing"
                      :outlined="hovering || editing || hasEdits('legalLastName')"
                    ></v-text-field>
                  </v-col>
                  <v-col class="textFieldColumn" cols="2">
                    <v-text-field
                      id='revertLastName'
                      v-on:click="revertField('legalLastName')"
                      class="onhoverEdit revert customNoBorder ml-3"
                      readonly
                      v-if="hasEdits('legalLastName')"
                      value="Revert"
                      dense
                      tabindex="-1"
                    ></v-text-field>
                  </v-col>
                </v-row>
                <v-row no-gutters class="py-1">
                  <v-col cols="2">
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
                      maxlength="255"
                      color="#000000"
                      dense
                      :readonly="!hovering || !editing"
                      :outlined="hovering || editing || hasEdits('legalFirstName')"
                    ></v-text-field>
                  </v-col>
                  <v-col class="textFieldColumn" cols="2">
                    <v-text-field
                      id='revertFirstName'
                      v-on:click="revertField('legalFirstName')"
                      class="onhoverEdit revert customNoBorder ml-3"
                      readonly
                      v-if="hasEdits('legalFirstName')"
                      value="Revert"
                      dense
                      tabindex="-1"
                    ></v-text-field>
                  </v-col>
                </v-row>
                <v-row no-gutters class="py-1">
                  <v-col cols="2">
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
                      maxlength="255"
                      dense
                      :readonly="!hovering || !editing"
                      :outlined="hovering || editing || hasEdits('legalMiddleNames')"
                    ></v-text-field>
                  </v-col>
                  <v-col class="textFieldColumn" cols="2">
                    <v-text-field
                      id='revertLegalMiddleNames'
                      v-on:click="revertField('legalMiddleNames')"
                      class="onhoverEdit revert customNoBorder ml-3"
                      readonly
                      v-if="hasEdits('legalMiddleNames')"
                      value="Revert"
                      dense
                      tabindex="-1"
                    ></v-text-field>
                  </v-col>
                </v-row>
                <v-row no-gutters class="py-1">
                  <v-col cols="2">
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
                      maxlength="255"
                      :readonly="!hovering || !editing"
                      :outlined="hovering || editing || hasEdits('usualLastName')"
                    ></v-text-field>
                  </v-col>
                  <v-col class="textFieldColumn" cols="2">
                    <v-text-field
                      id='revertUsualName'
                      v-on:click="revertField('usualLastName')"
                      class="onhoverEdit revert customNoBorder ml-3"
                      readonly
                      v-if="hasEdits('usualLastName')"
                      value="Revert"
                      dense
                      tabindex="-1"
                    ></v-text-field>
                  </v-col>
                </v-row>
                <v-row no-gutters class="py-1">
                  <v-col cols="2">
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
                      maxlength="255"
                      :readonly="!hovering || !editing"
                      :outlined="hovering || editing || hasEdits('usualFirstName')"
                    ></v-text-field>
                  </v-col>
                  <v-col class="textFieldColumn" cols="2">
                    <v-text-field
                      id='revertUsualFirstName'
                      v-on:click="revertField('usualFirstName')"
                      class="onhoverEdit revert customNoBorder ml-3"
                      readonly
                      v-if="hasEdits('usualFirstName')"
                      value="Revert"
                      dense
                      tabindex="-1"
                    ></v-text-field>
                  </v-col>
                </v-row>
                <v-row no-gutters class="py-1">
                  <v-col cols="2">
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
                      maxlength="255"
                      :readonly="!hovering || !editing"
                      :outlined="hovering || editing || hasEdits('usualMiddleNames')"
                    ></v-text-field>
                  </v-col>
                  <v-col class="textFieldColumn" cols="2">
                    <v-text-field
                      id='revertUsualMiddleNames'
                      v-on:click="revertField('usualMiddleNames')"
                      class="onhoverEdit revert customNoBorder ml-3"
                      readonly
                      v-if="hasEdits('usualMiddleNames')"
                      value="Revert"
                      dense
                      tabindex="-1"
                    ></v-text-field>
                  </v-col>
                </v-row>
                <v-row no-gutters class="py-1">
                  <v-col cols="2">
                    <p class="labelField">Gender</p>
                  </v-col>
                  <v-col cols="1" :class="{textFieldColumn: !genderError}">
                    <v-text-field
                      tabindex="7"
                      v-on:keyup.tab="editing = true; hovering = true"
                      v-on:mouseover="hovering = true"
                      v-on:mouseout="editing ? hovering = true : hovering = false"
                      v-on:blur="editing = false; hovering = false;"
                      v-on:click="editing = true; hovering = true"
                      v-on:input="uppercaseGender()"
                      v-model="studentCopy.genderCode"
                      class="onhoverEdit bolder customNoBorder"
                      :class="{onhoverPad: !hovering && !hasEdits('genderCode'), darkBackgound: hovering || hasEdits('genderCode')}"
                      id='genderCode'
                      color="#000000"
                      :rules="validateGender()"
                      dense
                      maxlength="1"
                      :readonly="!hovering || !editing"
                      :outlined="hovering || editing || hasEdits('genderCode')"
                    ></v-text-field>
                  </v-col>
                  <v-col class="textFieldColumn" cols="2">
                    <v-text-field
                      id='revertGender'
                      v-on:click="revertField('genderCode')"
                      class="onhoverEdit revert customNoBorder ml-3"
                      readonly
                      v-if="hasEdits('genderCode')"
                      value="Revert"
                      dense
                      tabindex="-1"
                    ></v-text-field>
                  </v-col>
                </v-row>
                <v-row no-gutters class="py-1">
                  <v-col cols="2">
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
                  <v-col cols="2" :class="{textFieldColumn: !dobError}">
                    <v-text-field
                      tabindex="8"
                      v-on:keyup.tab="editing = true; hovering = true; shortDOBStyle();"
                      v-on:mouseover="hovering = true"
                      v-on:mouseout="editing ? hovering = true : hovering = false"
                      v-on:blur="editing = false; hovering = false; longDOBStyle();"
                      v-on:click="editing = true; hovering = true; shortDOBStyle();"
                      v-on:input="updateDOBLabel()"
                      class="onhoverEdit bolder customNoBorder"
                      :class="{onhoverPad: !hovering && !dobHasChanged('dob'), darkBackgound: hovering || dobHasChanged('dob')}"
                      v-model="studentCopy.dob"
                      id='dob'
                      color="#000000"
                      dense
                      :rules="validateDOB()"
                      maxlength="10"
                      :readonly="!hovering || !editing"
                      :outlined="hovering || editing || dobHasChanged('dob')"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="3" class="textFieldColumn">
                    <v-text-field
                      class="onhoverEdit bolder customNoBorder onhoverPad"
                      v-model="longDOB"
                      v-if="hovering && !editing"
                      id='dobFull'
                      color="#000000"
                      dense
                      readonly
                      tabindex="-1"
                    ></v-text-field>
                  </v-col>
                  <v-col class="textFieldColumn" cols="2">
                    <v-text-field
                      id='revertDOB'
                      v-on:click="revertDOBField('dob')"
                      class="onhoverEdit revert customNoBorder ml-3"
                      readonly
                      v-show="dobHasChanged('dob')"
                      value="Revert"
                      style="padding-top: 2px;"
                      dense
                      tabindex="-1"
                    ></v-text-field>
                  </v-col>
                </v-row>
                <v-row no-gutters class="py-1">
                  <v-col cols="2">
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
                      maxlength="2"
                      tabindex="-1"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="3" class="textFieldColumn">
                    <v-text-field
                      class="onhoverEdit customNoBorder onhoverPad"
                      v-model="gradeLabel"
                      v-if="hovering && !editing"
                      id='gradeLabel'
                      color="#000000"
                      dense
                      readonly
                      tabindex="-1"
                    ></v-text-field>
                  </v-col>
                </v-row>
                <v-row no-gutters class="py-1">
                <v-col cols="2">
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
                      maxlength="4"
                      tabindex="-1"
                    ></v-text-field>
                  </v-col>
                </v-row>
                <v-row no-gutters class="py-1">
                  <v-col cols="2">
                    <p class="labelField">Postal Code</p>
                  </v-col>
                  <v-col class="textFieldColumn">
                    <v-text-field
                      class="onhoverEdit bolder customNoBorder onhoverPad"
                      id='postalCode'
                      v-model="spacePostalCode"
                      color="#000000"
                      dense
                      readonly
                      tabindex="-1"
                    ></v-text-field>
                  </v-col>
                </v-row>
                <v-row no-gutters class="py-1">
                  <v-col cols="2">
                    <p class="labelField">Mincode</p>
                  </v-col>
                  <v-col cols="2" :class="{textFieldColumn: !mincodeError}">
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
                      maxlength="8"
                      minlength="8"
                      :rules="validateMincode()"
                      :readonly="!hovering || !editing"
                      :outlined="hovering || editing || hasEdits('mincode')"
                    ></v-text-field>
                  </v-col>
                  <v-col class="textFieldColumn" cols="2">
                    <v-text-field
                      id='revertSchool'
                      v-on:click="revertField('mincode')"
                      class="onhoverEdit revert customNoBorder ml-3"
                      readonly
                      v-if="hasEdits('mincode')"
                      value="Revert"
                      dense
                      tabindex="-1"
                    ></v-text-field>
                  </v-col>
                </v-row>
                <v-row no-gutters class="py-1">
                  <v-col cols="2">
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
                  <v-col cols="2">
                    <p class="labelField">Twin(s)?</p>
                  </v-col>
                  <v-col class="textFieldColumn">
                    <v-text-field
                      class="onhoverEdit bolder customNoBorder onhoverPad"
                      id='twins'
                      color="#000000"
                      value=""
                      dense
                      readonly
                      tabindex="-1"
                    ></v-text-field>
                  </v-col>
                </v-row>
                <v-row no-gutters class="py-1">
                  <v-col cols="2">
                    <p class="labelField">Merged To</p>
                  </v-col>
                  <v-col class="textFieldColumn">
                    <v-text-field
                      class="onhoverEdit bolder customNoBorder onhoverPad"
                      id='mergedTo'
                      color="#000000"
                      value=""
                      dense
                      readonly
                      tabindex="-1"
                    ></v-text-field>
                  </v-col>
                </v-row>
                <v-row no-gutters class="py-1">
                  <v-col cols="2">
                    <p class="labelField">Merged From</p>
                  </v-col>
                  <v-col class="textFieldColumn">
                    <v-text-field
                      class="onhoverEdit bolder customNoBorder onhoverPad"
                      id='mergedFrom'
                      color="#000000"
                      value=""
                      dense
                      readonly
                      tabindex="-1"
                    ></v-text-field>
                  </v-col>
                </v-row>
                <v-row no-gutters class="py-1">
                  <v-col cols="2">
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
                      maxlength="4000"
                      dense
                      auto-grow
                      :readonly="!hovering || !editing"
                      :outlined="hovering || editing || hasEdits('memo')"
                    ></v-textarea>
                  </v-col>
                  <v-col class="textFieldColumn" cols="2">
                    <v-text-field
                      id='revertMemo'
                      v-on:click="revertField('memo')"
                      class="onhoverEdit revert customNoBorder ml-3"
                      readonly
                      v-if="hasEdits('memo')"
                      value="Revert"
                      dense
                      tabindex="-1"
                    ></v-text-field>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="10">
                    <v-card-actions style="float: right;">
                      <v-btn 
                        outlined
                        tabindex="-1"
                        color="#38598a"
                        class="mx-1"
                        @click="backToSearch()"       
                      >
                        Cancel
                      </v-btn>

                      <v-btn
                        tabindex="-1" 
                        color="#003366"
                        class="white--text"
                        :disabled="!hasAnyEdits()"
                        @click="saveStudent()"
                        >
                        Save
                      </v-btn>
                    </v-card-actions>
                  </v-col>
                </v-row>
              </v-card>
            </v-col>
          </v-row>
        </v-col>
      </v-container>
      <v-container fluid class="full-height" v-else-if="isLoading">
        <article id="pen-display-container" class="top-banner full-height">
          <v-row align="center" justify="center">
            <v-progress-circular
                    :size="70"
                    :width="7"
                    color="primary"
                    indeterminate
            ></v-progress-circular>
          </v-row>
        </article>
      </v-container>
      <v-dialog
        v-model="deceasedDialog"
        width="400px"
      >
          <v-card>
            <v-card-text class="px-5 py-5">
              Change Student Status to Deceased?
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn 
                outlined
                tabindex="-1"
                color="#38598a"
                class="mx-2"
                @click="cancelDeceasedDialog"
              >
                Cancel
              </v-btn>

              <v-btn 
                color="#003366"
                tabindex="-1"       
                class="white--text"
                @click="confirmDeceasedDialog"
                >
                Confirm
              </v-btn>
            </v-card-actions>
          </v-card>
      </v-dialog>
    </v-form> 
  </v-main>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex';
import moment from 'moment';
import ApiService from '../../../common/apiService';
import { Routes } from '../../../utils/constants';
import {LocalDate} from '@js-joda/core';
let JSJoda = require('@js-joda/core');

export default {
  name: 'studentDetail',
  data(){
    return {
      hovering: false,
      editing: false,
      spacePostalCode: null,
      validForm: false,
      isLoading: true,
      deceasedDialog: false,
      mincodeHint: 'Invalid Mincode',
      mincodeError: false,
      genderHint: 'Invalid Gender Code',
      genderError: false,
      dobHint: 'Invalid Date of Birth',
      dobError: false,
      genderCodes: [],
      demogLabels: [],
      statusLabels: [],
      gradeLabels: [],
      gradeLabel: null,
      createdDateTime: null,
      updatedDateTime: null,
      longDOB: null,
      origStudent: null,
      studentCopy: null
    }
  },
  created(){
    this.genderCodes = this.genders ? this.genders.map(a => a.genderCode):[];
    this.demogLabels = this.demogCodeObjects ? this.demogCodeObjects.map(a => a.label):[];
    this.statusLabels = this.statusCodeObjects ? this.statusCodeObjects.map(a => a.label):[];
    this.gradeLabels = this.gradeCodeObjects ? this.gradeCodeObjects.map(a => a.label):[];
  },
 computed: {
    ...mapGetters('student', ['selectedStudent', 'genders', 'demogCodeObjects', 'statusCodeObjects', 'gradeCodeObjects'])
  },
  mounted() {
    this.refreshStudent();
  },
  methods: {
    ...mapMutations('student', ['setSelectedStudent']),
    frontEndDateTimeFormat(date){
      return moment(JSON.stringify(date), 'YYYY-MM-DDTHH:mm:ss').format('YYYY/MM/DD HH:mm:ss a');
    },
    updateDOBLabel(){
      this.longDOB = this.frontEndDOBFormat(this.studentCopy.dob);
    },
    uppercaseGender(){
      if(this.studentCopy.genderCode){
        this.studentCopy.genderCode = this.studentCopy.genderCode.toUpperCase();
      }
    },
    getDateFormatterShort(){
        return (new JSJoda.DateTimeFormatterBuilder)
            .appendPattern('uuuuMMdd')
            .toFormatter(JSJoda.ResolverStyle.STRICT);
    },
    getDateFormatterLong(){
        return (new JSJoda.DateTimeFormatterBuilder)
            .appendPattern('uuuu-MM-dd')
            .toFormatter(JSJoda.ResolverStyle.STRICT);
    },
    validateDOB(){
      if(this.studentCopy) {
        if(!this.studentCopy.dob){
          this.dobError = false;
          return [];
        }
        else {
          const formatterShort = this.getDateFormatterShort();
          const formatterLong = this.getDateFormatterLong();

          let isBeforeLongDate = false;
          let isBeforeShortDate = false;

          try {
            const dateLong = JSJoda.LocalDate.parse(this.studentCopy.dob, formatterLong);
            isBeforeLongDate = dateLong.isBefore(LocalDate.now());
          }
          catch(err){
            //Do nothing
          } 
          try {
            const dateShort = JSJoda.LocalDate.parse(this.studentCopy.dob, formatterShort);
            isBeforeShortDate = dateShort.isBefore(LocalDate.now());
          }
          catch(err){
            //Do nothing
          } 

          if(isBeforeLongDate || isBeforeShortDate){
            this.dobError = false;
            return [];
          }
        }
      }
      this.dobError = true;
      return [
        this.dobHint
      ];   
    },
    validateGender(){
      if(this.studentCopy) {
        if(!this.studentCopy.genderCode){
          this.genderError = false;
          return [];
        }
        else {
          if(this.genderCodes.includes(this.studentCopy.genderCode)){
            this.genderError = false;
            return [];
          }
        }
      }

      this.genderError = true;
      return [
        this.genderHint
      ];   
    },
    validateMincode(){
      if(this.studentCopy) {
        if(!this.studentCopy.mincode){
          this.mincodeError = false;
          return [];
        }
        else {
          if(this.studentCopy.mincode.match('^[0-9]\\d*$') && this.studentCopy.mincode.length === 8){
            this.mincodeError = false;
            return [];
          }
        }
      }
      this.mincodeError = true;
      return [
        this.mincodeHint
      ];   
    },
    setStudent(student){
      this.origStudent = student;
      this.studentCopy = JSON.parse(JSON.stringify(this.origStudent));
      this.createdDateTime = this.frontEndDateTimeFormat(this.studentCopy.createDate);
      this.updatedDateTime = this.frontEndDateTimeFormat(this.studentCopy.updateDate);
      this.updateDOBLabel();
      this.formatPostalCode();
      this.setGradeLabel();
    },
    refreshStudent(){
      this.isLoading = true;
      ApiService.apiAxios
      .get(Routes['student'].ROOT_ENDPOINT + '/detail/' + this.selectedStudent.studentID)
      .then(response => {
        this.setStudent(response.data);
      })
      .catch(error => {
        console.log(error);
        this.isLoading = false;
      })
      .finally(() => {
        this.isLoading = false;
      });
    },
    hasEdits(value){
      if(JSON.stringify(this.studentCopy[value]) === JSON.stringify(this.origStudent[value])){
        return false;
      }

      return true;
    },
    hasAnyEdits(){
      if(JSON.stringify(this.studentCopy) === JSON.stringify(this.origStudent)){
        return false;
      }

      return true;
    },
    revertField(value){
      this.studentCopy[value] = JSON.parse(JSON.stringify(this.origStudent[value]));
    },
    revertDOBField(value){
      this.revertField(value);
      this.updateDOBLabel();
    },
    setGradeLabel(){
      if(this.studentCopy.gradeCode){
        this.gradeLabel = this.gradeCodeObjects.filter(it => (it.gradeCode === this.studentCopy.gradeCode))[0].label;
      }
    },
    frontEndDOBFormat(date){
      return moment(JSON.stringify(date), 'YYYY-MM-DDTHH:mm:ss').format('MMMM DD, YYYY');
    },
    backToSearch() {
      this.setSelectedStudent(null);
    },
    shortDOBStyle(){
      if(this.studentCopy.dob){
          const formatterShort = this.getDateFormatterShort();
          const formatterLong = this.getDateFormatterLong();
        try {
          const dateLong = JSJoda.LocalDate.parse(this.studentCopy.dob, formatterLong);
          const shortDate = dateLong.format(formatterShort);
          this.studentCopy.dob = shortDate;
        }
        catch(err){
          //Do nothing
        } 
      }
    },
    formatPostalCode(){
      if(this.studentCopy.postalCode){
        this.spacePostalCode = this.studentCopy.postalCode.replace(/.{3}$/,' $&');
      }
    },
    longDOBStyle(){
      if(this.studentCopy.dob){
          const formatterShort = this.getDateFormatterShort();
          const formatterLong = this.getDateFormatterLong();
        try {
          const dateShort = JSJoda.LocalDate.parse(this.studentCopy.dob, formatterShort);
          const longDate = dateShort.format(formatterLong);
          this.studentCopy.dob = longDate;
        }
        catch(err){
          //Do nothing
        } 
      }
    },
    dobHasChanged(){
      if(this.origStudent.dob){
        if(!this.studentCopy.dob){
          return true;
        }else if(this.origStudent.dob === this.studentCopy.dob){
          return false;
        }

          const formatterShort = this.getDateFormatterShort();
          const formatterLong = this.getDateFormatterLong();
        try {
          const dateLong = JSJoda.LocalDate.parse(this.origStudent.dob, formatterLong);
          const dateShort = JSJoda.LocalDate.parse(this.studentCopy.dob, formatterShort);
          
          if(dateLong.equals(dateShort)){
            return false;
          }
        }
        catch(err){
          return true;
        } 
        return true;
      }
    },
    confirmDeceasedDialog() {
      this.deceasedDialog = false;
      this.studentCopy.statusCode = 'Deceased';
    },
    cancelDeceasedDialog() {
      this.deceasedDialog = false;
      this.studentCopy.statusCode = 'Active';
    },
    openDeceasedDialog() {
      if(this.studentCopy.statusCode === 'Deceased'){
        this.deceasedDialog = true;
      }
    },
    saveStudent() {
      if(this.$refs.studentDetailForm.validate()) {
        ApiService.apiAxios
          .post(Routes['student'].ROOT_ENDPOINT,this.prepPut(this.studentCopy))
          .then(response => {
            this.setStudent(response.data);
          })
          .catch(error => {
            console.log(error);
          })
          .finally(() => {
           
          });
      }
    },
    prepPut(student) {
      return {
        student: student
      };
    },    
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
  .revert.v-text-field>.v-input__control>.v-input__slot>.v-text-field__slot>input {   
    color: #1a5a96 !important;
    font-weight: bolder; 
    cursor: pointer;
  }
  .bolder {   
    color: #000000 !important;
    font-weight: bolder; 
  }
  .top-banner{
    background-color: white;
    background-size: cover;
    align-items: center;
    display: flex;
  }
  .full-height{
    height: 100%;
  }
</style>