<template>
  <v-content>
    <v-container class="fill-height">
      <v-col cols="12" class="fill-height pb-5">
        <v-row class="flex-grow-0 pb-5">
          <v-card height="100%" width="100%" elevation=0>
            <v-card-title class="pb-0 px-0">GetMyPen Request Details</v-card-title>
            <v-divider/>
          </v-card>
        </v-row>
        <v-row>
          <v-col cols="12" xl="6" lg="6" md="6" sm="6" class="py-0 pl-0">
            <v-card height="100%" width="100%" elevation=0>
              <v-row no-gutters>
                <v-col cols="12" xl="3" lg="3" md="3" sm="3">
                  <p class="mb-2">Status:</p>
                </v-col>
                <v-col v-if="this.request.penRequestStatusCode === 'INITREV' || this.request.penRequestStatusCode === 'SUBSREV'" cols="12" xl="9" lg="9" md="9" sm="9">
                  <p class="mb-2 green--text"><strong>{{this.request.penRequestStatusCode}}</strong></p>
                </v-col>
                <v-col v-else-if="this.request.penRequestStatusCode === 'RETURNED'" cols="12" xl="9" lg="9" md="9" sm="9">
                  <p class="mb-2 orange--text"><strong>{{this.request.penRequestStatusCode}}</strong></p>
                </v-col>
                <v-col v-else cols="12" xl="9" lg="9" md="9" sm="9">
                  <p class="mb-2 grey--text text--darken-1"><strong>{{this.request.penRequestStatusCode}}</strong></p>
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
                  <p v-if="this.request.dataSourceCode === 'DIRECT'" class="mb-0"><strong>BCEID</strong></p>
                  <p v-else class="mb-0"><strong>{{ this.request.dataSourceCode }}</strong></p>
                </v-col>
              </v-row>
            </v-card>
          </v-col>
          <v-col cols="12" xl="6" lg="6" md="6" class="pa-0">
            <v-card height="100%" width="100%" >
              <v-toolbar flat color="#036" class="white--text">
                <v-toolbar-title><h2>Discussion</h2></v-toolbar-title>
              </v-toolbar>
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
                  <span>{{new Date(item.createDate).toISOString().replace(/T/, ', ').replace(/\..+/, '') }}</span>
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
                        :value="completedAlertSuccess"
                        type="success"
                        dense
                        text
                        dismissible
                        transition="scale-transition">
                  PEN Request completed and email sent to student.
                </v-alert>
                <v-alert
                        :value="completedAlertFailure"
                        type="error"
                        dense
                        text
                        dismissible
                        transition="scale-transition">
                  PEN Request failed to update. Please contact support.
                </v-alert>
                <v-alert
                        :value="completedAlertWarning"
                        type="warning"
                        dense
                        text
                        dismissible
                        transition="scale-transition">
                  PEN Request completed, but email to student failed. Please contact support.
                </v-alert>
                <v-card flat>
                  <v-row class="mx-0" justify="space-between">
                    <v-col cols="12" xl="4" lg="4" md="4">
                      <v-text-field
                              value="1234567"
                              label="PEN:"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" xl="5" lg="5" md="5">
                      <v-btn color="#38598a" justify="center" width="100%" dark>Provide PEN to Student</v-btn>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col>
                      <v-card class="mx-3">
                        <v-row no-gutters class="pt-2 px-2">
                          <v-col cols="12" xl="3" lg="3" md="3" sm="3">
                            <p class="mb-2">Legal:</p>
                          </v-col>
                          <v-col cols="12" xl="9" lg="9" md="9" sm="9">
                            <p class="mb-2"><strong>Doe, Jane Marie, (none)</strong></p>
                          </v-col>
                        </v-row>
                        <v-row no-gutters class="pt-2 px-2">
                          <v-col cols="12" xl="3" lg="3" md="3" sm="3">
                            <p class="mb-2">Usual:</p>
                          </v-col>
                          <v-col cols="12" xl="9" lg="9" md="9" sm="9">
                            <p class="mb-2"><strong>Doe, Lizzie</strong></p>
                          </v-col>
                        </v-row>
                        <v-row no-gutters class="pt-2 px-2">
                          <v-col cols="12" xl="3" lg="3" md="3" sm="3">
                            <p class="mb-2">DOB:</p>
                          </v-col>
                          <v-col cols="12" xl="9" lg="9" md="9" sm="9">
                            <p class="mb-2"><strong>2000-04-12</strong></p>
                          </v-col>
                        </v-row>
                        <v-row no-gutters class="pt-2 px-2">
                          <v-col cols="12" xl="3" lg="3" md="3" sm="3">
                            <p class="mb-2">Gender:</p>
                          </v-col>
                          <v-col cols="12" xl="9" lg="9" md="9" sm="9">
                            <p class="mb-2"><strong>Female</strong></p>
                          </v-col>
                        </v-row>
                      </v-card>
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
                <v-card flat height="100%" class="mx-3">
                  <v-card-text class="fill-height">
                    <v-row>
                      <ol>
                        <li>Enter a message for the student in the panel above.</li>
                        <li>Return the request with the button below.</li>
                      </ol>
                    </v-row>
                    <v-row justify="end" align-content="end">
                      <v-btn small color="#38598a" dark @click="returnToStudent">Return to Student</v-btn>
                    </v-row>
                  </v-card-text>
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
                <v-alert
                  :value="rejectInvalidWarning"
                  type="warning"
                  dense
                  text
                  dismissible
                  transition="scale-transition">
                  You cannot reject a request that is already in rejected state.
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
                      <v-row justify="end" align-content="end" class="ma-0">
                        <v-btn small color="#38598a" dark @click="submitReject">Complete</v-btn>
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
import { Routes } from '../utils/constants';
import { mapGetters } from 'vuex';

export default {
  components: {
    Chat
  },
  data () {
    return {
      headers: [
        { text: 'Type', value: 'createDate',  },
        { text: 'File Name', value: 'penRequestStatusCode.label' },
        { text: 'Size', value: 'legalLastName' },
      ],
      validForm: false,
      request: [],
      statusCodes: [],
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
      rejectInvalidWarning: false,
      returnAlertSuccess: false,
      returnAlertFailure: false,
      returnAlertWarning: false,
      completedAlertSuccess: false,
      completedAlertFailure: false,
      completedAlertWarning: false,
      failedForm: {
        failureReason: null
      },
      penRequestId: null
    };
  },
  computed: {
    ...mapGetters('auth', ['userInfo']),
  },
  mounted() {
    this.myself.name = this.userInfo.userName;
    this.myself.id = this.userInfo.userGuid;
    this.penRequestId = this.$store.state['penRequest'].selectedRequest;

    ApiService.apiAxios
      .get(Routes.PEN_REQUEST_ENDPOINT + '/' + this.penRequestId)
      .then(response => {
        this.request = response.data;
        this.failedForm.failureReason = response.data.failureReason;
      })
      .catch(error => {
        console.log(error);
      });
    ApiService.apiAxios
      .get(Routes.PEN_REQUEST_ENDPOINT + '/' + this.penRequestId + '/comments')
      .then(response => {
        this.participants = response.data.participants;
        this.messages = response.data.messages;
      })
      .catch(error => {
        console.log(error);
      });
  },
  methods: {
    returnToStudent() {
      this.request.penRequestStatusCode = 'RETURNED';
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
      if(this.$refs.form.validate()){
        this.request.penRequestStatusCode = 'REJECTED';
        this.request.failureReason = this.failedForm.failureReason;

        ApiService.apiAxios
          .post(Routes.PEN_REQUEST_UPDATE_AND_EMAIL_URL, { penRetrievalRequest: this.prepPut(), penEmailRequest: { message: this.request.failureReason, type: 'reject'}})
          .then(response => {
            this.request = response.data;
            this.rejectAlertSuccess=true;
          })
          .catch(error => {
            console.log(error);
            if(error.response.status === 409)
              this.rejectInvalidWarning=true;
            else if(error.response.data)
              this.rejectAlertWarning=true;
            else
              this.rejectAlertFailure=true;
          });
      }
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
    backToList() {
      this.penRequestId = null;
      this.$store.state['penRequest'].selectedRequest = null;
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

