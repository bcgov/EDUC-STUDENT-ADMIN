<script>
//../src/Chart.js
import { Bar, mixins } from 'vue-chartjs';
import ChartJsPluginDataLabels from 'chartjs-plugin-datalabels';
export default {
  extends: Bar,
  mixins: [mixins.reactiveProp],
  props: ['chartData', 'options'],
  components: {ChartJsPluginDataLabels},
  mounted () {
    this.addPlugin(ChartJsPluginDataLabels);
    // Overwriting base render method with actual data.
    this.renderChart(this.chartdata, this.options);
  }
};
</script>
