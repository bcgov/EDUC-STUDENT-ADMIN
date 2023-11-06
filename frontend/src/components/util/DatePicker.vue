<script>
import {defineComponent} from 'vue';
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';

export default defineComponent({
  name: 'DatePicker',
  components: {VueDatePicker},
  props: {
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
    format="yyyy/MM/dd"
    preview-format="yyyy/MM/dd"
    :text-input="{
      enterSubmit: true,
      tabSubmit: true,
      openMenu: true,
      format: 'yyyy/MM/dd'
    }"
    :clearable="false"
    :min-date="minDate"
    :max-date="maxDate"
    @update:model-value="saveDate"
    teleport
    auto-apply
    position="center"
  >
    <template #dp-input="{ value, onInput, onEnter, onTab }">
      <v-text-field
        type="text"
        :model-value="value"
        :rules="rules"
        prepend-inner-icon="mdi-calendar"
        :label="label"
        variant="underlined"
        placeholder="yyyy/mm/dd"
        :clearable="true"
        hide-details="auto"
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
</style>
