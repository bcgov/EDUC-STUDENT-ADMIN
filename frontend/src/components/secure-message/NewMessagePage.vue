<template>
  <v-container fluid class="full-height px-0 pt-0">
    <v-row class="d-flex justify-center">
      <v-col class="pt-0" cols="11">
        <v-row>
          <v-col class="pr-0 pb-0">
            <v-row><v-col>
              <v-card id="newMessageCard" flat outlined>
                <v-row>
                  <v-col class="pb-0">
                    <v-card-text id="newMessageCardText" class="pb-0 pt-0">
                      <v-form ref="newMessageForm" v-model="isValidForm">
                        <v-text-field
                          :value="myTeam.teamName"
                          label="From"
                          class="pt-0"
                          readonly
                        ></v-text-field>
                        <v-autocomplete
                          id='schoolNameTxtField'
                          label="To"
                          class="pt-0"
                          v-model="schoolId"
                          :items="schools"
                          :rules="requiredRules"
                          @change="onSchoolSelected"
                        >
                          <template v-slot:selection="{ item }">
                            <span> {{ item.text }} </span>
                          </template>
                        </v-autocomplete>
                        <v-text-field
                          v-model="subject"
                          id='subjectTxtField'
                          label="Subject"
                          :rules="requiredRules"
                          maxlength="255"
                          class="pt-0"
                        ></v-text-field>
                        <v-textarea
                          id="newMessageTextArea"
                          v-model="newMessage"
                          :rules="requiredRules"
                          rows="8"
                          label="Message"
                          no-resize
                          maxlength="4000"
                          class="pt-0"
                          ref="newMessageTextArea"
                          hide-details="auto"
                          @input="replaceMessageMacro">
                        </v-textarea>
                      </v-form>
                    </v-card-text>
                    <div class="text-right">
                      <MacroMenu margin="my-2 mr-3" id="newMessageMacroSelector" :macros="messageMacros" @select="insertMacroMessage" menuMaxWidth="25%" small/>
                    </div>
                    <v-divider />
                  </v-col>
                </v-row>
                <v-row class="ml-6" no-gutters>
                  <v-col cols="4" v-for="(document, index) in secureExchangeDocuments" :key="index" class="d-flex px-0 pb-2">
                    <v-chip :id="`documentChip-${index}`" :class="['ma-1']"   close @click:close="removeDocumentByIndex(index)">
                      <v-avatar left>
                        <v-icon>mdi-paperclip</v-icon>
                      </v-avatar>
                      {{abbreviateFileName(document.fileName)}}</v-chip>
                  </v-col>
                  <v-col cols="4" v-for="(secureExchangeStudent, index) in secureExchangeStudents" :key="secureExchangeStudent.studentID" class="d-flex px-0 pb-2">
                    <v-chip :id="`studentChip-${index}`" :class="['ma-1']"  close @click:close="removeSecureExchangeStudentByID(secureExchangeStudent)">
                      <v-avatar left>
                        <v-icon>mdi-account-circle</v-icon>
                      </v-avatar>
                      {{secureExchangeStudent.pen}}</v-chip>
                  </v-col>
                </v-row>
                <v-row v-if="shouldShowOptions">
                  <v-col class="d-flex justify-end mr-3 pt-0">
                    <v-btn id="attachFileID"
                           title="Attach File"
                           color="#1A5A96"
                           outlined
                           class="addButton pl-0 pr-2"
                           @click="showAttachFilePanel"
                    >
                      <v-icon color="#1A5A96" class="mr-0" right dark>mdi-paperclip</v-icon>
                      <span class="ml-1">Attach File</span>
                    </v-btn>
                    <v-btn id="addStudentID"
                           title="Add Student"
                           color="#1A5A96"
                           outlined
                           class="addButton pl-0 pr-2 ml-1"
                           @click="showAddStudentPanel"
                           :disabled="disableAddStudent"
                    >
                      <v-icon color="#1A5A96" class="mr-0" right dark>mdi-account-multiple-plus-outline</v-icon>
                      <span class="ml-1">Add Student</span>
                    </v-btn>
                  </v-col>
                </v-row>
                <!--pop out for attaching files-->
                <v-row no-gutters>
                  <v-col>
                    <v-expand-transition
                        max-width="30rem"
                        max-height="50rem"
                        xl="2" lg="2" md="2" xs="2" sm="2"
                    >
                      <DocumentUpload
                          :small-file-extension="false"
                          :check-file-rules="true"
                          v-show="expandAttachFile"
                          @close:form="showOptions"
                          @upload="uploadDocument"
                      ></DocumentUpload>
                    </v-expand-transition>
                    <v-expand-transition>
                      <AddStudent
                          v-show="expandAddStudent"
                          @close:form="showOptions"
                          @addStudent="addSecureExchangeStudent"
                          :mincode="getMincode()"
                          :additionalStudentAddWarning="additionalStudentAddWarningMessage"
                          @updateAdditionalStudentAddWarning="updateAdditionalStudentAddWarning"
                      >
                      </AddStudent>
                    </v-expand-transition>
                  </v-col>
                </v-row>
                <!--end pop out for attaching files-->
              </v-card>
            </v-col></v-row>
          </v-col>
        </v-row>
        <v-row class="py-4 justify-end">
          <PrimaryButton id="cancelMessage" secondary text="Cancel" class="mr-2" @click.native="navigateToList"></PrimaryButton>
          <PrimaryButton id="newMessagePostBtn" text="Send" width="8rem" :disabled="!isValidForm" :loading="processing" @click.native="sendNewMessage"></PrimaryButton>
        </v-row>
      </v-col>
    </v-row>

    <ConfirmationDialog ref="confirmationDialog"></ConfirmationDialog>
  </v-container>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex';
import {replaceMacro, insertMacro} from '../../utils/macro';
import ApiService from '@/common/apiService';
import {
  Routes,
} from '@/utils/constants';
import {isValidPEN} from '@/utils/validation';
import alertMixin from '@/mixins/alertMixin';
import PrimaryButton from '@/components/util/PrimaryButton';
import DocumentUpload from '@/components/common/DocumentUpload';
import ConfirmationDialog from '@/components/util/ConfirmationDialog';
import AddStudent from '@/components/common/AddStudent';
import MacroMenu from '../common/MacroMenu';

export default {
  name: 'NewMessagePage',
  mixins: [alertMixin],
  components: {
    AddStudent,
    PrimaryButton,
    ConfirmationDialog,
    DocumentUpload,
    MacroMenu
  },
  data() {
    return {
      newMessage: '',
      schoolId: '',
      subject: '',
      requiredRules: [v => !!v?.trim() || 'Required'],
      isValidForm: false,
      processing: false,
      pen: null,
      penRules: [v => (!v || isValidPEN(v)) || this.penHint],
      penHint: 'Invalid PEN',
      expandAttachFile: false,
      expandAddStudent: false,
      shouldShowOptions: true,
      additionalStudentAddWarningMessage:'',
      disableAddStudent: true,
    };
  },
  computed: {
    ...mapState('auth', ['userInfo']),
    ...mapState('edx', ['ministryTeams', 'exchangeMincodes', 'secureExchangeDocuments','secureExchangeStudents']),
    ...mapGetters('app', ['schoolMap']),
    ...mapGetters('edx', ['messageMacros']),
    myTeam() {
      return this.ministryTeams.find(team => this.userInfo.userRoles.some(role => team.groupRoleIdentifier === role)) || {};
    },
    schools() {
      return _.sortBy(Array.from(this.schoolMap.entries()).map(school => ({ text: `${school[1]?.schoolName} (${school[1]?.mincode})`, value: school[1]?.schoolId, mincode: school[1].mincode})), ['mincode']);
    },
  },
  created() {
    this.$store.dispatch('edx/getExchangeMincodes');
    this.clearSecureExchangeDocuments();
    this.clearSecureExchangeStudents();
    this.getMacros();
  },
  methods: {
    ...mapActions('edx', ['getMacros']),
    navigateToList() {
      this.$emit('secure-exchange:cancelMessage');
    },
    messageSent(){
      this.subject = '';
      this.schoolId = null;
      this.newMessage = '';
      this.requiredRules = [v => !!v?.trim() || 'Required'];
      this.penRules = [v => (!v || isValidPEN(v)) || this.penHint];
      this.$emit('secure-exchange:messageSent');
      this.clearSecureExchangeDocuments();
      this.clearSecureExchangeStudents();
      this.additionalStudentAddWarningMessage='';
      this.disableAddStudent = true;
    },
    abbreviateFileName(fileName){
      if(fileName.length > 8){
        return fileName.substring(0,8) + '...';
      }
      return fileName;
    },
    sendNewMessage() {
      this.processing = true;
      const payload = {
        secureExchangeContactTypeCode: 'SCHOOL',
        contactIdentifier: this.schoolId,
        ministryOwnershipTeamID: this.myTeam.ministryOwnershipTeamId,
        subject: this.subject,
        content: this.newMessage,
        secureExchangeDocuments: this.secureExchangeDocuments,
        ministryTeamName : this.myTeam.teamName,
        schoolId: this.schoolId,
        schoolName: this.mincodeSchoolNames.get(this.schoolId),
        secureExchangeStudents: this.secureExchangeStudents
      };
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
      this.$store.commit('edx/setSecureExchangeDocuments', [...this.secureExchangeDocuments, document]);
    },
    removeDocumentByIndex(index) {
      //since we don't have a unique UUID to identify the document to remove, we will use the index
      this.$store.commit('edx/deleteSecureExchangeDocumentByIndex', index);
    },
    clearSecureExchangeDocuments() {
      this.$store.commit('edx/setSecureExchangeDocuments', []);
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
    updateAdditionalStudentAddWarning(newValue){
      this.additionalStudentAddWarningMessage = newValue;
    },
    showAddStudentPanel() {
      this.expandAttachFile = false;
      this.expandAddStudent = true;
      this.shouldShowOptions = false;
    },
    async addSecureExchangeStudent(secureExchangeStudent) {
      const found =this.secureExchangeStudents.some(el =>el.studentID === secureExchangeStudent.studentID);
      if(!found){
        this.$store.commit('edx/setSecureExchangeStudents', [...this.secureExchangeStudents, secureExchangeStudent]);
      }
    },
    removeSecureExchangeStudentByID(secureExchangeStudent) {
      this.$store.commit('edx/deleteSecureExchangeStudentsByID', secureExchangeStudent);
    },
    clearSecureExchangeStudents() {
      this.$store.commit('edx/setSecureExchangeStudents', []);
    },
    onSchoolSelected(){
      if(this.schoolId){
        this.disableAddStudent = false;
      }else{
        this.disableAddStudent = true;
      }
    },
    replaceMessageMacro() {
      this.newMessage = replaceMacro(this.newMessage, this.messageMacros);
    },
    insertMacroMessage(macroText) {
      this.newMessage = insertMacro(macroText, this.newMessage, this.$refs.newMessageTextArea.$refs.input);
    },
    getMincode() {
      return this.schoolMap.get(this.schoolId)?.mincode || '';
    },
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
