<template>
  <v-dialog
          id="newMessageDialog"
          v-model="newMessageDialogOpen"
          max-width="50%"
          persistent
          :disabled="disabled"
  >
    <template v-slot:activator="{ on, attrs }">
      <PrimaryButton
            id="newMessageBtn"
            text="New Message"
            :disabled="disabled"
            :bind="attrs"
            :on="on">
      </PrimaryButton>
    </template>
    <v-card id="newMessageDialogCard">
      <v-card-title class="headline">
        New Message
      </v-card-title>
      <v-card-text id="newMessageDialogCardText" class="pb-0">
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
            id="newMessageDialogTextArea"
            v-model="newMessage"
            :rules="requiredRules"
            rows="10"
            maxlength="4000"
            dense
            clearable
            clear-icon="clear"
            ref="newMessageDialogTextArea">
          </v-textarea>
        </v-form>
      </v-card-text>
      <v-card-actions class="pt-4 px-6 pb-4">
        <PrimaryButton id="newMessageDialogCancelBtn" text="Cancel" secondary @click.native="closeNewMessageDialog"></PrimaryButton>
        <PrimaryButton id="newMessageDialogPostBtn" text="Send" :disabled="!isValidForm" :loading="processing" @click.native="sendNewMessage"></PrimaryButton>
      </v-card-actions>
    </v-card>
    <ConfirmationDialog ref="confirmationDialog"></ConfirmationDialog>
  </v-dialog>
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

export default {
  name: 'NewMessageDialog',
  mixins: [alertMixin],
  components: {
    PrimaryButton,
    ConfirmationDialog,
  },
  props: {
    myTeam: {
      type: Object,
      required: true,
    },
    disabled: {
      type: Boolean,
      default: false
    },
  },
  data() {
    return {
      newMessageDialogOpen: false,
      newMessage: '',
      mincode: null,
      subject: '',
      requiredRules: [v => !!v?.trim() || 'Required'],
      isValidForm: false,
      processing: false,
    };
  },
  computed: {
    ...mapState('app', ['mincodeSchoolNames']),
    ...mapState('auth', ['userInfo']),
    ...mapState('edx', ['exchangeMincodes']),
    schools() {
      const schoolNames = Array.from(this.mincodeSchoolNames.entries()).filter(entry => this.exchangeMincodes.some(mincode => entry[0] === mincode));
      return _.sortBy(schoolNames.map(school => ({ text: `${school[1]} (${school[0]})`, value: school[0]})), ['text']);
    },
  },
  watch: {
    newMessageDialogOpen(val) {
      if(val) {
        this.$refs.newMessageForm?.resetValidation();
        this.newMessage = '';
        this.subject = '';
        this.mincode = null;
      }
    }
  },
  created() {
    this.$store.dispatch('edx/getExchangeMincodes');
  },
  methods: {
    async closeNewMessageDialog() {
      if(this.newMessage?.trim()) {
        await this.$refs.confirmationDialog.open('Warning!', 'Changes will be lost. Are you sure?', { color: '#003366', rejectText: 'No, go back' })
          .then((result) => {
            if(result) {
              this.newMessageDialogOpen = false;
            }
          });
      } else {
        this.newMessageDialogOpen = false;
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
        .then((result) => {
          this.setSuccessAlert('Success! The message has been sent.');
          this.$emit('send', result.data);
          this.newMessageDialogOpen = false;
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
#newMessageDialog /deep/ .v-text-field__details, #newMessageDialog /deep/ .v-input__slot {
  margin-bottom: 0 !important;
}
#newMessageDialogCardText /deep/ .v-icon {
  color: #003366 !important;
}
</style>
