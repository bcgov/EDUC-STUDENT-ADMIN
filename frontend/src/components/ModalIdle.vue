<template>
  <div style="display: none">
    <a
      id="logout_href"
      :href="routes.SESSION_EXPIRED"
    />
  </div>
</template>

<script>
import {Routes} from '@/utils/constants';
import ApiService from '@/common/apiService';
import { mapState } from 'pinia';
import {authStore} from '@/store/modules/auth';

export default {
  data() {
    return {
      routes: Routes
    };
  },
  async mounted() {
    await this.checkAndLogoutUserOnSessionExpiry();

  },
  computed: {
    ...mapState(authStore, ['isAuthenticated']),
  },
  methods: {

    async checkAndLogoutUserOnSessionExpiry() {
      if (this.isAuthenticated) {
        try {
          const response = await ApiService.apiAxios
            .get(Routes.SESSION_REMAINING_TIME);
          if (response.data > 0) {
            const timeOutValue = parseInt(response.data) + 200; // add 200 ms
            setTimeout(() => {
              this.checkAndLogoutUserOnSessionExpiry();
            }, timeOutValue);
          } else {
            window.location = document.getElementById('logout_href').href;
          }
        } catch (e) {
          window.location = document.getElementById('logout_href').href;
        }
      }

    }
  }

};
</script>
