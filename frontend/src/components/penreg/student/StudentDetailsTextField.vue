<template>
  <v-row
    no-gutters
    dense
    class="py-1 mb-1"
  >
    <v-col :cols="labelSpan">
      <p class="labelField">
        {{ fieldLabel }}
      </p>
    </v-col>
    <v-col
      :class="{textFieldColumn: ((validationRequired?validationRules().length ===0:true) && asyncMessages.length === 0) }"
      :cols="colspan"
    >
      <v-text-field
        :id="name"
        v-model="fieldModel"
        :tabindex="tabIndex"
        class="onhoverEdit bolder customNoBorder"
        :class="{onhoverPad: !hovered && !hasEdits(name), darkBackgound: (hovered || hasEdits(name))}"
        color="#000000"
        dense
        :disabled="fieldDisabled"
        :maxlength="maxLength"
        :minlength="minLength || 0"
        :readonly="!hovered || !edited"
        :outlined="hovered || edited || hasEdits(name)"
        :rules="validationRequired?validationRules():[]"
        :error-messages="asyncMessages"
        @keyup.tab="[edited=true, hovered=true]"
        @mouseover="fieldDisabled?hovered=false:hovered=true"
        @mouseout="edited ? hovered=true : hovered= false"
        @blur="[edited=false,hovered= false]"
        @click="[edited=true, hovered=true]"
        @keyup="[$emit('changeStudentObjectValue', name, fieldModel, $event),handleOnInput?handleOnInput(name):'']"
      />
    </v-col>
    <v-col
      class="textFieldColumn"
      cols="2"
    >
      <v-text-field
        v-if="hasEdits(name)"
        :id="revertId"
        class="onhoverEdit revert customNoBorder ml-3"
        readonly
        value="Revert"
        dense
        tabindex="-1"
        @click="revertField(name)"
      />
    </v-col>
  </v-row>
</template>

<script>
export default {
  name: 'StudentDetailsTextField',
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
    revertId: {
      type: String,
      required: true
    },
    maxLength: {
      type: String,
      required: true
    },
    tabIndex: {
      type: String,
      required: true
    },
    model: {
      type: String,
      required: true
    },
    hasEdits: {
      type: Function,
      required: true
    },
    revertField: {
      type: Function,
      required: true
    },
    fieldValidationRequired: {
      type: Boolean,
    },
    validationRules: {
      type: Function
    },
    minLength: {
      type: String
    },
    disabled:{
      type:Boolean,
      required:true
    },
    handleOnInput:{
      type: Function
    },
    asyncMessages: {
      type: Array,
      required: false
    }
  },
  data() {
    return {
      edited: false,
      hovered: false,
      fieldModel: null,
      fieldLabel: null,
      validationRequired: false,
      fieldDisabled: false
    };
  },
  watch: {
    model(newValue) {
      this.fieldModel = newValue;
    },
    disabled(newValue){
      this.fieldDisabled = newValue;
    }
  },
  beforeMount() {
    this.fieldModel = this.model;
    this.fieldLabel = this.label;
    this.validationRequired = this.fieldValidationRequired;
    this.fieldDisabled = this.disabled;
  },
};
</script>
