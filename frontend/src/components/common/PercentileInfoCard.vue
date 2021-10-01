<template>
  <v-card
    class="mx-auto"
  >
    <v-list-item class="ml-auto text-right" two-line>
      <v-list-item-avatar
        rounded
        size="80"
        color="cyan"
        class="v-sheet--offset my-0"
      >
        <v-icon color="white" large>{{ icon }}</v-icon>
      </v-list-item-avatar>
      <v-list-item-content>
        <v-list-item-subtitle>{{ subTitle }}</v-list-item-subtitle>
        <v-list-item-title class="text-h5 mb-1">
          {{ title }}
        </v-list-item-title>
      </v-list-item-content>
    </v-list-item>
    <v-card-text class="pt-0">
      <v-divider class="mb-2"></v-divider>
      <v-icon v-if="percentile>0"
              class="mr-2"
              small
              color="green"
      >
        mdi-arrow-up
      </v-icon>
      <v-icon v-else-if="percentile<0"
              class="mr-2"
              small
              color="red"
      >
        mdi-arrow-down
      </v-icon>
      <span class="text-caption grey--text font-weight-light">
        <span v-if="percentile>0" class="green--text">{{ percentile.toString().replace('-', '') }}% increase in this month.</span>
        <span v-else-if="percentile<0" class="red--text">{{ percentile.toString().replace('-', '') }}% decrease in this month.</span>
        <span v-else-if="percentile === 0" class="blue--text">same as previous month.</span>
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

</style>
