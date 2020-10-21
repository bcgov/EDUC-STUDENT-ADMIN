<template>
  <v-dialog
          id="requestInfoDialog"
          v-model="requestInfoDialogOpen"
          max-width="50%"
          persistent
  >
    <template v-slot:activator="{ on, attrs }">
      <PrimaryButton
            id="requestInfoBtn"
            text="Request info"
            :bind="attrs"
            :on="on">
      </PrimaryButton>
    </template>
    <v-card id="requestInfoDialogCard">
      <v-card-title class="headline">
        Request Info
      </v-card-title>
      <v-alert
              v-model="macroAlert"
              dense
              text
              dismissible
              outlined
              transition="scale-transition"
              class="bootstrap-error"
      >
        {{ macroAlertMessage }}
      </v-alert>
      <v-card-text id="requestInfoDialogCardText" class="pb-0">
        <v-textarea
                id="requestInfoDialogTextArea"
                v-model="requestInfoDialogText"
                outlined
                clearable
                rows="10"
                maxlength="4000"
                @input="macroHotKey"
                ref="requestInfoDialogTextArea">
        </v-textarea>
      </v-card-text>
      <v-card-actions class="pt-0 px-6 pb-4">
        <v-col class="pl-0 pa-0">
          <v-menu id="chooseMessageMenu" max-height="30%" offset-y max-width="46.8%">
            <template v-slot:activator="{ on, attrs }">
              <PrimaryButton
                      id="requestInfoDialogChooseMessageBtn"
                      text="Choose Message"
                      icon="fa-angle-down"
                      secondary
                      :bind="attrs"
                      :on="on"></PrimaryButton>
            </template>
            <v-list class="py-0 overflow-y-auto">
              <v-list-item
                      v-for="(item, index) in studentInfoMacros"
                      :key="index"
                      dense
                      class="macroListItem"
                      @click="insertMacroText(item.macroText)"
              >
                  <v-list-item-title>
                  <v-row class="macroRow">
                    <v-col cols="1" class="py-2 pr-0"><strong>{{ item.macroCode }}</strong></v-col>
                    <v-col cols="11" class="text-wrap py-2 pl-0">{{ item.macroText }}</v-col>
                  </v-row>
                  </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-col>
        <PrimaryButton id="requestInfoDialogCancelBtn" text="Cancel" secondary @click.native="closeRequestInfoDialog"></PrimaryButton>
        <PrimaryButton id="requestInfoDialogPostBtn" text="Post" :disabled="requestInfoDialogText===null" @click.native="$emit('updateInfoRequested', requestInfoDialogText)"></PrimaryButton>
      </v-card-actions>
    </v-card>
    <ConfirmationDialog ref="confirmationDialog"></ConfirmationDialog>
  </v-dialog>
</template>

<script>
import PrimaryButton from '../../../util/PrimaryButton';
import { replaceMacro } from '../../../../utils/macro';
import { mapState } from 'vuex';
import ConfirmationDialog from '../../../util/ConfirmationDialog';
export default {
  name: 'InfoDialog',
  components: {
    PrimaryButton,
    ConfirmationDialog
  },
  props: {
    text: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      requestInfoDialogOpen: false,
      requestInfoDialogText: '',
      macroAlert: false,
      macroAlertMessage: 'Insufficient space remaining for this macro'
    };
  },
  mounted() {
    this.$store.dispatch('penRequestBatch/getMacros');
    this.requestInfoDialogText = this.text;
  },
  computed: {
    ...mapState('penRequestBatch', ['studentInfoMacros'])
  },
  methods: {
    async closeRequestInfoDialog() {
      if(this.requestInfoDialogText !== this.text && !(!this.requestInfoDialogText && !this.text)) {
        await this.$refs.confirmationDialog.open('Warning!', 'Changes will be lost. Are you sure?', { color: '#003366', rejectText: 'No, go back' })
          .then((result) => {
            if(result) {
              this.requestInfoDialogOpen = false;
              this.requestInfoDialogText = this.text;
            }
          });
      } else {
        this.requestInfoDialogOpen = false;
      }

    },
    insertMacroText(macroText) {
      if(this.requestInfoDialogText?.length + macroText?.length > 4000) {
        this.macroAlert = true;
      } else {
        this.macroAlert = false;
        if(this.requestInfoDialogText){
          const element = this.$refs.requestInfoDialogTextArea.$refs.input;
          let cursorLocation = element.selectionEnd;
          this.requestInfoDialogText = this.requestInfoDialogText.substring(0, cursorLocation) + macroText + this.requestInfoDialogText.substring(cursorLocation);
        } else {
          this.requestInfoDialogText = macroText;
        }
      }
    },
    macroHotKey() {
      const replacedText = replaceMacro(this.requestInfoDialogText, this.studentInfoMacros);
      if(replacedText?.length > 4000) {
        this.macroAlert = true;
      } else {
        this.macroAlert = false;
        this.requestInfoDialogText = replaceMacro(this.requestInfoDialogText, this.studentInfoMacros);
      }
    }
  }
};
</script>

<style scoped>
/deep/ .v-text-field__details, /deep/ .v-input__slot {
  margin-bottom: 0 !important;
}
#requestInfoDialogCardText /deep/ .v-icon {
  color: #003366 !important;
}
.macroListItem {
  min-height: 0;
}
  .macroListItem:hover {
    cursor: pointer;
    background-color: #F2F2F2;
  }
</style>
