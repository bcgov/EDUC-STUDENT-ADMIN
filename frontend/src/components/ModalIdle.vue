<template>
  <div style="display: none">
    <a id="logout_href" :href='routes.SESSION_EXPIRED'/>
  </div>
</template>

<script>
import {Routes} from '../utils/constants';
export default {
  data() {
    return {
      routes: Routes
    };
  },
  mounted() {
    window.location = document.getElementById('logout_href').href;
  },
  methods: {
  }

};
</script>
