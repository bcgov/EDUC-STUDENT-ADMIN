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
                    :active="loadingPen"
            ></v-progress-linear>
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
              <v-row v-if="!this.request.reviewer" no-gutters justify-xl="end" justify-lg="end" justify-md="end" justify-sm="end">
                <p class="blue--text"><strong>No one is working on this request</strong></p>
                <v-btn small color="#38598a" dark class="ml-2" @click="claimRequest">Claim</v-btn>
              </v-row>
              <v-row v-else-if="this.request.reviewer === this.myself.name" no-gutters justify-xl="end" justify-lg="end" justify-md="end" justify-sm="end">
                <p class="green--text"><strong>You are working on this request</strong></p>
                <v-btn small color="#38598a" dark class="ml-2" @click="claimRequest">Release</v-btn>
              </v-row>
              <v-row v-else no-gutters justify-xl="end" justify-lg="end" justify-md="end" justify-sm="end">
                <p class="orange--text"><strong>{{ this.request.reviewer }} is working on this request</strong></p>
                <v-btn small color="#38598a" dark class="ml-2" @click="claimRequest">Claim</v-btn>
              </v-row>
              <v-row no-gutters justify="end" class="pb-5">
                <v-btn small color="#38598a" dark class="ml-2" @click="backToList">Back to List</v-btn>
              </v-row>
            </v-card>
          </v-col>
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
            <v-card height="100%" width="100%" >
              <v-toolbar flat color="#036" class="white--text">
                <v-toolbar-title><h2>Discussion</h2></v-toolbar-title>
              </v-toolbar>
              <v-progress-linear
                      indeterminate
                      color="blue"
                      :active="loadingComments"
              ></v-progress-linear>
              <Chat id="chat-box" :myself="myself" :participants="participants" :messages="messages"></Chat>
            </v-card>
          </v-col>
        </v-row>
        <v-row>
          <v-col col="12" class="px-0">
            <v-card>
              <v-toolbar flat color="#036" class="white--text">
                <v-toolbar-title><h2>Documents</h2></v-toolbar-title>
              </v-toolbar>
              <v-data-table
                      :headers="headers"
                      :items="filteredResults"
                      sort-by="['createDate']"
                      :items-per-page="15"
                      class="fill-height">
                <template v-slot:item.createDate="{ item }">
                  <span>{{item.createDate.toString().replace(/T/, ', ').replace(/\..+/, '') }}</span>
                </template>
                <template v-slot:item.fileName="{item: document}">
                  <router-link :to="{ path: documentUrl(request.penRequestID, document) }" target="_blank">{{document.fileName}}</router-link>
                </template>
              </v-data-table>
            </v-card>
          </v-col>
        </v-row>
        <v-row>
          <v-card width="100%">
            <v-toolbar flat color="#036" dark class="tester">
              <v-toolbar-title class="pa-0"><h2>Actions</h2></v-toolbar-title>
            </v-toolbar>
            <v-tabs vertical>
              <v-tab>Provide PEN</v-tab>
              <v-tab>Request Info</v-tab>
              <v-tab>Reject</v-tab>
              <v-tab-item>
                <v-alert
                        :value="completedRequestSuccess && completedUpdateSuccess"
                        type="success"
                        dense
                        text
                        dismissible
                        transition="scale-transition">
                  PEN Request completed and email sent to student.
                </v-alert>
                <v-alert
                        :value="notAPenError"
                        type="error"
                        dense
                        text
                        dismissible
                        transition="scale-transition">
                  The provided PEN is not valid.
                </v-alert>
                <v-alert
                        :value="completedRequestSuccess === false || completedUpdateSuccess === false"
                        type="error"
                        dense
                        text
                        dismissible
                        transition="scale-transition">
                  An error occurred while attempting to complete the PEN request.  Depending on the failure, the request may be in a partially completed state. Please contact support.
                </v-alert>
                <v-card flat>
                  <v-row class="mx-0">
                    <v-col cols="12" xl="4" lg="4" md="4" class="py-0">
                      <v-text-field
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
                    <v-col class="pt-0">
                      <v-card class="mx-3">
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
                  </v-row>
                  <v-row justify="end" class="px-3">
                    <v-col cols="12" xl="3" lg="5" md="5" class="pt-0">
                      <v-btn :disabled="!enableCompleteButton" color="#38598a" justify="center" width="100%" :dark="enableCompleteButton" @click="completeRequest">Provide PEN to Student</v-btn>
                    </v-col>
                  </v-row>
                </v-card>
              </v-tab-item>
              <v-tab-item>
                <v-alert
                        :value="returnAlertSuccess"
                        type="success"
                        dense
                        text
                        dismissible
                        transition="scale-transition">
                  PEN Request status updated and email sent to student.
                </v-alert>
                <v-alert
                        :value="returnAlertFailure"
                        type="error"
                        dense
                        text
                        dismissible
                        transition="scale-transition">
                  PEN Request failed to update status. Please contact support.
                </v-alert>
                <v-alert
                        :value="returnAlertWarning"
                        type="warning"
                        dense
                        text
                        dismissible
                        transition="scale-transition">
                  PEN Request status updated, but email to student failed. Please contact support.
                </v-alert>
                <v-card flat class="mx-3">
                  <v-row>
                    <v-card-text class="fill-height">
                      <v-row>
                        <ol>
                          <li>Enter a message for the student in the discussion panel above.</li>
                          <li>Return the request with the button below.</li>
                        </ol>
                      </v-row>
                    </v-card-text>
                  </v-row>
                  <v-row justify="end" align-content="end">
                    <v-col cols="12" xl="3" lg="5" md="5" class="pt-0" justify="end" align-content="end">
                      <v-btn color="#38598a" dark justify="center" width="100%" @click="returnToStudent">Return to Student</v-btn>
                    </v-col>
                  </v-row>
                </v-card>
              </v-tab-item>
              <v-tab-item>
                <v-alert
                        :value="rejectAlertSuccess"
                        type="success"
                        dense
                        text
                        dismissible
                        transition="scale-transition">
                  PEN Request updated and email sent to student.
                </v-alert>
                <v-alert
                        :value="rejectAlertFailure"
                        type="error"
                        dense
                        text
                        dismissible
                        transition="scale-transition">
                  PEN Request failed to update. Please contact support.
                </v-alert>
                <v-alert
                        :value="rejectAlertWarning"
                        type="warning"
                        dense
                        text
                        dismissible
                        transition="scale-transition">
                  PEN Request updated, but email to student failed. Please contact support.
                </v-alert>
                <v-card flat class="pa-3">
                  <v-form ref="form" v-model="validForm">
                    <v-card-text class="pa-0">
                      <v-row class="flex-grow-0 ma-0">
                        <ol>
                          <li>Enter the type of failure and provide a detailed reason to the student.</li>
                          <li>Complete the action with the button below.</li>
                        </ol>
                      </v-row>
                      <v-row class="ma-0">
                        <v-textarea
                                name="description"
                                label="Enter reason"
                                v-model="failedForm.failureReason"
                                :rules="requiredRules"
                                filled
                                auto-grow
                                class="pa-0 ma-0"
                        ></v-textarea>
                      </v-row>
                      <v-row justify="end" align-content="end">
                        <v-col cols="12" xl="3" lg="5" md="5" class="py-0" justify="end" align-content="end">
                          <v-btn color="#38598a" dark justify="center" width="100%" @click="submitReject">Reject</v-btn>
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
import { mapGetters } from 'vuex';
import { humanFileSize } from '../utils/file';
export default {
  components: {
    Chat
  },
  data () {
    return {
      headers: [
        { text: 'Type', value: 'documentTypeCode',  },
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
      participants: [],
      messages: [],
      rejectAlertSuccess: false,
      rejectAlertFailure: false,
      rejectAlertWarning: false,
      returnAlertSuccess: false,
      returnAlertFailure: false,
      returnAlertWarning: false,
      completedRequestSuccess: null,
      completedUpdateSuccess:null,
      notAPenError: false,
      fileSizeConverter:humanFileSize,
      failedForm: {
        failureReason: null
      },
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
      loadingPen: true,
      loadingComments: true,
      statusCodes: Statuses.PEN_STATUS_CODES,
      autoMatchCodes: Statuses.AUTO_MATCH_RESULT_CODES,
      filteredResults:[]
    };
  },
  computed: {
    ...mapGetters('auth', ['userInfo']),
  },
  mounted() {
    this.loadingPen = true;
    this.loadingComments = true;
    this.myself.name = this.userInfo.userName;
    this.myself.id = this.userInfo.userGuid;
    this.penRequestId = this.$store.state['penRequest'].selectedRequest;

    ApiService.apiAxios
      .get(Routes.PEN_REQUEST_ENDPOINT + '/' + this.penRequestId)
      .then(response => {
        this.request = response.data;
        this.failedForm.failureReason = response.data.failureReason;
        this.autoPenResults = this.request.bcscAutoMatchDetails.split(' ')[0];
      })
      .catch(error => {
        console.log(error);
      })
      .finally(() => {
        this.loadingPen = false;
      });
    ApiService.apiAxios
      .get(Routes.PEN_REQUEST_ENDPOINT + '/' + this.penRequestId + '/comments')
      .then(response => {
        this.participants = response.data.participants;
        this.messages = response.data.messages;
      })
      .catch(error => {
        console.log(error);
      })
      .finally(() => {
        this.loadingComments = false;
      });
    ApiService.apiAxios
      .get(Routes.PEN_REQUEST_ENDPOINT + '/' + this.penRequestId + '/documents')
      .then(response => {
        console.log(response);
        this.filteredResults = response.data;
      })
      .catch(error => {
        console.log(error);
      });
  },
  methods: {
    documentUrl(penRequestID, document) {
      return `${Routes.PEN_REQUEST_ENDPOINT}/${penRequestID}/documents/${document.documentID}`;
    },
    returnToStudent() {
      this.returnAlertWarning = false;
      this.returnAlertSuccess = false;
      this.returnAlertFailure = false;
      this.request.penRequestStatusCode = Statuses.PEN_STATUS_CODES.RETURNED;
      ApiService.apiAxios
        .post(Routes.PEN_REQUEST_UPDATE_AND_EMAIL_URL, { penRetrievalRequest: this.prepPut(), penEmailRequest: { type: 'info'}})
        .then(response => {
          this.request = response.data;
          this.returnAlertSuccess=true;
        })
        .catch(error => {
          console.log(error);
          if(error.response.data)
            this.returnAlertWarning=true;
          else
            this.returnAlertFailure=true;
        });
    },
    submitReject() {
      this.rejectAlertWarning = false;
      this.rejectAlertSuccess = false;
      this.rejectAlertFailure = false;
      if(this.$refs.form.validate()){
        this.request.penRequestStatusCode = Statuses.PEN_STATUS_CODES.REJECTED;
        this.request.failureReason = this.failedForm.failureReason;

        ApiService.apiAxios
          .post(Routes.PEN_REQUEST_UPDATE_AND_EMAIL_URL, { penRetrievalRequest: this.prepPut(), penEmailRequest: { message: this.request.failureReason, type: 'reject'}})
          .then(response => {
            this.request = response.data;
            this.rejectAlertSuccess=true;
          })
          .catch(error => {
            console.log(error);
            if(error.response.data)
              this.rejectAlertWarning=true;
            else
              this.rejectAlertFailure=true;
          });
      }
    },
    completeRequest() {
      this.completedRequestSuccess = null;
      this.completedUpdateSuccess = null;

      if(this.request.bcscAutoMatchOutcome === Statuses.AUTO_MATCH_RESULT_CODES.ONE_MATCH && this.request.autoPenResults === this.penSearchId) {
        this.request.bcscAutoMatchOutcome = Statuses.AUTO_MATCH_RESULT_CODES.RIGHT_PEN;
        this.request.bcscAutoMatchDetails = 'CORRECT auto-match to: ' + this.request.bcscAutoMatchDetails;
      } else if(this.request.bcscAutoMatchOutcome === Statuses.AUTO_MATCH_RESULT_CODES.ONE_MATCH && this.request.autoPenResults !== this.penSearchId){
        this.request.bcscAutoMatchOutcome = Statuses.AUTO_MATCH_RESULT_CODES.WRONG_PEN;
        this.request.bcscAutoMatchDetails = 'WRONG auto-match to: ' + this.request.bcscAutoMatchDetails;
      }

      ApiService.apiAxios
        .post(Routes.PEN_REQUEST_COMPLETE_REQUEST_URL)
        .then(() => {
          this.completedRequestSuccess = true;
        })
        .catch(error => {
          console.log(error);
          this.completedRequestSuccess = false;
        });

      this.request.penRequestStatusCode = Statuses.PEN_STATUS_CODES.MANUAL_MATCH;
      ApiService.apiAxios
        .post(Routes.PEN_REQUEST_UPDATE_AND_EMAIL_URL, { penRetrievalRequest: this.prepPut(), penEmailRequest: { type: 'complete'}})
        .then(response => {
          this.request = response.data;
          this.completedUpdateSuccess=true;
        })
        .catch(error => {
          console.log(error);
          this.completedUpdateSuccess=false;
        });

    },
    claimRequest() {
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
          console.log(error);
        });
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
      if(this.penSearchId) {
        if (this.penSearchId.length === 9) {
          if (this.checkDigit()) {
            this.searchByPen();
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
    searchByPen() {
      ApiService.apiAxios
        .get(Routes.SEARCH_BY_PEN + '/' + this.penSearchId)
        .then(response => {
          this.demographics = response.data;
          this.enableCompleteButton = true;
        })
        .catch(error => {
          console.log(error);
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
      const body = JSON.parse(JSON.stringify(this.request));
      delete body['createUser'];
      delete body['createDate'];
      delete body['updateUser'];
      delete body['updateDate'];
      return body;
    }
  }
};
</script>
<style scoped>
  #chat-box {
    height:425px;
  }
  .v-toolbar /deep/ .v-toolbar__content {
    padding-left: 20px !important;
  }
  .v-textarea /deep/ .v-text-field__details {
    margin-bottom: 0 !important;
  }
  .v-textarea /deep/ .v-input__slot {
    margin-bottom: 0 !important;
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

