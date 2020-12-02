<template>
  <v-row no-gutters class="py-1">
    <v-col :cols="labelSpan">
      <p :class="['labelField', highlighted && !fieldModel? 'diff-value' : 'plain-value']">{{ this.fieldLabel }}</p>
    </v-col>
    <v-col class="textFieldColumn" :cols="colspan">
      <v-text-field
          :value="fieldModel"
          :class="['onhoverEdit', 'customNoBorder', 'onhoverPad', highlighted? 'diff-value' : 'plain-value']"
          :id="name"
          dense
          readonly
          :disabled="fieldDisabled"
      ></v-text-field>
    </v-col>
    <v-col v-if="name==='gradeCode'" cols="3" class="textFieldColumn gradeLabelColumn">
      <v-text-field v-if="name==='gradeCode'"
                    class="onhoverEdit customNoBorder onhoverPad"
                    :value="gradeLevelCode"
                    id='gradeLabel'
                    color="#000000"
                    dense
                    readonly
                    tabindex="-1"
                    :disabled="fieldDisabled"
      ></v-text-field>
    </v-col>
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
  beforeMount() {
    this.fieldModel = this.model;
    this.fieldLabel = this.label;
    this.gradeLevelCode = this.gradeLevel;
    this.fieldDisabled = this.disabled;
    this.highlighted = this.highlight;
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

p.diff-value {
  font-weight: bold;
  color: #008000 !important;
}

</style>
