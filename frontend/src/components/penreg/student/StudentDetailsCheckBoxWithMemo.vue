<template>
  <v-row no-gutters class="py-1">
    <v-col :cols="checkBoxSpan">
      <v-checkbox
          :disabled="!fieldModel || disabled"
          class="mt-n1"
          dense
          color="#606060"
          v-model="checkedFieldModel"
          @change="handleOnChange"
      ></v-checkbox>
    </v-col>
    <v-col class="textFieldColumn" :cols="colspan">
      <v-textarea
          :disabled="!fieldModel || disabled"
          :value="fieldModel"
          :id="name"
          :class="['onhoverEdit', 'customNoBorder', 'onhoverPad']"
          color="#000000"
          maxlength="4000"
          dense
          readonly
          rows="3"
          no-resize
      ></v-textarea>
    </v-col>
  </v-row>
</template>

<script>
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
    }
  },
  data() {
    return {
      fieldModel: null,
      checkedFieldModel: false,
      fieldDisabled: false,
    };
  },
  beforeMount() {
    this.fieldModel = this.model;
    this.checkedFieldModel = this.checked;
    this.fieldDisabled = this.disabled;
  },
  watch: {
    model(newValue) {
      this.fieldModel = newValue;
    },
    checked(newValue) {
      this.checkedFieldModel = newValue;
    },
    gradeLevel(newValue) {
      this.gradeLevelCode = newValue;
    },
  },
  methods: {
    handleOnChange(checked) {
      if (checked) {
        this.$emit('update', { key: this.name, value: this.fieldModel});
      }
    }
  }
};
</script>

<style scoped>


</style>
