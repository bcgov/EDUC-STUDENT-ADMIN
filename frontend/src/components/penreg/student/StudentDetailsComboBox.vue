<template>
  <div>
    <v-row cols="1" no-gutters>
      <v-col>
        <p class="ma-0">{{ this.fieldLabel }}</p>
      </v-col>
    </v-row>
    <v-row :cols="colspan" no-gutters>
      <v-col :id="(name==='statusCode' && [STUDENT_CODES.DECEASED,STUDENT_CODES.DELETED].includes(fieldModel))?'chipSelected':''"
             v-on:mouseover="fieldDisabled?hovering=false:hovering = true" class="sideCardField"
             v-on:mouseout="editing ? hovering = true : hovering = false">
        <v-select
            :id="name"
            :tabindex="tabIndex"
            v-on:keyup.tab="[editing = true, hovering = true]"
            v-on:change="[editing = false, hovering = false, $emit('changeStudentObjectValue', name, fieldModel), name==='statusCode' ? deceasedDialog() : '' ]"
            class="onhoverEdit bolder mb-0 customNoBorder py-0 my-0"
            :class="{darkBackgound: hovering || hasEdits(name)}"
            color="#FFFFFF"
            v-model="fieldModel"
            :items="items"
            :outlined="hovering || editing || hasEdits(name)"
            dense
            type="solo"
            :disabled="fieldDisabled"

        ><template #selection="{ item }">
          <v-chip v-if="name==='statusCode' && [STUDENT_CODES.DECEASED,STUDENT_CODES.DELETED].includes(fieldModel)" small dark color="#003366">{{ item.text }}</v-chip>
          <div v-else>{{ item.text }}</div>
        </template></v-select>
      </v-col>
    </v-row>
    <v-row>
      <v-col class="py-0" style="margin-top: -0.5em;">
        <v-text-field
            :id="revertId"
            v-on:click="revertField(name)"
            class="my-0 onhoverEdit revert customNoBorder ml-3"
            readonly
            v-if="hasEdits(name)"
            value="Revert"
            dense
            tabindex="-1"
        ></v-text-field>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import {STUDENT_CODES} from '@/utils/constants';

export default {
  name: 'StudentDetailsComboBox',
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
    items: {
      type: Array,
      required: true
    },
    deceasedDialog: {
      type: Function
    },
    disabled: {
      type:Boolean,
      required: true
    }
  },
  data() {
    return {
      editing: false,
      hovering: false,
      fieldModel: null,
      fieldLabel: null,
      fieldDisabled: false,
      STUDENT_CODES: STUDENT_CODES
    };
  },
  beforeMount() {
    this.fieldModel = this.model;
    this.fieldLabel = this.label;
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

<style scoped>
  #chipSelected /deep/ i {
    display: none !important;
  }
  #chipSelected:hover /deep/ i {
    display: inline !important;
  }
</style>
