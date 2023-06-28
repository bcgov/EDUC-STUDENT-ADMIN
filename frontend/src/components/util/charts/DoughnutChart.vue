<template>
  <div>Marco</div>
  <Doughnut
    :data="chartData"
  />
</template>

<script>
import {Doughnut} from 'vue-chartjs';
// import ChartJsPluginDataLabels from 'chartjs-plugin-datalabels';

export default {
  name: 'DoughnutChart',
  components: {Doughnut},
  props: ['chartData', 'options']
};

</script>
