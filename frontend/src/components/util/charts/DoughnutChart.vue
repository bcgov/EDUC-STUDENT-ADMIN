<script>
import { Doughnut, mixins } from 'vue-chartjs';
import ChartJsPluginDataLabels from 'chartjs-plugin-datalabels';
export default {
  extends: Doughnut,
  mixins: [mixins.reactiveProp],
  props: ['chartData', 'options'],
  components: {ChartJsPluginDataLabels},
  mounted () {
    this.addPlugin(ChartJsPluginDataLabels);
    this.renderChart(this.chartdata, this.options);
  }
};
</script>
