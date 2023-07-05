<template>
  <div>
    <v-textarea
      v-model="macro.macroText"
      density="compact"
      variant="outlined"
      :disabled="loading || disabled"
      :rules="validateMaxLength()"
      :rows="rows"
    />
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
        :disabled="!isValidForm || loading || disabled"
        :loading="loading"
        @click-action="$emit('save', macro)"
      />
    </v-card-actions>
  </div>
</template>

<script>
import PrimaryButton from '../util/PrimaryButton.vue';

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
  methods:{
    validateMaxLength(){
      if(!this.macro?.macroText){
        this.isValidForm = false;
        return ['Macro Text is required.'];
      }else if(this.macro?.macroText?.length > 4000){
        this.isValidForm = false;
        return ['Macro Text, maximum 4000 characters allowed.'];
      }
      this.isValidForm = true;
      return [];
    }
  }
};
</script>
