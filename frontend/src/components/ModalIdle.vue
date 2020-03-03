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
      routes: Routes,
      idleTime:process.env.VUE_APP_IDLE_TIMEOUT
    };
  },
  mounted() {
    this.logout();
    window.location = document.getElementById('logout_href').href;
  },
  methods: {
    logout() {
      this.$store.commit('auth/setJwtToken');
      this.$store.commit('auth/setRefreshToken');
      this.$store.commit('auth/setAdminUser',false);
    }
  }

};
</script>
<style scoped>

</style>
