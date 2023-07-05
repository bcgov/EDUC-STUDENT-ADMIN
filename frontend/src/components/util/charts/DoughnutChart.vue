<template>
  <div>
    <Doughnut
      :data="chartData"
      :options="options"
    />
  </div>
</template>

<script>
import {Doughnut} from 'vue-chartjs';

export default {
  name: 'DoughnutChart',
  components: {Doughnut},
  props: {
    chartData: {
      type: Object,
      required: true
    },
    options: {
      type: Object,
      required: true
    },
  },
};

</script>
