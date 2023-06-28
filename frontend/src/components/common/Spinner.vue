<template>
  <v-card
    :flat="flat"
    class="mx-auto pa-4"
  >
    <v-row
      align="center"
      justify="center"
      style="min-height: 12em;"
    >
      <v-progress-circular
        :size="70"
        :width="7"
        color="primary"
        indeterminate
      />
    </v-row>
  </v-card>
</template>

<script>
export default {
  name: 'Spinner',
  props: {
    flat: {
      type: Boolean,
      default: false
    },
  }
};
</script>

<style scoped>

</style>
