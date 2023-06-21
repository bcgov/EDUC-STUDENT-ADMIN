<script>
import { Doughnut } from 'vue-chartjs';
import ChartJsPluginDataLabels from 'chartjs-plugin-datalabels';
export default {
  extends: Doughnut,
  props: ['chartData', 'options'],
  components: {ChartJsPluginDataLabels},
  mounted () {
    this.addPlugin(ChartJsPluginDataLabels);
    this.renderChart(this.chartdata, this.options);
  }
};
</script>
