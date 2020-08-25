<template>
  <v-toolbar elevation="0" color="#38598A" :dark="true">
    <v-app-bar-nav-icon></v-app-bar-nav-icon>
    <v-toolbar-title>{{ title }}</v-toolbar-title>
  </v-toolbar>
</template>

<script>
export default {
  name: 'navBar',
  props: {
    title: {
      type: String,
      required: true
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
