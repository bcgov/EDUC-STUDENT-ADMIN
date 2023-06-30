<template>
  <v-card
    class="mx-auto"
    min-height="100%"
  >
    <v-list-item
      class="ml-auto text-right"
      two-line
    >
      <v-list-item-subtitle class="mt-2 mb-2">{{ subTitle }}</v-list-item-subtitle>
      <v-list-item-title class="text-h5 mb-1">
        {{ title }}
      </v-list-item-title>
    </v-list-item>

    <v-card-text class="pt-0">
      <v-divider class="mb-2" />
      <v-icon
        v-if="percentile>0"
        class="mr-2"
        small
        color="green"
      >
        mdi-arrow-up
      </v-icon>
      <v-icon
        v-else-if="percentile<0"
        class="mr-2"
        small
        color="red"
      >
        mdi-arrow-down
      </v-icon>
      <span class="text-caption grey--text font-weight-light">
        <span
          v-if="percentile>0"
          class="green--text"
        >{{ Math.round(percentile.toString().replace('-', '')) }}% increase in last 30 days.</span>
        <span
          v-else-if="percentile<0"
          class="red--text"
        >{{ Math.round(percentile.toString().replace('-', '')) }}% decrease in last 30 days.</span>
        <span
          v-else-if="percentile === 0"
          style="color: #039BE5"
        >Same in last 30 days.</span>
      </span>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: 'PercentileInfoCard',
  props: {
    icon: {
      type: String,
      required: true,
    },
    subTitle: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    percentile: {
      type: Number,
      required: true,
    }
  }
};
</script>


<style scoped>
.v-sheet–offset {
    top: -18px;
    position: relative;
}
</style>
