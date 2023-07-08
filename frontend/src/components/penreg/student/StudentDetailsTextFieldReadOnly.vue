<template>
  <v-row
    no-gutters
    class="py-2"
  >
    <v-col :cols="labelSpan">
      <p :class="['labelField', highlighted && !fieldModel? 'diff-value' : 'plain-value']">
        {{ fieldLabel }}
      </p>
    </v-col>
    <v-col
      class="textFieldColumn"
      :cols="colspan"
    >
      <v-text-field
        v-if="displayValue"
        :id="name"
        :value="fieldModel"
        style="margin-top: -12px; font-weight: bold"
        :class="['onhoverEdit', 'customNoBorder', 'onhoverPad', highlighted? 'diff-value' : 'plain-value']"
        density="compact"
        variant="plain"
        readonly
        :disabled="fieldDisabled"
      />
    </v-col>
    <slot />
  </v-row>
</template>

<script>
export default {
  name: 'StudentDetailsTextFieldReadOnly',
  props: {
    labelSpan: {
      type: String,
      default: '2',
    },
    colspan: {
      type: String,
      required: true
    },
    label: {
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
    gradeLevel: {
      type: String
    },
    highlight: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      required: true
    },
    displayValue: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      fieldModel: null,
      fieldLabel: null,
      gradeLevelCode: null,
      fieldDisabled: false,
      highlighted: false
    };
  },
  watch: {
    model(newValue) {
      this.fieldModel = newValue;
    },
    gradeLevel(newValue) {
      this.gradeLevelCode = newValue;
    },
    disabled(newValue){
      this.fieldDisabled = newValue;
    },
    highlight(newValue){
      this.highlighted = newValue;
    }
  },
  beforeMount() {
    this.fieldModel = this.model;
    this.fieldLabel = this.label;
    this.gradeLevelCode = this.gradeLevel;
    this.fieldDisabled = this.disabled;
    this.highlighted = this.highlight;
  },
};
</script>

<style scoped>

.plain-value >>> .v-text-field__slot input {
  font-weight: bold;
  color: #000000 !important;
}

.diff-value >>> .v-text-field__slot input {
  font-weight: bold;
  color: #008000 !important;
}

.diff-value {
  font-weight: bold;
  color: #008000 !important;
}

.labelField {
  display: table-cell;
  height: 1em;
  padding-top: 8px !important;
}

</style>
