<template>
  <v-container class="blue-back" fluid>
      <v-row align="center" justify="center">
        <v-col xs="4" sm="4" md="4" lg="4" xl="4">
        <v-card class="error-card">
          <v-card-title class="gov-header">
            <h4 id="error_text">System Error</h4>
          </v-card-title>
          <v-card-text id="error_message">
            You have encountered a System Error. Close your Web browser, open a new session, then try again.
          </v-card-text>
        </v-card>
        </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
};
</script>

<style scoped>
  .v-icon{
    padding-left: 10px;
  }
  .error-card{
    margin-top: 5%;
    min-width: 30%;
  }
  .gov-header{
    color: #003366;
  }
  .v-btn{
    text-transform: none
  }
  .blue-back{
    background-color: aliceblue;
    height: 100%;
  }
  .detail-text{
    color: rgba(0, 0, 0, 0.54);
    font-size: 0.875rem;
  }
</style>
