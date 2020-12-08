<template>
  <v-tooltip right>
    <template v-slot:activator="{ on }">
      <v-icon small color="#FCBA19" :class="[hasDoubleText ? 'mx-1' : 'ml-2']" v-on="on">
        fa-exclamation-circle
      </v-icon>
    </template>
    <span v-for="warning in validationWarnings" :key="warning.penRequestBatchValidationIssueTypeCode">
      {{warning.penRequestBatchValidationIssueTypeCode}} <br/>
    </span>
  </v-tooltip>
</template>

<script>
export default {
  name: 'studentValidationWarningHint',
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
