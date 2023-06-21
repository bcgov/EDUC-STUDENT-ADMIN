<template>
  <v-dialog
          id="requestInfoDialog"
          v-model="requestInfoDialogOpen"
          max-width="50%"
          :disabled="disabled"
  >
    <template #activator="{ on, attrs }">
      <PrimaryButton
            id="requestInfoBtn"
            text="Request info"
            :disabled="disabled"
            :bind="attrs"
            :on="on">
      </PrimaryButton>
    </template>
    <v-card id="requestInfoDialogCard">
      <v-card-title class="headline">
        Request Info
      </v-card-title>
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
          <MacroMenu
            id="requestInfoDialogChooseMessageBtn"
            :macros="studentInfoMacros"
            text="Choose Message"
            @select="insertMacroText"
            margin="ml-0"
            menuMaxWidth="46.8%"
          />
        </v-col>
        <PrimaryButton id="requestInfoDialogCancelBtn" text="Cancel" secondary @click.native="closeRequestInfoDialog"></PrimaryButton>
        <PrimaryButton id="requestInfoDialogPostBtn" text="Post" :disabled="requestInfoDialogText===null" @click.native="$emit('updateInfoRequested', requestInfoDialogText)"></PrimaryButton>
      </v-card-actions>
    </v-card>
    <ConfirmationDialog ref="confirmationDialog"></ConfirmationDialog>
  </v-dialog>
</template>

<script>
import PrimaryButton from '../../../util/PrimaryButton.vue';
import { replaceMacro, insertMacro } from '../../../../utils/macro';
import { mapState } from 'pinia';
import ConfirmationDialog from '../../../util/ConfirmationDialog.vue';
import alertMixin from '@/mixins/alertMixin';
import MacroMenu from '@/components/common/MacroMenu.vue';
import {penRequestBatchStore} from '@/store/modules/penRequestBatch';

export default {
  name: 'InfoDialog',
  mixins: [alertMixin],
  components: {
    PrimaryButton,
    ConfirmationDialog,
    MacroMenu
  },
  props: {
    text: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      requestInfoDialogOpen: false,
      requestInfoDialogText: '',
      macroAlertMessage: 'Insufficient space remaining for this macro'
    };
  },
  mounted() {
    penRequestBatchStore().getMacros();
    this.requestInfoDialogText = this.text;
  },
  computed: {
    ...mapState(penRequestBatchStore, ['studentInfoMacros'])
  },
  methods: {
    async closeRequestInfoDialog() {
      if(this.requestInfoDialogText != this.text) { //we want null and empty string to be viewed as equal
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
        this.setFailureAlert(this.macroAlertMessage);
      } else {
        this.requestInfoDialogText = insertMacro(macroText, this.requestInfoDialogText, this.$refs.requestInfoDialogTextArea.$refs.input);
      }
    },
    macroHotKey() {
      const replacedText = replaceMacro(this.requestInfoDialogText, this.studentInfoMacros);
      if(replacedText?.length > 4000) {
        this.setFailureAlert(this.macroAlertMessage);
      } else {
        this.requestInfoDialogText = replacedText;
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
</style>
