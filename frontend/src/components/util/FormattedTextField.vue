<template>
  <v-text-field
    :id="id"
    v-model="data"
    :disabled="disabled"
    :variant="outlined ? 'outlined' : 'plain'"
    :density="dense ? 'compact' : undefined"
    :filled="filled"
    :readonly="readonly"
    :rules="rules"
    :maxlength="maxlength"
    :clearable="clearable"
    :tabindex="tabindex"
    :error-messages="asyncMessages"
    :label="label"
    :class="classes"
    @focus="[isActive = true, $emit('focus')]"
    @blur="[isActive = false, $emit('blur')]"
  />
</template>

<script>

export default {
  name: 'FormattedTextField',
  props: {
    classes: {
      type: Array
    },
    disabled: {
      type: Boolean,
      default: false
    },
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
    },
    asyncMessages: {
      type: Array
    },
    label: {
      type: String,
      default: undefined
    },
  },
  data() {
    return {
      isActive: false
    };
  },
  computed: {
    data: {
      get(){
        if(!this.isActive && (!this.rules || !this.existsAsyncMessages())) {
          return this.format(this.value);
        } else {
          return this.value;
        }
      },
      set(data){
        this.$emit('input', data);
      }
    }
  },
  methods: {
    existsAsyncMessages() {
      return this.asyncMessages && this.asyncMessages.length > 0;
    },
  }
};
</script>
