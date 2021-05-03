<template>
  <div style="display: none">
    <a id="logout_href" :href='routes.SESSION_EXPIRED'/>
  </div>
</template>

<script>
import {Routes} from '@/utils/constants';
import ApiService from '@/common/apiService';
import {mapGetters} from 'vuex';

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
    ...mapGetters('auth', ['isAuthenticated']),
  },
  methods: {

    async checkAndLogoutUserOnSessionExpiry() {
      if (this.isAuthenticated) {
        try {
          const response = await ApiService.apiAxios
            .get(Routes.SESSION_REMAINING_TIME);
          if (response.data > 0) {
            setTimeout(() => {
              this.checkAndLogoutUserOnSessionExpiry();
            }, response.data);
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
