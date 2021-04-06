<template>
  <v-row no-gutters :class="[{'py-1': !breakLine}, 'data-list-item']">
    <br v-if="breakLine" />
    <template>
      <v-col :cols="labelSpan">
        <p class="mb-0">{{ this.label }}</p>
      </v-col>
      <v-col :cols="colspan" :id="name">
        <p class="mb-0">{{ this.value }}</p>
      </v-col>
    </template>
  </v-row>
</template>

<script>
export default {
  name: 'DataListItem',
  props: {
    labelSpan: {
      type: String,
      default: '3',
    },
    colspan: {
      type: String,
      default: '9',
    },
    label: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    value: {
      type: String,
      required: true
    },
  },
  computed: {
    breakLine() {
      return this.name === 'breakLine';
    }
  }
};
</script>

<style scoped>
  .data-list-item {
    font-size: 0.875rem;
  }
</style>
