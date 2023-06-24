<script>
import { Bar } from 'vue-chartjs';
import ChartJsPluginDataLabels from 'chartjs-plugin-datalabels';
export default {
  components: {ChartJsPluginDataLabels},
  extends: Bar,
  props: ['chartData', 'options'],
  mounted () {
    this.addPlugin(ChartJsPluginDataLabels);
    this.renderChart(this.chartdata, this.options);
  }
};
</script>
