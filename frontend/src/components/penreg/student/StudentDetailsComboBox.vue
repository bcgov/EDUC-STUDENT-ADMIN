<template>
  <div>
    <v-row
      cols="1"
      no-gutters
      class="pt-3"
    >
      <v-col>
        <p class="ma-0">
          {{ fieldLabel }}
        </p>
      </v-col>
    </v-row>
    <v-row
      :cols="colspan"
      no-gutters
    >
      <v-col
        :id="(name==='statusCode' && [STUDENT_CODES.DECEASED,STUDENT_CODES.DELETED].includes(fieldModel))?'chipSelected':''"
        class="sideCardField"
        @mouseover="fieldDisabled?hovering=false:hovering = true"
        @mouseout="editing ? hovering = true : hovering = false"
      >
        <v-select
          :id="name"
          v-model="fieldModel"
          :tabindex="tabIndex"
          class="onhoverEdit bolder mb-0 customNoBorder py-0 my-0"
          :class="{darkBackgound: hovering || hasEdits(name)}"
          :items="items"
          item-title="text"
          item-value="value"
          :style="hovering || editing || hasEdits(name) ? '' : 'margin-top: -12px !important'"
          :bg-color="hovering || editing || hasEdits(name) ? '#efefef' : undefined"
          :variant="hovering || editing || hasEdits(name) ? 'outlined' : 'plain'"
          density="compact"
          :disabled="fieldDisabled"
          :rules="rules"
          @keyup.tab="[editing = true, hovering = true]"
          @update:model-value="[editing = false, hovering = false, $emit('changeStudentObjectValue', name, fieldModel)]"
        >
          <template #selection="{ item }">
            <v-chip
              v-if="name==='statusCode' && [STUDENT_CODES.DECEASED,STUDENT_CODES.DELETED].includes(fieldModel)"
              dark
              color="#003366"
            >
              {{ item.raw.text }}
            </v-chip>
            <div class="bolder"
                 v-else
            >
              {{ item.raw.text }}
            </div>
          </template>
        </v-select>
      </v-col>
    </v-row>
    <v-row>
      <v-col
        class="py-0"
        style="margin-top: -0.5em;"
      >
        <v-text-field
          v-if="hasEdits(name)"
          :id="revertId"
          class="my-0 onhoverEdit revert customNoBorder ml-3"
          readonly
          value="Revert"
          density="compact"
          variant="plain"
          tabindex="-1"
          @click="revertField(name)"
        />
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
      type: Boolean,
      required: true
    },
    rules: {
      type: Array,
      defaultValue: []
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
  watch: {
    model(newValue) {
      this.fieldModel = newValue;
    },
    disabled(newValue) {
      this.fieldDisabled = newValue;
    }
  },
  beforeMount() {
    this.fieldModel = this.model;
    this.fieldLabel = this.label;
    this.fieldDisabled = this.disabled;
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

.revert {
    margin-top: -1em !important;
    color: #1a5a96 !important;
    font-weight: bolder;
}

.revert :deep(input) {
    cursor: pointer;
}
</style>
