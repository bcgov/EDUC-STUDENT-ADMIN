<template>
  <div>Marco</div>
  <Doughnut
    :data="chartData"
  />
</template>

<script>
import {Doughnut} from 'vue-chartjs';

export default {
  name: 'DoughnutChart',
  components: {Doughnut},
  props: ['chartData', 'options']
};

</script>
