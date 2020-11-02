<template>
  <v-row no-gutters class="py-1">
    <v-col cols="2">
      <p class="labelField">{{ this.fieldLabel }}</p>
    </v-col>
    <v-col class="textFieldColumn" :cols="colspan">
      <v-text-field
          :value="fieldModel"
          class="onhoverEdit bolder customNoBorder onhoverPad"
          :id="name"
          color="#000000"
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
      fieldDisabled: false
    };
  },
  beforeMount() {
    this.fieldModel = this.model;
    this.fieldLabel = this.label;
    this.gradeLevelCode = this.gradeLevel;
    this.fieldDisabled = this.disabled;
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
    }
  },
};
</script>
