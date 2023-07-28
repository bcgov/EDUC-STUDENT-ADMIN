<template>
  <v-row
    no-gutters
    :class="[{'py-1': !breakLine}, 'data-list-item']"
  >
    <br v-if="breakLine">
    <v-col :cols="labelSpan">
      <p class="mb-0">
        {{ label }}
      </p>
    </v-col>
    <v-col
      :id="name"
      :cols="colspan"
    >
      <v-progress-circular
        v-if="loading"
        color="primary"
        indeterminate
        :size="18"
        :width="2"
        class="ml-3"
      />
      <p
        v-else
        class="mb-0"
      >
        {{ value }}
      </p>
    </v-col>
  </v-row>
</template>

<script>
export default {
  name: 'DataListItem',
  props: {
    labelSpan: {
      type: String,
      default: '1',
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
      default: '',
    },
    loading: {
      type: Boolean,
      default: false
    }
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
