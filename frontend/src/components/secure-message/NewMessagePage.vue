<template>
  <v-container fluid class="full-height px-0 mb-4">
    <v-row no-gutters class="pb-4">
      <PrimaryButton 
        id="go-back-action"
        icon="mdi-arrow-left"
        iconClass="pt-0"
        secondary 
        short
        @click.native="closeNewMessagePage"
      ></PrimaryButton>
    </v-row>
    <v-row no-gutters>
      <v-col cols="7">
        <v-card id="newMessageCard" flat outlined class="mr-4">
          <v-card-title class="headline">
            New Message
          </v-card-title>
          <v-card-text id="newMessageCardText" class="pb-0">
            <v-form ref="newMessageForm" v-model="isValidForm">
              <v-autocomplete
                id='schoolNameTxtField'
                label="To"
                v-model="mincode"
                :items="schools"
                :rules="requiredRules"
                dense
                clearable
                clear-icon="clear"
              >
                <template v-slot:selection="{ item }">
                  <span> {{ item.text }} </span>
                </template>
              </v-autocomplete>
              <v-text-field
                :value="myTeam.teamName"
                label="From"
                dense 
                readonly
              ></v-text-field>
              <v-text-field
                v-model="subject"
                label="Subject"
                :rules="requiredRules"
                maxlength="255"
                dense
                clearable
                clear-icon="clear"
              ></v-text-field>
              <v-textarea
                id="newMessageTextArea"
                v-model="newMessage"
                :rules="requiredRules"
                rows="10"
                maxlength="4000"
                dense
                clearable
                clear-icon="clear"
                ref="newMessageTextArea">
              </v-textarea>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col>
        <v-card flat outlined class="ml-4">
          <v-card-title class="headline justify-space-between">
            <span>Attachments</span>
            <span class="subtitle-1 font-italic">optional</span>
          </v-card-title>
          <v-card-text class="pb-0 card-hint">
            <span>Add any information that may be helpful for this request.</span>
          </v-card-text>
          <v-card-actions class="pt-4 pb-4 justify-center">
            <PrimaryButton id="attachFileBtn" text="Attach File"></PrimaryButton>
          </v-card-actions>
        </v-card>
        <v-card flat outlined class="ml-4 mt-4">
          <v-card-title class="headline">
            Student
          </v-card-title>
          <v-card-text class="pb-0 card-hint">
            <span>Addding a student will allow you and the school to see the student's record at the Ministry of Education.</span>
          </v-card-text>
          <v-card-actions class="pt-0">
            <v-row class="justify-center mt-4"> 
              <v-col cols="5" class="py-0">
                <v-text-field
                  id="studentPenField"
                  v-model="pen"
                  label="Student's PEN"
                  maxlength="9"
                  :rules="penRules"
                  outlined
                  dense
                  clearable
                  clear-icon="clear"
                ></v-text-field>
              </v-col>
              <PrimaryButton id="addStudentBtn" text="Add Student"></PrimaryButton>
            </v-row>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
    <v-row no-gutters class="py-4 justify-end">
      <PrimaryButton id="newMessagePostBtn" text="Send" width="10rem" :disabled="!isValidForm" :loading="processing" @click.native="sendNewMessage"></PrimaryButton>
    </v-row>
    <ConfirmationDialog ref="confirmationDialog"></ConfirmationDialog>
  </v-container>
</template>

<script>
import PrimaryButton from '@/components/util/PrimaryButton';
import { mapState } from 'vuex';
import ConfirmationDialog from '@/components/util/ConfirmationDialog';
import alertMixin from '@/mixins/alertMixin';
import ApiService from '@/common/apiService';
import {
  Routes,
} from '@/utils/constants';
import router from '@/router';
import {isValidPEN} from '@/utils/validation';

export default {
  name: 'NewMessagePage',
  mixins: [alertMixin],
  components: {
    PrimaryButton,
    ConfirmationDialog,
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
    };
  },
  computed: {
    ...mapState('app', ['mincodeSchoolNames']),
    ...mapState('auth', ['userInfo']),
    ...mapState('edx', ['ministryTeams', 'exchangeMincodes']),
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
  },
  methods: {
    navigateToList() {
      router.push({name: 'exchange'});
    },
    async closeNewMessagePage() {
      if(this.newMessage?.trim()) {
        await this.$refs.confirmationDialog.open('Warning!', 'Changes will be lost. Are you sure?', { color: '#003366', rejectText: 'No, go back' })
          .then((result) => {
            if(result) {
              this.navigateToList();
            }
          });
      } else {
        this.navigateToList();
      }
    },
    sendNewMessage() {
      this.processing = true;
      const payload = {
        secureExchangeContactTypeCode: 'SCHOOL',
        contactIdentifier: this.mincode,
        ministryOwnershipTeamID: this.myTeam.ministryOwnershipTeamId,
        subject: this.subject,
        content: this.newMessage,
      };
      ApiService.apiAxios.post(`${Routes['edx'].EXCHANGE_URL}`, payload)
        .then(() => {
          this.setSuccessAlert('Success! The message has been sent.');
          this.navigateToList();
        })
        .catch(error => {
          this.setFailureAlert('An error occurred while sending message. Please try again later.');
          console.log(error);
        })
        .finally(() => {
          this.processing = false;
        });
    },
  }
};
</script>

<style scoped>
.card-hint {
  color: #000 !important;
  font-size: 1rem;
}
</style>
