<template>
  <div>
    <v-card v-if="chartData && labels" class="mx-auto px-4 pt-4">
      <bar-chart ref='chart' :chartData="data" :options="options" :styles="styles"></bar-chart>
      <v-card-text class="v-card-text--offset pt-0">
        <div class="text-h6 font-weight-light mb-2">
          {{ dataType }}
        </div>
        <v-divider class="my-2"></v-divider>
        <v-icon
          class="mr-2"
          small
        >
          mdi-calculator
        </v-icon>
        <span class="text-caption grey--text font-weight-light">There are {{ average }} {{ dataType.toLowerCase() }} on average</span>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import BarChart from '../../util/charts/BarChart';
export default {
  name: 'BarChartContainer',
  components: {
    BarChart
  },
  props: {
    labels: {
      type: Array,
      required: true
    },
    chartData: {
      type: Array,
      required: true
    },
    dataType: {
      type: String,
      required: true
    },
    heightValue: {
      type: String,
      required: false,
      default: '15rem'
    },
    displayYAxis: {
      type: Boolean,
      required: false,
      default: true
    }
  },
  data: () => ({
    data: null,
    options: {
      maintainAspectRatio: false,
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: true
          },
          gridLines: {
            display: true
          }
        }],
        xAxes: [{
          ticks: {
            beginAtZero: true
          },
          gridLines: {
            display: false
          }
        }]
      },
      legend: {
        display: false,
      },
    },
    styles: {
      height: '15rem',
      position: 'relative'
    },
  }),
  computed: {
    average() {
      return Math.round(this.chartData.reduce((partial_sum, a) => partial_sum + a,0) / this.chartData.length);
    }
  },
  methods: {
    setHeightAndScale() {
      this.styles.height = this.heightValue;
      this.styles.position = 'relative';
      this.options.scales.yAxes[0].ticks.max = Math.max(...this.chartData) + 20;
      this.options.scales.yAxes[0].display = this.displayYAxis;
    }
  },
  mounted() {
    this.data = {
      labels: this.labels,
      datasets: [
        {
          barPercentage: .45,
          backgroundColor: '#f9ca54',
          fill: false,
          borderColor: 'white',
          lineJoin: 'rounded',
          tension: 0,
          pointBackgroundColor: 'white',
          data: this.chartData,
          datalabels: {
            anchor: 'end',
            align: 'end',
            offset: '-5',
            clip: true,
          }
        }
      ]
    };
    this.setHeightAndScale();
  }
};
</script>
