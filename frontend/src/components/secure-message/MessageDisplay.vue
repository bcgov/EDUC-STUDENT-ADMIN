<template>
  <v-container class="containerSetup" fluid>
    <v-row v-if="loading">
      <v-col class="d-flex justify-center">
        <v-progress-circular
          class="mt-16"
          :size="70"
          :width="7"
          color="primary"
          indeterminate
          :active="loading"
        ></v-progress-circular>
      </v-col>
    </v-row>
    <div style="width: 100%;" :overlay=false>
      <v-row class="pt-0"
             :class="{'mr-0 ml-0': $vuetify.breakpoint.smAndDown, 'mr-3 ml-3': $vuetify.breakpoint.mdAndUp}">
        <v-col cols="12 pt-0">
          <div v-if="!loading && secureExchange">
            <v-row>
              <v-col class="pb-0 pt-0 d-flex justify-start">
                <v-row >
                  <v-col cols="12" class="pb-2 pt-2 pr-0" style="text-align: left">
                    <h2 class="subjectHeading">{{ secureExchange.subject }}</h2>
                    <div class="ministryOwnershipTeamName" style="color: black">{{ secureExchange.contactName }}</div>
                    <div class="createDate" style="color: black">{{ secureExchange.createDate }}</div>
                  </v-col>
                </v-row>
              </v-col>
              <v-col class="pb-0 pt-0 d-flex justify-end">
                <v-row>
                  <v-col class="d-flex justify-end">
                    <v-card outlined color="transparent" class="mr-5">
                      <v-row>
                        <v-col>
                          <v-icon class="ml-n1" :color="getStatusColor(secureExchange.secureExchangeStatusCode)" dark>
                            mdi-circle-medium
                          </v-icon>
                          <span class="ml-n1">{{ secureExchange.secureExchangeStatusCode }}</span>
                        </v-col>
                      </v-row>
                      <v-row no-gutters>
                        <v-col>
                          <v-icon color="grey darken-3" size="medium" dark>
                            mdi-pound
                          </v-icon>
                          <span>{{ secureExchange.sequenceNumber }}</span>
                        </v-col>
                      </v-row>
                    </v-card>
                    <v-card outlined color="transparent">
                      <v-row>
                        <v-col>
                          <v-icon>{{ secureExchange.reviewer ? 'mdi-account-outline' : 'mdi-account-off-outline' }}</v-icon>
                          <span>{{ secureExchange.reviewer ? secureExchange.reviewer : 'Unclaimed' }}</span>
                        </v-col>
                      </v-row>
                      <v-row no-gutters>
                        <v-col>
                          <v-icon class="pr-1" color="grey darken-3" dark>mdi-clock-outline</v-icon>
                          <span class="mr-2">{{getNumberOfDays(secureExchange.createDate)}}</span>
                        </v-col>
                      </v-row>
                    </v-card>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
            <v-row>
              <v-col class="mt-1 d-flex justify-start">
                <v-icon small color="#1976d2">mdi-arrow-left</v-icon>
                <a class="pt-1 ml-1" @click="backButtonClick">Return to {{ this.ministryOwnershipTeamName }} Inbox</a>
              </v-col>
              <v-col class="d-flex justify-end">
                <v-btn :disabled="!isEditable()"   id="markAsButton" v-on:click="clickMarkAsButton" :loading="loadingReadStatus">
                  <v-icon v-if="secureExchange.isReadByExchangeContact">mdi-email-outline</v-icon>
                  <v-icon v-else>mdi-email-open-outline</v-icon>
                  <span class="ml-1 markAsSpan">{{`Mark As ${secureExchange.isReadByMinistry ? 'Unread' : 'Read'}` }}</span>
                </v-btn>
                <v-btn id="claimAsButton" class="mx-2" v-on:click="clickClaimMsgButton" :disabled="!isEditable()">
                  <v-icon>{{ !isClaimable() ? 'mdi-account-off-outline' : 'mdi-account-check-outline' }}</v-icon>
                  <span class="ml-1">{{ isClaimable() ? 'Claim' : 'Unclaim' }}</span>
                </v-btn>
                <v-btn id="changeStatusButton" v-on:click="clickMarkAsClosedButton" :disabled="!isEditable()">
                  <span>Close</span>
                </v-btn>
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col>
                <v-divider class="divider"></v-divider>
              </v-col>
            </v-row>
            <v-row>
              <v-speed-dial id="editOptionsMenu" v-if="isEditable() && shouldDisplaySpeedDial" v-model="editOptionsOpen" top left direction="right">
                <template v-slot:activator>
                  <v-btn id="editOptionsMenuBtn" class="ml-4" fab dark color="#003366">
                    <v-icon v-if="editOptionsOpen" dark large>mdi-close</v-icon>
                    <v-icon v-else dark large>mdi-plus</v-icon>
                  </v-btn>
                </template>
                <v-card>
                  <v-btn id="newMessageToConvBtn" small @click="displayMessagePanel">
                    <v-icon color="#003366">mdi-email-outline</v-icon>
                    <span style="color: #003366; text-transform: none!important;" class="ml-1">Message</span>
                  </v-btn>
                  <v-btn small id="addAttachmentConvButton" @click="displayAttachmentPanel">
                    <v-icon color="#003366">mdi-paperclip</v-icon>
                    <span style="color: #003366; text-transform: none!important;" class="ml-1">Attachment</span>
                  </v-btn>
                  <v-btn small id="addStudentConvButton" @click="displayStudentPanel">
                    <v-icon color="#003366">mdi-emoticon-happy-outline</v-icon>
                    <span style="color: #003366; text-transform: none!important;" class="ml-1">Student</span>
                  </v-btn>
                  <v-btn small id="addNoteConvButton" @click="displayNotePanel">
                    <v-icon color="#003366">mdi-text</v-icon>
                    <span style="color: #003366; text-transform: none!important;" class="ml-1">Note</span>
                  </v-btn>
                </v-card>
              </v-speed-dial>
            </v-row>
            <v-expand-transition>
              <v-row v-if="isNewMessageDisplayed">
                <v-card-text id="newMessageCardText" class="pb-0 pt-5 pl-16 ml-10 pr-16 mr-10">
                  <v-textarea id="newMessageToConvTextArea"
                              outlined
                              solo
                              label="New Message..."
                              auto-grow
                              v-model="newMessage"
                              rows="8"
                              maxlength="4000"
                              class="pt-0"
                              ref="newMessageToConvTextArea"
                              @input="replaceMessageMacro"
                  >
                  </v-textarea>
                </v-card-text>
                <v-row class="py-4 justify-end pt-0 pr-16 mr-10 ml-7 pl-16">
                  <MacroMenu id="newMessageMacroSelector"  small :macros="messageMacros" menuMaxWidth="25%" @select="insertMacroMessage" />
                  <v-spacer></v-spacer>
                  <PrimaryButton id="cancelMessage" secondary text="Cancel" class="mr-2" @click.native="hideNewMessagePanel"></PrimaryButton>
                  <PrimaryButton id="newMessagePostBtn" text="Send" width="8rem" :disabled="!newMessage" :loading="loading" @click.native="sendNewExchangeComment"></PrimaryButton>
                </v-row>
              </v-row>
            </v-expand-transition>
            <v-expand-transition>
              <v-row v-if="isNewNoteDisplayed">
                <v-card-text id="newNoteCardText" class="pb-0 pt-5 pl-16 ml-10 pr-16 mr-10">
                  <v-textarea id="newNoteToConvTextArea"
                              outlined
                              solo
                              label="New Note..."
                              auto-grow
                              v-model="newNote"
                              rows="8"
                              maxlength="4000"
                              class="pt-0"
                              ref="newNoteToConvTextArea"
                  >
                  </v-textarea>
                </v-card-text>
                <v-row class="py-4 justify-end pt-0 pr-16 mr-10">
                  <PrimaryButton id="cancelNote" secondary text="Cancel" class="mr-2" @click.native="hideNewNotePanel"></PrimaryButton>
                  <PrimaryButton id="newNotePostBtn" text="Save" width="8rem" :disabled="!newNote" :loading="loading" @click.native="sendNewExchangeNote"></PrimaryButton>
                </v-row>
              </v-row>
            </v-expand-transition>
            <v-row no-gutters>
              <v-col class="d-flex justify-center">
                <v-expand-transition>
                  <DocumentUpload
                      style="min-width: 40em"
                      :small-file-extension="false"
                      :check-file-rules="true"
                      v-show="isNewAttachmentDisplayed"
                      @close:form="hideAttachmentPanel"
                      @upload="upload">
                  </DocumentUpload>
                </v-expand-transition>
              </v-col>
            </v-row>
            <v-expand-transition>
              <v-row v-if="isNewStudentDisplayed">
                <v-col class="d-flex justify-center">

                    <AddStudent @addStudent="sendNewSecureExchangeStudent" @close:form="hideStudentPanel" :mincode="getMincode()" :additionalStudentAddWarning="addStudentWarningMessage" @updateAdditionalStudentAddWarning="updateAddStudentWarningMessage">
                    </AddStudent>

                </v-col>
              </v-row>
            </v-expand-transition>
            <v-row>
              <v-col>
                <v-timeline v-if="secureExchange.activities.length > 0">
                  <div v-for="(activity, index) in secureExchange.activities"
                       :key="activity.secureExchangeCommentID">
                    <v-timeline-item :left="activity.isSchool" icon-color="#003366" large color="white" :icon="getActivityIcon(activity)">
                      <v-card v-if="activity.type === 'message'">
                        <v-card-title>
                          <div class="activityTitle">{{ activity.title }}</div>
                          <v-spacer></v-spacer>
                          <div class="activityDisplayDate">{{ activity.displayDate }}</div>
                        </v-card-title>
                        <v-card-text class="activityContent">{{ activity.content }}</v-card-text>
                      </v-card>
                      <v-card v-if="activity.type === 'student'">
                        <v-card-title>
                          <div class="activityTitle">{{ activity.title }}</div>
                          <v-spacer></v-spacer>
                          <div class="activityDisplayDate">{{ activity.displayDate }}</div>
                        </v-card-title>

                        <v-card-text class="">
                          <v-row v-if="activity.studentPEN !== null">
                            <v-col class="pt-0" cols="3">
                              <span>PEN: </span>
                            </v-col>
                            <v-col class="pt-0" cols="9" >
                              <a @click="openStudentDetail(activity)">{{ activity.studentPEN }}</a>
                            </v-col>
                          </v-row>
                          <v-row v-if="activity.studentLocalID !== null">
                            <v-col class="pt-0" cols="3">
                              <span>Local ID: </span>
                            </v-col>
                            <v-col class="pt-0" cols="9">
                              <span>{{ activity.studentLocalID }}</span>
                            </v-col>
                          </v-row>
                          <v-row v-if="activity.studentSurname !== null">
                            <v-col class="pt-0" cols="3">
                              <span>Surname: </span>
                            </v-col>
                            <v-col class="pt-0" cols="9">
                              <span>{{ activity.studentSurname }}</span>
                            </v-col>
                          </v-row>
                          <v-row v-if="activity.studentGiven !== null">
                            <v-col class="pt-0" cols="3">
                              <span>Given Name: </span>
                            </v-col>
                            <v-col class="pt-0" cols="9">
                              <span>{{ activity.studentGiven }}</span>
                            </v-col>
                          </v-row>
                          <v-row v-if="activity.studentMiddle !== null">
                            <v-col class="pt-0" cols="3">
                              <span>Middle Name: </span>
                            </v-col>
                            <v-col class="pt-0" cols="9">
                              <span>{{ activity.studentMiddle }}</span>
                            </v-col>
                          </v-row>
                          <v-row v-if="activity.studentDOB !== null">
                            <v-col class="pt-0" cols="3">
                              <span>Birth Date: </span>
                            </v-col>
                            <v-col class="pt-0" cols="9">
                              <span>{{ activity.studentDOB }}</span>
                            </v-col>
                          </v-row>
                          <v-row v-if="activity.studentGender !== null">
                            <v-col class="pt-0" cols="3">
                              <span>Gender: </span>
                            </v-col>
                            <v-col class="pt-0" cols="9">
                              <span>{{ activity.studentGender }}</span>
                            </v-col>
                          </v-row>
                          <v-row v-if="shouldShowMincodeWarning(activity)">
                            <v-col class="pt-0" cols="12">
                              <v-alert
                                  id="studentNotFromMincode"
                                  dense
                                  outlined
                                  class="mb-3 bootstrap-info"
                              >
                                Student's mincode does not match the school the student has on file. As such, the school cannot see the student details.
                              </v-alert>
                            </v-col>
                          </v-row>
                        </v-card-text>
                          <v-row>
                            <v-btn class="mb-1 mr-1 ml-12 pl-0 pr-0 plainBtn" bottom right absolute elevation="0" @click="toggleRemoveStudent(index)" v-show="isHideIndex === false || isHideIndex !== index" :disabled="!isEditable()">
                              <v-icon>mdi-delete-forever-outline</v-icon>
                            </v-btn>
                          </v-row>
                          <v-expand-transition>
                            <div v-show="isOpenStudentIndex === index" class="greyBackground">
                              <v-divider></v-divider>
                              <v-card-text style="background-color: #e7ebf0;">
                                <v-row no-gutters>
                                  <v-col class="d-flex justify-start">
                                    <span style="font-size: medium; font-weight: bold; color: black">Removing the student will remove it for all users.</span>
                                  </v-col>
                                </v-row>
                                <v-row no-gutters>
                                  <v-col class="pt-3 d-flex justify-start">
                                    <span style="font-size: medium; font-weight: bold; color: black">Are you sure you want to remove the student?</span>
                                  </v-col>
                                </v-row>
                                <v-row no-gutters>
                                  <v-col class="mt-3 d-flex justify-end">
                                    <v-btn class="mr-2" outlined @click="closeStudentIndex()">
                                      No
                                    </v-btn>
                                    <v-btn dark color="#003366" @click="removeStudent(activity.secureExchangeStudentId)">
                                      Yes
                                    </v-btn>
                                  </v-col>
                                </v-row>
                              </v-card-text>
                            </div>
                          </v-expand-transition>
                      </v-card>
                      <v-card v-if="activity.type === 'document'">
                        <v-card-title>
                          <div class="activityTitle">{{ activity.title }}</div>
                          <v-spacer></v-spacer>
                          <div class="activityDisplayDate">{{ activity.displayDate }}</div>
                        </v-card-title>
                        <v-row no-gutters>
                          <v-card-text class="mt-n2 pt-0 pb-0" :class="{'pb-0': activity.documentType.label !== 'Other', 'pb-3': activity.documentType.label === 'Other'}">
                            <a @click="showDocModal(activity)">
                              {{ activity.fileName }}
                            </a>
                          </v-card-text>
                          <v-card-text v-if="activity.documentType.label !== 'Other'" class="pt-0 pb-3">{{ activity.documentType.label }}</v-card-text>
                          <v-btn class="mb-1 mr-1 ml-12 pl-0 pr-0 plainBtn" bottom right absolute elevation="0" @click="toggleRemoveDoc(index)" v-show="isHideIndex === false || isHideIndex !== index" :disabled="!isEditable()">
                            <v-icon>mdi-delete-forever-outline</v-icon>
                          </v-btn>
                        </v-row>
                        <v-expand-transition>
                          <div v-show="isOpenDocIndex === index" class="greyBackground">
                            <v-divider></v-divider>
                            <v-card-text style="background-color: #e7ebf0;">
                              <v-row no-gutters>
                                <v-col class="d-flex justify-start">
                                  <span style="font-size: medium; font-weight: bold; color: black">Removing the attachment will remove it for all users.</span>
                                </v-col>
                              </v-row>
                              <v-row no-gutters>
                                <v-col class="pt-3 d-flex justify-start">
                                  <span style="font-size: medium; font-weight: bold; color: black">Are you sure you want to remove the attachment?</span>
                                </v-col>
                              </v-row>
                              <v-row no-gutters>
                                <v-col class="mt-3 d-flex justify-end">
                                  <v-btn class="mr-2" outlined @click="closeDocIndex()">No</v-btn>
                                  <v-btn dark color="#003366" @click="removeAttachment(activity.documentID)">Yes</v-btn>
                                </v-col>
                              </v-row>
                            </v-card-text>
                          </div>
                        </v-expand-transition>
                      </v-card>
                      <v-card v-if="activity.type === 'note'">
                        <v-card-title>
                          <div class="activityTitle">{{ activity.title }}</div>
                          <v-spacer></v-spacer>
                          <div class="activityDisplayDate">{{ activity.displayDate }}</div>
                        </v-card-title>
                        <v-card-text class="activityContent">{{ activity.content }}</v-card-text>
                        <v-btn class="mb-1 mr-1 ml-12 pl-0 pr-0 plainBtn" bottom right absolute elevation="0" @click="toggleRemoveNote(index)" v-show="isHideIndex === false || isHideIndex !== index" :disabled="(!isEditable()) || (activity.staffUserIdentifier !== userInfo.userName)">
                          <v-icon>mdi-delete-forever-outline</v-icon>
                        </v-btn>
                        <v-expand-transition>
                          <div v-show="isOpenNoteIndex === index" class="greyBackground">
                            <v-divider></v-divider>
                            <v-card-text style="background-color: #e7ebf0;">
                              <v-row no-gutters>
                                <v-col class="d-flex justify-start">
                                  <span style="font-size: medium; font-weight: bold; color: black">Removing the note will remove it for all users.</span>
                                </v-col>
                              </v-row>
                              <v-row no-gutters>
                                <v-col class="pt-3 d-flex justify-start">
                                  <span style="font-size: medium; font-weight: bold; color: black">Are you sure you want to remove the note?</span>
                                </v-col>
                              </v-row>
                              <v-row no-gutters>
                                <v-col class="mt-3 d-flex justify-end">
                                  <v-btn class="mr-2" outlined @click="closeNoteIndex()">No</v-btn>
                                  <v-btn dark color="#003366" @click="removeNote(activity)">Yes</v-btn>
                                </v-col>
                              </v-row>
                            </v-card-text>
                          </div>
                        </v-expand-transition>
                      </v-card>
                    </v-timeline-item>
                  </div>
                </v-timeline>
              </v-col>
            </v-row>
          </div>
        </v-col>
      </v-row>
    </div>
    <PdfRenderer :route="this.documentRoute" :dialog="pdfRenderDialog" @closeDialog="closeDialog" :request-id="this.secureExchangeID" :document-id="this.documentId"></PdfRenderer>
    <ImageRenderer :route="this.documentRoute" :dialog="imageRendererDialog" @closeDialog="closeDialog" :request-id="this.secureExchangeID" :image-id="this.imageId"></ImageRenderer>
  </v-container>
</template>

<script>

import ApiService from '../../common/apiService';
import {EDX_SAGA_REQUEST_DELAY_MILLISECONDS, Routes} from '@/utils/constants';
import router from '@/router';
import {mapState, mapActions, mapGetters} from 'vuex';
import {replaceMacro, insertMacro} from '@/utils/macro';
import {ChronoUnit, DateTimeFormatter, LocalDate} from '@js-joda/core';
import PrimaryButton from '@/components/util/PrimaryButton';
import alertMixin from '@/mixins/alertMixin';
import DocumentUpload from '@/components/common/DocumentUpload';
import PdfRenderer from '@/components/common/PdfRenderer';
import ImageRenderer from '@/components/common/ImageRenderer';
import AddStudent from '@/components/common/AddStudent';
import MacroMenu from '../common/MacroMenu';


export default {
  name: 'MessageDisplay',
  mixins: [alertMixin],
  components: {DocumentUpload, AddStudent, PrimaryButton, ImageRenderer, PdfRenderer, MacroMenu},
  props: {
    secureExchangeID: {
      type: String,
      required: true
    },
    ministryOwnershipGroupRoleID: {
      type: String,
      required: true
    },
    ministryOwnershipTeamName: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      loadingCount: 0,
      secureExchange: null,
      loadingReadStatus: false,
      editOptionsOpen: false,
      assignedMinistryTeam: null,
      subject: '',
      isNewMessageDisplayed: false,
      isNewAttachmentDisplayed: false,
      isNewStudentDisplayed: false,
      isNewNoteDisplayed: false,
      newMessageBtnDisplayed: false,
      shouldDisplaySpeedDial: true,
      newMessage:'',
      mincode: null,
      isOpenDocIndex: false,
      isOpenStudentIndex: false,
      isOpenNoteIndex: false,
      show: false,
      isHideIndex: false,
      pdfRenderDialog: false,
      imageRendererDialog: false,
      addStudentWarningMessage: '',
      documentId: '',
      imageId: '',
      documentRoute: Routes.edx.EXCHANGE_URL,
      newNote: ''
    };
  },
  computed: {
    ...mapState('auth', ['userInfo']),
    ...mapGetters('edx', ['messageMacros']),
    ...mapGetters('app', ['schoolMap']),
    loading() {
      return this.loadingCount !== 0;
    }
  },
  created() {
    this.getExchange(true);
    this.getMacros();
  },
  methods: {
    ...mapActions('edx', ['getMacros']),
    async upload(document) {
      try {
        this.loadingCount += 1;
        this.items = undefined;
        await ApiService.apiAxios.post(this.documentRoute + '/' + this.secureExchangeID + '/documents', document);
        this.setSuccessAlert('Your document was uploaded successfully.');
        this.getExchange();
      } catch (e) {
        console.error(e);
        this.setFailureAlert(e.response?.data?.message || e.message);
      } finally {
        this.loadingCount -= 1;
        this.dialog = false;
      }
    },
    documentUrl(document) {
      return `${this.documentRoute}/${this.secureExchangeID}/documents/${document.documentID}`;
    },
    displayMessagePanel() {
      this.closeAllPanels();
      this.isNewMessageDisplayed = true;
    },
    shouldShowMincodeWarning(studentActivity){
      return this.secureExchange.contactIdentifier !== studentActivity.schoolID;
    },
    hideNewMessagePanel(){
      this.isNewMessageDisplayed = false;
      this.shouldDisplaySpeedDial = true;
      this.resetNewMessageForm();
    },
    displayAttachmentPanel() {
      this.closeAllPanels();
      this.isNewAttachmentDisplayed = true;
    },
    hideAttachmentPanel(){
      this.isNewAttachmentDisplayed = false;
      this.shouldDisplaySpeedDial = true;
    },
    getExchange(initialLoad = false) {
      this.loadingCount += 1;
      ApiService.apiAxios.get(this.documentRoute + `/${this.secureExchangeID}`)
        .then(response => {
          //Always set secure exchange as read by ministry if this is the first load
          if (initialLoad && !response.data.isReadByMinistry) {
            this.toggleIsReadByMinistry();
          } else {
            this.secureExchange = response.data;
          }
        })
        .catch(error => {
          console.error(error);
          this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while getting the details of the Secure Exchange. Please try again later.');
        })
        .finally(() => {
          this.loadingCount -= 1;
        });
    },
    toggleIsReadByMinistry() {
      this.loadingReadStatus = true;
      ApiService.apiAxios.put(this.documentRoute + `/${this.secureExchangeID}/markAs`)
        .then((response) => {
          this.secureExchange = response.data;
        })
        .catch(error => {
          console.log(error);
        })
        .finally(() => {
          this.loadingReadStatus = false;
        });
    },
    clickMarkAsButton() {
      this.toggleIsReadByMinistry();
      router.push({name: `exchange_inbox_${this.secureExchange.ministryOwnershipGroupRoleIdentifier}`});
    },
    isEditable() {
      return this.secureExchange.secureExchangeStatusCode !== 'Closed';
    },
    getStatusColor(status) {
      if (status === 'Open') {
        return 'green';
      }
      if (status === 'Closed') {
        return 'red';
      }
    },
    getActivityIcon(activity) {
      switch (activity.type) {
      case 'message':
        return 'mdi-email-outline';
      case 'document':
        return 'mdi-paperclip';
      case 'student':
        return 'mdi-emoticon-happy-outline';
      case 'note':
        return 'mdi-text';
      default:
        return '';
      }
    },
    getNumberOfDays(start) {
      const start_date = new LocalDate.parse(start, DateTimeFormatter.ofPattern('uuuu/MM/dd'));
      const end_date = LocalDate.now();

      return ChronoUnit.DAYS.between(start_date, end_date) + ' days';
    },
    resetNewMessageForm() {
      this.isNewMessageDisplayed = false;
      this.shouldDisplaySpeedDial = true;
      this.newMessage = '';
    },
    messageSent(){
      this.subject = '';
      this.assignedMinistryTeam = null;
      this.newMessage = '';
    },
    sendNewExchangeComment() {
      this.loadingCount += 1;
      const payload = {
        content: this.newMessage,
        schoolID: this.secureExchange.contactIdentifier,
        schoolName:this.secureExchange.schoolName,
        sequenceNumber: this.secureExchange.sequenceNumber,
        ministryTeamName:this.secureExchange.ministryOwnershipTeamName,
        secureExchangeId:this.secureExchangeID,
      };
      ApiService.apiAxios.post(this.documentRoute + `/${this.secureExchangeID}/comments`, payload)
        .then(() => {
          this.setSuccessAlert('Success! The message has been sent.');
          this.messageSent();
          this.getExchange();
        })
        .catch(error => {
          console.error(error);
          this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while adding the message to the Secure Exchange. Please try again later.');
        })
        .finally(() => {
          this.resetNewMessageForm();
          setTimeout(() => { this.loadingCount -= 1; }, EDX_SAGA_REQUEST_DELAY_MILLISECONDS);
        });
    },
    clickMarkAsClosedButton() {
      this.loadingReadStatus = true;
      ApiService.apiAxios.put(this.documentRoute + `/${this.secureExchangeID}/markAsClosed`)
        .then((response) => {
          this.secureExchange = response.data;
        })
        .catch(error => {
          console.error(error);
          this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while trying to close the Secure Exchange. Please try again later.');
        })
        .finally(() => {
          this.loadingReadStatus = false;
          router.push({name: `exchange_inbox_${this.secureExchange.ministryOwnershipGroupRoleIdentifier}`});
        });
    },
    isClaimable(){
      return this.secureExchange.reviewer === '' || this.secureExchange.reviewer !== this.userInfo.userName;
    },
    clickClaimMsgButton() {
      this.loadingReadStatus = true;
      let claimed = this.secureExchange.reviewer !== '';

      const payload = {
        secureExchangeIDs: `${this.secureExchangeID}`,
        claimedStatus: claimed,
        currentlyClaimedBy: this.secureExchange.reviewer
      };
      ApiService.apiAxios.post(Routes.edx.CLAIM_ONE_URL, payload)
        .then((response) => {
          this.getExchange();
          if(response.data.reviewer){
            this.setSuccessAlert('Success! The message has been claimed.');
          } else{
            this.setSuccessAlert('Success! The message has been un-claimed.');
          }
        })
        .catch(error => {
          console.error(error);
          this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while trying to claim the Secure Exchange. Please try again later.');
        })
        .finally(() => {
          this.loadingReadStatus = false;
        });
    },
    closeAllIndexes(){
      this.closeDocIndex();
      this.closeStudentIndex();
      this.closeNoteIndex();
    },
    toggleRemoveDoc(index) {
      this.closeAllIndexes();
      this.isHideIndex = index;
      if( this.isOpenDocIndex !== null ){
        this.isOpenDocIndex = ( this.isOpenDocIndex === index ) ? null : index;
      } else {
        this.isOpenDocIndex = index;
      }
    },
    closeDocIndex() {
      this.isOpenDocIndex = false;
      this.isHideIndex = false;
    },
    toggleRemoveStudent(index) {
      this.closeAllIndexes();
      this.isHideIndex = index;
      if( this.isOpenStudentIndex !== null ){
        this.isOpenStudentIndex = ( this.isOpenStudentIndex === index ) ? null : index;
      } else {
        this.isOpenStudentIndex = index;
      }
    },
    closeStudentIndex() {
      this.isOpenStudentIndex = false;
      this.isHideIndex = false;
    },
    toggleRemoveNote(index) {
      this.closeAllIndexes();
      this.isHideIndex = index;
      if( this.isOpenNoteIndex !== null ){
        this.isOpenNoteIndex = ( this.isOpenNoteIndex === index ) ? null : index;
      } else {
        this.isOpenNoteIndex = index;
      }
    },
    closeNoteIndex() {
      this.isOpenNoteIndex = false;
      this.isHideIndex = false;
    },
    displayStudentPanel() {
      this.closeAllPanels();
      this.isNewStudentDisplayed = true;
    },
    hideStudentPanel() {
      this.isNewStudentDisplayed = false;
      this.shouldDisplaySpeedDial = true;
    },
    updateAddStudentWarningMessage(newValue) {
      this.addStudentWarningMessage = newValue;
    },
    openStudentDetail(student){
      router.push(`/student/${student.studentID}`);
    },
    sendNewSecureExchangeStudent(student) {
      this.loadingCount += 1;
      const payload = {
        secureExchangeID: this.secureExchangeID,
        studentID: student.studentID
      };
      ApiService.apiAxios.post(`${Routes.edx.EXCHANGE_URL}/${this.secureExchangeID}/students`, payload)
        .then(() => {
          this.setSuccessAlert('Success! The student has been added to the Secure Exchange.');
          this.getExchange();
        })
        .catch(error => {
          console.error(error);
          this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while adding the student to the Secure Exchange. Please try again later.');
        })
        .finally(() => {
          this.loadingCount -= 1;
          this.isNewStudentDisplayed = false;
        });
    },
    removeAttachment(documentID) {
      this.loadingCount += 1;
      ApiService.apiAxios.put(this.documentRoute + `/${this.secureExchangeID}/removeDoc/${documentID}`)
        .then((response) => {
          this.getExchange();
          if(response.status === 200){
            this.setSuccessAlert('Success! The document has been removed.');
          } else{
            this.setFailureAlert('Error! The document was not removed.');
          }
          this.closeDocIndex();
        })
        .catch(error => {
          console.error(error);
          this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while trying to remove the attachment from the Secure Exchange. Please try again later.');
        })
        .finally(() => {
          this.loadingCount -= 1;
        });
    },
    removeStudent(studentID) {
      this.loadingCount += 1;
      ApiService.apiAxios.put(`${Routes.edx.EXCHANGE_URL}/${this.secureExchangeID}/removeStudent/${studentID}`)
        .then((response) => {
          this.getExchange();
          if(response.status === 200){
            this.setSuccessAlert('Success! The student has been removed.');
          } else{
            this.setFailureAlert('Error! The student was not removed.');
          }
          this.closeStudentIndex();
        })
        .catch(error => {
          console.error(error);
          this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while trying to remove the student from the Secure Exchange. Please try again later.');
        })
        .finally(() => {
          this.loadingCount -= 1;
          this.closeStudentIndex();
        });
    },
    removeNote(note) {
      if (note.staffUserIdentifier !== this.userInfo.userName) {
        this.setWarningAlert(`This note was added by ${note.staffUserIdentifier}; you don't have permission to delete it.`);
        this.closeNoteIndex();
        return;
      }
      this.loadingCount += 1;
      ApiService.apiAxios.put(`${Routes.edx.EXCHANGE_URL}/${this.secureExchangeID}/removeNote/${note.secureExchangeNoteID}`)
        .then(() => {
          this.getExchange();
          this.setSuccessAlert('Success! The note has been removed.');
          this.closeNoteIndex();
        })
        .catch(error => {
          console.error(error);
          this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while trying to remove the note from the Secure Exchange. Please try again later.');
        })
        .finally(() => {
          this.loadingCount -= 1;
        });
    },
    showDocModal(document){
      if (this.isPdf(document)) {
        this.documentId = document.documentID;
        this.pdfRenderDialog = true;
      }else {
        this.imageId = document.documentID;
        this.imageRendererDialog = true;
      }
    },
    isPdf(document){
      return (
        'fileName' in document &&
        typeof document.fileName === 'string' &&
        document.fileName.toLowerCase().endsWith('.pdf')
      );
    },
    async closeDialog() {
      this.documentId = '';
      this.imageId = '';
      this.pdfRenderDialog = false;
      this.imageRendererDialog = false;
      await this.$nextTick(); //need to wait so update can be made in parent and propagated back down to child component
    },
    displayNotePanel() {
      this.closeAllPanels();
      this.isNewNoteDisplayed = true;
    },
    hideNewNotePanel() {
      this.isNewNoteDisplayed = false;
      this.shouldDisplaySpeedDial = true;
      this.newNote = '';
    },
    sendNewExchangeNote() {
      this.loadingCount += 1;
      const payload = {
        content: this.newNote,
      };
      ApiService.apiAxios.post(`${Routes.edx.EXCHANGE_URL}/${this.secureExchangeID}/notes`, payload)
        .then(() => {
          this.setSuccessAlert('Success! The note has been added.');
          this.getExchange();
        })
        .catch(error => {
          console.error(error);
          this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while adding the note to the Secure Exchange. Please try again later.');
        })
        .finally(() => {
          this.loadingCount -= 1;
          this.hideNewNotePanel();
        });
    },
    backButtonClick() {
      router.push({name: 'exchange_inbox_' + this.ministryOwnershipGroupRoleID});
    },
    //helper function to close all panels before setting one to visible in another method
    closeAllPanels() {
      this.isNewMessageDisplayed = false;
      this.isNewAttachmentDisplayed = false;
      this.isNewStudentDisplayed = false;
      this.shouldDisplaySpeedDial = false;
      this.editOptionsOpen = false;
      this.isNewNoteDisplayed = false;
    },
    replaceMessageMacro() {
      this.newMessage = replaceMacro(this.newMessage, this.messageMacros);
    },
    insertMacroMessage(macroText) {
      this.newMessage = insertMacro(macroText, this.newMessage, this.$refs.newMessageToConvTextArea.$refs.input);
    },
    getMincode() {
      return this.schoolMap.get(this.secureExchange?.contactIdentifier)?.mincode || '';
    },
  }
};
</script>

<style scoped>
.subjectHeading {
  overflow-wrap: break-word;
}

.document-upload{
  padding: 1.1rem;
  max-width: 50rem;
  min-width: 10rem;
}

.activityDisplayDate{
  font-size: medium;
}

.activityContent {
  white-space: pre-wrap;
  word-wrap: break-word;
  max-width: 100%;
}

.containerSetup{
  padding-right: 30em !important;
  padding-left: 30em !important;
}

@media screen and (max-width: 1900px) {
  .containerSetup{
    padding-right: 20em !important;
    padding-left: 20em !important;
  }
}

@media screen and (max-width: 1200px) {
  .containerSetup{
    padding-right: 10em !important;
    padding-left: 10em !important;
  }
}

@media screen and (max-width: 801px) {
  .subjectHeading {
    font-size: medium;
  }
}

.divider {
  border-color: #FCBA19;
  border-width: medium;
}

.plainBtn {
  background-color: white !important;
  height: 2em !important;
  min-width: 1em !important;
  bottom: 0;
  right: 0;
}
.greyBackground {
  background-color: #f5f5f5;
}
</style>
