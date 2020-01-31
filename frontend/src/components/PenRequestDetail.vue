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
                                  <p class="mb-2 green--text"><b>{{this.request.penRequestStatusCode}}</b></p>
                              </v-col>
                              <v-col v-else-if="this.request.penRequestStatusCode === 'RETURNED'" cols="12" xl="9" lg="9" md="9" sm="9">
                                  <p class="mb-2 orange--text"><b>{{this.request.penRequestStatusCode}}</b></p>
                              </v-col>
                              <v-col v-else cols="12" xl="9" lg="9" md="9" sm="9">
                                  <p class="mb-2 grey--text"><b>{{this.request.penRequestStatusCode}}</b></p>
                              </v-col>
                          </v-row>
                          <v-row no-gutters>
                              <v-col cols="12" xl="3" lg="3" md="3" sm="3">
                                  <p class="mb-2">As of:</p>
                              </v-col>
                              <v-col cols="12" xl="9" lg="9" md="9" sm="9">
                                  <p class="mb-2"><b>{{ this.request.statusUpdateDate ? moment(this.request.statusUpdateDate).fromNow():'' }}</b>, at {{ this.request.statusUpdateDate ? moment(this.request.statusUpdateDate).format('YYYY-MM-DD LT'):'' }}</p>
                              </v-col>
                          </v-row>
                          <v-row no-gutters>
                              <v-col cols="12" xl="3" lg="3" md="3" sm="3">
                                  <p>Submitted:</p>
                              </v-col>
                              <v-col cols="12" xl="9" lg="9" md="9" sm="9">
                                  <p><b>{{ this.request.initialSubmitDate ? moment(this.request.initialSubmitDate).fromNow():'' }}</b>, at {{ this.request.initialSubmitDate ? moment(this.request.initialSubmitDate).format('YYYY-MM-DD LT'):'' }}</p>
                              </v-col>
                          </v-row>
                      </v-card>
                  </v-col>
                  <v-col cols="12" xl="6" lg="6" md="6" sm="6" class="pa-0">
                      <v-card height="100%" width="100%" elevation=0>
                          <v-row v-if="!this.request.reviewer" no-gutters justify-xl="end" justify-lg="end" justify-md="end" justify-sm="end">
                              <p class="blue--text"><b>No one is working on this request</b></p>
                              <v-btn small color="#38598a" dark class="ml-2" @click="claimRequest">Claim</v-btn>
                          </v-row>
                          <v-row v-else-if="this.request.reviewer === this.myself.name" no-gutters justify-xl="end" justify-lg="end" justify-md="end" justify-sm="end">
                              <p class="green--text"><b>You are working on this request</b></p>
                              <v-btn small color="#38598a" dark class="ml-2" @click="claimRequest">Release</v-btn>
                          </v-row>
                          <v-row v-else no-gutters justify-xl="end" justify-lg="end" justify-md="end" justify-sm="end">
                              <p class="orange--text"><b>{{ this.request.reviewer }} is working on this request</b></p>
                              <v-btn small color="#38598a" dark class="ml-2" @click="claimRequest">Claim</v-btn>
                          </v-row>
                          <v-row no-gutters justify="end" class="pb-5">
                              <v-btn small color="#38598a" dark class="ml-2" to="/">Back to List</v-btn>
                          </v-row>
                      </v-card>
                  </v-col>
              </v-row>
              <v-row>
                  <v-col cols="12" xl="6" lg="6" md="6" class="pa-0">
                      <v-card height="100%" width="99%">
                          <v-toolbar flat color="#036" class="white--text">
                              <v-toolbar-title>PEN Request Data</v-toolbar-title>
                          </v-toolbar>
                          <v-row no-gutters class="pt-2 px-2">
                              <v-col cols="12" xl="3" lg="3" md="3" sm="3">
                                  <p class="mb-2" color="green">Legal:</p>
                              </v-col>
                              <v-col cols="12" xl="9" lg="9" md="9" sm="9">
                                  <p class="mb-2"><b>{{ this.request.legalLastName ? this.request.legalLastName: '(none)'}}, {{ this.request.legalFirstName ? this.request.legalFirstName: '(none)'}}, {{ this.request.legalMiddleNames ? this.request.legalMiddleNames: '(none)'}}</b></p>
                              </v-col>
                          </v-row>
                          <v-row no-gutters class="px-2">
                              <v-col cols="12" xl="3" lg="3" md="3" sm="3">
                                  <p class="mb-2">Usual:</p>
                              </v-col>
                              <v-col v-if="!this.request.usualLastName && !this.request.usualFirstName && !this.request.usualMiddleName" cols="12" xl="9" lg="9" md="9" sm="9">
                                  <p class="mb-2"></p>
                              </v-col>
                              <v-col v-else cols="12" xl="9" lg="9" md="9" sm="9">
                                  <p class="mb-2"><b>{{ this.request.usualLastName ? this.request.usualLastName: '(none)'}}, {{ this.request.usualFirstName ? this.request.usualFirstName: '(none)'}}, {{ this.request.usualMiddleName ? this.request.usualMiddleName: '(none)'}}</b></p>
                              </v-col>
                          </v-row>
                          <v-row no-gutters class="px-2">
                              <v-col cols="12" xl="3" lg="3" md="3" sm="3">
                                  <p>Maiden:</p>
                              </v-col>
                              <v-col cols="12" xl="9" lg="9" md="9" sm="9">
                                  <p><b>{{ this.request.maidenName }}</b></p>
                              </v-col>
                          </v-row>
                          <v-row no-gutters class="px-2">
                              <v-col cols="12" xl="3" lg="3" md="3" sm="3">
                                  <p class="mb-2" color="green">Past:</p>
                              </v-col>
                              <v-col cols="12" xl="9" lg="9" md="9" sm="9">
                                  <p class="mb-2"><b>{{ this.request.pastNames }}</b></p>
                              </v-col>
                          </v-row>
                          <v-row no-gutters class="px-2">
                              <v-col cols="12" xl="3" lg="3" md="3" sm="3">
                                  <p class="mb-2">DOB (yyyy/mm/dd):</p>
                              </v-col>
                              <v-col cols="12" xl="9" lg="9" md="9" sm="9">
                                  <p class="mb-2"><b>{{ this.request.dob ? moment(this.request.dob).format('YYYY-MM-DD'):'' }}</b></p>
                              </v-col>
                          </v-row>
                          <v-row no-gutters class="px-2">
                              <v-col cols="12" xl="3" lg="3" md="3" sm="3">
                                  <p>Gender:</p>
                              </v-col>
                              <v-col cols="12" xl="9" lg="9" md="9" sm="9">
                                  <p><b>{{ this.request.genderCode }}</b></p>
                              </v-col>
                          </v-row>
                          <v-row no-gutters class="px-2">
                              <v-col cols="12" xl="3" lg="3" md="3" sm="3">
                                  <p class="mb-2" color="green">Current Sch:</p>
                              </v-col>
                              <v-col cols="12" xl="9" lg="9" md="9" sm="9">
                                  <p class="mb-2"><b>{{ this.request.currentSchool }}</b></p>
                              </v-col>
                          </v-row>
                          <v-row no-gutters class="px-2">
                              <v-col cols="12" xl="3" lg="3" md="3" sm="3">
                                  <p class="mb-2">Last BC Sch:</p>
                              </v-col>
                              <v-col cols="12" xl="9" lg="9" md="9" sm="9">
                                  <p class="mb-2"><b>{{ this.request.lastBCSchool }}</b></p>
                              </v-col>
                          </v-row>
                          <v-row no-gutters class="px-2">
                              <v-col cols="12" xl="3" lg="3" md="3" sm="3">
                                  <p>Student#</p>
                              </v-col>
                              <v-col cols="12" xl="9" lg="9" md="9" sm="9">
                                  <p><b>{{ this.request.lastBCSchoolStudentNumber }}</b></p>
                              </v-col>
                          </v-row>
                          <v-row no-gutters class="px-2">
                              <v-col cols="12" xl="3" lg="3" md="3" sm="3">
                                  <p class="mb-2">Email:</p>
                              </v-col>
                              <v-col cols="12" xl="9" lg="9" md="9" sm="9">
                                  <p class="mb-2"><b>{{ this.request.email }}</b></p>
                              </v-col>
                          </v-row>
                          <v-row no-gutters class="pb-2 px-2">
                              <v-col cols="12" xl="3" lg="3" md="3" sm="3">
                                  <p class="mb-0">ID Type:</p>
                              </v-col>
                              <v-col cols="12" xl="9" lg="9" md="9" sm="9">
                                  <p class="mb-0"><b>{{ this.request.dataSourceCode }}</b></p>
                              </v-col>
                          </v-row>
                      </v-card>
                  </v-col>
                  <v-col cols="12" xl="6" lg="6" md="6" class="pa-0">
                      <v-card height="100%" width="100%" >
                          <v-toolbar flat color="#036" class="white--text">
                              <v-toolbar-title>Discussion</v-toolbar-title>
                          </v-toolbar>
                          <Chat id="chat-box" :myselfProp="myself"></Chat>
                      </v-card>
                  </v-col>
              </v-row>
              <v-row>
                  <v-col col="12" class="px-0">
                      <v-card>
                          <v-toolbar flat color="#036" class="white--text">
                              <v-toolbar-title>Documents</v-toolbar-title>
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
                          <v-toolbar-title class="pa-0">Actions</v-toolbar-title>
                      </v-toolbar>
                      <v-tabs vertical>
                          <v-tab>Provide PEN</v-tab>
                          <v-tab>Return</v-tab>
                          <v-tab>Fail</v-tab>
                          <v-tab-item>
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
                                                  <p class="mb-2" color="green">Legal:</p>
                                              </v-col>
                                              <v-col cols="12" xl="9" lg="9" md="9" sm="9">
                                                  <p class="mb-2"><b>Doe, Jane Marie, (none)</b></p>
                                              </v-col>
                                          </v-row>
                                          <v-row no-gutters class="pt-2 px-2">
                                              <v-col cols="12" xl="3" lg="3" md="3" sm="3">
                                                  <p class="mb-2" color="green">Usual:</p>
                                              </v-col>
                                              <v-col cols="12" xl="9" lg="9" md="9" sm="9">
                                                  <p class="mb-2"><b>Doe, Lizzie</b></p>
                                              </v-col>
                                          </v-row>
                                          <v-row no-gutters class="pt-2 px-2">
                                              <v-col cols="12" xl="3" lg="3" md="3" sm="3">
                                                  <p class="mb-2" color="green">DOB:</p>
                                              </v-col>
                                              <v-col cols="12" xl="9" lg="9" md="9" sm="9">
                                                  <p class="mb-2"><b>2000-04-12</b></p>
                                              </v-col>
                                          </v-row>
                                          <v-row no-gutters class="pt-2 px-2">
                                              <v-col cols="12" xl="3" lg="3" md="3" sm="3">
                                                  <p class="mb-2" color="green">Gender:</p>
                                              </v-col>
                                              <v-col cols="12" xl="9" lg="9" md="9" sm="9">
                                                  <p class="mb-2"><b>Female</b></p>
                                              </v-col>
                                          </v-row>
                                          <v-row no-gutters class="pt-2 px-2">
                                              <v-col cols="12" xl="3" lg="3" md="3" sm="3">
                                                  <p class="mb-2" color="green">Last BC Sch:</p>
                                              </v-col>
                                              <v-col cols="12" xl="9" lg="9" md="9" sm="9">
                                                  <p class="mb-2"><b>Henry James Senior Secondary</b></p>
                                              </v-col>
                                          </v-row>
                                      </v-card>
                                  </v-col>
                              </v-row>
                              </v-card>
                          </v-tab-item>
                          <v-tab-item>
                          <v-card flat height="100%" class="mx-3">
                              <v-card-text class="fill-height">
                                  <v-row>
                                    <ol>
                                        <li>Enter a message for the student in the panel above.</li>
                                        <li>Return the request with the button below.</li>
                                    </ol>
                                  </v-row>
                                  <v-row justify="end" align-content="end">
                                      <v-btn small color="#38598a" dark>Return to Student</v-btn>
                                  </v-row>
                              </v-card-text>
                          </v-card>
                          </v-tab-item>
                          <v-tab-item>
                              <v-card flat class="pa-3">
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
                                <v-form ref="form" v-model="validForm">
                                    <v-card-text class="pa-0">
                                        <v-row class="flex-grow-0 ma-0">
                                            <ol>
                                                <li>Enter the type of failure and provide a detailed reason to the student.</li>
                                                <li>Complete the action with the button below.</li>
                                            </ol>
                                        </v-row>
                                        <v-row class="ma-0">
                                            <v-radio-group 
                                                class="mt-0" 
                                                v-model="failedForm.penRequestStatusCode"
                                                :rules="requiredRules" 
                                                row>
                                                <v-radio label="Reject" value="REJECTED"></v-radio>
                                                <v-radio label="Unable to complete" value="UNMATCHED"></v-radio>
                                            </v-radio-group>
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
import ApiService from '@/common/apiService';
import { Routes } from '@/utils/constants';
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
      rejectAlertSuccess: false,
      rejectAlertFailure: false,
      rejectAlertWarning: false,
      failedForm: {
        penRequestID: null,
        penRequestStatusCode: null,
        failureReason: null
      }
    };
  },
  mounted() {
    ApiService.apiAxios
      .get(Routes.USER)
      .then(response => {
        this.myself.name = response.data.userName;
        this.myself.id = response.data.userGuid;
        console.log(response.data);
      })
      .catch(error => {
        console.log(error);
      });
    ApiService.apiAxios
      .get(Routes.PEN_REQUEST_ENDPOINT + '/' + this.$route.params.id)
      .then(response => {
        this.request = response.data;
        this.failedForm.penRequestID = response.data.penRequestID;
        this.failedForm.penRequestStatusCode = response.data.penRequestStatusCode;
        this.failedForm.failureReason = response.data.failureReason;
      })
      .catch(error => {
        console.log(error);
      });
  },
  methods: {
    submitReject() {
      if(this.$refs.form.validate()){
        this.request.penRequestID = this.failedForm.penRequestID;
        this.request.penRequestStatusCode = this.failedForm.penRequestStatusCode;
        this.request.failureReason = this.failedForm.failureReason;
        
        ApiService.apiAxios
          .put(Routes.PEN_REQUEST_ENDPOINT, this.prepPut())
          .then(() => {
            this.sendEmail(Routes.EMAILS_REJECT_URL, {
              emailAddress: this.request.email,
              rejectionReason: this.request.failureReason
            }); 
          })
          .catch(error => {
            console.log(error);
            this.rejectAlertFailure=true;
          });
      }
    },
    sendEmail(url, body) {
      ApiService.apiAxios
        .post(url, body)
        .then(() => {
          this.rejectAlertSuccess=true;
        })
        .catch(error => {
          console.log(error);
          this.rejectAlertWarning=true;
          return false;
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
    margin-bottom: 0px !important;
  }
  .v-textarea /deep/ .v-input__slot {
    margin-bottom: 0px !important;
  }
  .v-card /deep/ .v-window__container {
    height:100% !important;
    background-color:#fafafa !important;
  }
  .v-card /deep/ .v-window-item--active {
    height:100% !important;
    background-color:#fafafa !important;
  }
  .v-card {
    background-color:#fafafa;
  }
</style>

