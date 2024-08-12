<template>
  <v-row>
    <v-col cols="4">
      <v-select
        id="reportListDropdown"
        v-model="selectedReport"
        class="pt-0"
        label="Select Report"
        variant="underlined"
        :items="reportList"
        item-title="label"
        item-value="reportID"
      />
    </v-col>
  </v-row>
</template>

<script>

export default {
  name: 'ReportSection',
  components: {

  },
  props: {
    reportList: {
      required: true,
      type: Array,
      default: null
    },
  },
  emits: [],
  data() {
    return {
      selectedReport: null
    };
  },
};
</script>

<style scoped>

</style>
