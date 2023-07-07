<template>
  <div>
    <v-row
      cols="1"
      no-gutters
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
      <v-col class="sideCardField">
        <v-progress-circular
          v-if="loading"
          color="primary"
          indeterminate
          class="ml-3"
        />
        <v-text-field
          v-else-if="!multiLine"
          :id="name"
          class="onhoverEdit bolder mb-0 customNoBorder py-0 my-0"
          color="#000000"
          :value="fieldModel"
          readonly
          variant="outlined"
          density="compact"
          tabindex="-1"
          :disabled="fieldDisabled"
        />
        <span
          v-for="v in fieldModel"
          v-else
          :key="v"
          class="bolder"
        >
          {{ v }} <br>
        </span>
      </v-col>
    </v-row>
  </div>
</template>

<script>
export default {
  name: 'StudentDetailsTextFieldSideCardReadOnly',
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
      type: [Array, String],
      required: true
    },
    disabled: {
      type: Boolean,
      required: true
    },
    multiLine: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      fieldModel: null,
      fieldLabel: null,
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
    this.fieldDisabled = this.disabled;
  },
};
</script>
