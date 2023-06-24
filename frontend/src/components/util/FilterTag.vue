<template>
  <v-chip
    :id="id"
    class="filter-chip"
    label
    close
    close-icon="fa-times"
    @click:close="close(item)"
  >
    <span>{{ text }}</span>
  </v-chip>
</template>

<script>
export default {
  name: 'FilterTag',
  props: {
    id: {
      type: String,
      required: true
    },
    text: {
      type: String
    },
    close: {
      type: Function
    },
    item: [String, Number]
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .filter-chip {
    border: thin solid rgba(0, 0, 0, 0.12);
    background-color: white !important;
    color: #38598a;
  }
  .filter-chip:hover {
    background-color: #38598a !important;
    color: white;
  }
  .filter-chip /deep/ .v-icon {
    color: #38598a !important;
  }
  .filter-chip:hover /deep/ .v-icon {
    color: white !important;
  }
</style>
