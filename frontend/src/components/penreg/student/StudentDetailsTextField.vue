<template>
  <v-row no-gutters class="py-1">
    <v-col cols="2">
      <p class="labelField">{{ this.fieldLabel }}</p>
    </v-col>
    <v-col :class="{textFieldColumn: validationRequired?validationRules().length ===0:true}" :cols="colspan">
      <v-text-field
          :tabindex="tabIndex"
          v-on:keyup.tab="[edited=true, hovered=true]"
          v-on:mouseover="fieldDisabled?hovered=false:hovered=true"
          v-on:mouseout="edited ? hovered=true : hovered= false"
          v-on:blur="[edited=false,hovered= false]"
          v-on:click="[edited=true, hovered=true]"
          v-model="fieldModel"
          @keyup="[$emit('changeStudentObjectValue', name, fieldModel),handleOnInput?handleOnInput(name):'']"
          class="onhoverEdit bolder customNoBorder"
          :class="{onhoverPad: !hovered && !hasEdits(name), darkBackgound:  (hovered || hasEdits(name))}"
          :id="name"
          color="#000000"
          dense
          :disabled="fieldDisabled"
          :maxlength="maxLength"
          :minlength="minLength || 0"
          :readonly="!hovered || !edited"
          :outlined="hovered || edited || hasEdits(name)"
          :rules="validationRequired?validationRules():[]"
      ></v-text-field>
    </v-col>
    <v-col class="textFieldColumn" cols="2">
      <v-text-field
          :id='revertId'
          v-on:click="revertField(name)"
          class="onhoverEdit revert customNoBorder ml-3"
          readonly
          v-if="hasEdits(name)"
          value="Revert"
          dense
          tabindex="-1"
      ></v-text-field>
    </v-col>
  </v-row>
</template>

<script>
export default {
  name: 'StudentDetailsTextField',
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
  beforeMount() {
    this.fieldModel = this.model;
    this.fieldLabel = this.label;
    this.validationRequired = this.fieldValidationRequired;
    this.fieldDisabled = this.disabled;
  },
  watch: {
    model(newValue) {
      this.fieldModel = newValue;
    },
    disabled(newValue){
      this.fieldDisabled = newValue;
    }
  },
};
</script>
