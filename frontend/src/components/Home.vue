<template>
  <v-container fluid class="full-height" v-if="!isAuthenticated">

    <!-- login article -->
    <article name="login-banner" class="top-banner full-height">
      <v-row align="center" justify="center">
        <Login></Login>
      </v-row>
    </article>
  </v-container>
  <v-container fluid class="full-height" v-else>
    <article id="penRequests-container" class="top-banner full-height">
      <v-row align="center" justify="center">
        <PenRequestsDisplay></PenRequestsDisplay>
      </v-row>
    </article>
  </v-container>
</template>

<script>
import Login from './Login';
import PenRequestsDisplay from './PenRequestsDisplay';
import { mapGetters } from 'vuex';
export default {
  name: 'home',
  components: {
    Login,
    PenRequestsDisplay
  },
  computed: {
    ...mapGetters('auth', ['isAuthenticated'])
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.container{
  padding: 0px;
}
.top-banner{
  background-image: url("https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1350&q=80");
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
  background-color: #fafafa
}
.bottomContainer{
  padding-bottom: 30px
}
</style>
