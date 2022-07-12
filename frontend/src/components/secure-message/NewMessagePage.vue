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
                          v-model="mincode"
                          :items="schools"
                          :rules="requiredRules"
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
                          ref="newMessageTextArea">
                        </v-textarea>
                      </v-form>
                    </v-card-text>
                  </v-col>
                </v-row>
                <v-row no-gutters>
                  <v-col>
                    <v-icon v-if="secureExchangeDocuments.length > 0" >mdi-paperclip</v-icon>
                    <v-chip :class="['ma-1']" v-for="(document, index) in secureExchangeDocuments" :key="index" close @click:close="removeDocumentByIndex(index)">{{document.fileName}}</v-chip>
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
                           class="addButton pl-0 pr-2"
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
                          v-show="expandAttachFile"
                          @close:form="showOptions"
                          @upload="uploadDocument"
                      ></DocumentUpload>
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
import PrimaryButton from '@/components/util/PrimaryButton';
import DocumentUpload from '@/components/common/DocumentUpload';
import { mapState } from 'vuex';
import ConfirmationDialog from '@/components/util/ConfirmationDialog';
import alertMixin from '@/mixins/alertMixin';
import ApiService from '@/common/apiService';
import {
  Routes,
} from '@/utils/constants';
import {isValidPEN} from '@/utils/validation';

export default {
  name: 'NewMessagePage',
  mixins: [alertMixin],
  components: {
    PrimaryButton,
    ConfirmationDialog,
    DocumentUpload,
  },
  data() {
    return {
      newMessage: '',
      mincode: null,
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
    };
  },
  computed: {
    ...mapState('app', ['mincodeSchoolNames']),
    ...mapState('auth', ['userInfo']),
    ...mapState('edx', ['ministryTeams', 'exchangeMincodes', 'secureExchangeDocuments']),
    myTeam() {
      return this.ministryTeams.find(team => this.userInfo.userRoles.some(role => team.groupRoleIdentifier === role)) || {};
    },
    schools() {
      const schoolNames = Array.from(this.mincodeSchoolNames.entries()).filter(entry => this.exchangeMincodes.some(mincode => entry[0] === mincode));
      return _.sortBy(schoolNames.map(school => ({ text: `${school[1]} (${school[0]})`, value: school[0]})), ['text']);
    },
  },
  created() {
    this.$store.dispatch('edx/getExchangeMincodes');
    this.clearSecureExchangeDocuments();
  },
  methods: {
    navigateToList() {
      this.$emit('secure-exchange:cancelMessage');
    },
    messageSent(){
      this.subject = '';
      this.mincode = null;
      this.newMessage = '';
      this.requiredRules = [v => !!v?.trim() || 'Required'];
      this.penRules = [v => (!v || isValidPEN(v)) || this.penHint];
      this.$emit('secure-exchange:messageSent');
    },
    sendNewMessage() {
      this.processing = true;
      const payload = {
        secureExchangeContactTypeCode: 'SCHOOL',
        contactIdentifier: this.mincode,
        ministryOwnershipTeamID: this.myTeam.ministryOwnershipTeamId,
        subject: this.subject,
        content: this.newMessage,
        secureExchangeDocuments: this.secureExchangeDocuments,
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
    }
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
