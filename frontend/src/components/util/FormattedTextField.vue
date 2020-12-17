<template>
  <v-text-field
    :outlined="outlined"
    :dense="dense"
    :filled="filled"
    :id="id"
    :readonly="readonly"
    :rules="rules"
    :maxlength="maxlength"
    :clearable="clearable"
    :tabindex="tabindex"
    v-model="data"
    @focus="isActive=true"
    @blur="isActive=false">
  </v-text-field>
</template>

<script>

export default {
  name: 'FormattedTextField',
  props: {

    clearable: {
      type: Boolean,
      default: true
    },
    dense: {
      type: Boolean,
      default: true
    },
    filled: {
      type: Boolean,
      default: true
    },
    format: {
      type: Function,
      required: true
    },
    id: {
      type: String
    },
    maxlength: {
      type: String
    },
    outlined: {
      type: Boolean,
      default: true
    },
    readonly: {
      type: Boolean,
      default: false
    },
    rules: {
      type: Array,
    },
    tabindex: {
      type: String
    },
    value: {
      type: String
    }
  },
  data() {
    return {
      isActive: false
    };
  },
  computed: {
    data: {
      get(){
        if(!this.isActive && !this.rules) {
          return this.format(this.value);
        } else {
          return this.value;
        }
      },
      set(data){
        this.$emit('input', data);
      }
    }
  }
};
</script>
