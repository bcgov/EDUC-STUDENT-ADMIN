<template>
  <v-container fluid class="full-height" v-if="!isAuthenticated">

    <!-- login article -->
    <article name="login-banner" class="top-banner">
      <v-row align="center" justify="center">
        <Login></Login>
      </v-row>
    </article>
  </v-container>
  <v-content v-else-if="!this.$store.state['penRequest'].selectedRequest && isAuthenticated">
    <PenRequestsDisplay></PenRequestsDisplay>
  </v-content>
  <v-content v-else>
    <PenRequestDetail></PenRequestDetail>
  </v-content>
</template>

<script>
import Login from './Login';
import PenRequestsDisplay from './PenRequestsDisplay';
import { mapGetters } from 'vuex';
import PenRequestDetail from './PenRequestDetail';
export default {
  name: 'home',
  components: {
    Login,
    PenRequestsDisplay,
    PenRequestDetail
  },
  computed: {
    ...mapGetters('auth', ['isAuthenticated'])
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
