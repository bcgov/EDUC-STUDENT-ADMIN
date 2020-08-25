<template>
  <v-toolbar elevation="0" color="#38598A" :dark="true">
    <v-app-bar-nav-icon></v-app-bar-nav-icon>Menu
    <v-toolbar-title class="ml-4">{{ title }}</v-toolbar-title>
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
