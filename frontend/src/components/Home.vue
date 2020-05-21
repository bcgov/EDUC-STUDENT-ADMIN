<template>
  <v-container fluid class="full-height" v-if="!isAuthenticated">

    <!-- login article -->
    <article name="login-banner" class="top-banner">
      <v-row align="center" justify="center">
        <Login></Login>
      </v-row>
    </article>
  </v-container>
  <v-container fluid class="full-height" v-else-if="isAuthenticated && !isAuthorizedUser">

    <!-- login article -->
    <article name="login-banner" class="top-banner">
      <v-row align="center" justify="center" width="100%">
        <v-col cols="12" xs="12" sm="12" md="12" lg="12" xl="12"><v-content><UnAuthorized/></v-content></v-col>
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
import UnAuthorized from './UnAuthorized';
export default {
  name: 'home',
  components: {
    Login,
    PenRequestsDisplay,
    PenRequestDetail,
    UnAuthorized  
  },
  computed: {
    ...mapGetters('auth', ['isAuthenticated','isAuthorizedUser'])
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
