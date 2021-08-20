<template>
  <div>
    <v-textarea
      dense
      outlined
      v-model="macro.macroText"
      :disabled="loading"
      :rules="validateMaxLength()"
      :rows="rows"
    ></v-textarea>
    <v-card-actions class="pt-0">
      <v-spacer></v-spacer>
      <PrimaryButton
        id="cancel-action"
        class="mr-2"
        :short="short"
        secondary
        text="Cancel"
        :disabled="loading"
        @click.native="$emit('cancel')"
      ></PrimaryButton>
      <PrimaryButton
        id="save-action"
        :short="short"
        text="Save"
        :disabled="!isValidForm || loading"
        :loading="loading"
        @click.native="$emit('save', macro)"
      ></PrimaryButton>
    </v-card-actions>
  </div>
</template>

<script>
import PrimaryButton from '../util/PrimaryButton';

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
