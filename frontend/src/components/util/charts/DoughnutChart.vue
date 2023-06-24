<script>
import { Doughnut } from 'vue-chartjs';
import ChartJsPluginDataLabels from 'chartjs-plugin-datalabels';
export default {
  components: {ChartJsPluginDataLabels},
  extends: Doughnut,
  props: ['chartData', 'options'],
  mounted () {
    this.addPlugin(ChartJsPluginDataLabels);
    this.renderChart(this.chartdata, this.options);
  }
};
</script>
