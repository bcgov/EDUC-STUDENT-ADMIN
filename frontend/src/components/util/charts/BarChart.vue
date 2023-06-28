<template>
  <div>
    <Bar
      :options="options"
      :data="chartData"
    />
  </div>
</template>

<script>
import {Bar} from 'vue-chartjs';
import {CategoryScale} from 'chart.js';
import Chart from 'chart.js/auto';

Chart.register(CategoryScale);

export default {
  name: 'BarChart',
  components: {Bar},
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
