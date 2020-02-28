<template>
  <v-container  fluid>
      <v-row align="center" justify="center">
        <v-col xs="10" sm="10" md="10" lg="10" xl="10">
        <v-card class="error-card" elevation="5">
          <v-card-title class="gov-header">
            <h4 id="error_text" style="color:red;">Unauthorized Access</h4>
          </v-card-title>
          <v-card-text id="error_message">
            <span style="color: black; font-weight: bold">You do not have required roles to perform action on this site.</span>
          </v-card-text>
      </v-card>
        </v-col>
    </v-row>
  </v-container>
</template>


<style scoped>
  .error-card{
    margin-top: 5%;
  }
  .gov-header{
    color: #003366;
  }
</style>
