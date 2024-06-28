<template>
  <div>
    <v-form ref="addMacroForm">
      <v-row>
        <v-col>
          <v-text-field
            v-model="macro.macroCode"
            maxlength="3"
            label="Macro Code"
            density="compact"
            :rules="[Rules.required(), Rules.minLength( 3)]"
            :disabled="loading || disabled"
            variant="outlined"
            auto-hide="true"
            @input="(event) => {isFormValid(); changeInputToUpperCase(event)}"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-textarea
            v-model="macro.macroText"
            maxlength="4000"
            label="Macro Message"
            density="compact"
            variant="outlined"
            :disabled="loading || disabled"
            :rules="[Rules.required()]"
            :rows="rows"
            @input="isFormValid"
          />
        </v-col>
      </v-row>
    </v-form>

    <v-card-actions class="pt-0">
      <v-spacer />
      <PrimaryButton
        id="cancel-action"
        class="mr-2"
        :short="short"
        secondary
        text="Cancel"
        :disabled="loading || disabled"
        @click-action="$emit('cancel')"
      />
      <PrimaryButton
        id="save-action"
        :short="short"
        text="Save"
        :disabled="loading || disabled || !isValidForm"
        :loading="loading"
        @click-action="$emit('save', macro)"
      />
    </v-card-actions>
  </div>
</template>

<script>
import PrimaryButton from '../util/PrimaryButton.vue';
import * as Rules from '../../utils/institute/formRules';

export default {
  name: 'MacroEditor',
  components: {
    PrimaryButton,
  },
  props: {
    macro: {
      type: Object,
      required: true
    },
    rows: {
      type: String,
      default: '4'
    },
    short: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  emits: ['save', 'cancel'],
  data: () => ({
    isValidForm: false,
    Rules,
  }),
  methods:{
    isFormValid() {
      this.isValidForm = this.$refs?.addMacroForm?.isValid;
    },
    changeInputToUpperCase(event) {
      //converts all input into upper case letters
      const input = event.target.value.toUpperCase().replace(/[^A-Z]/g, '');
      this.macro.macroCode = input;
    }
  }
};
</script>
