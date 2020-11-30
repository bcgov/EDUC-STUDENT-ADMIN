<template>
  <v-dialog
          id="compareModal"
          v-model="compareModalOpen"
          persistent
          max-width="80%"
          :disabled="disabled"
  >
    <template v-slot:activator="{ on, attrs }">
      <TertiaryButton
              id="studentSearchCompareButton"
              class="ma-0"
              text="Compare"
              icon="mdi-content-copy"
              :disabled="disabled"
              @click.native="compare"
              :bind="attrs"
              :on="on">
      </TertiaryButton>
    </template>
    <v-card id="requestInfoDialogCard">
      <CompareDemographicsCommon :selectedRecords.sync="studentRecords">
        <template v-slot:title>
          Compare/View
          <v-spacer></v-spacer>
          <v-btn id="closeCompareModalBtn" text icon @click="closeCompareModal">
            <v-icon large color="#38598A">mdi-close</v-icon>
          </v-btn>
        </template>
      </CompareDemographicsCommon>
      <v-card-actions class="pt-0 px-6 pb-4">
        <v-spacer></v-spacer>
        <PrimaryButton id="compareModalCancelBtn" text="Cancel" secondary @click.native="closeCompareModal"></PrimaryButton>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import PrimaryButton from '../util/PrimaryButton';
import TertiaryButton from '../util/TertiaryButton';
import CompareDemographicsCommon from './CompareDemographicsCommon';

export default {
  name: 'CompareDemographicModal',
  components: {
    CompareDemographicsCommon,
    PrimaryButton,
    TertiaryButton
  },
  props: {
    disabled: {
      type: Boolean,
      required: true
    },
    selectedRecords: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      compareModalOpen: false,
    };
  },
  computed: {
    studentRecords: {
      get: function() {
        return this.selectedRecords;
      },
      set: function(value) {
        this.$emit('update:selectedRecords', value);
      }
    }
  },
  methods: {
    closeCompareModal() {
      this.compareModalOpen = false;
    },
    compare() {
      this.compareModalOpen = true;
    },
  }
};
</script>

<style scoped>
  #studentSearchCompareButton {
    float: right;
  }
</style>
