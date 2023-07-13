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
    :bg-color="hovered || edited || hasEdits(name) ? '#efefef' : undefined"
    :class="classes"
    @keyup.tab="[edited=true, hovered=true]"
    @mouseover="fieldDisabled?hovered=false:hovered=true"
    @mouseout="edited ? hovered=true : hovered= false"
    @click="[edited=true, hovered=true]"
    @focus="[isActive = true, $emit('focus')]"
    @blur="[edited=false,hovered= false, isActive = false, $emit('blur')]"
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
    hasEdits: {
      type: Function,
      required: false,
      default: () => false,
    },
    id: {
      type: String
    },
    name: {
      type: String,
      required: false,
      default: 'nt'
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
      edited: false,
      hovered: false,
      isActive: false
    };
  },
  computed: {
    data: {
      get() {
        if (!this.isActive && (!this.rules || !this.existsAsyncMessages())) {
          return this.format(this.value);
        } else {
          return this.value;
        }
      },
      set(data) {
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
