<template>
  <v-tooltip right>
    <template v-slot:activator="{ on }">
      <v-icon small color="#FCBA19" :class="[doubleText ? 'mx-1' : 'ml-2']" v-on="on">
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
    doubleText: {
      type: String,
      default: ''
    },
    validationWarnings: {
      type: Array,
      default: () => []
    },
  },
};
</script>
