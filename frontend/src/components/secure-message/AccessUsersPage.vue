<template>
  <v-container>
    <v-row>
      <v-col>
        Hello World Users Your mincode is {{mincode}}
      </v-col>
      <v-col>
        <v-btn @click="btnClick">click me</v-btn>
      </v-col>
    </v-row>
    <v-row v-for="user in users" :key="user.digitalID">
      <v-col>
        {{user.firstName}}
        {{user.lastName}}
        {{user.email}}
      </v-col>
    </v-row>
  </v-container>

</template>

<script>

import ApiService from '../../common/apiService';
import {Routes} from '@/utils/constants';

export default {
  name: 'AccessUsersPage',
  props: {
    mincode: {
      type: String,
      required: true
    },
  },
  data() {
    return {
      users: [],
    };
  },
  created() {
    console.log('ALIVE');
    this.getUsersData();
  },
  methods: {
    getUsersData() {
      const payload = {params: {mincode: this.mincode}};
      ApiService.apiAxios.get(Routes.edx.EXCHANGE_ACCESS_URL, payload)
        .then(response => {
          this.users = response.data;
          console.log(response.data);
        });
    },
    btnClick() {
      this.getUsersData();
    }
  }
};
</script>

<style scoped>
.card-hint {
  color: #000 !important;
  font-size: 1rem;
}
</style>
