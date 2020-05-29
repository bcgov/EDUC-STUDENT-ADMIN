<template>
  <v-content>
    <v-container class="fill-height">
      <v-col cols="12" class="fill-height pb-5">
        <v-row class="flex-grow-0 pb-5">
          <v-card height="100%" width="100%" elevation=0>
            <v-card-title class="pb-0 px-0">GetMyPen Request Details</v-card-title>
            <v-divider/>
            <v-progress-linear
                    indeterminate
                    color="blue"
                    :active="loadingPen || loadingClaimAction"
            ></v-progress-linear>
            <v-alert
                    :value="claimError"
                    dense
                    text
                    dismissible
                    outlined
                    transition="scale-transition"
                    class="bootstrap-error"
            >
              {{ claimErrorMessage }}
            </v-alert>
          </v-card>
        </v-row>
        <v-row>
          <v-col cols="12" xl="6" lg="6" md="6" sm="6" class="py-0 pl-0">
            <v-card height="100%" width="100%" elevation=0>
              <v-row no-gutters>
                <v-col cols="12" xl="3" lg="3" md="3" sm="3">
                  <p class="mb-2">Status:</p>
                </v-col>
                <v-col v-if="this.request.penRequestStatusCode === this.statusCodes.FIRST_REVIEW || this.request.penRequestStatusCode === this.statusCodes.SECOND_REVIEW" cols="12" xl="9" lg="9" md="9" sm="9">
                  <p class="mb-2 green--text"><strong>{{this.request.penRequestStatusCodeLabel}}</strong></p>
                </v-col>
                <v-col v-else-if="this.request.penRequestStatusCode === this.statusCodes.RETURNED" cols="12" xl="9" lg="9" md="9" sm="9">
                  <p class="mb-2 orange--text"><strong>{{this.request.penRequestStatusCodeLabel}}</strong></p>
                </v-col>
                <v-col v-else cols="12" xl="9" lg="9" md="9" sm="9">
                  <p class="mb-2 grey--text text--darken-1"><strong>{{this.request.penRequestStatusCodeLabel}}</strong></p>
                </v-col>
              </v-row>
              <v-row no-gutters>
                <v-col cols="12" xl="3" lg="3" md="3" sm="3">
                  <p class="mb-2">As of:</p>
                </v-col>
                <v-col cols="12" xl="9" lg="9" md="9" sm="9">
                  <p v-if="this.request['statusUpdateDate'] == null" class="mb-2"></p>
                  <p v-else class="mb-2"><strong>{{ this.request['statusUpdateDate'] ? moment(this.request['statusUpdateDate']).fromNow():'' }}</strong>, at {{ this.request['statusUpdateDate'] ? moment(this.request['statusUpdateDate']).format('YYYY-MM-DD LT'):'' }}</p>
                </v-col>
              </v-row>
              <v-row no-gutters>
                <v-col cols="12" xl="3" lg="3" md="3" sm="3">
                  <p>Submitted:</p>
                </v-col>
                <v-col cols="12" xl="9" lg="9" md="9" sm="9">
                  <p v-if="this.request.initialSubmitDate == null" class="mb-2"></p>
                  <p v-else><strong>{{ this.request.initialSubmitDate ? moment(this.request.initialSubmitDate).fromNow():'' }}</strong>, at {{ this.request.initialSubmitDate ? moment(this.request.initialSubmitDate).format('YYYY-MM-DD LT'):'' }}</p>
                </v-col>
              </v-row>
            </v-card>
          </v-col>
          <v-col cols="12" xl="6" lg="6" md="6" sm="6" class="pa-0">
            <v-card height="100%" width="100%" elevation=0>

              <v-row v-if="this.request.reviewer === this.myself.name" no-gutters justify-xl="end" justify-lg="end" justify-md="end" justify-sm="end">
                <p class="green--text"><strong>You are working on this request</strong></p>
                <v-btn id="release-pen-request" :disabled="!enableActions|| !isReleaseActionEnabledForUser" small color="#38598a" :dark="enableActions && isReleaseActionEnabledForUser" class="ml-2" @click="claimRequest">Release</v-btn>
              </v-row>
              <v-row v-else no-gutters justify-xl="end" justify-lg="end" justify-md="end" justify-sm="end">
                <p v-if="!this.request.reviewer" class="blue--text"><strong>No one is working on this request</strong></p>
                <p v-if="this.request.reviewer" class="orange--text"><strong>{{ this.request.reviewer }} is working on this request</strong></p>
                <v-btn id="claim-pen-request" :disabled="!enableActions|| !isClaimActionEnabledForUser || request.penRequestStatusCode==='DRAFT'" small color="#38598a" :dark="enableActions && isClaimActionEnabledForUser && request.penRequestStatusCode!=='DRAFT'" class="ml-2" @click="claimRequest">Claim</v-btn>
              </v-row>
              <v-row no-gutters justify="end" class="pb-5">
                <v-btn :disabled="!enableActions" small color="#38598a" :dark="enableActions" class="ml-2" @click="backToList">Back to List</v-btn>
              </v-row>
            </v-card>
          </v-col>
        </v-row>
        <v-row>
          <v-progress-linear
                  indeterminate
                  color="blue"
                  :active="loadingDemographics"
          ></v-progress-linear>
          <v-alert
            :value="studentError"
            width="100%"
            outlined
            transition="scale-transition"
            class="bootstrap-error">
            There was an error while attempting to load student demographics.
          </v-alert>
          <v-alert
            :value="showDemographics"
            width="100%"
            outlined
            transition="scale-transition"
            class="bootstrap-success">
            <v-row no-gutters class="px-2">
              <v-col cols="12" xl="1" lg="1" md="1" sm="1">
                <p class="mb-0">PEN:</p>
              </v-col>
              <v-col cols="12" xl="11" lg="11" md="11" sm="11">
                <p class="mb-0"><strong>{{ this.request.pen }}</strong></p>
              </v-col>
            </v-row>
            <v-row no-gutters class="px-2">
              <v-col cols="12" xl="1" lg="1" md="1" sm="1">
                <p class="mb-0">Legal:</p>
              </v-col>
              <v-col cols="12" xl="11" lg="11" md="11" sm="11">
                <p v-if="!this.student.legalLastName && !this.student.legalFirstName && !this.student.legalMiddleNames" class="mb-2"></p>
                <p v-else class="mb-0"><strong>{{ this.student.legalLastName ? this.student.legalLastName: '(none)'}}, {{ this.student.legalFirstName ? this.student.legalFirstName: '(none)'}}, {{ this.student.legalMiddleNames ? this.student.legalMiddleNames: '(none)'}}</strong></p>
              </v-col>
            </v-row>
            <v-row no-gutters class="px-2">
              <v-col cols="12" xl="1" lg="1" md="1" sm="1">
                <p class="mb-0">Usual:</p>
              </v-col>
              <v-col cols="12" xl="11" lg="11" md="11" sm="11">
                <p v-if="!this.student.usualLastName && !this.student.usualFirstName && !this.student.usualMiddleNames" class="mb-2"></p>
                <p v-else class="mb-0"><strong>{{ this.student.usualLastName ? this.student.usualLastName: '(none)'}}, {{ this.student.usualFirstName ? this.student.usualFirstName: '(none)'}}, {{ this.student.usualMiddleNames ? this.student.usualMiddleNames: '(none)'}}</strong></p>
              </v-col>
            </v-row>
            <v-row no-gutters class="px-2">
              <v-col cols="12" xl="1" lg="1" md="1" sm="1">
                <p class="mb-0">DOB:</p>
              </v-col>
              <v-col cols="12" xl="11" lg="11" md="11" sm="11">
                <p class="mb-0"><strong>{{ this.student.dob }}</strong></p>
              </v-col>
            </v-row>
            <v-row no-gutters class="px-2">
              <v-col cols="12" xl="1" lg="1" md="1" sm="1">
                <p class="mb-0">Gender:</p>
              </v-col>
              <v-col cols="12" xl="11" lg="11" md="11" sm="11">
                <p class="mb-0"><strong>{{ this.student.genderCode }}</strong></p>
              </v-col>
            </v-row>
            <v-row v-if="this.request.dataSourceCode === 'BC Services Card' || this.request.dataSourceCode === 'BCSC'" no-gutters class="px-2">
              <v-col cols="12" xl="1" lg="1" md="1" sm="1">
                <p class="mb-0">BCSC:</p>
              </v-col>
              <v-col cols="12" xl="11" lg="11" md="11" sm="11">
                <p class="mb-0"><strong>{{ this.request.bcscAutoMatchDetails }}</strong></p>
              </v-col>
            </v-row>
          </v-alert>
        </v-row>
        <v-row>
          <v-col cols="12" xl="6" lg="6" md="6" class="pa-0">
            <v-card height="100%" width="99%">
              <v-toolbar flat color="#036" class="white--text">
                <v-toolbar-title><h2>PEN Request Data</h2></v-toolbar-title>
              </v-toolbar>
              <v-progress-linear
                      indeterminate
                      color="blue"
                      :active="loadingPen"
              ></v-progress-linear>
              <v-row no-gutters class="pt-2 px-2">
                <v-col cols="12" xl="3" lg="3" md="3" sm="3">
                  <p class="mb-2">Legal:</p>
                </v-col>
                <v-col cols="12" xl="9" lg="9" md="9" sm="9">
                  <p class="mb-2"><strong>{{ this.request.legalLastName ? this.request.legalLastName: '(none)'}}, {{ this.request.legalFirstName ? this.request.legalFirstName: '(none)'}}, {{ this.request.legalMiddleNames ? this.request.legalMiddleNames: '(none)'}}</strong></p>
                </v-col>
              </v-row>
              <v-row no-gutters class="px-2">
                <v-col cols="12" xl="3" lg="3" md="3" sm="3">
                  <p class="mb-2">Usual:</p>
                </v-col>
                <v-col v-if="!this.request.usualLastName && !this.request.usualFirstName && !this.request.usualMiddleName" cols="12" xl="9" lg="9" md="9" sm="9">
                  <p class="mb-2"></p>
                </v-col>
                <v-col v-else-if="this.request.usualLastName === this.request.legalLastName && this.request.usualFirstName === this.request.legalFirstName && this.request.usualMiddleName === this.request.legalMiddleNames" cols="12" xl="9" lg="9" md="9" sm="9">
                  <p class="mb-2 grey--text text--darken-1"><strong>{{ this.request.usualLastName ? this.request.usualLastName: '(none)'}}, {{ this.request.usualFirstName ? this.request.usualFirstName: '(none)'}}, {{ this.request.usualMiddleName ? this.request.usualMiddleName: '(none)'}}</strong></p>
                </v-col>
                <v-col v-else>
                  <p class="mb-2"><strong>{{ this.request.usualLastName ? this.request.usualLastName: '(none)'}}, {{ this.request.usualFirstName ? this.request.usualFirstName: '(none)'}}, {{ this.request.usualMiddleName ? this.request.usualMiddleName: '(none)'}}</strong></p>
                </v-col>
              </v-row>
              <v-row no-gutters class="px-2">
                <v-col cols="12" xl="3" lg="3" md="3" sm="3">
                  <p>Maiden:</p>
                </v-col>
                <v-col cols="12" xl="9" lg="9" md="9" sm="9">
                  <p><strong>{{ this.request.maidenName }}</strong></p>
                </v-col>
              </v-row>
              <v-row no-gutters class="px-2">
                <v-col cols="12" xl="3" lg="3" md="3" sm="3">
                  <p class="mb-2">Past:</p>
                </v-col>
                <v-col cols="12" xl="9" lg="9" md="9" sm="9">
                  <p class="mb-2"><strong>{{ this.request.pastNames }}</strong></p>
                </v-col>
              </v-row>
              <v-row no-gutters class="px-2">
                <v-col cols="12" xl="3" lg="3" md="3" sm="3">
                  <p class="mb-2">DOB:</p>
                </v-col>
                <v-col cols="12" xl="9" lg="9" md="9" sm="9">
                  <p class="mb-2"><strong>{{ this.request.dob ? moment(this.request.dob).format('YYYY-MM-DD'):'' }}</strong></p>
                </v-col>
              </v-row>
              <v-row no-gutters class="px-2">
                <v-col cols="12" xl="3" lg="3" md="3" sm="3">
                  <p>Gender:</p>
                </v-col>
                <v-col cols="12" xl="9" lg="9" md="9" sm="9">
                  <p><strong>{{ this.request.genderCode }}</strong></p>
                </v-col>
              </v-row>
              <v-row no-gutters class="px-2">
                <v-col cols="12" xl="3" lg="3" md="3" sm="3">
                  <p class="mb-2">Current Sch:</p>
                </v-col>
                <v-col cols="12" xl="9" lg="9" md="9" sm="9">
                  <p class="mb-2"><strong>{{ this.request.currentSchool }}</strong></p>
                </v-col>
              </v-row>
              <v-row no-gutters class="px-2">
                <v-col cols="12" xl="3" lg="3" md="3" sm="3">
                  <p class="mb-2">Last BC Sch:</p>
                </v-col>
                <v-col cols="12" xl="9" lg="9" md="9" sm="9">
                  <p class="mb-2"><strong>{{ this.request.lastBCSchool }}</strong></p>
                </v-col>
              </v-row>
              <v-row no-gutters class="px-2">
                <v-col cols="12" xl="3" lg="3" md="3" sm="3">
                  <p>Student ID:</p>
                </v-col>
                <v-col cols="12" xl="9" lg="9" md="9" sm="9">
                  <p><strong>{{ this.request.lastBCSchoolStudentNumber }}</strong></p>
                </v-col>
              </v-row>
              <v-row no-gutters class="px-2">
                <v-col cols="12" xl="3" lg="3" md="3" sm="3">
                  <p class="mb-2">Email:</p>
                </v-col>
                <v-col cols="12" xl="9" lg="9" md="9" sm="9">
                  <p class="mb-2"><strong>{{ this.request.email }}</strong></p>
                </v-col>
              </v-row>
              <v-row no-gutters class="pb-2 px-2">
                <v-col cols="12" xl="3" lg="3" md="3" sm="3">
                  <p class="mb-0">ID Type:</p>
                </v-col>
                <v-col cols="12" xl="9" lg="9" md="9" sm="9">
                  <p class="mb-0"><strong>{{ this.request.dataSourceCode }}</strong></p>
                </v-col>
              </v-row>
            </v-card>
          </v-col>
          <v-col cols="12" xl="6" lg="6" md="6" class="pa-0">
            <Chat></Chat>
          </v-col>
        </v-row>
        <v-row>
          <v-col col="12" class="px-0">
            <v-card>
              <v-toolbar flat color="#036" class="white--text">
                <v-toolbar-title><h2>Documents</h2></v-toolbar-title>
              </v-toolbar>
              <v-progress-linear
                      indeterminate
                      color="blue"
                      :active="loadingPen"
              ></v-progress-linear>
              <v-alert
                :value="documentError"
                dense
                text
                dismissible
                outlined
                transition="scale-transition"
                class="bootstrap-error"
              >
                {{ documentErrorMessage }}
              </v-alert>
              <v-data-table
                      :headers="headers"
                      :items="filteredResults"
                      :sort-by="['createDate']"
                      :items-per-page="15"
                      class="fill-height">
                <template v-slot:item.createDate="{ item }">
                  <span>{{item.createDate.toString().replace(/T/, ', ').replace(/\..+/, '') }}</span>
                </template>
                <template v-slot:item.fileName="{item: document}">
                  <router-link :to="{ path: documentUrl(request.penRequestID, document) }" target="_blank">{{document.fileName}}</router-link>
                </template>

                    <template v-if="isDocumentTypeChangeEnabledForUser"  v-slot:item.documentTypeLabel="{item: document}" >
                      <v-edit-dialog

                        :return-value.sync="document.documentTypeCode"
                        large
                        persistent
                        @open="oldDocumentTypeCode=document.documentTypeCode"
                        @save="saveDocumentType(document)"
                      >
                        <div>{{ document.documentTypeLabel }}</div>
                        <template v-slot:input>
                          <v-select
                            v-model="document.documentTypeCode"
                            style="max-width: 20em;"
                            :items="documentTypes"
                          ></v-select>
                        </template>
                      </v-edit-dialog>
                    </template>

              </v-data-table>
            </v-card>
          </v-col>
        </v-row>
        <v-row>
          <v-card width="100%" >
            <v-toolbar flat color="#036" dark class="tester">
              <v-toolbar-title class="pa-0"><h2>Actions</h2></v-toolbar-title>
            </v-toolbar>
            <v-progress-linear
                    indeterminate
                    color="blue"
                    :active="loadingActionResults || loadingDuplicatePenRequests"
            ></v-progress-linear>
            <v-tabs vertical v-model="activeTab">
              <v-tab id="complete-tab">Provide PEN</v-tab>
              <v-tab id="return-tab">Request Info</v-tab>
              <v-tab id="reject-tab">Reject</v-tab>
              <v-tab-item>
                <v-alert
                        :value="completedUpdateSuccess"
                        dense
                        text
                        dismissible
                        outlined
                        transition="scale-transition"
                        class="bootstrap-success">
                  PEN Request completed and email sent to student.
                </v-alert>
                <v-alert
                        :value="notAPenError"
                        dense
                        text
                        dismissible
                        outlined
                        transition="scale-transition"
                        class="bootstrap-error">
                  The provided PEN is not valid.
                </v-alert>
                <v-alert
                        :value="completedUpdateSuccess === false"
                        dense
                        text
                        dismissible
                        outlined
                        transition="scale-transition"
                        class="bootstrap-error">
                  PEN Request failed to update. Please navigate to the list and select this PEN Request again.
                </v-alert>
                <v-card flat :disabled="!isProvidePenEnabledForUser">
                  <v-row class="mx-0">
                    <v-col cols="12" xl="4" lg="4" md="4" class="py-0">
                      <v-text-field
                              id="pen-search-text-field"
                              v-model="penSearchId"
                              label="PEN:"
                              clearable
                              class="pt-0"
                              @input="validatePen"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" xl="8" lg="8" md="8" class="py-0">
                      <v-row>
                        <v-col v-if="this.request.bcscAutoMatchOutcome === this.autoMatchCodes.ONE_MATCH" cols="2">
                          <v-btn color="success" dark class="mr-4" @click="populateAutoMatchedPen">
                            <v-icon class="pa-0" large>mdi-arrow-left-bold</v-icon>
                          </v-btn>
                        </v-col>
                        <v-col align-self="center">
                          <p v-if="this.request.pen || this.request.penRequestStatusCode === this.statusCodes.AUTO_MATCH || this.request.penRequestStatusCode === this.statusCodes.MANUAL_MATCH"></p>
                          <p v-else-if="!this.request.bcscAutoMatchOutcome" class="text--darken-1 grey--text pa-0 ma-0">No auto-match performed for Basic BCeID</p>
                          <p v-else-if="this.request.bcscAutoMatchOutcome === this.autoMatchCodes.ONE_MATCH" class="green--text pa-0 ma-0"><strong>{{ this.autoPenResults }}</strong> {{ this.request.bcscAutoMatchDetails.split(' ').slice(1).join(' ') }}</p>
                          <p v-else class="orange--text pa-0 ma-0"><strong>{{ this.autoPenResults }}</strong> {{ this.request.bcscAutoMatchDetails.split(' ').slice(1).join(' ') }}</p>
                        </v-col>
                      </v-row>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col class="pt-0" cols="6" height="100%">
                      <v-card class="ml-3">
                        <v-row no-gutters class="pt-2 px-2">
                          <v-col cols="12" xl="3" lg="3" md="3" sm="3">
                            <p class="mb-2">Legal:</p>
                          </v-col>
                          <v-col cols="12" xl="9" lg="9" md="9" sm="9">
                            <p v-if="!this.demographics.legalLast && !this.demographics.legalFirst && !this.demographics.legalMiddle" class="mb-2"></p>
                            <p v-else class="mb-2"><strong>{{ this.demographics.legalLast ? this.demographics.legalLast: '(none)'}}, {{ this.demographics.legalFirst ? this.demographics.legalFirst: '(none)'}}, {{ this.demographics.legalMiddle ? this.demographics.legalMiddle: '(none)'}}</strong></p>
                          </v-col>
                        </v-row>
                        <v-row no-gutters class="pt-2 px-2">
                          <v-col cols="12" xl="3" lg="3" md="3" sm="3">
                            <p class="mb-2">Usual:</p>
                          </v-col>
                          <v-col cols="12" xl="9" lg="9" md="9" sm="9">
                            <p v-if="!this.demographics.usualLast && !this.demographics.usualFirst && !this.demographics.usualMiddle" class="mb-2"></p>
                            <p v-else class="mb-2"><strong>{{ this.demographics.usualLast ? this.demographics.usualLast: '(none)'}}, {{ this.demographics.usualFirst ? this.demographics.usualFirst: '(none)'}}, {{ this.demographics.usualMiddle ? this.demographics.usualMiddle: '(none)'}}</strong></p>
                          </v-col>
                        </v-row>
                        <v-row no-gutters class="pt-2 px-2">
                          <v-col cols="12" xl="3" lg="3" md="3" sm="3">
                            <p class="mb-2">DOB:</p>
                          </v-col>
                          <v-col cols="12" xl="9" lg="9" md="9" sm="9">
                            <p class="mb-2"><strong>{{ this.demographics.dob }}</strong></p>
                          </v-col>
                        </v-row>
                        <v-row no-gutters class="pt-2 px-2">
                          <v-col cols="12" xl="3" lg="3" md="3" sm="3">
                            <p class="mb-2">Gender:</p>
                          </v-col>
                          <v-col cols="12" xl="9" lg="9" md="9" sm="9">
                            <p class="mb-2"><strong>{{ this.demographics.gender }}</strong></p>
                          </v-col>
                        </v-row>
                      </v-card>
                    </v-col>
                    <v-col class="pa-0 pr-6" cols="6">
                      <v-form ref="completeForm">
                        <v-textarea
                          id="complete-comment-textarea"
                          name="description"
                          label="Enter comment"
                          v-model="request.completeComment"
                          :rules="completedRules"
                          filled
                          clearable
                          @input="replaceCompleteMacro"
                          class="pa-0 ma-0"
                        ></v-textarea>
                      </v-form>
                    </v-col>
                  </v-row>
                  <v-row justify="end" class="px-3">
                      <span class="pt-4 pr-1" id="prior-pen-count" v-if="this.numberOfDuplicatePenRequests > 0"><span class="red--text font-weight-bold">{{this.numberOfDuplicatePenRequests}}</span><span class="red--text"> prior PEN Requests</span></span>
                      <v-checkbox v-model="request.demogChanged" true-value="Y" false-value="N" justify="flex-end" class="pa-0" cols="12" label="Student demographics changed"></v-checkbox>
                    <v-col cols="4" xl="4" lg="4" md="4" class="pt-2">
                      <v-btn :disabled="!enableCompleteButton||!enableActions||request.penRequestStatusCode==='DRAFT'" color="#38598a" justify="center" width="100%" :dark="enableCompleteButton && enableActions&&request.penRequestStatusCode!=='DRAFT'" @click="completeRequest">Provide PEN to Student</v-btn>
                    </v-col>
                  </v-row>
                </v-card>
              </v-tab-item>
              <v-tab-item>
                <v-alert
                        :value="returnAlertSuccess"
                        dense
                        text
                        dismissible
                        outlined
                        transition="scale-transition"
                        class="bootstrap-success">
                  PEN Request status updated and email sent to student.
                </v-alert>
                <v-alert
                        :value="returnAlertFailure"
                        dense
                        text
                        dismissible
                        outlined
                        transition="scale-transition"
                        class="bootstrap-error">
                  PEN Request failed to update status. Please navigate to the list and select this PEN Request again.
                </v-alert>
                <v-alert
                        :value="returnAlertWarning"
                        dense
                        text
                        dismissible
                        outlined
                        transition="scale-transition"
                        class="bootstrap-warning">
                  PEN Request status and comment updated, but email to student failed. Please contact support.
                </v-alert>
                <v-card flat class="pa-3" :disabled="!isRequestMoreInfoEnabledForUser">
                  <v-form ref="returnForm">
                    <v-card-text class="pa-0">
                      <v-row class="ma-0">
                        <v-textarea
                                id="return-comment-textarea"
                                name="description"
                                label="Enter return reason"
                                v-model="returnComment"
                                :rules="requiredRules"
                                filled
                                clearable
                                auto-grow
                                @input="replaceReturnMacro"
                                class="pa-0 ma-0"
                        ></v-textarea>
                      </v-row>
                      <v-row justify="end" align-content="end">
                        <v-col cols="12" xl="3" lg="5" md="5" class="py-0" justify="end" align-content="end">
                          <v-btn :disabled="!enableActions||request.penRequestStatusCode==='DRAFT'" color="#38598a" :dark="enableActions&&request.penRequestStatusCode!=='DRAFT'" justify="center" width="100%" @click="returnToStudent">Return to Student</v-btn>
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-form>
                </v-card>
              </v-tab-item>
              <v-tab-item>
                <v-alert
                        :value="rejectAlertSuccess"
                        dense
                        text
                        dismissible
                        outlined
                        transition="scale-transition"
                        class="bootstrap-success">
                  PEN Request updated and email sent to student.
                </v-alert>
                <v-alert
                        :value="rejectAlertFailure"
                        dense
                        text
                        dismissible
                        outlined
                        transition="scale-transition"
                        class="bootstrap-error">
                  PEN Request failed to update. Please navigate to the list and select this PEN Request again.
                </v-alert>
                <v-alert
                        :value="rejectAlertWarning"
                        dense
                        text
                        dismissible
                        outlined
                        transition="scale-transition"
                        class="bootstrap-warning">
                  PEN Request updated, but email to student failed. Please contact support.
                </v-alert>
                <v-card flat class="pa-3" :disabled="!isRejectEnabledForUser">
                  <v-form ref="form" v-model="validForm">
                    <v-card-text class="pa-0">
                      <v-row class="ma-0">
                        <v-textarea
                                id="reject-comment-textarea"
                                name="description"
                                label="Enter reject reason"
                                v-model="rejectComment"
                                :rules="requiredRules"
                                filled
                                clearable
                                auto-grow
                                @input="replaceRejectMacro"
                                class="pa-0 ma-0"
                        ></v-textarea>
                      </v-row>
                      <v-row justify="end" align-content="end">
                        <v-col cols="12" xl="3" lg="5" md="5" class="py-0" justify="end" align-content="end">
                          <v-btn color="#38598a" :disabled="!enableActions" :dark="enableActions" justify="center" width="100%" @click="submitReject">Reject</v-btn>
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-form>
                </v-card>
              </v-tab-item>
            </v-tabs>
          </v-card>
        </v-row>
      </v-col>
    </v-container>
  </v-content>
</template>
<script>
import Chat from './Chat';
import ApiService from '../common/apiService';
import { Routes, Statuses } from '../utils/constants';
import { mapGetters, mapMutations } from 'vuex';
import { humanFileSize } from '../utils/file';
import {AccessEnabledForUser} from '../common/role-based-access';
export default {
  components: {
    Chat
  },
  data () {
    return {
      headers: [
        { text: 'Type', value: 'documentTypeLabel',  },
        { text: 'File Name', value: 'fileName' },
        { text: 'Upload Date/time', value: 'createDate' },
        { text: 'Size', value: 'fileSize' },
        { text: '', value: 'action', sortable: false }
      ],
      validForm: false,
      request: [],
      requiredRules: [v => !!v || 'Required'],
      myself: {
        name: null,
        id: null,
      },
      rejectAlertSuccess: false,
      rejectAlertFailure: false,
      rejectAlertWarning: false,
      returnAlertSuccess: false,
      returnAlertFailure: false,
      returnAlertWarning: false,
      completedUpdateSuccess:null,
      notAPenError: false,
      fileSizeConverter:humanFileSize,
      rejectComment: null,
      returnComment: null,
      penRequestId: null,
      penSearchId: null,
      autoPenResults: null,
      demographics: {
        legalFirst: null,
        legalMiddle: null,
        legalLast: null,
        usualFirst: null,
        usualMiddle: null,
        usualLast: null,
        dob: null,
        gender: null
      },
      enableCompleteButton: false,
      enableActions: true,
      loadingPen: true,
      loadingComments: true,
      loadingActionResults: false,
      loadingDuplicatePenRequests:false,
      loadingClaimAction: false,
      numberOfDuplicatePenRequests:0,
      statusCodes: Statuses.PEN_STATUS_CODES,
      autoMatchCodes: Statuses.AUTO_MATCH_RESULT_CODES,
      filteredResults:[],
      student: {
        legalFirstName: null,
        legalMiddleNames: null,
        legalLastName: null,
        usualFirstName: null,
        usualMiddleNames: null,
        usualLastName: null,
        dob: null,
        genderCode: null
      },
      showDemographics:false,
      studentError: false,
      loadingDemographics:false,
      activeTab: 0,
      macroText: null,
      documentTypes: [],
      oldDocumentTypeCode: '',
      documentError: false,
      documentErrorMessage: '',
      claimError: false,
      claimErrorMessage: '',
      isClaimActionEnabledForUser: false,
      isProvidePenEnabledForUser:false,
      isRequestMoreInfoEnabledForUser:false,
      isRejectEnabledForUser:false,
      isDocumentTypeChangeEnabledForUser:false,
      isReleaseActionEnabledForUser:false,
    };
  },
  computed: {
    ...mapGetters('auth', ['userInfo']),
    ...mapGetters('penRequest', ['messages', 'returnMacros', 'rejectMacros', 'completeMacros']),
    completedRules() {
      const rules = [];
      if (this.request.demogChanged==='Y') {
        const rule = v => !!v || 'Required';
        rules.push(rule);
      }
      return rules;
    }
  },
  mounted() {
    this.enableActions = false;
    this.loadingPen = true;
    this.loadingComments = true;
    this.myself.name = this.userInfo.userName;
    this.myself.id = this.userInfo.userGuid;
    this.penRequestId = this.$store.state['penRequest'].selectedRequest;
    this.isClaimActionEnabledForUser = AccessEnabledForUser('CLAIM_PEN_REQUEST',this.userInfo);
    this.isProvidePenEnabledForUser = AccessEnabledForUser('PROVIDE_PEN',this.userInfo);
    this.isRequestMoreInfoEnabledForUser = AccessEnabledForUser('REQUEST_MORE_INFO',this.userInfo);
    this.isRejectEnabledForUser = AccessEnabledForUser('REJECT_PEN_REQUEST',this.userInfo);
    this.isDocumentTypeChangeEnabledForUser =AccessEnabledForUser('CHANGE_DOCUMENT_TYPE',this.userInfo);
    this.isReleaseActionEnabledForUser = AccessEnabledForUser('RELEASE_PEN_REQUEST',this.userInfo);
    if(!this.returnMacros || ! this.rejectMacros) {
      this.$store.dispatch('penRequest/getMacros');
    }
    this.documentTypes = this.$store.state['penRequest'].documentTypes
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map(code => ({text: code.label, value: code.documentTypeCode}));

    ApiService.apiAxios
      .get(Routes.PEN_REQUEST_ENDPOINT + '/' + this.penRequestId)
      .then(response => {
        this.request = response.data;
        this.rejectComment = response.data.failureReason;

        if(this.request.bcscAutoMatchDetails) {
          this.autoPenResults = this.request.bcscAutoMatchDetails.split(' ')[0];
        }
        if(this.request.pen && (this.request.penRequestStatusCode === this.statusCodes.MANUAL_MATCH || this.request.penRequestStatusCode === this.statusCodes.AUTO_MATCH)) {
          this.showDemographics = true;
          this.loadingDemographics = true;
          ApiService.apiAxios
            .get(Routes.STUDENT_DATA_URL + '/' + this.request.pen)
            .then(demographicsResponse => {
              this.student = demographicsResponse.data;
            })
            .catch(error => {
              this.studentError = true;
              console.log(error);
            })
            .finally(()=>{this.loadingDemographics = false;});
        } else if(this.request.penRequestStatusCode === this.statusCodes.REJECTED) {
          this.activeTab = 2;
        }
      })
      .catch(error => {
        console.log(error);
      })
      .finally(() => {
        this.enableActions = true;
        this.loadingPen = false;
      });
    ApiService.apiAxios
      .get(Routes.PEN_REQUEST_ENDPOINT + '/' + this.penRequestId + '/documents')
      .then(response => {
        this.filteredResults = response.data.map((document) => this.setDocumentTypeLabel(document));
      })
      .catch(error => {
        this.setDocumentError('An error occurred while loading the document list. Please try again later.');
        console.log(error);
      });
  },
  watch: {
    'request.completeComment': 'validateCompleteAction'
  },
  methods: {
    ...mapMutations('penRequest', ['pushMessage']),
    validateCompleteAction() {
      this.$refs.completeForm.validate();
    },
    documentUrl(penRequestID, document) {
      return `${Routes.PEN_REQUEST_ENDPOINT}/${penRequestID}/documents/${document.documentID}`;
    },
    returnToStudent() {
      this.returnAlertWarning = false;
      this.returnAlertSuccess = false;
      this.returnAlertFailure = false;
      if(this.$refs.returnForm.validate()) {
        this.disableActionButtons();
        this.loadingActionResults = true;
        this.request.penRequestStatusCode = Statuses.PEN_STATUS_CODES.RETURNED;
        this.request.reviewer = this.myself.name;
        let body = this.prepPut();
        body.content = this.returnComment;
        ApiService.apiAxios
          .post(Routes.PEN_REQUEST_ENDPOINT + '/' + this.penRequestId + '/return', body)
          .then(response => {
            this.request = response.data.penResponse;
            this.pushMessage(response.data.commentResponse);
            this.returnAlertSuccess = true;
            this.returnComment = null;
            this.$refs.returnForm.resetValidation();
          })
          .catch(error => {
            console.log(error);
            if (error.response.data && error.response.data.message.includes('email service'))
              this.returnAlertWarning = true;
            else
              this.returnAlertFailure = true;
          })
          .finally(() => {
            this.loadingActionResults = false;
            this.enableActionButtons();
          });
      }
    },
    submitReject() {
      this.rejectAlertWarning = false;
      this.rejectAlertSuccess = false;
      this.rejectAlertFailure = false;
      if(this.$refs.form.validate()){
        this.disableActionButtons();
        this.loadingActionResults = true;
        this.request.penRequestStatusCode = Statuses.PEN_STATUS_CODES.REJECTED;
        this.request.failureReason = this.rejectComment;
        this.request.reviewer = this.myself.name;
        ApiService.apiAxios
          .post(Routes.PEN_REQUEST_REJECT_URL, this.prepPut())
          .then(response => {
            this.request = response.data;
            this.rejectAlertSuccess=true;
          })
          .catch(error => {
            console.log(error);
            if(error.response.data && error.response.data.message.includes('email service'))
              this.rejectAlertWarning=true;
            else
              this.rejectAlertFailure=true;
          })
          .finally(() => {
            this.loadingActionResults = false;
            this.enableActionButtons();
          });
      }
    },
    completeRequest() {
      if(this.$refs.completeForm.validate()) {
        this.disableActionButtons();
        this.loadingActionResults = true;
        this.completedUpdateSuccess = null;
        this.request.pen = this.penSearchId;
        if (this.request.bcscAutoMatchOutcome === Statuses.AUTO_MATCH_RESULT_CODES.ONE_MATCH && this.autoPenResults === this.penSearchId) {
          this.request.bcscAutoMatchOutcome = Statuses.AUTO_MATCH_RESULT_CODES.RIGHT_PEN;
          this.request.bcscAutoMatchDetails = 'CORRECT auto-match to: ' + this.request.bcscAutoMatchDetails;
        } else if (this.request.bcscAutoMatchOutcome === Statuses.AUTO_MATCH_RESULT_CODES.ONE_MATCH && this.autoPenResults !== this.penSearchId) {
          this.request.bcscAutoMatchOutcome = Statuses.AUTO_MATCH_RESULT_CODES.WRONG_PEN;
          this.request.bcscAutoMatchDetails = 'WRONG auto-match to: ' + this.request.bcscAutoMatchDetails;
        }
        this.request.reviewer = this.myself.name;
        this.request.penRequestStatusCode = Statuses.PEN_STATUS_CODES.MANUAL_MATCH;
        ApiService.apiAxios
          .post(Routes.PEN_REQUEST_COMPLETE_URL, this.prepPut())
          .then(response => {
            this.request = response.data;
            this.completedUpdateSuccess = true;
          })
          .catch(error => {
            console.log(error);
            this.completedUpdateSuccess = false;
          })
          .finally(() => {
            this.loadingActionResults = false;
            this.enableActionButtons();
          });
      }
    },
    claimRequest() {
      this.loadingClaimAction = true;
      this.claimError = false;
      this.claimErrorMessage='';
      this.disableActionButtons();
      let body = this.prepPut();
      if(this.request.reviewer !== this.myself.name) {
        body.reviewer = this.myself.name;
      }
      else {
        body.reviewer = null;
      }
      ApiService.apiAxios
        .put(Routes.PEN_REQUEST_ENDPOINT, body)
        .then(response => {
          this.request.reviewer = response.data.reviewer;
        })
        .catch(error => {
          this.claimError = true;
          this.claimErrorMessage='There was an error trying to claim the PEN Request, please navigate to the list and select this PEN Request again.';
          console.log(error);
        })
        .finally(() => {
          this.loadingClaimAction = false;
          this.enableActionButtons();
        });
    },
    replaceReturnMacro() {
      if(this.returnComment.includes('!')) {
        this.macroText = this.returnComment.match(/![^!]?[^!]?[^!]?/g);
        this.checkForMacro('return');
      }
    },
    replaceRejectMacro() {
      if(this.rejectComment.includes('!')) {
        this.macroText = this.rejectComment.match(/![^!]?[^!]?[^!]?/g);
        this.checkForMacro('reject');
      }
    },
    replaceCompleteMacro() {
      if(this.request.completeComment && this.request.completeComment.includes('!')) {
        this.macroText = this.request.completeComment.match(/![^!]?[^!]?[^!]?/g);
        this.checkForMacro('complete');
      }
    },
    checkForMacro(type){
      let macros = '';
      switch(type){
      case 'reject':
        macros = this.rejectMacros;
        break;
      case 'return':
        macros = this.returnMacros;
        break;
      case 'complete':
        macros = this.completeMacros;
        break;
      }

      this.macroText.forEach(text => {
        macros.forEach(element => {
          if (element['macroCode'] === text.substring(1)) {
            switch(type){
            case 'return':
              this.returnComment = this.returnComment.replace(text, element.macroText);
              break;
            case 'reject':
              this.rejectComment = this.rejectComment.replace(text, element.macroText);
              break;
            case 'complete':
              this.request.completeComment = this.request.completeComment.replace(text, element.macroText);
              break;
            }
          }
        });
      });
      this.macroText = null;
    },
    validatePen() {
      this.notAPenError = false;
      this.demographics.legalFirst = null;
      this.demographics.legalMiddle = null;
      this.demographics.legalLast = null;
      this.demographics.usualFirst = null;
      this.demographics.usualMiddle = null;
      this.demographics.usualLast = null;
      this.demographics.dob = null;
      this.demographics.gender = null;
      this.enableCompleteButton = false;
      this.numberOfDuplicatePenRequests=0;
      if(this.penSearchId) {
        if (this.penSearchId.length === 9) {
          if (this.checkDigit()) {
            this.searchByPen();
            this.searchDuplicatePenRequestsByPen();
          } else {
            this.notAPenError = true;
          }
        }
      }
    },
    checkDigit() {
      const penDigits = [];
      for(let i = 0; i < this.penSearchId.length; i++) {
        penDigits[i] = parseInt(this.penSearchId.charAt(i), 10);
      }
      const S1 = penDigits.slice(0,-1).filter((element,index) => {return index % 2 === 0;}).reduce((a,b) => a+b,0);
      const A = parseInt(penDigits.slice(0,-1).filter((element,index) => {return index % 2 === 1;}).join(''), 10);
      const B = 2 * A;
      let S2 = B.toString().split('').map(Number).reduce(function (a, b) {return a + b;}, 0);
      const S3 = S1 + S2;
      if((S3 % 10) === 0) {
        return penDigits.pop() === 0;
      }
      return penDigits.pop() === (10 - (S3%10));
    },
    disableActionButtons() {
      this.enableActions = false;
    },
    enableActionButtons() {
      this.enableActions = true;
    },
    searchByPen() {
      this.loadingActionResults = true;
      ApiService.apiAxios
        .get(Routes.SEARCH_BY_PEN + '/' + this.penSearchId)
        .then(response => {
          this.demographics = response.data;
          this.enableCompleteButton = true;
        })
        .catch(error => {
          console.log(error);
        })
        .finally(() => {
          this.loadingActionResults = false;
        });
    },
    searchDuplicatePenRequestsByPen() {
      this.loadingDuplicatePenRequests = true;
      const params={
        pen :this.penSearchId
      };
      ApiService.apiAxios
        .get(`${Routes.DUPLICATE_PEN_REQUESTS_URL}`,{params})
        .then(response => {
          if(response && response.data > 0){
            this.numberOfDuplicatePenRequests=response.data;
          }
        }).catch(error => {
          console.log(error);
        }).finally(() => {
          this.loadingDuplicatePenRequests = false;
        });
    },
    backToList() {
      this.penRequestId = '';
      this.$store.state['penRequest'].selectedRequest = null;
    },
    populateAutoMatchedPen() {
      this.penSearchId = this.autoPenResults;
      this.validatePen();
    },
    prepPut() {
      return {
        'penRequestID': this.$store.state['penRequest'].selectedRequest,
        'pen': this.request.pen,
        'penRequestStatusCode': this.request.penRequestStatusCode,
        'reviewer': this.request.reviewer,
        'failureReason': this.request.failureReason,
        'completeComment': this.request.completeComment,
        'demogChanged': this.request.demogChanged,
        'bcscAutoMatchOutcome': this.request.bcscAutoMatchOutcome,
        'bcscAutoMatchDetails': this.request.bcscAutoMatchDetails
      };
    },
    setDocumentError(message) {
      this.documentError = true;
      this.documentErrorMessage = message;
    },
    setDocumentTypeLabel(document) {
      const documentTypeInfo = this.$store.state['penRequest'].documentTypes.find(typeInfo =>
        typeInfo.documentTypeCode === document.documentTypeCode
      );
      document.documentTypeLabel = documentTypeInfo ? documentTypeInfo.label : document.documentTypeCode;
      return document;
    },
    saveDocumentType(document) {
      ApiService.apiAxios
        .put(this.documentUrl(this.request.penRequestID, document), document)
        .catch(error => {
          document.documentTypeCode = this.oldDocumentTypeCode;
          this.setDocumentError('An error occurred while attempting to update the document type. Please try again later.');
          console.log(error);
        })
        .finally(() => {
          this.setDocumentTypeLabel(document);
        });
    }
  }
};
</script>
<style scoped>
  .v-toolbar /deep/ .v-toolbar__content {
    padding-left: 20px !important;
  }
  .v-textarea /deep/ .v-text-field__details {
    margin-bottom: 0 !important;
  }
  .v-textarea /deep/ .v-input__slot {
    margin-bottom: 0 !important;
  }
  .v-input--checkbox /deep/ .v-input__slot {
    padding: 0 !important;
    justify-content: flex-end !important;
  }
  .v-card /deep/ .v-window__container {
    height:100% !important;
    background-color:#fafafa !important;
  }
  .v-card /deep/ .v-window-item--active {
    height:100% !important;
    background-color:#fafafa !important;
  }
  .v-tab--active {
    background-color: aliceblue;
    font-weight: bold;
  }
  .v-card {
    background-color:#fafafa;
  }
  h2 {
    font-size: 1.25rem
  }
</style>

