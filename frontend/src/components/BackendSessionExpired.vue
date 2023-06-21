<template>
  <div style="display: none">
    <a id="logout_href" :href='link'/>
  </div>
</template>

<script>

import {Routes} from '@/utils/constants';
import {authStore} from '@/store/modules/auth';
export default {
  name: 'BackendSessionExpired',
  data() {
    return {
      link: Routes.SESSION_EXPIRED
    };
  },
  mounted() {
    window.location = document.getElementById('logout_href').href;
  },
  methods: {
    logout() {
      const auStore = authStore();
      auStore.setJwtToken();
    }
  }
};
</script>
