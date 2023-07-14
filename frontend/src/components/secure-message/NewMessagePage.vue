<template>
  <v-container
    fluid
    class="full-height px-0 pt-0"
  >
    <v-row class="d-flex justify-center">
      <v-col
        class="pt-0"
        cols="11"
      >
        <v-row>
          <v-col class="pr-0 pb-0">
            <v-row>
              <v-col>
                <v-card
                  id="newMessageCard"
                  flat
                  outlined
                >
                  <v-row>
                    <v-col class="pb-0">
                      <v-card-text
                        id="newMessageCardText"
                        class="pb-0 pt-0"
                      >
                        <v-form
                          ref="newMessageForm"
                          v-model="isValidForm"
                        >
                          <v-text-field
                            :model-value="myTeam.teamName"
                            label="From"
                            class="pt-0"
                            variant="underlined"
                          />
                          <v-autocomplete
                            id="schoolNameTxtField"
                            v-model="selectedContact"
                            label="To"
                            class="pt-0"
                            item-value="value"
                            item-title="text"
                            variant="underlined"
                            return-object
                            :items="validContactsForMessaging"
                            :rules="requiredToRule"
                            @update:model-value="onSchoolSelected"
                          >
                            <template #selection="{ item }">
                              <span> {{ item.title }} </span>
                            </template>
                            <template #item="{props, item}">
                              <v-list-item
                                v-bind="props"
                                :prepend-icon="item.raw.districtNumber ? 'mdi-domain' : 'mdi-school'"
                              />
                            </template>
                          </v-autocomplete>
                          <v-text-field
                            id="subjectTxtField"
                            v-model="subject"
                            variant="underlined"
                            label="Subject"
                            :rules="requiredRules"
                            maxlength="255"
                            class="pt-0"
                          />
                          <v-textarea
                            id="newMessageTextArea"
                            ref="newMessageTextArea"
                            v-model="newMessage"
                            :rules="requiredRules"
                            rows="8"
                            variant="underlined"
                            label="Message"
                            no-resize
                            maxlength="4000"
                            class="pt-0"
                            hide-details="auto"
                            @input="replaceMessageMacro"
                          />
                        </v-form>
                      </v-card-text>
                      <div class="text-right">
                        <MacroMenu
                          id="newMessageMacroSelector"
                          margin="my-2 mr-3"
                          :macros="messageMacros"
                          menu-max-width="25%"
                          small
                          @select="insertMacroMessage"
                        />
                      </div>
                    </v-col>
                  </v-row>
                  <v-row
                    class="ml-6"
                    no-gutters
                  >
                    <div
                      v-for="(document, index) in secureExchangeDocuments"
                      :key="index"
                    >
                      <v-col
                        class="d-flex justify-start px-0 pb-2"
                      >
                        <v-chip
                          :id="`documentChip-${index}`"
                          :class="['ma-1']"
                          close-icon="mdi-close-circle"
                          closable
                          @click:close="removeDocumentByIndex(index)"
                        >
                          <v-avatar left>
                            <v-icon>mdi-paperclip</v-icon>
                          </v-avatar>
                          {{ abbreviateFileName(document.fileName) }}
                        </v-chip>
                      </v-col>
                    </div>
                    <div
                      v-for="(secureExchangeStudent, index) in secureExchangeStudents"
                      :key="index"
                    >
                      <v-col
                        class="d-flex justify-start px-0 pb-2"
                      >
                        <v-chip
                          :id="`studentChip-${index}`"
                          :class="['ma-1']"
                          close-icon="mdi-close-circle"
                          closable
                          @click:close="removeSecureExchangeStudentByID(secureExchangeStudent)"
                        >
                          <v-avatar left>
                            <v-icon>mdi-account-circle</v-icon>
                          </v-avatar>
                          {{ secureExchangeStudent.pen }}
                        </v-chip>
                      </v-col>
                    </div>
                  </v-row>
                  <v-row v-if="shouldShowOptions">
                    <v-col class="d-flex justify-end mr-3 pt-0">
                      <v-btn
                        id="attachFileID"
                        title="Attach File"
                        color="#1A5A96"
                        variant="outlined"
                        class="addButton pl-1 pr-2 mb-5"
                        @click="showAttachFilePanel"
                      >
                        <v-icon
                          color="#1A5A96"
                          class="mr-0"
                          right
                          dark
                        >
                          mdi-paperclip
                        </v-icon>
                        <span class="ml-1">Attach File</span>
                      </v-btn>
                      <v-btn
                        id="addStudentID"
                        title="Add Student"
                        color="#1A5A96"
                        variant="outlined"
                        class="addButton px-2 ml-1 mb-5"
                        :disabled="disableAddStudent"
                        @click="showAddStudentPanel"
                      >
                        <v-icon
                          color="#1A5A96"
                          class="mr-0"
                          right
                          dark
                        >
                          mdi-account-multiple-plus-outline
                        </v-icon>
                        <span class="ml-1">Add Student</span>
                      </v-btn>
                    </v-col>
                  </v-row>
                  <!--pop out for attaching files-->
                  <v-row no-gutters>
                    <v-col>
                      <v-expand-transition
                        max-height="50rem"
                        xl="2"
                        lg="2"
                        md="2"
                        xs="2"
                        sm="2"
                      >
                        <v-row no-gutters>
                          <v-col class="d-flex justify-center">
                            <DocumentUpload
                              v-show="expandAttachFile"
                              :small-file-extension="false"
                              :check-file-rules="true"
                              :allowed-file-format="formatMessage"
                              @close:form="showOptions"
                              @upload="uploadDocument"
                            />
                          </v-col>
                        </v-row>
                      </v-expand-transition>
                      <v-expand-transition>
                        <v-row no-gutters>
                          <v-col class="d-flex justify-center">
                            <AddStudent
                              v-show="expandAddStudent"
                              :institute-type-value="getInstituteValue()"
                              :additional-student-add-warning="additionalStudentAddWarningMessage"
                              @close:form="showOptions"
                              @addStudent="addSecureExchangeStudent"
                              @updateAdditionalStudentAddWarning="updateAdditionalStudentAddWarning"
                            />
                          </v-col>
                        </v-row>
                      </v-expand-transition>
                    </v-col>
                  </v-row>
                  <!--end pop out for attaching files-->
                </v-card>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
        <v-alert
          v-model="fileSizeAlert"
          dense
          transition="slide"
          type="error"
        >
          {{ `Total files must be less than ${humanFileSize(fileRequirements.maxSize)}. Please remove some uploads.You may upload additional files later.`
          }}
        </v-alert>
        <v-row class="py-4 justify-end">
          <PrimaryButton
            id="cancelMessage"
            secondary
            text="Cancel"
            class="mr-2"
            @click-action="navigateToList"
          />
          <PrimaryButton
            id="newMessagePostBtn"
            text="Send"
            width="8rem"
            :disabled="!isValidForm || fileSizeAlert"
            :loading="processing"
            @click-action="sendNewMessage"
          />
        </v-row>
      </v-col>
    </v-row>

    <ConfirmationDialog ref="confirmationDialog" />
  </v-container>
</template>

<script>
import {mapActions, mapState} from 'pinia';
import {replaceMacro, insertMacro} from '../../utils/macro';
import {humanFileSize} from '@/utils/file';
import ApiService from '@/common/apiService';
import {
  Routes,
} from '@/utils/constants';
import {isValidPEN} from '@/utils/validation';
import alertMixin from '@/mixins/alertMixin';
import _ from 'lodash';
import PrimaryButton from '@/components/util/PrimaryButton.vue';
import DocumentUpload from '@/components/common/DocumentUpload.vue';
import ConfirmationDialog from '@/components/util/ConfirmationDialog.vue';
import AddStudent from '@/components/common/AddStudent.vue';
import MacroMenu from '../common/MacroMenu.vue';
import {getStatusAuthorityOrSchool} from '@/utils/institute/status';
import {edxStore} from '@/store/modules/edx';
import {authStore} from '@/store/modules/auth';
import {appStore} from '@/store/modules/app';

export default {
  name: 'NewMessagePage',
  components: {
    AddStudent,
    PrimaryButton,
    ConfirmationDialog,
    DocumentUpload,
    MacroMenu
  },
  mixins: [alertMixin],
  data() {
    return {
      newMessage: '',
      selectedContact: null,
      validContactsForMessaging: [],
      subject: '',
      requiredRules: [v => !!v?.trim() || 'Required'],
      requiredToRule: [v => !!v?.value?.trim() || 'Required'],
      isValidForm: false,
      processing: false,
      pen: null,
      penRules: [v => (!v || isValidPEN(v)) || this.penHint],
      penHint: 'Invalid PEN',
      expandAttachFile: false,
      expandAddStudent: false,
      shouldShowOptions: true,
      additionalStudentAddWarningMessage: '',
      disableAddStudent: true,
      fileSizeAlert: false,
      formatMessage: 'JPEG, PNG, PDF, CSV, MS-WORD, MS-EXCEL, .STD, .VER',
    };
  },
  mounted() {
    this.validateForm();
    edxStore().getFileRequirements();
  },
  computed: {
    ...mapState(authStore, ['userInfo']),
    ...mapState(edxStore, ['messageMacros', 'ministryTeams', 'validSchoolIDsForMessaging', 'secureExchangeDocuments', 'secureExchangeStudents', 'validDistrictIDsForMessaging', 'fileRequirements']),
    ...mapState(appStore, ['schoolMap', 'districtMap']),
    myTeam() {
      return this.ministryTeams.find(team => this.userInfo.userRoles.some(role => team.groupRoleIdentifier === role)) || {};
    },
  },
  created() {
    edxStore().getValidIDsForMessaging().then(() => {
      let validSchoolsForMessaging = _.sortBy(Array.from(this.schoolMap.entries())
        .filter(school => this.validSchoolIDsForMessaging.includes(school[0]) && getStatusAuthorityOrSchool(school[1]) !== 'Closed')
        .map(school => ({
          text: `${school[1]?.schoolName} (${school[1]?.mincode})`,
          value: school[1]?.schoolID,
          mincode: school[1].mincode,
          type: 'school'
        })), ['mincode']);

      let validDistrictsForMessaging = _.sortBy(Array.from(this.districtMap.entries())
        .filter(district => this.validDistrictIDsForMessaging.includes(district[0]) && district[1].districtStatusCode === 'ACTIVE')
        .map(district => ({
          text: `${district[1]?.name} (${district[1]?.districtNumber})`,
          value: district[1]?.districtId,
          districtNumber: district[1].districtNumber,
          type: 'district'
        })), ['districtNumber']);

      this.validContactsForMessaging = [...validDistrictsForMessaging, ...validSchoolsForMessaging];
    });
    this.clearSecureExchangeDocuments();
    this.clearSecureExchangeStudents();
    this.getMacros();
  },
  methods: {
    ...mapActions(edxStore, ['getMacros']),
    navigateToList() {
      this.$emit('secure-exchange:cancelMessage');
    },
    checkTotalFileSize() {
      let totalFileSize = 0;
      for (let each of this.secureExchangeDocuments) {
        totalFileSize += each.fileSize;
      }
      this.fileSizeAlert = totalFileSize > this.fileRequirements.maxSize;
    },
    messageSent() {
      this.subject = '';
      this.selectedContact = {};
      this.newMessage = '';
      this.requiredRules = [v => !!v?.trim() || 'Required'];
      this.penRules = [v => (!v || isValidPEN(v)) || this.penHint];
      this.$emit('secure-exchange:messageSent');
      this.clearSecureExchangeDocuments();
      this.clearSecureExchangeStudents();
      this.additionalStudentAddWarningMessage = '';
      this.disableAddStudent = true;
    },
    abbreviateFileName(fileName) {
      if (fileName.length > 8) {
        return fileName.substring(0, 8) + '...';
      }
      return fileName;
    },
    sendNewMessage() {
      this.processing = true;
      let payload = {};
      if (this.selectedContact.mincode) {
        payload = {
          secureExchangeContactTypeCode: 'SCHOOL',
          contactIdentifier: this.selectedContact.value,
          ministryOwnershipTeamID: this.myTeam.ministryOwnershipTeamId,
          subject: this.subject,
          content: this.newMessage,
          secureExchangeDocuments: this.secureExchangeDocuments,
          ministryTeamName: this.myTeam.teamName,
          schoolID: this.selectedContact.value,
          schoolName: this.schoolMap.get(this.selectedContact.value).schoolName,
          secureExchangeStudents: this.secureExchangeStudents
        };
      } else if (this.selectedContact.districtNumber) {
        payload = {
          secureExchangeContactTypeCode: 'DISTRICT',
          contactIdentifier: this.selectedContact.value,
          ministryOwnershipTeamID: this.myTeam.ministryOwnershipTeamId,
          subject: this.subject,
          content: this.newMessage,
          secureExchangeDocuments: this.secureExchangeDocuments,
          ministryTeamName: this.myTeam.teamName,
          districtID: this.selectedContact.value,
          districtName: this.districtMap.get(this.selectedContact.value).name,
          secureExchangeStudents: this.secureExchangeStudents
        };
      }

      ApiService.apiAxios.post(`${Routes['edx'].EXCHANGE_URL}`, payload)
        .then(() => {
          this.setSuccessAlert('Success! The message has been sent.');
          this.messageSent();
          this.clearSecureExchangeDocuments();
        })
        .catch(error => {
          this.setFailureAlert('An error occurred while sending message. Please try again later.');
          console.log(error);
        })
        .finally(() => {
          this.processing = false;
        });
    },
    async uploadDocument(document) {
      const edStore = edxStore();
      await edStore.setSecureExchangeDocuments([...this.secureExchangeDocuments, document]);
      this.checkTotalFileSize();
    },
    removeDocumentByIndex(index) {
      //since we don't have a unique UUID to identify the document to remove, we will use the index
      const edStore = edxStore();
      edStore.deleteSecureExchangeDocumentByIndex(index);
      this.checkTotalFileSize();
    },
    clearSecureExchangeDocuments() {
      const edStore = edxStore();
      edStore.setSecureExchangeDocuments([]);
    },
    showOptions() {
      this.expandAttachFile = false;
      this.expandAddStudent = false;
      this.shouldShowOptions = true;
    },
    showAttachFilePanel() {
      this.expandAttachFile = true;
      this.expandAddStudent = false;
      this.shouldShowOptions = false;
    },
    updateAdditionalStudentAddWarning(newValue) {
      this.additionalStudentAddWarningMessage = newValue;
    },
    showAddStudentPanel() {
      this.expandAttachFile = false;
      this.expandAddStudent = true;
      this.shouldShowOptions = false;
    },
    async addSecureExchangeStudent(secureExchangeStudent) {
      const found = this.secureExchangeStudents.some(el => el.studentID === secureExchangeStudent.studentID);
      if (!found) {
        const edStore = edxStore();
        await edStore.setSecureExchangeStudents([...this.secureExchangeStudents, secureExchangeStudent]);
      }
    },
    removeSecureExchangeStudentByID(secureExchangeStudent) {
      const edStore = edxStore();
      edStore.deleteSecureExchangeStudentsByID(secureExchangeStudent);
    },
    clearSecureExchangeStudents() {
      const edStore = edxStore();
      edStore.setSecureExchangeStudents([]);
    },
    onSchoolSelected() {
      if (this.selectedContact.value) {
        this.disableAddStudent = false;
      } else {
        this.disableAddStudent = true;
      }
    },
    replaceMessageMacro() {
      this.newMessage = replaceMacro(this.newMessage, this.messageMacros);
    },
    insertMacroMessage(macroText) {
      this.newMessage = insertMacro(macroText, this.newMessage, this.$refs.newMessageTextArea.$refs.input);
    },
    getInstituteValue() {
      if (this.selectedContact?.type === 'school') {
        return {
          'type': 'SCHOOL',
          'value': this.selectedContact?.mincode
        };
      } else {
        return {
          'type': 'DISTRICT',
          'value': this.selectedContact?.value
        };
      }
    },
    validateForm() {
      const isValid = this.$refs.newMessageForm.validate();
      this.isValidForm = isValid.valid;
    },
    humanFileSize
  }
};
</script>

<style scoped>
.addButton.v-btn--outlined {
    border: thin solid #FFFFFF;
    text-transform: none;
    font-weight: bolder;
}

</style>
