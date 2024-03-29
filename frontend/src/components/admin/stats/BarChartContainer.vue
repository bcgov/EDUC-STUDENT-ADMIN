<template>
  <div style="height: 100%">
    <v-card
      v-if="chartData && labels"
      class="mx-auto px-4 pt-4"
      height="100%"
    >
      <bar-chart
        ref="chart"
        :chart-data="data"
        :options="options"
        :styles="styles"
      />
      <v-card-text class="v-card-text--offset pt-0">
        <div class="text-h6 font-weight-light mb-2">
          {{ title }}
        </div>
        <v-divider class="my-2" />
        <v-icon
          class="mr-2"
          small
        >
          mdi-calculator
        </v-icon>
        <span class="text-caption grey--text font-weight-light">{{ description }}</span>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import BarChart from '../../util/charts/BarChart.vue';

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
      default: ''
    },
    title: {
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
    },
    annualTotal: {
      type: Boolean,
      default: false
    }
  },
  data: () => ({
    data: null,
    options: {
      plugins: {
        legend: {
          display: false
        }
      },
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            max: 1
          },
          gridLines: {
            display: true
          }
        },
        x: {
          beginAtZero: true,
          ticks: {
            max: 1
          },
          gridLines: {
            display: false
          }
        }
      },
    },
    styles: {
      height: '15rem',
      position: 'relative'
    },
  }),
  computed: {
    average() {
      return Math.round(this.chartData.reduce((partial_sum, a) => partial_sum + a, 0) / this.chartData.length);
    },
    total() {
      return this.chartData.slice(-12).reduce((partial_sum, a) => partial_sum + a, 0);
    },
    description() {
      let desc = `There are ${this.average} ${this.title.toLowerCase()} on average`;
      if (this.annualTotal) {
        desc += ` and a total of ${this.total} ${this.dataType.toLowerCase()} in the last 12 months`;
      }
      return desc;
    }
  },
  created() {
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
  },
  methods: {
    setHeightAndScale() {
      this.styles.height = this.heightValue;
      this.styles.position = 'relative';
      let max = Math.max(...this.chartData);
      this.options.scales.y.ticks.max = max + (max * 0.2);
      this.options.scales.y.display = this.displayYAxis;
    }
  }
};
</script>
