<script>
import {defineComponent} from 'vue';
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';

export default defineComponent({
  name: 'DatePicker',
  components: {VueDatePicker},
  props: {
    disabled: {
      type: Boolean,
      required: false,
      default: false
    },
    modelValue: {
      type: String,
      default: null
    },
    label: {
      type: String,
      default: null
    },
    rules: {
      type: Array,
      default: ()=>[]
    },
    maxDate: {
      type: String,
      default: null
    },
    minDate: {
      type: String,
      default: null
    },
    modelType: {
      type: String,
      required: true
    },
    allowTeleport: {
      type: Boolean,
      required: false,
      default: false
    },
    readonly: {
      type: Boolean,
      default: false
    },
    variant: {
      type: String,
      default: 'underlined'
    },
    density: {
      type: String,
      default: 'default'
    }
  },
  emits: ['update:model-value', 'clearDate'],
  methods: {
    saveDate(newDate) {
      this.$emit('update:model-value', newDate);
    }
  }
});
</script>

<template>
  <VueDatePicker
    :model-value="modelValue"
    :enable-time-picker="false"
    :model-type="modelType"
    :menu-class-name="allowTeleport ? 'teleport-datepicker' : ''"
    format="yyyy/MM/dd"
    preview-format="yyyy/MM/dd"
    :disabled="disabled"
    :text-input="{
      enterSubmit: true,
      tabSubmit: true,
      openMenu: true,
      format: 'yyyy/MM/dd'
    }"
    :clearable="false"
    :min-date="minDate"
    :max-date="maxDate"
    position="left"
    :teleport="allowTeleport ? '.v-overlay-container' : false"
    auto-apply
    :readonly="readonly"
    @update:model-value="saveDate"
  >
    <template #dp-input="{ value, onInput, onEnter, onTab }">
      <v-text-field
        type="text"
        :model-value="value"
        :rules="rules"
        prepend-inner-icon="mdi-calendar"
        :label="label"
        :variant="variant"
        :density="density"
        placeholder="yyyy/mm/dd"
        :clearable="!readonly"
        :readonly="readonly"
        hide-details="auto"
        :disabled="disabled"
        @input="onInput"
        @keydown.enter.prevent="onEnter"
        @keydown.tab.prevent="onTab"
        @click:clear="$emit('clearDate')"
      />
    </template>
  </VueDatePicker>
</template>
<style scoped>
:deep(.dp__input_wrap) {
  position: relative;
  width: 100%;
  box-sizing: border-box;
}
.dp__action_row .dp__action_buttons .dp__action_select {
  color: var(--dp-primary-text-color);
}
</style>
<style>
.teleport-datepicker {
  pointer-events: auto;
  position: fixed;
}
</style>
