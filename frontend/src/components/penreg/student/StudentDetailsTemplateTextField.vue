<template>
  <v-row
    no-gutters
    class="py-1"
  >
    <v-col cols="2">
      <p class="labelField">
        {{ label }}
      </p>
    </v-col>
    <v-col :cols="colspan">
      <div class="bolder onhoverPad textField">
        <div :class="{'fieldText': true, 'disabled': disabled}">
          <slot />
        </div>
      </div>
    </v-col>
  </v-row>
</template>

<script>
export default {
  name: 'StudentDetailsTemplateTextField',
  props: {
    colspan: {
      type: String,
      required: true
    },
    label: {
      type: String,
      required: true
    },
    disabled: {
      type: Boolean,
      required: true
    }
  },
};
</script>

<style>
.textField {
  margin-top: 4px;
  margin-bottom: 0;
}

.fieldText {
  padding: 4px 0 2px;
  margin: 0;
}

.disabled {
  color: rgba(0, 0, 0, 0.38);
}
</style>
