<template>
  <v-card class="mx-auto pa-4">
    <v-row align="center" justify="center" style="min-height: 12em;">
      <v-progress-circular
        :size="70"
        :width="7"
        color="primary"
        indeterminate
      ></v-progress-circular>
    </v-row>
  </v-card>
</template>

<script>
export default {
  name: 'Spinner'
};
</script>

<style scoped>

</style>
