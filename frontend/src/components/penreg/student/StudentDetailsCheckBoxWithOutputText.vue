<template>
  <v-row no-gutters>
    <v-col :cols="checkBoxSpan">
      <v-checkbox
        v-model="checkedFieldModel"
        :disabled="!fieldModel || disabled"
        style="margin-top: -0.6em"
        dense
        color="#606060"
        @update:model-value="handleOnChange"
      />
    </v-col>
    <v-col
      class="textFieldColumn"
      :cols="colspan"
    >
      <v-text-field
        v-if="!isTextArea"
        :id="name"
        style="margin-top: -0.55em"
        :disabled="!fieldModel || disabled"
        :value="fieldModel"
        :class="['onhoverEdit', 'customNoBorder', 'onhoverPad']"
        density="compact"
        variant="plain"
        readonly
      />
      <v-textarea
        v-if="isTextArea"
        :id="name"
        :disabled="!fieldModel || disabled"
        :value="fieldModel"
        style="margin-top: -0.55em"
        :class="['onhoverEdit', 'customNoBorder', 'onhoverPad']"
        color="#000000"
        maxlength="4000"
        density="compact"
        variant="plain"
        readonly
        rows="3"
        no-resize
      />
    </v-col>
  </v-row>
</template>

<script>
import {STUDENT_MERGE_FIELD_PREFIX} from '@/utils/constants';

export default {
  name: 'StudentDetailsCheckBoxWithOutputText',
  props: {
    checkBoxSpan: {
      type: String,
      default: '1',
    },
    colspan: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    model: {
      type: String,
      required: true
    },
    checked: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    isTextArea: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      fieldModel: null,
      checkedFieldModel: false,
      fieldDisabled: false,
      STUDENT_MERGE_FIELD_PREFIX
    };
  },
  watch: {
    model(newValue) {
      this.fieldModel = newValue;
    },
    checked(newValue) {
      this.checkedFieldModel = newValue;
    },
  },
  beforeMount() {
    this.fieldModel = this.model;
    this.checkedFieldModel = this.checked;
    this.fieldDisabled = this.disabled;
  },
  methods: {
    handleOnChange(checked) {
      // string replacement because MergeStudentCommon would have warning for having same id
      // same id was used because of merge to and merge from needed the id to carry over the value when checkbox checked
      // added extra prefix to bypass the warning, but still need to replace it onChange so the value would carry over
      // even though this component is not used from anywhere yet, in case for any component reuse, please consider the code below
      const key = this.name.includes(STUDENT_MERGE_FIELD_PREFIX) ? this.name.replace(STUDENT_MERGE_FIELD_PREFIX, '') : this.name;

      this.$emit('update', { key, value: checked});
    }
  }
};
</script>

<style scoped>

.textFieldColumn {
  padding-top: 2px;
}

</style>
