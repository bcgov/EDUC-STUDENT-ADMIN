<script>
import { Bar } from 'vue-chartjs';
import ChartJsPluginDataLabels from 'chartjs-plugin-datalabels';
export default {
  extends: Bar,
  props: ['chartData', 'options'],
  components: {ChartJsPluginDataLabels},
  mounted () {
    this.addPlugin(ChartJsPluginDataLabels);
    this.renderChart(this.chartdata, this.options);
  }
};
</script>
