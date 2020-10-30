<template>
  <div>
    <v-row cols="1" no-gutters>
      <v-col>
        <p class="ma-0">{{ this.fieldLabel }}</p>
      </v-col>
    </v-row>
    <v-row :cols="colspan" no-gutters>
      <v-col class="sideCardField">
        <v-text-field
            :id='name'
            class="onhoverEdit bolder mb-0 customNoBorder py-0 my-0"
            color="#000000"
            :value="fieldModel"
            readonly
            dense
            tabindex="-1"
            :disabled="fieldDisabled"
        ></v-text-field>
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
      type: String,
      required: true
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
      fieldDisabled: false
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
