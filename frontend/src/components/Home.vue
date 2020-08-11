<template>
  <v-main>
    <router-link :to="REQUEST_TYPES.penRequest.path">penRequest</router-link><br>
    <router-link :to="REQUEST_TYPES.studentRequest.path">studentRequest</router-link><br>
    <router-link :to="REQUEST_TYPES.studentSearch.path.basic">studentSearch</router-link><br>
    <router-link :to="REQUEST_TYPES.penRequestBatch.path">penRequestBatch</router-link>
  </v-main>
</template>

<script>
import { mapGetters } from 'vuex';
import { REQUEST_TYPES } from '../utils/constants';
export default {
  name: 'home',
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
