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
      default: 'format'
    }
  },
  emits: ['update:modelValue', 'clearDate'],
  methods: {
    saveDate(newDate) {
      this.$emit('update:modelValue', newDate);
    }
  }
});
</script>

<template>
  <VueDatePicker
    class="v-input--horizontal"
    :model-value="modelValue"
    :enable-time-picker="false"
    :model-type="modelType"
    format="yyyy-MM-dd"
    preview-format="yyyy-MM-dd"
    :text-input="{
      enterSubmit: true,
      tabSubmit: true,
      openMenu: true,
      format: 'yyyy-MM-dd'
    }"
    :clearable="false"
    :min-date="minDate"
    :max-date="maxDate"
    :teleport="true"
    @update:model-value="saveDate"
  >
    <template #dp-input="{ value, onInput, onEnter, onTab }">
      <v-text-field
        type="text"
        :model-value="value"
        :rules="rules"
        prepend-inner-icon="mdi-calendar"
        :label="label"
        density="compact"
        variant="underlined"
        placeholder="yyyy-mm-dd"
        :persistent-placeholder="true"
        :clearable="true"
        @input="onInput"
        @keydown.enter.prevent="onEnter"
        @keydown.tab.prevent="onTab"
        @click:clear="$emit('clearDate')"
      />
    </template>
  </VueDatePicker>
</template>

<style scoped>
.dp__main{
  font-family: inherit;
  user-select: auto;
  box-sizing: border-box;
  position: relative;
  width: 100%;
}

.v-input--density-compact{
  --v-input-chips-margin-bottom: 0;
}
</style>
