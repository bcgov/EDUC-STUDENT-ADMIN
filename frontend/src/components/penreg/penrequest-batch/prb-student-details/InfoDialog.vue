<template>
  <v-dialog
          id="requestInfoDialog"
          v-model="requestInfoDialogOpen"
          max-width="50%"
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
      <v-card-text id="requestInfoDialogCardText" class="pb-0">
        <v-textarea
                id="requestInfoDialogTextArea"
                v-model="requestInfoDialogText"
                outlined
                clearable
                auto-grow
                rows="6"
                maxlength="4000">
        </v-textarea>
      </v-card-text>
      <v-card-actions class="pt-0 px-6 pb-4">
        <v-col class="pl-0 pa-0">
          <v-menu id="chooseMessageMenu" offset-y allow-overflow>
            <template v-slot:activator="{ on, attrs }">
              <PrimaryButton
                      disabled
                      id="requestInfoDialogChooseMessageBtn"
                      text="Choose Message"
                      icon="fa-angle-down"
                      secondary
                      :bind="attrs"
                      :on="on"></PrimaryButton>
            </template>
            <v-list class="py-0">
              <v-list-item
                      v-for="(item, index) in messageDropDownItems"
                      :key="index"
                      dense
              >
                <v-list-item-title>{{ item.title }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-col>
        <PrimaryButton id="requestInfoDialogCancelBtn" text="Cancel" secondary @click.native="closeRequestInfoDialog"></PrimaryButton>
        <PrimaryButton id="requestInfoDialogPostBtn" text="Post" :disabled="requestInfoDialogText===null" @click.native="$emit('updateInfoRequested', requestInfoDialogText)"></PrimaryButton>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import PrimaryButton from '../../../util/PrimaryButton';
export default {
  name: 'InfoDialog',
  components: {PrimaryButton},
  data() {
    return {
      requestInfoDialogOpen: false,
      requestInfoDialogText: null,
      messageDropDownItems: []
    };
  },
  methods: {
    closeRequestInfoDialog() {
      this.requestInfoDialogOpen = false;
      this.requestInfoDialogText = null;
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
