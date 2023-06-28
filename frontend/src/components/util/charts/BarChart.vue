<template>
  <Bar
    :options="options"
    :data="chartData"
  />
</template>

<script>
import {Bar} from 'vue-chartjs';
// import ChartJsPluginDataLabels from 'chartjs-plugin-datalabels';

export default {
  name: 'BarChart',
  components: {Bar},
  data() {
    return {
      chartData: {
        labels: ['January', 'February', 'March'],
        datasets: [
          {
            label: 'Data One',
            backgroundColor: '#f87979',
            data: [40, 20, 12]
          }
        ]
      },
      options: null
    };
  }
};
</script>
