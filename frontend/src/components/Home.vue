<template>
  <v-container fluid class="my-16" v-if="isAuthenticated && !isAuthorizedUser">

    <!-- login article -->
    <article id="login-banner" class="top-banner">
      <v-row align="center" justify="center" width="100%">
        <v-col cols="12" xs="12" sm="12" md="12" lg="12" xl="12"><v-main><UnAuthorized/></v-main></v-col>
      </v-row>
    </article>
  </v-container>
  <v-main v-else-if="!selectedStudent && !selectedRequest && isAuthenticated">
    <router-link :to="REQUEST_TYPES.penRequest.path">penRequest</router-link><br>
    <router-link :to="REQUEST_TYPES.studentRequest.path">studentRequest</router-link><br>
    <router-link :to="REQUEST_TYPES.studentSearch.path.basic">studentSearch</router-link>
  </v-main>
</template>

<script>
import { mapGetters } from 'vuex';
import UnAuthorized from './UnAuthorized';
import { REQUEST_TYPES } from '../utils/constants';
export default {
  name: 'home',
  components: {
    UnAuthorized  
  },
  data () {
    return {
      REQUEST_TYPES: REQUEST_TYPES
    };
  },
  computed: {
    ...mapGetters('auth', ['isAuthenticated','isAuthorizedUser']),
    ...mapGetters('app', ['selectedRequest', 'requestType']),
    ...mapGetters('student', ['selectedStudent']),
    requestTypes() {
      return REQUEST_TYPES;
    }
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.top-banner{
  min-height: 500px;
  background-size: cover;
  align-items: center;
  display: flex;
}
.full-height{
  height: 100%;
}
.infoTab{
  padding: 10px 0px;
}
.bottomContainer{
  padding-bottom: 30px
}
</style>
