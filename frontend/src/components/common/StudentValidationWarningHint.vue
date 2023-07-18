<template>
  <v-tooltip right>
    <template #activator="{ props }">
      <v-icon
        v-bind="props"
        icon="mdi-alert-circle"
        color="#FCBA19"
        class="mt-n1"
        :class="[hasDoubleText ? 'mx-1' : 'ml-2']"
      >
      </v-icon>
    </template>
    <span
      v-for="warning in validationWarnings"
      :key="warning.description"
    >
      {{ warning.description }} <br>
    </span>
  </v-tooltip>
</template>

<script>
export default {
  name: 'StudentValidationWarningHint',
  props: {
    hasDoubleText: {
      type: Boolean,
      default: false
    },
    validationWarnings: {
      type: Array,
      default: () => []
    },
  },
};
</script>
