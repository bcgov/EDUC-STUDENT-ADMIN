<template>
  <v-container
    class="containerSetup"
    fluid
  >
    <v-row v-if="loading">
      <v-col class="d-flex justify-center">
        <v-progress-circular
          class="mt-16"
          :size="70"
          :width="7"
          color="primary"
          indeterminate
          :active="loading"
        />
      </v-col>
    </v-row>
    <div
      style="width: 100%;"
      class="pt-7"
      :overlay="false"
    >
      <v-row class="pt-0 mr-3 ml-3">
        <v-col cols="12 pt-0">
          <div v-if="!loading && secureExchange">
            <v-row>
              <v-col class="pb-0 pt-0 d-flex justify-start">
                <v-row>
                  <v-col
                    cols="12"
                    class="pb-2 pt-2 pr-0"
                    style="text-align: left"
                  >
                    <h2 class="subjectHeading">
                      {{ secureExchange.subject }}
                    </h2>
                    <div
                      class="ministryOwnershipTeamName"
                      style="color: black"
                    >
                      {{ secureExchange.contactName }}
                    </div>
                    <div
                      class="createDate"
                      style="color: black"
                    >
                      {{ formatDate(secureExchange.createDate) }}
                    </div>
                  </v-col>
                </v-row>
              </v-col>
              <v-col class="pb-0 pt-0 d-flex justify-end">
                <v-row>
                  <v-col class="d-flex justify-end">
                    <div
                      class="mr-5"
                    >
                      <v-row>
                        <v-col>
                          <v-icon
                            class="ml-n1"
                            :color="getStatusColor(secureExchange.secureExchangeStatusCode)"
                            dark
                          >
                            mdi-circle-medium
                          </v-icon>
                          <span class="ml-n1">{{ secureExchange.secureExchangeStatusCode }}</span>
                        </v-col>
                      </v-row>
                      <v-row no-gutters>
                        <v-col>
                          <v-icon
                            size="medium"
                            dark
                          >
                            mdi-pound
                          </v-icon>
                          <span>{{ secureExchange.sequenceNumber }}</span>
                        </v-col>
                      </v-row>
                    </div>
                    <div
                      class="mr-5"
                    >
                      <v-row>
                        <v-col>
                          <v-icon>
                            {{ secureExchange.reviewer ? 'mdi-account-outline' : 'mdi-account-off-outline' }}
                          </v-icon>
                          <span>{{ secureExchange.reviewer ? secureExchange.reviewer : 'Unclaimed' }}</span>
                        </v-col>
                      </v-row>
                      <v-row no-gutters>
                        <v-col>
                          <v-icon
                            class="pr-1"
                            dark
                          >
                            mdi-clock-outline
                          </v-icon>
                          <span class="mr-2">{{ getNumberOfDays(secureExchange.createDate) }}</span>
                        </v-col>
                      </v-row>
                    </div>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
            <v-row>
              <v-col class="mt-1 d-flex justify-start">
                <v-icon
                  size="small"
                  color="#1976d2"
                  class="mt-1"
                >
                  mdi-arrow-left
                </v-icon>
                <a
                  class="ml-1"
                  @click="backButtonClick"
                >Return to {{ secureExchange.ministryOwnershipTeamName }} Inbox</a>
              </v-col>
              <v-col class="d-flex justify-end">
                <v-btn
                  id="markAsButton"
                  :disabled="!isEditable()"
                  color="#003366"
                  variant="outlined"
                  :loading="loadingReadStatus"
                  @click="clickMarkAsButton"
                >
                  <v-icon v-if="secureExchange.isReadByExchangeContact">
                    mdi-email-outline
                  </v-icon>
                  <v-icon v-else>
                    mdi-email-open-outline
                  </v-icon>
                  <span class="ml-1 markAsSpan">
                    {{ `Mark as ${secureExchange.isReadByMinistry ? 'unread' : 'read'}` }}
                  </span>
                </v-btn>
                <v-btn
                  id="claimAsButton"
                  class="mx-2"
                  variant="outlined"
                  color="#003366"
                  :disabled="!isEditable()"
                  :loading="loadingReadStatus"
                  @click="clickClaimMsgButton"
                >
                  <v-icon>{{ !isClaimable() ? 'mdi-account-off-outline' : 'mdi-account-check-outline' }}</v-icon>
                  <span class="ml-1">{{ isClaimable() ? 'Claim' : 'Unclaim' }}</span>
                </v-btn>
                <v-btn
                  id="changeStatusButton"
                  variant="outlined"
                  :loading="loadingReadStatus"
                  color="#003366"
                  @click="clickMarkAsStatus(secureExchange.secureExchangeStatusCode === 'Closed' ? 'open' : 'closed')"
                >
                  <span>{{ secureExchange.secureExchangeStatusCode === 'Closed' ? 'Open' : 'Close' }}</span>
                </v-btn>
              </v-col>
            </v-row>
            <v-row
              no-gutters
              class="mt-2"
            >
              <v-col>
                <v-divider class="divider" />
              </v-col>
            </v-row>
            <v-row>
              <v-menu
                v-if="shouldDisplaySpeedDial && isEditable()"
                v-model="editOptionsOpen"
                transition="fab-transition"
                location="end"
                offset="10"
              >
                <template #activator="{ props }">
                  <v-btn
                    id="editOptionsMenu"
                    dark
                    color="primary"
                    class="ml-6"
                    :icon="editOptionsOpen ? 'mdi-close' : 'mdi-plus'"
                    v-bind="props"
                  />
                </template>
                <v-list>
                  <v-list-item
                    id="newMessageToConvBtn"
                    @click="displayMessagePanel"
                  >
                    <v-icon
                      color="#003366"
                      class="pr-1 mb-1"
                    >
                      mdi-email-outline
                    </v-icon>
                    <span>Message</span>
                  </v-list-item>
                  <v-list-item
                    id="addAttachmentConvButton"
                    @click="displayAttachmentPanel"
                  >
                    <v-icon
                      color="#003366"
                      class="pr-1 mb-1"
                    >
                      mdi-paperclip
                    </v-icon>
                    <span>Attachment</span>
                  </v-list-item>
                  <v-list-item
                    id="addStudentConvButton"
                    @click="displayStudentPanel"
                  >
                    <v-icon
                      color="#003366"
                      class="pr-1 mb-1"
                    >
                      mdi-emoticon-happy-outline
                    </v-icon>
                    <span>Student</span>
                  </v-list-item>
                  <v-list-item
                    id="addNoteConvButton"
                    @click="displayNotePanel"
                  >
                    <v-icon
                      color="#003366"
                      class="pr-1 mb-1"
                    >
                      mdi-text
                    </v-icon>
                    <span>Note</span>
                  </v-list-item>
                </v-list>
              </v-menu>
            </v-row>
            <v-expand-transition>
              <v-row v-if="isNewMessageDisplayed">
                <v-col>
                  <v-row>
                    <v-col>
                      <v-card-text
                        id="newMessageCardText"
                        class="pb-0 pt-5 px-16 ml-10 mr-10"
                      >
                        <v-textarea
                          id="newMessageToConvTextArea"
                          ref="newMessageToConvTextArea"
                          v-model="newMessage"
                          variant="solo"
                          solo
                          label="New Message..."
                          auto-grow
                          rows="8"
                          maxlength="4000"
                          class="pt-0"
                          @input="replaceMessageMacro"
                        />
                      </v-card-text>
                    </v-col>
                  </v-row>
                  <v-row
                    no-gutters
                    class="pl-8"
                  >
                    <v-col class="d-flex justify-start px-16">
                      <MacroMenu
                        id="newMessageMacroSelector"
                        small
                        :macros="messageMacros"
                        menu-max-width="25%"
                        @select="insertMacroMessage"
                      />
                    </v-col>
                    <v-spacer />
                    <v-col class="d-flex justify-start mr-16 pr-12">
                      <PrimaryButton
                        id="cancelMessage"
                        secondary
                        text="Cancel"
                        class="mr-2"
                        @click-action="hideNewMessagePanel"
                      />
                      <PrimaryButton
                        id="newMessagePostBtn"
                        text="Send"
                        width="8rem"
                        :disabled="!newMessage"
                        :loading="loading"
                        @click-action="sendNewExchangeComment"
                      />
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
            </v-expand-transition>
            <v-expand-transition>
              <v-row v-if="isNewNoteDisplayed">
                <v-col>
                  <v-row>
                    <v-col>
                      <v-card-text
                        id="newNoteCardText"
                        class="pb-0 pt-5 pl-16 ml-10 pr-16 mr-10"
                      >
                        <v-textarea
                          id="newNoteToConvTextArea"
                          ref="newNoteToConvTextArea"
                          v-model="newNote"
                          variant="solo"
                          label="New Note..."
                          auto-grow
                          rows="8"
                          maxlength="4000"
                          class="pt-0"
                        />
                      </v-card-text>
                    </v-col>
                  </v-row>
                  <v-row
                    no-gutters
                    class="pr-10"
                  >
                    <v-col class="d-flex justify-end pr-16">
                      <PrimaryButton
                        id="cancelNote"
                        secondary
                        text="Cancel"
                        class="mr-2"
                        @click-action="hideNewNotePanel"
                      />
                      <PrimaryButton
                        id="newNotePostBtn"
                        text="Save"
                        width="8rem"
                        :disabled="!newNote"
                        :loading="loading"
                        @click-action="sendNewExchangeNote"
                      />
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
            </v-expand-transition>
            <v-row no-gutters>
              <v-col class="d-flex justify-center">
                <v-expand-transition>
                  <DocumentUpload
                    v-show="isNewAttachmentDisplayed"
                    style="min-width: 40em"
                    :small-file-extension="false"
                    :check-file-rules="true"
                    :allowed-file-format="formatMessage"
                    class="mt-4"
                    @close:form="hideAttachmentPanel"
                    @upload="upload"
                  />
                </v-expand-transition>
              </v-col>
            </v-row>
            <v-expand-transition>
              <v-row v-if="isNewStudentDisplayed">
                <v-col class="d-flex justify-center">
                  <AddStudent
                    style="min-width: 35em"
                    :institute-type-value="getInstituteValue()"
                    :additional-student-add-warning="addStudentWarningMessage"
                    @addStudent="sendNewSecureExchangeStudent"
                    @close:form="hideStudentPanel"
                    @updateAdditionalStudentAddWarning="updateAddStudentWarningMessage"
                  />
                </v-col>
              </v-row>
            </v-expand-transition>
            <v-row class="mb-5">
              <v-col>
                <v-timeline
                  v-if="secureExchange.activities.length > 0"
                  side="end"
                  truncate-line="both"
                  class="mr-8"
                >
                  <v-timeline-item
                    v-for="(activity, index) in secureExchange.activities"
                    :key="activity.secureExchangeCommentID"
                    :left="activity.isSchool"
                    icon-color="#003366"
                    class="timeline-item"
                    color="white"
                    dot-color="white"
                    fill-dot
                    elevation="1"
                    :icon="getActivityIcon(activity)"
                    size="large"
                  >
                    <v-card v-if="activity.type === 'message'">
                      <v-card-title class="pb-0">
                        {{ activity.title }}
                      </v-card-title>
                      <v-card-subtitle>
                        <span class="activityDisplayDate">
                          {{ activity.displayDate }}
                        </span>
                      </v-card-subtitle>
                      <v-card-text class="activityContent">
                        {{ activity.content }}
                      </v-card-text>
                    </v-card>
                    <v-card v-if="activity.type === 'student'">
                      <v-card-title class="pb-0">
                        {{ activity.title }}
                      </v-card-title>
                      <v-card-subtitle class="pb-2">
                        <span class="activityDisplayDate">
                          {{ activity.displayDate }}
                        </span>
                      </v-card-subtitle>
                      <v-card-text class="">
                        <v-row v-if="activity.studentPEN !== null">
                          <v-col
                            class="pt-0"
                            cols="3"
                          >
                            <span>PEN: </span>
                          </v-col>
                          <v-col
                            class="pt-0"
                            cols="9"
                          >
                            <a @click="openStudentDetail(activity)">{{ activity.studentPEN }}</a>
                          </v-col>
                        </v-row>
                        <v-row v-if="activity.studentLocalID !== null">
                          <v-col
                            class="pt-0"
                            cols="3"
                          >
                            <span>Local ID: </span>
                          </v-col>
                          <v-col
                            class="pt-0"
                            cols="9"
                          >
                            <span>{{ activity.studentLocalID }}</span>
                          </v-col>
                        </v-row>
                        <v-row v-if="activity.studentSurname !== null">
                          <v-col
                            class="pt-0"
                            cols="3"
                          >
                            <span>Surname: </span>
                          </v-col>
                          <v-col
                            class="pt-0"
                            cols="9"
                          >
                            <span>{{ activity.studentSurname }}</span>
                          </v-col>
                        </v-row>
                        <v-row v-if="activity.studentGiven !== null">
                          <v-col
                            class="pt-0"
                            cols="3"
                          >
                            <span>Given Name: </span>
                          </v-col>
                          <v-col
                            class="pt-0"
                            cols="9"
                          >
                            <span>{{ activity.studentGiven }}</span>
                          </v-col>
                        </v-row>
                        <v-row v-if="activity.studentMiddle !== null">
                          <v-col
                            class="pt-0"
                            cols="3"
                          >
                            <span>Middle Name: </span>
                          </v-col>
                          <v-col
                            class="pt-0"
                            cols="9"
                          >
                            <span>{{ activity.studentMiddle }}</span>
                          </v-col>
                        </v-row>
                        <v-row v-if="activity.studentDOB !== null">
                          <v-col
                            class="pt-0"
                            cols="3"
                          >
                            <span>Birth Date: </span>
                          </v-col>
                          <v-col
                            class="pt-0"
                            cols="9"
                          >
                            <span>{{ activity.studentDOB }}</span>
                          </v-col>
                        </v-row>
                        <v-row v-if="activity.studentGender !== null">
                          <v-col
                            class="pt-0"
                            cols="3"
                          >
                            <span>Gender: </span>
                          </v-col>
                          <v-col
                            class="pt-0"
                            cols="9"
                          >
                            <span>{{ activity.studentGender }}</span>
                          </v-col>
                        </v-row>
                        <v-row v-if="shouldShowMincodeWarning(activity)">
                          <v-col
                            class="pt-0"
                            cols="12"
                          >
                            <v-alert
                              id="studentNotFromMincode"
                              density="compact"
                              variant="outlined"
                              class="mb-3 bootstrap-info"
                            >
                              Student's mincode does not match the school the student has on file. As such, the school
                              cannot see the student details.
                            </v-alert>
                          </v-col>
                        </v-row>
                        <v-row v-if="shouldShowDistrictWarning(activity)">
                          <v-col
                            class="pt-0"
                            cols="12"
                          >
                            <v-alert
                              id="studentNotFromMincode"
                              density="compact"
                              variant="outlined"
                              class="mb-3 bootstrap-info"
                            >
                              Student's mincode is not a part of the district. As such, the district cannot see the
                              student details.
                            </v-alert>
                          </v-col>
                        </v-row>
                      </v-card-text>
                      <v-card-actions>
                        <v-btn
                          v-show="isHideIndex === false || isHideIndex !== index"
                          variant="text"
                          color="red"
                          :disabled="!isEditable()"
                          @click="toggleRemoveStudent(index)"
                        >
                          Remove
                        </v-btn>
                      </v-card-actions>
                      <v-expand-transition>
                        <div
                          v-show="isOpenStudentIndex === index"
                          class="greyBackground"
                        >
                          <v-divider />
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
                                <v-btn
                                  class="mr-2"
                                  variant="outlined"
                                  @click="closeStudentIndex()"
                                >
                                  No
                                </v-btn>
                                <v-btn
                                  dark
                                  color="#003366"
                                  @click="removeStudent(activity.secureExchangeStudentId)"
                                >
                                  <span style="color: white">Yes</span>
                                </v-btn>
                              </v-col>
                            </v-row>
                          </v-card-text>
                        </div>
                      </v-expand-transition>
                    </v-card>
                    <v-card v-if="activity.type === 'document'">
                      <v-card-title class="pb-0">
                        {{ activity.title }}
                      </v-card-title>
                      <v-card-subtitle>
                        <span class="activityDisplayDate">
                          {{ activity.displayDate }}
                        </span>
                      </v-card-subtitle>
                      <v-card-text class="activityContent">
                        <v-row no-gutters>
                          <v-col>
                            <a
                              v-if="isImage(activity)"
                              :class="disabledAnchorDocumentName"
                              @click="showDocModal(activity)"
                            >
                              {{ activity.fileName }}
                            </a>
                            <router-link
                              v-else
                              :class="disabledAnchorDocumentName"
                              :to="{
                                path: documentUrl(activity)
                              }"
                              target="_blank"
                            >
                              {{ activity.fileName }}
                            </router-link>
                          </v-col>
                        </v-row>
                        <v-row
                          v-if="activity.documentType.label !== 'Other'"
                          no-gutters
                        >
                          <v-col class="d-flex justify-start">
                            {{ activity.documentType.label }}
                          </v-col>
                        </v-row>
                      </v-card-text>
                      <v-card-actions>
                        <v-btn
                          v-show="isHideIndex === false || isHideIndex !== index"
                          variant="text"
                          color="red"
                          :disabled="!isEditable()"
                          @click="toggleRemoveDoc(index)"
                        >
                          Remove
                        </v-btn>
                      </v-card-actions>
                      <v-expand-transition>
                        <div
                          v-show="isOpenDocIndex === index"
                          class="greyBackground"
                        >
                          <v-divider />
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
                                <v-btn
                                  class="mr-2"
                                  variant="outlined"
                                  @click="closeDocIndex()"
                                >
                                  No
                                </v-btn>
                                <v-btn
                                  dark
                                  color="#003366"
                                  @click="removeAttachment(activity.documentID)"
                                >
                                  <span style="color: white">Yes</span>
                                </v-btn>
                              </v-col>
                            </v-row>
                          </v-card-text>
                        </div>
                      </v-expand-transition>
                    </v-card>
                    <v-card v-if="activity.type === 'note'">
                      <v-card-title class="pb-0">
                        {{ activity.title }}
                      </v-card-title>
                      <v-card-subtitle>
                        <span class="activityDisplayDate">
                          {{ activity.displayDate }}
                        </span>
                      </v-card-subtitle>
                      <v-card-text class="activityContent">
                        {{ activity.content }}
                      </v-card-text>
                      <v-card-actions>
                        <v-btn
                          v-show="isHideIndex === false || isHideIndex !== index"
                          variant="text"
                          color="red"
                          :disabled="(!isEditable()) || (activity.staffUserIdentifier !== userInfo.userName)"
                          @click="toggleRemoveNote(index)"
                        >
                          Remove
                        </v-btn>
                      </v-card-actions>
                      <v-expand-transition>
                        <div
                          v-show="isOpenNoteIndex === index"
                          class="greyBackground"
                        >
                          <v-divider />
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
                                <v-btn
                                  class="mr-2"
                                  variant="outlined"
                                  @click="closeNoteIndex()"
                                >
                                  No
                                </v-btn>
                                <v-btn
                                  dark
                                  color="#003366"
                                  @click="removeNote(activity)"
                                >
                                  <span style="color: white">Yes</span>
                                </v-btn>
                              </v-col>
                            </v-row>
                          </v-card-text>
                        </div>
                      </v-expand-transition>
                    </v-card>
                  </v-timeline-item>
                </v-timeline>
              </v-col>
            </v-row>
          </div>
        </v-col>
      </v-row>
    </div>
    <ImageRenderer
      :route="documentRoute"
      :dialog="imageRendererDialog"
      :request-id="secureExchangeID"
      :image-id="imageId"
      @closeDialog="closeDialog"
    />
  </v-container>
</template>

<script>
import ApiService from '@/common/apiService';
import {EDX_SAGA_REQUEST_DELAY_MILLISECONDS, Routes} from '@/utils/constants';
import router from '@/router';
import {mapActions, mapState} from 'pinia';
import {isPdf, isImage} from '@/utils/file';
import {replaceMacro, insertMacro} from '@/utils/macro';
import {ChronoUnit, LocalDateTime} from '@js-joda/core';
import alertMixin from '@/mixins/alertMixin';

import PrimaryButton from '@/components/util/PrimaryButton.vue';
import DocumentUpload from '@/components/common/DocumentUpload.vue';
import ImageRenderer from '@/components/common/ImageRenderer.vue';
import AddStudent from '@/components/common/AddStudent.vue';
import MacroMenu from '../common/MacroMenu.vue';
import {appStore} from '@/store/modules/app';
import {edxStore} from '@/store/modules/edx';
import {authStore} from '@/store/modules/auth';
import {formatDate} from '@/utils/format';


export default {
  name: 'MessageDisplay',
  components: {DocumentUpload, AddStudent, PrimaryButton, ImageRenderer, MacroMenu},
  mixins: [alertMixin],
  props: {
    secureExchangeID: {
      type: String,
      required: true
    },
    ministryOwnershipGroupRoleID: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      loadingCount: 0,
      ministryOwnershipTeamName: null,
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
      newMessage: '',
      mincode: null,
      isOpenDocIndex: false,
      isOpenStudentIndex: false,
      isOpenNoteIndex: false,
      show: false,
      isHideIndex: false,
      imageRendererDialog: false,
      addStudentWarningMessage: '',
      documentId: '',
      imageId: '',
      documentRoute: Routes.edx.EXCHANGE_URL,
      newNote: '',
      disableAnchorTagDocumentName: true,
      formatMessage: 'JPEG, PNG, PDF, CSV, MS-WORD, MS-EXCEL, .STD, .VER'
    };
  },
  computed: {
    ...mapState(authStore, ['userInfo']),
    ...mapState(edxStore, ['messageMacros', 'ministryTeams']),
    ...mapState(appStore, ['schoolMap']),
    loading() {
      return this.loadingCount !== 0;
    },
    disabledAnchorDocumentName() {
      return this.disableAnchorTagDocumentName ? 'disabled-anchor' : '';
    }
  },
  created() {
    this.getExchange(true);
    this.getMacros();
    edxStore().getMinistryTeams().then(() => {
      this.getMinistryTeamNameByGroupRoleID();
    });
  },
  methods: {
    formatDate,
    ...mapActions(edxStore, ['getMacros']),
    async upload(document) {
      try {
        this.loadingCount += 1;
        this.items = undefined;
        await ApiService.apiAxios.post(
          this.documentRoute + '/' + this.secureExchangeID + '/documents', document
        );
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
    shouldShowMincodeWarning(studentActivity) {
      return this.secureExchange?.secureExchangeContactTypeCode === 'SCHOOL' && this.secureExchange.contactIdentifier !== studentActivity.schoolID;
    },
    shouldShowDistrictWarning(studentActivity) {
      return this.secureExchange?.secureExchangeContactTypeCode === 'DISTRICT' && this.secureExchange.contactIdentifier !== this.schoolMap.get(studentActivity.schoolID)?.districtID;
    },
    getMinistryTeamNameByGroupRoleID() {
      this.ministryTeamName = this.ministryTeams.find(item => item.groupRoleIdentifier === this.ministryOwnershipGroupRoleID).teamName;
    },
    hideNewMessagePanel() {
      this.isNewMessageDisplayed = false;
      this.shouldDisplaySpeedDial = true;
      this.resetNewMessageForm();
    },
    displayAttachmentPanel() {
      this.closeAllPanels();
      this.isNewAttachmentDisplayed = true;
    },
    hideAttachmentPanel() {
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
          }
          this.secureExchange = response.data;
        })
        .catch(error => {
          console.error(error);
          this.setFailureAlert(
            error?.response?.data?.message ||
            'An error occurred while getting the details of the Secure Exchange. Please try again later.'
          );
        })
        .finally(() => {
          this.loadingCount -= 1;
          if (this.isEditable()) {
            this.disableAnchorTagDocumentName = false;
          }
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
      const start_date = new LocalDateTime.parse(start);
      const end_date = LocalDateTime.now();

      return ChronoUnit.DAYS.between(start_date, end_date) + ' days';
    },
    resetNewMessageForm() {
      this.isNewMessageDisplayed = false;
      this.shouldDisplaySpeedDial = true;
      this.newMessage = '';
    },
    messageSent() {
      this.subject = '';
      this.assignedMinistryTeam = null;
      this.newMessage = '';
    },
    sendNewExchangeComment() {
      this.loadingCount += 1;
      let payload = {
        content: this.newMessage,
        secureExchangeContactTypeCode: this.secureExchange.secureExchangeContactTypeCode,
        contactIdentifier: this.secureExchange.contactIdentifier,
        schoolName: this.secureExchange.schoolName,
        districtName: this.secureExchange.districtName,
        sequenceNumber: this.secureExchange.sequenceNumber,
        ministryTeamName: this.secureExchange.ministryOwnershipTeamName,
        secureExchangeId: this.secureExchangeID,
      };
      ApiService.apiAxios.post(this.documentRoute + `/${this.secureExchangeID}/comments`, payload)
        .then(() => {
          this.setSuccessAlert('Success! The message has been sent.');
          this.messageSent();
          this.getExchange();
        })
        .catch(error => {
          console.error(error);
          this.setFailureAlert(
            error?.response?.data?.message ||
            'An error occurred while adding the message to the Secure Exchange. Please try again later.'
          );
        })
        .finally(() => {
          this.resetNewMessageForm();
          setTimeout(() => {
            this.loadingCount -= 1;
          }, EDX_SAGA_REQUEST_DELAY_MILLISECONDS);
        });
    },
    clickMarkAsStatus(status) {
      this.loadingReadStatus = true;
      ApiService.apiAxios.put(this.documentRoute + `/${this.secureExchangeID}/markExchangeStatusAs/${status}`)
        .then((response) => {
          this.secureExchange = response.data;
          this.setSuccessAlert('Secure Exchange status changed successfully');
          router.push({name: `exchange_inbox_${this.secureExchange.ministryOwnershipGroupRoleIdentifier}`});
        })
        .catch(error => {
          console.error(error);
          this.setFailureAlert(
            error?.response?.data?.message ||
            `An error occurred while trying to set Secure Exchange status to ${status}. Please try again later.`
          );
        })
        .finally(() => {
          this.loadingReadStatus = false;
        });
    },
    isClaimable() {
      return this.secureExchange.reviewer === '' ||
        this.secureExchange.reviewer !== this.userInfo.userName;
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
          if (response.data.reviewer) {
            this.setSuccessAlert('Success! The message has been claimed.');
          } else {
            this.setSuccessAlert('Success! The message has been un-claimed.');
          }
        })
        .catch(error => {
          console.error(error);
          this.setFailureAlert(
            error?.response?.data?.message ||
            'An error occurred while trying to claim the Secure Exchange. Please try again later.'
          );
        })
        .finally(() => {
          this.loadingReadStatus = false;
        });
    },
    closeAllIndexes() {
      this.closeDocIndex();
      this.closeStudentIndex();
      this.closeNoteIndex();
    },
    toggleRemoveDoc(index) {
      this.closeAllIndexes();
      this.isHideIndex = index;
      if (this.isOpenDocIndex !== null) {
        this.isOpenDocIndex = (this.isOpenDocIndex === index) ? null : index;
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
      if (this.isOpenStudentIndex !== null) {
        this.isOpenStudentIndex = (this.isOpenStudentIndex === index) ? null : index;
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
      if (this.isOpenNoteIndex !== null) {
        this.isOpenNoteIndex = (this.isOpenNoteIndex === index) ? null : index;
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
    openStudentDetail(student) {
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
          this.setFailureAlert(
            error?.response?.data?.message ||
            'An error occurred while adding the student to the Secure Exchange. Please try again later.'
          );
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
          if (response.status === 200) {
            this.setSuccessAlert('Success! The document has been removed.');
          } else {
            this.setFailureAlert('Error! The document was not removed.');
          }
          this.closeDocIndex();
        })
        .catch(error => {
          console.error(error);
          this.setFailureAlert(
            error?.response?.data?.message ||
            'An error occurred while trying to remove the attachment from the Secure Exchange. Please try again later.'
          );
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
          if (response.status === 200) {
            this.setSuccessAlert('Success! The student has been removed.');
          } else {
            this.setFailureAlert('Error! The student was not removed.');
          }
          this.closeStudentIndex();
        })
        .catch(error => {
          console.error(error);
          this.setFailureAlert(
            error?.response?.data?.message ||
            'An error occurred while trying to remove the student from the Secure Exchange. Please try again later.'
          );
        })
        .finally(() => {
          this.loadingCount -= 1;
          this.closeStudentIndex();
        });
    },
    removeNote(note) {
      if (note.staffUserIdentifier !== this.userInfo.userName) {
        this.setWarningAlert(
          `This note was added by ${note.staffUserIdentifier}; you don't have permission to delete it.`
        );
        this.closeNoteIndex();
        return;
      }
      this.loadingCount += 1;
      ApiService.apiAxios
        .put(`${Routes.edx.EXCHANGE_URL}/${this.secureExchangeID}/removeNote/${note.secureExchangeNoteID}`)
        .then(() => {
          this.getExchange();
          this.setSuccessAlert('Success! The note has been removed.');
          this.closeNoteIndex();
        })
        .catch(error => {
          console.error(error);
          this.setFailureAlert(
            error?.response?.data?.message ||
            'An error occurred while trying to remove the note from the Secure Exchange. Please try again later.'
          );
        })
        .finally(() => {
          this.loadingCount -= 1;
        });
    },
    showDocModal(document) {
      if (this.isEditable()) {
        this.imageId = document.documentID;
        this.imageRendererDialog = true;
      }
    },
    isPdf,
    isImage,
    async closeDialog() {
      this.documentId = '';
      this.imageId = '';
      this.imageRendererDialog = false;

      //need to wait so update can be made in parent and propagated back down to child component
      await this.$nextTick();
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
          this.setFailureAlert(
            error?.response?.data?.message ||
            'An error occurred while adding the note to the Secure Exchange. Please try again later.'
          );
        })
        .finally(() => {
          this.loadingCount -= 1;
          this.hideNewNotePanel();
        });
    },
    backButtonClick() {
      router.push({name: `exchange_inbox_${this.secureExchange.ministryOwnershipGroupRoleIdentifier}`});
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
      this.newMessage = insertMacro(
        macroText, this.newMessage, this.$refs.newMessageToConvTextArea.$refs.input
      );
    },
    getInstituteValue() {
      if (this.secureExchange?.secureExchangeContactTypeCode === 'SCHOOL') {
        return {
          'type': 'SCHOOL',
          'value': this.schoolMap.get(this.secureExchange?.contactIdentifier)?.mincode
        };
      } else {
        return {
          'type': 'DISTRICT',
          'value': this.secureExchange?.contactIdentifier
        };
      }
    },
  }
};
</script>

<style scoped>
.subjectHeading {
    overflow-wrap: break-word;
}

.document-upload {
    padding: 1.1rem;
    max-width: 50rem;
    min-width: 10rem;
}

.activityDisplayDate {
  font-style: italic;
}

.activityContent {
    white-space: pre-wrap;
    word-wrap: break-word;
    max-width: 100%;
}

.containerSetup {
    padding-right: 30em !important;
    padding-left: 30em !important;
}

@media screen and (max-width: 1900px) {
    .containerSetup {
        padding-right: 20em !important;
        padding-left: 20em !important;
    }
}

@media screen and (max-width: 1200px) {
    .containerSetup {
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
    border-width: 2px;
    opacity: unset;
}

.timeline-item .v-card-title {
  white-space: unset;
}

.v-timeline--vertical.v-timeline--justify-auto {
    grid-template-columns: minmax(min-content, 0em) min-content auto;
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

.disabled-anchor {
    cursor: not-allowed;
    color: gray
}
</style>
